import { Suspense, lazy, useCallback, useMemo, useState } from 'react';
import { useApp } from './context';
import Header from './components/Header';
import FlightDisplay from './components/FlightDisplay';
import PredictionCard from './components/PredictionCard';
import RoundHistory from './components/RoundHistory';
import SettingsPanel from './components/SettingsPanel';
import Footer from './components/Footer';
import { WarnIcon } from './components/icons';
import { useRealSource } from './hooks/useRealSource';
import { generateDemoRounds } from './lib/demo';
import type { DataState, Round, SourceStatus, View } from './types';

const StatisticsPanel = lazy(() => import('./components/StatisticsPanel'));

const MAX_KEPT = 600;

function Loading() {
  const { t } = useApp();
  return (
    <div className="grid h-48 place-items-center text-sm text-muted" role="status">
      <span className="inline-flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
        {t('common.loading')}
      </span>
    </div>
  );
}

function SourceBanner({ data }: { data: DataState }) {
  const { t, locale } = useApp();
  const failed = data.status === 'error' || data.status === 'offline';
  if (!failed && data.dropped === 0) return null;
  const last = data.lastOk ? new Date(data.lastOk).toLocaleString(locale) : t('err.never');
  return (
    <div
      role="alert"
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
        failed ? 'border-brand/50 bg-brand/10' : 'border-warn/40 bg-warn/10'
      }`}
    >
      <div className="flex items-start gap-2">
        <WarnIcon width={18} height={18} className={failed ? 'mt-0.5 text-brand' : 'mt-0.5 text-warn'} />
        <div>
          <div className="font-semibold">
            {failed ? (data.status === 'offline' ? t('err.offlineBanner') : t('err.title')) : t('err.dropped', { n: data.dropped })}
          </div>
          {failed && data.error && data.status === 'error' && <div className="text-xs text-muted">{data.error}</div>}
          <div className="text-xs text-muted">
            {t('err.lastOk')}: {last}
          </div>
        </div>
      </div>
      {failed && (
        <button
          type="button"
          onClick={() => void data.refresh()}
          className="rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold hover:border-accent hover:text-accent"
        >
          {t('err.retry')}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const { settings, t } = useApp();
  const [view, setView] = useState<View>('home');
  const [demoRounds, setDemoRounds] = useState<Round[]>(() => generateDemoRounds(300));
  const real = useRealSource(!settings.demo);

  const addDemoRound = useCallback((m: number) => {
    setDemoRounds((prev) => {
      const last = prev[prev.length - 1];
      const next: Round = { id: (last?.id ?? 48199) + 1, multiplier: m, ts: Date.now() };
      return [...prev, next].slice(-MAX_KEPT);
    });
  }, []);

  const data: DataState = useMemo(
    () =>
      settings.demo
        ? {
            rounds: demoRounds,
            status: 'demo' as SourceStatus,
            error: null,
            lastOk: demoRounds[demoRounds.length - 1]?.ts ?? null,
            dropped: 0,
            refresh: async () => {},
          }
        : real,
    [settings.demo, demoRounds, real],
  );

  const windowed = useMemo(() => data.rounds.slice(-settings.windowSize), [data.rounds, settings.windowSize]);
  const values = useMemo(() => windowed.map((r) => r.multiplier), [windowed]);
  const lastRound = data.rounds[data.rounds.length - 1];

  return (
    <div className="flex min-h-screen flex-col">
      <Header view={view} onNavigate={setView} status={data.status} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 sm:py-6">
        <SourceBanner data={data} />
        {!settings.demo && data.status !== 'online' && data.rounds.length === 0 && data.status !== 'connecting' && (
          <p className="mb-4 text-xs text-muted">{t('err.demoOffHint')}</p>
        )}

        {view === 'home' && (
          <div className="animate-fadeUp space-y-5">
            <FlightDisplay
              demo={settings.demo}
              lastRound={settings.demo ? undefined : lastRound}
              lastUpdate={data.lastOk}
              onDemoRoundEnd={addDemoRound}
            />
            <div className="grid gap-5 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <PredictionCard values={values} demo={settings.demo} onRefresh={data.refresh} />
              </div>
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
                  <h2 className="text-lg font-bold">{t('stats.title')}</h2>
                  <QuickStats values={values} />
                  <button
                    type="button"
                    onClick={() => setView('analytics')}
                    className="mt-4 w-full rounded-lg border border-line bg-bg2 px-3 py-2 text-sm font-semibold transition hover:border-accent hover:text-accent"
                  >
                    {t('hist.open')}
                  </button>
                </div>
              </div>
            </div>
            <RoundHistory rounds={data.rounds} variant="strip" onOpenStats={() => setView('history')} />
          </div>
        )}

        {view === 'analytics' && (
          <div className="animate-fadeUp">
            <Suspense fallback={<Loading />}>
              <StatisticsPanel rounds={windowed} windowSize={settings.windowSize} />
            </Suspense>
          </div>
        )}

        {view === 'history' && (
          <div className="animate-fadeUp">
            <RoundHistory rounds={data.rounds} variant="full" />
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-fadeUp">
            <SettingsPanel />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

import { computeStats, fmt } from './lib/stats';

function QuickStats({ values }: { values: number[] }) {
  const { t } = useApp();
  const s = useMemo(() => computeStats(values), [values]);
  if (!s.n) return <p className="mt-3 text-sm text-muted">{t('stats.emptyHint')}</p>;
  const pct = (v: number | null) => (v === null ? '—' : `${(v * 100).toFixed(1)}%`);
  const rows: [string, string][] = [
    [t('stats.n'), String(s.n)],
    [t('stats.mean'), s.mean === null ? '—' : fmt(s.mean)],
    [t('stats.median'), s.median === null ? '—' : fmt(s.median)],
    [t('stats.below2'), pct(s.below2)],
    [t('stats.above5'), pct(s.atLeast5)],
    [t('stats.above10'), pct(s.atLeast10)],
  ];
  return (
    <dl className="mt-3 divide-y divide-line text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between py-2">
          <dt className="text-muted">{k}</dt>
          <dd className="tabular font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
