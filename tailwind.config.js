/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './public/static/**/*.{js,html}',
  ],
  theme: {
    extend: {
      colors: {
        'ks-navy': '#070d1f',
        'ks-navy2': '#0d1632',
        'ks-deep': '#040814',
        'ks-cyan': '#00d4ff',
        'ks-cyan-soft': '#7ee0f5',
        'ks-aqua': '#22d3ee',
        'ks-glow': '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'Noto Sans KR', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
