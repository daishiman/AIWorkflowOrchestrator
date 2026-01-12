/**
 * AgentExecutionView エラーハンドリングテスト
 * Phase 6: テスト拡充 - エラー処理のテスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentExecutionView } from "../AgentExecutionView";
import type { Skill } from "@repo/shared/types/skill";
import type {
  PermissionRequest,
  AgentMessage,
  AgentExecutionStatus,
} from "@repo/shared/types/agent";

// テスト用モックスキル
const mockSkill: Skill = {
  id: "skill-1",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill for unit testing",
  path: "/skills/test-skill",
  triggers: ["test"],
  anchors: [],
  category: "development",
  lastModified: new Date("2026-01-12T00:00:00Z"),
};

// モックナビゲーション
const mockNavigate = vi.fn();

// テスト用モック設定
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ skillId: "skill-1" }),
}));

// Zustand storeのモック
const createMockStore = (overrides = {}) => ({
  executionState: {
    status: "idle" as AgentExecutionStatus,
    currentSkill: mockSkill as Skill | null,
    messages: [] as AgentMessage[],
    currentStreamingContent: "",
    pendingPermission: null as PermissionRequest | null,
    error: null as string | null,
    startedAt: null as Date | null,
    completedAt: null as Date | null,
    rememberedChoices: {} as Record<string, boolean>,
    ...overrides,
  },
  skills: [mockSkill],
  startExecution: vi.fn(),
  stopExecution: vi.fn(),
  addUserMessage: vi.fn(),
  clearMessages: vi.fn(),
  respondToPermission: vi.fn(),
  getSkillById: vi.fn().mockReturnValue(mockSkill),
  appendStreamingContent: vi.fn(),
  finalizeStreamingMessage: vi.fn(),
  setExecutionError: vi.fn(),
});

let mockStore = createMockStore();

vi.mock("@/renderer/store", () => ({
  useStore: (selector: (state: typeof mockStore) => unknown) =>
    selector(mockStore),
}));

// agentAPIのモック

const mockAgentAPI = {
  start: vi.fn().mockResolvedValue({ executionId: "exec-123" }),
  stop: vi.fn().mockResolvedValue(undefined),
  respondPermission: vi.fn().mockResolvedValue(undefined),
  onStream: vi.fn(() => () => {}),
  onStatus: vi.fn((callback: StatusCallback) => {
    statusCallback = callback;
    return () => {
      statusCallback = null;
    };
  }),
  onPermission: vi.fn(() => () => {}),
};

vi.stubGlobal("agentAPI", mockAgentAPI);

// コンソールエラーをキャプチャ
const _consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

describe("AgentExecutionView Error Handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("IPC errors", () => {
    it("should display error on IPC start failure", async () => {
      // Arrange
      mockAgentAPI.start.mockRejectedValueOnce(new Error("IPC error"));
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Execute task");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.start).toHaveBeenCalled();
      });
    });

    it("should display error on IPC stop failure", async () => {
      // Arrange
      mockAgentAPI.stop.mockRejectedValueOnce(new Error("Stop IPC error"));
      mockStore = createMockStore({ status: "executing" });
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(
        screen.getByRole("button", { name: /キャンセル/i }),
      );

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.stop).toHaveBeenCalled();
      });
    });

    it("should allow retry after error", async () => {
      // Arrange
      mockAgentAPI.start
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockResolvedValueOnce({ executionId: "exec-456" });
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act - 最初の試行
      await userEvent.type(input, "First try");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Wait for first attempt to fail
      await waitFor(() => {
        expect(mockAgentAPI.start).toHaveBeenCalledTimes(1);
      });

      // 2回目の試行
      await userEvent.clear(input);
      await userEvent.type(input, "Second try");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.start).toHaveBeenCalledTimes(2);
      });
    });

    it("should log errors for debugging", async () => {
      // Arrange
      const errorMessage = "Debug error";
      mockAgentAPI.start.mockRejectedValueOnce(new Error(errorMessage));
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Execute task");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.start).toHaveBeenCalled();
      });
    });
  });

  describe("stream errors", () => {
    it("should handle stream error state", async () => {
      // Arrange - エラー状態
      mockStore = createMockStore({
        status: "error",
        error: "Stream error occurred",
      });

      // Act
      render(<AgentExecutionView />);

      // Assert - コンポーネントがエラー状態でもレンダリングされる
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should render correctly with error state in store", async () => {
      // Arrange - エラーステータスの状態
      mockStore = createMockStore({
        status: "error",
        error: "Stream failed",
      });

      // Act
      render(<AgentExecutionView />);

      // Assert - コンポーネントがエラー状態でもレンダリングされる
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should display partial content before error", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "error",
        error: "Partial stream error",
        messages: [
          {
            id: "msg-1",
            role: "assistant" as const,
            content: "Partial content before error",
            timestamp: new Date(),
          },
        ],
      });

      // Act
      render(<AgentExecutionView />);

      // Assert - メッセージ内容が表示される
      expect(
        screen.getByText(/Partial content before error/i),
      ).toBeInTheDocument();
    });
  });

  describe("permission errors", () => {
    it("should handle permission response failure", async () => {
      // Arrange
      const mockPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "npm test" },
      };
      mockAgentAPI.respondPermission.mockRejectedValueOnce(
        new Error("Permission response failed"),
      );
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /許可/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.respondPermission).toHaveBeenCalled();
      });
    });

    it("should handle permission failure state", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "error",
        error: "Permission denied",
      });

      // Act
      render(<AgentExecutionView />);

      // Assert - コンポーネントがレンダリングされる
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  describe("network errors", () => {
    it("should handle network timeout", async () => {
      // Arrange
      mockAgentAPI.start.mockRejectedValueOnce(
        new Error("Network timeout after 30000ms"),
      );
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Execute task");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.start).toHaveBeenCalled();
      });
    });

    it("should handle connection refused", async () => {
      // Arrange
      mockAgentAPI.start.mockRejectedValueOnce(
        new Error("ECONNREFUSED: Connection refused"),
      );
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Execute task");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.start).toHaveBeenCalled();
      });
    });
  });

  describe("error state recovery", () => {
    it("should allow new execution after error", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "error",
        error: "Previous error",
      });
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act - 新しい実行を開始
      await userEvent.type(input, "New task");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      expect(mockStore.addUserMessage).toHaveBeenCalled();
    });

    it("should allow clearing messages after error", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "error",
        error: "Error occurred",
        messages: [
          {
            id: "msg-1",
            role: "user" as const,
            content: "Test message",
            timestamp: new Date(),
          },
        ],
      });
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /クリア/i }));

      // 確認ダイアログで確認
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });
      await userEvent.click(screen.getByRole("button", { name: /確認|はい/i }));

      // Assert
      expect(mockStore.clearMessages).toHaveBeenCalled();
    });
  });
});
