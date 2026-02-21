import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      "#000000",
          surface: "#0d0d0d",
          card:    "#141414",
          border:  "#1f1f1f",
          muted:   "#2a2a2a",
        },
        accent: {
          cyan:    "#5EEAD4",
          teal:    "#2DD4BF",
          dim:     "#1a9e8f",
          green:   "#00ff87",
        },
        neon: {
          green:  "#5EEAD4",
          cyan:   "#5EEAD4",
          blue:   "#5EEAD4",
          purple: "#8b5cf6",
          amber:  "#ffa726",
          red:    "#ff3366",
          pink:   "#ec4899",
        },
      },
      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        mono:  ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow":    "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
        "glow":          "glow 2s ease-in-out infinite alternate",
        "gradient-x":    "gradient-x 6s ease infinite",
        "gradient-slow":  "gradient-x 15s ease infinite",
        "slide-up":      "slide-up 0.5s ease-out",
        "slide-right":   "slide-right 0.4s ease-out",
        "fade-in":       "fade-in 0.6s ease-out",
        "float":         "float 6s ease-in-out infinite",
        "shimmer":       "shimmer 2s linear infinite",
        "counter":       "counter-pop 0.3s ease-out",
        "ripple":        "ripple 1.5s ease-out infinite",
        "scan":          "scan 3s linear infinite",
        "grid-flow":     "grid-flow 20s linear infinite",
      },
      keyframes: {
        glow: {
          "0%":   { boxShadow: "0 0 5px rgba(35,247,221,0.15), 0 0 20px rgba(35,247,221,0.08)" },
          "100%": { boxShadow: "0 0 20px rgba(35,247,221,0.3), 0 0 60px rgba(35,247,221,0.12)" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right": {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "counter-pop": {
          "0%":   { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        ripple: {
          "0%":   { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        scan: {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "grid-flow": {
          "0%":   { transform: "translateY(0)" },
          "100%": { transform: "translateY(40px)" },
        },
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },
  plugins: [],
};

export default config;
