/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Essentio custom spacing scale: 1 unit = 4px.
      // Without this, gap-26.25 = 26.25rem (420px), gap-y-42.5 = 42.5rem (680px),
      // lg:py-37.5 = 600px etc., which is ~4× too large and breaks every layout.
      spacing: {
        '7.5': '1.875rem',     // 30px
        '10': '2.5rem',        // 40px
        '12.5': '3.125rem',    // 50px
        '15': '3.75rem',       // 60px
        '17.5': '4.375rem',    // 70px
        '20': '5rem',          // 80px
        '22.5': '5.625rem',    // 90px
        '23.5': '5.875rem',    // 94px — icon-circle size
        '25': '6.25rem',       // 100px
        '28.5': '7.125rem',    // 285px — auto-rows for bento
        '28.75': '7.1875rem',  // 287.5px — alternative bento row
        '29': '7.25rem',       // 290px — bento row
        '26.25': '6.5625rem',  // 105px
        '30': '7.5rem',        // 120px
        '33.75': '8.4375rem',  // 135px
        '37.5': '9.375rem',    // 150px
        '42.5': '10.625rem',   // 170px
        '50': '12.5rem',       // 200px
        '55': '13.75rem',      // 220px
        '75': '18.75rem',      // 300px
        '114': '28.5rem',      // 456px
        '162': '40.5rem',      // 648px
      },
      colors: {
        // Essentio foundation — light/white body. Dark tokens kept only for the
        // few intentional dark accent blocks; values softened to ink-charcoal.
        ink: {
          950: '#18181B', // zinc-900 — darkest accent block
          900: '#27272A', // zinc-800 — panel
          850: '#3F3F46', // zinc-700 — raised surface
        },
        // Essentio brand palette: cobalt blue + warm yellow.
        // Token names kept so existing gradients/usages shift without touching
        // every file.
        accent: {
          blue: '#2781EC', // primary signal — essentio cobalt blue
          cyan: '#539BF0', // secondary blue (mid gradient stop)
          purple: '#1E6FD9', // deeper blue (end gradient stop)
          green: '#22C55E', // success / live indicator
          yellow: '#FFEA8F', // warm yellow — pop accent (cards, highlights)
        },
        // Essentio semantic aliases.
        primary: {
          DEFAULT: '#2781EC',
          2: '#FFEA8F', // yellow accent — Essentio pop colour
        },
        secondary: {
          DEFAULT: '#539BF0',
          1: '#1E6FD9', // deeper hover blue
        },
        // Default neutrals — Essentio surfaces + text tokens.
        default: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
        // Mercury silver — primary typographic metal (dark blocks only).
        mercury: '#E4E4E7',
      },
      fontFamily: {
        // Essentio body face — Inria Sans.
        sans: [
          '"Inria Sans"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Essentio heading face — Roboto Slab (slab-serif display).
        display: ['"Roboto Slab"', 'ui-serif', 'Georgia', 'serif'],
        serif: ['"Roboto Slab"', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        // Crisp mono for code-like data: short links, file sizes, counts.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      // Tighter, more intentional radii (less "everything is a pill").
      borderRadius: {
        lg: '0.375rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
        '4xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(99,102,241,0.16), 0 22px 55px -26px rgba(99,102,241,0.42)',
        'glow-soft': '0 14px 42px -26px rgba(99,102,241,0.5)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 50px -28px rgba(0,0,0,0.55)',
      },
      backgroundImage: {
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'grid-light':
          'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
        // Blueprint dot-matrix workbench (engineer-chic).
        'blueprint':
          'radial-gradient(rgba(226,232,240,0.07) 1px, transparent 1.4px)',
      },
      backgroundSize: {
        grid: '40px 40px',
        blueprint: '24px 24px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
      },
    },
  },
  plugins: [],
}
