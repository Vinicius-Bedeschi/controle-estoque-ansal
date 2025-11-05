/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cores base para o modo CLARO
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        border: '#e2e8f0',

        // Cores base para o modo ESCURO
        darkBackground: '#0f172a',
        darkSurface: '#1e293b',
        darkText: '#f1f5f9',
        darkBorder: '#334155',
      },
    },
  },
  plugins: [],
};
