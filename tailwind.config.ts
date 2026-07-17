import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "oklch(var(--color-background) / <alpha-value>)",
        foreground: "oklch(var(--color-foreground) / <alpha-value>)",
        surface: "oklch(var(--color-surface) / <alpha-value>)",
        muted: "oklch(var(--color-muted) / <alpha-value>)",
        border: "oklch(var(--color-border) / <alpha-value>)",
        accent: "oklch(var(--color-accent) / <alpha-value>)",
        success: "oklch(var(--color-success) / <alpha-value>)",
        warning: "oklch(var(--color-warning) / <alpha-value>)",
        danger: "oklch(var(--color-danger) / <alpha-value>)",
      },
      borderRadius: {
        panel: "0.5rem",
      },
      boxShadow: {
        panel: "0 1px 2px oklch(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
