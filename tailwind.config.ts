import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mobile UI Theme: Royal Periwinkle Purple & Pure White Foundation
        midnight: {
          950: "#F5F3FE", // Soft luminous lilac-white canvas background
          900: "#FFFFFF", // Crisp 3D Clay Card surface (pure white)
          850: "#FAF9FF", // Elevated soft lilac card container
          800: "#F0EDFD", // Interactive pill / tile background
          700: "#E3DCF8", // Soft periwinkle border
          600: "#C8BDF4", // Active specular rim & divider
          500: "#9889F6", // Medium periwinkle
          400: "#7A68EE", // Bright purple
          300: "#6653E6", // Primary royal purple (from photo)
          200: "#5542D0", // Deep purple (from photo)
          100: "#3E2FA8", // Dark indigo
          50: "#1E194B",  // Deepest indigo text
        },
        brand: {
          // Primary Vibrant Purple (from photo)
          purple: "#6653E6",
          violet: "#6653E6",
          "violet-light": "#7D6DF2",
          "violet-dark": "#5542D0",
          enterprise: "#7D6DF2",

          // 4 Action Tiles from Photo: Mint, Coral Pink, Periwinkle, Aqua
          mint: "#38D39F", // Transfer Green
          cyan: "#38D39F",
          "cyan-light": "#58E8AC",
          "cyan-dark": "#25B579",
          teal: "#38D39F",

          pink: "#FF7675", // Pay Bill Coral Pink & Bar Chart
          coral: "#FF7675",
          lavender: "#9B88F7", // Shop Tile Purple
          aqua: "#74B9FF", // Saving Tile Sky Blue

          // Background & Text Neutrals
          white: "#FFFFFF",
          canvas: "#F5F3FE",
          surface: "#FFFFFF",
          heading: "#1E194B",
          body: "#47436B",
          muted: "#7E79A2",
          gray: "#7E79A2",
          "gray-light": "#E8E4F8",
          "gray-dark": "#47436B",

          amber: "#FDCB6E",
          emerald: "#38D39F",
          rose: "#FF7675",
        },
        clay: {
          purple: "#6653E6",
          mint: "#38D39F",
          pink: "#FF7675",
          aqua: "#74B9FF",
          lavender: "#9B88F7",
          coral: "#FF7675",
          surface: "#FFFFFF",
          card: "#FFFFFF",
          canvas: "#F5F3FE",
          light: "#FAF9FF",
        },
        odoo: {
          purple: "#6653E6",
          enterprise: "#7D6DF2",
          teal: "#38D39F",
          gray: "#7E79A2",
          tag1: "#FF7675", // 1: Coral Red
          tag2: "#FDCB6E", // 2: Soft Amber
          tag3: "#FFEAA7", // 3: Pastel Yellow
          tag4: "#74B9FF", // 4: Clay Aqua
          tag5: "#5542D0", // 5: Deep Purple
          tag6: "#FF8FA3", // 6: Flamingo Pink
          tag7: "#6C5CE7", // 7: Royal Purple
          tag8: "#38D39F", // 8: Mint Green
          tag9: "#FD79A8", // 9: Rose Pink
          tag10: "#00B894", // 10: Emerald Green
          tag11: "#6653E6", // 11: Periwinkle Purple
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "inset 2px 3px 6px rgba(255, 255, 255, 0.38), inset -3px -4px 8px rgba(30, 15, 80, 0.35), 0 10px 20px -3px rgba(108, 92, 231, 0.5)",
        "glow-cyan": "inset 2px 3px 6px rgba(255, 255, 255, 0.45), inset -3px -4px 8px rgba(10, 75, 45, 0.35), 0 10px 20px -3px rgba(56, 217, 150, 0.45)",
        "glow-purple": "inset 2px 3px 6px rgba(255, 255, 255, 0.38), inset -3px -4px 8px rgba(30, 15, 80, 0.35), 0 10px 20px -3px rgba(108, 92, 231, 0.5)",
        "glow-teal": "inset 2px 3px 6px rgba(255, 255, 255, 0.45), inset -3px -4px 8px rgba(10, 75, 45, 0.35), 0 10px 20px -3px rgba(56, 217, 150, 0.45)",
        clay: "inset 3px 4px 8px rgba(255, 255, 255, 0.2), inset -4px -6px 12px rgba(14, 10, 40, 0.45), 0 14px 28px -6px rgba(18, 12, 48, 0.55)",
        "clay-sm": "inset 2px 2px 5px rgba(255, 255, 255, 0.22), inset -2px -3px 6px rgba(14, 10, 40, 0.4), 0 6px 14px -2px rgba(18, 12, 48, 0.4)",
        "clay-pink": "inset 2px 3px 6px rgba(255, 255, 255, 0.45), inset -3px -4px 8px rgba(120, 30, 50, 0.3), 0 10px 20px -3px rgba(255, 143, 163, 0.45)",
      },
      borderRadius: {
        xl: "1.15rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
