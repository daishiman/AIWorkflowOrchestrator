/**
 * AgentView 共通スタイル定数
 * 8pxグリッドスペーシングとコンテナレイアウトを定数化
 */

/** 8px グリッドスペーシング（Tailwind クラス文字列） */
export const spacing = {
  /** 24px = 8px x 3 */
  sectionGap: "gap-6",
  /** 16px = 8px x 2 */
  chipGap: "gap-4",
  /** 24px */
  containerPadding: "p-6",
  /** 12px = 8px x 1.5 */
  sectionHeader: "mb-3",
} as const;

/** コンポーネント共通スタイル */
export const containerStyles = {
  maxWidth: "max-w-[600px]",
  centerLayout: "flex flex-col items-center",
} as const;

/** インタラクティブ要素の共通スタイル */
export const interactiveStyles = {
  /** 閉じる/停止ボタンの共通ホバー */
  iconButton:
    "p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors duration-200",
  /** カード/アイテムのホバー */
  cardHover: "cursor-pointer transition-colors duration-200",
} as const;
