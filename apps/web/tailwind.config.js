/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        polar: {
          bg: '#080E1A',
          surface: '#0F1A2E',
          card: '#152035',
          border: '#1E3050',
          accent: '#00D4FF',
          'accent-dim': '#0099BB',
          amber: '#F59E0B',
          critical: '#EF4444',
          success: '#10B981',
          muted: '#64748B',
          text: '#E2E8F0',
          'text-dim': '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'polar-gradient': 'linear-gradient(135deg, #080E1A 0%, #0F1A2E 50%, #081624 100%)',
        'accent-glow': 'radial-gradient(ellipse at center, rgba(0,212,255,0.15) 0%, transparent 70%)',
        'critical-glow': 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'aurora': 'aurora 8s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        aurora: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'polar': '0 4px 24px rgba(0,0,0,0.4)',
        'accent': '0 0 20px rgba(0,212,255,0.3)',
        'critical': '0 0 20px rgba(239,68,68,0.4)',
        'card': '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};
