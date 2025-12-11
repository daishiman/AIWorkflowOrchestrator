/**
 * MarkdownRenderer コンポーネントの型定義
 */

export interface MarkdownRendererProps {
  /** Markdown文字列 */
  content: string;
  /** 追加CSSクラス */
  className?: string;
  /** HTML許可（デフォルト: false） */
  allowHtml?: boolean;
  /** シンタックスハイライト有効（デフォルト: true） */
  syntaxHighlight?: boolean;
  /** テストID */
  "data-testid"?: string;
}
