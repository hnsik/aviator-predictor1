import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context';
import { MIN_ROUNDS_FOR_RANGE, describeRange, fmt, riskFromHistory, type Level } from '../lib/stats';
import { InfoIcon, RefreshIcon, WarnIcon } from './icons';

interface Props {
  values: number[];
  demo: boolean;
  onRefresh: () => Promise<void>;
}

const LEVEL_STYLE: Record<Level, string> = {
  low: 'border-accent/40 bg-accent/10 text-accent',
  medium: 'border-warn/40 bg-warn/10 text-warn',
  high: 'border-brand/40 bg-brand/10 text-brand',
};

export default function PredictionCard({ values, demo, onRefresh }: Props) {
  const { t, locale } = useApp();
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const estimate = useMemo(() => describeRange(values), [values]);

  useEffect(() => {
    if (estimate && generatedAt === null) setGeneratedAt(Date.now());
  }, [estimate, generatedAt]);

  const refresh = async () => {
    setLoading(true);
    try {
      await Promise.all([onRefresh(), new Promise((r) => setTimeout(r, 600))]);
    } finally {
      if (mounted.current) {
        setGeneratedAt(Date.now());
        setLoading(false);
      }
    }
  };

  const risk = estimate ? riskFromHistory(estimate.lowShare) : null;

  return (
    <section aria-label={t('pred.title')} className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 shadow-soft transition-colors hover:border-brand/40">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-bold">{t('pred.title')}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/40 bg-warn/10 px-2.5 py-1 text-[11px] font-semibold text-warn">
          <WarnIcon width={13} height={13} />
          {t('pred.badge')}
        </span>
      </div>

      <div className={`mt-4 flex-1 transition-opacity ${loading ? 'opacity-40' : 'opacity-100'}`}>
        {estimate && risk ? (
          <div className="animate-fadeUp space-y-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">{t('pred.range')}</div>
              <div className="tabular mt-1 text-3xl font-extrabold sm:text-4xl">
                <span className="text-brand">{fmt(estimate.low)}</span>
                <span className="mx-2 text-muted">–</span>
                <span className="text-accent">{fmt(estimate.high)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{t('pred.rangeHint')}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-bg2 p-3">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{t('pred.uncertainty')}</span>
                  <span className="font-semibold text-brand">{t('level.high')}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-warn to-brand" />
                </div>
                <p className="mt-2 text-[11px] leading-snug text-muted">{t('pred.uncertaintyText')}</p>
              </div>
              <div className="rounded-xl border border-line bg-bg2 p-3">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{t('pred.risk')}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${LEVEL_STYLE[risk]}`}>
                    {t(`level.${risk}` as const)}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-muted">{t('pred.riskHint')}</p>
              </div>
            </div>

            <div className="flex gap-2 rounded-xl border border-line bg-bg2 p-3 text-xs leading-relaxed text-muted">
              <InfoIcon width={16} height={16} className="mt-0.5 shrink-0 text-hi" />
              <p>{t(demo ? 'pred.explainDemo' : 'pred.explainReal', { n: estimate.n })}</p>
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-[180px] place-items-center rounded-xl border border-dashed border-line bg-bg2 p-6 text-center">
            <div>
              <div className="text-base font-semibold">{t('pred.insufficient')}</div>
              <p className="mt-1 text-xs text-muted">{t('pred.insufficientHint', { n: MIN_ROUNDS_FOR_RANGE, have: values.length })}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted">
          {t('pred.generated')}:{' '}
          <span className="tabular text-ink/80">{generatedAt && estimate ? new Date(generatedAt).toLocaleTimeString(locale) : '—'}</span>
        </span>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-glowRed transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          <RefreshIcon width={16} height={16} className={loading ? 'animate-spin' : ''} />
          {loading ? t('pred.refreshing') : t('pred.refresh')}
        </button>
      </div>
    </section>
  );
}
