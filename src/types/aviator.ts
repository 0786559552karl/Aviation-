export type GamePhase = 'BETTING' | 'FLYING' | 'CRASHED';

export type AIRegime = 'DEFENSIVE' | 'BALANCED' | 'MOMENTUM';

export interface StrategyConfig {
  name: string;
  initialBet: number;
  maxBet: number;
  minBet: number;
  targetMultiplier: number;
  stopLoss: number;
  takeProfit: number;
  martingaleMultiplier: number;
  averageMultiplierThreshold: number;
  historySize: number;
}

export type StrategyPreset = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'CUSTOM';

export interface TradeRecord {
  id: string;
  roundNumber: number;
  betAmount: number;
  multiplier: number;
  targetMultiplier: number;
  profit: number;
  loss: number;
  won: boolean;
  timestamp: number;
  bankrollAfter: number;
}

export interface StatsData {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  largestWin: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
}

export interface PredictionRecord {
  id: string;
  roundNumber: number;
  predicted: number;
  actual: number;
  correct: boolean;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug' | 'success';
  message: string;
  category?: 'bot' | 'bet' | 'game' | 'strategy' | 'system';
}

export interface AIAnalysisState {
  regime: AIRegime;
  targetMultiplier: number;
  calculatedStake: number;
  confidenceScore: number; // 0 - 100%
  riskIndex: number; // 1 - 10
  rationale: string;
  lossStreak: number;
  winStreak: number;
  recentWinRate: number;
  expectedValue: number;
}

export interface TradeOrder {
  id: string;
  orderNumber: number;
  timestamp: number;
  timeFormatted: string;
  side: 'BUY_LONG';
  stake: number;
  targetMultiplier: number;
  exitMultiplier: number;
  realizedPnL: number;
  realizedPnLPercent: number;
  status: 'PROFIT_EXIT' | 'LIQUIDATED' | 'PENDING';
  regime: AIRegime;
  bankrollAfter: number;
}

export interface TickDataPoint {
  timestamp: number;
  timeLabel: string;
  multiplier: number;
  unrealizedPnL: number;
  equity: number;
}

export interface TradingStats {
  startingBalance: number;
  currentBalance: number;
  peakBalance: number;
  totalPnL: number;
  totalPnLPercent: number;
  unrealizedPnL: number;
  totalRounds: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  uptimeSeconds: number;
}
