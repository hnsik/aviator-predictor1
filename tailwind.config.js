/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        bg2: v('bg2'),
        card: v('card'),
        line: v('line'),
        ink: v('text'),
        muted: v('muted'),
        brand: '#E83B4B',
        accent: '#24D98B',
        mid: '#A855F7',
        hi: '#3B82F6',
        warn: '#F5B53D',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glowRed: '0 0 24px rgba(232,59,75,0.35)',
        glowGreen: '0 0 24px rgba(36,217,139,0.30)',
        soft: '0 8px 30px rgba(0,0,0,0.25)',
      },
      keyframes: {
        pop: {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.92)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dash: {
          to: { strokeDashoffset: '-28' },
        },
        reveal: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.15' },
          '50%': { opacity: '0.9' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
      },
      animation: {
        pop: 'pop 0.35s ease-out both',
        fadeUp: 'fadeUp 0.45s ease-out both',
        dash: 'dash 1.1s linear infinite',
        reveal: 'reveal 1.1s 0.35s cubic-bezier(.4,0,.2,1) both',
        twinkle: 'twinkle 3s ease-in-out infinite',
        floaty: 'floaty 3s ease-in-out infinite',
        pulseDot: 'pulseDot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
