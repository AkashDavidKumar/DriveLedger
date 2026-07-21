/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a",
        secondary: "#ffffff",
        accent: "#10b981",
        success: "#22c55e",
        warning: "#f97316",
        danger: "#ef4444",
      }
    },
  },
  plugins: [],
}
