import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P): P => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...p,
});

export const PlaneIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 4 3 11l6 2.5L11.5 20l2.2-5.3L21 4Z" />
    <path d="m9 13.5 12-9.5" />
  </svg>
);
export const HomeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9.5h13V10" />
  </svg>
);
export const ChartIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="m7.5 15 4-4.5 3 3L19 8" />
  </svg>
);
export const HistoryIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3.5 4.5v4h4" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const GearIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const RefreshIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 11a8 8 0 0 0-14.3-4.3L4 8.5" />
    <path d="M4 4v4.5h4.5" />
    <path d="M4 13a8 8 0 0 0 14.3 4.3L20 15.5" />
    <path d="M20 20v-4.5h-4.5" />
  </svg>
);
export const WarnIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3.5 2.5 20h19L12 3.5Z" />
    <path d="M12 10v4.5M12 17.5v.1" />
  </svg>
);
export const InfoIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8v.1" />
  </svg>
);
export const ArrowIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Красный самолёт, нос вправо. Размер 100 x 50. */
export function PlaneShape() {
  return (
    <g>
      <path fill="#B82A38" d="M40 20 L58 2 L68 2 L58 20Z" />
      <path fill="#B82A38" d="M8 25 L4 10 L14 10 L22 20Z" />
      <path fill="#E83B4B" d="M8 25 Q8 20 20 20 L78 20 Q96 22 98 25 Q96 28 78 30 L20 30 Q8 30 8 25Z" />
      <path fill="#FF6B78" d="M24 21.5 L76 21.5 Q88 22.5 92 25 Q86 24 76 24 L24 24Z" opacity="0.55" />
      <path fill="#E83B4B" d="M40 30 L58 48 L68 48 L58 30Z" />
      <path fill="#E83B4B" d="M8 25 L4 40 L14 40 L22 30Z" />
      <ellipse cx="66" cy="23.5" rx="6" ry="2.6" fill="#1B1C24" opacity="0.85" />
      <rect x="96.5" y="16" width="3" height="18" rx="1.5" fill="#F2F2F5" opacity="0.9" />
    </g>
  );
}
