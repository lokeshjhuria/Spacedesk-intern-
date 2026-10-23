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
          950: '#02040a',
          900: '#050a18',
          850: '#091024',
          800: '#0e1838',
          700: '#172754',
          600: '#23397d',
          500: '#3452aa'
        },
        cyber: {
          cyan: '#00f6ff',
          teal: '#00e5a3',
          purple: '#a855f7',
          violet: '#7c3aed',
          fuchsia: '#ec4899',
          amber: '#f59e0b',
          crimson: '#ef4444'
        },
        neon: {
          cyan: '#00f6ff',
          blue: '#38bdf8',
          purple: '#c084fc',
          pink: '#f472b6',
          gold: '#fbbf24',
          green: '#34d399',
          red: '#f87171'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif']
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 246, 255, 0.45)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.45)',
        'neon-gold': '0 0 20px rgba(251, 191, 36, 0.45)',
        'neon-green': '0 0 20px rgba(52, 211, 153, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'card-glow': '0 0 35px -5px rgba(0, 246, 255, 0.2)'
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'pulse-slow': 'pulseSlow 4s infinite ease-in-out',
        'float': 'float 4s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-border': 'glowBorder 3s linear infinite',
        'laser-sweep': 'laserSweep 3s ease-in-out infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.7', filter: 'drop-shadow(0 0 10px rgba(0,246,255,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 26px rgba(0,246,255,0.85))' }
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(0, 246, 255, 0.5)' },
          '50%': { borderColor: 'rgba(168, 85, 247, 0.65)' }
        },
        laserSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' }
        }
      }
    },
  },
  plugins: [],
}
