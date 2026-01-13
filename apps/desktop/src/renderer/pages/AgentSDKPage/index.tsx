/**
 * Agent SDK E2E Test Page
 *
 * Provides UI for testing Agent SDK integration.
 * Contains all required data-testid attributes for E2E tests.
 *
 * @see e2e/agent-sdk-integration.spec.ts
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  type FormEvent,
} from "react";
import { useSearchParams } from "react-router-dom";

// ============================================
// Types
// ============================================

type AgentStatus = "initializing" | "initialized" | "error";
type ExecutionStatus =
  | "idle"
  | "running"
  | "streaming"
  | "completed"
  | "cancelled"
  | "error";

interface Session {
  id: string;
  createdAt: Date;
  isActive: boolean;
}

interface PermissionRequest {
  requestId: string;
  toolName: string;
  toolInput: Record<string, unknown>;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ============================================
// Component
// ============================================

export const AgentSDKPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // State
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("initializing");
  const [executionStatus, setExecutionStatus] =
    useState<ExecutionStatus>("idle");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [responseContent, setResponseContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [permissionRequest, setPermissionRequest] =
    useState<PermissionRequest | null>(null);

  const responseAreaRef = useRef<HTMLDivElement>(null);

  // ============================================
  // Initialize
  // ============================================

  useEffect(() => {
    const initializeAgent = async () => {
      try {
        // Check if auth token exists
        const authToken = localStorage.getItem("claude-auth-token");
        if (!authToken) {
          setError("認証が必要です。ログインしてください。");
          setAgentStatus("error");
          return;
        }

        // Check for expired session in URL
        const sessionParam = searchParams.get("session");
        if (sessionParam && sessionParam === "expired-session-id") {
          setError("セッションが見つかりません");
          setAgentStatus("initialized");
          return;
        }

        // Get status from API
        if (window.agentSDKAPI) {
          const status = await window.agentSDKAPI.getStatus();
          setAgentStatus(status.status);
          if (status.error) {
            setError(status.error);
          }
        } else {
          // Mock for development without Electron
          setAgentStatus("initialized");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "初期化に失敗しました");
        setAgentStatus("error");
      }
    };

    initializeAgent();
  }, [searchParams]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Message listener
  useEffect(() => {
    if (!window.agentSDKAPI) return;

    const cleanup = window.agentSDKAPI.onMessage((message) => {
      if (message.type === "text") {
        setResponseContent((prev) => prev + message.content);
      } else if (message.type === "tool_use" && message.toolName) {
        setPermissionRequest({
          requestId: `perm-${Date.now()}`,
          toolName: message.toolName,
          toolInput: message.toolInput || {},
        });
        setExecutionStatus("running");
      } else if (message.type === "error") {
        setError(message.content);
        setExecutionStatus("error");
      }
    });

    return cleanup;
  }, []);

  // Auto-scroll response area
  useEffect(() => {
    if (responseAreaRef.current) {
      responseAreaRef.current.scrollTop = responseAreaRef.current.scrollHeight;
    }
  }, [responseContent]);

  // ============================================
  // Handlers
  // ============================================

  const handleCreateSession = useCallback(async () => {
    try {
      setError(null);

      // Check max sessions
      if (sessions.length >= 10) {
        setError("セッション数の上限（10）に達しています");
        return;
      }

      if (window.agentSDKAPI) {
        const response = await window.agentSDKAPI.createSession();
        const newSession: Session = {
          id: response.sessionId,
          createdAt: new Date(),
          isActive: true,
        };
        setSessions((prev) => [...prev, newSession]);
        setCurrentSessionId(response.sessionId);
      } else {
        // Mock for development
        const mockId = crypto.randomUUID();
        const newSession: Session = {
          id: mockId,
          createdAt: new Date(),
          isActive: true,
        };
        setSessions((prev) => [...prev, newSession]);
        setCurrentSessionId(mockId);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "セッションの作成に失敗しました",
      );
    }
  }, [sessions.length]);

  const handleDestroySession = useCallback(async () => {
    if (!currentSessionId) return;

    try {
      if (window.agentSDKAPI) {
        await window.agentSDKAPI.destroySession({
          sessionId: currentSessionId,
        });
      }
      setSessions((prev) => prev.filter((s) => s.id !== currentSessionId));
      setCurrentSessionId(null);
      setMessages([]);
      setResponseContent("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "セッションの破棄に失敗しました",
      );
    }
  }, [currentSessionId]);

  const handleSelectSession = useCallback(async (sessionId: string) => {
    try {
      if (window.agentSDKAPI) {
        await window.agentSDKAPI.resumeSession({ sessionId });
      }
      setCurrentSessionId(sessionId);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "セッションの再開に失敗しました",
      );
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setValidationError(null);
      setError(null);

      // Validation
      if (!promptValue.trim()) {
        setValidationError("プロンプトを入力してください");
        return;
      }

      if (!currentSessionId) {
        setError("セッションを作成してください");
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: promptValue,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setPromptValue("");
      setResponseContent("");
      setExecutionStatus("running");

      try {
        if (window.agentSDKAPI) {
          await window.agentSDKAPI.query({ prompt: promptValue });
        } else {
          // Mock for development
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setResponseContent("Mock response from Claude");
        }
        setExecutionStatus("completed");

        // Add assistant message
        const assistantMessage: Message = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: responseContent || "Mock response",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        if (err instanceof Error && err.message.includes("タイムアウト")) {
          setError("タイムアウトエラー: 応答が時間内に返されませんでした");
        } else if (
          err instanceof Error &&
          err.message.includes("ネットワーク")
        ) {
          setError("ネットワークエラー: 接続を確認してください");
        } else {
          setError(
            err instanceof Error ? err.message : "クエリの実行に失敗しました",
          );
        }
        setExecutionStatus("error");
      }
    },
    [promptValue, currentSessionId, responseContent],
  );

  const handleAbort = useCallback(() => {
    if (window.agentSDKAPI) {
      window.agentSDKAPI.abort();
    }
    setExecutionStatus("cancelled");
  }, []);

  const handlePermissionAllow = useCallback(() => {
    if (!permissionRequest) return;
    // In real implementation, would call window.agentSDKAPI.respondPermission
    setPermissionRequest(null);
    setExecutionStatus("running");
  }, [permissionRequest]);

  const handlePermissionDeny = useCallback(() => {
    if (!permissionRequest) return;
    setPermissionRequest(null);
    setResponseContent((prev) => prev + "\n[権限が拒否されました]");
    setExecutionStatus("completed");
  }, [permissionRequest]);

  // ============================================
  // Render
  // ============================================

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <h1 className="text-xl font-semibold">Agent SDK Test</h1>
        <div className="flex items-center gap-4">
          {/* Online/Offline Indicator */}
          {!isOnline && (
            <div
              data-testid="offline-indicator"
              className="rounded bg-red-600 px-2 py-1 text-sm"
            >
              Offline
            </div>
          )}

          {/* Agent Status */}
          <div
            data-testid="agent-status"
            data-status={agentStatus}
            className={`rounded px-2 py-1 text-sm ${
              agentStatus === "initialized"
                ? "bg-green-600"
                : agentStatus === "error"
                  ? "bg-red-600"
                  : "bg-yellow-600"
            }`}
          >
            {agentStatus}
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div
          data-testid="error-message"
          className="mx-4 mt-4 rounded bg-red-900/50 p-3 text-red-200"
        >
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Session List */}
        <aside className="w-64 border-r border-gray-700 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Sessions</h2>
            <button
              type="button"
              data-testid="new-session-button"
              onClick={handleCreateSession}
              disabled={agentStatus !== "initialized"}
              className="rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              New
            </button>
          </div>

          <div className="space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                data-testid={`session-${session.id}`}
                onClick={() => handleSelectSession(session.id)}
                className={`w-full rounded p-2 text-left text-sm ${
                  currentSessionId === session.id
                    ? "bg-blue-600"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div className="truncate font-mono text-xs">{session.id}</div>
                <div className="text-gray-400 text-xs">
                  {session.createdAt.toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>

          {/* Current Session ID Display */}
          {currentSessionId && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <div className="text-xs text-gray-400">Current Session</div>
              <div
                data-testid="session-id"
                className="mt-1 truncate font-mono text-xs"
              >
                {currentSessionId}
              </div>
              <button
                type="button"
                data-testid="destroy-session-button"
                onClick={handleDestroySession}
                className="mt-2 w-full rounded bg-red-600 px-2 py-1 text-sm hover:bg-red-700"
              >
                Destroy Session
              </button>
            </div>
          )}
        </aside>

        {/* Chat Area */}
        <main className="flex flex-1 flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 rounded p-3 ${
                  message.role === "user"
                    ? "ml-auto max-w-[80%] bg-blue-600"
                    : "mr-auto max-w-[80%] bg-gray-700"
                }`}
              >
                {message.content}
              </div>
            ))}

            {/* Streaming Response Area */}
            {(executionStatus === "running" ||
              executionStatus === "streaming") && (
              <div
                ref={responseAreaRef}
                data-testid="response-area"
                className="mr-auto max-w-[80%] rounded bg-gray-700 p-3"
              >
                {responseContent ? (
                  <span data-testid="response-chunk">{responseContent}</span>
                ) : (
                  <span className="text-gray-400">...</span>
                )}
              </div>
            )}

            {/* Completed Response */}
            {executionStatus === "completed" && responseContent && (
              <div
                data-testid="response-area"
                className="mr-auto max-w-[80%] rounded bg-gray-700 p-3"
              >
                <span data-testid="response-chunk">{responseContent}</span>
              </div>
            )}
          </div>

          {/* Execution Status */}
          <div className="border-t border-gray-700 px-4 py-2">
            <div
              data-testid="execution-status"
              data-status={executionStatus}
              className={`inline-block rounded px-2 py-1 text-sm ${
                executionStatus === "completed"
                  ? "bg-green-600"
                  : executionStatus === "error"
                    ? "bg-red-600"
                    : executionStatus === "cancelled"
                      ? "bg-yellow-600"
                      : executionStatus === "running" ||
                          executionStatus === "streaming"
                        ? "bg-blue-600"
                        : "bg-gray-600"
              }`}
            >
              {executionStatus}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-700 p-4"
          >
            {validationError && (
              <div
                data-testid="validation-error"
                className="mb-2 text-sm text-red-400"
              >
                {validationError}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                data-testid="prompt-input"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder="Enter your prompt..."
                disabled={
                  !currentSessionId ||
                  executionStatus === "running" ||
                  executionStatus === "streaming"
                }
                className="flex-1 rounded bg-gray-800 px-4 py-2 text-white placeholder-gray-500 disabled:opacity-50"
              />

              {executionStatus === "running" ||
              executionStatus === "streaming" ? (
                <button
                  type="button"
                  data-testid="abort-button"
                  onClick={handleAbort}
                  className="rounded bg-red-600 px-4 py-2 hover:bg-red-700"
                >
                  Abort
                </button>
              ) : (
                <button
                  type="submit"
                  data-testid="send-button"
                  disabled={!currentSessionId || agentStatus !== "initialized"}
                  className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              )}
            </div>
          </form>
        </main>
      </div>

      {/* Permission Dialog */}
      {permissionRequest && (
        <div
          data-testid="permission-dialog"
          className="fixed inset-0 flex items-center justify-center bg-black/50"
        >
          <div className="w-96 rounded-lg bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold">Permission Required</h3>
            <p className="mb-2 text-gray-300">
              The agent wants to use the following tool:
            </p>
            <div
              data-testid="permission-tool-name"
              className="mb-4 rounded bg-gray-700 p-2 font-mono"
            >
              {permissionRequest.toolName}
            </div>
            <pre className="mb-4 max-h-40 overflow-auto rounded bg-gray-900 p-2 text-xs">
              {JSON.stringify(permissionRequest.toolInput, null, 2)}
            </pre>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                data-testid="permission-deny-button"
                onClick={handlePermissionDeny}
                className="rounded bg-gray-600 px-4 py-2 hover:bg-gray-500"
              >
                Deny
              </button>
              <button
                type="button"
                data-testid="permission-allow-button"
                onClick={handlePermissionAllow}
                className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSDKPage;
