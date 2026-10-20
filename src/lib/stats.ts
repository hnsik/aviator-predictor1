import type { Bucket, Round } from '../types';

export const MIN_ROUNDS_FOR_RANGE = 30;

export const bucketOf = (m: number): Bucket => (m < 2 ? 'low' : m < 10 ? 'mid' : 'hi');

export const fmt = (m: number) => `${m.toFixed(2)}x`;

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return NaN;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1];
  return next !== undefined ? sorted[base] + rest * (next - sorted[base]) : sorted[base];
}

export interface Stats {
  n: number;
  mean: number | null;
  median: number | null;
  below2: number | null;
  atLeast5: number | null;
  atLeast10: number | null;
  min: number | null;
  max: number | null;
}

export function computeStats(values: number[]): Stats {
  const n = values.length;
  if (!n) {
    return { n: 0, mean: null, median: null, below2: null, atLeast5: null, atLeast10: null, min: null, max: null };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((s, v) => s + v, 0);
  const share = (pred: (v: number) => boolean) => values.filter(pred).length / n;
  return {
    n,
    mean: sum / n,
    median: quantile(sorted, 0.5),
    below2: share((v) => v < 2),
    atLeast5: share((v) => v >= 5),
    atLeast10: share((v) => v >= 10),
    min: sorted[0],
    max: sorted[n - 1],
  };
}

export const HIST_BINS: { label: string; from: number; to: number }[] = [
  { label: '1–1.5', from: 1, to: 1.5 },
  { label: '1.5–2', from: 1.5, to: 2 },
  { label: '2–3', from: 2, to: 3 },
  { label: '3–5', from: 3, to: 5 },
  { label: '5–10', from: 5, to: 10 },
  { label: '10–20', from: 10, to: 20 },
  { label: '20+', from: 20, to: Infinity },
];

export function histogram(values: number[]) {
  const n = values.length;
  return HIST_BINS.map((b) => {
    const count = values.filter((v) => v >= b.from && v < b.to).length;
    return { label: b.label, count, share: n ? count / n : 0, bucket: bucketOf(b.from) };
  });
}

export interface RangeEstimate {
  low: number;
  high: number;
  median: number;
  n: number;
  lowShare: number;
}

/** Описательный интервал 25–75% по выборке. Это не прогноз. */
export function describeRange(values: number[], minN = MIN_ROUNDS_FOR_RANGE): RangeEstimate | null {
  if (values.length < minN) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return {
    low: quantile(sorted, 0.25),
    high: quantile(sorted, 0.75),
    median: quantile(sorted, 0.5),
    n: values.length,
    lowShare: values.filter((v) => v < 2).length / values.length,
  };
}

export type Level = 'low' | 'medium' | 'high';

export function riskFromHistory(lowShare: number): Level {
  if (lowShare >= 0.55) return 'high';
  if (lowShare >= 0.45) return 'medium';
  return 'low';
}

/** Проверка ответа внешнего источника. Некорректные записи отбрасываются и считаются. */
export function validateRounds(raw: unknown): { rounds: Round[]; dropped: number } {
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { rounds?: unknown }).rounds)
      ? ((raw as { rounds: unknown[] }).rounds)
      : [];
  const out: Round[] = [];
  const seen = new Set<number>();
  let dropped = 0;
  list.forEach((item, idx) => {
    const r = item as Partial<Round> | null;
    const m = Number(r?.multiplier);
    if (!r || !Number.isFinite(m) || m < 1 || m > 1_000_000) {
      dropped++;
      return;
    }
    const id = Number.isFinite(Number(r.id)) ? Number(r.id) : idx;
    if (seen.has(id)) {
      dropped++;
      return;
    }
    seen.add(id);
    const ts = Number.isFinite(Number(r.ts)) ? Number(r.ts) : 0;
    out.push({ id, multiplier: m, ts });
  });
  out.sort((a, b) => a.id - b.id);
  return { rounds: out, dropped };
}
