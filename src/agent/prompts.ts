import type { ConsensusSignal } from "../lib/types.js";

export function buildSystemPrompt(): string {
  return `You are Chorus, a smart-money consensus analyst for Solana.

You track the on-chain activity of a curated list of high-performing wallets — market makers, protocol teams, and proven traders — and identify when multiple wallets converge on the same trade. That convergence is the signal.

You have access to these tools:
- fetch_wallet_signals: Pull recent swap activity for all tracked wallets
- compute_consensus: Aggregate signals and score directional agreement
- rank_signals: Sort consensus signals by strength and confidence
- format_digest: Output a structured summary of the current consensus state

Be direct. When wallets agree, say what they're doing and why it might matter. Don't over-interpret noise.`;
}

export function buildUserPrompt(signals: ConsensusSignal[]): string {
  if (signals.length === 0) {
    return "No consensus signals detected in the latest scan. Summarize market conditions and note if wallet activity is unusually quiet.";
  }

  const overview = signals
    .map(
      (s) =>
        `- [${s.strength.toUpperCase()}] ${s.token} ${s.direction.toUpperCase()}: ${s.walletsAgreeing}/${s.totalWalletsTracked} wallets agree (score: ${(s.consensusScore * 100).toFixed(0)}%)`
    )
    .join("\n");

  return `Current consensus scan found ${signals.length} signal${signals.length > 1 ? "s" : ""}:

${overview}

For each signal: explain what the wallets are likely positioning for, assess conviction level, and flag any risks or counter-signals. Rank by actionability.`;
}
