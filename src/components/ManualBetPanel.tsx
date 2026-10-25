import React, { useState } from 'react';
import { GamePhase } from '../types/aviator';
import { Hand, Coins, CheckCircle, ArrowRight } from 'lucide-react';

interface ManualBetPanelProps {
  phase: GamePhase;
  bankroll: number;
  currentMultiplier: number;
  onPlaceManualBet: (amount: number, targetMult: number) => void;
  onManualCashout: () => void;
  hasManualBet: boolean;
  manualBetAmount: number | null;
  manualHasCashedOut: boolean;
}

export const ManualBetPanel: React.FC<ManualBetPanelProps> = ({
  phase,
  bankroll,
  currentMultiplier,
  onPlaceManualBet,
  onManualCashout,
  hasManualBet,
  manualBetAmount,
  manualHasCashedOut,
}) => {
  const [betAmount, setBetAmount] = useState<number>(2.0);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(1.5);

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (betAmount <= 0 || betAmount > bankroll) return;
    onPlaceManualBet(betAmount, targetMultiplier);
  };

  const quickAmounts = [1, 2, 5, 10, 20];

  return (
    <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-3.5 shadow-xl flex flex-col gap-2.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
          <Hand className="w-3.5 h-3.5 text-rose-400" />
          <span>MANUAL BET OVERRIDE</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Avail: <strong className="text-emerald-400">${bankroll.toFixed(2)}</strong>
        </span>
      </div>

      <form onSubmit={handlePlaceBet} className="flex flex-col sm:flex-row items-center gap-3">
        {/* Bet Amount Input */}
        <div className="flex-1 w-full sm:w-auto">
          <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Bet Amount ($)
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max={bankroll}
              value={betAmount}
              disabled={hasManualBet && phase !== 'BETTING'}
              onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-[#161b26] border border-slate-700 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-rose-500 focus:outline-none"
            />
            {/* Quick amount chips */}
            <div className="hidden md:flex items-center gap-1">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setBetAmount(q)}
                  disabled={hasManualBet && phase !== 'BETTING'}
                  className="px-1.5 py-1 text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
                >
                  ${q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target Multiplier */}
        <div className="w-full sm:w-32">
          <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
            Auto-Cashout (x)
          </label>
          <input
            type="number"
            step="0.1"
            min="1.05"
            value={targetMultiplier}
            disabled={hasManualBet && phase !== 'BETTING'}
            onChange={(e) => setTargetMultiplier(parseFloat(e.target.value) || 1.1)}
            className="w-full bg-[#161b26] border border-slate-700 rounded px-2 py-1.5 text-xs font-mono text-emerald-400 font-bold focus:border-rose-500 focus:outline-none"
          />
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto sm:self-end pt-1">
          {phase === 'FLYING' && hasManualBet && !manualHasCashedOut ? (
            <button
              type="button"
              onClick={onManualCashout}
              className="w-full sm:w-44 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-orange-950/40 animate-pulse transition-all cursor-pointer"
            >
              CASH OUT ${(manualBetAmount! * currentMultiplier).toFixed(2)}
            </button>
          ) : hasManualBet && phase === 'BETTING' ? (
            <div className="w-full sm:w-44 py-2 bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 font-bold text-xs text-center rounded-lg flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>BET QUEUED (${manualBetAmount?.toFixed(2)})</span>
            </div>
          ) : hasManualBet && manualHasCashedOut ? (
            <div className="w-full sm:w-44 py-2 bg-slate-800 text-slate-400 text-xs text-center rounded-lg font-mono">
              CASHED OUT ✅
            </div>
          ) : (
            <button
              type="submit"
              disabled={bankroll < betAmount || betAmount <= 0}
              className="w-full sm:w-44 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
            >
              PLACE MANUAL BET
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
