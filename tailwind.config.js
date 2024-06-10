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
        bg: "var(--tg-theme-bg-color,#181818)",
        "secondary-bg": "var(--tg-theme-secondary-bg-color,#0F0F0F)",
        "section-bg": "var(--tg-theme-section-bg-color,#0F0F0F)",
        hint: "var(--tg-theme-hint-color,#AAA)",
        text: "var(--tg-theme-text-color,#FFF)",
        subtitle: "var(--tg-theme-subtitle-text-color,#AAA)",
        accent: "var(--tg-theme-accent-text-color,#FF375F)",
      },
      keyframes: {
        "modal-appear": {
          "0%": {
            transform: "translateY(100%)",
          },
          "100%": {
            transform: "translateY(0%)",
          },
        },
      },
    },
  },
  plugins: [],
};
