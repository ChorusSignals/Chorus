import { z } from "zod";

const ConfigSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1),
  HELIUS_API_KEY: z.string().min(1),
  SOLANA_RPC_URL: z.string().url(),
  POLL_INTERVAL_MS: z.coerce.number().default(60_000),
  MIN_CONSENSUS_SCORE: z.coerce.number().min(0).max(1).default(0.6),
  MIN_WALLETS_AGREEING: z.coerce.number().default(3),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid configuration:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}
