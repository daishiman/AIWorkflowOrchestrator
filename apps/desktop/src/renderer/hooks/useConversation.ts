/**
 * useConversation Hook
 *
 * Custom hook for managing a single conversation.
 *
 * @module @repo/desktop/renderer/hooks/useConversation
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  Conversation,
  ConversationGetResponse,
  ConversationUpdateResponse,
} from "../../shared/types/conversation";
import { normalizeError } from "../utils/ipc";

export interface UseConversationOptions {
  conversationId: string;
  autoFetch?: boolean;
}

export interface UseConversationReturn {
  conversation: Conversation | null;
  isLoading: boolean;
  error: Error | null;
  updateTitle: (title: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useConversation(
  options: UseConversationOptions,
): UseConversationReturn {
  const { conversationId, autoFetch = false } = options;

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ConversationGetResponse =
        await window.conversationAPI.get({ id: conversationId });

      if (response.success) {
        setConversation(response.data || null);
      } else {
        setError(new Error(response.error?.message || "Failed to fetch"));
      }
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const updateTitle = useCallback(
    async (title: string): Promise<void> => {
      if (!conversation) return;

      try {
        const response: ConversationUpdateResponse =
          await window.conversationAPI.update({
            id: conversationId,
            data: { title },
          });

        if (response.success) {
          setConversation(response.data);
        } else {
          const err = new Error(response.error.message || "Update failed");
          setError(err);
          throw err;
        }
      } catch (err) {
        const error = normalizeError(err);
        setError(error);
        throw error;
      }
    },
    [conversationId, conversation],
  );

  const refresh = useCallback(async () => {
    await fetchConversation();
  }, [fetchConversation]);

  // Auto fetch on mount and when conversationId changes
  useEffect(() => {
    if (autoFetch && conversationId) {
      fetchConversation();
    }
  }, [autoFetch, conversationId]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      conversation,
      isLoading,
      error,
      updateTitle,
      refresh,
    }),
    [conversation, isLoading, error, updateTitle, refresh],
  );
}
