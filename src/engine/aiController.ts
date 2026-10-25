import { AIAnalysisState, TradeOrder, AIRegime } from '../types/aviator';

export class AIAutonomousEngine {
  private baseStakeFraction: number = 0.02; // 2% of bankroll
  private minStake: number = 1.0;
  private maxStakeCapFraction: number = 0.15; // never risk > 15% on a single round

  /**
   * Analyzes recent trading data and current bankroll to compute
   * the exact round parameters required by the user:
   * - 1.12x when much losses (defensive recovery)
   * - 1.50x to 1.70x when medium losses & wins (balanced equilibrium)
   * - up to 2.00x when more wins (momentum expansion)
   */
  public analyzeAndPlanRound(
    bankroll: number,
    recentTrades: TradeOrder[],
    consecutiveLosses: number,
    consecutiveWins: number,
    multiplierHistory: number[]
  ): AIAnalysisState {
    const recentSample = recentTrades.slice(0, 10);
    const recentWins = recentSample.filter((t) => t.status === 'PROFIT_EXIT').length;
    const recentWinRate = recentSample.length > 0 ? (recentWins / recentSample.length) * 100 : 50;

    let regime: AIRegime = 'BALANCED';
    let targetMultiplier = 1.6;
    let rationale = '';
    let confidenceScore = 78;
    let riskIndex = 5;

    // RULE 1: MUCH LOSSES -> DEFENSIVE RECOVERY (1.12x - 1.25x)
    if (consecutiveLosses >= 2 || recentWinRate < 35) {
      regime = 'DEFENSIVE';
      if (consecutiveLosses >= 3) {
        targetMultiplier = 1.12; // lowest ultra-safe target requested
        confidenceScore = 93;
        riskIndex = 2;
        rationale = `CRITICAL DRAWDOWN (${consecutiveLosses} losses streak): Locking in immediate capital defense at 1.12x cashout.`;
      } else {
        // 2 losses
        targetMultiplier = 1.18;
        confidenceScore = 88;
        riskIndex = 3;
        rationale = `DEFENSIVE RECOVERY (${consecutiveLosses} consecutive losses): Targeting conservative 1.18x exit to stop slide.`;
      }
    }
    // RULE 3: MORE WINS -> MOMENTUM EXPANSION (UP TO 2.00x)
    else if (consecutiveWins >= 2 || recentWinRate >= 65) {
      regime = 'MOMENTUM';
      if (consecutiveWins >= 4) {
        targetMultiplier = 2.0; // max target requested
        confidenceScore = 75;
        riskIndex = 7;
        rationale = `HIGH MOMENTUM SURGE (${consecutiveWins} win streak): Expanding target to maximum 2.00x for profit compounding.`;
      } else {
        targetMultiplier = 1.9;
        confidenceScore = 80;
        riskIndex = 6;
        rationale = `BULLISH EXPANSION (${consecutiveWins} wins, ${recentWinRate.toFixed(0)}% win rate): Targeting 1.90x high yield.`;
      }
    }
    // RULE 2: MEDIUM LOSSES & WINS -> BALANCED EQUILIBRIUM (1.50x to 1.70x)
    else {
      regime = 'BALANCED';
      // Dynamically float between 1.50x and 1.70x based on recent 3-game average
      const last3 = multiplierHistory.slice(0, 3);
      const avg = last3.length > 0 ? last3.reduce((a, b) => a + b, 0) / last3.length : 1.7;

      if (avg < 1.6) {
        targetMultiplier = 1.5;
        rationale = `BALANCED LOW-RISK: Recent avg ${avg.toFixed(2)}x cooling off; targeting 1.50x equilibrium exit.`;
      } else if (avg > 3.0) {
        targetMultiplier = 1.7;
        rationale = `BALANCED HIGH-YIELD: Recent cluster high; targeting 1.70x equilibrium peak.`;
      } else {
        targetMultiplier = 1.6;
        rationale = `BALANCED BASELINE: Mixed distribution; targeting standard 1.60x yield.`;
      }
      confidenceScore = 82;
      riskIndex = 5;
    }

    // CALCULATE STAKE AMOUNT PER ROUND
    // Baseline: 2% of bankroll, adjusted for regime
    let baseStake = Math.max(this.minStake, bankroll * this.baseStakeFraction);

    if (regime === 'DEFENSIVE') {
      // In defensive mode, we need slightly higher stake to recover losses at smaller 1.12x - 1.18x multiplier,
      // but cap strictly to avoid risk of ruin
      const recoveryMultiplier = 1.0 + Math.min(consecutiveLosses * 0.4, 2.0);
      baseStake = Math.max(this.minStake, baseStake * recoveryMultiplier);
    } else if (regime === 'MOMENTUM') {
      // Reinvest a fraction of recent winnings
      baseStake = baseStake * 1.35;
    }

    // Cap at max allowable risk
    const maxAllowed = bankroll * this.maxStakeCapFraction;
    const finalStake = Math.min(Math.max(this.minStake, baseStake), Math.max(this.minStake, maxAllowed));

    const expectedValue = Number((finalStake * (targetMultiplier - 1)).toFixed(2));

    return {
      regime,
      targetMultiplier: Number(targetMultiplier.toFixed(2)),
      calculatedStake: Number(finalStake.toFixed(2)),
      confidenceScore,
      riskIndex,
      rationale,
      lossStreak: consecutiveLosses,
      winStreak: consecutiveWins,
      recentWinRate: Number(recentWinRate.toFixed(1)),
      expectedValue,
    };
  }
}
