import React from "react";
import type { ChatMessage as ChatMessageType } from "../../store/types";

export interface ChatMessageListProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  streamingContent: string;
  onCancelStream?: () => void;
  error: { code: string; message: string; retryable: boolean } | null;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isStreaming,
  streamingContent,
  onCancelStream,
  error,
}) => {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="チャットメッセージ"
      data-testid="chat-message-list"
    >
      {messages.map((msg) => (
        <div key={msg.id} data-testid={`message-${msg.id}`}>
          {msg.content}
        </div>
      ))}
      {isStreaming && (
        <div role="status" aria-busy="true" data-testid="streaming-content">
          {streamingContent}
          {onCancelStream && (
            <button aria-label="Cancel response" onClick={onCancelStream}>
              停止
            </button>
          )}
        </div>
      )}
      {error && (
        <div role="alert" aria-live="assertive" data-testid="error-display">
          <span>
            {error.code}: {error.message}
          </span>
        </div>
      )}
    </div>
  );
};
