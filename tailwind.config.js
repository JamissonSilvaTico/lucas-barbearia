/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./{components,context,hooks,pages}/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#B8860B",
        "brand-secondary": "#D4AF37",
        "dark-1": "#121212",
        "dark-2": "#1E1E1E",
        "dark-3": "#2C2C2C",
        "light-1": "#FFFFFF",
        "light-2": "#F3F4F6",
        "light-3": "#E5E7EB",
      },
    },
  },
  plugins: [],
};
