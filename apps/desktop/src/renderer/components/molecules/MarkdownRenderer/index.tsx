/**
 * MarkdownRenderer コンポーネント
 *
 * Markdownコンテンツを Kanagawa Dragon テーマでレンダリングする。
 * GFM (GitHub Flavored Markdown) をサポート。
 */

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import clsx from "clsx";
import type { MarkdownRendererProps } from "./types";
import type { Components } from "react-markdown";
import "./styles.css";

/**
 * カスタムコンポーネント定義
 * リンクを新しいタブで開く、セキュリティ属性を追加
 */
const createComponents = (): Components => ({
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  // コードブロックに言語クラスを追加
  code: ({ className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !className;

    if (isInline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    return (
      <code
        className={clsx(className, match ? `language-${match[1]}` : undefined)}
        {...props}
      >
        {children}
      </code>
    );
  },
});

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
  allowHtml = false,
  syntaxHighlight = true,
  "data-testid": testId,
}) => {
  const components = useMemo(() => createComponents(), []);

  // rehypeプラグイン - サニタイズ
  const rehypePlugins = useMemo(() => {
    const plugins: Array<typeof rehypeSanitize> = [];
    if (!allowHtml) {
      plugins.push(rehypeSanitize);
    }
    return plugins;
  }, [allowHtml]);

  return (
    <div
      className={clsx(
        "markdown-body",
        syntaxHighlight && "syntax-highlight",
        className,
      )}
      data-testid={testId}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

MarkdownRenderer.displayName = "MarkdownRenderer";

export type { MarkdownRendererProps } from "./types";
