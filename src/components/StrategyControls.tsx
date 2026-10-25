import React from 'react';
import { StrategyConfig, StrategyPreset } from '../types/aviator';
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX, Gauge, Sliders, ShieldCheck } from 'lucide-react';

interface StrategyControlsProps {
  currentPreset: StrategyPreset;
  onSelectPreset: (preset: StrategyPreset) => void;
  config: StrategyConfig;
  onUpdateConfig: (config: StrategyConfig) => void;
  botStatus: 'RUNNING' | 'PAUSED' | 'STOPPED';
  onStartBot: () => void;
  onPauseBot: () => void;
  onStopBot: () => void;
  onResetSession: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StrategyControls: React.FC<StrategyControlsProps> = ({
  currentPreset,
  onSelectPreset,
  config,
  onUpdateConfig,
  botStatus,
  onStartBot,
  onPauseBot,
  onStopBot,
  onResetSession,
  simulationSpeed,
  onChangeSpeed,
  soundEnabled,
  onToggleSound,
}) => {
  const handleChange = (field: keyof StrategyConfig, value: number) => {
    onUpdateConfig({
      ...config,
      [field]: isNaN(value) ? 0 : value,
    });
  };

  return (
    <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col gap-4">
      {/* Header & Bot Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-400" />
            BOT CONTROLLER &amp; STRATEGY
          </h2>
          <p className="text-xs text-slate-400">
            Automated execution engine with Martingale progression &amp; risk gates
          </p>
        </div>

        {/* Start / Pause / Stop / Reset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {botStatus !== 'RUNNING' ? (
            <button
              onClick={onStartBot}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              START BOT
            </button>
          ) : (
            <button
              onClick={onPauseBot}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-amber-950/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              PAUSE BOT
            </button>
          )}

          <button
            onClick={onStopBot}
            className="px-3 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Stop bot"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            STOP
          </button>

          <button
            onClick={onResetSession}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Reset bankroll & stats"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute audio FX' : 'Enable audio FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Preset Strategy Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Strategy Preset (from config.js):</span>
          <span className="text-[11px] font-mono text-rose-400 font-normal">
            Active: {config.name}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE', 'CUSTOM'] as StrategyPreset[]).map((preset) => {
            const isSelected = currentPreset === preset;
            return (
              <button
                key={preset}
                onClick={() => onSelectPreset(preset)}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-left flex flex-col cursor-pointer ${
                  isSelected
                    ? 'bg-rose-500/20 border-rose-500 text-white shadow-md shadow-rose-950/30'
                    : 'bg-slate-850/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider">{preset}</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  {preset === 'CONSERVATIVE' && '1.20x target | 1.5x Mart.'}
                  {preset === 'MODERATE' && '1.50x target | 2.0x Mart.'}
                  {preset === 'AGGRESSIVE' && '2.00x target | 2.5x Mart.'}
                  {preset === 'CUSTOM' && 'User-defined parameters'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Numerical Config Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            Initial Bet ($)
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            value={config.initialBet}
            onChange={(e) => handleChange('initialBet', parseFloat(e.target.value))}
            className="w-full bg-[#161b26] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            Target Multiplier
          </label>
          <input
            type="number"
            step="0.05"
            min="1.05"
            value={config.targetMultiplier}
            onChange={(e) => handleChange('targetMultiplier', parseFloat(e.target.value))}
            className="w-full bg-[#161b26] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            Martingale Multiplier
          </label>
          <input
            type="number"
            step="0.1"
            min="1.0"
            value={config.martingaleMultiplier}
            onChange={(e) => handleChange('martingaleMultiplier', parseFloat(e.target.value))}
            className="w-full bg-[#161b26] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            Avg Threshold (x)
          </label>
          <input
            type="number"
            step="0.1"
            min="1.1"
            value={config.averageMultiplierThreshold}
            onChange={(e) => handleChange('averageMultiplierThreshold', parseFloat(e.target.value))}
            className="w-full bg-[#161b26] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
            title="Bot only bets if average of recent games is <= this threshold"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            Stop Loss ($ limit)
          </label>
          <input
            type="number"
            step="5"
            min="5"
            value={config.stopLoss}
            onChange={(e) => handleChange('stopLoss', parseFloat(e.target.value))}
            className="w-full bg-[#161b26] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-rose-400 font-mono focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            Take Profit ($ limit)
          </label>
          <input
            type="number"
            step="10"
            min="10"
            value={config.takeProfit}
            onChange={(e) => handleChange('takeProfit', parseFloat(e.target.value))}
            className="w-full bg-[#161b26] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-emerald-400 font-mono focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            Max Bet ($ cap)
          </label>
          <input
            type="number"
            step="10"
            min="5"
            value={config.maxBet}
            onChange={(e) => handleChange('maxBet', parseFloat(e.target.value))}
            className="w-full bg-[#161b26] border border-slate-700 rounded-md px-2.5 py-1.5 text-xs text-white font-mono focus:border-rose-500 focus:outline-none"
          />
        </div>

        {/* Simulation Speed */}
        <div>
          <label className="block text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" />
            Sim Speed
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded border cursor-pointer ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-[#161b26] border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Safety info badge */}
      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/30 px-3 py-1.5 rounded-md border border-slate-800">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>
          Safety rules active: Auto-stops if profit reaches <strong>+${config.takeProfit}</strong>, loss exceeds <strong>-${config.stopLoss}</strong>, or <strong>5 consecutive losses</strong> are hit.
        </span>
      </div>
    </div>
  );
};
