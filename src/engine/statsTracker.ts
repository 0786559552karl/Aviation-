import { StatsData, TradeRecord } from '../types/aviator';

export class StatsTrackerEngine {
  public trades: TradeRecord[] = [];
  public totalTrades: number = 0;
  public winningTrades: number = 0;
  public losingTrades: number = 0;
  public totalProfit: number = 0;
  public totalLoss: number = 0;
  public largestWin: number = 0;
  public largestLoss: number = 0;
  public currentStreak: number = 0;
  public longestWinStreak: number = 0;
  public longestLossStreak: number = 0;

  constructor() {
    this.reset();
  }

  public reset() {
    this.trades = [];
    this.totalTrades = 0;
    this.winningTrades = 0;
    this.losingTrades = 0;
    this.totalProfit = 0;
    this.totalLoss = 0;
    this.largestWin = 0;
    this.largestLoss = 0;
    this.currentStreak = 0;
    this.longestWinStreak = 0;
    this.longestLossStreak = 0;
  }

  public addTrade(trade: TradeRecord) {
    this.trades.unshift(trade);
    this.totalTrades++;

    if (trade.won && trade.profit > 0) {
      this.winningTrades++;
      this.totalProfit += trade.profit;
      this.largestWin = Math.max(this.largestWin, trade.profit);
      this.currentStreak = this.currentStreak > 0 ? this.currentStreak + 1 : 1;
      this.longestWinStreak = Math.max(this.longestWinStreak, this.currentStreak);
    } else {
      this.losingTrades++;
      this.totalLoss += trade.loss; // loss is negative, e.g. -betAmount
      this.largestLoss = Math.min(this.largestLoss, trade.loss);
      this.currentStreak = this.currentStreak < 0 ? this.currentStreak - 1 : -1;
      this.longestLossStreak = Math.max(this.longestLossStreak, Math.abs(this.currentStreak));
    }
  }

  public getStats(): StatsData {
    const netProfit = this.totalProfit + this.totalLoss;
    const winRate = this.totalTrades > 0 ? (this.winningTrades / this.totalTrades) * 100 : 0;
    const averageWin = this.winningTrades > 0 ? this.totalProfit / this.winningTrades : 0;
    const averageLoss = this.losingTrades > 0 ? this.totalLoss / this.losingTrades : 0;

    return {
      totalTrades: this.totalTrades,
      winningTrades: this.winningTrades,
      losingTrades: this.losingTrades,
      winRate: Number(winRate.toFixed(1)),
      totalProfit: Number(this.totalProfit.toFixed(2)),
      totalLoss: Number(this.totalLoss.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      largestWin: Number(this.largestWin.toFixed(2)),
      largestLoss: Number(this.largestLoss.toFixed(2)),
      averageWin: Number(averageWin.toFixed(2)),
      averageLoss: Number(averageLoss.toFixed(2)),
      longestWinStreak: this.longestWinStreak,
      longestLossStreak: this.longestLossStreak,
      currentStreak: this.currentStreak,
    };
  }
}
