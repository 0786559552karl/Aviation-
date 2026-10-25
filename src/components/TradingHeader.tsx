import React from 'react';
import { TradingStats, AIRegime } from '../types/aviator';
import { TrendingUp, TrendingDown, Radio, Activity, Cpu, Shield, Zap } from 'lucide-react';

interface TradingHeaderProps {
  stats: TradingStats;
  currentMultiplier: number;
  unrealizedPnL: number;
  isFlying: boolean;
  regime: AIRegime;
  uptimeFormatted: string;
  is247Active: boolean;
  onToggle247: () => void;
}

export const TradingHeader: React.FC<TradingHeaderProps> = ({
  stats,
  currentMultiplier,
  unrealizedPnL,
  isFlying,
  regime,
  uptimeFormatted,
  is247Active,
  onToggle247,
}) => {
  const isNetProfit = stats.totalPnL >= 0;

  const getRegimeColor = (reg: AIRegime) => {
    switch (reg) {
      case 'DEFENSIVE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MOMENTUM':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <header className="w-full bg-[#090d16] border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-slate-200 select-none">
      {/* Brand & Market Asset */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-rose-600 flex items-center justify-center font-black text-xs text-white tracking-tighter">
            AI
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-tight text-white">
                AVTR/USD
              </span>
              <span className="text-[10px] font-mono text-slate-400">PERPETUAL</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${getRegimeColor(
                  regime
                )}`}
              >
                AI {regime}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span>24/7 AI AUTONOMOUS BOT</span>
              <span aria-hidden="true">&bull;</span>
              <span>Uptime: {uptimeFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Ticker Metrics */}
      <div className="flex items-center gap-4 md:gap-6 text-xs font-mono">
        {/* Real-time Multiplier Price */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Index Multiplier</div>
          <div
            className={`text-base font-bold flex items-center gap-1 ${
              isFlying ? 'text-cyan-400 animate-pulse' : 'text-slate-300'
            }`}
          >
            {currentMultiplier.toFixed(2)}x
          </div>
        </div>

        {/* Live Floating / Unrealized PnL per second */}
        <div className="hidden sm:block">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Unrealized P&amp;L</div>
          <div
            className={`text-sm font-bold flex items-center gap-1 ${
              unrealizedPnL > 0
                ? 'text-emerald-400'
                : unrealizedPnL < 0
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {unrealizedPnL > 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
          </div>
        </div>

        {/* Total Realized PnL */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Net Realized P&amp;L</div>
          <div
            className={`text-sm font-bold flex items-center gap-1 ${
              isNetProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isNetProfit ? '+' : ''}${stats.totalPnL.toFixed(2)} ({stats.totalPnLPercent >= 0 ? '+' : ''}
            {stats.totalPnLPercent.toFixed(1)}%)
          </div>
        </div>

        {/* Account Balance */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Total Equity</div>
          <div className="text-sm font-bold text-white">
            ${stats.currentBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 24/7 AI Engine Master Switch */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle247}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
            is247Active
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              is247Active ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
            }`}
          />
          <span>{is247Active ? '24/7 AI ENGINE: ACTIVE' : '24/7 AI ENGINE: PAUSED'}</span>
        </button>
      </div>
    </header>
  );
};
