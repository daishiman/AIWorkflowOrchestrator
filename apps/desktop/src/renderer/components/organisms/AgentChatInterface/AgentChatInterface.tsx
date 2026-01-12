/**
 * AgentChatInterface - チャット形式のメッセージ表示コンポーネント
 * @module AgentChatInterface
 */
import { useEffect, useRef } from "react";
import type { AgentMessage } from "@repo/shared/types/agent";

/**
 * AgentChatInterfaceのプロパティ
 */
export interface AgentChatInterfaceProps {
  /** メッセージ一覧 */
  messages: AgentMessage[];
  /** ストリーミング中のコンテンツ */
  streamingContent: string;
  /** ストリーミング中フラグ */
  isStreaming: boolean;
}

/**
 * 簡易マークダウンパーサー
 * **bold** と *italic* をサポート
 */
const parseMarkdown = (content: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  // 簡易実装：まずbold、次にitalicを処理
  remaining = remaining.replace(
    /\*\*(.+?)\*\*/g,
    (_, text) => `<strong>${text}</strong>`,
  );
  remaining = remaining.replace(/\*(.+?)\*/g, (_, text) => `<em>${text}</em>`);

  // HTML文字列をReact要素に変換（簡易版）
  const segments = remaining.split(/(<strong>|<\/strong>|<em>|<\/em>)/);
  let inStrong = false;
  let inEm = false;

  for (const segment of segments) {
    if (segment === "<strong>") {
      inStrong = true;
    } else if (segment === "</strong>") {
      inStrong = false;
    } else if (segment === "<em>") {
      inEm = true;
    } else if (segment === "</em>") {
      inEm = false;
    } else if (segment) {
      if (inStrong) {
        parts.push(<strong key={key++}>{segment}</strong>);
      } else if (inEm) {
        parts.push(<em key={key++}>{segment}</em>);
      } else {
        parts.push(<span key={key++}>{segment}</span>);
      }
    }
  }

  return parts.length > 0 ? parts : [content];
};

/**
 * メッセージアイテムコンポーネント
 */
const MessageItem: React.FC<{ message: AgentMessage }> = ({ message }) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      data-role={message.role}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-4`}
    >
      {/* アバター */}
      {isUser && (
        <div
          data-testid="user-avatar"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white"
        >
          U
        </div>
      )}
      {isAssistant && (
        <div
          data-testid="assistant-avatar"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white"
        >
          A
        </div>
      )}

      {/* メッセージバブル */}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
        }`}
      >
        <div className="whitespace-pre-wrap break-words text-sm">
          {parseMarkdown(message.content)}
        </div>
        <div className="mt-1 text-xs opacity-60">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

/**
 * チャットインターフェースコンポーネント
 *
 * - メッセージリスト表示
 * - ストリーミングコンテンツ表示
 * - 自動スクロール
 * - マークダウンレンダリング
 */
export const AgentChatInterface: React.FC<AgentChatInterfaceProps> = ({
  messages,
  streamingContent,
  isStreaming,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 自動スクロール
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent]);

  const isEmpty = messages.length === 0 && !streamingContent && !isStreaming;

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="チャット履歴"
      aria-live="polite"
      tabIndex={0}
      className="flex-1 overflow-auto p-4"
    >
      {/* 空状態 */}
      {isEmpty && (
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-400">メッセージを入力してください</p>
        </div>
      )}

      {/* メッセージリスト */}
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}

      {/* ストリーミングコンテンツ */}
      {(isStreaming || streamingContent) && (
        <div data-role="assistant" className="flex gap-3 mb-4">
          <div
            data-testid="assistant-avatar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white"
          >
            A
          </div>
          <div className="max-w-[80%] rounded-lg bg-gray-700 px-4 py-2 text-gray-100">
            <div className="whitespace-pre-wrap break-words text-sm">
              {streamingContent}
              {isStreaming && (
                <span
                  data-testid="streaming-cursor"
                  className="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-400"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* スクロール用の参照要素 */}
      <div ref={bottomRef} />
    </div>
  );
};
