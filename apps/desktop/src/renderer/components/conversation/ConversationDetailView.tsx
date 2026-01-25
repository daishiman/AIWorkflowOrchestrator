/**
 * ConversationDetailView Component
 *
 * Organism component for displaying full conversation with header, messages, and input.
 *
 * @module @repo/desktop/renderer/components/conversation/ConversationDetailView
 */

import React, { useCallback } from "react";
import type { Conversation, Message } from "../../../shared/types/conversation";
import { ConversationHeader } from "./ConversationHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";

export interface ConversationDetailViewProps {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isSending?: boolean;
  error?: string;
  onSendMessage: (content: string) => void;
  onTitleUpdate?: (title: string) => void;
  onFavoriteToggle?: () => void;
  onPinToggle?: () => void;
  onDelete?: () => void;
  onRetry?: () => void;
}

function LoadingSkeleton(): React.ReactElement {
  return (
    <div data-testid="loading-skeleton" className="flex h-full flex-col">
      <div className="animate-pulse border-b border-gray-200 p-4">
        <div className="h-6 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
      </div>
      <div className="flex-1 space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`animate-pulse ${i % 2 === 0 ? "ml-auto" : "mr-auto"} max-w-[70%]`}
          >
            <div
              className={`h-16 rounded-lg ${i % 2 === 0 ? "bg-blue-100" : "bg-gray-200"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center text-gray-500">
      <svg
        className="mb-3 h-16 w-16 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <p className="text-lg">会話を選択</p>
      <p className="mt-1 text-sm">
        左側のリストから会話を選ぶか、新しい会話を作成してください
      </p>
    </div>
  );
}

function EmptyMessagesState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
      <svg
        className="mb-3 h-12 w-12 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <p>メッセージがありません</p>
      <p className="mt-1 text-sm">最初のメッセージを送信してください</p>
    </div>
  );
}

export function ConversationDetailView({
  conversation,
  messages,
  isLoading,
  isSending = false,
  error,
  onSendMessage,
  onTitleUpdate,
  onFavoriteToggle,
  onPinToggle,
  onDelete,
  onRetry,
}: ConversationDetailViewProps): React.ReactElement {
  const handleTitleUpdate = useCallback(
    (title: string) => {
      onTitleUpdate?.(title);
    },
    [onTitleUpdate],
  );

  // Loading state
  if (isLoading) {
    return (
      <main className="flex h-full flex-col bg-white">
        <LoadingSkeleton />
      </main>
    );
  }

  // Empty state (no conversation selected)
  if (!conversation) {
    return (
      <main className="flex h-full flex-col bg-white">
        <EmptyState />
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex h-full flex-col bg-white">
        <ConversationHeader
          conversation={conversation}
          onTitleUpdate={handleTitleUpdate}
          isEditable={!!onTitleUpdate}
        />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <svg
              className="mx-auto mb-3 h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-red-600">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-4 rounded-md bg-red-100 px-4 py-2 text-red-600 hover:bg-red-200"
              >
                再試行
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full flex-col bg-white">
      {/* Sticky Header */}
      <ConversationHeader
        conversation={conversation}
        onTitleUpdate={handleTitleUpdate}
        onFavoriteToggle={onFavoriteToggle}
        onPinToggle={onPinToggle}
        onDelete={onDelete}
        isEditable={!!onTitleUpdate}
      />

      {/* Message List */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          <EmptyMessagesState />
        ) : (
          <MessageList
            messages={messages}
            showTimestamps={true}
            autoScroll={true}
          />
        )}
      </div>

      {/* Sticky Message Input */}
      <div
        data-testid="message-input-container"
        className="sticky bottom-0 border-t border-gray-200 bg-white"
      >
        {isSending && (
          <div
            data-testid="sending-indicator"
            className="px-4 py-2 text-sm text-gray-500"
          >
            送信中...
          </div>
        )}
        <MessageInput onSend={onSendMessage} disabled={isSending} autoFocus />
      </div>
    </main>
  );
}
