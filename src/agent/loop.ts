import Anthropic from "@anthropic-ai/sdk";
import type { ConsensusSignal } from "../lib/types.js";
import type { Config } from "../lib/config.js";
import { buildSystemPrompt, buildUserPrompt } from "./prompts.js";
import { fetchWalletSignals } from "../signals/fetcher.js";
import { buildConsensusSignals } from "../consensus/aggregator.js";
import { TRACKED_WALLETS } from "../wallets/registry.js";
import { printDigest } from "../output/printer.js";
import { logger } from "../lib/logger.js";

const TOOLS: Anthropic.Tool[] = [
  {
    name: "fetch_wallet_signals",
    description: "Fetch recent swap activity for all tracked wallets.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "compute_consensus",
    description: "Aggregate wallet signals and compute cohort-aware consensus scores per token.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "rank_signals",
    description: "Sort consensus signals by score and filter by minimum strength.",
    input_schema: {
      type: "object" as const,
      properties: {
        min_score: { type: "number" },
        min_wallets: { type: "number" },
      },
      required: [],
    },
  },
  {
    name: "format_digest",
    description: "Format all consensus signals into a structured digest.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
];

export async function runAgentLoop(config: Config): Promise<void> {
  const client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
  logger.info("Fetching cohort signals...");

  let rawSignals: ReturnType<typeof buildConsensusSignals> = [];
  let allSignals: ConsensusSignal[] = [];

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildUserPrompt(allSignals) },
  ];

  for (let iteration = 0; iteration < 8; iteration++) {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: buildSystemPrompt(),
      tools: TOOLS,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      if (text) console.log("\n" + text);
      if (allSignals.length > 0) printDigest(allSignals);
      break;
    }

    if (response.stop_reason !== "tool_use") break;
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      let result: string;

      if (block.name === "fetch_wallet_signals") {
        const fetches = await Promise.all(
          TRACKED_WALLETS.map((wallet) => fetchWalletSignals(wallet.address, wallet.label, wallet.cohort, config.HELIUS_API_KEY))
        );
        const flat = fetches.flat();
        rawSignals = flat as unknown as ReturnType<typeof buildConsensusSignals>;
        result = JSON.stringify({ fetched: flat.length, wallets: TRACKED_WALLETS.length });
      } else if (block.name === "compute_consensus") {
        const flat = rawSignals as unknown as Parameters<typeof buildConsensusSignals>[0];
        allSignals = buildConsensusSignals(flat, TRACKED_WALLETS, config.MIN_CONSENSUS_SCORE, config.MIN_WALLETS_AGREEING);
        result = JSON.stringify(allSignals);
      } else if (block.name === "rank_signals") {
        const input = block.input as { min_score?: number; min_wallets?: number };
        const filtered = allSignals
          .filter((signal) => signal.consensusScore >= (input.min_score ?? config.MIN_CONSENSUS_SCORE))
          .filter((signal) => signal.walletsAgreeing >= (input.min_wallets ?? config.MIN_WALLETS_AGREEING))
          .sort((left, right) => right.consensusScore - left.consensusScore);
        result = JSON.stringify(filtered);
      } else if (block.name === "format_digest") {
        result = JSON.stringify({
          signals: allSignals,
          summary: `${allSignals.length} signals across ${new Set(allSignals.map((signal) => signal.token)).size} tokens`,
        });
      } else {
        result = JSON.stringify({ error: `Unknown tool: ${block.name}` });
      }

      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
    }

    messages.push({ role: "user", content: toolResults });
  }
}
