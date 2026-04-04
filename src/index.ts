import { loadConfig } from "./lib/config.js";
import { setLogLevel } from "./lib/logger.js";
import { runAgentLoop } from "./agent/loop.js";
import { logger } from "./lib/logger.js";

async function main(): Promise<void> {
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);
  logger.info("Chorus starting — smart money consensus tracker");
  logger.info(`Poll interval: ${config.POLL_INTERVAL_MS / 1000}s | Min consensus: ${config.MIN_CONSENSUS_SCORE} | Min wallets: ${config.MIN_WALLETS_AGREEING}`);

  async function poll(): Promise<void> {
    try { await runAgentLoop(config); } catch (err) { logger.error("Poll error:", err); }
  }

  await poll();
  setInterval(poll, config.POLL_INTERVAL_MS);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
