/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#070d1e',
          800: '#0c1633',
          700: '#14234d',
          600: '#1e3575'
        },
        neon: {
          cyan: '#00f6ff',
          blue: '#3b82f6',
          purple: '#a855f7',
          pink: '#ec4899',
          gold: '#f59e0b',
          green: '#10b981',
          red: '#ef4444'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif']
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 246, 255, 0.4)',
        'neon-purple': '0 0 15px rgba(168, 85, 247, 0.4)',
        'neon-gold': '0 0 15px rgba(245, 158, 11, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 8px rgba(0,246,255,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 20px rgba(0,246,255,0.8))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
}
