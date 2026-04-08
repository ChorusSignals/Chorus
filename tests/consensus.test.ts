import { describe, expect, it } from "vitest";
import { buildConsensusSignals } from "../src/consensus/aggregator.js";
import type { WalletSignal, TrackedWallet } from "../src/lib/types.js";

const wallets: TrackedWallet[] = [
  { address: "wallet1", label: "Jump", tier: "tier1", cohort: "market_maker", winRate7d: 0.7, totalPnlUsd: 1_000_000 },
  { address: "wallet2", label: "Fund", tier: "tier1", cohort: "fund", winRate7d: 0.65, totalPnlUsd: 800_000 },
  { address: "wallet3", label: "Team", tier: "tier2", cohort: "team", winRate7d: 0.6, totalPnlUsd: 400_000 },
  { address: "wallet4", label: "Trader", tier: "tier3", cohort: "trader", winRate7d: 0.55, totalPnlUsd: 200_000 },
];

const mint = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN";

function makeSignal(walletAddress: string, direction: WalletSignal["direction"]): WalletSignal {
  const wallet = wallets.find((entry) => entry.address === walletAddress)!;
  return {
    walletAddress,
    walletLabel: wallet.label,
    cohort: wallet.cohort,
    token: "JUP",
    mint,
    direction,
    amountUsd: 5000,
    txSignature: "sig",
    timestamp: Date.now(),
  };
}

describe("buildConsensusSignals", () => {
  it("returns empty when below minimum wallets", () => {
    const signals = [makeSignal("wallet1", "buy")];
    const result = buildConsensusSignals(signals, wallets, 0.5, 3);
    expect(result).toHaveLength(0);
  });

  it("captures cohort count when enough wallets agree", () => {
    const signals = [
      makeSignal("wallet1", "buy"),
      makeSignal("wallet2", "buy"),
      makeSignal("wallet3", "buy"),
    ];
    const result = buildConsensusSignals(signals, wallets, 0.4, 3);
    expect(result[0]?.cohortCount).toBe(3);
  });

  it("gives stronger score to cross-cohort tiered alignment", () => {
    const broad = [
      makeSignal("wallet1", "buy"),
      makeSignal("wallet2", "buy"),
      makeSignal("wallet3", "buy"),
    ];
    const narrow = [
      makeSignal("wallet4", "buy"),
      { ...makeSignal("wallet4", "buy"), walletAddress: "wallet4b", walletLabel: "Trader B", cohort: "trader" as const },
    ];
    const broadResult = buildConsensusSignals(broad, wallets, 0.1, 2);
    const narrowResult = buildConsensusSignals(narrow, wallets, 0.01, 1);
    expect(broadResult[0]?.consensusScore).toBeGreaterThan(narrowResult[0]?.consensusScore ?? 0);
  });
});
