import React from 'react';
import { PredictionRecord } from '../types/aviator';
import { Activity, Target, CheckCircle2, XCircle } from 'lucide-react';

interface LiveChartProps {
  history: number[];
  predictions: PredictionRecord[];
  currentPrediction: number;
  movingAverage: number;
  accuracyRate: number;
}

export const LiveChart: React.FC<LiveChartProps> = ({
  history,
  predictions,
  currentPrediction,
  movingAverage,
  accuracyRate,
}) => {
  // Take last 20 data points (chronological: oldest to newest)
  const chartData = [...history].slice(0, 20).reverse();

  const width = 580;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 25, left: 40 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(5.0, ...chartData, currentPrediction, movingAverage);
  const minVal = 1.0;

  const getX = (index: number) => {
    if (chartData.length <= 1) return padding.left;
    return padding.left + (index / (chartData.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.min(maxVal, Math.max(minVal, val));
    const normalized = (clamped - minVal) / (maxVal - minVal);
    return height - padding.bottom - normalized * innerHeight;
  };

  // Generate SVG path for actual multipliers
  const points = chartData.map((val, idx) => `${getX(idx)},${getY(val)}`);
  const pathD = points.length > 0 ? `M ${points.join(' L ')}` : '';

  // Area under curve
  const areaD =
    points.length > 0
      ? `M ${getX(0)},${height - padding.bottom} L ${points.join(' L ')} L ${getX(
          chartData.length - 1
        )},${height - padding.bottom} Z`
      : '';

  // Moving average baseline Y
  const maY = getY(movingAverage);
  // Current prediction baseline Y
  const predY = getY(currentPrediction);

  return (
    <div className="bg-[#121622] border border-slate-800/80 rounded-xl p-4 shadow-xl flex flex-col gap-3">
      {/* Chart Header & Predictor Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white tracking-wider uppercase">
            Live Multiplier Trend &amp; Predictor Graph
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            <span>Next Target Est:</span>
            <span className="text-purple-300 font-bold">{currentPrediction.toFixed(2)}x</span>
          </div>

          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
            <span className="text-slate-400">Accuracy:</span>
            <span
              className={`font-bold ${
                accuracyRate >= 60 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {accuracyRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[200px] select-none"
        >
          <defs>
            <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[1.0, 2.0, 3.0, 5.0].map((level) => {
            if (level > maxVal) return null;
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {level.toFixed(1)}x
                </text>
              </g>
            );
          })}

          {/* Moving Average Line */}
          {chartData.length > 0 && (
            <g>
              <line
                x1={padding.left}
                y1={maY}
                x2={width - padding.right}
                y2={maY}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={width - padding.right}
                y={maY - 4}
                textAnchor="end"
                fill="#10b981"
                fontSize="8"
                fontFamily="monospace"
              >
                MA: {movingAverage.toFixed(2)}x
              </text>
            </g>
          )}

          {/* Target Prediction Line */}
          {chartData.length > 0 && (
            <g>
              <line
                x1={padding.left}
                y1={predY}
                x2={width - padding.right}
                y2={predY}
                stroke="#c084fc"
                strokeWidth="1.5"
                strokeDasharray="5 2"
              />
              <text
                x={width - padding.right - 70}
                y={predY - 4}
                textAnchor="end"
                fill="#c084fc"
                fontSize="8"
                fontFamily="monospace"
              >
                PRED: {currentPrediction.toFixed(2)}x
              </text>
            </g>
          )}

          {/* Shaded Area */}
          {areaD && <path d={areaD} fill="url(#chartAreaGradient)" />}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {chartData.map((val, idx) => {
            const cx = getX(idx);
            const cy = getY(val);
            const isLast = idx === chartData.length - 1;
            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLast ? 4.5 : 3}
                  fill={isLast ? '#22d3ee' : '#0891b2'}
                  stroke="#ffffff"
                  strokeWidth={isLast ? 2 : 1}
                />
                {isLast && (
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {val.toFixed(2)}x
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Summary */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>Actual Multiplier</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
            <span>Moving Average</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-purple-400 inline-block" />
            <span>Predictor Value</span>
          </div>
        </div>

        <div className="text-slate-500">
          Showing last {chartData.length} rounds
        </div>
      </div>
    </div>
  );
};
