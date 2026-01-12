/**
 * AgentExecutionView コンポーネントテスト
 * TDD: Red Phase - 実装前にテストを作成
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
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
const mockStore = {
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
};

vi.mock("@/renderer/store", () => ({
  useStore: (selector: (state: typeof mockStore) => unknown) =>
    selector(mockStore),
}));

// agentAPIのモック
const mockAgentAPI = {
  start: vi.fn(),
  stop: vi.fn(),
  respondPermission: vi.fn(),
  onStream: vi.fn(),
  onStatus: vi.fn(),
  onPermission: vi.fn(),
};

vi.stubGlobal("agentAPI", mockAgentAPI);

describe("AgentExecutionView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render skill header", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByText("Test Skill")).toBeInTheDocument();
    });

    it("should render chat interface", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByRole("log")).toBeInTheDocument();
    });

    it("should render message input", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("should render execution controls", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert - クリアボタンは常に表示（メッセージがあれば）
      // 初期状態ではメッセージがないので非表示かもしれない
      expect(
        screen.getByRole("region", { name: /実行コントロール/i }),
      ).toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("should navigate back when back button clicked", async () => {
      // Arrange
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /戻る|back/i }));

      // Assert
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("should display current skill name", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByText("Test Skill")).toBeInTheDocument();
    });
  });

  describe("message flow", () => {
    it("should send message on submit", async () => {
      // Arrange
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Hello, agent!");
      await userEvent.click(screen.getByRole("button", { name: /送信/i }));

      // Assert
      expect(mockStore.addUserMessage).toHaveBeenCalledWith("Hello, agent!");
      expect(mockAgentAPI.start).toHaveBeenCalled();
    });

    it("should display received messages", () => {
      // Arrange - メッセージがある状態をモック
      mockStore.executionState.messages = [
        {
          id: "msg-1",
          role: "user" as const,
          content: "Test message",
          timestamp: new Date(),
        },
      ];

      // Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByText("Test message")).toBeInTheDocument();
    });
  });

  describe("execution control", () => {
    it("should cancel execution on cancel click", async () => {
      // Arrange - 実行中状態をモック
      mockStore.executionState.status = "executing";
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(
        screen.getByRole("button", { name: /キャンセル/i }),
      );

      // Assert
      expect(mockStore.stopExecution).toHaveBeenCalled();
      expect(mockAgentAPI.stop).toHaveBeenCalled();
    });

    it("should clear messages on clear confirm", async () => {
      // Arrange - メッセージがある状態をモック
      mockStore.executionState.status = "idle";
      mockStore.executionState.messages = [
        {
          id: "msg-1",
          role: "user" as const,
          content: "Test",
          timestamp: new Date(),
        },
      ];
      render(<AgentExecutionView />);

      // Act - クリアボタンをクリック
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

  describe("permission dialog", () => {
    const mockPermissionRequest: PermissionRequest = {
      executionId: "exec-123",
      requestId: "req-456",
      toolName: "Bash",
      args: { command: "npm test" },
    };

    it("should show permission dialog when pending", () => {
      // Arrange - PermissionRequestがある状態をモック
      mockStore.executionState.status = "awaiting_permission";
      mockStore.executionState.pendingPermission = mockPermissionRequest;

      // Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    it("should handle approve", async () => {
      // Arrange
      mockStore.executionState.status = "awaiting_permission";
      mockStore.executionState.pendingPermission = mockPermissionRequest;
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /許可/i }));

      // Assert
      expect(mockAgentAPI.respondPermission).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: true,
        rememberChoice: false,
      });
    });

    it("should handle deny", async () => {
      // Arrange
      mockStore.executionState.status = "awaiting_permission";
      mockStore.executionState.pendingPermission = mockPermissionRequest;
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /拒否/i }));

      // Assert
      expect(mockAgentAPI.respondPermission).toHaveBeenCalledWith({
        requestId: "req-456",
        approved: false,
        rememberChoice: false,
      });
    });
  });
});
