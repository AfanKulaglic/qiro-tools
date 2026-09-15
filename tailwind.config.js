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
        // Warm-toned ink for the dark scheme — less harsh than pure zinc.
        ink: {
          950: '#1C1917', // warm black
          900: '#292524', // warm dark gray
          850: '#44403C', // warm medium
        },
        // Qiro signature: warm blue + earthy accents + pop warmth.
        accent: {
          blue: '#2781EC',      // primary signal — clean cobalt
          cyan: '#539BF0',      // secondary blue
          purple: '#1E6FD9',    // deeper blue
          green: '#22C55E',     // success
          yellow: '#FFEA8F',    // warm yellow
          // NEW WARMTH — earth & fire
          peach: '#FDE68A',     // soft peach-gold
          coral: '#FB7185',     // warm coral pop
          clay: '#E7B89C',      // terracotta clay
          sand: '#FDF4E3',      // warm sand
          sage: '#A8B5A0',      // muted sage green
        },
        primary: {
          DEFAULT: '#2781EC',
          2: '#FFEA8F',
          // warm variants
          warm: '#E7B89C',
        },
        secondary: {
          DEFAULT: '#539BF0',
          1: '#1E6FD9',
        },
        // Warmer neutrals — shift from cold zinc to warm stone.
        default: {
          50: '#FAFAF8',
          100: '#F5F4F0',
          200: '#E6E2DA',
          300: '#D6D0C6',
          400: '#A8A096',
          500: '#7A7268',
          600: '#5C554C',
          700: '#3F3A34',
          800: '#292520',
          900: '#1A1714',
        },
        // kept for backward compat
        mercury: '#E6E2DA',
      },
      fontFamily: {
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
        display: ['"Roboto Slab"', 'ui-serif', 'Georgia', 'serif'],
        serif: ['"Roboto Slab"', 'ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        lg: '0.375rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        '3xl': '1rem',
        '4xl': '1.25rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(39,129,236,0.16), 0 22px 55px -26px rgba(39,129,236,0.42)',
        'glow-soft': '0 14px 42px -26px rgba(39,129,236,0.5)',
        'glow-warm': '0 0 0 1px rgba(231,184,156,0.2), 0 22px 55px -22px rgba(231,184,156,0.35)',
        'glow-coral': '0 14px 42px -22px rgba(251,113,133,0.4)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 18px 50px -28px rgba(28,25,23,0.55)',
      },
      backgroundImage: {
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
        'grid-light':
          'linear-gradient(to right, rgba(28,25,23,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(28,25,23,0.04) 1px, transparent 1px)',
        'blueprint':
          'radial-gradient(rgba(226,232,240,0.07) 1px, transparent 1.4px)',
        // Warm noise texture
        noise: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        grid: '40px 40px',
        blueprint: '24px 24px',
        noise: '160px 160px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(-1.5deg)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -16px) scale(1.05)' },
          '66%': { transform: 'translate(-12px, 10px) scale(0.97)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(39,129,236,0.3)' },
          '50%': { boxShadow: '0 0 0 16px rgba(39,129,236,0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'morph-blob': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        shimmer: 'shimmer 2s infinite',
        'gradient-pan': 'gradient-pan 8s ease infinite',
        'morph-blob': 'morph-blob 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
