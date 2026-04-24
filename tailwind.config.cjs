/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        primary: "#050505",
        surface: "#0a0a0a",
        card: "#111111",
        "border-subtle": "#1a1a1a",
        "border-light": "#222222",
        secondary: "#888888",
        muted: "#555555",
        "white-100": "#f3f3f3",
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0px 20px 60px -15px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(255, 255, 255, 0.05)",
      },
      screens: {
        xs: "450px",
      },
    },
  },
  plugins: [],
};
