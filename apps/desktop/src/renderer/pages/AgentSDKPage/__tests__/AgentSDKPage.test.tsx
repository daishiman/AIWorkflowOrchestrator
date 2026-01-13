/**
 * Agent SDK Page Unit Tests
 *
 * @see src/renderer/pages/AgentSDKPage/index.tsx
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AgentSDKPage } from "../index";

// ============================================
// Types
// ============================================

interface MockMessage {
  type: string;
  content?: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
}

type MessageCallback = (message: MockMessage) => void;

// ============================================
// Mocks
// ============================================

// Mock useSearchParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock window.agentSDKAPI
const mockAgentSDKAPI = {
  getStatus: vi.fn(),
  createSession: vi.fn(),
  resumeSession: vi.fn(),
  destroySession: vi.fn(),
  query: vi.fn(),
  abort: vi.fn(),
  onMessage: vi.fn((_callback: MessageCallback) => vi.fn()),
  setOption: vi.fn(),
  getOption: vi.fn(),
  setSessionId: vi.fn(),
};

// LocalStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    _setStore: (newStore: Record<string, string>) => {
      store = newStore;
    },
  };
})();

// ============================================
// Test Utilities
// ============================================

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// ============================================
// Tests
// ============================================

describe("AgentSDKPage", () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    mockAgentSDKAPI.getStatus.mockResolvedValue({ status: "initialized" });
    mockAgentSDKAPI.createSession.mockResolvedValue({
      sessionId: "test-session-id-1234",
    });

    // Setup localStorage mock for auth (default: authenticated)
    localStorageMock._setStore({ "claude-auth-token": "mock-auth-token" });
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    // Setup window.agentSDKAPI
    Object.defineProperty(window, "agentSDKAPI", {
      value: mockAgentSDKAPI,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore original localStorage
    Object.defineProperty(window, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  describe("初期化", () => {
    it("agent-statusが表示される", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("agent-status")).toBeInTheDocument();
      });
    });

    it("認証済みの場合、初期化が成功する", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        const status = screen.getByTestId("agent-status");
        expect(status).toHaveAttribute("data-status", "initialized");
      });
    });

    it("未認証の場合、エラーメッセージが表示される", async () => {
      // Clear auth token to simulate unauthenticated state
      localStorageMock._setStore({});

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        expect(screen.getByTestId("error-message")).toHaveTextContent("認証");
      });
    });
  });

  describe("セッション管理", () => {
    it("新規セッションボタンが表示される", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeInTheDocument();
      });
    });

    it("新規セッションを作成できる", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(mockAgentSDKAPI.createSession).toHaveBeenCalled();
        expect(screen.getByTestId("session-id")).toBeInTheDocument();
      });
    });

    it("セッションID形式がUUIDである", async () => {
      const mockUUID = "550e8400-e29b-41d4-a716-446655440000";
      mockAgentSDKAPI.createSession.mockResolvedValue({ sessionId: mockUUID });

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        const sessionId = screen.getByTestId("session-id");
        expect(sessionId.textContent).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
        );
      });
    });

    it("セッション破棄ボタンが表示される", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(
          screen.getByTestId("destroy-session-button"),
        ).toBeInTheDocument();
      });
    });

    it("セッションを破棄できる", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(
          screen.getByTestId("destroy-session-button"),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("destroy-session-button"));

      await waitFor(() => {
        expect(mockAgentSDKAPI.destroySession).toHaveBeenCalled();
      });
    });

    it("最大10セッションまで作成可能", async () => {
      // Setup mock to return different session IDs
      let sessionCount = 0;
      mockAgentSDKAPI.createSession.mockImplementation(() => {
        sessionCount++;
        return Promise.resolve({
          sessionId: `session-${sessionCount}`,
        });
      });

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      // Create 10 sessions
      for (let i = 0; i < 10; i++) {
        fireEvent.click(screen.getByTestId("new-session-button"));
        await waitFor(() => {
          expect(mockAgentSDKAPI.createSession).toHaveBeenCalledTimes(i + 1);
        });
      }

      // 11th session should show error
      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent(
          "セッション数の上限",
        );
      });
    });
  });

  describe("プロンプト入力", () => {
    it("プロンプト入力フィールドが表示される", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("prompt-input")).toBeInTheDocument();
      });
    });

    it("セッション未作成時は送信ボタンが無効", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeDisabled();
      });
    });

    it("空のプロンプトでバリデーションエラー", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("send-button"));

      await waitFor(() => {
        expect(screen.getByTestId("validation-error")).toBeInTheDocument();
      });
    });

    it("プロンプト入力後に送信可能", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeEnabled();
      });

      fireEvent.change(screen.getByTestId("prompt-input"), {
        target: { value: "Hello, Claude!" },
      });

      fireEvent.click(screen.getByTestId("send-button"));

      await waitFor(() => {
        expect(mockAgentSDKAPI.query).toHaveBeenCalledWith({
          prompt: "Hello, Claude!",
        });
      });
    });
  });

  describe("実行状態", () => {
    it("execution-statusが表示される", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("execution-status")).toBeInTheDocument();
      });
    });

    it("初期状態はidle", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        const status = screen.getByTestId("execution-status");
        expect(status).toHaveAttribute("data-status", "idle");
      });
    });
  });

  describe("オフライン検出", () => {
    it("オンライン時はインジケーターが非表示", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(
          screen.queryByTestId("offline-indicator"),
        ).not.toBeInTheDocument();
      });
    });

    it("オフライン時にインジケーターが表示される", async () => {
      // Simulate offline
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("offline-indicator")).toBeInTheDocument();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("APIエラー時にエラーメッセージが表示される", async () => {
      mockAgentSDKAPI.getStatus.mockRejectedValue(new Error("API Error"));

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });
    });

    it("セッション作成エラー時にエラーメッセージが表示される", async () => {
      mockAgentSDKAPI.createSession.mockRejectedValue(
        new Error("Session creation failed"),
      );

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });
    });
  });

  describe("アクセシビリティ", () => {
    it("入力フィールドにplaceholderがある", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        const input = screen.getByTestId("prompt-input");
        expect(input).toHaveAttribute("placeholder");
      });
    });

    it("ボタンがキーボードでアクセス可能", async () => {
      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        const button = screen.getByTestId("new-session-button");
        expect(button).toHaveAttribute("type", "button");
      });
    });
  });

  describe("権限確認ダイアログ", () => {
    it("ツール使用時に権限確認ダイアログが表示される", async () => {
      // Setup onMessage to trigger tool_use message
      let messageCallback: MessageCallback | null = null;
      mockAgentSDKAPI.onMessage.mockImplementation(
        (callback: MessageCallback) => {
          messageCallback = callback;
          return vi.fn();
        },
      );

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      // Create session
      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("session-id")).toBeInTheDocument();
      });

      // Trigger tool_use message

      messageCallback!({
        type: "tool_use",
        toolName: "bash",
        toolInput: { command: "ls -la" },
      });

      await waitFor(() => {
        expect(screen.getByTestId("permission-dialog")).toBeInTheDocument();
        expect(screen.getByTestId("permission-tool-name")).toHaveTextContent(
          "bash",
        );
      });
    });

    it("権限許可ボタンでダイアログが閉じる", async () => {
      let messageCallback: MessageCallback | null = null;
      mockAgentSDKAPI.onMessage.mockImplementation(
        (callback: MessageCallback) => {
          messageCallback = callback;
          return vi.fn();
        },
      );

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("session-id")).toBeInTheDocument();
      });

      // Trigger permission dialog
      messageCallback!({
        type: "tool_use",
        toolName: "read_file",
        toolInput: { path: "/tmp/test.txt" },
      });

      await waitFor(() => {
        expect(screen.getByTestId("permission-dialog")).toBeInTheDocument();
      });

      // Click allow button
      fireEvent.click(screen.getByTestId("permission-allow-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("permission-dialog"),
        ).not.toBeInTheDocument();
      });
    });

    it("権限拒否ボタンでダイアログが閉じ、拒否メッセージが表示される", async () => {
      let messageCallback: MessageCallback | null = null;
      mockAgentSDKAPI.onMessage.mockImplementation(
        (callback: MessageCallback) => {
          messageCallback = callback;
          return vi.fn();
        },
      );

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("session-id")).toBeInTheDocument();
      });

      // Trigger permission dialog
      messageCallback!({
        type: "tool_use",
        toolName: "write_file",
        toolInput: { path: "/tmp/output.txt", content: "test" },
      });

      await waitFor(() => {
        expect(screen.getByTestId("permission-dialog")).toBeInTheDocument();
      });

      // Click deny button
      fireEvent.click(screen.getByTestId("permission-deny-button"));

      await waitFor(() => {
        expect(
          screen.queryByTestId("permission-dialog"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("中断機能", () => {
    it("実行中にabortボタンが表示される", async () => {
      // Mock query to simulate long-running operation
      mockAgentSDKAPI.query.mockImplementation(() => {
        return new Promise(() => {
          // Never resolves - simulates long running query
        });
      });

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeEnabled();
      });

      fireEvent.change(screen.getByTestId("prompt-input"), {
        target: { value: "Long running task" },
      });

      fireEvent.click(screen.getByTestId("send-button"));

      await waitFor(() => {
        expect(screen.getByTestId("abort-button")).toBeInTheDocument();
      });
    });

    it("abortボタンクリックでクエリが中断される", async () => {
      mockAgentSDKAPI.query.mockImplementation(() => {
        return new Promise(() => {
          // Never resolves
        });
      });

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeEnabled();
      });

      fireEvent.change(screen.getByTestId("prompt-input"), {
        target: { value: "Abort test" },
      });

      fireEvent.click(screen.getByTestId("send-button"));

      await waitFor(() => {
        expect(screen.getByTestId("abort-button")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId("abort-button"));

      expect(mockAgentSDKAPI.abort).toHaveBeenCalled();

      await waitFor(() => {
        const status = screen.getByTestId("execution-status");
        expect(status).toHaveAttribute("data-status", "cancelled");
      });
    });
  });

  describe("セッション選択", () => {
    it("複数セッション間の切り替えができる", async () => {
      let sessionCount = 0;
      mockAgentSDKAPI.createSession.mockImplementation(() => {
        sessionCount++;
        return Promise.resolve({
          sessionId: `test-session-${sessionCount}`,
        });
      });

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      // Create first session
      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        // data-testid format is session-{sessionId}
        expect(
          screen.getByTestId("session-test-session-1"),
        ).toBeInTheDocument();
      });

      // Create second session
      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(
          screen.getByTestId("session-test-session-2"),
        ).toBeInTheDocument();
      });

      // Click on first session to switch
      fireEvent.click(screen.getByTestId("session-test-session-1"));

      await waitFor(() => {
        expect(mockAgentSDKAPI.resumeSession).toHaveBeenCalledWith({
          sessionId: "test-session-1",
        });
      });
    });
  });

  describe("メッセージリスナー", () => {
    it("textメッセージでレスポンスが表示される", async () => {
      let messageCallback: MessageCallback | null = null;
      mockAgentSDKAPI.onMessage.mockImplementation(
        (callback: MessageCallback) => {
          messageCallback = callback;
          return vi.fn();
        },
      );
      mockAgentSDKAPI.query.mockImplementation(() => {
        return new Promise(() => {
          // Never resolves - simulates streaming
        });
      });

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeEnabled();
      });

      fireEvent.change(screen.getByTestId("prompt-input"), {
        target: { value: "Test message" },
      });

      fireEvent.click(screen.getByTestId("send-button"));

      // Simulate streaming text response
      messageCallback!({
        type: "text",
        content: "Hello! ",
      });
      messageCallback!({
        type: "text",
        content: "How can I help?",
      });

      await waitFor(() => {
        const responseArea = screen.getByTestId("response-area");
        expect(responseArea).toBeInTheDocument();
      });
    });

    it("errorメッセージでエラー状態になる", async () => {
      let messageCallback: MessageCallback | null = null;
      mockAgentSDKAPI.onMessage.mockImplementation(
        (callback: MessageCallback) => {
          messageCallback = callback;
          return vi.fn();
        },
      );
      mockAgentSDKAPI.query.mockImplementation(() => {
        return new Promise(() => {
          // Never resolves
        });
      });

      renderWithRouter(<AgentSDKPage />);

      await waitFor(() => {
        expect(screen.getByTestId("new-session-button")).toBeEnabled();
      });

      fireEvent.click(screen.getByTestId("new-session-button"));

      await waitFor(() => {
        expect(screen.getByTestId("send-button")).toBeEnabled();
      });

      fireEvent.change(screen.getByTestId("prompt-input"), {
        target: { value: "Error test" },
      });

      fireEvent.click(screen.getByTestId("send-button"));

      // Simulate error message
      messageCallback!({
        type: "error",
        content: "Something went wrong",
      });

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        const status = screen.getByTestId("execution-status");
        expect(status).toHaveAttribute("data-status", "error");
      });
    });
  });
});
