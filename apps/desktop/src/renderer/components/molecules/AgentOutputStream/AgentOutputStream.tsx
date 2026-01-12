/**
 * AgentOutputStream - ストリーミング出力表示コンポーネント
 * @module AgentOutputStream
 */
import { useEffect, useRef } from "react";

/**
 * AgentOutputStreamのプロパティ
 */
export interface AgentOutputStreamProps {
  /** 表示コンテンツ */
  content: string;
  /** ストリーミング中フラグ */
  isStreaming: boolean;
}

/**
 * ストリーミング出力表示コンポーネント
 *
 * - リアルタイムでストリーミングコンテンツを表示
 * - ストリーミング中はカーソルブリンクアニメーションを表示
 * - 自動スクロール機能
 */
export const AgentOutputStream: React.FC<AgentOutputStreamProps> = ({
  content,
  isStreaming,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  if (!content && !isStreaming) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="overflow-auto rounded-lg bg-gray-800 p-4 font-mono text-sm text-gray-100"
      role="log"
      aria-live="polite"
      aria-label="エージェント出力"
    >
      <pre className="whitespace-pre-wrap break-words">
        {content}
        {isStreaming && (
          <span
            className="inline-block h-4 w-2 animate-pulse bg-blue-400"
            aria-hidden="true"
          />
        )}
      </pre>
    </div>
  );
};
