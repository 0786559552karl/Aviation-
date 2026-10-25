import { StrategyConfig, StrategyPreset } from '../types/aviator';

export const STRATEGY_PRESETS: Record<StrategyPreset, StrategyConfig> = {
  CONSERVATIVE: {
    name: 'Conservative',
    initialBet: 1.0,
    maxBet: 50.0,
    minBet: 1.0,
    targetMultiplier: 1.2,
    stopLoss: 20.0,
    takeProfit: 40.0,
    martingaleMultiplier: 1.5,
    averageMultiplierThreshold: 1.5,
    historySize: 3,
  },
  MODERATE: {
    name: 'Moderate',
    initialBet: 2.0,
    maxBet: 100.0,
    minBet: 1.0,
    targetMultiplier: 1.5,
    stopLoss: 50.0,
    takeProfit: 100.0,
    martingaleMultiplier: 2.0,
    averageMultiplierThreshold: 2.0,
    historySize: 3,
  },
  AGGRESSIVE: {
    name: 'Aggressive',
    initialBet: 5.0,
    maxBet: 200.0,
    minBet: 1.0,
    targetMultiplier: 2.0,
    stopLoss: 100.0,
    takeProfit: 300.0,
    martingaleMultiplier: 2.5,
    averageMultiplierThreshold: 3.0,
    historySize: 3,
  },
  CUSTOM: {
    name: 'Custom',
    initialBet: 2.0,
    maxBet: 100.0,
    minBet: 1.0,
    targetMultiplier: 1.6,
    stopLoss: 50.0,
    takeProfit: 150.0,
    martingaleMultiplier: 2.0,
    averageMultiplierThreshold: 2.2,
    historySize: 3,
  },
};

export const INITIAL_BANKROLL = 250.0;
export const BETTING_WINDOW_SECONDS = 4.0;
