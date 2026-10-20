import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang, Settings } from './types';
import { dict, langs, locales, type Key } from './lib/i18n';

const STORAGE_KEY = 'avp.settings.v1';

export const defaultSettings: Settings = {
  windowSize: 100,
  lang: 'ru',
  theme: 'dark',
  animations: true,
  demo: true,
};

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    const p = JSON.parse(raw) as Partial<Settings>;
    return {
      windowSize: typeof p.windowSize === 'number' && p.windowSize >= 10 && p.windowSize <= 500 ? p.windowSize : defaultSettings.windowSize,
      lang: langs.includes(p.lang as Lang) ? (p.lang as Lang) : defaultSettings.lang,
      theme: p.theme === 'light' ? 'light' : 'dark',
      animations: typeof p.animations === 'boolean' ? p.animations : true,
      demo: typeof p.demo === 'boolean' ? p.demo : true,
    };
  } catch {
    return defaultSettings;
  }
}

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
  locale: string;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* хранилище недоступно, настройки живут только в сессии */
    }
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.lang = settings.lang === 'pt' ? 'pt-BR' : settings.lang;
    root.classList.toggle('no-anim', !settings.animations);
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', settings.theme === 'dark' ? '#101116' : '#F4F5F8');
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings(defaultSettings), []);

  const t = useCallback(
    (key: Key, vars?: Record<string, string | number>) => {
      let s = dict[settings.lang][key] ?? dict.ru[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      return s;
    },
    [settings.lang],
  );

  const value = useMemo(
    () => ({ settings, update, reset, t, locale: locales[settings.lang] }),
    [settings, update, reset, t],
  );
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
