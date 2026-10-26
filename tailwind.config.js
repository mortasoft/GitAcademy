/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        git: {
          orange: '#F05032',
          red: '#DE4C36',
          dark: '#1F2328',
          branch1: '#3B82F6',
          branch2: '#10B981',
          branch3: '#F59E0B',
          branch4: '#EC4899',
          branch5: '#8B5CF6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
