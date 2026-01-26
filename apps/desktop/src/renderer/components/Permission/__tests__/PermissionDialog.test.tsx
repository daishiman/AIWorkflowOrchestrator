/**
 * @file PermissionDialog.test.tsx
 * @description PermissionDialog React コンポーネント ユニットテスト
 * @phase Phase 5: 実装（TDD: Green）
 * @task TASK-4-2-permission-resolver-ipc-handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SkillPermissionRequest } from "@repo/shared";
import { PermissionDialog } from "../PermissionDialog";

describe("PermissionDialog", () => {
  const defaultRequest: SkillPermissionRequest = {
    executionId: "exec-123",
    requestId: "req-456",
    toolName: "Bash",
    args: { command: "ls -la" },
    reason: "ディレクトリ内容を確認",
  };

  const defaultProps = {
    request: defaultRequest,
    isOpen: true,
    onAllow: vi.fn(),
    onDeny: vi.fn(),
    onClose: vi.fn(),
    isResponding: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("表示制御", () => {
    it("should not render when isOpen is false", () => {
      render(<PermissionDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render dialog when isOpen is true", () => {
      render(<PermissionDialog {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when request is null", () => {
      render(<PermissionDialog {...defaultProps} request={null} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("コンテンツ表示", () => {
    it("should display tool name", () => {
      render(<PermissionDialog {...defaultProps} />);

      expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    it("should display args as JSON", () => {
      render(<PermissionDialog {...defaultProps} />);

      // JSON形式で表示されていることを確認
      expect(screen.getByText(/"command"/)).toBeInTheDocument();
      expect(screen.getByText(/"ls -la"/)).toBeInTheDocument();
    });

    it("should display reason when provided", () => {
      render(<PermissionDialog {...defaultProps} />);

      expect(screen.getByText("ディレクトリ内容を確認")).toBeInTheDocument();
    });

    it("should hide reason section when not provided", () => {
      const requestWithoutReason: SkillPermissionRequest = {
        ...defaultRequest,
        reason: undefined,
      };

      render(
        <PermissionDialog {...defaultProps} request={requestWithoutReason} />,
      );

      // 理由セクションが表示されていないことを確認
      expect(
        screen.queryByText("ディレクトリ内容を確認"),
      ).not.toBeInTheDocument();
    });

    it("should display dialog title", () => {
      render(<PermissionDialog {...defaultProps} />);

      expect(screen.getByText("権限の確認")).toBeInTheDocument();
    });

    it("should display dialog description", () => {
      render(<PermissionDialog {...defaultProps} />);

      expect(
        screen.getByText(/以下のツールを実行してもよろしいですか/),
      ).toBeInTheDocument();
    });
  });

  describe("ユーザー操作", () => {
    it("should call onAllow when allow button is clicked", async () => {
      const onAllow = vi.fn();

      render(<PermissionDialog {...defaultProps} onAllow={onAllow} />);

      fireEvent.click(screen.getByRole("button", { name: /許可/i }));

      expect(onAllow).toHaveBeenCalledTimes(1);
    });

    it("should call onDeny when deny button is clicked", async () => {
      const onDeny = vi.fn();

      render(<PermissionDialog {...defaultProps} onDeny={onDeny} />);

      fireEvent.click(screen.getByRole("button", { name: /拒否/i }));

      expect(onDeny).toHaveBeenCalledTimes(1);
    });

    it("should call onDeny on Escape key", async () => {
      const onDeny = vi.fn();

      render(<PermissionDialog {...defaultProps} onDeny={onDeny} />);

      fireEvent.keyDown(document, { key: "Escape" });

      expect(onDeny).toHaveBeenCalledTimes(1);
    });

    it("should call onClose on overlay click", async () => {
      const onClose = vi.fn();

      render(<PermissionDialog {...defaultProps} onClose={onClose} />);

      // オーバーレイをクリック（aria-hidden="true"の要素）
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
      }

      // onCloseが定義されていればonCloseを呼ぶ
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onDeny on overlay click when onClose is not provided", async () => {
      const onDeny = vi.fn();

      render(
        <PermissionDialog
          {...defaultProps}
          onClose={undefined}
          onDeny={onDeny}
        />,
      );

      // オーバーレイをクリック
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(onDeny).toHaveBeenCalledTimes(1);
    });

    it("should disable buttons when isResponding is true", () => {
      render(<PermissionDialog {...defaultProps} isResponding={true} />);

      expect(screen.getByRole("button", { name: /許可/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /拒否/i })).toBeDisabled();
    });

    it("should show loading text when isResponding is true", () => {
      render(<PermissionDialog {...defaultProps} isResponding={true} />);

      expect(screen.getByText("処理中...")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("should have aria-modal attribute", () => {
      render(<PermissionDialog {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    it("should have aria-labelledby attribute", () => {
      render(<PermissionDialog {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");
    });

    it("should have aria-describedby attribute", () => {
      render(<PermissionDialog {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-describedby");
    });

    it("should focus allow button on open", async () => {
      render(<PermissionDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /許可/i })).toHaveFocus();
      });
    });

    it("should trap focus within dialog", async () => {
      const user = userEvent.setup();

      render(<PermissionDialog {...defaultProps} />);

      const allowButton = screen.getByRole("button", { name: /許可/i });
      const denyButton = screen.getByRole("button", { name: /拒否/i });

      // フォーカスが許可ボタン → 拒否ボタン → 許可ボタン とループすることを確認
      allowButton.focus();
      await user.tab();
      expect(denyButton).toHaveFocus();

      await user.tab();
      expect(allowButton).toHaveFocus();
    });

    it("should have hidden overlay for screen readers", () => {
      render(<PermissionDialog {...defaultProps} />);

      const overlay = document.querySelector('[aria-hidden="true"]');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe("境界値テスト", () => {
    it("should handle empty args", () => {
      const requestWithEmptyArgs: SkillPermissionRequest = {
        ...defaultRequest,
        args: {},
      };

      render(
        <PermissionDialog {...defaultProps} request={requestWithEmptyArgs} />,
      );

      // 空のargsでもエラーなく表示される
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should handle large args with scrolling", () => {
      const largeArgs: Record<string, unknown> = {};
      for (let i = 0; i < 100; i++) {
        largeArgs[`key${i}`] = `value${i}`.repeat(10);
      }
      const requestWithLargeArgs: SkillPermissionRequest = {
        ...defaultRequest,
        args: largeArgs,
      };

      render(
        <PermissionDialog {...defaultProps} request={requestWithLargeArgs} />,
      );

      // スクロール可能なコンテナがあることを確認
      const preElement = screen.getByText(/"key0"/).closest("pre");
      expect(preElement).toHaveClass("overflow-x-auto");
    });

    it("should escape special characters in reason", () => {
      const requestWithSpecialChars: SkillPermissionRequest = {
        ...defaultRequest,
        reason: '<script>alert("xss")</script>',
      };

      render(
        <PermissionDialog
          {...defaultProps}
          request={requestWithSpecialChars}
        />,
      );

      // スクリプトタグがエスケープされて表示される
      expect(screen.getByText(/<script>/)).toBeInTheDocument();
      // 実際のスクリプトは実行されない（DOM操作なし）
    });
  });
});
