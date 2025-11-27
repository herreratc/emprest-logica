/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "logica-deep-purple": "#4a0e73",
        "logica-purple": "#6a1b9a",
        "logica-lilac": "#c3aedc",
        "logica-light-lilac": "#f3e8ff",
        "logica-rose": "#e91e63"
      }
    }
  },
  plugins: []
};
