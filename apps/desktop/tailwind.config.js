/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/renderer/**/*.{js,ts,jsx,tsx,html}"],
  darkMode: "class",
  theme: {
    extend: {
      // Colors - Semantic tokens
      colors: {
        // macOS System Colors
        macos: {
          blue: "#0a84ff",
          green: "#30d158",
          orange: "#ff9f0a",
          red: "#ff453a",
          yellow: "#ffd60a",
          pink: "#ff375f",
          purple: "#bf5af2",
          teal: "#64d2ff",
          indigo: "#5e5ce6",
        },
        // Glass morphism
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          light: "rgba(255, 255, 255, 0.05)",
          medium: "rgba(255, 255, 255, 0.15)",
          heavy: "rgba(255, 255, 255, 0.2)",
        },
      },
      // Font Family
      fontFamily: {
        sans: ["Inter", "Noto Sans JP", "Hiragino Sans", "sans-serif"],
        mono: [
          "JetBrains Mono",
          "Source Code Pro",
          "Noto Sans Mono",
          "monospace",
        ],
      },
      // Spacing
      spacing: {
        4.5: "18px",
        13: "52px",
        15: "60px",
        18: "72px",
      },
      // Border Radius
      borderRadius: {
        window: "10px",
      },
      // Box Shadow
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-subtle": "0 4px 16px 0 rgba(0, 0, 0, 0.2)",
      },
      // Backdrop Blur
      backdropBlur: {
        xs: "2px",
      },
      // Animation
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "fade-out": "fadeOut 0.2s ease-in",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "scale-out": "scaleOut 0.15s ease-in",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        scaleOut: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(0.95)", opacity: "0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      // Transition Duration
      transitionDuration: {
        instant: "0ms",
        fast: "100ms",
        normal: "300ms",
        slow: "500ms",
      },
      // Transition Timing Function
      transitionTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "ease-out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [],
};
