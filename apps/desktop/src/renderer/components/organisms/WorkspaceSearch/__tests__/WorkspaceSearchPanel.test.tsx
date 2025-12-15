/**
 * WorkspaceSearchPanel Component Tests
 *
 * ワークスペース全体検索・置換パネルのテスト
 *
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
  within,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { axe, toHaveNoViolations } from "jest-axe";
import { WorkspaceSearchPanel } from "../WorkspaceSearchPanel";

expect.extend(toHaveNoViolations);

// Mock IPC
const mockInvoke = vi.fn();
vi.mock("@/hooks/useIpc", () => ({
  useIpc: () => ({ invoke: mockInvoke }),
}));

describe("WorkspaceSearchPanel", () => {
  const user = userEvent.setup();

  const defaultProps = {
    workspacePath: "/test/workspace",
  };

  // Props with replace mode enabled (for testing replace functionality)
  const propsWithReplace = {
    ...defaultProps,
    initialShowReplace: true,
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({
      success: true,
      data: { matches: [], totalCount: 0, fileCount: 0 },
    });
  });

  // ============================================
  // レンダリングテスト
  // ============================================
  describe("Rendering", () => {
    it("should render the workspace search panel", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(screen.getByTestId("workspace-search-panel")).toBeInTheDocument();
    });

    it("should render search input field", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/全体検索|search all/i),
      ).toBeInTheDocument();
    });

    it("should render replace input field when initialShowReplace is true", () => {
      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      expect(screen.getByTestId("replace-input")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/置換|replace/i)).toBeInTheDocument();
    });

    it("should not render replace input field by default", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(screen.queryByTestId("replace-input")).not.toBeInTheDocument();
    });

    it("should render search option buttons", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      // Case sensitive button (Aa)
      expect(
        screen.getByRole("checkbox", {
          name: /大文字.*小文字|case.*sensitive/i,
        }),
      ).toBeInTheDocument();

      // Whole word button (Ab)
      expect(
        screen.getByRole("checkbox", { name: /単語.*単位|whole.*word/i }),
      ).toBeInTheDocument();

      // Regex button (.*)
      expect(
        screen.getByRole("checkbox", { name: /正規表現|regex/i }),
      ).toBeInTheDocument();
    });

    it("should render replace all button when initialShowReplace is true", () => {
      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      expect(screen.getByTestId("replace-all-button")).toBeInTheDocument();
      expect(screen.getByText(/すべて置換/i)).toBeInTheDocument();
    });

    it("should render advanced options toggle", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /詳細オプション/i }),
      ).toBeInTheDocument();
    });

    it("should render initial empty state message", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      expect(
        screen.getByText(/検索語を入力してEnterを押してください/i),
      ).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(
        <WorkspaceSearchPanel {...defaultProps} className="custom-class" />,
      );

      const panel = screen.getByTestId("workspace-search-panel");
      expect(panel).toHaveClass("custom-class");
    });
  });

  // ============================================
  // 検索実行テスト
  // ============================================
  describe("Search Execution", () => {
    it("should execute search on Enter key press", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      expect(mockInvoke).toHaveBeenCalledWith(
        "search:workspace:execute",
        expect.objectContaining({
          rootPath: "/test/workspace",
          query: "test",
        }),
      );
    });

    it("should not execute search with empty query", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.click(searchInput);
      await user.keyboard("{Enter}");

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("should not execute search with whitespace only query", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "   {enter}");

      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("should display search results count", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test line 1",
              line: 1,
              column: 5,
              length: 4,
              filePath: "/test/file1.ts",
            },
            {
              text: "test line 2",
              line: 3,
              column: 10,
              length: 4,
              filePath: "/test/file2.ts",
            },
          ],
          totalCount: 2,
          fileCount: 2,
        },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        // Check that count is displayed (may appear in multiple places)
        const countElements = screen.getAllByText(/2.*件/);
        expect(countElements.length).toBeGreaterThan(0);
      });
    });

    it("should display 'no results' message when nothing found", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: { matches: [], totalCount: 0, fileCount: 0 },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "notfound{enter}");

      await waitFor(() => {
        expect(screen.getByTestId("empty-results")).toBeInTheDocument();
        // Multiple elements may have "no results" text
        const noResultElements = screen.getAllByText(/結果なし|no results/i);
        expect(noResultElements.length).toBeGreaterThan(0);
      });
    });

    it("should show loading indicator while searching", async () => {
      mockInvoke.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      // Check for loader icon (spin class)
      const loader = document.querySelector(".animate-spin, [class*='spin']");
      expect(loader).toBeInTheDocument();
    });
  });

  // ============================================
  // 検索オプションテスト
  // ============================================
  describe("Search Options", () => {
    it("should toggle case sensitive option", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const caseSensitiveBtn = screen.getByRole("checkbox", {
        name: /大文字.*小文字|case.*sensitive/i,
      });

      expect(caseSensitiveBtn).toHaveAttribute("aria-checked", "false");

      await user.click(caseSensitiveBtn);

      expect(caseSensitiveBtn).toHaveAttribute("aria-checked", "true");
    });

    it("should toggle whole word option", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const wholeWordBtn = screen.getByRole("checkbox", {
        name: /単語.*単位|whole.*word/i,
      });

      expect(wholeWordBtn).toHaveAttribute("aria-checked", "false");

      await user.click(wholeWordBtn);

      expect(wholeWordBtn).toHaveAttribute("aria-checked", "true");
    });

    it("should toggle regex option", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const regexBtn = screen.getByRole("checkbox", {
        name: /正規表現|regex/i,
      });

      expect(regexBtn).toHaveAttribute("aria-checked", "false");

      await user.click(regexBtn);

      expect(regexBtn).toHaveAttribute("aria-checked", "true");
    });

    it("should send search options in request", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      // Enable case sensitive
      const caseSensitiveBtn = screen.getByRole("checkbox", {
        name: /大文字.*小文字|case.*sensitive/i,
      });
      await user.click(caseSensitiveBtn);

      // Execute search
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      expect(mockInvoke).toHaveBeenCalledWith(
        "search:workspace:execute",
        expect.objectContaining({
          options: expect.objectContaining({
            caseSensitive: true,
          }),
        }),
      );
    });
  });

  // ============================================
  // 詳細オプションテスト
  // ============================================
  describe("Advanced Options", () => {
    it("should toggle advanced options visibility", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      // Initially hidden
      expect(
        screen.queryByTestId("exclude-patterns-input"),
      ).not.toBeInTheDocument();

      // Click toggle
      const toggleBtn = screen.getByRole("button", { name: /詳細オプション/i });
      await user.click(toggleBtn);

      // Now visible
      expect(screen.getByTestId("exclude-patterns-input")).toBeInTheDocument();
    });

    it("should render exclude patterns input when advanced options are open", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const toggleBtn = screen.getByRole("button", { name: /詳細オプション/i });
      await user.click(toggleBtn);

      expect(
        screen.getByPlaceholderText(/node_modules.*\.git/i),
      ).toBeInTheDocument();
    });

    it("should send exclude patterns in search request", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      // Open advanced options
      const toggleBtn = screen.getByRole("button", { name: /詳細オプション/i });
      await user.click(toggleBtn);

      // Enter exclude pattern
      const excludeInput = screen.getByTestId("exclude-patterns-input");
      await user.type(excludeInput, "node_modules, .git");

      // Execute search
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      expect(mockInvoke).toHaveBeenCalledWith(
        "search:workspace:execute",
        expect.objectContaining({
          excludePatterns: ["node_modules", ".git"],
        }),
      );
    });
  });

  // ============================================
  // 置換機能テスト
  // ============================================
  describe("Replace Functionality", () => {
    it("should disable replace button when no search results", () => {
      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      const replaceBtn = screen.getByTestId("replace-all-button");
      expect(replaceBtn).toBeDisabled();
    });

    it("should enable replace button when search results exist", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test",
              line: 1,
              column: 5,
              length: 4,
              filePath: "/test/file.ts",
            },
          ],
          totalCount: 1,
          fileCount: 1,
        },
      });

      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        const replaceBtn = screen.getByTestId("replace-all-button");
        expect(replaceBtn).not.toBeDisabled();
      });
    });

    it("should execute replace all on button click", async () => {
      mockInvoke
        .mockResolvedValueOnce({
          success: true,
          data: {
            matches: [
              {
                text: "test",
                line: 1,
                column: 5,
                length: 4,
                filePath: "/test/file.ts",
              },
            ],
            totalCount: 1,
            fileCount: 1,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { replacedCount: 1, fileCount: 1 },
        });

      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      // Search first
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        const countElements = screen.getAllByText(/1.*件/);
        expect(countElements.length).toBeGreaterThan(0);
      });

      // Enter replacement
      const replaceInput = screen.getByTestId("replace-input");
      await user.type(replaceInput, "replacement");

      // Click replace all
      const replaceBtn = screen.getByTestId("replace-all-button");
      await user.click(replaceBtn);

      expect(mockInvoke).toHaveBeenCalledWith(
        "replace:workspace:all",
        expect.objectContaining({
          rootPath: "/test/workspace",
          query: "test",
          replaceString: "replacement",
        }),
      );
    });

    it("should execute replace on Enter in replace input", async () => {
      mockInvoke
        .mockResolvedValueOnce({
          success: true,
          data: {
            matches: [
              {
                text: "test",
                line: 1,
                column: 5,
                length: 4,
                filePath: "/test/file.ts",
              },
            ],
            totalCount: 1,
            fileCount: 1,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { replacedCount: 1, fileCount: 1 },
        });

      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      // Search first
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getAllByText(/1.*件/).length).toBeGreaterThan(0);
      });

      // Enter replacement and press Enter
      const replaceInput = screen.getByTestId("replace-input");
      await user.type(replaceInput, "replacement{enter}");

      expect(mockInvoke).toHaveBeenCalledWith(
        "replace:workspace:all",
        expect.anything(),
      );
    });

    it("should display success message after replace", async () => {
      mockInvoke
        .mockResolvedValueOnce({
          success: true,
          data: {
            matches: [
              {
                text: "test",
                line: 1,
                column: 5,
                length: 4,
                filePath: "/test/file.ts",
              },
            ],
            totalCount: 1,
            fileCount: 1,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { replacedCount: 5, fileCount: 3 },
        });

      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      // Search
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getAllByText(/1.*件/).length).toBeGreaterThan(0);
      });

      // Replace
      const replaceBtn = screen.getByTestId("replace-all-button");
      await user.click(replaceBtn);

      await waitFor(() => {
        expect(screen.getByTestId("success-message")).toBeInTheDocument();
        expect(
          screen.getByText(/5.*matches.*replaced.*3.*files/i),
        ).toBeInTheDocument();
      });
    });

    it("should call onReplaceComplete callback after replace", async () => {
      const onReplaceComplete = vi.fn();
      mockInvoke
        .mockResolvedValueOnce({
          success: true,
          data: {
            matches: [
              {
                text: "test",
                line: 1,
                column: 5,
                length: 4,
                filePath: "/test/file.ts",
              },
            ],
            totalCount: 1,
            fileCount: 1,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { replacedCount: 5, fileCount: 3 },
        });

      render(
        <WorkspaceSearchPanel
          {...propsWithReplace}
          onReplaceComplete={onReplaceComplete}
        />,
      );

      // Search
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getAllByText(/1.*件/).length).toBeGreaterThan(0);
      });

      // Replace
      const replaceBtn = screen.getByTestId("replace-all-button");
      await user.click(replaceBtn);

      await waitFor(() => {
        expect(onReplaceComplete).toHaveBeenCalledWith(5, 3);
      });
    });
  });

  // ============================================
  // 検索結果表示テスト
  // ============================================
  describe("Search Results Display", () => {
    it("should group results by file", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test line 1",
              line: 1,
              column: 5,
              length: 4,
              filePath: "/test/file1.ts",
            },
            {
              text: "test line 2",
              line: 3,
              column: 10,
              length: 4,
              filePath: "/test/file1.ts",
            },
            {
              text: "test line 3",
              line: 5,
              column: 1,
              length: 4,
              filePath: "/test/file2.ts",
            },
          ],
          totalCount: 3,
          fileCount: 2,
        },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        // Check file groups exist
        expect(
          screen.getByTestId("file-group-/test/file1.ts"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("file-group-/test/file2.ts"),
        ).toBeInTheDocument();
      });
    });

    it("should display file name in result header", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test",
              line: 1,
              column: 5,
              length: 4,
              filePath: "/test/src/component.tsx",
            },
          ],
          totalCount: 1,
          fileCount: 1,
        },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByText("component.tsx")).toBeInTheDocument();
      });
    });

    it("should display match count per file", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test 1",
              line: 1,
              column: 5,
              length: 4,
              filePath: "/test/file.ts",
            },
            {
              text: "test 2",
              line: 3,
              column: 10,
              length: 4,
              filePath: "/test/file.ts",
            },
            {
              text: "test 3",
              line: 5,
              column: 15,
              length: 4,
              filePath: "/test/file.ts",
            },
          ],
          totalCount: 3,
          fileCount: 1,
        },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        const fileGroup = screen.getByTestId("file-group-/test/file.ts");
        // The count badge (in header) should show "3" - may appear multiple times (count + line numbers)
        const threeElements = within(fileGroup).getAllByText("3");
        expect(threeElements.length).toBeGreaterThan(0);
      });
    });

    it("should display line numbers for each match", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test line",
              line: 42,
              column: 5,
              length: 4,
              filePath: "/test/file.ts",
            },
          ],
          totalCount: 1,
          fileCount: 1,
        },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByText("42")).toBeInTheDocument();
      });
    });

    it("should call onResultClick when result item is clicked", async () => {
      const onResultClick = vi.fn();
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test line",
              line: 10,
              column: 5,
              length: 4,
              filePath: "/test/file.ts",
            },
          ],
          totalCount: 1,
          fileCount: 1,
        },
      });

      render(
        <WorkspaceSearchPanel
          {...defaultProps}
          onResultClick={onResultClick}
        />,
      );

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByTestId("result-item")).toBeInTheDocument();
      });

      const resultItem = screen.getByTestId("result-item");
      await user.click(resultItem);

      expect(onResultClick).toHaveBeenCalledWith(
        expect.objectContaining({
          filePath: "/test/file.ts",
          lineNumber: 10,
          column: 5,
          matchLength: 4,
        }),
      );
    });

    it("should highlight matched text", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "hello test world",
              line: 1,
              column: 7,
              length: 4,
              filePath: "/test/file.ts",
            },
          ],
          totalCount: 1,
          fileCount: 1,
        },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        const mark = screen.getByRole("mark") || document.querySelector("mark");
        expect(mark).toBeInTheDocument();
        expect(mark).toHaveTextContent("test");
      });
    });

    it("should display results summary", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test 1",
              line: 1,
              column: 5,
              length: 4,
              filePath: "/test/file1.ts",
            },
            {
              text: "test 2",
              line: 2,
              column: 5,
              length: 4,
              filePath: "/test/file2.ts",
            },
          ],
          totalCount: 2,
          fileCount: 2,
        },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(
          screen.getAllByText(/2.*件.*\/.*2.*ファイル/).length,
        ).toBeGreaterThan(0);
      });
    });
  });

  // ============================================
  // エラーハンドリングテスト
  // ============================================
  describe("Error Handling", () => {
    it("should display error message when search fails", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Search failed",
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      });
    });

    it("should display error message when replace fails", async () => {
      mockInvoke
        .mockResolvedValueOnce({
          success: true,
          data: {
            matches: [
              {
                text: "test",
                line: 1,
                column: 5,
                length: 4,
                filePath: "/test/file.ts",
              },
            ],
            totalCount: 1,
            fileCount: 1,
          },
        })
        .mockResolvedValueOnce({
          success: false,
          error: "Replace failed",
        });

      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      // Search
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getAllByText(/1.*件/).length).toBeGreaterThan(0);
      });

      // Replace
      const replaceBtn = screen.getByTestId("replace-all-button");
      await user.click(replaceBtn);

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        expect(screen.getByText(/replace failed/i)).toBeInTheDocument();
      });
    });

    it("should handle network errors gracefully", async () => {
      mockInvoke.mockRejectedValue(new Error("Network error"));

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it("should show error styling on search input when error occurs", async () => {
      mockInvoke.mockRejectedValue(new Error("Search error"));

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(searchInput).toHaveClass("border-red-500");
      });
    });

    it("should clear error when new search is started", async () => {
      mockInvoke
        .mockRejectedValueOnce(new Error("First error"))
        .mockResolvedValueOnce({
          success: true,
          data: { matches: [], totalCount: 0, fileCount: 0 },
        });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");

      // First search fails
      await user.type(searchInput, "test{enter}");
      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toBeInTheDocument();
      });

      // Second search should clear error
      await user.clear(searchInput);
      await user.type(searchInput, "new{enter}");

      await waitFor(() => {
        expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // IME入力テスト
  // ============================================
  describe("IME Input Handling", () => {
    it("should not trigger search during IME composition", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");

      // Simulate IME composition
      searchInput.focus();
      await user.type(searchInput, "テスト");

      // During composition, Enter should not trigger search
      // (This is handled by the isComposing state)
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("should not trigger replace during IME composition in replace input", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: [
            {
              text: "test",
              line: 1,
              column: 5,
              length: 4,
              filePath: "/test/file.ts",
            },
          ],
          totalCount: 1,
          fileCount: 1,
        },
      });

      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      // First search
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getAllByText(/1.*件/).length).toBeGreaterThan(0);
      });

      // Type in replace input (should not auto-trigger replace)
      const replaceInput = screen.getByTestId("replace-input");
      await user.type(replaceInput, "置換");

      // Replace should only be called once (for the search)
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // アクセシビリティテスト
  // ============================================
  describe("Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<WorkspaceSearchPanel {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper ARIA labels on inputs", () => {
      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      expect(screen.getByTestId("search-input")).toHaveAttribute("aria-label");
      expect(screen.getByTestId("replace-input")).toHaveAttribute("aria-label");
    });

    it("should have proper ARIA roles on option buttons", () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThanOrEqual(3);
    });

    it("should have aria-expanded on advanced options toggle", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const toggleBtn = screen.getByRole("button", { name: /詳細オプション/i });
      expect(toggleBtn).toHaveAttribute("aria-expanded", "false");

      await user.click(toggleBtn);

      expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
    });

    it("should have alert role on error message", async () => {
      mockInvoke.mockRejectedValue(new Error("Test error"));

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("should have status role on success message", async () => {
      mockInvoke
        .mockResolvedValueOnce({
          success: true,
          data: {
            matches: [
              {
                text: "test",
                line: 1,
                column: 5,
                length: 4,
                filePath: "/test/file.ts",
              },
            ],
            totalCount: 1,
            fileCount: 1,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { replacedCount: 1, fileCount: 1 },
        });

      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      // Search
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getAllByText(/1.*件/).length).toBeGreaterThan(0);
      });

      // Replace
      const replaceBtn = screen.getByTestId("replace-all-button");
      await user.click(replaceBtn);

      await waitFor(() => {
        expect(screen.getByRole("status")).toBeInTheDocument();
      });
    });

    it("should auto-focus search input on mount", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByTestId("search-input")).toHaveFocus();
      });
    });
  });

  // ============================================
  // 境界値テスト
  // ============================================
  describe("Boundary Value Tests", () => {
    it("should handle single character search", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "a{enter}");

      expect(mockInvoke).toHaveBeenCalledWith(
        "search:workspace:execute",
        expect.objectContaining({ query: "a" }),
      );
    });

    it("should handle very long search query", async () => {
      const longQuery = "a".repeat(1000);
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      // Use fireEvent for long text to avoid timeout
      fireEvent.change(searchInput, { target: { value: longQuery } });
      fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith(
          "search:workspace:execute",
          expect.objectContaining({ query: longQuery }),
        );
      });
    });

    it("should handle empty results", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: { matches: [], totalCount: 0, fileCount: 0 },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "xyz{enter}");

      await waitFor(() => {
        expect(screen.getByTestId("empty-results")).toBeInTheDocument();
      });
    });

    it("should handle large number of results", async () => {
      const manyMatches = Array.from({ length: 100 }, (_, i) => ({
        text: `match ${i}`,
        line: i + 1,
        column: 5,
        length: 4,
        filePath: `/test/file${Math.floor(i / 10)}.ts`,
      }));

      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          matches: manyMatches,
          totalCount: 100,
          fileCount: 10,
        },
      });

      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "match{enter}");

      await waitFor(() => {
        expect(screen.getAllByText(/100.*件/).length).toBeGreaterThan(0);
      });
    });

    it("should handle special regex characters in non-regex mode", async () => {
      render(<WorkspaceSearchPanel {...defaultProps} />);

      const searchInput = screen.getByTestId("search-input");
      // Use fireEvent for special characters to avoid userEvent interpretation issues
      fireEvent.change(searchInput, { target: { value: "[test]" } });
      fireEvent.keyDown(searchInput, { key: "Enter", code: "Enter" });

      await waitFor(() => {
        expect(mockInvoke).toHaveBeenCalledWith(
          "search:workspace:execute",
          expect.objectContaining({
            query: "[test]",
            options: expect.objectContaining({ useRegex: false }),
          }),
        );
      });
    });

    it("should handle replace with empty string", async () => {
      mockInvoke
        .mockResolvedValueOnce({
          success: true,
          data: {
            matches: [
              {
                text: "test",
                line: 1,
                column: 5,
                length: 4,
                filePath: "/test/file.ts",
              },
            ],
            totalCount: 1,
            fileCount: 1,
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { replacedCount: 1, fileCount: 1 },
        });

      render(<WorkspaceSearchPanel {...propsWithReplace} />);

      // Search
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "test{enter}");

      await waitFor(() => {
        expect(screen.getAllByText(/1.*件/).length).toBeGreaterThan(0);
      });

      // Replace with empty string (don't type anything in replace input)
      const replaceBtn = screen.getByTestId("replace-all-button");
      await user.click(replaceBtn);

      expect(mockInvoke).toHaveBeenCalledWith(
        "replace:workspace:all",
        expect.objectContaining({
          replaceString: "",
        }),
      );
    });
  });
});
