/**
 * useAgent Hook Template for Electron Renderer Process
 *
 * This template provides a React hook for integrating
 * Claude Agent SDK with an Electron application's renderer process.
 *
 * Usage:
 *   1. Copy this file to apps/desktop/src/renderer/hooks/useAgent.ts
 *   2. Ensure preload script exposes the required IPC methods
 *   3. Import and use in your React components
 */

import { useCallback, useEffect, useState, useRef } from "react";

// ============================================================================
// Types
// ============================================================================

interface AgentState {
  isRunning: boolean;
  messages: AgentMessage[];
  pendingPermission: PermissionRequest | null;
  error: string | null;
  status: AgentStatusType;
}

interface AgentMessage {
  id: string;
  type: "assistant" | "user" | "result" | "system";
  content: unknown;
  timestamp: number;
}

interface PermissionRequest {
  requestId: string;
  toolName: string;
  args: unknown;
  description?: string;
}

type AgentStatusType = "idle" | "running" | "waiting_permission" | "error";

interface AgentStartConfig {
  initialPrompt: string;
  tools?: string[];
  systemPrompt?: string;
}

interface StreamMessage {
  type: string;
  data: unknown;
  timestamp: number;
}

interface StatusUpdate {
  type: "tool_completed" | "completed" | "error";
  tool?: string;
  error?: string;
  timestamp: number;
}

// ============================================================================
// Electron API Type Declaration
// ============================================================================

declare global {
  interface Window {
    electronAPI: {
      agent: {
        start: (config: AgentStartConfig) => Promise<{ success: boolean; error?: string }>;
        stop: () => Promise<{ success: boolean }>;
        sendMessage: (message: string) => Promise<{ success: boolean; error?: string }>;
        respondToPermission: (response: { requestId: string; approved: boolean }) => void;
        onStream: (callback: (message: StreamMessage) => void) => () => void;
        onPermission: (callback: (request: PermissionRequest) => void) => () => void;
        onStatus: (callback: (status: StatusUpdate) => void) => () => void;
      };
    };
  }
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: AgentState = {
  isRunning: false,
  messages: [],
  pendingPermission: null,
  error: null,
  status: "idle",
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function useAgent() {
  const [state, setState] = useState<AgentState>(initialState);
  const messagesRef = useRef<AgentMessage[]>([]);
  const messageIdCounter = useRef(0);

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  // Subscribe to IPC events
  useEffect(() => {
    // Stream message handler
    const unsubscribeStream = window.electronAPI.agent.onStream(
      (message: StreamMessage) => {
        const newMessage: AgentMessage = {
          id: generateMessageId(),
          type: mapMessageType(message.type),
          content: message.data,
          timestamp: message.timestamp,
        };

        messagesRef.current = [...messagesRef.current, newMessage];
        setState((prev) => ({
          ...prev,
          messages: messagesRef.current,
        }));
      },
    );

    // Permission request handler
    const unsubscribePermission = window.electronAPI.agent.onPermission(
      (request: PermissionRequest) => {
        setState((prev) => ({
          ...prev,
          pendingPermission: request,
          status: "waiting_permission",
        }));
      },
    );

    // Status update handler
    const unsubscribeStatus = window.electronAPI.agent.onStatus(
      (status: StatusUpdate) => {
        switch (status.type) {
          case "completed":
            setState((prev) => ({
              ...prev,
              isRunning: false,
              status: "idle",
            }));
            break;

          case "error":
            setState((prev) => ({
              ...prev,
              isRunning: false,
              error: status.error || "Unknown error occurred",
              status: "error",
            }));
            break;

          case "tool_completed":
            // Optional: Add tool completion to messages
            if (status.tool) {
              const toolMessage: AgentMessage = {
                id: generateMessageId(),
                type: "system",
                content: { tool: status.tool, status: "completed" },
                timestamp: status.timestamp,
              };
              messagesRef.current = [...messagesRef.current, toolMessage];
              setState((prev) => ({
                ...prev,
                messages: messagesRef.current,
              }));
            }
            break;
        }
      },
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeStream();
      unsubscribePermission();
      unsubscribeStatus();
    };
  }, [generateMessageId]);

  // Start agent
  const startAgent = useCallback(
    async (prompt: string, tools?: string[]) => {
      // Reset state
      messagesRef.current = [];
      setState({
        ...initialState,
        isRunning: true,
        status: "running",
      });

      // Add user message
      const userMessage: AgentMessage = {
        id: generateMessageId(),
        type: "user",
        content: prompt,
        timestamp: Date.now(),
      };
      messagesRef.current = [userMessage];
      setState((prev) => ({
        ...prev,
        messages: messagesRef.current,
      }));

      // Start agent via IPC
      const result = await window.electronAPI.agent.start({
        initialPrompt: prompt,
        tools,
      });

      if (!result.success) {
        setState((prev) => ({
          ...prev,
          isRunning: false,
          error: result.error || "Failed to start agent",
          status: "error",
        }));
      }

      return result;
    },
    [generateMessageId],
  );

  // Stop agent
  const stopAgent = useCallback(async () => {
    const result = await window.electronAPI.agent.stop();

    setState((prev) => ({
      ...prev,
      isRunning: false,
      status: "idle",
    }));

    return result;
  }, []);

  // Send additional message
  const sendMessage = useCallback(
    async (message: string) => {
      if (!state.isRunning) {
        return { success: false, error: "Agent is not running" };
      }

      // Add user message
      const userMessage: AgentMessage = {
        id: generateMessageId(),
        type: "user",
        content: message,
        timestamp: Date.now(),
      };
      messagesRef.current = [...messagesRef.current, userMessage];
      setState((prev) => ({
        ...prev,
        messages: messagesRef.current,
      }));

      return window.electronAPI.agent.sendMessage(message);
    },
    [state.isRunning, generateMessageId],
  );

  // Respond to permission request
  const respondToPermission = useCallback(
    (approved: boolean) => {
      if (!state.pendingPermission) {
        return;
      }

      window.electronAPI.agent.respondToPermission({
        requestId: state.pendingPermission.requestId,
        approved,
      });

      setState((prev) => ({
        ...prev,
        pendingPermission: null,
        status: prev.isRunning ? "running" : "idle",
      }));
    },
    [state.pendingPermission],
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    messagesRef.current = [];
    setState((prev) => ({
      ...prev,
      messages: [],
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
      status: prev.isRunning ? "running" : "idle",
    }));
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    messagesRef.current = [];
    messageIdCounter.current = 0;
    setState(initialState);
  }, []);

  return {
    // State
    isRunning: state.isRunning,
    messages: state.messages,
    pendingPermission: state.pendingPermission,
    error: state.error,
    status: state.status,

    // Actions
    startAgent,
    stopAgent,
    sendMessage,
    respondToPermission,
    clearMessages,
    clearError,
    reset,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

function mapMessageType(type: string): AgentMessage["type"] {
  switch (type) {
    case "assistant":
    case "partial":
      return "assistant";
    case "user":
      return "user";
    case "result":
      return "result";
    default:
      return "system";
  }
}

// ============================================================================
// Export Types
// ============================================================================

export type {
  AgentState,
  AgentMessage,
  PermissionRequest,
  AgentStatusType,
  AgentStartConfig,
};
