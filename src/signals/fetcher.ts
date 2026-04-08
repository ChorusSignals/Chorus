import type { WalletSignal, WalletCohort } from "../lib/types.js";
import { logger } from "../lib/logger.js";

const JUPITER_PRICE_API = "https://api.jup.ag/price/v2";
const quoteCache = new Map<string, { priceUsd: number; symbol: string; expiresAt: number }>();

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

interface JupiterPriceResponse {
  data?: Record<string, { price?: number; mintSymbol?: string }>;
}

async function fetchQuotes(mints: string[]): Promise<Map<string, { priceUsd: number; symbol: string }>> {
  const quotes = new Map<string, { priceUsd: number; symbol: string }>();
  const now = Date.now();
  const missing = mints.filter((mint) => {
    const cached = quoteCache.get(mint);
    if (cached && cached.expiresAt > now) {
      quotes.set(mint, { priceUsd: cached.priceUsd, symbol: cached.symbol });
      return false;
    }
    return true;
  });

  if (missing.length === 0) return quotes;

  try {
    const res = await fetch(`${JUPITER_PRICE_API}?ids=${missing.join(",")}`);
    if (!res.ok) return quotes;

    const data = await res.json() as JupiterPriceResponse;
    for (const mint of missing) {
      const item = data.data?.[mint];
      if (!item?.price) continue;
      const quote = { priceUsd: item.price, symbol: item.mintSymbol ?? mint.slice(0, 6) };
      quoteCache.set(mint, { ...quote, expiresAt: now + 120_000 });
      quotes.set(mint, quote);
    }
  } catch (err) {
    logger.debug("Failed to refresh Jupiter quotes", err);
  }

  return quotes;
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
    const observedMints = new Set<string>();
    for (const tx of txns) {
      for (const transfer of tx.tokenTransfers ?? []) {
        if (transfer.toUserAccount === walletAddress) observedMints.add(transfer.mint);
      }
    }
    const quotes = await fetchQuotes([...observedMints]);
    const signals: WalletSignal[] = [];

    for (const tx of txns) {
      const transfers = tx.tokenTransfers ?? [];
      if (transfers.length < 2) continue;

      const outbound = transfers.find((transfer) => transfer.fromUserAccount === walletAddress);
      const inbound = transfers.find((transfer) => transfer.toUserAccount === walletAddress);
      if (!outbound || !inbound) continue;

      const isSOL = inbound.mint === "So11111111111111111111111111111111111111112";
      const quote = quotes.get(inbound.mint);
      const token = quote?.symbol ?? (isSOL ? "SOL" : inbound.mint.slice(0, 6) + "...");
      const amountUsd = quote ? inbound.tokenAmount * quote.priceUsd : inbound.tokenAmount;

      signals.push({
        walletAddress,
        walletLabel,
        cohort,
        token,
        mint: inbound.mint,
        direction: isSOL ? "sell" : "buy",
        amountUsd: Number(amountUsd.toFixed(2)),
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
