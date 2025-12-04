import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        label: {
          red: "#EF4444",
          orange: "#F97316",
          amber: "#F59E0B",
          yellow: "#EAB308",
          lime: "#84CC16",
          green: "#22C55E",
          emerald: "#10B981",
          teal: "#14B8A6",
          cyan: "#06B6D4",
          sky: "#0EA5E9",
          blue: "#3B82F6",
          indigo: "#6366F1",
          violet: "#8B5CF6",
          purple: "#A855F7",
          fuchsia: "#D946EF",
          pink: "#EC4899",
          rose: "#F43F5E",
          slate: "#64748B",
        },
      },
    },
  },
  plugins: [],
};

export default config;
