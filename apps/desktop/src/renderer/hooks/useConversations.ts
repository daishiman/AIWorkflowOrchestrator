/**
 * useConversations Hook
 *
 * Custom hook for managing conversation list with pagination and search.
 *
 * @module @repo/desktop/renderer/hooks/useConversations
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  ConversationSummary,
  Conversation,
  ConversationListResponse,
  ConversationCreateResponse,
  ConversationDeleteResponse,
  ConversationSearchResponse,
} from "../../shared/types/conversation";
import { normalizeError } from "../utils/ipc";

export interface UseConversationsOptions {
  userId: string;
  limit?: number;
  autoFetch?: boolean;
}

export interface UseConversationsReturn {
  conversations: ConversationSummary[];
  isLoading: boolean;
  isSearching: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  create: (title: string, initialMessage?: string) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useConversations(
  options: UseConversationsOptions,
): UseConversationsReturn {
  const { userId, limit = 20, autoFetch = false } = options;

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);

  const fetchConversations = useCallback(
    async (reset = false) => {
      setIsLoading(true);
      setError(null);

      try {
        const currentOffset = reset ? 0 : offset;
        const response: ConversationListResponse =
          await window.conversationAPI.list({
            userId,
            limit,
            offset: currentOffset,
          });

        if (response.success) {
          if (reset) {
            setConversations(response.data);
          } else {
            setConversations((prev) => [...prev, ...response.data]);
          }
          setHasMore(response.data.length >= limit);
          setOffset(currentOffset + response.data.length);
        } else {
          setError(new Error(response.error.message || "Failed to fetch"));
        }
      } catch (err) {
        setError(normalizeError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [userId, limit, offset],
  );

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore && !searchQuery) {
      await fetchConversations(false);
    }
  }, [fetchConversations, isLoading, hasMore, searchQuery]);

  const search = useCallback(
    async (query: string) => {
      setIsSearching(true);
      setError(null);
      setSearchQuery(query);

      try {
        const response: ConversationSearchResponse =
          await window.conversationAPI.search({
            userId,
            query,
          });

        if (response.success) {
          setConversations(response.data);
          setHasMore(false);
        } else {
          setError(new Error(response.error.message || "Search failed"));
        }
      } catch (err) {
        setError(normalizeError(err));
      } finally {
        setIsSearching(false);
      }
    },
    [userId],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery(null);
    setOffset(0);
    setHasMore(true);
    fetchConversations(true);
  }, [fetchConversations]);

  const create = useCallback(
    async (title: string, _initialMessage?: string): Promise<Conversation> => {
      setError(null);

      try {
        const response: ConversationCreateResponse =
          await window.conversationAPI.create({
            userId,
            title,
          });

        if (response.success) {
          // Add new conversation to the beginning of the list
          const newSummary: ConversationSummary = {
            id: response.data.id,
            title: response.data.title,
            createdAt: response.data.createdAt,
            updatedAt: response.data.updatedAt,
            messageCount: response.data.messageCount,
            lastMessagePreview: response.data.lastMessagePreview,
            isFavorite: response.data.isFavorite,
            isPinned: response.data.isPinned,
          };
          setConversations((prev) => [newSummary, ...prev]);
          return response.data;
        } else {
          const err = new Error(response.error.message || "Create failed");
          setError(err);
          throw err;
        }
      } catch (err) {
        const error = normalizeError(err);
        setError(error);
        throw error;
      }
    },
    [userId],
  );

  const deleteConversation = useCallback(async (id: string): Promise<void> => {
    try {
      const response: ConversationDeleteResponse =
        await window.conversationAPI.delete({ id });

      if (response.success) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      } else {
        setError(new Error(response.error?.message || "Delete failed"));
      }
    } catch (err) {
      setError(normalizeError(err));
    }
  }, []);

  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchConversations(true);
  }, [fetchConversations]);

  // Auto fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchConversations(true);
    }
  }, [autoFetch]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      conversations,
      isLoading,
      isSearching,
      error,
      hasMore,
      loadMore,
      search,
      clearSearch,
      create,
      deleteConversation,
      refresh,
    }),
    [
      conversations,
      isLoading,
      isSearching,
      error,
      hasMore,
      loadMore,
      search,
      clearSearch,
      create,
      deleteConversation,
      refresh,
    ],
  );
}
