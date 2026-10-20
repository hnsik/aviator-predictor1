import { useMemo, useState } from 'react';
import { useApp } from '../context';
import { bucketOf, fmt } from '../lib/stats';
import type { Bucket, Round } from '../types';
import { ArrowIcon } from './icons';

type Filter = 'all' | Bucket;

interface Props {
  rounds: Round[]; // по возрастанию id
  variant: 'strip' | 'full';
  onOpenStats?: () => void;
}

const BUCKET_STYLE: Record<Bucket, string> = {
  low: 'border-brand/50 bg-brand/10 text-brand',
  mid: 'border-mid/50 bg-mid/10 text-mid',
  hi: 'border-hi/50 bg-hi/10 text-hi',
};

export function RoundChip({ round, index = 0 }: { round: Round; index?: number }) {
  const { t } = useApp();
  const b = bucketOf(round.multiplier);
  return (
    <div
      title={`${t('hist.round')} #${round.id}: ${fmt(round.multiplier)}`}
      style={{ animationDelay: `${Math.min(index * 18, 360)}ms` }}
      className={`animate-pop flex shrink-0 flex-col items-center rounded-lg border px-3 py-1.5 transition hover:-translate-y-0.5 hover:brightness-125 ${BUCKET_STYLE[b]}`}
    >
      <span className="tabular text-sm font-bold">{fmt(round.multiplier)}</span>
      <span className="tabular text-[10px] opacity-70">#{round.id}</span>
    </div>
  );
}

export default function RoundHistory({ rounds, variant, onOpenStats }: Props) {
  const { t } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [limit, setLimit] = useState(60);

  const lo = min.trim() === '' ? null : Number(min);
  const hi = max.trim() === '' ? null : Number(max);

  const filtered = useMemo(() => {
    return [...rounds]
      .reverse()
      .filter((r) => (filter === 'all' ? true : bucketOf(r.multiplier) === filter))
      .filter((r) => (lo !== null && Number.isFinite(lo) ? r.multiplier >= lo : true))
      .filter((r) => (hi !== null && Number.isFinite(hi) ? r.multiplier <= hi : true));
  }, [rounds, filter, lo, hi]);

  const counts = useMemo(() => {
    const c = { all: rounds.length, low: 0, mid: 0, hi: 0 };
    for (const r of rounds) c[bucketOf(r.multiplier)]++;
    return c;
  }, [rounds]);

  const chips: { id: Filter; label: string; cls: string }[] = [
    { id: 'all', label: t('hist.all'), cls: 'border-line text-ink' },
    { id: 'low', label: t('hist.low'), cls: 'border-brand/60 text-brand' },
    { id: 'mid', label: t('hist.mid'), cls: 'border-mid/60 text-mid' },
    { id: 'hi', label: t('hist.hi'), cls: 'border-hi/60 text-hi' },
  ];

  const full = variant === 'full';
  const shown = full ? filtered.slice(0, limit) : filtered.slice(0, 40);
  const customActive = min !== '' || max !== '';

  return (
    <section aria-label={t('hist.title')} className="rounded-2xl border border-line bg-card p-4 shadow-soft sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{full ? t('hist.fullTitle') : t('hist.title')}</h2>
        {!full && onOpenStats && (
          <button
            type="button"
            onClick={onOpenStats}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg2 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
          >
            {t('hist.open')}
            <ArrowIcon width={14} height={14} />
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setFilter(c.id);
              setLimit(60);
            }}
            aria-pressed={filter === c.id}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${c.cls} ${
              filter === c.id ? 'bg-bg2 shadow-soft ring-1 ring-current' : 'opacity-70 hover:opacity-100'
            }`}
          >
            {c.label} <span className="tabular opacity-70">{counts[c.id]}</span>
          </button>
        ))}
      </div>

      {full && (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <span className="text-xs font-medium text-muted">{t('hist.range')}</span>
          <label className="text-xs text-muted">
            {t('hist.min')}
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step={0.1}
              value={min}
              onChange={(e) => setMin(e.target.value)}
              className="tabular ml-2 w-24 rounded-md border border-line bg-bg2 px-2 py-1 text-sm text-ink"
            />
          </label>
          <label className="text-xs text-muted">
            {t('hist.max')}
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step={0.1}
              value={max}
              onChange={(e) => setMax(e.target.value)}
              className="tabular ml-2 w-24 rounded-md border border-line bg-bg2 px-2 py-1 text-sm text-ink"
            />
          </label>
          {customActive && (
            <button
              type="button"
              onClick={() => {
                setMin('');
                setMax('');
              }}
              className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-muted hover:text-ink"
            >
              {t('hist.reset')}
            </button>
          )}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line bg-bg2 p-6 text-center">
          <div className="text-sm font-semibold">{t('hist.empty')}</div>
          <p className="mt-1 text-xs text-muted">{t('hist.emptyHint')}</p>
        </div>
      ) : full ? (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
            {shown.map((r, i) => (
              <RoundChip key={r.id} round={r} index={i} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
            <span>{t('hist.shown', { a: shown.length, b: filtered.length })}</span>
            {shown.length < filtered.length && (
              <button
                type="button"
                onClick={() => setLimit((l) => l + 60)}
                className="rounded-lg border border-line bg-bg2 px-3 py-1.5 font-semibold text-ink hover:border-accent hover:text-accent"
              >
                {t('hist.more')}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="scroll-thin mt-4 flex gap-2 overflow-x-auto pb-2">
          {shown.map((r, i) => (
            <RoundChip key={r.id} round={r} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
