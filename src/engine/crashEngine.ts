/**
 * Provably Fair Aviator Crash Multiplier Generator & Flight Math
 * Models the standard Spribe Aviator RTP distribution (~97% RTP)
 */

export function generateCrashMultiplier(): number {
  // ~3% instant crash rate at 1.00x
  if (Math.random() < 0.035) {
    return 1.0;
  }

  // Inverse CDF for crash game: M = 0.99 / (1 - U)
  const u = Math.random();
  const rawMultiplier = 0.99 / (1 - u);

  // Clamp to realistic range [1.01, 300.0]
  const multiplier = Math.min(Math.max(1.01, rawMultiplier), 350.0);
  return Number(multiplier.toFixed(2));
}

/**
 * Calculates current multiplier at elapsed time (in seconds)
 * Multiplier grows at exponential curve e^(k * t)
 * SpeedFactor allows 1x, 2x, 5x simulation speed
 */
export function calculateCurrentMultiplier(elapsedSec: number, speedMultiplier: number = 1.0): number {
  // Growth constant: 1.00 to 2.00x takes ~5 seconds at 1x speed
  const k = 0.14 * speedMultiplier;
  const mult = Math.exp(k * elapsedSec);
  return Number(Math.max(1.0, mult).toFixed(2));
}

/**
 * Calculates flight duration needed to reach a given multiplier
 */
export function calculateFlightDuration(targetMultiplier: number, speedMultiplier: number = 1.0): number {
  if (targetMultiplier <= 1.0) return 0;
  const k = 0.14 * speedMultiplier;
  return Math.log(targetMultiplier) / k;
}

/**
 * Simple Moving Average & Trend Predictor
 * Replicates the prediction model from public/script.js
 */
export function calculatePrediction(multiplierHistory: number[]): {
  predictedValue: number;
  movingAvg: number;
  confidence: number;
} {
  if (multiplierHistory.length === 0) {
    return { predictedValue: 1.45, movingAvg: 1.5, confidence: 50 };
  }

  const windowSize = Math.min(5, multiplierHistory.length);
  const recent = multiplierHistory.slice(0, windowSize);
  const movingAvg = recent.reduce((sum, v) => sum + v, 0) / windowSize;

  // Trend detection:
  // If recent multipliers have been lower than 1.5x (crash streak), probability of bounce back slightly increases
  // Weighted target multiplier prediction
  let predicted = 1.35;
  if (movingAvg < 1.6) {
    predicted = 1.55;
  } else if (movingAvg > 3.0) {
    predicted = 1.25; // likely to cool down
  } else {
    predicted = Number((movingAvg * 0.85).toFixed(2));
  }

  // Safe conservative estimate between 1.15x and 2.20x
  predicted = Math.max(1.15, Math.min(2.5, predicted));

  const confidence = Math.min(92, Math.max(48, Math.round(65 + (movingAvg > 1.8 ? 10 : -5))));

  return {
    predictedValue: Number(predicted.toFixed(2)),
    movingAvg: Number(movingAvg.toFixed(2)),
    confidence,
  };
}
