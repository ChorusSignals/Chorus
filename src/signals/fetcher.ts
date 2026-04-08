import type { WalletSignal, WalletCohort } from "../lib/types.js";
import { logger } from "../lib/logger.js";

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  tokenTransfers?: Array<{
    mint: string;
    tokenAmount: number;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
}

export async function fetchWalletSignals(
  walletAddress: string,
  walletLabel: string,
  cohort: WalletCohort,
  heliusApiKey: string,
  limit = 20
): Promise<WalletSignal[]> {
  try {
    const res = await fetch(`https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${heliusApiKey}&limit=${limit}&type=SWAP`);
    if (!res.ok) return [];

    const txns = await res.json() as HeliusTransaction[];
    const signals: WalletSignal[] = [];

    for (const tx of txns) {
      const transfers = tx.tokenTransfers ?? [];
      if (transfers.length < 2) continue;

      const outbound = transfers.find((transfer) => transfer.fromUserAccount === walletAddress);
      const inbound = transfers.find((transfer) => transfer.toUserAccount === walletAddress);
      if (!outbound || !inbound) continue;

      const isSOL = inbound.mint === "So11111111111111111111111111111111111111112";
      signals.push({
        walletAddress,
        walletLabel,
        cohort,
        token: isSOL ? "SOL" : inbound.mint.slice(0, 6) + "...",
        mint: inbound.mint,
        direction: isSOL ? "sell" : "buy",
        amountUsd: inbound.tokenAmount,
        txSignature: tx.signature,
        timestamp: tx.timestamp * 1000,
      });
    }

    return signals;
  } catch (err) {
    logger.debug(`Failed to fetch signals for ${walletLabel}:`, err);
    return [];
  }
}
