/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AIAnalysisState,
  TradeOrder,
  TickDataPoint,
  TradingStats,
  AIRegime,
} from './types/aviator';
import { AIAutonomousEngine } from './engine/aiController';
import {
  generateCrashMultiplier,
  calculateCurrentMultiplier,
} from './engine/crashEngine';
import { sounds } from './utils/soundEffects';

import { TradingHeader } from './components/TradingHeader';
import { TradingChart } from './components/TradingChart';
import { AIBrainPanel } from './components/AIBrainPanel';
import { OrderBookTape } from './components/OrderBookTape';
import { AviatorCanvas } from './components/AviatorCanvas';
import { MultiplierBar } from './components/MultiplierBar';
import { ManualBetPanel } from './components/ManualBetPanel';

const INITIAL_BALANCE = 500.0;
const BETTING_SECONDS = 3.0;

export default function App() {
  // Master 24/7 AI Engine Active Switch
  const [is247Active, setIs247Active] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Bankroll & Stats
  const [bankroll, setBankroll] = useState<number>(INITIAL_BALANCE);
  const [peakBalance, setPeakBalance] = useState<number>(INITIAL_BALANCE);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(142); // starts with active session uptime

  // Game Engine State
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [phase, setPhase] = useState<'BETTING' | 'FLYING' | 'CRASHED'>('BETTING');
  const [countdownRemaining, setCountdownRemaining] = useState<number>(BETTING_SECONDS);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(2.25);
  const [multiplierHistory, setMultiplierHistory] = useState<number[]>([
    1.42, 2.15, 1.18, 3.84, 1.22, 1.95, 1.05, 5.4, 1.62, 1.35, 2.44, 1.14
  ]);

  // AI Brain & Streaks
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [consecutiveWins, setConsecutiveWins] = useState<number>(1);
  const aiEngineRef = useRef<AIAutonomousEngine>(new AIAutonomousEngine());

  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisState>({
    regime: 'BALANCED',
    targetMultiplier: 1.6,
    calculatedStake: 10.0,
    confidenceScore: 82,
    riskIndex: 5,
    rationale: 'Initializing neural allocation engine...',
    lossStreak: 0,
    winStreak: 1,
    recentWinRate: 55,
    expectedValue: 6.0,
  });

  // Active Round Stakes & Cashouts
  const [activeStake, setActiveStake] = useState<number>(10.0);
  const [activeTarget, setActiveTarget] = useState<number>(1.6);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [profitWon, setProfitWon] = useState<number | null>(null);
  const [cashedOutMult, setCashedOutMult] = useState<number | null>(null);
  const [unrealizedPnL, setUnrealizedPnL] = useState<number>(0);

  // Manual Bet Override
  const [manualBet, setManualBet] = useState<{ amount: number; target: number } | null>(null);
  const [manualCashedOut, setManualCashedOut] = useState<boolean>(false);

  // Historical Ticks & Orders
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [ticks, setTicks] = useState<TickDataPoint[]>([
    { timestamp: Date.now() - 3000, timeLabel: '00:01', multiplier: 1.0, unrealizedPnL: 0, equity: 500 },
    { timestamp: Date.now() - 2000, timeLabel: '00:02', multiplier: 1.15, unrealizedPnL: 1.5, equity: 501.5 },
    { timestamp: Date.now() - 1000, timeLabel: '00:03', multiplier: 1.3, unrealizedPnL: 3.0, equity: 503 },
  ]);

  // Sound sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // 24/7 Uptime clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (is247Active) {
        setUptimeSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [is247Active]);

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  // Compute AI Analysis for the Upcoming Round
  const evaluateNextRoundAI = useCallback(() => {
    const analysis = aiEngineRef.current.analyzeAndPlanRound(
      bankroll,
      orders,
      consecutiveLosses,
      consecutiveWins,
      multiplierHistory
    );
    setAiAnalysis(analysis);
    setActiveStake(analysis.calculatedStake);
    setActiveTarget(analysis.targetMultiplier);
    return analysis;
  }, [bankroll, orders, consecutiveLosses, consecutiveWins, multiplierHistory]);

  // Main 24/7 Autonomous Game Engine Loop
  useEffect(() => {
    let animId: number;
    let flightStart = 0;
    let countdownInterval: NodeJS.Timeout | null = null;

    if (phase === 'BETTING') {
      const nextCrash = generateCrashMultiplier();
      setCrashPoint(nextCrash);
      setCurrentMultiplier(1.0);
      setHasCashedOut(false);
      setProfitWon(null);
      setCashedOutMult(null);
      setUnrealizedPnL(0);

      // AI prepares parameters for this round
      if (is247Active) {
        const plan = evaluateNextRoundAI();
        // Deduct stake from bankroll at entry
        setBankroll((prev) => {
          const next = Number(Math.max(1, prev - plan.calculatedStake).toFixed(2));
          return next;
        });
        sounds.playBetPlaced();
      }

      // Countdown window
      const startTime = Date.now();
      const durationMs = (BETTING_SECONDS * 1000) / simulationSpeed;

      countdownInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remain = Math.max(0, (durationMs - elapsed) / 1000) * simulationSpeed;
        setCountdownRemaining(remain);

        if (remain <= 0) {
          if (countdownInterval) clearInterval(countdownInterval);
          setPhase('FLYING');
        }
      }, 50);
    } else if (phase === 'FLYING') {
      flightStart = performance.now();
      let hasCrashed = false;
      let cashedThisRound = false;

      const loop = (now: number) => {
        if (hasCrashed) return;

        const elapsedSec = (now - flightStart) / 1000;
        const mult = calculateCurrentMultiplier(elapsedSec, simulationSpeed);
        setCurrentMultiplier(mult);

        // Per-second / tick floating PnL calculation
        const floating = is247Active ? Number((activeStake * (mult - 1.0)).toFixed(2)) : 0;
        setUnrealizedPnL(floating);

        // Append real-time tick to per-second chart
        const nowMs = Date.now();
        const dateObj = new Date(nowMs);
        const timeLabel = `${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj
          .getSeconds()
          .toString()
          .padStart(2, '0')}`;

        setTicks((prev) => [
          ...prev.slice(-60),
          {
            timestamp: nowMs,
            timeLabel,
            multiplier: mult,
            unrealizedPnL: floating,
            equity: Number((bankroll + activeStake + floating).toFixed(2)),
          },
        ]);

        // AI DYNAMIC CASHOUT TRIGGER (1.12x when losses, 1.5x-1.7x medium, up to 2.0x wins)
        if (is247Active && !cashedThisRound && mult >= activeTarget) {
          cashedThisRound = true;
          const realizedProfit = Number((activeStake * (activeTarget - 1.0)).toFixed(2));
          const totalReturn = activeStake + realizedProfit;

          setBankroll((prev) => {
            const newBal = Number((prev + totalReturn).toFixed(2));
            setPeakBalance((pk) => Math.max(pk, newBal));

            // Record execution order
            const newOrder: TradeOrder = {
              id: `ord-${roundNumber}-${Date.now()}`,
              orderNumber: roundNumber,
              timestamp: Date.now(),
              timeFormatted: new Date().toLocaleTimeString(),
              side: 'BUY_LONG',
              stake: activeStake,
              targetMultiplier: activeTarget,
              exitMultiplier: mult,
              realizedPnL: realizedProfit,
              realizedPnLPercent: Number(((activeTarget - 1.0) * 100).toFixed(1)),
              status: 'PROFIT_EXIT',
              regime: aiAnalysis.regime,
              bankrollAfter: newBal,
            };
            setOrders((ords) => [newOrder, ...ords]);
            return newBal;
          });

          setHasCashedOut(true);
          setProfitWon(realizedProfit);
          setCashedOutMult(mult);
          setConsecutiveWins((w) => w + 1);
          setConsecutiveLosses(0);
          sounds.playCashout();
        }

        // Manual Bet Cashout Check
        if (manualBet && !manualCashedOut && mult >= manualBet.target) {
          const mProfit = manualBet.amount * (manualBet.target - 1.0);
          setBankroll((prev) => Number((prev + manualBet.amount + mProfit).toFixed(2)));
          setManualCashedOut(true);
          sounds.playCashout();
        }

        // Crash trigger
        if (mult >= crashPoint) {
          hasCrashed = true;
          setPhase('CRASHED');
          sounds.playCrash();
          setUnrealizedPnL(0);

          // If AI did not cash out before crash -> Loss
          if (is247Active && !cashedThisRound) {
            setConsecutiveLosses((l) => l + 1);
            setConsecutiveWins(0);

            const newOrder: TradeOrder = {
              id: `ord-${roundNumber}-loss-${Date.now()}`,
              orderNumber: roundNumber,
              timestamp: Date.now(),
              timeFormatted: new Date().toLocaleTimeString(),
              side: 'BUY_LONG',
              stake: activeStake,
              targetMultiplier: activeTarget,
              exitMultiplier: crashPoint,
              realizedPnL: -activeStake,
              realizedPnLPercent: -100,
              status: 'LIQUIDATED',
              regime: aiAnalysis.regime,
              bankrollAfter: bankroll,
            };
            setOrders((ords) => [newOrder, ...ords]);
          }

          // Update multiplier ribbon
          setMultiplierHistory((hist) => [crashPoint, ...hist.slice(0, 30)]);

          // Continuous 24/7 autonomous transition to next round
          setTimeout(() => {
            setRoundNumber((r) => r + 1);
            setManualBet(null);
            setManualCashedOut(false);
            setPhase('BETTING');
          }, 2400 / simulationSpeed);

          return;
        }

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [phase, crashPoint, simulationSpeed, is247Active, activeTarget, activeStake, evaluateNextRoundAI]);

  // Financial Stats computation
  const totalPnL = bankroll - INITIAL_BALANCE;
  const totalPnLPercent = (totalPnL / INITIAL_BALANCE) * 100;
  const winningOrders = orders.filter((o) => o.status === 'PROFIT_EXIT');
  const winRate = orders.length > 0 ? (winningOrders.length / orders.length) * 100 : 0;
  const totalGains = winningOrders.reduce((sum, o) => sum + o.realizedPnL, 0);
  const losingOrders = orders.filter((o) => o.status === 'LIQUIDATED');
  const totalLosses = Math.abs(losingOrders.reduce((sum, o) => sum + o.realizedPnL, 0));
  const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? 9.99 : 1.0;
  const drawdown = peakBalance - bankroll;
  const drawdownPercent = peakBalance > 0 ? (drawdown / peakBalance) * 100 : 0;

  const tradingStats: TradingStats = {
    startingBalance: INITIAL_BALANCE,
    currentBalance: bankroll,
    peakBalance,
    totalPnL: Number(totalPnL.toFixed(2)),
    totalPnLPercent: Number(totalPnLPercent.toFixed(1)),
    unrealizedPnL,
    totalRounds: orders.length,
    wins: winningOrders.length,
    losses: losingOrders.length,
    winRate: Number(winRate.toFixed(1)),
    profitFactor: Number(profitFactor.toFixed(2)),
    maxDrawdown: Number(drawdown.toFixed(2)),
    maxDrawdownPercent: Number(drawdownPercent.toFixed(1)),
    uptimeSeconds,
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'Round,Time,Regime,Stake,Target,ExitMultiplier,PnL,PnLPercent,Status,Equity\n';
    const rows = orders
      .map(
        (o) =>
          `${o.orderNumber},"${o.timeFormatted}",${o.regime},${o.stake},${o.targetMultiplier},${o.exitMultiplier},${o.realizedPnL},${o.realizedPnLPercent}%,${o.status},${o.bankrollAfter}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aviator_trading_tape_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual Bet Handlers
  const handlePlaceManualBet = (amount: number, target: number) => {
    if (bankroll < amount) return;
    setBankroll((prev) => Number((prev - amount).toFixed(2)));
    setManualBet({ amount, target });
    setManualCashedOut(false);
    sounds.playBetPlaced();
  };

  const handleManualCashout = () => {
    if (!manualBet || manualCashedOut || phase !== 'FLYING') return;
    const profit = manualBet.amount * (currentMultiplier - 1.0);
    setBankroll((prev) => Number((prev + manualBet.amount + profit).toFixed(2)));
    setManualCashedOut(true);
    sounds.playCashout();
  };

  const last3 = multiplierHistory.slice(0, 3);
  const averageMultiplier = last3.length > 0 ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Financial Trading App Header */}
      <TradingHeader
        stats={tradingStats}
        currentMultiplier={currentMultiplier}
        unrealizedPnL={unrealizedPnL}
        isFlying={phase === 'FLYING'}
        regime={aiAnalysis.regime}
        uptimeFormatted={formatUptime(uptimeSeconds)}
        is247Active={is247Active}
        onToggle247={() => setIs247Active((prev) => !prev)}
      />

      {/* Main Terminal Grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 md:p-4 flex flex-col gap-3">
        {/* Top Multiplier Tape Ribbon */}
        <MultiplierBar
          history={multiplierHistory}
          averageMultiplier={averageMultiplier}
          averageThreshold={2.0}
        />

        {/* 2-Column Trading Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Column: Visual Canvas & Per-Second Trading Graph */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* Aviator Flight Arena */}
            <AviatorCanvas
              phase={phase}
              currentMultiplier={currentMultiplier}
              crashPoint={crashPoint}
              countdownRemaining={countdownRemaining}
              totalCountdown={BETTING_SECONDS}
              targetMultiplier={activeTarget}
              hasActiveBet={is247Active || !!manualBet}
              hasCashedOut={hasCashedOut || manualCashedOut}
              cashedOutMultiplier={hasCashedOut ? activeTarget : manualCashedOut ? currentMultiplier : null}
              profitWon={profitWon}
            />

            {/* Per-Second Real-Time Equity & P&L Feed Graph */}
            <TradingChart
              ticks={ticks}
              currentMultiplier={currentMultiplier}
              currentStake={activeStake}
              targetMultiplier={activeTarget}
              unrealizedPnL={unrealizedPnL}
              isFlying={phase === 'FLYING'}
              regime={aiAnalysis.regime}
              hasCashedOut={hasCashedOut}
              cashedOutMultiplier={cashedOutMult}
            />

            {/* Manual Bet Quick Override */}
            <ManualBetPanel
              phase={phase}
              bankroll={bankroll}
              currentMultiplier={currentMultiplier}
              onPlaceManualBet={handlePlaceManualBet}
              onManualCashout={handleManualCashout}
              hasManualBet={!!manualBet}
              manualBetAmount={manualBet ? manualBet.amount : null}
              manualHasCashedOut={manualCashedOut}
            />
          </div>

          {/* Right Column: 24/7 AI Brain Status & Risk Allocation Panel */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <AIBrainPanel
              analysis={aiAnalysis}
              is247Active={is247Active}
              onToggle247={() => setIs247Active((prev) => !prev)}
              simulationSpeed={simulationSpeed}
              onChangeSpeed={(s) => setSimulationSpeed(s)}
              bankroll={bankroll}
            />

            {/* Trading Performance KPI Matrix */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 shadow-xl font-mono text-xs flex flex-col gap-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                <span>SESSION PERFORMANCE MATRIX</span>
                <span className="text-emerald-400 font-bold">{orders.length} Rounds Executed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">WIN RATE</div>
                  <div className="text-sm font-bold text-cyan-400">{tradingStats.winRate}%</div>
                  <div className="text-[9px] text-slate-400">{tradingStats.wins}W / {tradingStats.losses}L</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">PROFIT FACTOR</div>
                  <div className="text-sm font-bold text-emerald-400">{tradingStats.profitFactor}</div>
                  <div className="text-[9px] text-slate-400">+${totalGains.toFixed(1)} / -${totalLosses.toFixed(1)}</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">MAX DRAWDOWN</div>
                  <div className="text-sm font-bold text-amber-400">-{tradingStats.maxDrawdownPercent}%</div>
                  <div className="text-[9px] text-slate-400">-${tradingStats.maxDrawdown.toFixed(2)}</div>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-slate-800/80">
                  <div className="text-[10px] text-slate-500">PEAK EQUITY</div>
                  <div className="text-sm font-bold text-white">${tradingStats.peakBalance.toFixed(2)}</div>
                  <div className="text-[9px] text-slate-400">ATH Balance</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom AI Order Execution Tape */}
        <OrderBookTape orders={orders} onExportCSV={handleExportCSV} />
      </main>

      {/* Terminal Footer */}
      <footer className="w-full bg-[#070a12] border-t border-slate-800/80 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>
          AVTR Autonomous 24/7 Quant Engine &bull; Algorithmic Execution Active
        </div>
        <div>
          Server Latency: <span className="text-emerald-400">14ms</span> &bull; Feed: <span className="text-cyan-400">100ms Ticks</span>
        </div>
      </footer>
    </div>
  );
}
