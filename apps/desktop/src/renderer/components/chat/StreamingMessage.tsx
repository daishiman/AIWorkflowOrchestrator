/**
 * @file StreamingMessage Component
 * @description ストリーミング中のメッセージ表示コンポーネント
 * @feature llm-streaming-response
 */

import { forwardRef, memo } from "react";
import { cn } from "@/renderer/lib/utils";

/**
 * StreamingMessage コンポーネントのプロパティ
 */
export interface StreamingMessageProps {
  /** 表示するコンテンツ */
  content: string;
  /** ストリーミング中かどうか */
  isStreaming: boolean;
  /** カーソルを表示するか（デフォルト: true） */
  showCursor?: boolean;
  /** キャンセルコールバック */
  onCancel?: () => void;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * StreamingMessage コンポーネント
 *
 * LLMからのストリーミングレスポンスを表示するためのコンポーネント。
 * ストリーミング中はカーソルアニメーションを表示し、
 * キャンセルボタンを提供します。
 *
 * @example
 * ```tsx
 * <StreamingMessage
 *   content="Hello, I am..."
 *   isStreaming={true}
 *   onCancel={() => handleCancel()}
 * />
 * ```
 */
export const StreamingMessage = memo(
  forwardRef<HTMLDivElement, StreamingMessageProps>(
    ({ content, isStreaming, showCursor = true, onCancel, className }, ref) => {
      return (
        <div
          ref={ref}
          className={cn("streaming-message", className)}
          role="status"
          aria-live="polite"
          aria-busy={isStreaming}
          data-testid="streaming-message"
        >
          <div className="content whitespace-pre-wrap break-words">
            {content}
            {isStreaming && showCursor && (
              <span
                className="cursor ml-0.5 inline-block h-4 w-2 animate-pulse bg-current"
                aria-label="入力中"
                data-testid="streaming-cursor"
              />
            )}
          </div>
          {isStreaming && onCancel && (
            <button
              onClick={onCancel}
              className="mt-2 rounded-md border border-gray-300 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="ストリーミングを停止"
              data-testid="cancel-button"
            >
              停止
            </button>
          )}
        </div>
      );
    },
  ),
);

StreamingMessage.displayName = "StreamingMessage";

export default StreamingMessage;
