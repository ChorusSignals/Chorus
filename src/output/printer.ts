import type { ConsensusSignal } from "../lib/types.js";

function dirIcon(d: ConsensusSignal["direction"]): string {
  return d === "buy" ? "▲" : d === "sell" ? "▼" : "─";
}
function strengthColor(s: ConsensusSignal["strength"]): string {
  return s === "strong" ? "STRONG" : s === "moderate" ? "MODERATE" : "WEAK";
}

export function printConsensusSignal(sig: ConsensusSignal): void {
  const bar = "━".repeat(60);
  console.log(`\n${bar}`);
  console.log(`  ${dirIcon(sig.direction)} ${sig.token.padEnd(12)} ${sig.direction.toUpperCase()} SIGNAL — ${strengthColor(sig.strength)}`);
  console.log(`  Consensus:  ${"█".repeat(Math.round(sig.consensusScore * 10))}${"░".repeat(10 - Math.round(sig.consensusScore * 10))}  ${(sig.consensusScore * 100).toFixed(0)}%`);
  console.log(`  Wallets:    ${sig.walletsAgreeing} / ${sig.totalWalletsTracked} agree`);
  if (sig.claudeSummary) console.log(`  Analysis:   ${sig.claudeSummary}`);
  for (const s of sig.signals.slice(0, 3)) {
    console.log(`    • ${s.walletLabel.padEnd(22)} ${s.direction.padEnd(5)} $${s.amountUsd.toLocaleString()}`);
  }
  console.log(bar);
}

export function printDigest(signals: ConsensusSignal[]): void {
  const ts = new Date().toUTCString();
  console.log(`\n  CHORUS DIGEST — ${ts}`);
  console.log(`  ${signals.length} consensus signal${signals.length !== 1 ? "s" : ""} detected\n`);
  for (const s of signals) printConsensusSignal(s);
}
