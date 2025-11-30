import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#65A30D",
        "background-light": "#f7f8f6",
        "background-dark": "#1a2210",
        "surface-light": "#ffffff",
        "surface-dark": "#334155",
        "text-light": "#1e293b",
        "text-dark": "#e2e8f0",
        "text-muted-light": "#64748b",
        "text-muted-dark": "#94a3b8",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
