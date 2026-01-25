/**
 * MessageBubble Component
 *
 * Atom component for displaying a single message with markdown support.
 *
 * @module @repo/desktop/renderer/components/conversation/MessageBubble
 */

import React, { useState, useCallback, memo } from "react";
import type { Message } from "../../../shared/types/conversation";

export interface MessageBubbleProps {
  message: Message;
  showTimestamp?: boolean;
  isStreaming?: boolean;
  isError?: boolean;
  onCopy?: (content: string) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (id: string) => void;
  onRetry?: (message: Message) => void;
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderContent(content: string): React.ReactNode {
  // Simple markdown rendering
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const inlineCodeRegex = /`([^`]+)`/g;
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const italicRegex = /\*([^*]+)\*/g;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  let processed = content;
  const codeBlocks: Array<{ placeholder: string; code: string; lang: string }> =
    [];

  // Extract code blocks first
  let codeMatch;
  let codeIndex = 0;
  while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
    const placeholder = `__CODE_BLOCK_${codeIndex}__`;
    codeBlocks.push({
      placeholder,
      code: codeMatch[2],
      lang: codeMatch[1] || "text",
    });
    processed = processed.replace(codeMatch[0], placeholder);
    codeIndex++;
  }

  // Process inline elements
  processed = processed.replace(boldRegex, "<strong>$1</strong>");
  processed = processed.replace(italicRegex, "<em>$1</em>");
  processed = processed.replace(inlineCodeRegex, "<code>$1</code>");
  processed = processed.replace(
    linkRegex,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Split by code block placeholders
  const parts = processed.split(/(__CODE_BLOCK_\d+__)/);

  return parts.map((part, index) => {
    const codeBlock = codeBlocks.find((cb) => cb.placeholder === part);
    if (codeBlock) {
      return (
        <pre
          key={index}
          data-testid="code-block"
          className="my-2 overflow-x-auto rounded bg-gray-800 p-3 text-sm text-gray-100"
        >
          <code>{codeBlock.code}</code>
        </pre>
      );
    }
    return (
      <span
        key={index}
        dangerouslySetInnerHTML={{ __html: part }}
        className="whitespace-pre-wrap"
      />
    );
  });
}

export const MessageBubble = memo(function MessageBubble({
  message,
  showTimestamp = false,
  isStreaming = false,
  isError = false,
  onCopy,
  onEdit,
  onDelete,
  onRetry,
}: MessageBubbleProps): React.ReactElement {
  const [isHovered, setIsHovered] = useState(false);

  const isUser = message.role === "user";
  const hasCodeBlock = message.content.includes("```");

  const handleCopy = useCallback(() => {
    onCopy?.(message.content);
  }, [onCopy, message.content]);

  const handleEdit = useCallback(() => {
    onEdit?.(message);
  }, [onEdit, message]);

  const handleDelete = useCallback(() => {
    onDelete?.(message.id);
  }, [onDelete, message.id]);

  const handleRetry = useCallback(() => {
    onRetry?.(message);
  }, [onRetry, message]);

  const handleCopyCode = useCallback(() => {
    const codeMatch = message.content.match(/```\w*\n([\s\S]*?)```/);
    if (codeMatch) {
      onCopy?.(codeMatch[1]);
    }
  }, [onCopy, message.content]);

  return (
    <article
      data-testid="bubble"
      role="article"
      tabIndex={0}
      aria-label={`${isUser ? "ユーザー" : "アシスタント"}のメッセージ`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${isUser ? "user" : "assistant"} ${isStreaming ? "streaming" : ""} ${isError ? "error" : ""} group relative max-w-[80%] rounded-lg p-3 ${
        isUser
          ? "ml-auto bg-blue-600 text-white"
          : "mr-auto bg-gray-100 text-gray-900"
      } ${isError ? "border-2 border-red-500" : ""}`}
      style={{ wordBreak: "break-word" }}
    >
      <div className="message-content">{renderContent(message.content)}</div>

      {/* Attachments */}
      {message.attachments && message.attachments.length > 0 && (
        <div className="mt-2 space-y-2">
          {message.attachments.map((attachment) => (
            <div key={attachment.id} className="rounded border p-2">
              {attachment.type === "image" && (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-h-48 rounded"
                />
              )}
              <span className="mt-1 block text-xs opacity-70">
                {attachment.name}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      {showTimestamp && (
        <div
          data-testid="message-timestamp"
          className={`mt-1 text-xs ${isUser ? "text-blue-200" : "text-gray-400"}`}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      )}

      {/* Streaming indicator */}
      {isStreaming && (
        <>
          <div data-testid="typing-indicator" className="mt-2 flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200" />
          </div>
          <div role="status" className="sr-only">
            応答を生成中...
          </div>
        </>
      )}

      {/* Error state */}
      {isError && onRetry && (
        <button
          type="button"
          onClick={handleRetry}
          aria-label="再試行"
          className="mt-2 rounded bg-red-100 px-2 py-1 text-sm text-red-600 hover:bg-red-200"
        >
          再試行
        </button>
      )}

      {/* Action buttons (on hover) */}
      {isHovered && (onCopy || onEdit || onDelete) && (
        <div
          className={`absolute ${isUser ? "left-0 -translate-x-full" : "right-0 translate-x-full"} top-0 flex gap-1 px-2`}
        >
          {onCopy && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label="コピー"
              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          )}
          {onEdit && isUser && (
            <button
              type="button"
              onClick={handleEdit}
              aria-label="編集"
              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label="削除"
              className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-red-500"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Copy code button for code blocks */}
      {hasCodeBlock && onCopy && (
        <button
          type="button"
          data-testid="copy-code-button"
          onClick={handleCopyCode}
          className="absolute right-2 top-2 rounded bg-gray-700 p-1 text-gray-300 opacity-0 hover:bg-gray-600 group-hover:opacity-100"
          aria-label="コードをコピー"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
      )}
    </article>
  );
});
