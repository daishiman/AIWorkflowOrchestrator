import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { FileSearchPanel } from "../FileSearchPanel";

expect.extend(toHaveNoViolations);

// Mock IPC
const mockInvoke = vi.fn();
vi.mock("@/hooks/useIpc", () => ({
  useIpc: () => ({ invoke: mockInvoke }),
}));

describe("FileSearchPanel", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({
      success: true,
      data: { matches: [], totalCount: 0 },
    });
  });

  describe("レンダリング", () => {
    it("should render search input field", () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/検索|search/i)).toBeInTheDocument();
    });

    it("should render search options toggles", () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      expect(
        screen.getByRole("checkbox", {
          name: /大文字.*小文字|case.*sensitive/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: /単語.*単位|whole.*word/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("checkbox", { name: /正規表現|regex/i }),
      ).toBeInTheDocument();
    });

    it("should render close button", () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      expect(
        screen.getByRole("button", { name: /閉じる|close/i }),
      ).toBeInTheDocument();
    });
  });

  describe("検索実行", () => {
    it("should trigger search on input change with debounce", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test");

      await waitFor(
        () => {
          expect(mockInvoke).toHaveBeenCalledWith(
            "search:file:execute",
            expect.objectContaining({
              query: "test",
              filePath: "/test/file.ts",
            }),
          );
        },
        { timeout: 500 },
      );
    });

    it("should trigger search on Enter key press immediately", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "query{enter}");

      expect(mockInvoke).toHaveBeenCalled();
    });

    it("should not search with empty query", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.clear(searchInput);
      await user.keyboard("{Enter}");

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("should search with minimum 1 character", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "a{enter}");

      expect(mockInvoke).toHaveBeenCalled();
    });
  });

  describe("検索オプション", () => {
    it("should toggle case sensitive option", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const caseToggle = screen.getByRole("checkbox", {
        name: /大文字.*小文字|case.*sensitive/i,
      });

      await user.click(caseToggle);

      expect(caseToggle).toBeChecked();
    });

    it("should toggle whole word option", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const wholeWordToggle = screen.getByRole("checkbox", {
        name: /単語.*単位|whole.*word/i,
      });

      await user.click(wholeWordToggle);

      expect(wholeWordToggle).toBeChecked();
    });

    it("should toggle regex option", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const regexToggle = screen.getByRole("checkbox", {
        name: /正規表現|regex/i,
      });

      await user.click(regexToggle);

      expect(regexToggle).toBeChecked();
    });

    it("should re-search when options change", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");
      mockInvoke.mockClear();

      const caseToggle = screen.getByRole("checkbox", {
        name: /大文字.*小文字|case.*sensitive/i,
      });
      await user.click(caseToggle);

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith(
          "search:file:execute",
          expect.objectContaining({
            options: expect.objectContaining({
              caseSensitive: true,
            }),
          }),
        );
      });
    });
  });

  describe("検索結果表示", () => {
    it("should display search results count", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            { line: 1, column: 5, length: 4, text: "test" },
            { line: 3, column: 10, length: 4, text: "test" },
          ],
          totalCount: 2,
        },
      });

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByText(/2/)).toBeInTheDocument();
      });
    });

    it("should display 'no results' message when nothing found", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: { matches: [], totalCount: 0 },
      });

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "notfound{enter}");

      await waitFor(() => {
        expect(
          screen.getByText(/結果.*なし|no.*results|0.*件/i),
        ).toBeInTheDocument();
      });
    });

    it("should highlight current match index", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            { line: 1, column: 5, length: 4, text: "test" },
            { line: 3, column: 10, length: 4, text: "test" },
          ],
          totalCount: 2,
        },
      });

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByText(/1.*\/.*2|1 of 2/i)).toBeInTheDocument();
      });
    });
  });

  describe("ナビゲーション", () => {
    beforeEach(() => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            { line: 1, column: 5, length: 4, text: "test" },
            { line: 3, column: 10, length: 4, text: "test" },
            { line: 5, column: 15, length: 4, text: "test" },
          ],
          totalCount: 3,
        },
      });
    });

    it("should navigate to next match on button click", async () => {
      const onNavigate = vi.fn();
      render(
        <FileSearchPanel filePath="/test/file.ts" onNavigate={onNavigate} />,
      );

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByText(/1.*\/.*3/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /次|next|↓/i });
      await user.click(nextButton);

      expect(screen.getByText(/2.*\/.*3/i)).toBeInTheDocument();
      expect(onNavigate).toHaveBeenCalledWith(
        expect.objectContaining({ line: 3, column: 10 }),
      );
    });

    it("should navigate to previous match on button click", async () => {
      const onNavigate = vi.fn();
      render(
        <FileSearchPanel filePath="/test/file.ts" onNavigate={onNavigate} />,
      );

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByText(/1.*\/.*3/i)).toBeInTheDocument();
      });

      // Go to next first
      const nextButton = screen.getByRole("button", { name: /次|next|↓/i });
      await user.click(nextButton);

      // Then go back
      const prevButton = screen.getByRole("button", { name: /前|prev|↑/i });
      await user.click(prevButton);

      expect(screen.getByText(/1.*\/.*3/i)).toBeInTheDocument();
    });

    it("should wrap around when navigating past last match", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByText(/1.*\/.*3/i)).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /次|next|↓/i });
      await user.click(nextButton); // 2
      await user.click(nextButton); // 3
      await user.click(nextButton); // 1 (wrap)

      expect(screen.getByText(/1.*\/.*3/i)).toBeInTheDocument();
    });
  });

  describe("キーボードショートカット", () => {
    it("should focus search input on Cmd+F", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      await user.keyboard("{Meta>}f{/Meta}");

      expect(screen.getByRole("searchbox")).toHaveFocus();
    });

    it("should navigate to next match on Enter", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            { line: 1, column: 5, length: 4, text: "test" },
            { line: 3, column: 10, length: 4, text: "test" },
          ],
          totalCount: 2,
        },
      });

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test");

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalled();
      });

      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByText(/2.*\/.*2/i)).toBeInTheDocument();
      });
    });

    it("should navigate to previous match on Shift+Enter", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            { line: 1, column: 5, length: 4, text: "test" },
            { line: 3, column: 10, length: 4, text: "test" },
          ],
          totalCount: 2,
        },
      });

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      // After search with Enter, we're at 1/2 (first result)
      await waitFor(() => {
        expect(screen.getByText(/1.*\/.*2/i)).toBeInTheDocument();
      });

      // Shift+Enter goes to previous (wraps to last: 2/2)
      await user.keyboard("{Shift>}{Enter}{/Shift}");

      expect(screen.getByText(/2.*\/.*2/i)).toBeInTheDocument();
    });

    it("should close panel on Escape", async () => {
      const onClose = vi.fn();
      render(<FileSearchPanel filePath="/test/file.ts" onClose={onClose} />);

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("エラーハンドリング", () => {
    it("should show error for invalid regex", async () => {
      mockInvoke.mockRejectedValue(new Error("Invalid regular expression"));

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const regexToggle = screen.getByRole("checkbox", {
        name: /正規表現|regex/i,
      });
      await user.click(regexToggle);

      const searchInput = screen.getByRole("searchbox");
      await user.click(searchInput);
      await user.paste("[invalid");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(
          screen.getByText(/無効.*正規表現|invalid.*regex/i),
        ).toBeInTheDocument();
      });
    });

    it("should show error styling on input when regex is invalid", async () => {
      mockInvoke.mockRejectedValue(new Error("Invalid regular expression"));

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const regexToggle = screen.getByRole("checkbox", {
        name: /正規表現|regex/i,
      });
      await user.click(regexToggle);

      const searchInput = screen.getByRole("searchbox");
      await user.click(searchInput);
      await user.paste("[invalid");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(searchInput).toHaveAttribute("aria-invalid", "true");
      });
    });
  });

  describe("アクセシビリティ", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(
        <FileSearchPanel filePath="/test/file.ts" />,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper ARIA labels", () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      expect(screen.getByRole("searchbox")).toHaveAttribute("aria-label");
      expect(
        screen.getByRole("button", { name: /閉じる|close/i }),
      ).toHaveAttribute("aria-label");
    });

    it("should announce search results to screen readers", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [{ line: 1, column: 5, length: 4, text: "test" }],
          totalCount: 1,
        },
      });

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        const liveRegion = screen.getByRole("status");
        expect(liveRegion).toBeInTheDocument();
      });
    });

    it("should support keyboard navigation through all interactive elements", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      searchInput.focus();

      // Tab through elements
      await user.tab();
      expect(
        screen.getByRole("checkbox", {
          name: /大文字.*小文字|case.*sensitive/i,
        }),
      ).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole("checkbox", { name: /単語.*単位|whole.*word/i }),
      ).toHaveFocus();

      await user.tab();
      expect(
        screen.getByRole("checkbox", { name: /正規表現|regex/i }),
      ).toHaveFocus();
    });
  });

  describe("ローディング状態", () => {
    it("should show loading indicator while searching", async () => {
      mockInvoke.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should hide loading indicator after search completes", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: { matches: [], totalCount: 0 },
      });

      render(<FileSearchPanel filePath="/test/file.ts" />);

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      });
    });
  });

  describe("置換モード", () => {
    it("should show replace row when initialShowReplace is true", () => {
      render(
        <FileSearchPanel filePath="/test/file.ts" initialShowReplace={true} />,
      );

      expect(screen.getByPlaceholderText(/置換|replace/i)).toBeInTheDocument();
    });

    it("should hide replace row when initialShowReplace is false", () => {
      render(
        <FileSearchPanel filePath="/test/file.ts" initialShowReplace={false} />,
      );

      expect(
        screen.queryByPlaceholderText(/置換|replace/i),
      ).not.toBeInTheDocument();
    });

    it("should toggle replace row when chevron button is clicked", async () => {
      render(<FileSearchPanel filePath="/test/file.ts" />);

      // Initially hidden
      expect(
        screen.queryByPlaceholderText(/置換|replace/i),
      ).not.toBeInTheDocument();

      // Click toggle button
      const toggleButton = screen.getByRole("button", { name: /置換を開く/i });
      await user.click(toggleButton);

      // Now visible
      expect(screen.getByPlaceholderText(/置換|replace/i)).toBeInTheDocument();
    });

    it("should call onReplaceModeChange when replace mode is toggled", async () => {
      const onReplaceModeChange = vi.fn();
      render(
        <FileSearchPanel
          filePath="/test/file.ts"
          onReplaceModeChange={onReplaceModeChange}
        />,
      );

      const toggleButton = screen.getByRole("button", { name: /置換を開く/i });
      await user.click(toggleButton);

      expect(onReplaceModeChange).toHaveBeenCalledWith(true);
    });

    it("should sync replace mode with initialShowReplace prop changes", async () => {
      const { rerender } = render(
        <FileSearchPanel filePath="/test/file.ts" initialShowReplace={false} />,
      );

      // Initially hidden
      expect(
        screen.queryByPlaceholderText(/置換|replace/i),
      ).not.toBeInTheDocument();

      // Update prop
      rerender(
        <FileSearchPanel filePath="/test/file.ts" initialShowReplace={true} />,
      );

      // Now visible
      expect(screen.getByPlaceholderText(/置換|replace/i)).toBeInTheDocument();
    });
  });
});
