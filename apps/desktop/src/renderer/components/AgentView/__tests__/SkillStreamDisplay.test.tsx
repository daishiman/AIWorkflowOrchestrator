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

    // sr-only status region should exist
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");

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
