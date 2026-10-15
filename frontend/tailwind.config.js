/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fbf6f3",
          100: "#f4e6df",
          400: "#d57a5e",
          500: "#c45c3e",
          600: "#b04d32",
          700: "#8f3d28",
        },
        ink: "#161616",
        mist: "#f6f4f2",
      },
      fontFamily: {
        sans: ["Jost", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 18px 40px rgba(22, 22, 22, 0.08)",
      },
    },
  },
  plugins: [],
};
