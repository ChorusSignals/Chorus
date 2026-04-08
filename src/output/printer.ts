import type { ConsensusSignal } from "../lib/types.js";

function dirIcon(direction: ConsensusSignal["direction"]): string {
  return direction === "buy" ? "▲" : direction === "sell" ? "▼" : "─";
}

function strengthLabel(strength: ConsensusSignal["strength"]): string {
  return strength === "strong" ? "STRONG" : strength === "moderate" ? "MODERATE" : "WEAK";
}

export function printConsensusSignal(signal: ConsensusSignal): void {
  const bar = "━".repeat(64);
  console.log(`\n${bar}`);
  console.log(`  ${dirIcon(signal.direction)} ${signal.token.padEnd(12)} ${signal.direction.toUpperCase()} -- ${strengthLabel(signal.strength)}`);
  console.log(`  Consensus:  ${"█".repeat(Math.round(signal.consensusScore * 10))}${"░".repeat(10 - Math.round(signal.consensusScore * 10))}  ${(signal.consensusScore * 100).toFixed(0)}%`);
  console.log(`  Wallets:    ${signal.walletsAgreeing} / ${signal.totalWalletsTracked} agree`);
  console.log(`  Cohorts:    ${signal.cohortCount} represented`);
  if (signal.claudeSummary) console.log(`  Analysis:   ${signal.claudeSummary}`);
  for (const entry of signal.signals.slice(0, 3)) {
    console.log(`    • ${entry.walletLabel.padEnd(22)} ${entry.cohort.padEnd(12)} ${entry.direction.padEnd(5)} $${entry.amountUsd.toLocaleString()}`);
  }
  console.log(bar);
}

export function printDigest(signals: ConsensusSignal[]): void {
  const timestamp = new Date().toUTCString();
  console.log(`\n  CHORUS DIGEST -- ${timestamp}`);
  console.log(`  ${signals.length} cohort-consensus signal${signals.length !== 1 ? "s" : ""} detected across the current scan\n`);
  for (const signal of signals) printConsensusSignal(signal);
}
