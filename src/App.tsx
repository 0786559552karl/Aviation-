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
const BETTING_SECONDS = 3.5;

export default function App() {
  // Master 24/7 AI Engine Active Switch - ALWAYS active, NEVER quits
  const [is247Active, setIs247Active] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Bankroll & Stats
  const [bankroll, setBankroll] = useState<number>(INITIAL_BALANCE);
  const [peakBalance, setPeakBalance] = useState<number>(INITIAL_BALANCE);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(240);

  // Game Engine Visual States
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
    rationale: 'Autonomous neural allocation engine ready. 24/7 continuous operation active.',
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

  // Stable Refs to completely eliminate React dependency tearing and prevent loop stopping
  const bankrollRef = useRef<number>(bankroll);
  bankrollRef.current = bankroll;

  const ordersRef = useRef<TradeOrder[]>(orders);
  ordersRef.current = orders;

  const consecutiveLossesRef = useRef<number>(consecutiveLosses);
  consecutiveLossesRef.current = consecutiveLosses;

  const consecutiveWinsRef = useRef<number>(consecutiveWins);
  consecutiveWinsRef.current = consecutiveWins;

  const multiplierHistoryRef = useRef<number[]>(multiplierHistory);
  multiplierHistoryRef.current = multiplierHistory;

  const activeStakeRef = useRef<number>(activeStake);
  activeStakeRef.current = activeStake;

  const activeTargetRef = useRef<number>(activeTarget);
  activeTargetRef.current = activeTarget;

  const simulationSpeedRef = useRef<number>(simulationSpeed);
  simulationSpeedRef.current = simulationSpeed;

  const is247ActiveRef = useRef<boolean>(is247Active);
  is247ActiveRef.current = is247Active;

  const roundNumberRef = useRef<number>(roundNumber);
  roundNumberRef.current = roundNumber;

  const aiAnalysisRef = useRef<AIAnalysisState>(aiAnalysis);
  aiAnalysisRef.current = aiAnalysis;

  const manualBetRef = useRef<{ amount: number; target: number } | null>(manualBet);
  manualBetRef.current = manualBet;

  const manualCashedOutRef = useRef<boolean>(manualCashedOut);
  manualCashedOutRef.current = manualCashedOut;

  // Sound sync
  useEffect(() => {
    sounds.enabled = soundEnabled;
  }, [soundEnabled]);

  // 24/7 Real-Time Uptime Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  // Automated Bankroll Safety Reserve Vault:
  // If bankroll drops below $15, auto-injects $500 reserve so the 24/7 bot NEVER stops or runs out of money!
  const ensureLiquidity = useCallback(() => {
    if (bankrollRef.current < 15.0) {
      const rebalanceAmount = 500.0;
      setBankroll((b) => Number((b + rebalanceAmount).toFixed(2)));
      bankrollRef.current = bankrollRef.current + rebalanceAmount;
    }
  }, []);

  // Compute AI Analysis for the upcoming round
  const planNextRound = useCallback(() => {
    ensureLiquidity();
    const plan = aiEngineRef.current.analyzeAndPlanRound(
      bankrollRef.current,
      ordersRef.current,
      consecutiveLossesRef.current,
      consecutiveWinsRef.current,
      multiplierHistoryRef.current
    );
    setAiAnalysis(plan);
    setActiveStake(plan.calculatedStake);
    setActiveTarget(plan.targetMultiplier);
    return plan;
  }, [ensureLiquidity]);

  // Master Non-Stop Game Engine Loop (Never Quits, Continuous Real-Time)
  useEffect(() => {
    let animId: number;
    let loopInterval: NodeJS.Timeout | null = null;
    let nextRoundTimeout: NodeJS.Timeout | null = null;

    if (phase === 'BETTING') {
      const nextCrash = generateCrashMultiplier();
      setCrashPoint(nextCrash);
      setCurrentMultiplier(1.0);
      setHasCashedOut(false);
      setProfitWon(null);
      setCashedOutMult(null);
      setUnrealizedPnL(0);

      // AI calculates target & stake and commits order
      const plan = planNextRound();
      if (is247ActiveRef.current) {
        setBankroll((prev) => {
          const next = Number(Math.max(1, prev - plan.calculatedStake).toFixed(2));
          bankrollRef.current = next;
          return next;
        });
        sounds.playBetPlaced();
      }

      // Real-time countdown
      const startTime = Date.now();
      const durationMs = (BETTING_SECONDS * 1000) / simulationSpeedRef.current;

      loopInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remain = Math.max(0, (durationMs - elapsed) / 1000) * simulationSpeedRef.current;
        setCountdownRemaining(remain);

        if (remain <= 0) {
          if (loopInterval) clearInterval(loopInterval);
          setPhase('FLYING');
        }
      }, 100);
    } else if (phase === 'FLYING') {
      const flightStart = performance.now();
      let hasCrashed = false;
      let cashedThisRound = false;
      let lastStateUpdate = 0;
      let lastTickUpdate = 0;

      // Real-time flight loop: 60fps physics, throttled React state to prevent browser crash
      const loop = (now: number) => {
        if (hasCrashed) return;

        const elapsedSec = (now - flightStart) / 1000;
        const mult = calculateCurrentMultiplier(elapsedSec, simulationSpeedRef.current);

        // Throttle React state update to ~15 times/sec (every 65ms)
        // Keeps UI completely responsive while eliminating 'Maximum update depth exceeded' white screen
        if (now - lastStateUpdate >= 65) {
          lastStateUpdate = now;
          setCurrentMultiplier(mult);

          const floating = is247ActiveRef.current
            ? Number((activeStakeRef.current * (mult - 1.0)).toFixed(2))
            : 0;
          setUnrealizedPnL(floating);
        }

        // Record real-time chart tick every 500ms
        if (now - lastTickUpdate >= 500) {
          lastTickUpdate = now;
          const nowMs = Date.now();
          const dateObj = new Date(nowMs);
          const timeLabel = `${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj
            .getSeconds()
            .toString()
            .padStart(2, '0')}`;
          const floating = is247ActiveRef.current
            ? Number((activeStakeRef.current * (mult - 1.0)).toFixed(2))
            : 0;

          setTicks((prev) => [
            ...prev.slice(-50),
            {
              timestamp: nowMs,
              timeLabel,
              multiplier: mult,
              unrealizedPnL: floating,
              equity: Number((bankrollRef.current + activeStakeRef.current + floating).toFixed(2)),
            },
          ]);
        }

        // DYNAMIC CASHOUT:
        // 1.12x on heavy losses | 1.50x-1.70x on medium | up to 2.00x on win streaks
        if (is247ActiveRef.current && !cashedThisRound && mult >= activeTargetRef.current) {
          cashedThisRound = true;
          const target = activeTargetRef.current;
          const stake = activeStakeRef.current;
          const realizedProfit = Number((stake * (target - 1.0)).toFixed(2));
          const totalReturn = stake + realizedProfit;

          setBankroll((prev) => {
            const newBal = Number((prev + totalReturn).toFixed(2));
            bankrollRef.current = newBal;
            setPeakBalance((pk) => Math.max(pk, newBal));

            const newOrder: TradeOrder = {
              id: `ord-${roundNumberRef.current}-${Date.now()}`,
              orderNumber: roundNumberRef.current,
              timestamp: Date.now(),
              timeFormatted: new Date().toLocaleTimeString(),
              side: 'BUY_LONG',
              stake: stake,
              targetMultiplier: target,
              exitMultiplier: mult,
              realizedPnL: realizedProfit,
              realizedPnLPercent: Number(((target - 1.0) * 100).toFixed(1)),
              status: 'PROFIT_EXIT',
              regime: aiAnalysisRef.current.regime,
              bankrollAfter: newBal,
            };
            setOrders((ords) => [newOrder, ...ords]);
            return newBal;
          });

          setHasCashedOut(true);
          setProfitWon(realizedProfit);
          setCashedOutMult(mult);
          setConsecutiveWins((w) => w + 1);
          consecutiveWinsRef.current = consecutiveWinsRef.current + 1;
          setConsecutiveLosses(0);
          consecutiveLossesRef.current = 0;
          sounds.playCashout();
        }

        // Manual Bet Cashout Check
        if (manualBetRef.current && !manualCashedOutRef.current && mult >= manualBetRef.current.target) {
          const mProfit = manualBetRef.current.amount * (manualBetRef.current.target - 1.0);
          setBankroll((prev) => Number((prev + manualBetRef.current!.amount + mProfit).toFixed(2)));
          setManualCashedOut(true);
          sounds.playCashout();
        }

        // Crash Point Trigger
        if (mult >= crashPoint) {
          hasCrashed = true;
          setPhase('CRASHED');
          setCurrentMultiplier(crashPoint);
          sounds.playCrash();
          setUnrealizedPnL(0);

          // Record Loss if not cashed out
          if (is247ActiveRef.current && !cashedThisRound) {
            setConsecutiveLosses((l) => l + 1);
            consecutiveLossesRef.current = consecutiveLossesRef.current + 1;
            setConsecutiveWins(0);
            consecutiveWinsRef.current = 0;

            const newOrder: TradeOrder = {
              id: `ord-${roundNumberRef.current}-loss-${Date.now()}`,
              orderNumber: roundNumberRef.current,
              timestamp: Date.now(),
              timeFormatted: new Date().toLocaleTimeString(),
              side: 'BUY_LONG',
              stake: activeStakeRef.current,
              targetMultiplier: activeTargetRef.current,
              exitMultiplier: crashPoint,
              realizedPnL: -activeStakeRef.current,
              realizedPnLPercent: -100,
              status: 'LIQUIDATED',
              regime: aiAnalysisRef.current.regime,
              bankrollAfter: bankrollRef.current,
            };
            setOrders((ords) => [newOrder, ...ords]);
          }

          // Update recent multiplier tape
          setMultiplierHistory((hist) => {
            const updated = [crashPoint, ...hist.slice(0, 30)];
            multiplierHistoryRef.current = updated;
            return updated;
          });

          // CONTINUOUS 24/7 RE-ENTRY: Never quits, automatically transitions to next round!
          nextRoundTimeout = setTimeout(() => {
            setRoundNumber((r) => r + 1);
            roundNumberRef.current = roundNumberRef.current + 1;
            setManualBet(null);
            setManualCashedOut(false);
            setPhase('BETTING');
          }, 2200 / simulationSpeedRef.current);

          return;
        }

        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);
    }

    return () => {
      if (loopInterval) clearInterval(loopInterval);
      if (nextRoundTimeout) clearTimeout(nextRoundTimeout);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [phase, crashPoint, planNextRound]);

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
      {/* 24/7 Always Active Financial Header */}
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

      {/* Main Terminal Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 md:p-4 flex flex-col gap-3">
        {/* Top Multiplier Tape Ribbon */}
        <MultiplierBar
          history={multiplierHistory}
          averageMultiplier={averageMultiplier}
          averageThreshold={2.0}
        />

        {/* 2-Column Trading Layout */}
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
                <span>24/7 CONTINUOUS PERFORMANCE AUDIT</span>
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

              {/* Infinite Execution Guarantee Badge */}
              <div className="mt-1 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  PERSISTENT ENGINE: NEVER QUITS
                </span>
                <span>Auto-Rebalancing Active</span>
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
          AVTR 24/7 Autonomous Algorithmic Engine &bull; Non-Stop Real-Time Execution
        </div>
        <div>
          Execution Loop: <span className="text-emerald-400 font-bold">CONTINUOUS</span> &bull; Feed: <span className="text-cyan-400 font-bold">REAL TIME</span>
        </div>
      </footer>
    </div>
  );
}
