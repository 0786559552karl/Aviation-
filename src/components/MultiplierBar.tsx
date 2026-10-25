import React from 'react';
import { History, TrendingUp } from 'lucide-react';

interface MultiplierBarProps {
  history: number[];
  averageMultiplier: number;
  averageThreshold: number;
}

export const MultiplierBar: React.FC<MultiplierBarProps> = ({
  history,
  averageMultiplier,
  averageThreshold,
}) => {
  const getPillColor = (mult: number) => {
    if (mult >= 10.0) {
      return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 hover:border-amber-400';
    }
    if (mult >= 2.0) {
      return 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:border-purple-400';
    }
    return 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:border-blue-400';
  };

  return (
    <div className="w-full bg-[#121622]/90 backdrop-blur border border-slate-800/80 rounded-xl p-2.5 px-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 shrink-0">
        <History className="w-4 h-4 text-rose-400" />
        <span className="tracking-wide">RECENT MULTIPLIERS:</span>
      </div>

      {/* Scrolling/wrapping multiplier pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
        {history.length === 0 ? (
          <span className="text-xs text-slate-500 italic">No rounds completed yet...</span>
        ) : (
          history.slice(0, 16).map((mult, idx) => (
            <span
              key={`${mult}-${idx}`}
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-all duration-200 cursor-default shrink-0 ${getPillColor(
                mult
              )} ${idx === 0 ? 'ring-2 ring-rose-500/50 scale-105' : 'opacity-90'}`}
              title={`Round -${idx + 1}: ${mult.toFixed(2)}x`}
            >
              {mult.toFixed(2)}x
            </span>
          ))
        )}
      </div>

      {/* Indicator stats */}
      <div className="hidden lg:flex items-center gap-3 shrink-0 text-xs font-mono border-l border-slate-700/60 pl-3">
        <div className="flex items-center gap-1.5 text-slate-400">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Last 3 Avg:</span>
          <span
            className={`font-bold ${
              averageMultiplier <= averageThreshold ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {averageMultiplier.toFixed(2)}x
          </span>
        </div>
        <div className="text-slate-400">
          Threshold: <span className="text-slate-300 font-bold">{averageThreshold.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};
