/**
 * @vitest-environment happy-dom
 *
 * SkillStreamDisplay Component Tests
 *
 * TDD Red Phase: Tests for SkillStreamDisplay UI component.
 * All tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/renderer/components/AgentView/__tests__/SkillStreamDisplay
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SkillStreamMessage } from "@repo/shared/types/skill-execution";

// Cleanup DOM between tests
afterEach(() => {
  cleanup();
});

// Mock useSkillExecution hook
const mockUseSkillExecution = {
  messages: [] as SkillStreamMessage[],
  status: "idle" as "idle" | "running" | "completed" | "error" | "aborted",
  executionId: null as string | null,
  error: null as { code: string; message: string } | null,
  isAborting: false,
  execute: vi.fn(),
  abort: vi.fn(),
  reset: vi.fn(),
};

// Mock the hook relative to the component's import
vi.mock("@/renderer/hooks/useSkillExecution", () => ({
  useSkillExecution: () => mockUseSkillExecution,
}));

// Also mock the relative path used in the component
vi.mock("../../hooks/useSkillExecution", () => ({
  useSkillExecution: () => mockUseSkillExecution,
}));

// Import component after mock setup
import { SkillStreamDisplay } from "../SkillStreamDisplay";

// ============================================================
// 1. Rendering Tests
// ============================================================
describe("SkillStreamDisplay - rendering", () => {
  beforeEach(() => {
    // Reset mock state
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    expect(() => {
      render(<SkillStreamDisplay skillId="test-skill" />);
    }).not.toThrow();
  });

  it("should display idle state initially", () => {
    mockUseSkillExecution.status = "idle";

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Status text appears in both badge and sr-only region
    const elements = screen.getAllByText(/待機中/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("should display loading state when running", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    // There are two "実行中" elements: status badge and loading text
    const elements = screen.getAllByText(/実行中/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("should display completed state when done", () => {
    mockUseSkillExecution.status = "completed";

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Status text appears in both badge and sr-only region
    const elements = screen.getAllByText(/完了/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("should display error state when error occurs", () => {
    mockUseSkillExecution.status = "error";
    mockUseSkillExecution.error = {
      code: "EXECUTION_FAILED",
      message: "Something went wrong",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Status text appears in both badge and sr-only region
    const elements = screen.getAllByText(/エラー/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("should display aborted state when aborted", () => {
    mockUseSkillExecution.status = "aborted";

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Status text appears in both badge and sr-only region
    const elements = screen.getAllByText(/中断/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });

  it("should apply custom className", () => {
    mockUseSkillExecution.status = "idle";

    const { container } = render(
      <SkillStreamDisplay skillId="test-skill" className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should apply custom height", () => {
    mockUseSkillExecution.status = "idle";

    const { container } = render(
      <SkillStreamDisplay skillId="test-skill" height="500px" />,
    );

    expect(container.firstChild).toHaveStyle({ height: "500px" });
  });
});

// ============================================================
// 2. Message Display Tests
// ============================================================
describe("SkillStreamDisplay - message display", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  it("should display text messages", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Hello world",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("should display tool_use messages with tool name", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "tool_use",
        content: JSON.stringify({
          name: "read_file",
          input: { path: "/test.txt" },
        }),
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByText("read_file")).toBeInTheDocument();
  });

  it("should display error messages with error styling", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "error",
        content: "Network error occurred",
        timestamp: Date.now(),
        isComplete: true,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const errorMessage = screen.getByText("Network error occurred");
    expect(errorMessage).toBeInTheDocument();
    // Check error styling
    expect(errorMessage.closest("div")).toHaveClass(/red|error/i);
  });

  it("should display messages in order", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "First message",
        timestamp: 1000,
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-2",
        type: "text",
        content: "Second message",
        timestamp: 2000,
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-3",
        type: "text",
        content: "Third message",
        timestamp: 3000,
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const messages = screen.getAllByText(/message/i);
    expect(messages[0]).toHaveTextContent("First message");
    expect(messages[1]).toHaveTextContent("Second message");
    expect(messages[2]).toHaveTextContent("Third message");
  });

  it("should not display complete type messages", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Text message",
        timestamp: 1000,
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-2",
        type: "complete",
        content: "",
        timestamp: 2000,
        isComplete: true,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByText("Text message")).toBeInTheDocument();
    // Complete message should not be rendered
    expect(screen.queryByText("complete")).not.toBeInTheDocument();
  });

  it("should display empty state message when no messages and idle", () => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(
      screen.getByText(/スキル実行を開始してください/),
    ).toBeInTheDocument();
  });

  it("should display loading spinner when running with no messages", () => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    // There are two "実行中" elements: status badge and loading text
    const elements = screen.getAllByText(/実行中/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 3. Interaction Tests
// ============================================================
describe("SkillStreamDisplay - interactions", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillExecution.abort = vi.fn();
    mockUseSkillExecution.reset = vi.fn();
    vi.clearAllMocks();
  });

  it("should call abort when abort button is clicked", async () => {
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const abortButton = screen.getByRole("button", { name: /中断/ });
    await user.click(abortButton);

    expect(mockUseSkillExecution.abort).toHaveBeenCalledTimes(1);
  });

  it("should disable abort button when not running", () => {
    mockUseSkillExecution.status = "idle";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const abortButton = screen.queryByRole("button", { name: /中断/ });
    // Abort button should not be visible when not running
    expect(abortButton).not.toBeInTheDocument();
  });

  it("should disable abort button when isAborting is true", () => {
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.isAborting = true;

    render(<SkillStreamDisplay skillId="test-skill" />);

    const abortButton = screen.getByRole("button", { name: /中断/ });
    expect(abortButton).toBeDisabled();
  });

  it("should show reset button when completed", async () => {
    mockUseSkillExecution.status = "completed";
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const resetButton = screen.getByRole("button", { name: /リセット/ });
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);
    expect(mockUseSkillExecution.reset).toHaveBeenCalledTimes(1);
  });

  it("should show reset button when error", async () => {
    mockUseSkillExecution.status = "error";
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const resetButton = screen.getByRole("button", { name: /リセット/ });
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);
    expect(mockUseSkillExecution.reset).toHaveBeenCalledTimes(1);
  });

  it("should show reset button when aborted", async () => {
    mockUseSkillExecution.status = "aborted";
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const resetButton = screen.getByRole("button", { name: /リセット/ });
    expect(resetButton).toBeInTheDocument();

    await user.click(resetButton);
    expect(mockUseSkillExecution.reset).toHaveBeenCalledTimes(1);
  });
});

// ============================================================
// 4. Callback Tests
// ============================================================
describe("SkillStreamDisplay - callbacks", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  it("should call onStatusChange when status changes", async () => {
    const onStatusChange = vi.fn();

    const { rerender } = render(
      <SkillStreamDisplay
        skillId="test-skill"
        onStatusChange={onStatusChange}
      />,
    );

    mockUseSkillExecution.status = "running";
    rerender(
      <SkillStreamDisplay
        skillId="test-skill"
        onStatusChange={onStatusChange}
      />,
    );

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith("running");
    });
  });

  it("should call onComplete when status becomes completed", async () => {
    const onComplete = vi.fn();

    const { rerender } = render(
      <SkillStreamDisplay skillId="test-skill" onComplete={onComplete} />,
    );

    mockUseSkillExecution.status = "completed";
    rerender(
      <SkillStreamDisplay skillId="test-skill" onComplete={onComplete} />,
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("should call onError when status becomes error", async () => {
    const onError = vi.fn();
    const error = { code: "EXECUTION_FAILED", message: "Something went wrong" };

    const { rerender } = render(
      <SkillStreamDisplay skillId="test-skill" onError={onError} />,
    );

    mockUseSkillExecution.status = "error";
    mockUseSkillExecution.error = error;
    rerender(<SkillStreamDisplay skillId="test-skill" onError={onError} />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});

// ============================================================
// 5. Auto Execute Tests
// ============================================================
describe("SkillStreamDisplay - auto execute", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillExecution.execute = vi.fn();
    vi.clearAllMocks();
  });

  it("should auto execute when autoExecute is true and initialPrompt is provided", async () => {
    render(
      <SkillStreamDisplay
        skillId="test-skill"
        initialPrompt="Auto execute prompt"
        autoExecute={true}
      />,
    );

    await waitFor(() => {
      expect(mockUseSkillExecution.execute).toHaveBeenCalledWith(
        "Auto execute prompt",
      );
    });
  });

  it("should not auto execute when autoExecute is false", async () => {
    render(
      <SkillStreamDisplay
        skillId="test-skill"
        initialPrompt="Auto execute prompt"
        autoExecute={false}
      />,
    );

    expect(mockUseSkillExecution.execute).not.toHaveBeenCalled();
  });

  it("should not auto execute when initialPrompt is not provided", async () => {
    render(<SkillStreamDisplay skillId="test-skill" autoExecute={true} />);

    expect(mockUseSkillExecution.execute).not.toHaveBeenCalled();
  });
});

// ============================================================
// 6. Accessibility Tests
// ============================================================
describe("SkillStreamDisplay - accessibility", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  it("should have role=log on content area", () => {
    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("should have aria-live=polite on content area", () => {
    render(<SkillStreamDisplay skillId="test-skill" />);

    const logArea = screen.getByRole("log");
    expect(logArea).toHaveAttribute("aria-live", "polite");
  });

  it("should have accessible button labels", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const abortButton = screen.getByRole("button", { name: /中断/ });
    expect(abortButton).toBeInTheDocument();
  });
});

// ============================================================
// 7. Edge Cases
// ============================================================
describe("SkillStreamDisplay - edge cases", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  it("should handle very long messages with scrolling", () => {
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "x".repeat(10000), // Very long message
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    const { container } = render(
      <SkillStreamDisplay skillId="test-skill" height="200px" />,
    );

    const contentArea = container.querySelector(".stream-content");
    expect(contentArea).toHaveClass("overflow-y-auto");
  });

  it("should handle rapid message updates", () => {
    mockUseSkillExecution.status = "running";

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);

    // Simulate rapid message updates
    for (let i = 0; i < 100; i++) {
      mockUseSkillExecution.messages = [
        ...mockUseSkillExecution.messages,
        {
          executionId: "test-exec-001",
          id: `msg-${i}`,
          type: "text" as const,
          content: `Message ${i}`,
          timestamp: Date.now(),
          isComplete: false,
        },
      ];
      rerender(<SkillStreamDisplay skillId="test-skill" />);
    }

    expect(screen.getAllByText(/Message/)).toHaveLength(100);
  });

  it("should handle empty skillId prop", () => {
    mockUseSkillExecution.status = "idle";

    expect(() => {
      render(<SkillStreamDisplay skillId="" />);
    }).not.toThrow();
  });

  it("should handle prop changes during execution", () => {
    mockUseSkillExecution.status = "running";

    const { rerender } = render(
      <SkillStreamDisplay skillId="skill-1" className="class-1" />,
    );

    // Change props during execution
    rerender(<SkillStreamDisplay skillId="skill-2" className="class-2" />);

    expect(
      screen.getByRole("log").closest(".skill-stream-display"),
    ).toHaveClass("class-2");
  });
});

// ============================================================
// 8. Extended Accessibility Tests
// ============================================================
describe("SkillStreamDisplay - extended accessibility", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  it("should have proper ARIA labels", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const logArea = screen.getByRole("log");
    expect(logArea).toHaveAttribute("aria-live", "polite");
  });

  it("should be keyboard navigable", async () => {
    const user = userEvent.setup();
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const abortButton = screen.getByRole("button", { name: /中断/ });

    // Focus the button
    abortButton.focus();
    expect(document.activeElement).toBe(abortButton);

    // Press Enter to click
    await user.keyboard("{Enter}");
    expect(mockUseSkillExecution.abort).toHaveBeenCalled();
  });

  it("should announce status changes to screen readers", () => {
    mockUseSkillExecution.status = "running";

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);

    const logArea = screen.getByRole("log");
    expect(logArea).toHaveAttribute("aria-live", "polite");

    // sr-only status region should exist (note: multiple elements with role="status" exist)
    const statusRegions = screen.getAllByRole("status");
    const srOnlyStatusRegion = statusRegions.find((el) =>
      el.classList.contains("sr-only"),
    );
    expect(srOnlyStatusRegion).toBeDefined();
    expect(srOnlyStatusRegion).toHaveAttribute("aria-live", "polite");

    mockUseSkillExecution.status = "completed";
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // Status text should be visible (in both badge and sr-only region)
    const elements = screen.getAllByText(/完了/);
    expect(elements.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 9. Callback Edge Cases
// ============================================================
describe("SkillStreamDisplay - callback edge cases", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  it("should not call onComplete when error occurs", async () => {
    const onComplete = vi.fn();
    const onError = vi.fn();

    const { rerender } = render(
      <SkillStreamDisplay
        skillId="test-skill"
        onComplete={onComplete}
        onError={onError}
      />,
    );

    mockUseSkillExecution.status = "error";
    mockUseSkillExecution.error = {
      code: "EXECUTION_FAILED",
      message: "Error occurred",
    };
    rerender(
      <SkillStreamDisplay
        skillId="test-skill"
        onComplete={onComplete}
        onError={onError}
      />,
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("should not call onError when completed successfully", async () => {
    const onComplete = vi.fn();
    const onError = vi.fn();

    const { rerender } = render(
      <SkillStreamDisplay
        skillId="test-skill"
        onComplete={onComplete}
        onError={onError}
      />,
    );

    mockUseSkillExecution.status = "completed";
    rerender(
      <SkillStreamDisplay
        skillId="test-skill"
        onComplete={onComplete}
        onError={onError}
      />,
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it("should handle undefined callbacks gracefully", () => {
    const { rerender } = render(
      <SkillStreamDisplay
        skillId="test-skill"
        onComplete={undefined}
        onError={undefined}
      />,
    );

    // Status change should not throw when callbacks are undefined
    expect(() => {
      mockUseSkillExecution.status = "completed";
      rerender(
        <SkillStreamDisplay
          skillId="test-skill"
          onComplete={undefined}
          onError={undefined}
        />,
      );
    }).not.toThrow();
  });
});

// ============================================================
// 10. R1 Loading Spinner Tests (TDD Red Phase)
// ============================================================
describe("SkillStreamDisplay - Loading Spinner (R1)", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  // TC-R1-1
  it("should display spinner when status is running", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toBeInTheDocument();
  });

  // TC-R1-2
  it("should not display spinner when status is idle", () => {
    mockUseSkillExecution.status = "idle";

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  // TC-R1-3
  it("should not display spinner when status is completed", () => {
    mockUseSkillExecution.status = "completed";

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  // TC-R1-4
  it("spinner should have animate-spin class", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const spinner = screen.getByTestId("loading-spinner");
    expect(spinner).toHaveClass("animate-spin");
  });

  // TC-R1-5
  it("spinner should have accessible aria-label", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const spinnerContainer = screen.getByRole("status", { name: /実行中/ });
    expect(spinnerContainer).toBeInTheDocument();
  });

  // TC-R1-6
  it("spinner container should have role=status", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const spinnerContainer = screen.getByTestId("loading-spinner-container");
    expect(spinnerContainer).toHaveAttribute("role", "status");
  });
});

// ============================================================
// 11. R2 Timestamp Display Tests (TDD Red Phase)
// ============================================================
describe("SkillStreamDisplay - Timestamp Display (R2)", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  // TC-R2-7
  it("should display timestamp on each message", () => {
    const now = Date.now();
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: now - 30000, // 30秒前
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    // タイムスタンプ要素が存在することを確認
    const timestamp = screen.getByTestId("message-timestamp-msg-1");
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveTextContent(/秒前|分前|時間前|日前/);
  });

  // TC-R2-8
  it("timestamp should have appropriate styling classes", () => {
    const now = Date.now();
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: now - 30000,
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const timestamp = screen.getByTestId("message-timestamp-msg-1");
    expect(timestamp).toHaveClass("text-xs");
    expect(timestamp).toHaveClass("text-gray-400");
  });

  it("should display timestamps for multiple messages", () => {
    const now = Date.now();
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "First message",
        timestamp: now - 60000, // 1分前
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-2",
        type: "text",
        content: "Second message",
        timestamp: now - 30000, // 30秒前
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByTestId("message-timestamp-msg-1")).toBeInTheDocument();
    expect(screen.getByTestId("message-timestamp-msg-2")).toBeInTheDocument();
  });
});

// ============================================================
// 12. R3 Clipboard Copy Tests (TDD Red Phase)
// ============================================================
describe("SkillStreamDisplay - Clipboard Copy (R3)", () => {
  const mockWriteText = vi.fn();
  const mockClipboard = { writeText: mockWriteText };

  beforeAll(() => {
    // グローバルnavigator.clipboardをモック
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: mockClipboard,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();

    // Reset mock for each test
    mockWriteText.mockResolvedValue(undefined);
  });

  // TC-R3-1
  it("should display copy button on message", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    expect(copyButton).toBeInTheDocument();
  });

  // TC-R3-2
  it("should copy message content to clipboard on click", async () => {
    const user = userEvent.setup();
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message to copy",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith("Test message to copy");
  });

  // TC-R3-3
  it("should show copy feedback after successful copy", async () => {
    const user = userEvent.setup();
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("コピーしました")).toBeInTheDocument();
    });
  });

  // TC-R3-4
  it("copy feedback should disappear after 2000ms", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    // フィードバックが表示されていることを確認
    await waitFor(() => {
      expect(screen.getByText("コピーしました")).toBeInTheDocument();
    });

    // 2000ms経過後
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.queryByText("コピーしました")).not.toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  // TC-R3-5
  it("copy button should have accessible aria-label", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    expect(copyButton).toHaveAttribute("aria-label", "メッセージをコピー");
  });

  // TC-R3-6
  it("copy button should be keyboard accessible", async () => {
    const user = userEvent.setup();
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    copyButton.focus();
    await user.keyboard("{Enter}");

    expect(mockWriteText).toHaveBeenCalledWith("Test message");
  });

  // TC-R3-7
  it("should handle clipboard API error gracefully", async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockWriteText.mockRejectedValue(new Error("Clipboard API error"));
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});

// ============================================================
// 13. R3 Accessibility Tests for New Features (TDD Red Phase)
// ============================================================
describe("SkillStreamDisplay - New Features Accessibility", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  // TC-A-1
  it("spinner should be announced by screen readers", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    const spinnerContainer = screen.getByTestId("loading-spinner-container");
    expect(spinnerContainer).toHaveAttribute("role", "status");
    expect(spinnerContainer).toHaveAttribute("aria-label", "実行中");
  });

  // TC-A-2
  it("copy feedback should be announced to screen readers", async () => {
    const user = userEvent.setup();
    // Setup clipboard mock for this test
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: mockWriteText },
    });

    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    await waitFor(() => {
      const feedback = screen.getByText("コピーしました");
      expect(feedback).toHaveAttribute("role", "status");
      expect(feedback).toHaveAttribute("aria-live", "polite");
    });

    // Cleanup
    vi.unstubAllGlobals();
  });

  // TC-A-3
  it("all interactive elements should be keyboard focusable", () => {
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Copy button should be focusable
    const copyButton = screen.getByTestId("copy-button-msg-1");
    expect(copyButton.tabIndex).not.toBe(-1);
  });
});

// ============================================================
// 14. R1 Loading Spinner Edge Cases (Phase 6)
// ============================================================
describe("SkillStreamDisplay - Loading Spinner Edge Cases", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  // TC-R1-7
  it("spinner should stop when status changes from running", () => {
    mockUseSkillExecution.status = "running";

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    mockUseSkillExecution.status = "completed";
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  // TC-R1-8
  it("spinner should coexist with abort button", () => {
    mockUseSkillExecution.status = "running";

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /中断/ })).toBeInTheDocument();
  });

  // TC-R1-9
  it("spinner animation should not affect layout", () => {
    mockUseSkillExecution.status = "running";

    const { container } = render(<SkillStreamDisplay skillId="test-skill" />);

    const header = container.querySelector(".stream-header");
    expect(header).toHaveClass("flex", "items-center");
  });
});

// ============================================================
// 15. R2 Timestamp Edge Cases (Phase 6)
// ============================================================
describe("SkillStreamDisplay - Timestamp Edge Cases", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  // TC-R2-9
  it("should handle future timestamp gracefully", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Future message",
        timestamp: Date.now() + 10000, // 未来のタイムスタンプ
        isComplete: false,
      },
    ];

    expect(() => {
      render(<SkillStreamDisplay skillId="test-skill" />);
    }).not.toThrow();

    const timestamp = screen.getByTestId("message-timestamp-msg-1");
    expect(timestamp).toBeInTheDocument();
  });

  // TC-R2-10
  it("should handle very old timestamp", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Old message",
        timestamp: Date.now() - 365 * 24 * 60 * 60 * 1000, // 1年前
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const timestamp = screen.getByTestId("message-timestamp-msg-1");
    expect(timestamp).toHaveTextContent("365日前");
  });

  // TC-R2-11
  it("timestamp should update on message list change", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "First message",
        timestamp: Date.now() - 60000,
        isComplete: false,
      },
    ];

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);
    expect(screen.getByTestId("message-timestamp-msg-1")).toBeInTheDocument();

    mockUseSkillExecution.messages = [
      ...mockUseSkillExecution.messages,
      {
        executionId: "test-exec-001",
        id: "msg-2",
        type: "text",
        content: "Second message",
        timestamp: Date.now() - 30000,
        isComplete: false,
      },
    ];
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByTestId("message-timestamp-msg-1")).toBeInTheDocument();
    expect(screen.getByTestId("message-timestamp-msg-2")).toBeInTheDocument();
  });

  // TC-R2-12
  it("should handle timestamp of 0", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Epoch message",
        timestamp: 0, // エポック時刻
        isComplete: false,
      },
    ];

    expect(() => {
      render(<SkillStreamDisplay skillId="test-skill" />);
    }).not.toThrow();

    const timestamp = screen.getByTestId("message-timestamp-msg-1");
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveTextContent(/日前/); // 多くの日数が表示される
  });
});

// ============================================================
// 16. R3 Clipboard Copy Edge Cases (Phase 6)
// ============================================================
describe("SkillStreamDisplay - Clipboard Copy Edge Cases", () => {
  const mockWriteText = vi.fn();
  const mockClipboard = { writeText: mockWriteText };

  beforeAll(() => {
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: mockClipboard,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();

    // Reset mock for each test
    mockWriteText.mockResolvedValue(undefined);
  });

  // TC-R3-8
  it("should handle empty message content", async () => {
    const user = userEvent.setup();
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith("");
  });

  // TC-R3-9
  it("should handle very long message content", async () => {
    const user = userEvent.setup();
    const longContent = "x".repeat(10000);
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: longContent,
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(longContent);
  });

  // TC-R3-10
  it("should handle special characters in content", async () => {
    const user = userEvent.setup();
    const specialContent = "特殊文字: <>&\"'`\\n\\t日本語🎉";
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: specialContent,
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith(specialContent);
  });

  // TC-R3-11
  it("should handle rapid consecutive copy clicks", async () => {
    const user = userEvent.setup();
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");

    // 連続クリック
    await user.click(copyButton);
    await user.click(copyButton);
    await user.click(copyButton);

    // 3回呼ばれるはず
    expect(mockWriteText).toHaveBeenCalledTimes(3);
  });

  // TC-R3-12
  it("copy button should be visible on focus", () => {
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton = screen.getByTestId("copy-button-msg-1");
    // ボタンがフォーカス可能であることを確認
    expect(copyButton).toHaveAttribute("tabIndex", "0");
  });

  // TC-R3-13
  it("multiple messages can show copy feedback independently", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Message 1",
        timestamp: Date.now(),
        isComplete: false,
      },
      {
        executionId: "test-exec-001",
        id: "msg-2",
        type: "text",
        content: "Message 2",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const copyButton1 = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton1);

    // 最初のフィードバックが表示される
    await waitFor(() => {
      expect(screen.getAllByText("コピーしました")).toHaveLength(1);
    });

    vi.useRealTimers();
  });
});

// ============================================================
// 17. Integration Scenario Tests (Phase 6)
// ============================================================
describe("SkillStreamDisplay - Integration Scenarios", () => {
  const mockWriteText = vi.fn();
  const mockClipboard = { writeText: mockWriteText };

  beforeAll(() => {
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: mockClipboard,
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();

    // Reset mock for each test
    mockWriteText.mockResolvedValue(undefined);
  });

  // TC-INT-1
  it("all features work together during execution", () => {
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now() - 30000,
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    // R1: スピナーが表示される
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // R2: タイムスタンプが表示される
    expect(screen.getByTestId("message-timestamp-msg-1")).toBeInTheDocument();

    // R3: コピーボタンが存在する
    expect(screen.getByTestId("copy-button-msg-1")).toBeInTheDocument();
  });

  // TC-INT-2
  it("copy works during running state with spinner", async () => {
    const user = userEvent.setup();
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Running message",
        timestamp: Date.now(),
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    // スピナーが表示されている状態で
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // コピーも動作する
    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith("Running message");
  });

  // TC-INT-3
  it("timestamp displays correctly with copy button visible", () => {
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now() - 60000, // 1分前
        isComplete: false,
      },
    ];

    render(<SkillStreamDisplay skillId="test-skill" />);

    const timestamp = screen.getByTestId("message-timestamp-msg-1");
    const copyButton = screen.getByTestId("copy-button-msg-1");

    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveTextContent("1分前");
    expect(copyButton).toBeInTheDocument();
  });

  // TC-INT-4
  it("features work correctly after reset", async () => {
    const _user = userEvent.setup();
    mockUseSkillExecution.status = "completed";
    mockUseSkillExecution.messages = [
      {
        executionId: "test-exec-001",
        id: "msg-1",
        type: "text",
        content: "Completed message",
        timestamp: Date.now(),
        isComplete: true,
      },
    ];

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);

    // リセット後
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.messages = [];
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // スピナーは非表示
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();

    // 空状態メッセージが表示
    expect(
      screen.getByText(/スキル実行を開始してください/),
    ).toBeInTheDocument();
  });
});

// ============================================================
// 18. Performance Tests (Phase 6)
// ============================================================
describe("SkillStreamDisplay - Performance", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  // TC-PERF-1
  it("should handle 100 messages without lag", () => {
    const messages = Array.from({ length: 100 }, (_, i) => ({
      executionId: "test-exec-001",
      id: `msg-${i}`,
      type: "text" as const,
      content: `Message ${i}`,
      timestamp: Date.now() - i * 1000,
      isComplete: false,
    }));
    mockUseSkillExecution.messages = messages;

    const startTime = performance.now();
    render(<SkillStreamDisplay skillId="test-skill" />);
    const endTime = performance.now();

    // レンダリングが1秒以内に完了することを確認
    expect(endTime - startTime).toBeLessThan(1000);
    expect(screen.getAllByText(/Message/)).toHaveLength(100);
  });

  // TC-PERF-2
  it("should handle 1000 messages gracefully", () => {
    const messages = Array.from({ length: 1000 }, (_, i) => ({
      executionId: "test-exec-001",
      id: `msg-${i}`,
      type: "text" as const,
      content: `Message ${i}`,
      timestamp: Date.now() - i * 1000,
      isComplete: false,
    }));
    mockUseSkillExecution.messages = messages;

    expect(() => {
      render(<SkillStreamDisplay skillId="test-skill" />);
    }).not.toThrow();

    expect(screen.getAllByText(/Message/)).toHaveLength(1000);
  });

  // TC-PERF-3
  it("rapid message updates should not cause issues", () => {
    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);

    // 100回の高速アップデート
    for (let i = 0; i < 100; i++) {
      mockUseSkillExecution.messages = [
        ...mockUseSkillExecution.messages,
        {
          executionId: "test-exec-001",
          id: `msg-${i}`,
          type: "text" as const,
          content: `Rapid message ${i}`,
          timestamp: Date.now(),
          isComplete: false,
        },
      ];
      rerender(<SkillStreamDisplay skillId="test-skill" />);
    }

    expect(screen.getAllByText(/Rapid message/)).toHaveLength(100);
  });
});
