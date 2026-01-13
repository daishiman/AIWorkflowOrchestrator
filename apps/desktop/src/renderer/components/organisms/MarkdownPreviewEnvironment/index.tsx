/**
 * MarkdownPreviewEnvironment - Markdownプレビュー環境コンポーネント
 * markedによるMarkdownパースとサニタイズ
 * @module MarkdownPreviewEnvironment
 */

import React, { useMemo } from "react";
import clsx from "clsx";
import { marked } from "marked";
import { sanitizeHTML } from "../../../utils/sanitize";

export interface MarkdownPreviewEnvironmentProps {
  /** Markdownコンテンツ */
  content: string;
  /** カスタムクラス */
  className?: string;
}

/**
 * markedの設定
 * GFM (GitHub Flavored Markdown) を有効化し、改行を<br>に変換
 */
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Markdownプレビュー用のTailwind proseクラス
 * ダークテーマに対応したスタイリング
 */
const PROSE_CLASSES = [
  // ベース
  "prose prose-invert prose-sm max-w-none",
  // ヘッダー
  "prose-headings:text-[var(--text-primary)] prose-headings:font-semibold",
  "prose-h1:text-2xl prose-h1:border-b prose-h1:border-[var(--border-subtle)] prose-h1:pb-2",
  "prose-h2:text-xl prose-h2:border-b prose-h2:border-[var(--border-subtle)] prose-h2:pb-1",
  "prose-h3:text-lg",
  // テキスト
  "prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed",
  "prose-strong:text-[var(--text-primary)]",
  "prose-em:text-[var(--text-secondary)]",
  // リンク
  "prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline",
  // リスト
  "prose-li:text-[var(--text-secondary)]",
  "prose-ul:list-disc prose-ol:list-decimal",
  // コード
  "prose-code:text-pink-400 prose-code:bg-[var(--bg-secondary)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
  "prose-pre:bg-[var(--bg-secondary)] prose-pre:border prose-pre:border-[var(--border-subtle)]",
  // ブロック引用
  "prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-[var(--bg-secondary)] prose-blockquote:pl-4 prose-blockquote:py-2",
  // テーブル
  "prose-table:border-collapse",
  "prose-th:bg-[var(--bg-secondary)] prose-th:border prose-th:border-[var(--border-subtle)] prose-th:px-3 prose-th:py-2",
  "prose-td:border prose-td:border-[var(--border-subtle)] prose-td:px-3 prose-td:py-2",
  // 区切り線
  "prose-hr:border-[var(--border-subtle)]",
  // 画像
  "prose-img:rounded-lg prose-img:max-w-full",
] as const;

/**
 * MarkdownPreviewEnvironment コンポーネント
 */
export const MarkdownPreviewEnvironment: React.FC<
  MarkdownPreviewEnvironmentProps
> = ({ content, className }) => {
  /**
   * MarkdownをHTMLに変換してサニタイズ
   */
  const sanitizedHtml = useMemo(() => {
    if (!content) return "";

    try {
      // MarkdownをHTMLに変換
      const rawHtml = marked.parse(content);

      // 型ガード: Promiseの場合は空文字を返す
      if (typeof rawHtml !== "string") {
        return "";
      }

      // HTMLをサニタイズ
      return sanitizeHTML(rawHtml);
    } catch {
      return "";
    }
  }, [content]);

  return (
    <div
      className={clsx(
        "h-full w-full overflow-auto",
        "p-4",
        "bg-[var(--bg-primary)]",
        className,
      )}
      data-testid="markdown-preview"
    >
      <div
        className={clsx("markdown-preview", PROSE_CLASSES)}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        data-testid="markdown-content"
      />
    </div>
  );
};

MarkdownPreviewEnvironment.displayName = "MarkdownPreviewEnvironment";
