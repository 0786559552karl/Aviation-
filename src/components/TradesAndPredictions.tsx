import React, { useState } from 'react';
import { TradeRecord, PredictionRecord } from '../types/aviator';
import { Table, CheckCircle2, XCircle, Code2, Download, History, Award } from 'lucide-react';

interface TradesAndPredictionsProps {
  trades: TradeRecord[];
  predictions: PredictionRecord[];
  accuracyRate: number;
}

export const TradesAndPredictions: React.FC<TradesAndPredictionsProps> = ({
  trades,
  predictions,
  accuracyRate,
}) => {
  const [activeTab, setActiveTab] = useState<'trades' | 'predictions' | 'code'>('trades');
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>('strategies.js');

  const exportTradesAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(trades, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aviator_trades_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const codeSnippets: Record<string, { title: string; lang: string; code: string }> = {
    'strategies.js': {
      title: 'game/strategies.js (Martingale & Risk Rules)',
      lang: 'javascript',
      code: `class BettingStrategy {
    constructor(config) {
        this.initialBet = config.initialBet;
        this.currentBet = this.initialBet;
        this.maxBet = config.maxBet;
        this.minBet = config.minBet;
        this.targetMultiplier = config.targetMultiplier;
        this.stopLoss = config.stopLoss;
        this.takeProfit = config.takeProfit;
        this.martingaleMultiplier = config.martingaleMultiplier || 2;
        this.consecutiveLosses = 0;
        this.consecutiveWins = 0;
        this.averageMultiplierThreshold = config.averageMultiplierThreshold;
    }

    calculateNextBet(lastResult = null) {
        if (!lastResult) return this.initialBet; // First bet

        if (lastResult.won) {
            this.consecutiveWins++;
            this.consecutiveLosses = 0;
            this.currentBet = this.initialBet; // Reset after win
        } else {
            this.consecutiveLosses++;
            this.consecutiveWins = 0;
            // Martingale: double/multiply bet after loss
            this.currentBet = Math.min(this.currentBet * this.martingaleMultiplier, this.maxBet);
        }
        return Math.max(this.minBet, Math.min(this.currentBet, this.maxBet));
    }

    shouldStopTrading(stats) {
        return (
            stats.totalLoss <= -this.stopLoss ||
            stats.totalProfit >= this.takeProfit ||
            this.consecutiveLosses >= 5
        );
    }
}
module.exports = BettingStrategy;`,
    },
    'betManager.js': {
      title: 'game/betManager.js (Execution & Cashout)',
      lang: 'javascript',
      code: `class BetManager {
    constructor(config, strategy, statsTracker) {
        this.config = config;
        this.strategy = strategy;
        this.statsTracker = statsTracker;
        this.currentBet = null;
        this.isWaitingForResult = false;
    }

    async placeBet(page) {
        if (this.isWaitingForResult) return false;
        const betAmount = this.strategy.calculateNextBet();
        // Dispatches input and clicks Aviator bet button
        this.currentBet = {
            amount: betAmount,
            timestamp: Date.now(),
            targetMultiplier: this.strategy.targetMultiplier
        };
        this.isWaitingForResult = true;
        return true;
    }

    async checkCashout(frame) {
        if (!this.isWaitingForResult) return;
        if (multiplier >= this.strategy.targetMultiplier) {
            await this.executeCashout(frame);
        }
    }

    async executeCashout(frame) {
        const profit = this.currentBet.amount * (this.strategy.targetMultiplier - 1);
        this.statsTracker.addTrade({
            betAmount: this.currentBet.amount,
            multiplier: this.strategy.targetMultiplier,
            profit: profit,
            loss: 0,
            won: true
        });
        this.isWaitingForResult = false;
    }
}`,
    },
    'gameMonitor.js': {
      title: 'game/gameMonitor.js (Multiplier Average Condition)',
      lang: 'javascript',
      code: `async monitorGame() {
    const gameState = await this.getGameState(frame);

    // Calculate moving average of last 3 multipliers
    const avgMultiplier = currentHistory.reduce((acc, val) => acc + val, 0) / currentHistory.length;
    const averageThreshold = this.strategy.averageMultiplierThreshold;

    // Check entry trigger condition
    if (!this.gameState.betPlaced &&
        this.multiplierHistory.length >= (this.historySize - 1) &&
        avgMultiplier <= averageThreshold) {
        logger.info(\`Bet opportunity detected (Avg: \${avgMultiplier} <= \${averageThreshold})\`);
        await this.betManager.placeBet(this.page);
    }
}`,
    },
    'config.js': {
      title: 'util/config.js (Preset Configurations)',
      lang: 'javascript',
      code: `module.exports = {
    BETTING_STRATEGIES: {
        CONSERVATIVE: {
            initialBet: 1.00,
            maxBet: 50.00,
            minBet: 1.00,
            targetMultiplier: 1.20,
            stopLoss: 20.00,
            takeProfit: 40.00,
            martingaleMultiplier: 1.5,
            averageMultiplierThreshold: 1.50
        },
        MODERATE: {
            initialBet: 2.00,
            maxBet: 100.00,
            minBet: 1.00,
            targetMultiplier: 1.50,
            stopLoss: 50.00,
            takeProfit: 100.00,
            martingaleMultiplier: 2.0,
            averageMultiplierThreshold: 2.00
        },
        AGGRESSIVE: {
            initialBet: 5.00,
            maxBet: 200.00,
            minBet: 1.00,
            targetMultiplier: 2.00,
            stopLoss: 100.00,
            takeProfit: 300.00,
            martingaleMultiplier: 2.5,
            averageMultiplierThreshold: 3.00
        }
    }
};`,
    },
  };

  return (
    <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Tab Switcher & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'trades'
                ? 'bg-rose-500/20 text-rose-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Trade History ({trades.length})
          </button>

          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'predictions'
                ? 'bg-rose-500/20 text-rose-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Predictions ({predictions.length})
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-rose-500/20 text-rose-300 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Original Bot Code
          </button>
        </div>

        {activeTab === 'trades' && trades.length > 0 && (
          <button
            onClick={exportTradesAsJSON}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
        )}
      </div>

      {/* Tab 1: Trade History Table */}
      {activeTab === 'trades' && (
        <div className="overflow-x-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-800">
          {trades.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs italic font-mono">
              No trades executed yet. Start the bot or place a manual bet.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead className="sticky top-0 bg-[#161b26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Round</th>
                  <th className="py-2 px-3">Bet ($)</th>
                  <th className="py-2 px-3">Target</th>
                  <th className="py-2 px-3">Outcome</th>
                  <th className="py-2 px-3">Profit / Loss</th>
                  <th className="py-2 px-3">Bankroll</th>
                  <th className="py-2 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {trades.map((trade) => (
                  <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-semibold text-white">#{trade.roundNumber}</td>
                    <td className="py-2 px-3">${trade.betAmount.toFixed(2)}</td>
                    <td className="py-2 px-3 text-cyan-400">{trade.targetMultiplier.toFixed(2)}x</td>
                    <td className="py-2 px-3">
                      {trade.won ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3" /> Won @ {trade.targetMultiplier.toFixed(2)}x
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50">
                          <XCircle className="w-3 h-3" /> Crashed @ {trade.multiplier.toFixed(2)}x
                        </span>
                      )}
                    </td>
                    <td
                      className={`py-2 px-3 font-bold ${
                        trade.won ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {trade.won ? `+$${trade.profit.toFixed(2)}` : `-$${Math.abs(trade.loss).toFixed(2)}`}
                    </td>
                    <td className="py-2 px-3 text-slate-300 font-bold">
                      ${trade.bankrollAfter.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[10px]">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 2: Prediction Table (matches public/index.html & public/script.js) */}
      {activeTab === 'predictions' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-900/60 p-2 rounded border border-slate-800">
            <span>Overall Prediction Accuracy Rate:</span>
            <span className="text-emerald-400 font-bold text-sm">{accuracyRate.toFixed(1)}%</span>
          </div>

          <div className="overflow-x-auto max-h-[260px] scrollbar-thin scrollbar-thumb-slate-800">
            {predictions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs italic font-mono">
                No predictions recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead className="sticky top-0 bg-[#161b26] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Predicted Value</th>
                    <th className="py-2 px-3">Actual Value</th>
                    <th className="py-2 px-3">Correct</th>
                    <th className="py-2 px-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {predictions.map((pred, idx) => (
                    <tr key={pred.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 text-purple-300 font-bold">
                        {pred.predicted.toFixed(2)}x
                      </td>
                      <td className="py-2 px-3 text-cyan-300 font-bold">
                        {pred.actual.toFixed(2)}x
                      </td>
                      <td className="py-2 px-3">
                        {pred.correct ? (
                          <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Yes (Actual &ge; Pred)
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> No (Crashed Early)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[10px]">
                        {new Date(pred.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Original Bot Code Viewer */}
      {activeTab === 'code' && (
        <div className="flex flex-col gap-2">
          {/* File selector pill bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {Object.keys(codeSnippets).map((filename) => (
              <button
                key={filename}
                onClick={() => setSelectedCodeFile(filename)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                  selectedCodeFile === filename
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {filename}
              </button>
            ))}
          </div>

          <div className="bg-[#090b10] border border-slate-800 rounded-lg p-3 overflow-x-auto max-h-[260px] font-mono text-[11px] leading-relaxed text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
            <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-2 pb-1 border-b border-slate-800">
              {codeSnippets[selectedCodeFile]?.title}
            </div>
            <pre className="text-emerald-300/90 whitespace-pre">
              {codeSnippets[selectedCodeFile]?.code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
