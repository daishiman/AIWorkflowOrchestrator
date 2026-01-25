/**
 * ConversationSearch Component Tests
 *
 * TDD Red Phase: Tests for conversation search molecule component.
 *
 * @module @repo/desktop/renderer/components/conversation/__tests__/ConversationSearch
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConversationSearch } from "../ConversationSearch";

describe("ConversationSearch", () => {
  const mockOnSearch = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render search input", () => {
      render(<ConversationSearch onSearch={mockOnSearch} />);

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("should render with placeholder text", () => {
      render(<ConversationSearch onSearch={mockOnSearch} />);

      expect(screen.getByPlaceholderText(/検索|search/i)).toBeInTheDocument();
    });

    it("should render search icon", () => {
      render(<ConversationSearch onSearch={mockOnSearch} />);

      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    });

    it("should render with custom placeholder", () => {
      render(
        <ConversationSearch
          onSearch={mockOnSearch}
          placeholder="会話を検索..."
        />,
      );

      expect(screen.getByPlaceholderText("会話を検索...")).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should call onSearch when input value changes", async () => {
      render(<ConversationSearch onSearch={mockOnSearch} />);

      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "test" } });

      // Wait for debounce
      vi.advanceTimersByTime(300);

      expect(mockOnSearch).toHaveBeenCalledWith("test");
    });

    it("should debounce search calls", async () => {
      render(<ConversationSearch onSearch={mockOnSearch} debounceMs={300} />);

      const input = screen.getByRole("searchbox");

      fireEvent.change(input, { target: { value: "t" } });
      fireEvent.change(input, { target: { value: "te" } });
      fireEvent.change(input, { target: { value: "tes" } });
      fireEvent.change(input, { target: { value: "test" } });

      // Before debounce timeout
      expect(mockOnSearch).not.toHaveBeenCalled();

      // After debounce timeout
      vi.advanceTimersByTime(300);

      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("test");
    });

    it("should call onSearch immediately when Enter is pressed", () => {
      render(<ConversationSearch onSearch={mockOnSearch} debounceMs={300} />);

      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockOnSearch).toHaveBeenCalledWith("test");
    });

    it("should trim whitespace from search query", () => {
      render(<ConversationSearch onSearch={mockOnSearch} />);

      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "  test  " } });

      vi.advanceTimersByTime(300);

      expect(mockOnSearch).toHaveBeenCalledWith("test");
    });
  });

  describe("Clear Functionality", () => {
    it("should show clear button when input has value", () => {
      render(<ConversationSearch onSearch={mockOnSearch} value="test" />);

      expect(
        screen.getByRole("button", { name: /クリア|clear/i }),
      ).toBeInTheDocument();
    });

    it("should hide clear button when input is empty", () => {
      render(<ConversationSearch onSearch={mockOnSearch} value="" />);

      expect(
        screen.queryByRole("button", { name: /クリア|clear/i }),
      ).not.toBeInTheDocument();
    });

    it("should clear input when clear button is clicked", () => {
      render(
        <ConversationSearch
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          value="test"
        />,
      );

      const clearButton = screen.getByRole("button", { name: /クリア|clear/i });
      fireEvent.click(clearButton);

      expect(mockOnClear).toHaveBeenCalled();
    });

    it("should call onSearch with empty string when cleared", () => {
      render(
        <ConversationSearch
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          value="test"
        />,
      );

      const clearButton = screen.getByRole("button", { name: /クリア|clear/i });
      fireEvent.click(clearButton);

      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("should clear input when Escape is pressed", () => {
      render(
        <ConversationSearch
          onSearch={mockOnSearch}
          onClear={mockOnClear}
          value="test"
        />,
      );

      const input = screen.getByRole("searchbox");
      fireEvent.keyDown(input, { key: "Escape" });

      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator when isSearching is true", () => {
      render(<ConversationSearch onSearch={mockOnSearch} isSearching={true} />);

      expect(screen.getByTestId("search-loading")).toBeInTheDocument();
    });

    it("should hide loading indicator when isSearching is false", () => {
      render(
        <ConversationSearch onSearch={mockOnSearch} isSearching={false} />,
      );

      expect(screen.queryByTestId("search-loading")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have correct role", () => {
      render(<ConversationSearch onSearch={mockOnSearch} />);

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("should have accessible label", () => {
      render(<ConversationSearch onSearch={mockOnSearch} />);

      const input = screen.getByRole("searchbox");
      expect(input).toHaveAccessibleName();
    });

    it("should announce search results to screen readers", () => {
      render(<ConversationSearch onSearch={mockOnSearch} resultCount={5} />);

      expect(screen.getByRole("status")).toHaveTextContent(/5/);
    });

    it("should be focusable", () => {
      render(<ConversationSearch onSearch={mockOnSearch} />);

      const input = screen.getByRole("searchbox");
      expect(input).not.toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Disabled State", () => {
    it("should disable input when disabled prop is true", () => {
      render(<ConversationSearch onSearch={mockOnSearch} disabled={true} />);

      expect(screen.getByRole("searchbox")).toBeDisabled();
    });

    it("should not call onSearch when disabled", () => {
      render(<ConversationSearch onSearch={mockOnSearch} disabled={true} />);

      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "test" } });

      vi.advanceTimersByTime(300);

      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });
});
