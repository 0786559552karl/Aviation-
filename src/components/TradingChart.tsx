import React, { useState } from 'react';
import { TickDataPoint, AIRegime } from '../types/aviator';
import { Activity } from 'lucide-react';

interface TradingChartProps {
  ticks: TickDataPoint[];
  currentMultiplier: number;
  currentStake: number;
  targetMultiplier: number;
  unrealizedPnL: number;
  isFlying: boolean;
  regime: AIRegime;
  hasCashedOut: boolean;
  cashedOutMultiplier: number | null;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  ticks = [],
  currentMultiplier = 1.0,
  currentStake = 10.0,
  targetMultiplier = 1.6,
  unrealizedPnL = 0,
  isFlying = false,
}) => {
  const [chartMode, setChartMode] = useState<'EQUITY_PNL' | 'MULTIPLIER'>('EQUITY_PNL');

  // Sanitize ticks array
  const safeTicks = Array.isArray(ticks) && ticks.length > 0
    ? ticks.filter((t) => t && Number.isFinite(t.equity) && Number.isFinite(t.multiplier))
    : [{ timestamp: Date.now(), timeLabel: '00:00', multiplier: 1.0, unrealizedPnL: 0, equity: 500 }];

  const recentTicks = safeTicks.slice(-50);

  const width = 640;
  const height = 240;
  const padding = { top: 25, right: 45, bottom: 30, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Compute scale boundaries
  const values =
    chartMode === 'EQUITY_PNL'
      ? recentTicks.map((t) => (Number.isFinite(t.equity) ? t.equity : 500))
      : recentTicks.map((t) => (Number.isFinite(t.multiplier) ? t.multiplier : 1.0));

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);

  const minVal = Number.isFinite(rawMin)
    ? chartMode === 'MULTIPLIER'
      ? Math.max(1.0, rawMin)
      : rawMin
    : 1.0;
  const maxVal = Number.isFinite(rawMax)
    ? chartMode === 'MULTIPLIER'
      ? Math.max(targetMultiplier || 2.0, rawMax, 2.0)
      : Math.max(rawMax, minVal + 10)
    : 2.0;

  const range = Math.max(0.01, maxVal - minVal);

  const getX = (idx: number) => {
    if (recentTicks.length <= 1) return padding.left;
    return padding.left + (idx / (recentTicks.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const safeNum = Number.isFinite(val) ? val : minVal;
    const clamped = Math.min(maxVal, Math.max(minVal, safeNum));
    const normalized = (clamped - minVal) / range;
    return height - padding.bottom - normalized * innerHeight;
  };

  // Generate path
  const points = recentTicks.map((t, idx) => {
    const val = chartMode === 'EQUITY_PNL' ? t.equity : t.multiplier;
    return `${getX(idx).toFixed(1)},${getY(val).toFixed(1)}`;
  });

  const pathD = points.length > 0 ? `M ${points.join(' L ')}` : '';
  const areaD =
    points.length > 0
      ? `M ${getX(0).toFixed(1)},${height - padding.bottom} L ${points.join(' L ')} L ${getX(
          recentTicks.length - 1
        ).toFixed(1)},${height - padding.bottom} Z`
      : '';

  // Current Target Multiplier horizontal line in Multiplier mode
  const targetY = chartMode === 'MULTIPLIER' && Number.isFinite(targetMultiplier) ? getY(targetMultiplier) : null;

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2 relative">
      {/* Chart Sub-Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-white tracking-wider">
            {chartMode === 'EQUITY_PNL' ? 'REAL-TIME 1-SEC EQUITY & P&L FEED' : 'PER-SECOND MULTIPLIER TRAJECTORY'}
          </span>
          <span className="text-[10px] text-slate-500">100ms/1s Ticks</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800 text-[10px]">
            <button
              onClick={() => setChartMode('EQUITY_PNL')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                chartMode === 'EQUITY_PNL'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Equity ($)
            </button>
            <button
              onClick={() => setChartMode('MULTIPLIER')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                chartMode === 'MULTIPLIER'
                  ? 'bg-rose-500/20 text-rose-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Multiplier (x)
            </button>
          </div>
        </div>
      </div>

      {/* Floating Real-Time P&L Widget Over Chart */}
      <div className="absolute top-12 left-4 z-10 bg-[#090d16]/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg font-mono text-xs shadow-lg pointer-events-none">
        <div className="text-[10px] text-slate-400 uppercase">Live Floating P&amp;L</div>
        <div
          className={`text-base font-bold flex items-center gap-1.5 ${
            unrealizedPnL > 0 ? 'text-emerald-400' : unrealizedPnL < 0 ? 'text-rose-400' : 'text-slate-400'
          }`}
        >
          <span>{unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}</span>
          {isFlying && (
            <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-300">
              +{Math.max(0, (currentMultiplier - 1.0) * 100).toFixed(0)}%
            </span>
          )}
        </div>
        <div className="text-[10px] text-slate-500">
          Stake: ${(currentStake || 0).toFixed(2)} &bull; Target: {(targetMultiplier || 1.5).toFixed(2)}x
        </div>
      </div>

      {/* Real-time SVG Canvas Graph */}
      <div className="w-full overflow-hidden relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[220px] select-none">
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="multGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = height - padding.bottom - pct * innerHeight;
            const labelVal = minVal + pct * range;
            return (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="2 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {chartMode === 'EQUITY_PNL' ? `$${labelVal.toFixed(0)}` : `${labelVal.toFixed(2)}x`}
                </text>
              </g>
            );
          })}

          {/* Target Cashout Line in Multiplier mode */}
          {targetY !== null && Number.isFinite(targetY) && (
            <g>
              <line
                x1={padding.left}
                y1={targetY}
                x2={width - padding.right}
                y2={targetY}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text
                x={width - padding.right}
                y={targetY - 4}
                textAnchor="end"
                fill="#10b981"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                AI TARGET: {(targetMultiplier || 1.5).toFixed(2)}x
              </text>
            </g>
          )}

          {/* Area fill */}
          {areaD && (
            <path
              d={areaD}
              fill={chartMode === 'EQUITY_PNL' ? 'url(#equityGradient)' : 'url(#multGradient)'}
            />
          )}

          {/* Stroke path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={chartMode === 'EQUITY_PNL' ? '#06b6d4' : '#f43f5e'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Latest Tick Head Point with glowing ring */}
          {recentTicks.length > 0 && (
            <g>
              <circle
                cx={getX(recentTicks.length - 1)}
                cy={getY(
                  chartMode === 'EQUITY_PNL'
                    ? recentTicks[recentTicks.length - 1].equity
                    : recentTicks[recentTicks.length - 1].multiplier
                )}
                r="4.5"
                fill="#ffffff"
                stroke={chartMode === 'EQUITY_PNL' ? '#06b6d4' : '#f43f5e'}
                strokeWidth="2"
              />
              <circle
                cx={getX(recentTicks.length - 1)}
                cy={getY(
                  chartMode === 'EQUITY_PNL'
                    ? recentTicks[recentTicks.length - 1].equity
                    : recentTicks[recentTicks.length - 1].multiplier
                )}
                r="8"
                fill="none"
                stroke={chartMode === 'EQUITY_PNL' ? '#06b6d4' : '#f43f5e'}
                strokeWidth="1"
                opacity="0.6"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer Tickers */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800 pt-2 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
            <span>Real-time Tick Stream</span>
          </span>
          <span className="text-slate-500">&bull;</span>
          <span>{recentTicks.length} ticks buffered</span>
        </div>
        <div className="text-slate-400">
          AI Status: <strong className="text-emerald-400">Executing Every Round</strong>
        </div>
      </div>
    </div>
  );
};
