/**
 * NewConversationButton Component Tests
 *
 * TDD Red Phase: Tests for new conversation button atom component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/NewConversationButton
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NewConversationButton } from "../NewConversationButton";

describe("NewConversationButton", () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render as a button", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should render with correct label", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      expect(
        screen.getByRole("button", { name: /新規|new/i }),
      ).toBeInTheDocument();
    });

    it("should render with icon", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      expect(screen.getByTestId("new-conversation-icon")).toBeInTheDocument();
    });

    it("should render with custom label", () => {
      render(
        <NewConversationButton
          onClick={mockOnClick}
          label="新しい会話を作成"
        />,
      );

      expect(
        screen.getByRole("button", { name: "新しい会話を作成" }),
      ).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onClick when clicked", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      fireEvent.click(screen.getByRole("button"));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should call onClick when Enter is pressed", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should call onClick when Space is pressed", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      fireEvent.keyDown(screen.getByRole("button"), { key: " " });
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Disabled State", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<NewConversationButton onClick={mockOnClick} disabled={true} />);

      expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should not call onClick when disabled", () => {
      render(<NewConversationButton onClick={mockOnClick} disabled={true} />);

      fireEvent.click(screen.getByRole("button"));
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should have disabled styles when disabled", () => {
      render(<NewConversationButton onClick={mockOnClick} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator when isLoading is true", () => {
      render(<NewConversationButton onClick={mockOnClick} isLoading={true} />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should hide icon when isLoading is true", () => {
      render(<NewConversationButton onClick={mockOnClick} isLoading={true} />);

      expect(
        screen.queryByTestId("new-conversation-icon"),
      ).not.toBeInTheDocument();
    });

    it("should be disabled when isLoading is true", () => {
      render(<NewConversationButton onClick={mockOnClick} isLoading={true} />);

      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have correct role", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should be focusable", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button).not.toHaveAttribute("tabIndex", "-1");
    });

    it("should have accessible label", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAccessibleName();
    });

    it("should announce loading state to screen readers", () => {
      render(<NewConversationButton onClick={mockOnClick} isLoading={true} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Variants", () => {
    it("should support primary variant", () => {
      render(<NewConversationButton onClick={mockOnClick} variant="primary" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("primary");
    });

    it("should support secondary variant", () => {
      render(
        <NewConversationButton onClick={mockOnClick} variant="secondary" />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("secondary");
    });

    it("should default to primary variant", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("primary");
    });
  });

  describe("Size Variants", () => {
    it("should support small size", () => {
      render(<NewConversationButton onClick={mockOnClick} size="sm" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("sm");
    });

    it("should support medium size", () => {
      render(<NewConversationButton onClick={mockOnClick} size="md" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("md");
    });

    it("should support large size", () => {
      render(<NewConversationButton onClick={mockOnClick} size="lg" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("lg");
    });

    it("should default to medium size", () => {
      render(<NewConversationButton onClick={mockOnClick} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("md");
    });
  });
});
