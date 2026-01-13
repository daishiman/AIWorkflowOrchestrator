/**
 * HTMLPreviewEnvironment - HTMLプレビュー環境コンポーネント
 * sandboxed iframeによる安全なHTMLプレビュー
 * @module HTMLPreviewEnvironment
 */

import React, { useMemo, useCallback } from "react";
import clsx from "clsx";
import {
  sanitizeHTML,
  buildCSPMetaTag,
  DEFAULT_SANDBOX_FLAGS,
  filterSandboxFlags,
} from "../../../utils/sanitize";

export interface HTMLPreviewEnvironmentProps {
  /** プレビューするHTMLコンテンツ */
  content: string;
  /** sandbox属性の値（配列） */
  sandboxFlags?: string[];
  /** 読み込み完了ハンドラ */
  onLoad?: () => void;
  /** エラーハンドラ */
  onError?: (error: Error) => void;
  /** カスタムクラス */
  className?: string;
}

/**
 * iframeに注入するベーススタイル
 */
const BASE_STYLES = `
<style>
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #e4e4e7;
    background-color: #18181b;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  a {
    color: #60a5fa;
  }
  pre, code {
    background-color: #27272a;
    border-radius: 4px;
    padding: 2px 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
  }
  pre {
    padding: 12px;
    overflow-x: auto;
  }
  pre code {
    padding: 0;
    background: none;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #3f3f46;
    padding: 8px 12px;
    text-align: left;
  }
  th {
    background-color: #27272a;
  }
  blockquote {
    margin: 16px 0;
    padding: 12px 16px;
    border-left: 4px solid #3b82f6;
    background-color: #27272a;
  }
</style>
`;

/**
 * 完全なHTML文書を構築
 */
const buildFullHtml = (
  sanitizedContent: string,
  cspMetaTag: string,
): string => {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${cspMetaTag}
  ${BASE_STYLES}
</head>
<body>
${sanitizedContent}
</body>
</html>`;
};

/**
 * HTMLPreviewEnvironment コンポーネント
 */
export const HTMLPreviewEnvironment: React.FC<HTMLPreviewEnvironmentProps> = ({
  content,
  sandboxFlags,
  onLoad,
  onError,
  className,
}) => {
  /**
   * サニタイズ済みHTMLコンテンツ
   */
  const sanitizedContent = useMemo(() => {
    try {
      return sanitizeHTML(content);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
      return "";
    }
  }, [content, onError]);

  /**
   * CSPメタタグ
   */
  const cspMetaTag = useMemo(() => buildCSPMetaTag(), []);

  /**
   * 完全なHTML文書
   */
  const fullHtml = useMemo(
    () => buildFullHtml(sanitizedContent, cspMetaTag),
    [sanitizedContent, cspMetaTag],
  );

  /**
   * 安全なsandbox属性
   */
  const safeSandboxFlags = useMemo(() => {
    if (sandboxFlags) {
      return filterSandboxFlags(sandboxFlags);
    }
    return DEFAULT_SANDBOX_FLAGS;
  }, [sandboxFlags]);

  /**
   * iframe読み込み完了ハンドラ
   */
  const handleLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  /**
   * iframeエラーハンドラ
   */
  const handleError = useCallback(() => {
    onError?.(new Error("Failed to load HTML preview"));
  }, [onError]);

  return (
    <div
      className={clsx("h-full w-full overflow-hidden", className)}
      data-testid="html-preview"
    >
      <iframe
        title="Preview"
        srcDoc={fullHtml}
        sandbox={safeSandboxFlags}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        data-testid="preview-iframe"
      />
    </div>
  );
};

HTMLPreviewEnvironment.displayName = "HTMLPreviewEnvironment";
