/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Legacy emerald (kept so landing page is unaffected)
        primary: '#10B981',
        accent: '#059669',
        success: '#047857',
        surface: 'rgba(255,255,255,0.05)',
        // Synthetic Oracle palette
        oracle: {
          base: '#08090A',
          surface: '#0C0D11',
          surface2: '#12141C',
          violet: '#9D50FF',
          vivid: '#BD00FF',
          glass: 'rgba(18,20,28,0.4)',
          border: 'rgba(157,80,255,0.12)',
          success: '#B78AFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        float: 'float 20s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        marquee: 'marquee 40s linear infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 5s ease infinite',
        // Oracle animations
        'oracle-breathe': 'oracle-breathe 2.5s ease-in-out infinite',
        'oracle-pulse': 'oracle-pulse 2s ease-in-out infinite',
        'violet-ping': 'violet-ping 1.5s ease-in-out infinite',
      },
      boxShadow: {
        glow: '0 0 20px rgba(16,185,129,0.3), 0 0 60px rgba(5,150,105,0.1)',
        'glow-lg': '0 0 40px rgba(16,185,129,0.5), 0 0 80px rgba(5,150,105,0.2)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.4), 0 0 60px rgba(4,120,87,0.2)',
        // Oracle shadows
        'oracle': '0 0 30px rgba(157,80,255,0.1)',
        'oracle-lg': '0 0 60px rgba(157,80,255,0.2)',
        'oracle-btn': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      transitionTimingFunction: {
        oracle: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        oracle: '300ms',
      },
    },
  },
  plugins: [],
};
