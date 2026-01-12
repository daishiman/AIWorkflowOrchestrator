/**
 * AgentExecutionControls コンポーネントテスト
 * TDD: Red Phase - 実装前にテストを作成
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentExecutionControls } from "../AgentExecutionControls";

describe("AgentExecutionControls", () => {
  const defaultProps = {
    isExecuting: false,
    hasMessages: true,
    onCancel: vi.fn(),
    onClear: vi.fn(),
  };

  describe("cancel button", () => {
    it("should show cancel button when executing", () => {
      // Arrange & Act
      render(<AgentExecutionControls {...defaultProps} isExecuting={true} />);

      // Assert
      expect(screen.getByRole("button", { name: /キャンセル/i })).toBeVisible();
    });

    it("should hide cancel button when idle", () => {
      // Arrange & Act
      render(<AgentExecutionControls {...defaultProps} isExecuting={false} />);

      // Assert
      expect(
        screen.queryByRole("button", { name: /キャンセル/i }),
      ).not.toBeInTheDocument();
    });

    it("should call onCancel when clicked", async () => {
      // Arrange
      const onCancel = vi.fn();
      render(
        <AgentExecutionControls
          {...defaultProps}
          isExecuting={true}
          onCancel={onCancel}
        />,
      );

      // Act
      await userEvent.click(
        screen.getByRole("button", { name: /キャンセル/i }),
      );

      // Assert
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when not executing", () => {
      // Arrange & Act
      // この場合ボタン自体が表示されないので、
      // isExecutingがfalseの時、キャンセルボタンはレンダリングされない
      render(<AgentExecutionControls {...defaultProps} isExecuting={false} />);

      // Assert
      expect(
        screen.queryByRole("button", { name: /キャンセル/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("clear button", () => {
    it("should show clear button", () => {
      // Arrange & Act
      render(<AgentExecutionControls {...defaultProps} hasMessages={true} />);

      // Assert
      expect(screen.getByRole("button", { name: /クリア/i })).toBeVisible();
    });

    it("should show confirmation dialog when clicked", async () => {
      // Arrange
      render(<AgentExecutionControls {...defaultProps} hasMessages={true} />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /クリア/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });
    });

    it("should call onClear after confirmation", async () => {
      // Arrange
      const onClear = vi.fn();
      render(
        <AgentExecutionControls
          {...defaultProps}
          hasMessages={true}
          onClear={onClear}
        />,
      );

      // Act - クリアボタンをクリック
      await userEvent.click(screen.getByRole("button", { name: /クリア/i }));

      // 確認ダイアログの確認ボタンをクリック
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });
      await userEvent.click(screen.getByRole("button", { name: /確認|はい/i }));

      // Assert
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("should not call onClear when cancelled", async () => {
      // Arrange
      const onClear = vi.fn();
      render(
        <AgentExecutionControls
          {...defaultProps}
          hasMessages={true}
          onClear={onClear}
        />,
      );

      // Act - クリアボタンをクリック
      await userEvent.click(screen.getByRole("button", { name: /クリア/i }));

      // 確認ダイアログのキャンセルボタンをクリック
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });
      await userEvent.click(
        screen.getByRole("button", { name: /キャンセル|いいえ/i }),
      );

      // Assert
      expect(onClear).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have proper aria-labels", () => {
      // Arrange & Act
      render(
        <AgentExecutionControls
          {...defaultProps}
          isExecuting={true}
          hasMessages={true}
        />,
      );

      // Assert
      expect(
        screen.getByRole("button", { name: /キャンセル/i }),
      ).toHaveAttribute("aria-label");
      expect(screen.getByRole("button", { name: /クリア/i })).toHaveAttribute(
        "aria-label",
      );
    });

    it("should be keyboard accessible", async () => {
      // Arrange
      const onCancel = vi.fn();
      render(
        <AgentExecutionControls
          {...defaultProps}
          isExecuting={true}
          onCancel={onCancel}
        />,
      );
      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });

      // Act - フォーカスしてEnterキーを押す
      cancelButton.focus();
      await userEvent.keyboard("{Enter}");

      // Assert
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
