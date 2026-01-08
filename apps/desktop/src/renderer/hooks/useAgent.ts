/**
 * useAgent React Hook
 * @module @repo/desktop/renderer/hooks/useAgent
 *
 * React Hook for Agent SDK integration in Electron renderer process
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  SDKMessage,
  AgentStatus,
  QueryOptions,
  AgentAPI,
} from "@repo/shared/agent";

/**
 * Hook options
 */
export interface UseAgentOptions {
  /** Automatically create a session on mount */
  autoSession?: boolean;
  /** Default timeout for queries (ms) */
  defaultTimeout?: number;
}

/**
 * Hook return type
 */
export interface UseAgentReturn {
  /** Current agent status */
  status: AgentStatus | null;
  /** Messages received from the agent */
  messages: SDKMessage[];
  /** Whether a query is currently running */
  isLoading: boolean;
  /** Current error, if any */
  error: Error | null;
  /** Current session ID */
  sessionId: string | null;
  /** Send a query to the agent */
  query: (prompt: string, options?: QueryOptions) => Promise<void>;
  /** Abort the current query */
  abort: () => void;
  /** Clear all messages */
  clearMessages: () => void;
  /** Reset the session (destroy and create new) */
  resetSession: () => Promise<void>;
}

/**
 * Get the agent API from the window object
 */
function getAgentAPI(): AgentAPI {
  if (typeof window !== "undefined" && "agentAPI" in window) {
    return (window as unknown as { agentAPI: AgentAPI }).agentAPI;
  }
  throw new Error("Agent API not available");
}

/**
 * useAgent Hook
 *
 * Provides React integration with the Agent SDK through Electron IPC.
 * Manages agent status, messages, sessions, and query lifecycle.
 *
 * @param options - Hook configuration options
 * @returns Agent state and control functions
 */
export function useAgent(options: UseAgentOptions = {}): UseAgentReturn {
  const { autoSession = false, defaultTimeout } = options;

  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [messages, setMessages] = useState<SDKMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize: fetch status, subscribe to messages, optionally create session
  useEffect(() => {
    const agentAPI = getAgentAPI();

    // Fetch initial status
    agentAPI
      .getStatus()
      .then((fetchedStatus) => {
        setStatus(fetchedStatus);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    // Subscribe to messages
    unsubscribeRef.current = agentAPI.onMessage((message: SDKMessage) => {
      setMessages((prev) => [...prev, message]);

      // Handle error messages
      if (message.type === "error") {
        setError(new Error(message.content));
      }

      // Handle complete messages
      if (message.isComplete || message.type === "complete") {
        setIsLoading(false);
      }
    });

    // Create session if autoSession is enabled
    if (autoSession) {
      agentAPI
        .createSession()
        .then((newSessionId) => {
          setSessionId(newSessionId);
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
        });
    }

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [autoSession]);

  // Query function
  const query = useCallback(
    async (prompt: string, queryOptions?: QueryOptions): Promise<void> => {
      const agentAPI = getAgentAPI();

      setIsLoading(true);
      setError(null);

      // Build options with defaults
      const finalOptions: QueryOptions = {
        ...queryOptions,
      };

      // Apply default timeout if not specified
      if (defaultTimeout !== undefined && finalOptions.timeout === undefined) {
        finalOptions.timeout = defaultTimeout;
      }

      // Include session ID if available
      if (sessionId && finalOptions.sessionId === undefined) {
        finalOptions.sessionId = sessionId;
      }

      try {
        await agentAPI.query(prompt, finalOptions);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        const errorInstance =
          err instanceof Error ? err : new Error(String(err));
        setError(errorInstance);
        throw errorInstance;
      }
    },
    [defaultTimeout, sessionId],
  );

  // Abort function
  const abort = useCallback(() => {
    const agentAPI = getAgentAPI();
    agentAPI.abort();
    setIsLoading(false);
  }, []);

  // Clear messages function
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Reset session function
  const resetSession = useCallback(async () => {
    const agentAPI = getAgentAPI();

    // Destroy current session if exists
    if (sessionId) {
      await agentAPI.destroySession(sessionId);
    }

    // Create new session
    const newSessionId = await agentAPI.createSession();
    setSessionId(newSessionId);

    // Clear messages
    setMessages([]);
  }, [sessionId]);

  return {
    status,
    messages,
    isLoading,
    error,
    sessionId,
    query,
    abort,
    clearMessages,
    resetSession,
  };
}
