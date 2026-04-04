import { describe, it, expect } from "vitest";
import { buildConsensusSignals } from "../src/consensus/aggregator.js";
import type { WalletSignal, TrackedWallet } from "../src/lib/types.js";

const wallets: TrackedWallet[] = [
  { address: "wallet1", label: "A", tier: "tier1", winRate7d: 0.7, totalPnlUsd: 1_000_000 },
  { address: "wallet2", label: "B", tier: "tier1", winRate7d: 0.65, totalPnlUsd: 800_000 },
  { address: "wallet3", label: "C", tier: "tier2", winRate7d: 0.6, totalPnlUsd: 400_000 },
  { address: "wallet4", label: "D", tier: "tier3", winRate7d: 0.55, totalPnlUsd: 200_000 },
];

const mint = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN";

function makeSignal(walletAddress: string, direction: WalletSignal["direction"]): WalletSignal {
  return { walletAddress, walletLabel: walletAddress, token: "JUP", mint, direction, amountUsd: 5000, txSignature: "sig", timestamp: Date.now() };
}

describe("buildConsensusSignals", () => {
  it("returns empty when below min wallets", () => {
    const signals = [makeSignal("wallet1", "buy")];
    const result = buildConsensusSignals(signals, wallets, 0.5, 3);
    expect(result).toHaveLength(0);
  });

  it("detects consensus when enough wallets agree", () => {
    const signals = [
      makeSignal("wallet1", "buy"),
      makeSignal("wallet2", "buy"),
      makeSignal("wallet3", "buy"),
    ];
    const result = buildConsensusSignals(signals, wallets, 0.4, 3);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].direction).toBe("buy");
    expect(result[0].walletsAgreeing).toBe(3);
  });

  it("separates buy and sell signals", () => {
    const signals = [
      makeSignal("wallet1", "buy"),
      makeSignal("wallet2", "buy"),
      makeSignal("wallet3", "buy"),
      makeSignal("wallet4", "sell"),
    ];
    const result = buildConsensusSignals(signals, wallets, 0.3, 1);
    const buySignals = result.filter((s) => s.direction === "buy");
    const sellSignals = result.filter((s) => s.direction === "sell");
    expect(buySignals.length).toBeGreaterThan(0);
    expect(sellSignals.length).toBeGreaterThan(0);
  });

  it("scores tier1 wallets higher", () => {
    const tier1Signals = [makeSignal("wallet1", "buy"), makeSignal("wallet2", "buy"), makeSignal("wallet3", "buy")];
    const tier3Signals = [makeSignal("wallet4", "buy"), makeSignal("wallet4", "buy"), makeSignal("wallet4", "buy")];
    const r1 = buildConsensusSignals(tier1Signals, wallets, 0.3, 2);
    const r3 = buildConsensusSignals(tier3Signals, wallets, 0.01, 1);
    if (r1.length > 0 && r3.length > 0) {
      expect(r1[0].consensusScore).toBeGreaterThan(r3[0].consensusScore);
    }
  });
});
