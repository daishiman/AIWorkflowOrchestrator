/**
 * @file SkillStreamingView.test.tsx
 * @description SkillStreamingView コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red → Green）
 * @task TASK-7D ChatPanel 統合
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SkillStreamMessage } from "@repo/shared";

// ============================================
// Store Mock
// ============================================

const mockAbortExecution = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const state = {
      abortExecution: mockAbortExecution,
    };
    return selector(state);
  }),
}));

import { SkillStreamingView } from "../SkillStreamingView";

// ============================================
// Test Data Factory
// ============================================

function createAssistantMessage(
  text: string,
  isPartial = false,
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    executionId: "exec-001",
    type: "assistant",
    content: { text, isPartial },
    timestamp,
  };
}

function createToolUseMessage(
  toolName: string,
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    executionId: "exec-001",
    type: "tool_use",
    content: { toolName, args: {}, toolUseId: `tool-${timestamp}` },
    timestamp,
  };
}

function createToolResultMessage(
  success: boolean,
  error?: string,
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    executionId: "exec-001",
    type: "tool_result",
    content: { toolUseId: `tool-${timestamp}`, success, error },
    timestamp,
  };
}

function createErrorMessage(
  message: string,
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    executionId: "exec-001",
    type: "error",
    content: { code: "unknown", message, retryable: false },
    timestamp,
  };
}

function createStatusMessage(
  status: "started" | "tool_executing" | "tool_completed" | "completed",
  timestamp = Date.now(),
): SkillStreamMessage {
  return {
    executionId: "exec-001",
    type: "status",
    content: { status },
    timestamp,
  };
}

// ============================================
// Tests
// ============================================

describe("SkillStreamingView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================
  // ヘッダー表示
  // ============================================================
  describe("ヘッダー表示", () => {
    it("should render skill name", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByTestId("skill-name")).toHaveTextContent("test-skill");
    });

    it("should render status badge for running", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent("実行中...");
    });

    it("should render status badge for permission_pending", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="permission_pending"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent("権限確認");
    });

    it("should render status badge for completed", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="completed"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent("完了");
    });

    it("should render status badge for cancelled", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="cancelled"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent(
        "キャンセル",
      );
    });

    it("should render status badge for error", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="error"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent("エラー");
    });

    it("should not render status badge for idle", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="idle"
        />,
      );
      expect(screen.queryByTestId("status-badge")).not.toBeInTheDocument();
    });

    it("should not render status badge for null", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status={null}
        />,
      );
      expect(screen.queryByTestId("status-badge")).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // 中止ボタン
  // ============================================================
  describe("中止ボタン", () => {
    it("should show abort button when running", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByTestId("abort-button")).toBeInTheDocument();
      expect(screen.getByTestId("abort-button")).toHaveTextContent("停止する");
    });

    it("should hide abort button when not running", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="completed"
        />,
      );
      expect(screen.queryByTestId("abort-button")).not.toBeInTheDocument();
    });

    it("should call abortExecution when abort clicked", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      fireEvent.click(screen.getByTestId("abort-button"));
      expect(mockAbortExecution).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // メッセージ表示
  // ============================================================
  describe("メッセージ表示", () => {
    it("should render assistant messages", () => {
      const messages = [createAssistantMessage("Hello, world!")];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      expect(screen.getByTestId("assistant-message")).toHaveTextContent(
        "Hello, world!",
      );
    });

    it("should render partial cursor for streaming assistant message", () => {
      const messages = [createAssistantMessage("Streaming...", true)];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      expect(screen.getByTestId("partial-cursor")).toBeInTheDocument();
    });

    it("should not render cursor for complete assistant message", () => {
      const messages = [createAssistantMessage("Complete message", false)];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      expect(screen.queryByTestId("partial-cursor")).not.toBeInTheDocument();
    });

    it("should render tool use notifications", () => {
      const messages = [createToolUseMessage("Bash")];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      const toolUse = screen.getByTestId("tool-use-message");
      expect(toolUse).toHaveTextContent("ツール使用: Bash");
    });

    it("should render successful tool results", () => {
      const messages = [createToolResultMessage(true)];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      expect(screen.getByTestId("tool-result-success")).toHaveTextContent(
        "完了",
      );
    });

    it("should render failed tool results", () => {
      const messages = [createToolResultMessage(false, "Permission denied")];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      expect(screen.getByTestId("tool-result-error")).toHaveTextContent(
        "エラー: Permission denied",
      );
    });

    it("should render error messages", () => {
      const messages = [createErrorMessage("Something went wrong")];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="error"
        />,
      );
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Something went wrong",
      );
    });
  });

  // ============================================================
  // ツール実行履歴
  // ============================================================
  describe("ツール実行履歴", () => {
    it("should show tool execution history when tools exist", () => {
      const messages = [
        createToolUseMessage("Read", 1000),
        createToolResultMessage(true, undefined, 2000),
      ];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="completed"
        />,
      );
      expect(screen.getByTestId("tool-execution-history")).toBeInTheDocument();
    });

    it("should hide tool execution history when no tools", () => {
      const messages = [createAssistantMessage("No tools used")];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="completed"
        />,
      );
      expect(
        screen.queryByTestId("tool-execution-history"),
      ).not.toBeInTheDocument();
    });

    it("should show correct tool count", () => {
      const messages = [
        createToolUseMessage("Read", 1000),
        createToolResultMessage(true, undefined, 2000),
        createToolUseMessage("Write", 3000),
        createToolResultMessage(true, undefined, 4000),
      ];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="completed"
        />,
      );
      expect(screen.getByTestId("tool-execution-history")).toHaveTextContent(
        "ツール実行履歴（2件）",
      );
    });
  });

  // ============================================================
  // エッジケース
  // ============================================================
  describe("エッジケース", () => {
    it("should handle empty messages array", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByTestId("skill-streaming-view")).toBeInTheDocument();
    });

    it("should handle large number of messages", () => {
      const messages: SkillStreamMessage[] = Array.from(
        { length: 100 },
        (_, i) => createAssistantMessage(`Message ${i}`, false, i),
      );
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      expect(screen.getByTestId("skill-streaming-view")).toBeInTheDocument();
    });

    it("should handle assistant message with empty text", () => {
      const messages = [createAssistantMessage("")];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      expect(screen.getByTestId("assistant-message")).toBeInTheDocument();
    });

    it("should handle tool_result with empty error message", () => {
      const messages = [createToolResultMessage(false, "")];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      expect(screen.getByTestId("tool-result-error")).toBeInTheDocument();
    });

    it("should handle status transition from running to completed", () => {
      const { rerender } = render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent("実行中...");

      rerender(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="completed"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent("完了");
    });

    it("should handle status transition from running to error", () => {
      const { rerender } = render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent("実行中...");

      rerender(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="error"
        />,
      );
      expect(screen.getByTestId("status-badge")).toHaveTextContent("エラー");
    });

    it("should not render anything for status message type", () => {
      const messages = [createStatusMessage("started")];
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={messages}
          status="running"
        />,
      );
      // status messages render null, so no specific test id
      expect(screen.getByTestId("message-container").children).toHaveLength(0);
    });
  });

  // ============================================================
  // アクセシビリティ
  // ============================================================
  describe("アクセシビリティ", () => {
    it("should have role='log' on streaming container", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByRole("log")).toBeInTheDocument();
    });

    it("should have aria-live='polite' on streaming container", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByRole("log")).toHaveAttribute("aria-live", "polite");
    });

    it("should have aria-label on abort button", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByTestId("abort-button")).toHaveAttribute(
        "aria-label",
        "スキル実行を中止する",
      );
    });

    it("should have role='status' on status badge", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should have aria-label on streaming container", () => {
      render(
        <SkillStreamingView
          skillName="test-skill"
          messages={[]}
          status="running"
        />,
      );
      expect(screen.getByRole("log")).toHaveAttribute(
        "aria-label",
        "スキル実行結果",
      );
    });
  });
});
