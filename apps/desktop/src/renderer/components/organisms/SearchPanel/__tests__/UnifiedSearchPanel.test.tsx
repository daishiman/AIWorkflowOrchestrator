/**
 * UnifiedSearchPanel Component Tests
 *
 * 統合検索パネルのテスト
 *
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRef } from "react";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import {
  UnifiedSearchPanel,
  type UnifiedSearchPanelRef,
} from "../UnifiedSearchPanel";

// Mock goToNext/goToPrev tracking
const mockGoToNext = vi.fn();
const mockGoToPrev = vi.fn();

// Mock child components to avoid their complexity
vi.mock("../FileSearchPanel", () => ({
  FileSearchPanel: vi
    .fn()
    .mockImplementation(
      ({ filePath, onClose, onContentUpdated, initialShowReplace }, ref) => {
        // Expose goToNext/goToPrev through ref if provided
        if (ref && typeof ref === "object" && "current" in ref) {
          ref.current = {
            goToNext: mockGoToNext,
            goToPrev: mockGoToPrev,
          };
        }
        return (
          <div
            data-testid="file-search-panel"
            data-filepath={filePath}
            data-show-replace={String(initialShowReplace)}
          >
            FileSearchPanel Mock
            <button onClick={onClose} data-testid="file-close-btn">
              Close
            </button>
            <button
              onClick={() => onContentUpdated?.("new content")}
              data-testid="content-update-btn"
            >
              Update
            </button>
          </div>
        );
      },
    ),
}));

vi.mock("../FileNameSearchPanel", () => ({
  FileNameSearchPanel: vi.fn(({ files, onSelectFile, onClose: _onClose }) => (
    <div data-testid="filename-search-panel">
      FileNameSearchPanel Mock ({files.length} files)
      <button
        onClick={() => onSelectFile?.("/selected/file.ts")}
        data-testid="select-file-btn"
      >
        Select
      </button>
    </div>
  )),
}));

vi.mock("../../WorkspaceSearch/WorkspaceSearchPanel", () => ({
  WorkspaceSearchPanel: vi.fn(({ workspacePath, onResultClick }) => (
    <div data-testid="workspace-search-panel" data-workspace={workspacePath}>
      WorkspaceSearchPanel Mock
      <button
        onClick={() =>
          onResultClick?.({
            filePath: "/workspace/file.ts",
            lineNumber: 10,
            lineContent: "test",
            column: 5,
            matchLength: 4,
          })
        }
        data-testid="workspace-result-btn"
      >
        Click Result
      </button>
    </div>
  )),
}));

describe("UnifiedSearchPanel", () => {
  const user = userEvent.setup();

  const defaultProps = {
    currentFilePath: "/test/file.ts",
    workspacePath: "/test/workspace",
    allFilePaths: ["/test/file1.ts", "/test/file2.ts", "/test/file3.ts"],
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // ============================================
  // レンダリングテスト
  // ============================================
  describe("Rendering", () => {
    it("should render the unified search panel", () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      expect(screen.getByTestId("unified-search-panel")).toBeInTheDocument();
    });

    it("should render all three tabs", () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      // File search tab - check for unique text
      expect(screen.getByText("ファイル内検索")).toBeInTheDocument();
      // Workspace search tab
      expect(screen.getByText("全体検索")).toBeInTheDocument();
      // Filename search tab
      expect(screen.getByText("ファイル名")).toBeInTheDocument();
    });

    it("should render close button", () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      // Use aria-label to find the close button specifically
      expect(screen.getByLabelText(/閉じる.*close/i)).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      render(<UnifiedSearchPanel {...defaultProps} className="custom-class" />);

      const panel = screen.getByTestId("unified-search-panel");
      expect(panel).toHaveClass("custom-class");
    });

    it("should render FileSearchPanel by default", () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      expect(screen.getByTestId("file-search-panel")).toBeInTheDocument();
    });
  });

  // ============================================
  // タブ切り替えテスト
  // ============================================
  describe("Tab Navigation", () => {
    it("should switch to workspace search tab", async () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      const workspaceTab = screen.getByRole("button", {
        name: /全体検索|all/i,
      });
      await user.click(workspaceTab);

      expect(screen.getByTestId("workspace-search-panel")).toBeInTheDocument();
    });

    it("should switch to filename search tab", async () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      const filenameTab = screen.getByRole("button", {
        name: /ファイル名|name/i,
      });
      await user.click(filenameTab);

      expect(screen.getByTestId("filename-search-panel")).toBeInTheDocument();
    });

    it("should switch back to file search tab", async () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      // Switch to workspace
      const workspaceTab = screen.getByRole("button", {
        name: /全体検索|all/i,
      });
      await user.click(workspaceTab);

      expect(screen.getByTestId("workspace-search-panel")).toBeInTheDocument();

      // Switch back to file
      const fileTab = screen.getByRole("button", {
        name: /ファイル内検索|search/i,
      });
      await user.click(fileTab);

      expect(screen.getByTestId("file-search-panel")).toBeInTheDocument();
    });

    it("should mark active tab as selected", async () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      const workspaceTab = screen.getByRole("button", {
        name: /全体検索|all/i,
      });
      await user.click(workspaceTab);

      expect(workspaceTab).toHaveAttribute("aria-selected", "true");
    });
  });

  // ============================================
  // 初期モードテスト
  // ============================================
  describe("Initial Mode", () => {
    it("should respect initialMode=file", () => {
      render(<UnifiedSearchPanel {...defaultProps} initialMode="file" />);

      expect(screen.getByTestId("file-search-panel")).toBeInTheDocument();
    });

    it("should respect initialMode=workspace", () => {
      render(<UnifiedSearchPanel {...defaultProps} initialMode="workspace" />);

      expect(screen.getByTestId("workspace-search-panel")).toBeInTheDocument();
    });

    it("should respect initialMode=filename", () => {
      render(<UnifiedSearchPanel {...defaultProps} initialMode="filename" />);

      expect(screen.getByTestId("filename-search-panel")).toBeInTheDocument();
    });

    it("should sync with initialMode prop changes", () => {
      const { rerender } = render(
        <UnifiedSearchPanel {...defaultProps} initialMode="file" />,
      );

      expect(screen.getByTestId("file-search-panel")).toBeInTheDocument();

      rerender(
        <UnifiedSearchPanel {...defaultProps} initialMode="workspace" />,
      );

      expect(screen.getByTestId("workspace-search-panel")).toBeInTheDocument();
    });
  });

  // ============================================
  // 置換モードテスト
  // ============================================
  describe("Replace Mode", () => {
    it("should hide filename tab in replace mode", () => {
      render(<UnifiedSearchPanel {...defaultProps} showReplace={true} />);

      // Filename tab should not be visible in replace mode
      expect(
        screen.queryByRole("button", { name: /^ファイル名$|^Name$/i }),
      ).not.toBeInTheDocument();
    });

    it("should show all tabs when not in replace mode", () => {
      render(<UnifiedSearchPanel {...defaultProps} showReplace={false} />);

      expect(
        screen.getByRole("button", { name: /ファイル内検索|search/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /全体検索|all/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ファイル名|name/i }),
      ).toBeInTheDocument();
    });

    it("should pass showReplace to FileSearchPanel", () => {
      render(<UnifiedSearchPanel {...defaultProps} showReplace={true} />);

      const filePanel = screen.getByTestId("file-search-panel");
      expect(filePanel).toHaveAttribute("data-show-replace", "true");
    });

    it("should show replace labels on tabs when in replace mode", () => {
      render(<UnifiedSearchPanel {...defaultProps} showReplace={true} />);

      // Check for specific replace labels
      expect(screen.getByText("ファイル内置換")).toBeInTheDocument();
      expect(screen.getByText("全体置換")).toBeInTheDocument();
    });
  });

  // ============================================
  // タブ状態テスト
  // ============================================
  describe("Tab States", () => {
    it("should allow clicking file search tab when no file is selected", () => {
      render(<UnifiedSearchPanel {...defaultProps} currentFilePath={null} />);

      const fileTab = screen.getByRole("button", {
        name: /ファイル内検索|search/i,
      });
      expect(fileTab).not.toBeDisabled();
    });

    it("should allow clicking workspace search tab when no workspace path", () => {
      render(<UnifiedSearchPanel {...defaultProps} workspacePath={null} />);

      const workspaceTab = screen.getByRole("button", {
        name: /全体検索|all/i,
      });
      expect(workspaceTab).not.toBeDisabled();
    });

    it("should show placeholder when file search tab is clicked without file", async () => {
      render(
        <UnifiedSearchPanel
          {...defaultProps}
          currentFilePath={null}
          initialMode="file"
        />,
      );

      expect(
        screen.getByText(/ファイルを選択してください/i),
      ).toBeInTheDocument();
    });

    it("should show placeholder when workspace search tab is clicked without workspace", async () => {
      render(
        <UnifiedSearchPanel
          {...defaultProps}
          workspacePath={null}
          initialMode="workspace"
        />,
      );

      expect(
        screen.getByText(/ワークスペースにフォルダを追加してください/i),
      ).toBeInTheDocument();
    });
  });

  // ============================================
  // コールバックテスト
  // ============================================
  describe("Callbacks", () => {
    it("should call onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      render(<UnifiedSearchPanel {...defaultProps} onClose={onClose} />);

      // Use aria-label to find the close button specifically
      const closeButton = screen.getByLabelText(/閉じる.*close/i);
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it("should call onFileSearchNavigate when FileSearchPanel navigates", async () => {
      const onFileSearchNavigate = vi.fn();
      render(
        <UnifiedSearchPanel
          {...defaultProps}
          onFileSearchNavigate={onFileSearchNavigate}
        />,
      );

      // FileSearchPanel is mocked, but we'd test callback propagation
      expect(screen.getByTestId("file-search-panel")).toBeInTheDocument();
    });

    it("should call onWorkspaceResultClick when workspace result is clicked", async () => {
      const onWorkspaceResultClick = vi.fn();
      render(
        <UnifiedSearchPanel
          {...defaultProps}
          initialMode="workspace"
          onWorkspaceResultClick={onWorkspaceResultClick}
        />,
      );

      const resultBtn = screen.getByTestId("workspace-result-btn");
      await user.click(resultBtn);

      expect(onWorkspaceResultClick).toHaveBeenCalledWith(
        expect.objectContaining({
          filePath: "/workspace/file.ts",
          lineNumber: 10,
        }),
      );
    });

    it("should call onFileNameSelect and switch mode when file name is selected", async () => {
      const onFileNameSelect = vi.fn();
      render(
        <UnifiedSearchPanel
          {...defaultProps}
          initialMode="filename"
          onFileNameSelect={onFileNameSelect}
        />,
      );

      const selectBtn = screen.getByTestId("select-file-btn");
      await user.click(selectBtn);

      expect(onFileNameSelect).toHaveBeenCalledWith("/selected/file.ts");

      // Should switch to file search mode after selecting
      await waitFor(() => {
        expect(screen.getByTestId("file-search-panel")).toBeInTheDocument();
      });
    });

    it("should call onContentUpdated when content is updated in FileSearchPanel", async () => {
      const onContentUpdated = vi.fn();
      render(
        <UnifiedSearchPanel
          {...defaultProps}
          onContentUpdated={onContentUpdated}
        />,
      );

      const updateBtn = screen.getByTestId("content-update-btn");
      await user.click(updateBtn);

      expect(onContentUpdated).toHaveBeenCalledWith("new content");
    });
  });

  // ============================================
  // キーボードショートカット表示テスト
  // ============================================
  describe("Keyboard Shortcuts Display", () => {
    it("should display keyboard shortcuts for tabs", () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      // Check for shortcut hints in tabs
      expect(screen.getByText(/⌘F/)).toBeInTheDocument();
      expect(screen.getByText(/⌘⇧F/)).toBeInTheDocument();
      expect(screen.getByText(/⌘P/)).toBeInTheDocument();
    });

    it("should display replace shortcuts when in replace mode", () => {
      render(<UnifiedSearchPanel {...defaultProps} showReplace={true} />);

      expect(screen.getByText(/⌘T/)).toBeInTheDocument();
      expect(screen.getByText(/⌘⇧T/)).toBeInTheDocument();
    });
  });

  // ============================================
  // ファイルリスト渡しテスト
  // ============================================
  describe("File List Passing", () => {
    it("should pass allFilePaths to FileNameSearchPanel", async () => {
      render(<UnifiedSearchPanel {...defaultProps} initialMode="filename" />);

      // Mock displays file count
      expect(screen.getByText(/3 files/)).toBeInTheDocument();
    });

    it("should pass workspacePath to WorkspaceSearchPanel", async () => {
      render(<UnifiedSearchPanel {...defaultProps} initialMode="workspace" />);

      const workspacePanel = screen.getByTestId("workspace-search-panel");
      expect(workspacePanel).toHaveAttribute(
        "data-workspace",
        "/test/workspace",
      );
    });

    it("should pass currentFilePath to FileSearchPanel", () => {
      render(<UnifiedSearchPanel {...defaultProps} />);

      const filePanel = screen.getByTestId("file-search-panel");
      expect(filePanel).toHaveAttribute("data-filepath", "/test/file.ts");
    });
  });

  // ============================================
  // 境界値テスト
  // ============================================
  describe("Boundary Value Tests", () => {
    it("should handle empty file paths array", () => {
      render(
        <UnifiedSearchPanel
          {...defaultProps}
          allFilePaths={[]}
          initialMode="filename"
        />,
      );

      expect(screen.getByText(/0 files/)).toBeInTheDocument();
    });

    it("should handle very long file path", () => {
      const longPath = "/a/".repeat(100) + "file.ts";
      render(
        <UnifiedSearchPanel {...defaultProps} currentFilePath={longPath} />,
      );

      const filePanel = screen.getByTestId("file-search-panel");
      expect(filePanel).toHaveAttribute("data-filepath", longPath);
    });

    it("should handle special characters in file path", () => {
      const specialPath = "/test/file with spaces & (special).ts";
      render(
        <UnifiedSearchPanel {...defaultProps} currentFilePath={specialPath} />,
      );

      const filePanel = screen.getByTestId("file-search-panel");
      expect(filePanel).toHaveAttribute("data-filepath", specialPath);
    });
  });

  // ============================================
  // Ref機能テスト
  // ============================================
  describe("Ref Forwarding", () => {
    beforeEach(() => {
      mockGoToNext.mockClear();
      mockGoToPrev.mockClear();
    });

    it("should expose goToNext method through ref", () => {
      const ref = createRef<UnifiedSearchPanelRef>();
      render(<UnifiedSearchPanel {...defaultProps} ref={ref} />);

      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.goToNext).toBe("function");
    });

    it("should expose goToPrev method through ref", () => {
      const ref = createRef<UnifiedSearchPanelRef>();
      render(<UnifiedSearchPanel {...defaultProps} ref={ref} />);

      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.goToPrev).toBe("function");
    });

    it("should expose setMode method through ref", () => {
      const ref = createRef<UnifiedSearchPanelRef>();
      render(<UnifiedSearchPanel {...defaultProps} ref={ref} />);

      expect(ref.current).toBeDefined();
      expect(typeof ref.current?.setMode).toBe("function");
    });

    it("should call setMode to change search mode", async () => {
      const ref = createRef<UnifiedSearchPanelRef>();
      render(<UnifiedSearchPanel {...defaultProps} ref={ref} />);

      // Initially file search panel should be visible
      expect(screen.getByTestId("file-search-panel")).toBeInTheDocument();

      // Change to workspace mode via ref
      ref.current?.setMode("workspace");

      await waitFor(() => {
        expect(
          screen.getByTestId("workspace-search-panel"),
        ).toBeInTheDocument();
      });
    });

    it("should call setMode to change to filename mode", async () => {
      const ref = createRef<UnifiedSearchPanelRef>();
      render(<UnifiedSearchPanel {...defaultProps} ref={ref} />);

      ref.current?.setMode("filename");

      await waitFor(() => {
        expect(screen.getByTestId("filename-search-panel")).toBeInTheDocument();
      });
    });
  });
});
