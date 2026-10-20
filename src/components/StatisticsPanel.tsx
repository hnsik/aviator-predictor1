import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useApp } from '../context';
import { computeStats, fmt, histogram } from '../lib/stats';
import type { Round } from '../types';
import { InfoIcon } from './icons';

interface Props {
  rounds: Round[]; // окно анализа, по возрастанию id
  windowSize: number;
}

const pct = (v: number | null) => (v === null ? '—' : `${(v * 100).toFixed(1)}%`);
const num = (v: number | null) => (v === null ? '—' : fmt(v));

function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'red' | 'green' | 'purple' | 'blue' }) {
  const color = tone === 'red' ? 'text-brand' : tone === 'green' ? 'text-accent' : tone === 'purple' ? 'text-mid' : tone === 'blue' ? 'text-hi' : 'text-ink';
  return (
    <div className="animate-fadeUp rounded-2xl border border-line bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-accent/50">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className={`tabular mt-2 text-2xl font-extrabold sm:text-3xl ${color}`}>{value}</div>
    </div>
  );
}

export default function StatisticsPanel({ rounds, windowSize }: Props) {
  const { t, settings } = useApp();
  const dark = settings.theme === 'dark';
  const c = {
    grid: dark ? '#343541' : '#D6D9E2',
    axis: dark ? '#9295A5' : '#646878',
    tipBg: dark ? '#22232D' : '#FFFFFF',
    tipBorder: dark ? '#343541' : '#D6D9E2',
    text: dark ? '#FFFFFF' : '#101116',
  };
  const tooltipStyle = { background: c.tipBg, border: `1px solid ${c.tipBorder}`, borderRadius: 10, color: c.text, fontSize: 12 };

  const values = useMemo(() => rounds.map((r) => r.multiplier), [rounds]);
  const stats = useMemo(() => computeStats(values), [values]);
  const hist = useMemo(() => histogram(values), [values]);

  const windows = useMemo(() => {
    const raw = [Math.round(windowSize / 4), Math.round(windowSize / 2), windowSize].map((w) => Math.max(10, w));
    const unique = [...new Set(raw)].filter((w) => w <= Math.max(values.length, 10));
    return unique.map((w) => {
      const slice = values.slice(-w);
      const s = computeStats(slice);
      return { w, s };
    });
  }, [values, windowSize]);

  const trend = useMemo(() => rounds.map((r) => ({ id: r.id, m: r.multiplier })), [rounds]);
  const barColor = { low: '#E83B4B', mid: '#A855F7', hi: '#3B82F6' } as const;

  if (!stats.n) {
    return (
      <section className="rounded-2xl border border-dashed border-line bg-card p-10 text-center">
        <h2 className="text-lg font-bold">{t('stats.empty')}</h2>
        <p className="mt-1 text-sm text-muted">{t('stats.emptyHint')}</p>
      </section>
    );
  }

  const compareData = windows.map(({ w, s }) => ({
    name: String(w),
    '<2x': Number(((s.below2 ?? 0) * 100).toFixed(1)),
    '≥5x': Number(((s.atLeast5 ?? 0) * 100).toFixed(1)),
    '≥10x': Number(((s.atLeast10 ?? 0) * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">{t('stats.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('stats.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label={t('stats.n')} value={String(stats.n)} />
        <StatCard label={t('stats.mean')} value={num(stats.mean)} tone="green" />
        <StatCard label={t('stats.median')} value={num(stats.median)} tone="green" />
        <StatCard label={t('stats.below2')} value={pct(stats.below2)} tone="red" />
        <StatCard label={t('stats.above5')} value={pct(stats.atLeast5)} tone="purple" />
        <StatCard label={t('stats.above10')} value={pct(stats.atLeast10)} tone="blue" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-card p-4 shadow-soft sm:p-5">
          <h3 className="font-bold">{t('stats.dist')}</h3>
          <p className="text-xs text-muted">{t('stats.distHint')}</p>
          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hist.map((h) => ({ ...h, pct: Number((h.share * 100).toFixed(1)) }))} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" stroke={c.axis} tick={{ fill: c.axis, fontSize: 11 }} />
                <YAxis stroke={c.axis} tick={{ fill: c.axis, fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(146,149,165,0.12)' }} formatter={(v) => [`${v}%`, t('stats.share')]} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {hist.map((h) => (
                    <Cell key={h.label} fill={barColor[h.bucket]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-card p-4 shadow-soft sm:p-5">
          <h3 className="font-bold">{t('stats.trend')}</h3>
          <p className="text-xs text-muted">log scale</p>
          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid stroke={c.grid} strokeDasharray="3 3" />
                <XAxis dataKey="id" stroke={c.axis} tick={{ fill: c.axis, fontSize: 11 }} minTickGap={32} />
                <YAxis scale="log" domain={[1, 'auto']} allowDataOverflow stroke={c.axis} tick={{ fill: c.axis, fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [fmt(Number(v)), '']} labelFormatter={(l) => `#${l}`} />
                <Line type="monotone" dataKey="m" stroke="#24D98B" strokeWidth={2} dot={false} isAnimationActive={settings.animations} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-card p-4 shadow-soft sm:p-5">
        <h3 className="font-bold">{t('stats.compare')}</h3>
        <p className="text-xs text-muted">{t('stats.compareHint')}</p>

        <div className="mt-3 overflow-x-auto">
          <table className="tabular w-full min-w-[520px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-3 font-medium">{t('stats.window')}</th>
                <th className="py-2 pr-3 font-medium">{t('stats.rounds')}</th>
                <th className="py-2 pr-3 font-medium">{t('stats.mean')}</th>
                <th className="py-2 pr-3 font-medium">{t('stats.median')}</th>
                <th className="py-2 pr-3 font-medium">&lt;2x</th>
                <th className="py-2 pr-3 font-medium">≥5x</th>
                <th className="py-2 font-medium">≥10x</th>
              </tr>
            </thead>
            <tbody>
              {windows.map(({ w, s }) => (
                <tr key={w} className="border-b border-line/60 last:border-0">
                  <td className="py-2 pr-3 font-semibold">{w}</td>
                  <td className="py-2 pr-3">{s.n}</td>
                  <td className="py-2 pr-3">{num(s.mean)}</td>
                  <td className="py-2 pr-3">{num(s.median)}</td>
                  <td className="py-2 pr-3 text-brand">{pct(s.below2)}</td>
                  <td className="py-2 pr-3 text-mid">{pct(s.atLeast5)}</td>
                  <td className="py-2 text-hi">{pct(s.atLeast10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compareData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={c.axis} tick={{ fill: c.axis, fontSize: 11 }} />
              <YAxis stroke={c.axis} tick={{ fill: c.axis, fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(146,149,165,0.12)' }} formatter={(v) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 12, color: c.axis }} />
              <Bar dataKey="<2x" fill="#E83B4B" radius={[4, 4, 0, 0]} isAnimationActive={settings.animations} />
              <Bar dataKey="≥5x" fill="#A855F7" radius={[4, 4, 0, 0]} isAnimationActive={settings.animations} />
              <Bar dataKey="≥10x" fill="#3B82F6" radius={[4, 4, 0, 0]} isAnimationActive={settings.animations} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="flex gap-3 rounded-2xl border border-hi/30 bg-hi/5 p-4 text-sm leading-relaxed">
        <InfoIcon className="mt-0.5 shrink-0 text-hi" />
        <div>
          <div className="font-semibold">{t('stats.limitsTitle')}</div>
          <p className="mt-1 text-muted">{t('stats.limits')}</p>
        </div>
      </section>
    </div>
  );
}
