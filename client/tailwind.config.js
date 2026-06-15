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
        primary: {
          DEFAULT: '#0B7A61', // Rich Deep Teal
          emerald: '#10B981', // Vibrant Emerald Green
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber Gold
        },
        darkBg: {
          DEFAULT: '#050807', // Carbon Emerald Deep
          card: '#0C1411', // Dark Forest Slate
          input: '#12201B', // Dark input field
        },
        lightBg: {
          DEFAULT: '#F7FCFA', // Clean soft minty white
          card: '#ffffff',
          input: '#F0F6F3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
