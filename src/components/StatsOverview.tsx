import React from 'react';
import { StatsData } from '../types/aviator';
import { DollarSign, Percent, TrendingUp, TrendingDown, ShieldAlert, Zap, Flame } from 'lucide-react';

interface StatsOverviewProps {
  stats: StatsData;
  bankroll: number;
  initialBankroll: number;
  currentBet: number;
  consecutiveLosses: number;
  botStatus: 'RUNNING' | 'PAUSED' | 'STOPPED';
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  bankroll,
  initialBankroll,
  currentBet,
  consecutiveLosses,
  botStatus,
}) => {
  const netBankrollChange = bankroll - initialBankroll;
  const isProfit = stats.netProfit >= 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      {/* Current Bankroll */}
      <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>BANKROLL</span>
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-bold font-mono text-white">
            ${bankroll.toFixed(2)}
          </div>
          <div
            className={`text-[11px] font-mono flex items-center gap-1 ${
              netBankrollChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netBankrollChange >= 0 ? '+' : ''}${netBankrollChange.toFixed(2)} ({((netBankrollChange / initialBankroll) * 100).toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Net Profit / Loss */}
      <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>NET PROFIT</span>
          {isProfit ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          )}
        </div>
        <div className="mt-1">
          <div
            className={`text-xl font-bold font-mono ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isProfit ? '+' : ''}${stats.netProfit.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            W: +${stats.totalProfit.toFixed(1)} | L: ${stats.totalLoss.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Win Rate */}
      <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>WIN RATE</span>
          <Percent className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-bold font-mono text-purple-300">
            {stats.winRate}%
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {stats.winningTrades} wins / {stats.totalTrades} trades
          </div>
        </div>
      </div>

      {/* Next Active Bet */}
      <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>NEXT BET SIZE</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-bold font-mono text-amber-300">
            ${currentBet.toFixed(2)}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Martingale scaled
          </div>
        </div>
      </div>

      {/* Consecutive Losses Circuit */}
      <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>SAFETY BREAKER</span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-bold font-mono text-white flex items-center gap-1.5">
            <span className={consecutiveLosses >= 3 ? 'text-rose-400' : 'text-slate-200'}>
              {consecutiveLosses}
            </span>
            <span className="text-slate-500 text-sm">/ 5 max</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {consecutiveLosses >= 5 ? '🛑 Auto-tripped' : 'Normal risk'}
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>BEST STREAK</span>
          <Flame className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-bold font-mono text-orange-400">
            {stats.longestWinStreak} Wins
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Max loss streak: {stats.longestLossStreak}
          </div>
        </div>
      </div>
    </div>
  );
};
