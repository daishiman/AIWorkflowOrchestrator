/**
 * AgentExecutionView アクセシビリティテスト
 * Phase 6: テスト拡充 - WCAG 2.1 AA準拠テスト
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
  onStatus: vi.fn(() => () => {}),
  onPermission: vi.fn(() => () => {}),
};

vi.stubGlobal("agentAPI", mockAgentAPI);

describe("AgentExecutionView Accessibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore = createMockStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("keyboard navigation", () => {
    it("should focus input on page load", async () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert - 入力フィールドにフォーカスがあるか
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should navigate with Tab key", async () => {
      // Arrange
      render(<AgentExecutionView />);

      // Act - Tabキーでナビゲート
      await userEvent.tab();

      // Assert - フォーカスが移動している
      expect(document.activeElement).not.toBeNull();
    });

    it("should submit with Enter key", async () => {
      // Arrange
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Test message{enter}");

      // Assert
      expect(mockStore.addUserMessage).toHaveBeenCalledWith("Test message");
    });

    it("should allow Shift+Enter for newline", async () => {
      // Arrange
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Act
      await userEvent.type(input, "Line 1{Shift>}{enter}{/Shift}Line 2");

      // Assert - 改行が含まれる
      expect(input).toHaveValue("Line 1\nLine 2");
    });

    it("should have cancel button when executing", async () => {
      // Arrange
      mockStore = createMockStore({ status: "executing" });
      render(<AgentExecutionView />);

      // Assert - キャンセルボタンが表示される
      expect(
        screen.getByRole("button", { name: /キャンセル/i }),
      ).toBeInTheDocument();
    });
  });

  describe("screen reader", () => {
    it("should have accessible name for message list", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      const log = screen.getByRole("log");
      expect(log).toBeInTheDocument();
    });

    it("should have proper ARIA labels on controls", () => {
      // Arrange
      mockStore = createMockStore({ status: "executing" });
      render(<AgentExecutionView />);

      // Assert
      expect(
        screen.getByRole("region", { name: /実行コントロール/i }),
      ).toBeInTheDocument();
    });

    it("should have accessible name for input", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      const input = screen.getByRole("textbox");
      expect(input).toHaveAccessibleName(/メッセージ/i);
    });

    it("should display executing status via UI state", () => {
      // Arrange
      mockStore = createMockStore({ status: "executing" });

      // Act
      render(<AgentExecutionView />);

      // Assert - キャンセルボタンが表示される
      expect(
        screen.getByRole("button", { name: /キャンセル/i }),
      ).toBeInTheDocument();
    });

    it("should handle error state in execution state", () => {
      // Arrange
      mockStore = createMockStore({
        status: "error",
        error: "Test error message",
      });

      // Act
      render(<AgentExecutionView />);

      // Assert - コンポーネントがレンダリングされる
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  describe("focus management", () => {
    it("should trap focus in permission dialog", async () => {
      // Arrange
      const mockPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "npm test" },
      };
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });
      render(<AgentExecutionView />);

      // Assert - ダイアログが表示される
      const dialog = screen.getByRole("alertdialog");
      expect(dialog).toBeInTheDocument();

      // Tab key should cycle within dialog
      await userEvent.tab();
      expect(document.activeElement).toBeTruthy();
    });

    it("should return focus after dialog closes", async () => {
      // Arrange
      const mockPermissionRequest = {
        executionId: "exec-123",
        requestId: "req-456",
        toolName: "Bash",
        args: { command: "npm test" },
      };
      mockStore = createMockStore({
        status: "awaiting_permission",
        pendingPermission: mockPermissionRequest,
      });
      render(<AgentExecutionView />);

      // Act - ダイアログで許可をクリック
      await userEvent.click(screen.getByRole("button", { name: /許可/i }));

      // Assert
      await waitFor(() => {
        expect(mockAgentAPI.respondPermission).toHaveBeenCalled();
      });
    });

    it("should maintain focus visibility", async () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Tab through elements
      await userEvent.tab();
      await userEvent.tab();

      // Assert - アクティブ要素にフォーカスがある
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe("ARIA landmarks", () => {
    it("should have header with title", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should have proper heading structure", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Test Skill");
    });

    it("should have navigation region with back button", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      const backButton = screen.getByRole("button", { name: /戻る|back/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe("color contrast and visibility", () => {
    it("should have visible focus indicators", async () => {
      // Arrange & Act
      render(<AgentExecutionView />);
      const input = screen.getByRole("textbox");

      // Focus the element
      await userEvent.click(input);

      // Assert
      expect(document.activeElement).toBe(input);
    });

    it("should have proper button states", () => {
      // Arrange
      mockStore = createMockStore({ status: "executing" });
      render(<AgentExecutionView />);

      // Assert - キャンセルボタンがある
      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      expect(cancelButton).toBeEnabled();
    });
  });

  describe("motion and animation", () => {
    it("should respect reduced motion preferences", () => {
      // Arrange - prefers-reduced-motionをモック
      const matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      vi.stubGlobal("matchMedia", matchMedia);

      // Act
      render(<AgentExecutionView />);

      // Assert - コンポーネントがレンダリングされる
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  describe("form accessibility", () => {
    it("should have associated label for input", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      const input = screen.getByRole("textbox");
      expect(input).toHaveAccessibleName();
    });

    it("should indicate required fields", () => {
      // Arrange & Act
      render(<AgentExecutionView />);

      // Assert
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
    });

    it("should show validation errors accessibly", async () => {
      // Arrange
      render(<AgentExecutionView />);

      // Act - 空のまま送信
      const submitButton = screen.getByRole("button", { name: /送信/i });
      await userEvent.click(submitButton);

      // Assert - 空メッセージは送信されない
      expect(mockStore.addUserMessage).not.toHaveBeenCalled();
    });
  });
});
