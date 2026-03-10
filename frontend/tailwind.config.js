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
        primary: '#7C3AED',
        accent: '#06B6D4',
        success: '#10B981',
        surface: 'rgba(255,255,255,0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        float: 'float 20s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        marquee: 'marquee 40s linear infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 5s ease infinite',
      },
      boxShadow: {
        glow: '0 0 20px rgba(124,58,237,0.3), 0 0 60px rgba(6,182,212,0.1)',
        'glow-lg': '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(6,182,212,0.2)',
        'glow-cyan': '0 0 20px rgba(6,182,212,0.3), 0 0 60px rgba(16,185,129,0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
