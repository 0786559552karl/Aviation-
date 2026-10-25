import React from 'react';
import { TradeOrder } from '../types/aviator';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, FileSpreadsheet } from 'lucide-react';

interface OrderBookTapeProps {
  orders: TradeOrder[];
  onExportCSV: () => void;
}

export const OrderBookTape: React.FC<OrderBookTapeProps> = ({ orders, onExportCSV }) => {
  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-col gap-2 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-white tracking-wider">
            AI EXECUTION TAPE &amp; AUDIT LOG ({orders.length} EXECUTIONS)
          </span>
        </div>

        {orders.length > 0 && (
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-800 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[260px] scrollbar-thin scrollbar-thumb-slate-800">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs italic">
            AI active. Executing initial round...
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#090d16] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2 px-2.5">Round</th>
                <th className="py-2 px-2.5">Time</th>
                <th className="py-2 px-2.5">AI Regime</th>
                <th className="py-2 px-2.5">Stake ($)</th>
                <th className="py-2 px-2.5">AI Target</th>
                <th className="py-2 px-2.5">Crash (x)</th>
                <th className="py-2 px-2.5">P&amp;L ($)</th>
                <th className="py-2 px-2.5">P&amp;L (%)</th>
                <th className="py-2 px-2.5">Status</th>
                <th className="py-2 px-2.5">Equity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-slate-300">
              {orders.map((ord) => {
                const isWon = ord.status === 'PROFIT_EXIT';
                return (
                  <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-1.5 px-2.5 text-white font-bold">#{ord.orderNumber}</td>
                    <td className="py-1.5 px-2.5 text-slate-500 text-[10px]">{ord.timeFormatted}</td>
                    <td className="py-1.5 px-2.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          ord.regime === 'DEFENSIVE'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : ord.regime === 'MOMENTUM'
                            ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {ord.regime}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-200">${ord.stake.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 text-emerald-400 font-bold">
                      {ord.targetMultiplier.toFixed(2)}x
                    </td>
                    <td className="py-1.5 px-2.5 text-slate-400">
                      {ord.exitMultiplier.toFixed(2)}x
                    </td>
                    <td
                      className={`py-1.5 px-2.5 font-bold ${
                        isWon ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isWon ? `+$${ord.realizedPnL.toFixed(2)}` : `-$${Math.abs(ord.realizedPnL).toFixed(2)}`}
                    </td>
                    <td
                      className={`py-1.5 px-2.5 font-bold ${
                        isWon ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isWon ? `+${ord.realizedPnLPercent.toFixed(0)}%` : `-100%`}
                    </td>
                    <td className="py-1.5 px-2.5">
                      {isWon ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                          <ArrowUpRight className="w-3.5 h-3.5" /> FILLED
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-bold text-[11px]">
                          <ArrowDownRight className="w-3.5 h-3.5" /> CRASHED
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-2.5 text-white font-bold">
                      ${ord.bankrollAfter.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
