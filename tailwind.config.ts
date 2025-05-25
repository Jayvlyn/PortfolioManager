import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'blue-500/20': 'rgba(59, 130, 246, 0.2)',
        'blue-500/30': 'rgba(59, 130, 246, 0.3)',
        'gray-700/50': 'rgba(55, 65, 81, 0.5)',
        'gray-800/50': 'rgba(31, 41, 55, 0.5)',
        'red-500/20': 'rgba(239, 68, 68, 0.2)',
        'red-500/30': 'rgba(239, 68, 68, 0.3)',
        'white/10': 'rgba(255, 255, 255, 0.1)',
        'white/70': 'rgba(255, 255, 255, 0.7)',
        'white/90': 'rgba(255, 255, 255, 0.9)',
      },
    },
  },
  plugins: [],
}
export default config 