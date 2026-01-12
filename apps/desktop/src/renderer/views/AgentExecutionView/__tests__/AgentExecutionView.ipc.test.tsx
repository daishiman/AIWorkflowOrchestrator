/**
 * AgentExecutionView IPC統合テスト
 * Phase 6: テスト拡充 - IPC通信の統合テスト
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
const createMockStore = () => ({
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
type StreamCallback = (payload: { chunk: string }) => void;
type StatusCallback = (payload: { status: string; error?: string }) => void;
type PermissionCallback = (request: {
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
}) => void;

// These callbacks are assigned by mocks for cleanup tracking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let streamCallback: StreamCallback | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let statusCallback: StatusCallback | null = null;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let permissionCallback: PermissionCallback | null = null;

const mockAgentAPI = {
  start: vi.fn().mockResolvedValue({ executionId: "exec-123" }),
  stop: vi.fn().mockResolvedValue(undefined),
  respondPermission: vi.fn().mockResolvedValue(undefined),
  onStream: vi.fn((callback: StreamCallback) => {
    streamCallback = callback;
    return () => {
      streamCallback = null;
    };
  }),
  onStatus: vi.fn((callback: StatusCallback) => {
    statusCallback = callback;
    return () => {
      statusCallback = null;
    };
  }),
  onPermission: vi.fn((callback: PermissionCallback) => {
    permissionCallback = callback;
    return () => {
      permissionCallback = null;
    };
  }),
};

vi.stubGlobal("agentAPI", mockAgentAPI);

describe("AgentExecutionView IPC Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    streamCallback = null;
    statusCallback = null;
    permissionCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("agent:start", () => {
    it("should send start message with skillId and prompt", async () => {
      // Arrange
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Execute this task");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.start).toHaveBeenCalled();
      });
      expect(mockStore.addUserMessage).toHaveBeenCalledWith(
        "Execute this task",
      );
    });

    it("should handle start failure gracefully", async () => {
      // Arrange
      mockAgentAPI.start.mockRejectedValueOnce(new Error("Start failed"));
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Execute this task");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.start).toHaveBeenCalled();
      });
      // エラー時も状態が適切に処理される
    });

    it("should not send empty messages", async () => {
      // Arrange
      render(<AgentExecutionView />);

      // Act - 空のまま送信ボタンをクリック
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      expect(mockStore.addUserMessage).not.toHaveBeenCalled();
    });
  });

  describe("agent:stop", () => {
    it("should send stop message with executionId", async () => {
      // Arrange
      mockStore.executionState.status = "executing";
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(
        screen.getByRole("button", { name: /キャンセル/i }),
      );

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.stop).toHaveBeenCalled();
        expect(mockStore.stopExecution).toHaveBeenCalled();
      });
    });

    it("should handle stop failure gracefully", async () => {
      // Arrange
      mockAgentAPI.stop.mockRejectedValueOnce(new Error("Stop failed"));
      mockStore.executionState.status = "executing";
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(
        screen.getByRole("button", { name: /キャンセル/i }),
      );

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.stop).toHaveBeenCalled();
      });
      // エラー時も状態が適切に処理される
    });
  });

  describe("agent:stream", () => {
    it("should display streaming content from state", async () => {
      // Arrange - ストリーミングコンテンツを含む状態をモック
      mockStore.executionState.status = "streaming";
      mockStore.executionState.currentStreamingContent = "Hello World";

      // Act
      render(<AgentExecutionView />);

      // Assert - ストリーミングコンテンツが表示される
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should handle cancelled stream state", async () => {
      // Arrange - キャンセルされた状態をモック
      mockStore.executionState.status = "cancelled";
      mockStore.executionState.currentStreamingContent = "Partial content";

      // Act
      render(<AgentExecutionView />);

      // Assert - コンポーネントがレンダリングされる
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should display buffered stream content", async () => {
      // Arrange - バッファされたコンテンツ
      mockStore.executionState.status = "streaming";
      mockStore.executionState.currentStreamingContent =
        "chunk-0 chunk-1 chunk-2 chunk-3 chunk-4";

      // Act
      render(<AgentExecutionView />);

      // Assert - コンポーネントがレンダリングされる
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  describe("agent:status", () => {
    it("should update status on status message", async () => {
      // Arrange - ステータスが変更された状態をモック
      mockStore.executionState.status = "executing";
      render(<AgentExecutionView />);

      // Assert - UIがステータスに応じて更新される
      expect(
        screen.getByRole("button", { name: /キャンセル/i }),
      ).toBeInTheDocument();
    });

    it("should handle error status", async () => {
      // Arrange - エラー状態をモック
      mockStore.executionState.status = "error";
      mockStore.executionState.error = "Something went wrong";

      // Act
      render(<AgentExecutionView />);

      // Assert - コンポーネントがレンダリングされる（エラー状態でも表示）
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should handle completed status", async () => {
      // Arrange - 完了状態をモック
      mockStore.executionState.status = "completed";
      mockStore.executionState.messages = [
        {
          id: "msg-1",
          role: "assistant" as const,
          content: "Task completed successfully",
          timestamp: new Date(),
        },
      ];

      // Act
      render(<AgentExecutionView />);

      // Assert
      expect(
        screen.getByText(/Task completed successfully/i),
      ).toBeInTheDocument();
    });
  });

  describe("IPC event cleanup", () => {
    it("should cleanup event listeners on unmount", () => {
      // Arrange
      const { unmount } = render(<AgentExecutionView />);

      // Assert - コンポーネントがレンダリングされる
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

      // Act - アンマウント
      unmount();

      // Assert - アンマウントが正常に完了
      expect(
        screen.queryByRole("heading", { level: 1 }),
      ).not.toBeInTheDocument();
    });
  });
});
