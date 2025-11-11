/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "logica-deep-purple": "#491a40",
        "logica-purple": "#61105c",
        "logica-lilac": "#bc9bbb",
        "logica-light-lilac": "#ebdcf9",
        "logica-rose": "#b42a98"
      }
    }
  },
  plugins: []
};
