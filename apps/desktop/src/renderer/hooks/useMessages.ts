/**
 * useMessages Hook
 *
 * Custom hook for managing messages within a conversation.
 *
 * @module @repo/desktop/renderer/hooks/useMessages
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  Message,
  ConversationGetResponse,
  ConversationAddMessageResponse,
} from "../../shared/types/conversation";
import { normalizeError } from "../utils/ipc";

export interface UseMessagesOptions {
  conversationId: string;
  userId: string;
}

export interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: Error | null;
  addMessage: (
    content: string,
    role?: "user" | "assistant",
  ) => Promise<Message | undefined>;
  appendMessageOptimistic: (message: Message) => void;
}

export function useMessages(options: UseMessagesOptions): UseMessagesReturn {
  const { conversationId, userId: _userId } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ConversationGetResponse =
        await window.conversationAPI.get({ id: conversationId });

      if (response.success && response.data) {
        setMessages(response.data.messages || []);
      } else if (!response.success) {
        setError(new Error(response.error.message || "Failed to load"));
      }
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  const addMessage = useCallback(
    async (
      content: string,
      role: "user" | "assistant" = "user",
    ): Promise<Message | undefined> => {
      setIsSending(true);
      setError(null);

      try {
        const response: ConversationAddMessageResponse =
          await window.conversationAPI.addMessage({
            sessionId: conversationId,
            message: {
              role,
              content,
            },
          });

        if (response.success) {
          setMessages((prev) => [...prev, response.data]);
          return response.data;
        } else {
          const err = new Error(
            response.error.message || "Failed to add message",
          );
          setError(err);
          throw err;
        }
      } catch (err) {
        const error = normalizeError(err);
        setError(error);
        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [conversationId],
  );

  const appendMessageOptimistic = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Refetch when conversationId changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      messages,
      isLoading,
      isSending,
      error,
      addMessage,
      appendMessageOptimistic,
    }),
    [
      messages,
      isLoading,
      isSending,
      error,
      addMessage,
      appendMessageOptimistic,
    ],
  );
}
