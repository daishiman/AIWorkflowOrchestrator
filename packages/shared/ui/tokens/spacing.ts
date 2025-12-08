/**
 * Design Tokens - Spacing
 * 8pxグリッドシステムに基づくスペーシング定義
 */

// Primitive Spacing Tokens (based on 8px grid)
export const spacing = {
  0: "0px",
  0.5: "2px", // 微細な隙間（ボーダー内側）
  1: "4px", // アイコンとテキストの間隔
  2: "8px", // コンパクトな内部パディング
  3: "12px", // 小要素間のギャップ
  4: "16px", // 標準パディング、要素間隔
  5: "20px",
  6: "24px", // セクション内のグループ間隔
  8: "32px", // カード・パネルの内部パディング
  10: "40px",
  12: "48px", // セクション間のマージン
  16: "64px", // ページセクション間の大きな間隔
  20: "80px",
  24: "96px",
} as const;

// Semantic Spacing Tokens
export const semanticSpacing = {
  // Component internal padding
  button: {
    paddingX: spacing[4],
    paddingY: spacing[2],
    paddingXLg: spacing[6],
    paddingYLg: spacing[3],
  },
  input: {
    paddingX: spacing[4],
    paddingY: spacing[3],
  },
  card: {
    padding: spacing[6],
    paddingLg: spacing[8],
  },
  // Gap between elements
  gap: {
    icon: spacing[1], // アイコンとテキスト間
    inline: spacing[2], // インライン要素間
    stack: spacing[4], // スタック要素間
    section: spacing[6], // セクション内
    page: spacing[12], // ページセクション間
  },
  // Page layout
  page: {
    paddingMobile: spacing[4],
    paddingDesktop: spacing[8],
  },
} as const;

export type Spacing = typeof spacing;
export type SemanticSpacing = typeof semanticSpacing;
