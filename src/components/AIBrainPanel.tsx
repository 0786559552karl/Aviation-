import React from 'react';
import { AIAnalysisState, AIRegime } from '../types/aviator';
import { Cpu, ShieldAlert, Zap, TrendingUp, DollarSign, Target, Sliders, CheckCircle2 } from 'lucide-react';

interface AIBrainPanelProps {
  analysis: AIAnalysisState;
  is247Active: boolean;
  onToggle247: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
  bankroll: number;
}

export const AIBrainPanel: React.FC<AIBrainPanelProps> = ({
  analysis,
  is247Active,
  onToggle247,
  simulationSpeed,
  onChangeSpeed,
  bankroll,
}) => {
  const getRegimeBadge = (regime: AIRegime) => {
    switch (regime) {
      case 'DEFENSIVE':
        return {
          title: 'DEFENSIVE RECOVERY',
          targetLabel: '1.12x - 1.25x',
          color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
          desc: 'Triggered by consecutive losses. Low-risk quick exit to protect capital.',
        };
      case 'MOMENTUM':
        return {
          title: 'MOMENTUM EXPANSION',
          targetLabel: 'Up to 2.00x',
          color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
          desc: 'Triggered by win streaks. Expanding cashout up to 2.00x to compound profits.',
        };
      default:
        return {
          title: 'BALANCED EQUILIBRIUM',
          targetLabel: '1.50x - 1.70x',
          color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
          desc: 'Triggered on normal market distribution. Standard balanced risk-reward yield.',
        };
    }
  };

  const badge = getRegimeBadge(analysis.regime);

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col gap-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-rose-500" />
          <h2 className="text-xs font-bold text-white tracking-wider">
            24/7 AI AUTONOMOUS BRAIN
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900 px-1 py-0.5 rounded border border-slate-800 text-[10px]">
            <span>Speed:</span>
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  simulationSpeed === s
                    ? 'bg-rose-500/20 text-rose-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active AI Regime Card */}
      <div className={`p-3 rounded-lg border ${badge.color} flex flex-col gap-1.5`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            {badge.title}
          </span>
          <span className="font-bold px-2 py-0.5 rounded bg-black/40 text-[11px]">
            Target Rule: {badge.targetLabel}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-snug">{badge.desc}</p>
      </div>

      {/* Real-Time Round AI Calculations (The Math) */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Next Stake Size */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase">Calculated Stake</span>
          <div className="text-lg font-bold text-white mt-1">
            ${analysis.calculatedStake.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">
            {((analysis.calculatedStake / bankroll) * 100).toFixed(1)}% of bankroll
          </span>
        </div>

        {/* Dynamic Target Multiplier */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-2.5 rounded-lg flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase">Target Cashout</span>
          <div className="text-lg font-bold text-emerald-400 mt-1">
            {analysis.targetMultiplier.toFixed(2)}x
          </div>
          <span className="text-[10px] text-emerald-400/80">
            Win Net: +${analysis.expectedValue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Momentum Meters (Loss vs Win Streaks) */}
      <div className="bg-slate-900/40 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400">Streak Momentum</span>
          <span className="text-slate-200 font-bold">
            {analysis.lossStreak > 0
              ? `${analysis.lossStreak} Loss Streak`
              : analysis.winStreak > 0
              ? `${analysis.winStreak} Win Streak`
              : 'Neutral Balance'}
          </span>
        </div>

        <div className="flex flex-col text-right">
          <span className="text-[10px] text-slate-400">Recent 10-Game Win Rate</span>
          <span
            className={`font-bold ${
              analysis.recentWinRate >= 60
                ? 'text-cyan-400'
                : analysis.recentWinRate <= 35
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {analysis.recentWinRate.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* AI Live Decision Rationale */}
      <div className="bg-slate-950/80 border border-slate-800/90 p-2.5 rounded-lg text-[11px] leading-relaxed text-slate-300">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Real-Time Neural Allocation Logic</span>
        </div>
        <p className="text-slate-300 italic">{analysis.rationale}</p>
      </div>

      {/* Master 24/7 Auto Execution Toggle */}
      <button
        onClick={onToggle247}
        className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
          is247Active
            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/40'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40'
        }`}
      >
        {is247Active ? 'PAUSE 24/7 AI AUTONOMOUS PLAY' : 'RESUME 24/7 AI AUTONOMOUS PLAY'}
      </button>
    </div>
  );
};
