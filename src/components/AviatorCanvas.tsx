import React, { useEffect, useRef } from 'react';
import { GamePhase } from '../types/aviator';

interface AviatorCanvasProps {
  phase: GamePhase;
  currentMultiplier: number;
  crashPoint: number;
  countdownRemaining: number;
  totalCountdown: number;
  targetMultiplier: number;
  hasActiveBet: boolean;
  hasCashedOut: boolean;
  cashedOutMultiplier: number | null;
  profitWon: number | null;
}

export const AviatorCanvas: React.FC<AviatorCanvasProps> = ({
  phase,
  currentMultiplier,
  crashPoint,
  countdownRemaining,
  totalCountdown,
  targetMultiplier,
  hasActiveBet,
  hasCashedOut,
  cashedOutMultiplier,
  profitWon,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<{ x: number; y: number; speed: number; size: number }[]>([]);
  const explosionParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);

  // Initialize stars background
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 45; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.2 + Math.random() * 0.8,
        size: 1 + Math.random() * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // Trigger explosion particles when game crashes
  useEffect(() => {
    if (phase === 'CRASHED') {
      const particles = [];
      const colors = ['#f43f5e', '#fb7185', '#fda4af', '#f59e0b', '#ffffff'];
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x: 0, // will be set at plane position
          y: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.5,
          life: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      explosionParticlesRef.current = particles;
    }
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear with dark sleek Aviator background
      ctx.fillStyle = '#0f1117';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw starry / wind particle effect
      const starSpeed = phase === 'FLYING' ? 3.5 : 0.8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      starsRef.current.forEach((star) => {
        star.x -= (star.speed * starSpeed) / width;
        if (star.x < 0) star.x = 1;
        ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
      });

      // Coordinates for flight curve
      const originX = 50;
      const originY = height - 50;
      const maxX = width - 80;
      const minY = 60;

      // Multiplier progress between 1.00 and max view multiplier
      const progress = Math.min(1, Math.max(0, (currentMultiplier - 1.0) / 10.0));
      // Ease curve: parabolic trajectory
      const curveX = originX + (maxX - originX) * Math.pow(progress, 0.75);
      const curveY = originY - (originY - minY) * Math.pow(progress, 0.85);

      if (phase === 'FLYING' || phase === 'CRASHED') {
        // Draw Curved Gradient Area below the flight path
        const gradient = ctx.createLinearGradient(0, minY, 0, originY);
        if (phase === 'CRASHED') {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.01)');
        } else {
          gradient.addColorStop(0, 'rgba(225, 29, 72, 0.35)');
          gradient.addColorStop(1, 'rgba(225, 29, 72, 0.02)');
        }

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        // Quadratic curve to current plane position
        const controlX = originX + (curveX - originX) * 0.45;
        const controlY = originY - (originY - curveY) * 0.15;
        ctx.quadraticCurveTo(controlX, controlY, curveX, curveY);
        ctx.lineTo(curveX, originY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw the neon flight stroke
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.quadraticCurveTo(controlX, controlY, curveX, curveY);
        ctx.strokeStyle = phase === 'CRASHED' ? '#ef4444' : '#f43f5e';
        ctx.lineWidth = 4;
        ctx.shadowColor = phase === 'CRASHED' ? '#ef4444' : '#e11d48';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Target Multiplier dashed indicator line (if active bet)
        if (hasActiveBet && targetMultiplier > 1.0) {
          const targetProgress = Math.min(1, Math.max(0, (targetMultiplier - 1.0) / 10.0));
          const targetY = originY - (originY - minY) * Math.pow(targetProgress, 0.85);

          ctx.save();
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(originX, targetY);
          ctx.lineTo(width - 40, targetY);
          ctx.stroke();

          // Label
          ctx.fillStyle = '#10b981';
          ctx.font = '10px monospace';
          ctx.fillText(`TARGET: ${targetMultiplier.toFixed(2)}x`, width - 120, targetY - 4);
          ctx.restore();
        }
      }

      // Draw the Airplane (only during FLYING or at beginning)
      if (phase === 'FLYING' || (phase === 'BETTING' && countdownRemaining <= 0.8)) {
        drawPlane(ctx, curveX, curveY, false);
      }

      // Render explosion particles if crashed
      if (phase === 'CRASHED' && explosionParticlesRef.current.length > 0) {
        explosionParticlesRef.current.forEach((p) => {
          if (p.x === 0 && p.y === 0) {
            p.x = curveX;
            p.y = curveY;
          }
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gravity
          p.life -= 0.02;

          if (p.life > 0) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [phase, currentMultiplier, crashPoint, countdownRemaining, targetMultiplier, hasActiveBet]);

  // Airplane drawer helper
  const drawPlane = (ctx: CanvasRenderingContext2D, x: number, y: number, isCrashed: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    // Angle pitch upwards ~22 degrees
    const angle = isCrashed ? 0.6 : -0.32;
    ctx.rotate(angle);

    // Propeller blur disk
    const time = Date.now() * 0.03;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(22, 0, 3, 14 * Math.sin(time), 0, 0, Math.PI * 2);
    ctx.fill();

    // Plane Fuselage (Streamlined Red Aviator jet body)
    ctx.fillStyle = isCrashed ? '#7f1d1d' : '#e11d48';
    ctx.beginPath();
    ctx.moveTo(22, 0); // nose
    ctx.quadraticCurveTo(8, -6, -18, -4);
    ctx.lineTo(-24, -2);
    ctx.lineTo(-24, 2);
    ctx.quadraticCurveTo(8, 6, 22, 0);
    ctx.closePath();
    ctx.fill();

    // Wings
    ctx.fillStyle = isCrashed ? '#991b1b' : '#be123c';
    ctx.beginPath();
    ctx.moveTo(-4, -3);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-8, -18);
    ctx.lineTo(4, -2);
    ctx.closePath();
    ctx.fill();

    // Tail fin
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.moveTo(-18, -3);
    ctx.lineTo(-26, -15);
    ctx.lineTo(-22, -15);
    ctx.lineTo(-14, -2);
    ctx.closePath();
    ctx.fill();

    // Cockpit windshield
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(8, -2, 5, 2.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  return (
    <div className="relative w-full h-[320px] md:h-[380px] bg-[#0c0e14] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col justify-center items-center">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        width={760}
        height={380}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Center Overlays based on Phase */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        {phase === 'BETTING' && (
          <div className="flex flex-col items-center animate-fade-in">
            <span className="text-xs uppercase tracking-widest font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              Next Round Starting In
            </span>
            <div className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white mb-3">
              {countdownRemaining.toFixed(1)}s
            </div>

            {/* Countdown progress bar */}
            <div className="w-56 h-2 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-100 ease-linear"
                style={{
                  width: `${Math.max(0, Math.min(100, (countdownRemaining / totalCountdown) * 100))}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {hasActiveBet ? '🎯 Bot bet registered for next round' : '⏳ Bot evaluating entry condition...'}
            </p>
          </div>
        )}

        {phase === 'FLYING' && (
          <div className="flex flex-col items-center select-none">
            <div className="text-5xl md:text-7xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_25px_rgba(225,29,72,0.6)]">
              {currentMultiplier.toFixed(2)}
              <span className="text-rose-500 text-3xl md:text-4xl ml-0.5">x</span>
            </div>

            {/* Auto-Cashout Notification if cashed out this round */}
            {hasCashedOut && profitWon !== null && cashedOutMultiplier !== null && (
              <div className="mt-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/60 rounded-full text-emerald-300 font-semibold text-xs md:text-sm flex items-center gap-2 animate-bounce">
                <span>💰 Cashed Out at {cashedOutMultiplier.toFixed(2)}x</span>
                <span className="text-emerald-200 font-bold">+${profitWon.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {phase === 'CRASHED' && (
          <div className="flex flex-col items-center animate-shake">
            <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-red-400 mb-1">
              Flew Away!
            </span>
            <div className="text-5xl md:text-6xl font-black font-mono tracking-tighter text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.7)]">
              {crashPoint.toFixed(2)}
              <span className="text-red-400 text-3xl ml-0.5">x</span>
            </div>
            <span className="text-xs text-slate-400 mt-2 font-mono">
              Waiting for next round sequence...
            </span>
          </div>
        )}
      </div>

      {/* Bottom Status Ticker */}
      <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
          <span>SPRIBE ENGINE DEMO</span>
        </div>
        <div className="text-slate-400">
          Target: <span className="text-emerald-400 font-bold">{targetMultiplier.toFixed(2)}x</span>
        </div>
      </div>
    </div>
  );
};
