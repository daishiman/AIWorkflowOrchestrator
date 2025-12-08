/**
 * Design Tokens - Effects
 * Spatial Design System エフェクト定義
 */

// Border Radius
export const borderRadius = {
  none: "0px",
  sm: "4px",
  DEFAULT: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
  full: "9999px",
  // macOS specific
  window: "10px", // macOSウィンドウ角丸
} as const;

// Box Shadow
export const boxShadow = {
  none: "none",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  // Glass morphism shadows
  glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
  glassSubtle: "0 4px 16px 0 rgba(0, 0, 0, 0.2)",
} as const;

// Backdrop Blur (Glass morphism)
export const backdropBlur = {
  none: "blur(0)",
  sm: "blur(4px)",
  DEFAULT: "blur(8px)",
  md: "blur(12px)",
  lg: "blur(16px)",
  xl: "blur(24px)",
  "2xl": "blur(40px)",
  "3xl": "blur(64px)",
} as const;

// Opacity
export const opacity = {
  0: "0",
  5: "0.05",
  10: "0.1",
  20: "0.2",
  25: "0.25",
  30: "0.3",
  40: "0.4",
  50: "0.5",
  60: "0.6",
  70: "0.7",
  75: "0.75",
  80: "0.8",
  90: "0.9",
  95: "0.95",
  100: "1",
} as const;

// Transition Duration
export const transitionDuration = {
  instant: "0ms",
  fast: "100ms",
  DEFAULT: "200ms",
  normal: "300ms",
  slow: "500ms",
  // Apple HIG compliant
  emphasis: "400ms",
} as const;

// Transition Timing Function
export const transitionTimingFunction = {
  DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
  linear: "linear",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)", // Apple HIG推奨
  "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  // macOS specific
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
} as const;

// Glass Morphism Presets
export const glassMorphism = {
  light: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: backdropBlur.md,
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  medium: {
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: backdropBlur.lg,
    border: "1px solid rgba(255, 255, 255, 0.15)",
  },
  heavy: {
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: backdropBlur.xl,
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
} as const;

export type BorderRadius = typeof borderRadius;
export type BoxShadow = typeof boxShadow;
export type BackdropBlur = typeof backdropBlur;
export type Opacity = typeof opacity;
export type TransitionDuration = typeof transitionDuration;
export type TransitionTimingFunction = typeof transitionTimingFunction;
export type GlassMorphism = typeof glassMorphism;
