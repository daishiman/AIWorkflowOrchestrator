/**
 * 共有スタイルユーティリティ
 * コンポーネント間で一貫したスタイルパターンを提供
 */

/**
 * グラスモーフィズムのベーススタイル
 */
export const glassStyles = {
  base: "bg-white/5 backdrop-blur-sm border border-white/10",
  hover: "hover:bg-white/10 hover:border-white/20",
  active: "active:bg-white/15",
} as const;

/**
 * フォーカスリングスタイル
 */
export const focusRingStyles = {
  default:
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900",
  primary: "focus:ring-blue-500",
  danger: "focus:ring-red-500",
  white: "focus:ring-white/20",
} as const;

/**
 * トランジションスタイル
 */
export const transitionStyles = {
  default: "transition-all duration-200",
  fast: "transition-all duration-150",
  slow: "transition-all duration-300",
} as const;

/**
 * サイズバリアント型定義
 */
export type SizeVariant = "sm" | "md" | "lg";

/**
 * カラーバリアント型定義
 */
export type ColorVariant = "default" | "success" | "warning" | "error" | "info";

/**
 * カラーパレット
 */
export const colorPalette = {
  default: {
    bg: "bg-gray-600",
    text: "text-white",
    icon: "text-blue-400",
  },
  success: {
    bg: "bg-green-500",
    text: "text-green-400",
    icon: "text-green-400",
  },
  warning: {
    bg: "bg-orange-400",
    text: "text-orange-400",
    icon: "text-orange-400",
  },
  error: {
    bg: "bg-red-500",
    text: "text-red-400",
    icon: "text-red-400",
  },
  info: {
    bg: "bg-blue-500",
    text: "text-blue-400",
    icon: "text-blue-400",
  },
} as const;

/**
 * 無効状態のスタイル
 */
export const disabledStyles = "opacity-50 cursor-not-allowed";
