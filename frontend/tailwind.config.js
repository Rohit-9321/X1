/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#5B3BF5', 50:'#f0edfe', 100:'#e0dafd', 500:'#5B3BF5', 600:'#4829e0', 700:'#3a1fc7' },
        accent:   { DEFAULT: '#00D4AA', 500:'#00D4AA', 600:'#00b899' },
        surface:  { DEFAULT: '#F5F4F0', dark:'#0F0F14' },
        ink:      { DEFAULT: '#0A0A0F' },
        danger:   { DEFAULT: '#EF4444' },
        warning:  { DEFAULT: '#F59E0B' },
        success:  { DEFAULT: '#10B981' },
      },
      fontFamily: {
        sans:    ['Space Grotesk', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 16px rgba(0,0,0,0.06)',
        glow: '0 0 32px rgba(91,59,245,0.25)',
      },
    },
  },
  plugins: [],
};
