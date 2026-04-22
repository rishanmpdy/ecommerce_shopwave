/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind which files to scan for class names
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        surface: {
          DEFAULT: "#0f0f0f",
          card:    "#1a1a1a",
          border:  "#2a2a2a",
          hover:   "#252525",
        }
      },
      fontFamily: {
        display: ["'Clash Display'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      keyframes: {
        "slide-up": {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%":   { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)",    opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "cart-bounce": {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.3)" },
        },
      },
      animation: {
        "slide-up":    "slide-up 0.4s ease forwards",
        "fade-in":     "fade-in 0.3s ease forwards",
        "scale-in":    "scale-in 0.3s ease forwards",
        shimmer:       "shimmer 1.5s infinite linear",
        "cart-bounce": "cart-bounce 0.3s ease",
      },
    },
  },
  plugins: [],
};