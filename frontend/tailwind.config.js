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
        primary: {
          DEFAULT: '#7C3AED',
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        accent: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          violet: '#7C3AED',
        },
        surface: {
          DEFAULT: '#0A0A0F',
          card: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.10)',
        },
        dark: {
          DEFAULT: '#030014',
          50: '#0A0A0F',
          100: '#111118',
          200: '#1a1a2e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 50%, #10B981 100%)',
        'gradient-text': 'linear-gradient(135deg, #7C3AED, #06B6D4, #10B981)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-slow': 'float 30s ease-in-out infinite',
        'float-delayed': 'float 25s ease-in-out infinite 5s',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 5s ease infinite',
        'fade-in': 'fade-in 0.5s ease forwards',
        'fade-in-up': 'fade-in-up 0.6s ease forwards',
        'scale-in': 'scale-in 0.4s ease forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'connecting-line': 'connecting-line 2s ease forwards',
        'counter': 'counter 2s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.5s ease forwards',
        'toast-enter': 'toast-enter 0.3s ease forwards',
        'toast-exit': 'toast-exit 0.3s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(30px, -30px) scale(1.05)' },
          '50%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '75%': { transform: 'translate(20px, 30px) scale(1.02)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.3), 0 0 60px rgba(6,182,212,0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(6,182,212,0.2)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(124, 58, 237, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(124, 58, 237, 0)' },
        },
        'connecting-line': {
          from: { strokeDashoffset: '500' },
          to: { strokeDashoffset: '0' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-enter': {
          from: { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-exit': {
          from: { opacity: '1', transform: 'translateY(0) scale(1)' },
          to: { opacity: '0', transform: 'translateY(-20px) scale(0.95)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 58, 237, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)',
        'glow-lg': '0 0 40px rgba(124, 58, 237, 0.4), 0 0 80px rgba(6, 182, 212, 0.15)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 48px rgba(0,0,0,0.6)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
