import { useApp } from '../context';
import { SOURCE_URL } from '../hooks/useRealSource';
import { LangSwitch } from './Header';
import { WarnIcon } from './icons';

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-md">
        <div className="text-sm font-semibold">{title}</div>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  const { t } = useApp();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3"
    >
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-accent shadow-glowGreen' : 'bg-line'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <span className="w-8 text-xs font-semibold text-muted">{checked ? t('set.on') : t('set.off')}</span>
    </button>
  );
}

export default function SettingsPanel() {
  const { t, settings, update, reset } = useApp();
  const seg = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${active ? 'bg-brand text-white shadow-glowRed' : 'text-muted hover:text-ink'}`;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">{t('set.title')}</h2>

      <section className="rounded-2xl border border-line bg-card px-4 shadow-soft sm:px-5">
        <Row title={t('set.window')} hint={t('set.windowHint')}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={300}
              step={10}
              value={settings.windowSize}
              onChange={(e) => update({ windowSize: Number(e.target.value) })}
              aria-label={t('set.window')}
              className="w-40 accent-[#E83B4B] sm:w-52"
            />
            <span className="tabular w-12 rounded-md border border-line bg-bg2 py-1 text-center text-sm font-semibold">{settings.windowSize}</span>
          </div>
        </Row>

        <Row title={t('set.language')}>
          <LangSwitch />
        </Row>

        <Row title={t('set.theme')}>
          <div className="inline-flex rounded-lg border border-line bg-bg2 p-0.5" role="group">
            <button type="button" className={seg(settings.theme === 'dark')} aria-pressed={settings.theme === 'dark'} onClick={() => update({ theme: 'dark' })}>
              {t('set.dark')}
            </button>
            <button type="button" className={seg(settings.theme === 'light')} aria-pressed={settings.theme === 'light'} onClick={() => update({ theme: 'light' })}>
              {t('set.light')}
            </button>
          </div>
        </Row>

        <Row title={t('set.animations')}>
          <Toggle checked={settings.animations} onChange={(v) => update({ animations: v })} label={t('set.animations')} />
        </Row>

        <Row title={t('set.demo')} hint={t('set.demoHint')}>
          <Toggle checked={settings.demo} onChange={(v) => update({ demo: v })} label={t('set.demo')} />
        </Row>

        <Row title={t('set.source')} hint={SOURCE_URL ? undefined : t('set.sourceNone')}>
          {SOURCE_URL ? (
            <div className="max-w-xs break-all rounded-md border border-line bg-bg2 px-2 py-1 text-xs text-muted">
              {t('set.sourceUrl')}: {SOURCE_URL}
            </div>
          ) : (
            <span className="rounded-full border border-line bg-bg2 px-3 py-1 text-xs font-semibold text-muted">{t('sys.unconfigured')}</span>
          )}
        </Row>
      </section>

      <section className="flex gap-3 rounded-2xl border border-warn/40 bg-warn/10 p-4 sm:p-5" role="note">
        <WarnIcon className="mt-0.5 shrink-0 text-warn" />
        <div>
          <div className="text-sm font-bold text-warn">{t('set.riskTitle')}</div>
          <p className="mt-1 text-sm leading-relaxed text-ink/90">{t('set.riskText')}</p>
        </div>
      </section>

      <button
        type="button"
        onClick={reset}
        className="rounded-lg border border-line bg-card px-4 py-2 text-sm font-semibold text-muted transition hover:border-brand hover:text-brand"
      >
        {t('set.reset')}
      </button>
    </div>
  );
}
