/**
 * ConversationHeader Component
 *
 * Molecule component for displaying and editing conversation header.
 *
 * @module @repo/desktop/renderer/components/conversation/ConversationHeader
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { Conversation } from "../../../shared/types/conversation";

export interface ConversationHeaderProps {
  conversation: Conversation;
  onTitleUpdate: (title: string) => void;
  onFavoriteToggle?: () => void;
  onPinToggle?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
  isUpdating?: boolean;
}

export function ConversationHeader({
  conversation,
  onTitleUpdate,
  onFavoriteToggle,
  onPinToggle,
  onDelete,
  isEditable = true,
  isUpdating = false,
}: ConversationHeaderProps): React.ReactElement {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset edit value when conversation changes
  useEffect(() => {
    setEditValue(conversation.title);
  }, [conversation.title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleTitleClick = useCallback(() => {
    if (isEditable && !isUpdating) {
      setIsEditing(true);
    }
  }, [isEditable, isUpdating]);

  const handleSave = useCallback(() => {
    if (editValue.trim() && editValue !== conversation.title) {
      onTitleUpdate(editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, conversation.title, onTitleUpdate]);

  const handleCancel = useCallback(() => {
    setEditValue(conversation.title);
    setIsEditing(false);
  }, [conversation.title]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        handleSave();
      } else if (event.key === "Escape") {
        handleCancel();
      }
    },
    [handleSave, handleCancel],
  );

  return (
    <header
      data-testid="conversation-header"
      className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3"
    >
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full rounded border border-blue-500 px-2 py-1 text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <h1
            onClick={handleTitleClick}
            className={`truncate text-lg font-semibold ${isEditable ? "cursor-pointer hover:text-blue-600" : ""}`}
          >
            {conversation.title}
          </h1>
        )}
        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
          <span>{conversation.messageCount}件のメッセージ</span>
        </div>
      </div>

      <div className="ml-4 flex items-center gap-2">
        {isUpdating && (
          <span
            data-testid="updating-indicator"
            className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
          />
        )}

        {onFavoriteToggle && (
          <button
            type="button"
            onClick={onFavoriteToggle}
            disabled={isUpdating}
            aria-label={
              conversation.isFavorite ? "お気に入り解除" : "お気に入り"
            }
            aria-pressed={conversation.isFavorite}
            className={`rounded p-2 transition-colors ${
              conversation.isFavorite
                ? "text-yellow-500 hover:bg-yellow-50"
                : "text-gray-400 hover:bg-gray-100 hover:text-yellow-500"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <svg
              className="h-5 w-5"
              fill={conversation.isFavorite ? "currentColor" : "none"}
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
            onClick={onPinToggle}
            disabled={isUpdating}
            aria-label={conversation.isPinned ? "ピン解除" : "ピン"}
            aria-pressed={conversation.isPinned}
            className={`rounded p-2 transition-colors ${
              conversation.isPinned
                ? "text-blue-600 hover:bg-blue-50"
                : "text-gray-400 hover:bg-gray-100 hover:text-blue-600"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <svg
              className="h-5 w-5"
              fill={conversation.isPinned ? "currentColor" : "none"}
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
            onClick={onDelete}
            disabled={isUpdating}
            aria-label="削除"
            className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
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
    </header>
  );
}
