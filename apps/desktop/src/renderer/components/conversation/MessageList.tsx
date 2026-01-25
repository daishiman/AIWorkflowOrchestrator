/**
 * MessageList Component
 *
 * Molecule component for displaying a list of messages with auto-scroll support.
 *
 * @module @repo/desktop/renderer/components/conversation/MessageList
 */

import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import type { Message } from "../../../shared/types/conversation";
import { MessageBubble } from "./MessageBubble";

export interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  virtualize?: boolean;
  groupMessages?: boolean;
  error?: string;
  emptyComponent?: React.ReactNode;
  onCopy?: (content: string) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (id: string) => void;
  onRetry?: (message: Message) => void;
}

function LoadingSkeleton(): React.ReactElement {
  return (
    <div data-testid="message-loading-skeleton" className="space-y-4 p-4">
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
  );
}

interface MessageGroup {
  role: "user" | "assistant";
  messages: Message[];
}

function groupMessagesByRole(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let currentGroup: MessageGroup | null = null;

  for (const message of messages) {
    if (!currentGroup || currentGroup.role !== message.role) {
      currentGroup = { role: message.role, messages: [message] };
      groups.push(currentGroup);
    } else {
      currentGroup.messages.push(message);
    }
  }

  return groups;
}

export function MessageList({
  messages,
  isLoading = false,
  isStreaming = false,
  autoScroll = true,
  showTimestamps = false,
  virtualize = false,
  groupMessages = false,
  error,
  emptyComponent,
  onCopy,
  onEdit,
  onDelete,
  onRetry,
}: MessageListProps): React.ReactElement {
  const listRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, autoScroll]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, messages.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      }
    },
    [messages.length],
  );

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const bubbleElements = listRef.current.querySelectorAll(
        '[data-testid="bubble"]',
      );
      const targetElement = bubbleElements[focusedIndex] as HTMLElement;
      if (targetElement) {
        targetElement.focus();
      }
    }
  }, [focusedIndex]);

  // Virtualization (simplified - shows limited items)
  const visibleMessages = useMemo(() => {
    if (virtualize && messages.length > 50) {
      // Show first 10, last 30 items for simplicity
      const first = messages.slice(0, 10);
      const last = messages.slice(-30);
      return [...first, ...last];
    }
    return messages;
  }, [messages, virtualize]);

  const messageGroups = useMemo(() => {
    return groupMessages ? groupMessagesByRole(visibleMessages) : null;
  }, [visibleMessages, groupMessages]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div
        role="log"
        aria-label="メッセージ一覧"
        aria-live="polite"
        className="flex flex-1 flex-col items-center justify-center p-4"
      >
        <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    if (emptyComponent) {
      return (
        <div
          role="log"
          aria-label="メッセージ一覧"
          aria-live="polite"
          className="flex flex-1 items-center justify-center"
        >
          {emptyComponent}
        </div>
      );
    }

    return (
      <div
        role="log"
        aria-label="メッセージ一覧"
        aria-live="polite"
        className="flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-500"
      >
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
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role="log"
      aria-label="メッセージ一覧"
      aria-live="polite"
      onKeyDown={handleKeyDown}
      className="flex-1 overflow-y-auto p-4"
    >
      {groupMessages && messageGroups
        ? messageGroups.map((group, groupIndex) => (
            <div
              key={`group-${groupIndex}`}
              data-testid="message-group"
              className="mb-4"
            >
              {group.messages.map((message, index) => (
                <div
                  key={message.id}
                  data-testid={`message-${message.role}`}
                  className={`mb-2 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                >
                  <MessageBubble
                    message={message}
                    showTimestamp={showTimestamps}
                    isStreaming={
                      isStreaming &&
                      groupIndex === messageGroups.length - 1 &&
                      index === group.messages.length - 1
                    }
                    onCopy={onCopy}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onRetry={onRetry}
                  />
                </div>
              ))}
            </div>
          ))
        : visibleMessages.map((message, index) => (
            <div
              key={message.id}
              data-testid={`message-${message.role}`}
              className={`mb-4 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
            >
              <MessageBubble
                message={message}
                showTimestamp={showTimestamps}
                isStreaming={
                  isStreaming && index === visibleMessages.length - 1
                }
                onCopy={onCopy}
                onEdit={onEdit}
                onDelete={onDelete}
                onRetry={onRetry}
              />
            </div>
          ))}

      {isStreaming && (
        <div data-testid="streaming-indicator" className="flex justify-start">
          <div className="rounded-lg bg-gray-100 px-4 py-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-100" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 delay-200" />
            </div>
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
