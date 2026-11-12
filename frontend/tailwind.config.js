/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: { DEFAULT: '#FBFBF9', 50: '#FFFEFB', 100: '#FBFBF9', 200: '#F5F3EE' },
        charcoal: { DEFAULT: '#0B0F17', 50: '#1E293B', 100: '#0F1523', 900: '#070A0F' },
        champagne: { DEFAULT: '#D4AF37', light: '#E5C158', muted: '#C4A35A' },
        platinum: '#F8FAFC',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"IBM Plex Sans Arabic"', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(11,15,23,0.06), 0 4px 12px rgba(11,15,23,0.04)',
        elev: '0 8px 30px rgba(11,15,23,0.08)',
      },
    },
  },
  plugins: [],
}
