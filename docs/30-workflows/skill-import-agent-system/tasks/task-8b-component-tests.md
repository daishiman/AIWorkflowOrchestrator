---
id: TASK-8B
tier: 1
title: コンポーネントテスト
phase: 8
depends_on: [TASK-7A, TASK-7B, TASK-7C, TASK-7D]
parallel_with: [TASK-8A, TASK-8C]
blocks: []
status: pending
priority: high
estimated_complexity: medium
tags: [test, component-test, frontend, ui]
---

# コンポーネントテスト

## 概要

UIコンポーネントの Testing Library を使用したコンポーネントテストを実装する。

## 入力

- TASK-7A: SkillSelector
- TASK-7B: SkillImportDialog
- TASK-7C: PermissionDialog
- TASK-7D: ChatPanel 統合

## 出力

- 各コンポーネントのテストファイル
- 全テスト通過

## 実装詳細

### SkillSelector テスト

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillSelector } from "../SkillSelector";

const mockUseAppStore = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: () => mockUseAppStore(),
}));

describe("SkillSelector", () => {
  const defaultStoreState = {
    availableSkills: [
      {
        name: "available-skill",
        description: "Available skill description",
        agents: [],
        references: [],
      },
    ],
    importedSkills: [
      {
        name: "imported-skill",
        description: "Imported skill description",
        agents: [{ filename: "agent1.md" }],
        references: [{ filename: "ref1.md" }],
      },
    ],
    selectedSkillName: null,
    isLoadingSkills: false,
    isScanning: false,
    selectSkill: vi.fn(),
    rescanSkills: vi.fn(),
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(defaultStoreState);
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render with no skill selected", () => {
      render(<SkillSelector />);

      expect(screen.getByRole("button", { name: /スキルを選択/i })).toBeInTheDocument();
      expect(screen.getByText("なし")).toBeInTheDocument();
    });

    it("should render with selected skill name", () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        selectedSkillName: "imported-skill",
      });

      render(<SkillSelector />);

      expect(screen.getByText("imported-skill")).toBeInTheDocument();
    });

    it("should show loading state when scanning", () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        isScanning: true,
      });

      render(<SkillSelector />);
      fireEvent.click(screen.getByRole("button", { name: /スキルを選択/i }));

      expect(screen.getByText(/スキャン中/i)).toBeInTheDocument();
    });
  });

  describe("dropdown interaction", () => {
    it("should open dropdown when clicked", async () => {
      const user = userEvent.setup();
      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("should close dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <SkillSelector />
          <div data-testid="outside">Outside</div>
        </div>
      );

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.click(screen.getByTestId("outside"));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should show imported skills section", async () => {
      const user = userEvent.setup();
      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));

      expect(screen.getByText(/インポート済み/i)).toBeInTheDocument();
      expect(screen.getByText("imported-skill")).toBeInTheDocument();
    });

    it("should show available skills section", async () => {
      const user = userEvent.setup();
      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));

      expect(screen.getByText(/利用可能なスキル/i)).toBeInTheDocument();
    });
  });

  describe("skill selection", () => {
    it("should select skill when option clicked", async () => {
      const user = userEvent.setup();
      const selectSkill = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        selectSkill,
      });

      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));
      await user.click(screen.getByRole("option", { name: /imported-skill/i }));

      expect(selectSkill).toHaveBeenCalledWith("imported-skill");
    });

    it("should deselect skill when 'なし' is clicked", async () => {
      const user = userEvent.setup();
      const selectSkill = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        selectedSkillName: "imported-skill",
        selectSkill,
      });

      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));
      await user.click(screen.getByRole("option", { name: /なし/i }));

      expect(selectSkill).toHaveBeenCalledWith(null);
    });
  });

  describe("keyboard navigation", () => {
    it("should close dropdown on Escape", async () => {
      const user = userEvent.setup();
      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.keyboard("{Escape}");
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("should navigate with arrow keys", async () => {
      const user = userEvent.setup();
      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));
      await user.keyboard("{ArrowDown}");

      // Focus should move to first option
      expect(document.activeElement).toHaveAttribute("role", "option");
    });
  });

  describe("rescan", () => {
    it("should call rescan when button clicked", async () => {
      const user = userEvent.setup();
      const rescanSkills = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        rescanSkills,
      });

      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));
      await user.click(screen.getByRole("button", { name: /再スキャン/i }));

      expect(rescanSkills).toHaveBeenCalled();
    });

    it("should disable rescan button when scanning", async () => {
      const user = userEvent.setup();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        isScanning: true,
      });

      render(<SkillSelector />);

      await user.click(screen.getByRole("button", { name: /スキルを選択/i }));

      expect(screen.getByRole("button", { name: /スキャン中/i })).toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("should have correct ARIA attributes", () => {
      render(<SkillSelector />);

      const button = screen.getByRole("button", { name: /スキルを選択/i });
      expect(button).toHaveAttribute("aria-haspopup", "listbox");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should update aria-expanded when open", async () => {
      const user = userEvent.setup();
      render(<SkillSelector />);

      const button = screen.getByRole("button", { name: /スキルを選択/i });
      await user.click(button);

      expect(button).toHaveAttribute("aria-expanded", "true");
    });
  });
});
```

### SkillImportDialog テスト

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillImportDialog } from "../SkillImportDialog";
import type { SkillMetadata } from "@repo/shared";

const mockUseAppStore = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: () => mockUseAppStore(),
}));

describe("SkillImportDialog", () => {
  const mockSkill: SkillMetadata = {
    name: "test-skill",
    description: "Test skill description",
    allowedTools: ["Bash", "Read", "Write"],
    agents: [
      { filename: "agent1.md", relativePath: "agents/agent1.md", description: "Agent 1" },
      { filename: "agent2.md", relativePath: "agents/agent2.md", description: "Agent 2" },
    ],
    references: [
      { filename: "ref1.md", relativePath: "references/ref1.md", description: "Reference 1" },
    ],
    scripts: [],
    assets: [],
    schemas: [],
    indexes: [],
    otherFiles: [],
  };

  const defaultProps = {
    skill: mockSkill,
    isOpen: true,
    onClose: vi.fn(),
  };

  const defaultStoreState = {
    importSkill: vi.fn(),
    isImporting: false,
    importingSkillName: null,
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(defaultStoreState);
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should not render when isOpen is false", () => {
      render(<SkillImportDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render skill name and description", () => {
      render(<SkillImportDialog {...defaultProps} />);

      expect(screen.getByText("test-skill")).toBeInTheDocument();
      expect(screen.getByText("Test skill description")).toBeInTheDocument();
    });

    it("should render allowed tools", () => {
      render(<SkillImportDialog {...defaultProps} />);

      expect(screen.getByText("Bash")).toBeInTheDocument();
      expect(screen.getByText("Read")).toBeInTheDocument();
      expect(screen.getByText("Write")).toBeInTheDocument();
    });

    it("should render agents list", () => {
      render(<SkillImportDialog {...defaultProps} />);

      expect(screen.getByText(/サブエージェント.*2件/i)).toBeInTheDocument();
      expect(screen.getByText("agent1.md")).toBeInTheDocument();
      expect(screen.getByText("agent2.md")).toBeInTheDocument();
    });

    it("should render references list", () => {
      render(<SkillImportDialog {...defaultProps} />);

      expect(screen.getByText(/参照資料.*1件/i)).toBeInTheDocument();
      expect(screen.getByText("ref1.md")).toBeInTheDocument();
    });

    it("should not render empty sections", () => {
      const skillWithoutScripts = { ...mockSkill, scripts: [] };
      render(<SkillImportDialog {...defaultProps} skill={skillWithoutScripts} />);

      expect(screen.queryByText(/スクリプト/i)).not.toBeInTheDocument();
    });
  });

  describe("import action", () => {
    it("should call importSkill when import button clicked", async () => {
      const user = userEvent.setup();
      const importSkill = vi.fn().mockResolvedValue(undefined);
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        importSkill,
      });

      render(<SkillImportDialog {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /インポート$/i }));

      expect(importSkill).toHaveBeenCalledWith("test-skill");
    });

    it("should show loading state during import", () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        isImporting: true,
        importingSkillName: "test-skill",
      });

      render(<SkillImportDialog {...defaultProps} />);

      expect(screen.getByRole("button", { name: /インポート中/i })).toBeDisabled();
    });

    it("should close dialog after successful import", async () => {
      const user = userEvent.setup();
      const importSkill = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        importSkill,
      });

      render(<SkillImportDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: /インポート$/i }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe("close action", () => {
    it("should call onClose when cancel button clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<SkillImportDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: /キャンセル/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it("should call onClose when close button clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<SkillImportDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: /閉じる/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it("should disable cancel during import", () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        isImporting: true,
        importingSkillName: "test-skill",
      });

      render(<SkillImportDialog {...defaultProps} />);

      expect(screen.getByRole("button", { name: /キャンセル/i })).toBeDisabled();
    });
  });
});
```

### PermissionDialog テスト

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PermissionDialog } from "../PermissionDialog";
import type { PermissionRequest } from "@repo/shared";

const mockUseAppStore = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: () => mockUseAppStore(),
}));

describe("PermissionDialog", () => {
  const mockPermissionRequest: PermissionRequest = {
    requestId: "req-123",
    executionId: "exec-456",
    toolName: "Bash",
    args: { command: "ls -la /home/user" },
    reason: "List files in user directory",
  };

  const defaultStoreState = {
    pendingPermission: mockPermissionRequest,
    respondToPermission: vi.fn(),
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(defaultStoreState);
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should not render when pendingPermission is null", () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        pendingPermission: null,
      });

      render(<PermissionDialog />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render tool name", () => {
      render(<PermissionDialog />);

      expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    it("should render args for Bash command", () => {
      render(<PermissionDialog />);

      expect(screen.getByText("ls -la /home/user")).toBeInTheDocument();
    });

    it("should render args for file path", () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        pendingPermission: {
          ...mockPermissionRequest,
          toolName: "Read",
          args: { path: "/path/to/file.txt" },
        },
      });

      render(<PermissionDialog />);

      expect(screen.getByText("/path/to/file.txt")).toBeInTheDocument();
    });

    it("should render args as JSON for other tools", () => {
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        pendingPermission: {
          ...mockPermissionRequest,
          toolName: "WebSearch",
          args: { query: "test query", limit: 10 },
        },
      });

      render(<PermissionDialog />);

      expect(screen.getByText(/"query": "test query"/)).toBeInTheDocument();
    });

    it("should render reason when provided", () => {
      render(<PermissionDialog />);

      expect(screen.getByText("List files in user directory")).toBeInTheDocument();
    });
  });

  describe("deny action", () => {
    it("should call respondToPermission(false) on deny", async () => {
      const user = userEvent.setup();
      const respondToPermission = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        respondToPermission,
      });

      render(<PermissionDialog />);

      await user.click(screen.getByRole("button", { name: /拒否/i }));

      expect(respondToPermission).toHaveBeenCalledWith(false, false);
    });

    it("should call respondToPermission(false) on close button", async () => {
      const user = userEvent.setup();
      const respondToPermission = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        respondToPermission,
      });

      render(<PermissionDialog />);

      await user.click(screen.getByRole("button", { name: /閉じる/i }));

      expect(respondToPermission).toHaveBeenCalledWith(false, false);
    });
  });

  describe("approve once action", () => {
    it("should call respondToPermission(true, false) on approve once", async () => {
      const user = userEvent.setup();
      const respondToPermission = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        respondToPermission,
      });

      render(<PermissionDialog />);

      await user.click(screen.getByRole("button", { name: /1回許可/i }));

      expect(respondToPermission).toHaveBeenCalledWith(true, false);
    });
  });

  describe("approve action", () => {
    it("should call respondToPermission(true, false) without remember", async () => {
      const user = userEvent.setup();
      const respondToPermission = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        respondToPermission,
      });

      render(<PermissionDialog />);

      await user.click(screen.getByRole("button", { name: /^許可$/i }));

      expect(respondToPermission).toHaveBeenCalledWith(true, false);
    });

    it("should call respondToPermission(true, true) with remember checked", async () => {
      const user = userEvent.setup();
      const respondToPermission = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        respondToPermission,
      });

      render(<PermissionDialog />);

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: /^許可$/i }));

      expect(respondToPermission).toHaveBeenCalledWith(true, true);
    });
  });

  describe("remember checkbox", () => {
    it("should toggle remember checkbox", async () => {
      const user = userEvent.setup();

      render(<PermissionDialog />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should reset remember checkbox after response", async () => {
      const user = userEvent.setup();
      const respondToPermission = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        respondToPermission,
      });

      const { rerender } = render(<PermissionDialog />);

      await user.click(screen.getByRole("checkbox"));
      await user.click(screen.getByRole("button", { name: /^許可$/i }));

      // Simulate pendingPermission being cleared and then a new request
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        pendingPermission: {
          ...mockPermissionRequest,
          requestId: "req-new",
        },
        respondToPermission,
      });

      rerender(<PermissionDialog />);

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });
  });
});
```

### SkillStreamingView テスト

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillStreamingView } from "../SkillStreamingView";
import type { SkillStreamMessage, SkillExecutionStatus } from "@repo/shared";

const mockUseAppStore = vi.fn();

vi.mock("../../../store", () => ({
  useAppStore: () => mockUseAppStore(),
}));

describe("SkillStreamingView", () => {
  const defaultProps = {
    skillName: "test-skill",
    messages: [] as SkillStreamMessage[],
    status: "running" as SkillExecutionStatus,
  };

  const defaultStoreState = {
    abortExecution: vi.fn(),
  };

  beforeEach(() => {
    mockUseAppStore.mockReturnValue(defaultStoreState);
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render skill name", () => {
      render(<SkillStreamingView {...defaultProps} />);

      expect(screen.getByText(/test-skill/i)).toBeInTheDocument();
    });

    it("should render assistant messages", () => {
      const messages: SkillStreamMessage[] = [
        {
          type: "assistant",
          content: { text: "Hello, I am processing your request.", isPartial: false },
          timestamp: Date.now(),
        },
      ];

      render(<SkillStreamingView {...defaultProps} messages={messages} />);

      expect(screen.getByText("Hello, I am processing your request.")).toBeInTheDocument();
    });

    it("should render partial message with cursor", () => {
      const messages: SkillStreamMessage[] = [
        {
          type: "assistant",
          content: { text: "Processing...", isPartial: true },
          timestamp: Date.now(),
        },
      ];

      render(<SkillStreamingView {...defaultProps} messages={messages} />);

      expect(screen.getByText(/Processing.../)).toBeInTheDocument();
      expect(screen.getByText("▌")).toBeInTheDocument();
    });

    it("should render tool use notifications", () => {
      const messages: SkillStreamMessage[] = [
        {
          type: "tool_use",
          content: { toolName: "Bash", toolUseId: "tool-1" },
          timestamp: Date.now(),
        },
      ];

      render(<SkillStreamingView {...defaultProps} messages={messages} />);

      expect(screen.getByText(/ツール使用: Bash/i)).toBeInTheDocument();
    });

    it("should render successful tool results", () => {
      const messages: SkillStreamMessage[] = [
        {
          type: "tool_result",
          content: { toolUseId: "tool-1", success: true },
          timestamp: Date.now(),
        },
      ];

      render(<SkillStreamingView {...defaultProps} messages={messages} />);

      expect(screen.getByText(/完了/i)).toBeInTheDocument();
    });

    it("should render failed tool results", () => {
      const messages: SkillStreamMessage[] = [
        {
          type: "tool_result",
          content: { toolUseId: "tool-1", success: false, error: "Command failed" },
          timestamp: Date.now(),
        },
      ];

      render(<SkillStreamingView {...defaultProps} messages={messages} />);

      expect(screen.getByText(/エラー: Command failed/i)).toBeInTheDocument();
    });

    it("should render error messages", () => {
      const messages: SkillStreamMessage[] = [
        {
          type: "error",
          content: { message: "Unexpected error occurred" },
          timestamp: Date.now(),
        },
      ];

      render(<SkillStreamingView {...defaultProps} messages={messages} />);

      expect(screen.getByText(/エラーが発生しました/i)).toBeInTheDocument();
      expect(screen.getByText("Unexpected error occurred")).toBeInTheDocument();
    });
  });

  describe("status badge", () => {
    it("should show running status", () => {
      render(<SkillStreamingView {...defaultProps} status="running" />);

      expect(screen.getByText(/実行中/i)).toBeInTheDocument();
    });

    it("should show permission pending status", () => {
      render(<SkillStreamingView {...defaultProps} status="permission_pending" />);

      expect(screen.getByText(/権限確認/i)).toBeInTheDocument();
    });

    it("should show completed status", () => {
      render(<SkillStreamingView {...defaultProps} status="completed" />);

      expect(screen.getByText(/完了/i)).toBeInTheDocument();
    });

    it("should show error status", () => {
      render(<SkillStreamingView {...defaultProps} status="error" />);

      expect(screen.getByText(/エラー/i)).toBeInTheDocument();
    });

    it("should not show badge for idle status", () => {
      render(<SkillStreamingView {...defaultProps} status="idle" />);

      expect(screen.queryByText(/実行中|権限確認|完了|エラー/i)).not.toBeInTheDocument();
    });
  });

  describe("abort button", () => {
    it("should show abort button when running", () => {
      render(<SkillStreamingView {...defaultProps} status="running" />);

      expect(screen.getByRole("button", { name: /停止/i })).toBeInTheDocument();
    });

    it("should not show abort button when completed", () => {
      render(<SkillStreamingView {...defaultProps} status="completed" />);

      expect(screen.queryByRole("button", { name: /停止/i })).not.toBeInTheDocument();
    });

    it("should call abortExecution when abort clicked", async () => {
      const user = userEvent.setup();
      const abortExecution = vi.fn();
      mockUseAppStore.mockReturnValue({
        ...defaultStoreState,
        abortExecution,
      });

      render(<SkillStreamingView {...defaultProps} status="running" />);

      await user.click(screen.getByRole("button", { name: /停止/i }));

      expect(abortExecution).toHaveBeenCalled();
    });
  });

  describe("tool execution history", () => {
    it("should show tool execution history when tools were used", () => {
      const messages: SkillStreamMessage[] = [
        {
          type: "tool_use",
          content: { toolName: "Bash", toolUseId: "tool-1" },
          timestamp: Date.now(),
        },
        {
          type: "tool_result",
          content: { toolUseId: "tool-1", success: true },
          timestamp: Date.now(),
        },
      ];

      render(<SkillStreamingView {...defaultProps} messages={messages} />);

      expect(screen.getByText(/ツール実行履歴.*1件/i)).toBeInTheDocument();
    });

    it("should not show tool history when no tools were used", () => {
      const messages: SkillStreamMessage[] = [
        {
          type: "assistant",
          content: { text: "Hello", isPartial: false },
          timestamp: Date.now(),
        },
      ];

      render(<SkillStreamingView {...defaultProps} messages={messages} />);

      expect(screen.queryByText(/ツール実行履歴/i)).not.toBeInTheDocument();
    });
  });
});
```

## ファイル

| 操作 | パス                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillSelector.test.tsx`      |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx`  |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.test.tsx`   |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx` |

## 依存パッケージ

- `vitest` - テストフレームワーク（既存）
- `@testing-library/react` - React テストユーティリティ（既存）
- `@testing-library/user-event` - ユーザーイベントシミュレーション（既存）

## 完了条件

- [ ] SkillSelector テストが全て通過する
- [ ] SkillImportDialog テストが全て通過する
- [ ] PermissionDialog テストが全て通過する
- [ ] SkillStreamingView テストが全て通過する
- [ ] カバレッジ 80% 以上

## テストケース一覧

### SkillSelector (15ケース)

1. rendering - スキル未選択時の表示
2. rendering - 選択中スキル名表示
3. rendering - スキャン中の状態表示
4. dropdown - クリックで開く
5. dropdown - 外側クリックで閉じる
6. dropdown - インポート済みセクション表示
7. dropdown - 利用可能セクション表示
8. selection - スキル選択
9. selection - スキル選択解除
10. keyboard - Escape で閉じる
11. keyboard - 矢印キーナビゲーション
12. rescan - 再スキャン実行
13. rescan - スキャン中はボタン無効
14. a11y - ARIA 属性
15. a11y - aria-expanded 更新

### SkillImportDialog (12ケース)

1. rendering - isOpen=false で非表示
2. rendering - スキル名・説明表示
3. rendering - 許可ツール表示
4. rendering - agents 一覧表示
5. rendering - references 一覧表示
6. rendering - 空セクション非表示
7. import - インポート実行
8. import - ローディング状態
9. import - 成功後ダイアログ閉じる
10. close - キャンセルボタン
11. close - 閉じるボタン
12. close - インポート中は無効

### PermissionDialog (12ケース)

1. rendering - pendingPermission null で非表示
2. rendering - ツール名表示
3. rendering - Bash コマンド引数表示
4. rendering - ファイルパス引数表示
5. rendering - JSON 引数表示
6. rendering - 理由表示
7. deny - 拒否ボタン
8. deny - 閉じるボタン
9. approve once - 1回許可
10. approve - 許可（remember なし）
11. approve - 許可（remember あり）
12. checkbox - チェックボックスリセット

### SkillStreamingView (16ケース)

1. rendering - スキル名表示
2. rendering - アシスタントメッセージ
3. rendering - パーシャルメッセージ（カーソル付き）
4. rendering - ツール使用通知
5. rendering - ツール結果（成功）
6. rendering - ツール結果（失敗）
7. rendering - エラーメッセージ
8. status - running 表示
9. status - permission_pending 表示
10. status - completed 表示
11. status - error 表示
12. status - idle でバッジなし
13. abort - running 時に表示
14. abort - completed 時に非表示
15. abort - クリックで実行
16. history - ツール履歴表示/非表示

## 参考資料

- [Testing Library ドキュメント](https://testing-library.com/docs/react-testing-library/intro)
- [user-event ドキュメント](https://testing-library.com/docs/user-event/intro)
- 既存テストパターン: `apps/desktop/src/renderer/components/__tests__/`
