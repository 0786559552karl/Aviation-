import { StrategyConfig, StatsData } from '../types/aviator';

export class BettingStrategyEngine {
  public config: StrategyConfig;
  public currentBet: number;
  public consecutiveLosses: number = 0;
  public consecutiveWins: number = 0;

  constructor(config: StrategyConfig) {
    this.config = { ...config };
    this.currentBet = config.initialBet;
  }

  public updateConfig(config: StrategyConfig) {
    this.config = { ...config };
    if (this.currentBet < config.minBet) this.currentBet = config.minBet;
    if (this.currentBet > config.maxBet) this.currentBet = config.maxBet;
  }

  public reset() {
    this.currentBet = this.config.initialBet;
    this.consecutiveLosses = 0;
    this.consecutiveWins = 0;
  }

  /**
   * Calculates next bet size based on Martingale progression
   * Mirrors game/strategies.js calculateNextBet
   */
  public calculateNextBet(lastResult: { won: boolean } | null = null): number {
    if (!lastResult) {
      return this.config.initialBet;
    }

    if (lastResult.won) {
      this.consecutiveWins++;
      this.consecutiveLosses = 0;
      this.currentBet = this.config.initialBet; // Reset to initial bet after win
    } else {
      this.consecutiveLosses++;
      this.consecutiveWins = 0;
      // Martingale: multiply bet after loss, respecting maxBet
      this.currentBet = Math.min(
        this.currentBet * this.config.martingaleMultiplier,
        this.config.maxBet
      );
    }

    // Clamp to [minBet, maxBet]
    const bet = Math.max(this.config.minBet, Math.min(this.currentBet, this.config.maxBet));
    return Number(bet.toFixed(2));
  }

  /**
   * Stop trading checks:
   * 1. Stop loss reached
   * 2. Take profit reached
   * 3. 5 or more consecutive losses safety trigger
   */
  public shouldStopTrading(stats: StatsData): { shouldStop: boolean; reason?: string } {
    if (stats.netProfit <= -this.config.stopLoss) {
      return {
        shouldStop: true,
        reason: `Stop-Loss reached! Net Loss: -$${Math.abs(stats.netProfit).toFixed(2)} (Limit: -$${this.config.stopLoss.toFixed(2)})`,
      };
    }

    if (stats.netProfit >= this.config.takeProfit) {
      return {
        shouldStop: true,
        reason: `Take-Profit target achieved! Net Profit: +$${stats.netProfit.toFixed(2)} (Target: +$${this.config.takeProfit.toFixed(2)})`,
      };
    }

    if (this.consecutiveLosses >= 5) {
      return {
        shouldStop: true,
        reason: `Emergency Circuit Breaker: 5 consecutive losses reached. Protecting remaining bankroll.`,
      };
    }

    return { shouldStop: false };
  }

  /**
   * Checks if historical average multiplier triggers a bet opportunity
   * from game/gameMonitor.js: avgMultiplier <= averageMultiplierThreshold
   */
  public shouldPlaceBet(multiplierHistory: number[]): { shouldBet: boolean; reason: string; avg: number } {
    if (multiplierHistory.length < this.config.historySize - 1) {
      return {
        shouldBet: false,
        reason: `Waiting for initial history buffer (${multiplierHistory.length}/${this.config.historySize} rounds)`,
        avg: 0,
      };
    }

    const windowSlice = multiplierHistory.slice(0, this.config.historySize);
    const avg = windowSlice.reduce((sum, val) => sum + val, 0) / windowSlice.length;

    if (avg <= this.config.averageMultiplierThreshold) {
      return {
        shouldBet: true,
        reason: `Average multiplier ${avg.toFixed(2)}x <= threshold ${this.config.averageMultiplierThreshold.toFixed(2)}x (Recovery window detected)`,
        avg,
      };
    }

    return {
      shouldBet: false,
      reason: `Average multiplier ${avg.toFixed(2)}x > threshold ${this.config.averageMultiplierThreshold.toFixed(2)}x (Market too volatile/cooling down)`,
      avg,
    };
  }
}
