/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'fadeIn': 'fadeIn 0.4s ease-out forwards',
        'slideDown': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'messageSlide': 'messageSlide 0.25s cubic-bezier(0.215, 0.610, 0.355, 1) forwards',
        'scaleUp': 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 7s ease-in-out infinite',
        'float-delayed': 'float 9s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'glowPulse': 'glowPulse 2.4s ease-in-out infinite',
        'caretBlink': 'caretBlink 1s step-end infinite',
        'toastIn': 'toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toastOut': 'toastOut 0.25s ease-in forwards',
        'riseIn': 'riseIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'dotBounce': 'dotBounce 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        messageSlide: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(18px, -24px) scale(1.05)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 0 0 currentColor' },
          '50%': { opacity: '1', boxShadow: '0 0 6px 1px currentColor' },
        },
        caretBlink: {
          '0%, 45%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        toastIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        toastOut: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(6px) scale(0.96)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dotBounce: {
          '0%, 80%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '40%': { transform: 'translateY(-4px)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
};