/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14213D',
        steel: '#4A5A73',
        paper: '#F4F6F8',
        line: '#D5DBE3',
        signal: '#F5B800',
        'signal-deep': '#8A6700',
        teal: '#0E7C66',
        sky: '#1F5FA8',
        brick: '#B23A2B',
      },
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
