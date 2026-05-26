/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#06111f',
          panel: '#0a1929',
          border: '#1a3a5c',
          cyan: '#22d3ee',
          blue: '#3b82f6',
          glow: '#06b6d4',
          text: '#e0f2fe',
          muted: '#64748b',
          accent: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'typing': 'typing 1.5s steps(20) infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(34, 211, 238, 0.6)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 40px rgba(34, 211, 238, 0.3)',
        'glow-lg': '0 0 80px rgba(34, 211, 238, 0.4)',
        'glow-accent': '0 0 40px rgba(245, 158, 11, 0.3)',
      }
    },
  },
  plugins: [],
}
