/**
 * AgentView 共通アニメーション定数
 * 各コンポーネントで使用するトランジション・インタラクションのTailwindクラスを集約
 */

/** トランジション定数（Tailwindクラス文字列） */
export const transitions = {
  /** ホバー: 200ms ease */
  hover: "transition-transform duration-200 ease",
  /** タップ: 100-150ms ease-in */
  tap: "transition-transform duration-100 ease-in",
  /** スライドイン: 300ms ease-out */
  slideIn: "transition-transform duration-300 ease-out",
  /** スライドアウト: 200ms ease-in */
  slideOut: "transition-transform duration-200 ease-in",
  /** 色変化: 200ms ease */
  colorFade: "transition-colors duration-200 ease",
  /** 全プロパティ: 200ms ease */
  all: "transition-all duration-200 ease",
} as const;
