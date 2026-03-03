import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { EditorStatusBar } from "../components/EditorPanel/EditorStatusBar";
import { useSkillEditor } from "../hooks/useSkillEditor";
import { useFileTree } from "../hooks/useFileTree";
import { UnsavedChangesDialog } from "../components/UnsavedChangesDialog";
import { FileTreeNode } from "../components/FileTreePanel/FileTreeNode";
import { EditorToolBar } from "../components/EditorToolBar";
import { SkillEditorView } from "../index";
import {
  setupSkillApiMocks,
  sampleFileTree,
  createDirectoryNode,
  createFileNode,
} from "./helpers/test-factories";

describe("Expanded Tests", () => {
  let mocks: ReturnType<typeof setupSkillApiMocks>;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks = setupSkillApiMocks();
  });

  // ─── Boundary Tests ────────────────────────────────────────

  describe("Boundary", () => {
    // BND-08
    it("EditorStatusBar: 空の言語文字列で空文字を表示する", () => {
      render(<EditorStatusBar lineCount={10} charCount={100} language="" />);
      expect(screen.getByText("10 行")).toBeInTheDocument();
      expect(screen.getByText("100 文字")).toBeInTheDocument();
    });

    // BND-09
    it("useSkillEditor: 空パスで loadFile を呼んでも readFile を呼ばない", async () => {
      const { result } = renderHook(() => useSkillEditor("my-skill"));
      await act(async () => {
        await result.current.loadFile("");
      });
      expect(mocks.readFile).not.toHaveBeenCalled();
    });

    // BND-10
    it("useSkillEditor: 10000文字の長いコンテンツを処理する", async () => {
      const longContent = "x".repeat(10000);
      mocks.readFile.mockResolvedValueOnce(longContent);
      const { result } = renderHook(() => useSkillEditor("my-skill"));
      await act(async () => {
        await result.current.loadFile("large.md");
      });
      expect(result.current.content).toBe(longContent);
      expect(result.current.content.length).toBe(10000);
    });

    // BND-11
    it("useSkillEditor: saveFile はファイル未選択時に何もしない", async () => {
      const { result } = renderHook(() => useSkillEditor("my-skill"));
      await act(async () => {
        await result.current.saveFile();
      });
      expect(mocks.writeFile).not.toHaveBeenCalled();
    });

    // BND-12
    it("useSkillEditor: saveFile は未変更時に何もしない", async () => {
      const { result } = renderHook(() => useSkillEditor("my-skill"));
      await act(async () => {
        await result.current.loadFile("SKILL.md");
      });
      await act(async () => {
        await result.current.saveFile();
      });
      expect(mocks.writeFile).not.toHaveBeenCalled();
    });

    // BND-13
    it("useFileTree: 空の skillName で refreshTree が早期リターンする", async () => {
      const { result } = renderHook(() => useFileTree(""));
      await act(async () => {
        await result.current.refreshTree();
      });
      expect(mocks.getFileTree).not.toHaveBeenCalled();
      expect(result.current.fileTree).toEqual([]);
    });

    // BND-14
    it("useSkillEditor: .ts 拡張子で language が typescript になる", async () => {
      mocks.readFile.mockResolvedValueOnce("const x = 1;");
      const { result } = renderHook(() => useSkillEditor("my-skill"));
      await act(async () => {
        await result.current.loadFile("index.ts");
      });
      expect(result.current.language).toBe("typescript");
    });

    // BND-15
    it("useSkillEditor: .json 拡張子で language が json になる", async () => {
      mocks.readFile.mockResolvedValueOnce("{}");
      const { result } = renderHook(() => useSkillEditor("my-skill"));
      await act(async () => {
        await result.current.loadFile("config.json");
      });
      expect(result.current.language).toBe("json");
    });

    // BND-16
    it("useSkillEditor: 未知の拡張子で language が text になる", async () => {
      mocks.readFile.mockResolvedValueOnce("data");
      const { result } = renderHook(() => useSkillEditor("my-skill"));
      await act(async () => {
        await result.current.loadFile("file.xyz");
      });
      expect(result.current.language).toBe("text");
    });
  });

  // ─── Error Tests ───────────────────────────────────────────

  describe("Error", () => {
    // ERR-01
    it("useFileTree: エラー後の refreshTree でエラーがクリアされる", async () => {
      mocks.getFileTree
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(sampleFileTree);

      const { result } = renderHook(() => useFileTree("my-skill"));
      await act(async () => {});
      expect(result.current.error).toContain("Network error");

      await act(async () => {
        await result.current.refreshTree();
      });
      expect(result.current.error).toBeNull();
    });

    // ERR-02
    it("useFileTree: createFile エラー時に error 状態を設定する", async () => {
      mocks.createFile.mockRejectedValueOnce(new Error("Create failed"));
      const { result } = renderHook(() => useFileTree("my-skill"));
      await act(async () => {});
      await act(async () => {
        await result.current.createFile("new.md", "content");
      });
      expect(result.current.error).toContain("Create failed");
    });

    // ERR-03
    it("useFileTree: deleteFile エラー時に error 状態を設定する", async () => {
      mocks.deleteFile.mockRejectedValueOnce(new Error("Delete failed"));
      const { result } = renderHook(() => useFileTree("my-skill"));
      await act(async () => {});
      await act(async () => {
        await result.current.deleteFile("SKILL.md");
      });
      expect(result.current.error).toContain("Delete failed");
    });

    // ERR-04
    it("useSkillEditor: 非 Error オブジェクト throw 時にデフォルトメッセージを表示する", async () => {
      mocks.readFile.mockRejectedValueOnce("string error");
      const { result } = renderHook(() => useSkillEditor("my-skill"));
      await act(async () => {
        await result.current.loadFile("SKILL.md");
      });
      expect(result.current.error).toBe("ファイルの読み込みに失敗しました");
    });

    // ERR-05
    it("useFileTree: getFileTree が関数でない場合にエラーメッセージを表示する", async () => {
      (window as Record<string, unknown>).electronAPI = {
        skill: {
          ...mocks,
          getFileTree: undefined,
        },
      };
      const { result } = renderHook(() => useFileTree("test-skill"));
      await act(async () => {});
      expect(result.current.error).toContain("getFileTree");
      expect(result.current.fileTree).toEqual([]);
    });

    // ERR-06
    it("useFileTree: createFile で非 Error throw 時にデフォルトメッセージ", async () => {
      mocks.createFile.mockRejectedValueOnce(42);
      const { result } = renderHook(() => useFileTree("my-skill"));
      await act(async () => {});
      await act(async () => {
        await result.current.createFile("new.md", "");
      });
      expect(result.current.error).toBe("ファイルの作成に失敗しました");
    });

    // ERR-07
    it("useFileTree: deleteFile で非 Error throw 時にデフォルトメッセージ", async () => {
      mocks.deleteFile.mockRejectedValueOnce({ code: "UNKNOWN" });
      const { result } = renderHook(() => useFileTree("my-skill"));
      await act(async () => {});
      await act(async () => {
        await result.current.deleteFile("file.md");
      });
      expect(result.current.error).toBe("ファイルの削除に失敗しました");
    });

    // ERR-08
    it("useFileTree: 非 Error throw 時にデフォルトメッセージを表示する", async () => {
      mocks.getFileTree.mockRejectedValueOnce("unexpected");
      const { result } = renderHook(() => useFileTree("my-skill"));
      await act(async () => {});
      expect(result.current.error).toBe(
        "ファイルツリーの読み込みに失敗しました",
      );
    });
  });

  // ─── Integration Tests ────────────────────────────────────

  describe("Integration", () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
      mocks.getFileTree.mockResolvedValue(sampleFileTree);
    });

    // INT-03
    it("ファイルツリー読み込みエラー時にエラーバナーを表示する", async () => {
      mocks.getFileTree.mockRejectedValue(new Error("接続エラー"));

      await act(async () => {
        render(<SkillEditorView skillName="my-skill" onClose={mockOnClose} />);
      });

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert.textContent).toContain("接続エラー");
    });
  });

  // ─── Accessibility Tests ──────────────────────────────────

  describe("Accessibility", () => {
    // A11Y-01
    it("UnsavedChangesDialog: Escape キーで onCancel が呼ばれる", () => {
      const mockOnCancel = vi.fn();
      render(
        <UnsavedChangesDialog
          isOpen={true}
          fileName="test.md"
          onSaveAndContinue={vi.fn()}
          onDiscardAndContinue={vi.fn()}
          onCancel={mockOnCancel}
        />,
      );
      fireEvent.keyDown(document, { key: "Escape" });
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    // A11Y-02
    it("UnsavedChangesDialog: オーバーレイクリックで onCancel が呼ばれる", () => {
      const mockOnCancel = vi.fn();
      render(
        <UnsavedChangesDialog
          isOpen={true}
          fileName="test.md"
          onSaveAndContinue={vi.fn()}
          onDiscardAndContinue={vi.fn()}
          onCancel={mockOnCancel}
        />,
      );
      const overlay = screen
        .getByTestId("unsaved-dialog-overlay")
        .querySelector("[aria-hidden='true']");
      fireEvent.click(overlay!);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    // A11Y-03
    it("FileTreeNode: ディレクトリの aria-expanded がクリックで切り替わる", () => {
      const dirNode = createDirectoryNode({
        name: "agents",
        path: "agents/",
        children: [createFileNode({ name: "a.md", path: "agents/a.md" })],
      });
      const mockOnSelect = vi.fn();
      const mockOnToggle = vi.fn();

      const { rerender } = render(
        <FileTreeNode
          node={dirNode}
          depth={0}
          isSelected={false}
          expandedDirs={new Set<string>()}
          onSelect={mockOnSelect}
          onToggleExpand={mockOnToggle}
        />,
      );

      const treeItem = screen.getByRole("treeitem");
      expect(treeItem).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(treeItem);
      expect(mockOnToggle).toHaveBeenCalledWith("agents/");

      rerender(
        <FileTreeNode
          node={dirNode}
          depth={0}
          isSelected={false}
          expandedDirs={new Set(["agents/"])}
          onSelect={mockOnSelect}
          onToggleExpand={mockOnToggle}
        />,
      );

      const items = screen.getAllByRole("treeitem");
      expect(items[0]).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByText("a.md")).toBeInTheDocument();
    });

    // A11Y-04
    it("EditorToolBar: role='toolbar' と aria-label が付与されている", () => {
      render(
        <EditorToolBar
          selectedFile="test.md"
          hasChanges={false}
          isSaving={false}
          isReadOnly={false}
          onSave={vi.fn()}
          onClose={vi.fn()}
          onOpenBackups={vi.fn()}
        />,
      );
      const toolbar = screen.getByRole("toolbar");
      expect(toolbar).toHaveAttribute("aria-label", "エディターツールバー");
    });

    // A11Y-05
    it("UnsavedChangesDialog: aria-modal='true' が付与されている", () => {
      render(
        <UnsavedChangesDialog
          isOpen={true}
          fileName="test.md"
          onSaveAndContinue={vi.fn()}
          onDiscardAndContinue={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      const dialog = screen.getByRole("alertdialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-label", "未保存の変更");
    });

    // A11Y-06
    it("EditorToolBar: 全ボタンに aria-label が付与されている", () => {
      render(
        <EditorToolBar
          selectedFile="test.md"
          hasChanges={false}
          isSaving={false}
          isReadOnly={false}
          onSave={vi.fn()}
          onClose={vi.fn()}
          onOpenBackups={vi.fn()}
        />,
      );
      expect(screen.getByLabelText("保存")).toBeInTheDocument();
      expect(screen.getByLabelText("バックアップ")).toBeInTheDocument();
      expect(screen.getByLabelText("閉じる")).toBeInTheDocument();
    });
  });
});
