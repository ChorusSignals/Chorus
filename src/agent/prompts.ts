import type { ConsensusSignal } from "../lib/types.js";

export function buildSystemPrompt(): string {
  return `You are Chorus, a cohort-consensus analyst for Solana.

You do not treat all wallets equally. Market makers, funds, teams, and traders mean different things. A signal is stronger when multiple cohorts align on the same token and direction.

Explain:
- who is buying or selling
- whether the agreement is cross-cohort or just one pocket of the market
- what would break the consensus
- whether one cohort is merely warehousing inventory while the others stay absent`;
}

export function buildUserPrompt(signals: ConsensusSignal[]): string {
  if (signals.length === 0) {
    return "No cohort-consensus signals detected in the latest scan. Summarize whether the market looks fragmented or quiet.";
  }

  const overview = signals
    .map((signal) => `- [${signal.strength.toUpperCase()}] ${signal.token} ${signal.direction.toUpperCase()}: ${signal.walletsAgreeing}/${signal.totalWalletsTracked} wallets agree across ${signal.cohortCount} cohorts (score ${(signal.consensusScore * 100).toFixed(0)}%)`)
    .join("\n");

  return `Current scan found ${signals.length} consensus signal${signals.length > 1 ? "s" : ""}:

${overview}

For each signal, explain whether this is broad conviction or one cohort dragging the score.`;
}
