export type SignalDirection = "buy" | "sell" | "hold";
export type SignalStrength = "strong" | "moderate" | "weak";
export type WalletCohort = "market_maker" | "fund" | "team" | "trader";

export interface TrackedWallet {
  address: string;
  label: string;
  tier: "tier1" | "tier2" | "tier3";
  cohort: WalletCohort;
  winRate7d: number;
  totalPnlUsd: number;
}

export interface WalletSignal {
  walletAddress: string;
  walletLabel: string;
  cohort: WalletCohort;
  token: string;
  mint: string;
  direction: SignalDirection;
  amountUsd: number;
  txSignature: string;
  timestamp: number;
}

export interface ConsensusSignal {
  id: string;
  token: string;
  mint: string;
  direction: SignalDirection;
  strength: SignalStrength;
  consensusScore: number;
  walletsAgreeing: number;
  cohortCount: number;
  totalWalletsTracked: number;
  signals: WalletSignal[];
  claudeSummary: string;
  generatedAt: number;
}
