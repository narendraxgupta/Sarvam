import type { Config } from "tailwindcss";

const v = (name: string) =>
  `rgb(var(--${name}) / <alpha-value>)` as unknown as string;

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: v("bg"),
          surface: v("bg-surface"),
          elevated: v("bg-elevated"),
          sunken: v("bg-sunken"),
        },
        line: {
          DEFAULT: v("line"),
          strong: v("line-strong"),
          subtle: v("line-subtle"),
          bright: v("line-bright"),
        },
        ink: {
          DEFAULT: v("ink"),
          muted: v("ink-muted"),
          subtle: v("ink-subtle"),
          dim: v("ink-dim"),
        },
        accent: {
          DEFAULT: v("accent"),
          soft: v("accent-soft"),
          ring: v("accent-ring"),
          ink: v("accent-ink"),
        },
        ok: { DEFAULT: v("ok"), soft: v("ok-soft") },
        warn: { DEFAULT: v("warn"), soft: v("warn-soft") },
        danger: { DEFAULT: v("danger"), soft: v("danger-soft") },

        azure: v("accent"),
        amber: v("warn"),
        emerald: v("ok"),
        violet: v("accent"),
        ivory: { DEFAULT: v("ink"), soft: v("line-subtle") },
      },
      fontFamily: {
        sans: [
          '"Bricolage Grotesque"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          '"Bricolage Grotesque"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"IBM Plex Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
      },
      fontWeight: {
        thin: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        black: "800",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.02em" }],
      },
      letterSpacing: {
        tightish: "-0.011em",
        display: "-0.028em",
        "display-tight": "-0.04em",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "10px",
        xl: "14px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        elev: "0 1px 0 rgb(var(--highlight) / 0.05) inset, 0 24px 70px -32px rgb(0 0 0 / 0.35)",
        glow: "0 0 0 1px rgb(var(--line-strong) / 1)",
        "glow-accent":
          "0 0 0 1px rgb(var(--accent) / 0.3), 0 0 24px rgb(var(--accent) / 0.15)",
        "ring-soft": "0 0 0 1px rgb(var(--highlight) / 0.05) inset",
        "soft": "0 4px 24px -4px rgb(0 0 0 / 0.08)",
        "blue-glow": "0 0 40px -10px rgb(var(--accent) / 0.25)",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(ellipse at top, var(--tw-gradient-stops))",
      },
      keyframes: {
        "caret-blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgb(var(--ok) / 0.5)" },
          "100%": { boxShadow: "0 0 0 8px rgb(var(--ok) / 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.65" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.1s ease-in-out infinite",
        "fade-in": "fade-in 280ms ease-out both",
        "rise-in": "rise-in 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-ring": "pulse-ring 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2.4s linear infinite",
        breathe: "breathe 2.8s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.4s ease-in-out infinite",
        "slide-up": "slide-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scale-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
