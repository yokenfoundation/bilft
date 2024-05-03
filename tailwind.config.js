// @ts-check
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./source/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter Variable", "Inter", "sans-serif"],
      },
      colors: {
        accent: "#FF375F",
      },
    },
  },
  plugins: [],
};
