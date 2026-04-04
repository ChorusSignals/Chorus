import type { WalletSignal } from "../lib/types.js";
import { logger } from "../lib/logger.js";

interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  tokenTransfers?: Array<{
    mint: string;
    tokenAmount: number;
    fromUserAccount: string;
    toUserAccount: string;
  }>;
  nativeTransfers?: Array<{ fromUserAccount: string; toUserAccount: string; amount: number }>;
}

export async function fetchWalletSignals(
  walletAddress: string,
  walletLabel: string,
  heliusApiKey: string,
  limit = 20
): Promise<WalletSignal[]> {
  try {
    const res = await fetch(
      `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${heliusApiKey}&limit=${limit}&type=SWAP`
    );
    if (!res.ok) return [];

    const txns = (await res.json()) as HeliusTransaction[];
    const signals: WalletSignal[] = [];

    for (const tx of txns) {
      const transfers = tx.tokenTransfers ?? [];
      if (transfers.length < 2) continue;

      const outbound = transfers.find((t) => t.fromUserAccount === walletAddress);
      const inbound = transfers.find((t) => t.toUserAccount === walletAddress);

      if (!outbound || !inbound) continue;

      const isSOL = inbound.mint === "So11111111111111111111111111111111111111112";
      signals.push({
        walletAddress,
        walletLabel,
        token: isSOL ? "SOL" : inbound.mint.slice(0, 6) + "...",
        mint: inbound.mint,
        direction: isSOL ? "sell" : "buy",
        amountUsd: inbound.tokenAmount * 1,
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
