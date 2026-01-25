/**
 * ConversationListItem Component
 *
 * Molecule component for displaying a single conversation in the list.
 *
 * @module @repo/desktop/renderer/components/conversation/ConversationListItem
 */

import React, { useCallback, memo } from "react";
import type { ConversationSummary } from "../../../shared/types/conversation";

export interface ConversationListItemProps {
  conversation: ConversationSummary;
  isSelected: boolean;
  onClick: (id: string) => void;
  onFavoriteToggle?: (id: string) => void;
  onPinToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "今日";
  } else if (days === 1) {
    return "yesterday";
  } else if (days < 7) {
    return `${days}日前`;
  } else {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
}

export const ConversationListItem = memo(function ConversationListItem({
  conversation,
  isSelected,
  onClick,
  onFavoriteToggle,
  onPinToggle,
  onDelete,
}: ConversationListItemProps): React.ReactElement {
  const handleClick = useCallback(() => {
    onClick(conversation.id);
  }, [onClick, conversation.id]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (event.key === "Enter") {
        onClick(conversation.id);
      }
    },
    [onClick, conversation.id],
  );

  const handleFavoriteClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onFavoriteToggle?.(conversation.id);
    },
    [onFavoriteToggle, conversation.id],
  );

  const handlePinClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onPinToggle?.(conversation.id);
    },
    [onPinToggle, conversation.id],
  );

  const handleDeleteClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onDelete?.(conversation.id);
    },
    [onDelete, conversation.id],
  );

  return (
    <li
      role="option"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`${conversation.title}, ${conversation.messageCount}件のメッセージ`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group cursor-pointer border-b border-gray-200 p-3 transition-colors ${
        isSelected
          ? "bg-blue-50 border-l-2 border-l-blue-600"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {conversation.isPinned && (
              <span
                data-testid="pin-indicator"
                className="text-blue-600"
                aria-label="ピン留め"
              >
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                </svg>
              </span>
            )}
            {conversation.isFavorite && (
              <span
                data-testid="favorite-indicator"
                className="text-yellow-500"
                aria-label="お気に入り"
              >
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            )}
            <h3 className="truncate text-sm font-medium text-gray-900">
              {conversation.title}
            </h3>
          </div>
          {conversation.lastMessagePreview && (
            <p className="mt-1 truncate text-xs text-gray-500">
              {conversation.lastMessagePreview}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <span className="text-xs text-gray-400">
            {formatDate(conversation.updatedAt)}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {conversation.messageCount}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {onFavoriteToggle && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={
              conversation.isFavorite ? "お気に入り解除" : "お気に入り"
            }
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-yellow-500"
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        )}
        {onPinToggle && (
          <button
            type="button"
            onClick={handlePinClick}
            aria-label={conversation.isPinned ? "ピン解除" : "ピン"}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-blue-500"
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={handleDeleteClick}
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
    </li>
  );
});
