import { loadConfig } from "./lib/config.js";
import { setLogLevel } from "./lib/logger.js";
import { runAgentLoop } from "./agent/loop.js";
import { logger } from "./lib/logger.js";

async function main(): Promise<void> {
  const config = loadConfig();
  setLogLevel(config.LOG_LEVEL);
  logger.info("Chorus starting - smart money consensus tracker");
  logger.info(
    `Poll interval: ${config.POLL_INTERVAL_MS / 1000}s | Min consensus: ${config.MIN_CONSENSUS_SCORE} | Min wallets: ${config.MIN_WALLETS_AGREEING}`,
  );

  async function poll(): Promise<void> {
    const startedAt = Date.now();

    try {
      await runAgentLoop(config);
    } catch (err) {
      logger.error("Poll error:", err);
    } finally {
      const durationMs = Date.now() - startedAt;
      logger.info("Consensus poll complete", { durationMs });
    }
  }

  const runLoop = async (): Promise<void> => {
    await poll();
    setTimeout(() => {
      void runLoop();
    }, config.POLL_INTERVAL_MS);
  };

  await runLoop();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
