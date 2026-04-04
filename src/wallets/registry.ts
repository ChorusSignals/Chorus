import type { TrackedWallet } from "../lib/types.js";

export const TRACKED_WALLETS: TrackedWallet[] = [
  { address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", label: "Jump Trading", tier: "tier1", winRate7d: 0.74, totalPnlUsd: 4_200_000 },
  { address: "DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh", label: "Alameda Remnant", tier: "tier1", winRate7d: 0.68, totalPnlUsd: 2_800_000 },
  { address: "HN65oJGrTzNwfBsFEFq5P7FzBMeHLrKLZDMo2fMcjcRn", label: "Wintermute", tier: "tier1", winRate7d: 0.71, totalPnlUsd: 3_500_000 },
  { address: "GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE", label: "Multicoin LP", tier: "tier2", winRate7d: 0.62, totalPnlUsd: 950_000 },
  { address: "4Q3qRSEM7bVs4gFmHCFp6qCcuJy7W9XvNaKxPkPZXnVy", label: "Solana Foundation", tier: "tier2", winRate7d: 0.58, totalPnlUsd: 620_000 },
  { address: "CakcnaRDHka2gXyfxNwrPnE8MQ7fWgBWJCXCMjyRsWXA", label: "Mango Whale A", tier: "tier2", winRate7d: 0.65, totalPnlUsd: 1_100_000 },
  { address: "7kqDSEJrjKyRKNGAkS9DUr7UkBhGVBKHbh8bY5rB5PnZ", label: "Anonymous Defi Dev", tier: "tier3", winRate7d: 0.55, totalPnlUsd: 340_000 },
  { address: "B8NW8QLSuWdpBNHKVmRiLeEJRcbVELqMxMZ7oCW7dFHg", label: "LST Farmer", tier: "tier3", winRate7d: 0.52, totalPnlUsd: 180_000 },
];

export function getWalletByAddress(address: string): TrackedWallet | undefined {
  return TRACKED_WALLETS.find((w) => w.address === address);
}

export function getWalletsByTier(tier: TrackedWallet["tier"]): TrackedWallet[] {
  return TRACKED_WALLETS.filter((w) => w.tier === tier);
}
