/**
 * @vitest-environment jsdom
 *
 * SkillStreamDisplay Permission Integration Tests
 *
 * TDD Red Phase: Tests for permission dialog integration with SkillStreamDisplay.
 * Tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/renderer/components/AgentView/__tests__/SkillStreamDisplay.permission
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react";
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

// Mock useSkillPermission hook (new)
const mockUseSkillPermission = {
  pendingPermission: null as {
    executionId: string;
    requestId: string;
    toolName: string;
    args: Record<string, unknown>;
    reason?: string;
  } | null,
  handleApprove: vi.fn(),
  handleDeny: vi.fn(),
};

// Mock skillAPI
const mockSkillAPI = {
  execute: vi.fn(),
  onStream: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
  onPermission: vi.fn(),
  respondPermission: vi.fn(),
};

// Mock the hooks - need both path alias and relative path for Vitest
vi.mock("@/renderer/hooks/useSkillExecution", () => ({
  useSkillExecution: () => mockUseSkillExecution,
}));

vi.mock("../../hooks/useSkillExecution", () => ({
  useSkillExecution: () => mockUseSkillExecution,
}));

vi.mock("@/renderer/hooks/useSkillPermission", () => ({
  useSkillPermission: () => mockUseSkillPermission,
}));

vi.mock("../../hooks/useSkillPermission", () => ({
  useSkillPermission: () => mockUseSkillPermission,
}));

// Mock useCopyHistory hook (TASK-3-2-D)
vi.mock("@/renderer/hooks/useCopyHistory", () => ({
  useCopyHistory: () => ({
    addToHistory: vi.fn(),
    historyCount: 0,
  }),
}));

vi.mock("../../hooks/useCopyHistory", () => ({
  useCopyHistory: () => ({
    addToHistory: vi.fn(),
    historyCount: 0,
  }),
}));

// Mock window.skillAPI
vi.stubGlobal("skillAPI", mockSkillAPI);

// Mock react-i18next for i18n support
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Return Japanese translations for tests
      const translations: Record<string, string> = {
        "status.idle": "待機中",
        "status.running": "実行中",
        "status.completed": "完了",
        "status.error": "エラー",
        "status.aborted": "中断",
        "button.abort": "中断",
        "button.reset": "リセット",
        "message.startPrompt": "スキル実行を開始してください",
        "message.executing": "実行中...",
        "aria.loading": "実行中",
        "aria.copyMessage": "メッセージをコピー",
        "aria.abortExecution": "スキル実行を中断",
        "aria.resetState": "状態をリセット",
        "feedback.copied": "コピーしました",
      };
      return translations[key] || key;
    },
    i18n: { language: "ja" },
  }),
}));

// Mock TimestampContext for TASK-3-2-C compatibility
vi.mock("../../contexts/TimestampContext", () => ({
  useTimestampContext: () => Date.now(),
  TimestampProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Import component after mock setup
import { SkillStreamDisplay } from "../SkillStreamDisplay";

// ============================================================
// 1. Permission Dialog Display Tests
// ============================================================
describe("SkillStreamDisplay permission - dialog display", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = null;
    vi.clearAllMocks();
  });

  it("should show PermissionDialog when permission request is received", async () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "test-exec-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行: echo test",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // PermissionDialog should be visible
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toBeInTheDocument();
  });

  it("should display tool name in PermissionDialog", async () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "test-exec-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行: echo test",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByText("Bash")).toBeInTheDocument();
  });

  it("should display args in PermissionDialog", async () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "test-exec-001",
      requestId: "req-test-001",
      toolName: "Write",
      args: { path: "/tmp/test.txt", content: "Hello World" },
      reason: "ファイルを書き込み: /tmp/test.txt",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Args are displayed in a <pre> tag as JSON
    const preElement = screen.getByRole("alertdialog").querySelector("pre");
    expect(preElement).toBeInTheDocument();
    expect(preElement?.textContent).toContain("/tmp/test.txt");
  });

  it("should display reason in PermissionDialog", async () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "test-exec-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "ls -la" },
      reason: "ディレクトリ一覧を表示",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByText("ディレクトリ一覧を表示")).toBeInTheDocument();
  });

  it("should not show PermissionDialog when no pending permission", () => {
    mockUseSkillPermission.pendingPermission = null;

    render(<SkillStreamDisplay skillId="test-skill" />);

    const dialog = screen.queryByRole("alertdialog");
    expect(dialog).not.toBeInTheDocument();
  });
});

// ============================================================
// 2. Permission Response Tests
// ============================================================
describe("SkillStreamDisplay permission - responses", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = {
      executionId: "test-exec-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行: echo test",
    };
    mockUseSkillPermission.handleApprove = vi.fn();
    mockUseSkillPermission.handleDeny = vi.fn();
    vi.clearAllMocks();
  });

  it("should call handleApprove with rememberChoice=false when Allow is clicked", async () => {
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const approveButton = screen.getByRole("button", { name: /許可/i });
    await user.click(approveButton);

    expect(mockUseSkillPermission.handleApprove).toHaveBeenCalledWith(false);
  });

  it("should call handleDeny with rememberChoice=false when Deny is clicked", async () => {
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const denyButton = screen.getByRole("button", { name: /拒否/i });
    await user.click(denyButton);

    expect(mockUseSkillPermission.handleDeny).toHaveBeenCalledWith(false);
  });

  it("should pass rememberChoice=true when checkbox is checked and Allow clicked", async () => {
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Find and check the remember checkbox
    const checkbox = screen.getByRole("checkbox", { name: /記憶/i });
    await user.click(checkbox);

    // Click approve
    const approveButton = screen.getByRole("button", { name: /許可/i });
    await user.click(approveButton);

    expect(mockUseSkillPermission.handleApprove).toHaveBeenCalledWith(true);
  });

  it("should pass rememberChoice=true when checkbox is checked and Deny clicked", async () => {
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Find and check the remember checkbox
    const checkbox = screen.getByRole("checkbox", { name: /記憶/i });
    await user.click(checkbox);

    // Click deny
    const denyButton = screen.getByRole("button", { name: /拒否/i });
    await user.click(denyButton);

    expect(mockUseSkillPermission.handleDeny).toHaveBeenCalledWith(true);
  });
});

// ============================================================
// 3. Permission Dialog Close Tests
// ============================================================
describe("SkillStreamDisplay permission - dialog close", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = {
      executionId: "test-exec-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行: echo test",
    };
    mockUseSkillPermission.handleApprove = vi.fn();
    mockUseSkillPermission.handleDeny = vi.fn();
    vi.clearAllMocks();
  });

  it("should hide PermissionDialog after approval response", async () => {
    const user = userEvent.setup();

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be visible initially
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Click approve
    const approveButton = screen.getByRole("button", { name: /許可/i });
    await user.click(approveButton);

    // Simulate pendingPermission becoming null after response
    mockUseSkillPermission.pendingPermission = null;
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be hidden
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("should hide PermissionDialog after denial response", async () => {
    const user = userEvent.setup();

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be visible initially
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Click deny
    const denyButton = screen.getByRole("button", { name: /拒否/i });
    await user.click(denyButton);

    // Simulate pendingPermission becoming null after response
    mockUseSkillPermission.pendingPermission = null;
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be hidden
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});

// ============================================================
// 4. Permission Dialog Focus Management Tests
// ============================================================
describe("SkillStreamDisplay permission - focus management", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = {
      executionId: "test-exec-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行: echo test",
    };
    vi.clearAllMocks();
  });

  it("should focus first focusable element when dialog opens", async () => {
    render(<SkillStreamDisplay skillId="test-skill" />);

    const dialog = screen.getByRole("alertdialog");

    // Wait for focus to be set inside the dialog
    await waitFor(
      () => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      },
      { timeout: 2000 },
    );
  });

  it("should trap focus within dialog", async () => {
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const dialog = screen.getByRole("alertdialog");
    const buttons = within(dialog).getAllByRole("button");

    // Focus the last button
    buttons[buttons.length - 1].focus();

    // Press Tab - should cycle to first focusable element
    await user.tab();

    // Focus should stay within dialog
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("should trap focus with Shift+Tab", async () => {
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const dialog = screen.getByRole("alertdialog");

    // Focus the first button
    const buttons = within(dialog).getAllByRole("button");
    buttons[0].focus();

    // Press Shift+Tab - should cycle to last focusable element
    await user.tab({ shift: true });

    // Focus should stay within dialog
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});

// ============================================================
// 5. Permission Dialog Accessibility Tests
// ============================================================
describe("SkillStreamDisplay permission - accessibility", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = {
      executionId: "test-exec-001",
      requestId: "req-test-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行: echo test",
    };
    vi.clearAllMocks();
  });

  it("should have role=alertdialog", () => {
    render(<SkillStreamDisplay skillId="test-skill" />);

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toBeInTheDocument();
  });

  it("should have aria-modal=true", () => {
    render(<SkillStreamDisplay skillId="test-skill" />);

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("should have aria-labelledby pointing to title", () => {
    render(<SkillStreamDisplay skillId="test-skill" />);

    const dialog = screen.getByRole("alertdialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();

    // Title element should exist with matching ID
    const titleElement = document.getElementById(labelledBy!);
    expect(titleElement).toBeInTheDocument();
  });

  it("should have accessible button labels", () => {
    render(<SkillStreamDisplay skillId="test-skill" />);

    const approveButton = screen.getByRole("button", { name: /許可/i });
    const denyButton = screen.getByRole("button", { name: /拒否/i });

    expect(approveButton).toBeInTheDocument();
    expect(denyButton).toBeInTheDocument();
  });

  it("should be keyboard navigable", async () => {
    const user = userEvent.setup();

    render(<SkillStreamDisplay skillId="test-skill" />);

    const dialog = screen.getByRole("alertdialog");
    const buttons = within(dialog).getAllByRole("button");

    // Focus first button and press Enter
    buttons[0].focus();
    await user.keyboard("{Enter}");

    // One of the handlers should be called
    expect(
      mockUseSkillPermission.handleApprove.mock.calls.length +
        mockUseSkillPermission.handleDeny.mock.calls.length,
    ).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// 6. Permission Dialog IPC Integration Tests
// ============================================================
// Note: These tests verify the component's integration with the
// useSkillPermission hook. The actual IPC communication is tested
// in apps/desktop/src/preload/__tests__/skill-api.permission.test.ts
describe("SkillStreamDisplay permission - IPC integration", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = null;
    // Re-stub window.skillAPI to ensure test's mockSkillAPI is used
    // (setup.ts beforeAll may have overwritten the module-level stubGlobal)
    vi.stubGlobal("skillAPI", mockSkillAPI);
    mockSkillAPI.onPermission.mockReturnValue(() => {});
    mockSkillAPI.respondPermission.mockResolvedValue(true);
    vi.clearAllMocks();
  });

  it("should use useSkillPermission hook for IPC communication", () => {
    // This test verifies that SkillStreamDisplay integrates with
    // the useSkillPermission hook. The actual IPC registration
    // is handled by the hook (tested separately).
    render(<SkillStreamDisplay skillId="test-skill" />);

    // When pendingPermission is null, no dialog is shown
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("should show dialog when hook returns permission request", () => {
    // Simulate hook returning a permission request
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-hook-001",
      requestId: "req-hook-001",
      toolName: "Read",
      args: { path: "/etc/passwd" },
      reason: "ファイルを読み取り",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be shown
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("should hide dialog when hook clears permission request", () => {
    // First render with a permission request
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-clear-001",
      requestId: "req-clear-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "テストコマンド",
    };

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Simulate hook clearing the request
    mockUseSkillPermission.pendingPermission = null;
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be hidden
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("should send approval response via IPC", async () => {
    const user = userEvent.setup();
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-ipc-approval",
      requestId: "req-ipc-approval",
      toolName: "Bash",
      args: { command: "echo hello" },
      reason: "コマンドを実行",
    };

    // Mock handleApprove to call skillAPI.respondPermission
    mockUseSkillPermission.handleApprove = vi.fn(async (rememberChoice) => {
      await window.skillAPI.respondPermission({
        requestId: "req-ipc-approval",
        approved: true,
        rememberChoice,
      });
    });

    render(<SkillStreamDisplay skillId="test-skill" />);

    const approveButton = screen.getByRole("button", { name: /許可/i });
    await user.click(approveButton);

    expect(mockSkillAPI.respondPermission).toHaveBeenCalledWith({
      requestId: "req-ipc-approval",
      approved: true,
      rememberChoice: false,
    });
  });

  it("should send denial response via IPC", async () => {
    const user = userEvent.setup();
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-ipc-denial",
      requestId: "req-ipc-denial",
      toolName: "Bash",
      args: { command: "rm -rf /" },
      reason: "危険なコマンド",
    };

    // Mock handleDeny to call skillAPI.respondPermission
    mockUseSkillPermission.handleDeny = vi.fn(async (rememberChoice) => {
      await window.skillAPI.respondPermission({
        requestId: "req-ipc-denial",
        approved: false,
        rememberChoice,
      });
    });

    render(<SkillStreamDisplay skillId="test-skill" />);

    const denyButton = screen.getByRole("button", { name: /拒否/i });
    await user.click(denyButton);

    expect(mockSkillAPI.respondPermission).toHaveBeenCalledWith({
      requestId: "req-ipc-denial",
      approved: false,
      rememberChoice: false,
    });
  });
});

// ============================================================
// 7. Permission Dialog Error Handling Tests
// ============================================================
describe("SkillStreamDisplay permission - error handling", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-error-001",
      requestId: "req-error-001",
      toolName: "Bash",
      args: { command: "echo test" },
      reason: "コマンドを実行",
    };
    vi.clearAllMocks();
  });

  it("should handle IPC response error gracefully", async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock handleApprove to throw error
    mockUseSkillPermission.handleApprove = vi.fn(async () => {
      throw new Error("IPC connection failed");
    });

    render(<SkillStreamDisplay skillId="test-skill" />);

    const approveButton = screen.getByRole("button", { name: /許可/i });

    // Should not throw
    await expect(user.click(approveButton)).resolves.not.toThrow();

    consoleError.mockRestore();
  });

  it("should close dialog even if IPC fails", async () => {
    const user = userEvent.setup();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock handleApprove to throw but still close dialog
    mockUseSkillPermission.handleApprove = vi.fn(async () => {
      throw new Error("IPC failed");
    });

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);

    const approveButton = screen.getByRole("button", { name: /許可/i });
    await user.click(approveButton);

    // Simulate dialog closing despite error
    mockUseSkillPermission.pendingPermission = null;
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    consoleError.mockRestore();
  });
});

// ============================================================
// 8. Permission Dialog Concurrent Request Tests
// ============================================================
describe("SkillStreamDisplay permission - concurrent requests", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = null;
    vi.clearAllMocks();
  });

  it("should display only one dialog at a time", () => {
    // First request
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-first",
      requestId: "req-first",
      toolName: "Bash",
      args: { command: "first" },
      reason: "First command",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Only one alertdialog should exist
    const dialogs = screen.getAllByRole("alertdialog");
    expect(dialogs).toHaveLength(1);
  });

  it("should show next request after current is resolved", async () => {
    const user = userEvent.setup();

    // First request
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-first",
      requestId: "req-first",
      toolName: "Bash",
      args: { command: "first" },
      reason: "First command",
    };
    mockUseSkillPermission.handleApprove = vi.fn();

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);

    expect(screen.getByText("First command")).toBeInTheDocument();

    // Approve first request
    const approveButton = screen.getByRole("button", { name: /許可/i });
    await user.click(approveButton);

    // Simulate second request coming in
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-second",
      requestId: "req-second",
      toolName: "Write",
      args: { path: "/second.txt" },
      reason: "Second command",
    };

    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // Should now show second request
    expect(screen.getByText("Second command")).toBeInTheDocument();
  });
});

// ============================================================
// 9. Edge Case Tests
// ============================================================
describe("SkillStreamDisplay permission - edge cases", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = null;
    mockUseSkillPermission.handleApprove = vi.fn();
    mockUseSkillPermission.handleDeny = vi.fn();
    vi.clearAllMocks();
  });

  it("should handle unmount during permission dialog", () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-unmount",
      requestId: "req-unmount",
      toolName: "Bash",
      args: { command: "long-running-command" },
      reason: "Unmount test",
    };

    const { unmount } = render(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be visible
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Unmount should not throw
    expect(() => unmount()).not.toThrow();
  });

  it("should handle permission request with empty args", () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-empty",
      requestId: "req-empty",
      toolName: "Glob",
      args: {},
      reason: "Empty args test",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should still show
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Glob")).toBeInTheDocument();
  });

  it("should handle permission request without reason", () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-no-reason",
      requestId: "req-no-reason",
      toolName: "Read",
      args: { path: "/tmp/file.txt" },
      // reason is undefined
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should still show tool name
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("should handle very long args display", () => {
    const longPath = "/very/long/path/" + "a".repeat(500) + "/file.txt";
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-long",
      requestId: "req-long",
      toolName: "Write",
      args: { path: longPath, content: "test" },
      reason: "Long path test",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should render without crashing
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    const preElement = screen.getByRole("alertdialog").querySelector("pre");
    expect(preElement?.textContent).toContain("very/long/path");
  });

  it("should handle special characters in tool args", () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-special",
      requestId: "req-special",
      toolName: "Bash",
      args: { command: 'echo "Hello, <World>" & rm -rf /' },
      reason: "Special chars test",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Should render without XSS issues
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    // The content should be escaped in the pre tag
    const preElement = screen.getByRole("alertdialog").querySelector("pre");
    expect(preElement?.textContent).toContain("<World>");
  });
});

// ============================================================
// 10. Timeout and Cancel Scenario Tests
// ============================================================
describe("SkillStreamDisplay permission - timeout and cancel scenarios", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.executionId = "test-exec-001";
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    mockUseSkillPermission.pendingPermission = null;
    mockUseSkillPermission.handleApprove = vi.fn();
    mockUseSkillPermission.handleDeny = vi.fn();
    vi.clearAllMocks();
  });

  it("should handle dialog dismissal when execution status changes to aborted", () => {
    // Start with permission dialog open
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-abort",
      requestId: "req-abort",
      toolName: "Bash",
      args: { command: "long-command" },
      reason: "Abort test",
    };

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Simulate execution abort
    mockUseSkillExecution.status = "aborted";
    mockUseSkillPermission.pendingPermission = null;
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be hidden
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("should handle dialog while execution errors", () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-error",
      requestId: "req-error",
      toolName: "Write",
      args: { path: "/tmp/test.txt" },
      reason: "Error test",
    };

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Simulate execution error
    mockUseSkillExecution.status = "error";
    mockUseSkillExecution.error = {
      code: "TIMEOUT",
      message: "Operation timed out",
    };
    mockUseSkillPermission.pendingPermission = null;
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should be hidden, error state should show
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("should preserve dialog state across execution status changes", () => {
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-preserve",
      requestId: "req-preserve",
      toolName: "Bash",
      args: { command: "test" },
      reason: "Preserve test",
    };

    const { rerender } = render(<SkillStreamDisplay skillId="test-skill" />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // Execution status changes but permission is still pending
    mockUseSkillExecution.status = "running";
    rerender(<SkillStreamDisplay skillId="test-skill" />);

    // Dialog should still be visible
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Preserve test")).toBeInTheDocument();
  });

  it("should handle abort button click while permission dialog is open", async () => {
    const user = userEvent.setup();
    mockUseSkillExecution.abort = vi.fn();
    mockUseSkillPermission.pendingPermission = {
      executionId: "exec-abort-btn",
      requestId: "req-abort-btn",
      toolName: "Bash",
      args: { command: "long-command" },
      reason: "Abort button test",
    };

    render(<SkillStreamDisplay skillId="test-skill" />);

    // Both dialog and abort button should be visible
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    const abortButton = screen.getByRole("button", { name: /中断/i });
    expect(abortButton).toBeInTheDocument();

    // Click abort button
    await user.click(abortButton);

    // Abort should be called
    expect(mockUseSkillExecution.abort).toHaveBeenCalled();
  });
});
