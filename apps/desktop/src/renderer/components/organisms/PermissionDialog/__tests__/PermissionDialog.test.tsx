/**
 * PermissionDialog コンポーネントテスト
 * TDD: Red Phase - 実装前にテストを作成
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PermissionDialog } from "../PermissionDialog";
import type { PermissionRequest } from "@repo/shared/types/agent";

// テスト用のモックPermissionRequest
const mockRequest: PermissionRequest = {
  executionId: "exec-123",
  requestId: "req-456",
  toolName: "Bash",
  args: {
    command: "npm install",
  },
  reason: "Installing project dependencies",
};

const _mockRequestWithoutReason: PermissionRequest = {
  executionId: "exec-123",
  requestId: "req-789",
  toolName: "Read",
  args: {
    file_path: "/path/to/file.txt",
  },
};

describe("PermissionDialog", () => {
  const defaultProps = {
    request: mockRequest,
    onApprove: vi.fn(),
    onDeny: vi.fn(),
  };

  describe("rendering", () => {
    it("should not render when request is null", () => {
      // Arrange & Act
      render(
        <PermissionDialog
          request={null}
          onApprove={vi.fn()}
          onDeny={vi.fn()}
        />,
      );

      // Assert
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should render dialog when request exists", () => {
      // Arrange & Act
      render(<PermissionDialog {...defaultProps} />);

      // Assert
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should display tool name", () => {
      // Arrange & Act
      render(<PermissionDialog {...defaultProps} />);

      // Assert
      expect(screen.getByText("Bash")).toBeInTheDocument();
    });

    it("should display tool arguments", () => {
      // Arrange & Act
      render(<PermissionDialog {...defaultProps} />);

      // Assert
      expect(screen.getByText(/npm install/)).toBeInTheDocument();
    });

    it("should display reason if provided", () => {
      // Arrange & Act
      render(<PermissionDialog {...defaultProps} />);

      // Assert
      expect(
        screen.getByText("Installing project dependencies"),
      ).toBeInTheDocument();
    });
  });

  describe("approve behavior", () => {
    it("should call onApprove when approve clicked", async () => {
      // Arrange
      const onApprove = vi.fn();
      render(<PermissionDialog {...defaultProps} onApprove={onApprove} />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /許可/i }));

      // Assert
      expect(onApprove).toHaveBeenCalledTimes(1);
    });

    it("should pass rememberChoice=false by default", async () => {
      // Arrange
      const onApprove = vi.fn();
      render(<PermissionDialog {...defaultProps} onApprove={onApprove} />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /許可/i }));

      // Assert
      expect(onApprove).toHaveBeenCalledWith(false);
    });

    it("should pass rememberChoice=true when checked", async () => {
      // Arrange
      const onApprove = vi.fn();
      render(<PermissionDialog {...defaultProps} onApprove={onApprove} />);

      // Act - まずチェックボックスをオンにする
      await userEvent.click(screen.getByRole("checkbox"));
      await userEvent.click(screen.getByRole("button", { name: /許可/i }));

      // Assert
      expect(onApprove).toHaveBeenCalledWith(true);
    });
  });

  describe("deny behavior", () => {
    it("should call onDeny when deny clicked", async () => {
      // Arrange
      const onDeny = vi.fn();
      render(<PermissionDialog {...defaultProps} onDeny={onDeny} />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /拒否/i }));

      // Assert
      expect(onDeny).toHaveBeenCalledTimes(1);
    });

    it("should pass rememberChoice=false by default", async () => {
      // Arrange
      const onDeny = vi.fn();
      render(<PermissionDialog {...defaultProps} onDeny={onDeny} />);

      // Act
      await userEvent.click(screen.getByRole("button", { name: /拒否/i }));

      // Assert
      expect(onDeny).toHaveBeenCalledWith(false);
    });

    it("should pass rememberChoice=true when checked", async () => {
      // Arrange
      const onDeny = vi.fn();
      render(<PermissionDialog {...defaultProps} onDeny={onDeny} />);

      // Act - まずチェックボックスをオンにする
      await userEvent.click(screen.getByRole("checkbox"));
      await userEvent.click(screen.getByRole("button", { name: /拒否/i }));

      // Assert
      expect(onDeny).toHaveBeenCalledWith(true);
    });
  });

  describe("remember checkbox", () => {
    it("should be unchecked by default", () => {
      // Arrange & Act
      render(<PermissionDialog {...defaultProps} />);

      // Assert
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("should toggle on click", async () => {
      // Arrange
      render(<PermissionDialog {...defaultProps} />);
      const checkbox = screen.getByRole("checkbox");

      // Act
      await userEvent.click(checkbox);

      // Assert
      expect(checkbox).toBeChecked();

      // Act again - toggle off
      await userEvent.click(checkbox);

      // Assert
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("accessibility", () => {
    it("should have proper dialog role", () => {
      // Arrange & Act
      render(<PermissionDialog {...defaultProps} />);

      // Assert
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should trap focus", async () => {
      // Arrange
      render(<PermissionDialog {...defaultProps} />);
      const dialog = screen.getByRole("alertdialog");
      const buttons = screen.getAllByRole("button");
      const firstButton = buttons[0];
      const _lastButton = buttons[buttons.length - 1];

      // Act - Tab through elements
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);

      // Assert - フォーカスがダイアログ内に留まることを確認
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    it("should have proper aria-labels", () => {
      // Arrange & Act
      render(<PermissionDialog {...defaultProps} />);

      // Assert
      const dialog = screen.getByRole("alertdialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby");
    });
  });
});
