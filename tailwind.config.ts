import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        novotel: {
          primary: "#171E52",        // Novotel Space Cadet
          deep: "#0F1155",           // Blue Zodiac
          electric: "#1E22AA",       // Persian Blue
          luxury: "#C5A880",         // Brushed Champagne Gold
          canvas: "#F8F9FC",         // Porcelain Canvas
          card: "#FFFFFF",
          muted: "#E2E5F0",
          text: "#171E52",
          secondary: "#5E6482",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(23, 30, 82, 0.12), 0 4px 6px -2px rgba(23, 30, 82, 0.04)",
        gold: "0 8px 24px -6px rgba(197, 168, 128, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
