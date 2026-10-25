import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types/aviator';
import { Terminal, Trash2, Filter } from 'lucide-react';

interface TerminalLogsProps {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | 'bet' | 'success' | 'warn'>('all');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'bet') return log.category === 'bet' || log.category === 'strategy';
    if (filter === 'success') return log.level === 'success';
    if (filter === 'warn') return log.level === 'warn' || log.level === 'error';
    return true;
  });

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400 font-bold';
      case 'warn':
        return 'text-amber-400 font-bold';
      case 'error':
        return 'text-rose-400 font-bold';
      case 'debug':
        return 'text-slate-500';
      default:
        return 'text-cyan-400 font-semibold';
    }
  };

  return (
    <div className="bg-[#0c0e14] border border-slate-800/90 rounded-xl p-3 shadow-xl flex flex-col h-[280px]">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-mono font-bold text-slate-200">
            BOT CONSOLE &amp; DECISION STREAM
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            {logs.length} entries
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-[10px] font-mono">
            <Filter className="w-3 h-3 text-slate-400" />
            {(['all', 'bet', 'success', 'warn'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-1.5 py-0.5 rounded uppercase cursor-pointer ${
                  filter === mode
                    ? 'bg-rose-500/20 text-rose-300 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={onClearLogs}
            className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 font-mono text-[11px] leading-relaxed pr-1 select-text scrollbar-thin scrollbar-thumb-slate-800"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-8 italic">
            Console initialized. Waiting for bot events...
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-1.5 py-0.5 hover:bg-slate-900/40 px-1 rounded">
              <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
              <span className={`shrink-0 uppercase ${getLevelColor(log.level)}`}>
                {log.level.padEnd(5)}:
              </span>
              <span className="text-slate-300 break-words">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
