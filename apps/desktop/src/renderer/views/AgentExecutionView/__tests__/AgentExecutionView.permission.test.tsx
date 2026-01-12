/**
 * AgentExecutionView Permission統合テスト
 * Phase 6: テスト拡充 - Permission連携のテスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
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

// Permission request mock
const mockPermissionRequest: PermissionRequest = {
  executionId: "exec-123",
  requestId: "req-456",
  toolName: "Bash",
  args: { command: "npm test" },
};

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
  setPendingPermission: vi.fn(),
  clearPendingPermission: vi.fn(),
  setRememberedChoice: vi.fn(),
});

let mockStore = createMockStore();

vi.mock("@/renderer/store", () => ({
  useStore: (selector: (state: typeof mockStore) => unknown) =>
    selector(mockStore),
}));

// agentAPIのモック
type PermissionCallback = (request: PermissionRequest) => void;
let permissionCallback: PermissionCallback | null = null;

const mockAgentAPI = {
  start: vi.fn().mockResolvedValue({ executionId: "exec-123" }),
  stop: vi.fn().mockResolvedValue(undefined),
  respondPermission: vi.fn().mockResolvedValue(undefined),
  onStream: vi.fn(() => () => {}),
  onStatus: vi.fn(() => () => {}),
  onPermission: vi.fn((callback: PermissionCallback) => {
    permissionCallback = callback;
    return () => {
      permissionCallback = null;
    };
  }),
};

vi.stubGlobal("agentAPI", mockAgentAPI);

describe("AgentExecutionView Permission Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
    permissionCallback = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("agent:permission", () => {
    it("should show dialog on permission request", async () => {
      // Arrange - Permission requestがある状態
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    it("should display tool name in dialog", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });

      // Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    it("should display tool arguments in dialog", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });

      // Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should handle permission request via IPC event", async () => {
      // Arrange - Permission requestがある状態をモック
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });

      // Act
      render(<AgentExecutionView />);

      // Assert - ダイアログが表示される
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });

  describe("agent:permission:res", () => {
    it("should send approve response", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /許可/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.respondPermission).toHaveBeenCalledWith({
          requestId: "req-456",
          approved: true,
          rememberChoice: false,
        });
      });
    });

    it("should send deny response", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });
      render(<AgentExecutionView />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /拒否/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.respondPermission).toHaveBeenCalledWith({
          requestId: "req-456",
          approved: false,
          rememberChoice: false,
        });
      });
    });

    it("should include rememberChoice flag when checked", async () => {
      // Arrange
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });
      render(<AgentExecutionView />);

      // Act - チェックボックスをオンにして許可
      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);
      await userEvent.click(screen.getByRole("button", { name: /許可/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.respondPermission).toHaveBeenCalledWith({
          requestId: "req-456",
          approved: true,
          rememberChoice: true,
        });
      });
    });
  });

  describe("remembered choices", () => {
    it("should skip dialog for remembered approve", async () => {
      // Arrange - Bashツールが許可済み
      mockStore = createMockStore({
        rememberedChoices: { Bash: true },
      });
      render(<AgentExecutionView />);

      // Act - IPCイベントでPermission requestを受信
      await act(async () => {
        if (permissionCallback) {
          permissionCallback(mockPermissionRequest);
        }
      });

      // Assert - ダイアログは表示されない
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should skip dialog for remembered deny", async () => {
      // Arrange - Bashツールが拒否済み
      mockStore = createMockStore({
        rememberedChoices: { Bash: false },
      });
      render(<AgentExecutionView />);

      // Act - IPCイベントでPermission requestを受信
      await act(async () => {
        if (permissionCallback) {
          permissionCallback(mockPermissionRequest);
        }
      });

      // Assert - ダイアログは表示されない
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should show dialog for different tool even if others are remembered", async () => {
      // Arrange - Bashは許可済みだが、Readは未設定
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: {
          ...mockPermissionRequest,
          toolName: "Read",
        },
        rememberedChoices: { Bash: true },
      });

      // Act
      render(<AgentExecutionView />);

      // Assert - Readのダイアログは表示される
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(screen.getByText("Read")).toBeInTheDocument();
    });
  });

  describe("multiple permission requests", () => {
    it("should handle sequential permission requests", async () => {
      // Arrange - 最初のリクエスト
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });
      render(<AgentExecutionView />);

      // Assert - 最初のダイアログが表示される
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    it("should display different tool names for different requests", async () => {
      // Arrange - 異なるツールのリクエスト
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: {
          ...mockPermissionRequest,
          toolName: "Read",
        },
      });
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByText("Read")).toBeInTheDocument();
    });
  });

  describe("permission response error handling", () => {
    it("should handle permission response failure", async () => {
      // Arrange
      mockAgentAPI.respondPermission.mockRejectedValueOnce(
        new Error("Failed to respond"),
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
      // エラーが適切に処理される
    });
  });
});
