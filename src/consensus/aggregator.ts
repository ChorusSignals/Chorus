import type { WalletSignal, ConsensusSignal, SignalStrength } from "../lib/types.js";
import type { TrackedWallet } from "../lib/types.js";

const TIER_WEIGHT: Record<TrackedWallet["tier"], number> = {
  tier1: 3,
  tier2: 2,
  tier3: 1,
};

function weightedScore(signals: WalletSignal[], wallets: TrackedWallet[], direction: "buy" | "sell"): number {
  let totalWeight = 0;
  let agreementWeight = 0;

  for (const wallet of wallets) {
    const w = direction === "buy" ? TIER_WEIGHT[wallet.tier] : TIER_WEIGHT[wallet.tier];
    totalWeight += w;
    const walletSignals = signals.filter(
      (s) => s.walletAddress === wallet.address && s.direction === direction
    );
    if (walletSignals.length > 0) agreementWeight += w;
  }

  return totalWeight > 0 ? agreementWeight / totalWeight : 0;
}

function strengthFromScore(score: number): SignalStrength {
  if (score >= 0.75) return "strong";
  if (score >= 0.5) return "moderate";
  return "weak";
}

export function buildConsensusSignals(
  allSignals: WalletSignal[],
  wallets: TrackedWallet[],
  minScore: number,
  minWallets: number
): ConsensusSignal[] {
  const byMint = new Map<string, WalletSignal[]>();
  for (const s of allSignals) {
    const arr = byMint.get(s.mint) ?? [];
    arr.push(s);
    byMint.set(s.mint, arr);
  }

  const results: ConsensusSignal[] = [];

  for (const [mint, mintSignals] of byMint.entries()) {
    for (const dir of ["buy", "sell"] as const) {
      const dirSignals = mintSignals.filter((s) => s.direction === dir);
      const uniqueWallets = new Set(dirSignals.map((s) => s.walletAddress)).size;

      if (uniqueWallets < minWallets) continue;

      const score = weightedScore(mintSignals, wallets, dir);
      if (score < minScore) continue;

      const sample = dirSignals[0];
      results.push({
        id: `consensus-${mint.slice(0, 8)}-${dir}-${Date.now()}`,
        token: sample.token,
        mint,
        direction: dir,
        strength: strengthFromScore(score),
        consensusScore: score,
        walletsAgreeing: uniqueWallets,
        totalWalletsTracked: wallets.length,
        signals: dirSignals,
        claudeSummary: "",
        generatedAt: Date.now(),
      });
    }
  }

  return results.sort((a, b) => b.consensusScore - a.consensusScore);
}
