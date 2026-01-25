/**
 * ConversationListPanel Component
 *
 * Organism component for displaying and managing conversation list.
 *
 * @module @repo/desktop/renderer/components/conversation/ConversationListPanel
 */

import React, { useCallback, useMemo } from "react";
import type { ConversationSummary } from "../../../shared/types/conversation";
import { ConversationListItem } from "./ConversationListItem";
import { ConversationSearch } from "./ConversationSearch";
import { NewConversationButton } from "./NewConversationButton";

export interface ConversationListPanelProps {
  conversations: ConversationSummary[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onSearch?: (query: string) => void;
  onLoadMore?: () => void;
  onDelete?: (id: string) => void;
  onFavoriteToggle?: (id: string) => void;
  onPinToggle?: (id: string) => void;
  hasMore?: boolean;
  isSearching?: boolean;
  searchQuery?: string;
}

function LoadingSkeleton(): React.ReactElement {
  return (
    <div data-testid="loading-skeleton" className="space-y-3 p-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function ConversationListPanel({
  conversations,
  selectedId,
  isLoading,
  onSelect,
  onCreateNew,
  onSearch,
  onLoadMore,
  onDelete,
  onFavoriteToggle,
  onPinToggle,
  hasMore = false,
  isSearching = false,
  searchQuery = "",
}: ConversationListPanelProps): React.ReactElement {
  // Sort conversations: pinned first
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [conversations]);

  const currentIndex = useMemo(() => {
    if (!selectedId) return -1;
    return sortedConversations.findIndex((c) => c.id === selectedId);
  }, [sortedConversations, selectedId]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLUListElement>) => {
      if (sortedConversations.length === 0) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = Math.min(
          currentIndex + 1,
          sortedConversations.length - 1,
        );
        if (nextIndex !== currentIndex) {
          onSelect(sortedConversations[nextIndex].id);
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        if (prevIndex !== currentIndex) {
          onSelect(sortedConversations[prevIndex].id);
        }
      }
    },
    [currentIndex, sortedConversations, onSelect],
  );

  const handleSearchClear = useCallback(() => {
    onSearch?.("");
  }, [onSearch]);

  return (
    <nav
      className="flex h-full flex-col border-r border-gray-200 bg-white"
      aria-label="会話リスト"
    >
      <div className="flex-shrink-0 border-b border-gray-200 p-3">
        <div className="mb-3">
          <NewConversationButton onClick={onCreateNew} />
        </div>
        {onSearch && (
          <ConversationSearch
            onSearch={onSearch}
            onClear={handleSearchClear}
            value={searchQuery}
            isSearching={isSearching}
            resultCount={conversations.length}
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingSkeleton />
        ) : sortedConversations.length === 0 ? (
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
            <p>会話がありません</p>
            <p className="mt-1 text-sm">新しい会話を作成してください</p>
          </div>
        ) : (
          <ul
            role="listbox"
            aria-label="会話一覧"
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="focus:outline-none"
          >
            {sortedConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
                onClick={onSelect}
                onDelete={onDelete}
                onFavoriteToggle={onFavoriteToggle}
                onPinToggle={onPinToggle}
              />
            ))}
          </ul>
        )}

        {hasMore && !isLoading && onLoadMore && (
          <div className="p-3">
            <button
              type="button"
              onClick={onLoadMore}
              className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              もっと見る
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
