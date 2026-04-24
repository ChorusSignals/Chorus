import type { WalletSignal, ConsensusSignal, SignalStrength, TrackedWallet, WalletCohort } from "../lib/types.js";

const TIER_WEIGHT: Record<TrackedWallet["tier"], number> = {
  tier1: 3,
  tier2: 2,
  tier3: 1,
};

const COHORT_BONUS: Record<WalletCohort, number> = {
  market_maker: 1.2,
  fund: 1.1,
  team: 1.0,
  trader: 0.9,
};

function weightedScore(signals: WalletSignal[], wallets: TrackedWallet[], direction: "buy" | "sell"): number {
  let totalWeight = 0;
  let agreementWeight = 0;

  for (const wallet of wallets) {
    const weight = TIER_WEIGHT[wallet.tier] * COHORT_BONUS[wallet.cohort];
    totalWeight += weight;
    const walletSignals = signals.filter((signal) => signal.walletAddress === wallet.address && signal.direction === direction);
    if (walletSignals.length > 0) agreementWeight += weight;
  }

  return totalWeight > 0 ? agreementWeight / totalWeight : 0;
}

function strengthFromScore(score: number, cohortCount: number): SignalStrength {
  if (score >= 0.75 && cohortCount >= 2) return "strong";
  if (score >= 0.5) return "moderate";
  return "weak";
}

export function buildConsensusSignals(
  allSignals: WalletSignal[],
  wallets: TrackedWallet[],
  minScore: number,
  minWallets: number
): ConsensusSignal[] {
  const trackedWallets = new Set(wallets.map((wallet) => wallet.address));
  const byMint = new Map<string, WalletSignal[]>();
  for (const signal of allSignals) {
    if (!trackedWallets.has(signal.walletAddress)) continue;
    const grouped = byMint.get(signal.mint) ?? [];
    grouped.push(signal);
    byMint.set(signal.mint, grouped);
  }

  const results: ConsensusSignal[] = [];

  for (const [mint, mintSignals] of byMint.entries()) {
    for (const direction of ["buy", "sell"] as const) {
      const dirSignals = mintSignals.filter((signal) => signal.direction === direction);
      const uniqueWallets = new Set(dirSignals.map((signal) => signal.walletAddress)).size;
      const cohorts = new Set(dirSignals.map((signal) => signal.cohort));

      if (uniqueWallets < minWallets) continue;

      const score = weightedScore(mintSignals, wallets, direction);
      if (score < minScore) continue;

      const sample = dirSignals[0];
      results.push({
        id: `consensus-${mint.slice(0, 8)}-${direction}-${Date.now()}`,
        token: sample.token,
        mint,
        direction,
        strength: strengthFromScore(score, cohorts.size),
        consensusScore: score,
        walletsAgreeing: uniqueWallets,
        cohortCount: cohorts.size,
        totalWalletsTracked: wallets.length,
        signals: dirSignals,
        claudeSummary: "",
        generatedAt: Date.now(),
      });
    }
  }

  return results.sort((left, right) => right.consensusScore - left.consensusScore);
}
