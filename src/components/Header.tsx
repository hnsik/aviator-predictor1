import { useState } from 'react';
import { useApp } from '../context';
import { langLabels, langs, type Key } from '../lib/i18n';
import type { SourceStatus, View } from '../types';
import { ChartIcon, CloseIcon, GearIcon, HistoryIcon, HomeIcon, MenuIcon, PlaneIcon } from './icons';

interface Props {
  view: View;
  onNavigate: (v: View) => void;
  status: SourceStatus;
}

const NAV: { id: View; key: Key; Icon: typeof HomeIcon }[] = [
  { id: 'home', key: 'nav.home', Icon: HomeIcon },
  { id: 'analytics', key: 'nav.analytics', Icon: ChartIcon },
  { id: 'history', key: 'nav.history', Icon: HistoryIcon },
  { id: 'settings', key: 'nav.settings', Icon: GearIcon },
];

const STATUS_STYLE: Record<SourceStatus, { dot: string; key: Key; pulse?: boolean }> = {
  demo: { dot: 'bg-warn', key: 'sys.demo' },
  connecting: { dot: 'bg-warn', key: 'sys.connecting', pulse: true },
  online: { dot: 'bg-accent', key: 'sys.online' },
  offline: { dot: 'bg-brand', key: 'sys.offline' },
  error: { dot: 'bg-brand', key: 'sys.error' },
  unconfigured: { dot: 'bg-muted', key: 'sys.unconfigured' },
};

export function StatusPill({ status }: { status: SourceStatus }) {
  const { t } = useApp();
  const s = STATUS_STYLE[status];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted"
      role="status"
    >
      <span className={`h-2 w-2 rounded-full ${s.dot} ${s.pulse ? 'animate-pulseDot' : ''}`} />
      {t(s.key)}
    </span>
  );
}

export function LangSwitch({ className = '' }: { className?: string }) {
  const { settings, update } = useApp();
  return (
    <div className={`inline-flex rounded-lg border border-line bg-bg2 p-0.5 ${className}`} role="group" aria-label="Language">
      {langs.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => update({ lang: l })}
          aria-pressed={settings.lang === l}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            settings.lang === l ? 'bg-brand text-white shadow-glowRed' : 'text-muted hover:text-ink'
          }`}
        >
          {langLabels[l]}
        </button>
      ))}
    </div>
  );
}

export default function Header({ view, onNavigate, status }: Props) {
  const { t } = useApp();
  const [open, setOpen] = useState(false);

  const go = (v: View) => {
    onNavigate(v);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button type="button" onClick={() => go('home')} className="flex items-center gap-2.5 text-left" aria-label={t('brand')}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/15 text-brand shadow-glowRed">
            <PlaneIcon />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight">{t('brand')}</span>
            <span className="hidden text-[11px] text-muted sm:block">{t('sys.label')}</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map(({ id, key, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              aria-current={view === id ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                view === id ? 'bg-card text-ink shadow-soft' : 'text-muted hover:bg-card/60 hover:text-ink'
              }`}
            >
              <Icon width={16} height={16} className={view === id ? 'text-brand' : ''} />
              {t(key)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <StatusPill status={status} />
          </div>
          <LangSwitch className="hidden sm:inline-flex" />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-card md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? t('nav.close') : t('nav.menu')}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fadeUp border-t border-line bg-bg2 px-4 pb-4 pt-3 md:hidden">
          <div className="mb-3 flex items-center justify-between gap-2">
            <StatusPill status={status} />
            <LangSwitch className="sm:hidden" />
          </div>
          <nav className="grid gap-1" aria-label="Mobile">
            {NAV.map(({ id, key, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={view === id ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                  view === id ? 'bg-card text-ink' : 'text-muted'
                }`}
              >
                <Icon className={view === id ? 'text-brand' : ''} />
                {t(key)}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
