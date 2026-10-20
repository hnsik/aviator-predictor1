import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context';
import { randomDemoMultiplier } from '../lib/demo';
import { fmt } from '../lib/stats';
import type { Round } from '../types';
import { PlaneShape } from './icons';

type Phase = 'waiting' | 'running' | 'finished';

interface Props {
  demo: boolean;
  lastRound: Round | undefined;
  lastUpdate: number | null;
  onDemoRoundEnd: (m: number) => void;
}

const X0 = 60;
const X1 = 740;
const Y0 = 370;
const RISE = 290;
const WAIT_S = 3;
const FINISH_S = 2.6;

const point = (p: number) => ({ x: X0 + p * (X1 - X0), y: Y0 - Math.pow(p, 1.6) * RISE });
const angleAt = (p: number) => {
  const dx = X1 - X0;
  const dy = -1.6 * Math.pow(Math.max(p, 0.001), 0.6) * RISE;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};
const progressOf = (m: number) => {
  const l = Math.log(Math.max(m, 1));
  return Math.min(0.97, l / (l + 1.3));
};
const pathTo = (p: number, close = false) => {
  const steps = Math.max(2, Math.ceil(p * 48));
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const { x, y } = point((p * i) / steps);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  if (close) d += `L${point(p).x.toFixed(1)} ${Y0} L${X0} ${Y0} Z`;
  return d;
};
const durationFor = (c: number) => (c <= 1.01 ? 0.8 : Math.min(18, 1.5 + Math.log(c) * 3.2));

interface Frame {
  phase: Phase;
  m: number;
  p: number;
  sec: number; // секунд в текущей фазе
  target: number;
}

const STARS = Array.from({ length: 36 }, (_, i) => ({
  x: ((i * 163) % 790) + 5,
  y: ((i * 97) % 300) + 8,
  r: 0.6 + ((i * 7) % 5) / 6,
  d: (i % 9) * 0.35,
}));

export default function FlightDisplay({ demo, lastRound, lastUpdate, onDemoRoundEnd }: Props) {
  const { t, settings, locale } = useApp();
  const [frame, setFrame] = useState<Frame>({ phase: 'waiting', m: 1, p: 0, sec: 0, target: 2 });
  const endRef = useRef(onDemoRoundEnd);
  endRef.current = onDemoRoundEnd;
  const animations = settings.animations;

  // Симуляция раунда (только в демо-режиме).
  useEffect(() => {
    if (!demo) return;
    let raf = 0;
    let phase: Phase = 'waiting';
    let start = performance.now();
    let target = randomDemoMultiplier();
    let lastPaint = 0;
    let last: Frame = { phase, m: 1, p: 0, sec: 0, target };

    const loop = (now: number) => {
      const sec = (now - start) / 1000;
      let m = 1;
      let p = 0;
      if (phase === 'waiting') {
        if (sec >= WAIT_S) {
          phase = 'running';
          start = now;
        }
      } else if (phase === 'running') {
        const dur = durationFor(target);
        const f = Math.min(sec / dur, 1);
        m = Math.pow(target, f);
        p = progressOf(m);
        if (f >= 1) {
          phase = 'finished';
          start = now;
          m = target;
          endRef.current(target);
        }
      } else {
        m = target;
        p = progressOf(target);
        if (sec >= FINISH_S) {
          phase = 'waiting';
          start = now;
          target = randomDemoMultiplier();
          m = 1;
          p = 0;
        }
      }
      last = { phase, m, p, sec: (now - start) / 1000, target };
      const gap = animations ? 0 : 250;
      if (now - lastPaint >= gap) {
        lastPaint = now;
        setFrame(last);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [demo, animations]);

  // Реальный режим: показываем только последний раунд из источника.
  const view: Frame | null = useMemo(() => {
    if (demo) return frame;
    if (!lastRound) return null;
    return { phase: 'finished', m: lastRound.multiplier, p: progressOf(lastRound.multiplier), sec: 0, target: lastRound.multiplier };
  }, [demo, frame, lastRound]);

  const phase = view?.phase;
  const p = view?.p ?? 0;
  const exit = demo && phase === 'finished' ? Math.min(view!.sec / 1.1, 1) : 0;
  const planeP = p;
  const base = point(planeP);
  const planeX = base.x + exit * 260;
  const planeY = base.y - exit * 140;
  const planeAngle = angleAt(planeP) - exit * 8;
  const planeOpacity = demo && phase === 'finished' ? 1 - exit : phase === 'waiting' ? 0.95 : 1;

  const pill =
    phase === 'running'
      ? { text: t('flight.running'), cls: 'border-accent/40 bg-accent/10 text-accent', dot: 'bg-accent animate-pulseDot' }
      : phase === 'finished'
        ? { text: t('flight.finished'), cls: 'border-brand/40 bg-brand/10 text-brand', dot: 'bg-brand' }
        : phase === 'waiting'
          ? { text: t('flight.waiting'), cls: 'border-warn/40 bg-warn/10 text-warn', dot: 'bg-warn animate-pulseDot' }
          : { text: t('flight.nodata'), cls: 'border-line bg-bg2 text-muted', dot: 'bg-muted' };

  const time = lastUpdate ? new Date(lastUpdate).toLocaleTimeString(locale) : '—';
  const multColor =
    phase === 'running' ? 'text-ink glow-text-green' : phase === 'finished' ? 'text-brand glow-text-red' : 'text-muted';

  return (
    <section
      aria-label="Flight"
      className="relative overflow-hidden rounded-2xl border border-line bg-[#0B0C12] shadow-soft"
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[2/1]">
        <svg viewBox="0 0 800 420" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Flight trajectory">
          <defs>
            <radialGradient id="sky" cx="50%" cy="110%" r="95%">
              <stop offset="0%" stopColor="#3A1420" />
              <stop offset="45%" stopColor="#15161F" />
              <stop offset="100%" stopColor="#0B0C12" />
            </radialGradient>
            <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E83B4B" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#E83B4B" stopOpacity="0" />
            </linearGradient>
            <clipPath id="revealClip">
              <rect className="reveal-rect animate-reveal" x="0" y="0" width="800" height="420" />
            </clipPath>
          </defs>
          <rect width="800" height="420" fill="url(#sky)" />
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" className="animate-twinkle" style={{ animationDelay: `${s.d}s` }} />
          ))}
          {[1, 2, 3, 4].map((i) => (
            <line key={i} x1={0} x2={800} y1={Y0 - i * 75} y2={Y0 - i * 75} stroke="#fff" strokeOpacity="0.05" />
          ))}
          <line x1={X0} x2={X1 + 30} y1={Y0} y2={Y0} stroke="#fff" strokeOpacity="0.18" />

          <g clipPath="url(#revealClip)">
            <path d={pathTo(1)} fill="none" stroke="#9295A5" strokeOpacity="0.55" strokeWidth="2" className="route-dash animate-dash" />
          </g>

          {p > 0.002 && (
            <>
              <path d={pathTo(p, true)} fill="url(#area)" />
              <path d={pathTo(p)} fill="none" stroke="#E83B4B" strokeWidth="4" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px rgba(232,59,75,.8))' }} />
            </>
          )}

          <g
            transform={`translate(${planeX.toFixed(1)} ${planeY.toFixed(1)}) rotate(${planeAngle.toFixed(1)})`}
            opacity={planeOpacity}
          >
            <g className={phase === 'waiting' && animations ? 'animate-floaty' : ''}>
              <g transform="translate(-60 -17) scale(0.78)" className="plane-glow">
                <PlaneShape />
              </g>
            </g>
          </g>
        </svg>

        {/* Бейджи */}
        <div className="absolute left-3 top-3 flex max-w-[70%] flex-col items-start gap-1.5 sm:left-4 sm:top-4">
          {demo && (
            <span className="rounded-md border border-warn/50 bg-warn/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-warn sm:text-xs">
              {t('flight.demoBadge')}
            </span>
          )}
          {!demo && lastRound && (
            <span className="rounded-md border border-line bg-bg2/80 px-2 py-1 text-[10px] font-medium text-muted sm:text-xs">
              {t('flight.lastRound')} · #{lastRound.id}
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${pill.cls}`}>
            <span className={`h-2 w-2 rounded-full ${pill.dot}`} />
            {pill.text}
          </span>
        </div>

        {/* Коэффициент */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center px-4 text-center">
          {view ? (
            <div>
              {phase === 'waiting' ? (
                <>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted sm:text-sm">{t('flight.waiting')}</div>
                  <div className="tabular mt-1 text-3xl font-extrabold text-warn sm:text-5xl">
                    {t('flight.nextIn', { s: Math.max(0, WAIT_S - view.sec).toFixed(1) })}
                  </div>
                </>
              ) : (
                <>
                  {phase === 'finished' && demo && (
                    <div className="text-xs font-semibold uppercase tracking-widest text-brand sm:text-sm">{t('flight.flewAway')}</div>
                  )}
                  <div className={`tabular text-6xl font-extrabold leading-none sm:text-8xl ${multColor}`}>{fmt(view.m)}</div>
                </>
              )}
            </div>
          ) : (
            <div className="max-w-sm rounded-xl border border-line bg-bg2/80 p-4 backdrop-blur">
              <div className="text-sm font-semibold">{t('flight.noFeed')}</div>
              <p className="mt-1 text-xs text-muted">{t('flight.noFeedHint')}</p>
            </div>
          )}
        </div>

        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-3 text-[11px] text-muted sm:bottom-3 sm:left-4 sm:right-4">
          <span>
            {t('flight.lastUpdate')}: <span className="tabular text-ink/80">{time}</span>
          </span>
          {demo && <span className="hidden text-right sm:block">{t('flight.demoNote')}</span>}
        </div>
      </div>
    </section>
  );
}
