/**
 * Design Tokens - Typography
 * タイポグラフィトークン定義
 */

// Font Family
export const fontFamily = {
  sans: ["Inter", "Noto Sans JP", "Hiragino Sans", "sans-serif"],
  mono: ["JetBrains Mono", "Source Code Pro", "Noto Sans Mono", "monospace"],
} as const;

// Font Size Scale
export const fontSize = {
  xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
  sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
  base: ["1rem", { lineHeight: "1.5rem" }], // 16px
  lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
  xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
  "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
  "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
  "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
} as const;

// Font Weight
export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

// Line Height
export const lineHeight = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.75", // 日本語本文推奨
  loose: "2",
} as const;

// Letter Spacing
export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em", // 見出し
  normal: "0",
  wide: "0.025em", // 本文、UI要素
  wider: "0.05em",
  widest: "0.1em",
} as const;

// Semantic Typography
export const typography = {
  // Headings
  h1: {
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.tight,
  },
  h2: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.tight,
  },
  h3: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.snug,
  },
  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
    lineHeight: lineHeight.snug,
  },
  // Body
  body: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeight.normal,
  },
  // UI
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeight.normal,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    letterSpacing: letterSpacing.wide,
    lineHeight: lineHeight.normal,
  },
  // Code
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
  },
} as const;

export type FontFamily = typeof fontFamily;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type LineHeight = typeof lineHeight;
export type LetterSpacing = typeof letterSpacing;
export type Typography = typeof typography;
