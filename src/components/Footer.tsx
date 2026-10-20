import { useApp } from '../context';

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="mt-10 border-t border-line bg-bg2">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs leading-relaxed text-muted sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <p className="font-medium text-ink/90">{t('footer.disclaimer')}</p>
          <p>{t('footer.data')}</p>
          <p>{t('footer.noAffil')}</p>
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/50 text-xs font-bold text-brand">
          {t('footer.age')}
        </span>
      </div>
    </footer>
  );
}
