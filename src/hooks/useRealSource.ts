import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataState, Round } from '../types';
import { validateRounds } from '../lib/stats';

export const SOURCE_URL: string = (import.meta.env.VITE_HISTORY_API_URL as string | undefined)?.trim() ?? '';
const POLL_MS = 15_000;
const TIMEOUT_MS = 8_000;

/**
 * Реальный источник истории. Подключение выполняется только если задан VITE_HISTORY_API_URL.
 * Без него никакие запросы не отправляются, а данные не выдумываются.
 */
export function useRealSource(active: boolean): DataState {
  const configured = SOURCE_URL.length > 0;
  const [rounds, setRounds] = useState<Round[]>([]);
  const [status, setStatus] = useState<DataState['status']>(configured ? 'connecting' : 'unconfigured');
  const [error, setError] = useState<string | null>(null);
  const [lastOk, setLastOk] = useState<number | null>(null);
  const [dropped, setDropped] = useState(0);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (!configured || busy.current) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus('offline');
      setError('offline');
      return;
    }
    busy.current = true;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(SOURCE_URL, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { rounds: valid, dropped: bad } = validateRounds(await res.json());
      setRounds(valid);
      setDropped(bad);
      setLastOk(Date.now());
      setError(null);
      setStatus('online');
    } catch (e) {
      const aborted = e instanceof DOMException && e.name === 'AbortError';
      setError(aborted ? 'timeout' : e instanceof Error ? e.message : 'unknown');
      setStatus(navigator.onLine === false ? 'offline' : 'error');
    } finally {
      clearTimeout(timer);
      busy.current = false;
    }
  }, [configured]);

  useEffect(() => {
    if (!active || !configured) return;
    refresh();
    const id = setInterval(refresh, POLL_MS);
    const onOnline = () => refresh();
    const onOffline = () => {
      setStatus('offline');
      setError('offline');
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      clearInterval(id);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [active, configured, refresh]);

  return { rounds, status, error, lastOk, dropped, refresh };
}
