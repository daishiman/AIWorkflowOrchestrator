/**
 * useWorkspaceFileSelection フックのテスト
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWorkspaceFileSelection } from "./useWorkspaceFileSelection";
import type { FileNode } from "../../../../store/types";

describe("useWorkspaceFileSelection", () => {
  const mockFileNode: FileNode = {
    id: "file1",
    name: "test.ts",
    type: "file",
    path: "/project/test.ts",
  };

  const mockFileNode2: FileNode = {
    id: "file2",
    name: "test2.ts",
    type: "file",
    path: "/project/test2.ts",
  };

  const mockFolderId = "folder-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("初期状態", () => {
    it("空の選択状態で初期化される", () => {
      const { result } = renderHook(() => useWorkspaceFileSelection({}));

      expect(result.current.selectedPaths.size).toBe(0);
      expect(result.current.selectedFiles).toEqual([]);
    });
  });

  describe("単一選択モード", () => {
    it("ファイルを選択できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "single" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.has(mockFileNode.path)).toBe(true);
      expect(result.current.selectedFiles).toHaveLength(1);
      expect(result.current.selectedFiles[0].path).toBe(mockFileNode.path);
    });

    it("別のファイルを選択すると前の選択が解除される", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "single" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mockFileNode2.path)).toBe(true);
      expect(result.current.selectedPaths.has(mockFileNode.path)).toBe(false);
    });

    it("同じファイルを再度選択すると選択解除される", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "single" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(0);
    });
  });

  describe("複数選択モード", () => {
    it("複数のファイルを選択できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(2);
      expect(result.current.selectedFiles).toHaveLength(2);
    });

    it("選択済みファイルを再度クリックすると選択解除される", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mockFileNode2.path)).toBe(true);
    });
  });

  describe("最大選択数制限", () => {
    it("maxSelection を超える選択ができない", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          maxSelection: 1,
        }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      act(() => {
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mockFileNode.path)).toBe(true);
    });

    it("canSelect で選択可能かどうかを判定できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          maxSelection: 1,
        }),
      );

      expect(result.current.canSelect(mockFileNode.path)).toBe(true);

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      // 既に1件選択されているので、新しいファイルは選択不可
      expect(result.current.canSelect(mockFileNode2.path)).toBe(false);
      // 既に選択されているファイルは選択解除可能なのでtrue
      expect(result.current.canSelect(mockFileNode.path)).toBe(true);
    });
  });

  describe("拡張子フィルター", () => {
    it("allowedExtensions で許可された拡張子のみ選択可能", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          allowedExtensions: [".md", ".txt"],
        }),
      );

      const mdFile: FileNode = {
        id: "md1",
        name: "readme.md",
        type: "file",
        path: "/project/readme.md",
      };

      const tsFile: FileNode = {
        id: "ts1",
        name: "index.ts",
        type: "file",
        path: "/project/index.ts",
      };

      act(() => {
        result.current.toggleFile(mdFile.path, mdFile, mockFolderId);
        result.current.toggleFile(tsFile.path, tsFile, mockFolderId);
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mdFile.path)).toBe(true);
      expect(result.current.selectedPaths.has(tsFile.path)).toBe(false);
    });

    it("canSelect が拡張子フィルタを考慮する", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          allowedExtensions: [".md", ".txt"],
        }),
      );

      // 許可された拡張子
      expect(result.current.canSelect("/project/readme.md")).toBe(true);
      expect(result.current.canSelect("/project/notes.txt")).toBe(true);

      // 許可されていない拡張子
      expect(result.current.canSelect("/project/index.ts")).toBe(false);
      expect(result.current.canSelect("/project/app.js")).toBe(false);
    });
  });

  describe("選択操作", () => {
    it("clearSelection で全ての選択を解除できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedPaths.size).toBe(0);
      expect(result.current.selectedFiles).toEqual([]);
    });

    it("removeFile で特定のファイルを選択解除できる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
        result.current.toggleFile(
          mockFileNode2.path,
          mockFileNode2,
          mockFolderId,
        );
      });

      act(() => {
        result.current.removeFile(mockFileNode.path);
      });

      expect(result.current.selectedPaths.size).toBe(1);
      expect(result.current.selectedPaths.has(mockFileNode2.path)).toBe(true);
    });
  });

  describe("コールバック", () => {
    it("onSelectionChange が選択変更時に呼ばれる", () => {
      const onSelectionChange = vi.fn();

      const { result } = renderHook(() =>
        useWorkspaceFileSelection({
          selectionMode: "multiple",
          onSelectionChange,
        }),
      );

      act(() => {
        result.current.toggleFile(
          mockFileNode.path,
          mockFileNode,
          mockFolderId,
        );
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ path: mockFileNode.path }),
        ]),
      );
    });
  });

  // ============================================================
  // T-03-1: toggleFolder関数テスト作成（TDD Red）
  // ============================================================

  describe("toggleFolder - フォルダ一括選択", () => {
    // テスト用フォルダ構造
    const createMockFolder = (files: string[]): FileNode => ({
      id: "folder-1",
      name: "test-folder",
      type: "folder",
      path: "/project/test-folder",
      children: files.map((name, i) => ({
        id: `file-${i}`,
        name,
        type: "file" as const,
        path: `/project/test-folder/${name}`,
      })),
    });

    const mockFolderWithFiles = createMockFolder([
      "file1.ts",
      "file2.ts",
      "file3.ts",
    ]);

    const mockEmptyFolder: FileNode = {
      id: "empty-folder",
      name: "empty",
      type: "folder",
      path: "/project/empty",
      children: [],
    };

    const mockNestedFolder: FileNode = {
      id: "parent-folder",
      name: "parent",
      type: "folder",
      path: "/project/parent",
      children: [
        {
          id: "file-parent-1",
          name: "file1.txt",
          type: "file",
          path: "/project/parent/file1.txt",
        },
        {
          id: "child-folder",
          name: "child",
          type: "folder",
          path: "/project/parent/child",
          children: [
            {
              id: "file-child-1",
              name: "file2.txt",
              type: "file",
              path: "/project/parent/child/file2.txt",
            },
            {
              id: "grandchild-folder",
              name: "grandchild",
              type: "folder",
              path: "/project/parent/child/grandchild",
              children: [
                {
                  id: "file-grandchild-1",
                  name: "file3.txt",
                  type: "file",
                  path: "/project/parent/child/grandchild/file3.txt",
                },
              ],
            },
          ],
        },
        {
          id: "file-parent-2",
          name: "file4.txt",
          type: "file",
          path: "/project/parent/file4.txt",
        },
      ],
    };

    describe("フォルダ一括選択", () => {
      it("フォルダクリックで配下の全ファイルが選択される", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        act(() => {
          result.current.toggleFolder(
            mockFolderWithFiles.path,
            mockFolderWithFiles,
            mockFolderId,
          );
        });

        // 3つのファイルすべてが選択されている
        expect(result.current.selectedFiles).toHaveLength(3);
        expect(
          result.current.selectedPaths.has("/project/test-folder/file1.ts"),
        ).toBe(true);
        expect(
          result.current.selectedPaths.has("/project/test-folder/file2.ts"),
        ).toBe(true);
        expect(
          result.current.selectedPaths.has("/project/test-folder/file3.ts"),
        ).toBe(true);
      });

      it("選択済みフォルダを再クリックすると配下ファイルが全解除される", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        // まず全選択
        act(() => {
          result.current.toggleFolder(
            mockFolderWithFiles.path,
            mockFolderWithFiles,
            mockFolderId,
          );
        });

        expect(result.current.selectedFiles).toHaveLength(3);

        // 再クリックで全解除
        act(() => {
          result.current.toggleFolder(
            mockFolderWithFiles.path,
            mockFolderWithFiles,
            mockFolderId,
          );
        });

        expect(result.current.selectedFiles).toHaveLength(0);
        expect(result.current.selectedPaths.size).toBe(0);
      });
    });

    describe("空フォルダ", () => {
      it("空フォルダをクリックしてもエラーにならない", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        // エラーなく実行される
        expect(() => {
          act(() => {
            result.current.toggleFolder(
              mockEmptyFolder.path,
              mockEmptyFolder,
              mockFolderId,
            );
          });
        }).not.toThrow();

        // 選択数は0のまま
        expect(result.current.selectedFiles).toHaveLength(0);
      });

      it("空フォルダのチェックボックスはunselected状態のまま", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        act(() => {
          result.current.toggleFolder(
            mockEmptyFolder.path,
            mockEmptyFolder,
            mockFolderId,
          );
        });

        // getSelectionStateでunselectedを返す
        expect(result.current.getSelectionState(mockEmptyFolder)).toBe(
          "unselected",
        );
      });
    });

    describe("ネストフォルダ（深い階層）", () => {
      it("親フォルダの選択が全階層の子孫ファイルに適用される", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        act(() => {
          result.current.toggleFolder(
            mockNestedFolder.path,
            mockNestedFolder,
            mockFolderId,
          );
        });

        // 全4ファイルが選択される
        expect(result.current.selectedFiles).toHaveLength(4);
        expect(
          result.current.selectedPaths.has("/project/parent/file1.txt"),
        ).toBe(true);
        expect(
          result.current.selectedPaths.has("/project/parent/child/file2.txt"),
        ).toBe(true);
        expect(
          result.current.selectedPaths.has(
            "/project/parent/child/grandchild/file3.txt",
          ),
        ).toBe(true);
        expect(
          result.current.selectedPaths.has("/project/parent/file4.txt"),
        ).toBe(true);
      });

      it("深いネスト構造でも正しく全解除される", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        // 全選択
        act(() => {
          result.current.toggleFolder(
            mockNestedFolder.path,
            mockNestedFolder,
            mockFolderId,
          );
        });

        expect(result.current.selectedFiles).toHaveLength(4);

        // 全解除
        act(() => {
          result.current.toggleFolder(
            mockNestedFolder.path,
            mockNestedFolder,
            mockFolderId,
          );
        });

        expect(result.current.selectedFiles).toHaveLength(0);
      });
    });

    describe("部分選択状態からの全選択", () => {
      it("一部ファイルのみ選択されている状態でフォルダをクリックすると全選択になる", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        // 1ファイルのみ個別選択
        act(() => {
          result.current.toggleFile(
            "/project/test-folder/file1.ts",
            mockFolderWithFiles.children![0],
            mockFolderId,
          );
        });

        expect(result.current.selectedFiles).toHaveLength(1);

        // フォルダをクリックして全選択
        act(() => {
          result.current.toggleFolder(
            mockFolderWithFiles.path,
            mockFolderWithFiles,
            mockFolderId,
          );
        });

        // 3ファイル全て選択
        expect(result.current.selectedFiles).toHaveLength(3);
      });
    });

    describe("拡張子フィルターとの連携", () => {
      it("allowedExtensions設定時は許可された拡張子のみ一括選択される", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({
            selectionMode: "multiple",
            allowedExtensions: [".ts"],
          }),
        );

        const mixedFolder: FileNode = {
          id: "mixed-folder",
          name: "mixed",
          type: "folder",
          path: "/project/mixed",
          children: [
            {
              id: "ts-file",
              name: "code.ts",
              type: "file",
              path: "/project/mixed/code.ts",
            },
            {
              id: "md-file",
              name: "readme.md",
              type: "file",
              path: "/project/mixed/readme.md",
            },
            {
              id: "json-file",
              name: "package.json",
              type: "file",
              path: "/project/mixed/package.json",
            },
          ],
        };

        act(() => {
          result.current.toggleFolder(
            mixedFolder.path,
            mixedFolder,
            mockFolderId,
          );
        });

        // .tsファイルのみ選択される
        expect(result.current.selectedFiles).toHaveLength(1);
        expect(result.current.selectedPaths.has("/project/mixed/code.ts")).toBe(
          true,
        );
      });
    });

    describe("maxSelection制限との連携", () => {
      it("maxSelection制限に達した場合は残り枠分のみ選択される", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({
            selectionMode: "multiple",
            maxSelection: 5,
          }),
        );

        // 事前に3ファイル選択
        act(() => {
          result.current.toggleFile(
            mockFileNode.path,
            mockFileNode,
            mockFolderId,
          );
          result.current.toggleFile(
            mockFileNode2.path,
            mockFileNode2,
            mockFolderId,
          );
          result.current.toggleFile(
            "/project/another.ts",
            {
              id: "another",
              name: "another.ts",
              type: "file",
              path: "/project/another.ts",
            },
            mockFolderId,
          );
        });

        expect(result.current.selectedFiles).toHaveLength(3);

        // 3ファイルあるフォルダを選択 → 残り枠2なので2ファイルのみ追加
        act(() => {
          result.current.toggleFolder(
            mockFolderWithFiles.path,
            mockFolderWithFiles,
            mockFolderId,
          );
        });

        // 5ファイル（上限）
        expect(result.current.selectedFiles).toHaveLength(5);
      });
    });
  });

  // ============================================================
  // T-03-2: getSelectionState関数テスト作成（TDD Red）
  // ============================================================

  describe("getSelectionState - 選択状態計算", () => {
    const createMockFolder = (files: string[]): FileNode => ({
      id: "folder-1",
      name: "test-folder",
      type: "folder",
      path: "/project/test-folder",
      children: files.map((name, i) => ({
        id: `file-${i}`,
        name,
        type: "file" as const,
        path: `/project/test-folder/${name}`,
      })),
    });

    const mockFolderWithFiles = createMockFolder([
      "file1.ts",
      "file2.ts",
      "file3.ts",
    ]);

    const mockEmptyFolder: FileNode = {
      id: "empty-folder",
      name: "empty",
      type: "folder",
      path: "/project/empty",
      children: [],
    };

    describe("unselected状態", () => {
      it("配下ファイルが0件選択の場合unselectedを返す", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        expect(result.current.getSelectionState(mockFolderWithFiles)).toBe(
          "unselected",
        );
      });

      it("空フォルダの場合unselectedを返す", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        expect(result.current.getSelectionState(mockEmptyFolder)).toBe(
          "unselected",
        );
      });
    });

    describe("indeterminate状態", () => {
      it("一部ファイル選択時はindeterminateを返す", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        // 1ファイルのみ選択
        act(() => {
          result.current.toggleFile(
            "/project/test-folder/file1.ts",
            mockFolderWithFiles.children![0],
            mockFolderId,
          );
        });

        expect(result.current.getSelectionState(mockFolderWithFiles)).toBe(
          "indeterminate",
        );
      });

      it("3ファイル中2ファイル選択時はindeterminateを返す", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        act(() => {
          result.current.toggleFile(
            "/project/test-folder/file1.ts",
            mockFolderWithFiles.children![0],
            mockFolderId,
          );
          result.current.toggleFile(
            "/project/test-folder/file2.ts",
            mockFolderWithFiles.children![1],
            mockFolderId,
          );
        });

        expect(result.current.getSelectionState(mockFolderWithFiles)).toBe(
          "indeterminate",
        );
      });
    });

    describe("selected状態", () => {
      it("全ファイル選択時はselectedを返す", () => {
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        // 全ファイル選択
        act(() => {
          result.current.toggleFolder(
            mockFolderWithFiles.path,
            mockFolderWithFiles,
            mockFolderId,
          );
        });

        expect(result.current.getSelectionState(mockFolderWithFiles)).toBe(
          "selected",
        );
      });

      it("1ファイルフォルダで1ファイル選択時はselectedを返す", () => {
        const singleFileFolder = createMockFolder(["only.ts"]);
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        act(() => {
          result.current.toggleFile(
            "/project/test-folder/only.ts",
            singleFileFolder.children![0],
            mockFolderId,
          );
        });

        expect(result.current.getSelectionState(singleFileFolder)).toBe(
          "selected",
        );
      });
    });

    describe("境界値テスト", () => {
      it("5ファイル中1ファイル選択はindeterminate", () => {
        const fiveFileFolder = createMockFolder([
          "a.ts",
          "b.ts",
          "c.ts",
          "d.ts",
          "e.ts",
        ]);
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        act(() => {
          result.current.toggleFile(
            "/project/test-folder/a.ts",
            fiveFileFolder.children![0],
            mockFolderId,
          );
        });

        expect(result.current.getSelectionState(fiveFileFolder)).toBe(
          "indeterminate",
        );
      });

      it("5ファイル中5ファイル選択はselected", () => {
        const fiveFileFolder = createMockFolder([
          "a.ts",
          "b.ts",
          "c.ts",
          "d.ts",
          "e.ts",
        ]);
        const { result } = renderHook(() =>
          useWorkspaceFileSelection({ selectionMode: "multiple" }),
        );

        act(() => {
          result.current.toggleFolder(
            fiveFileFolder.path,
            fiveFileFolder,
            mockFolderId,
          );
        });

        expect(result.current.getSelectionState(fiveFileFolder)).toBe(
          "selected",
        );
      });
    });
  });

  // ============================================================
  // 個別選択とフォルダ選択の連携
  // ============================================================

  describe("個別選択とフォルダ選択の連携", () => {
    const createMockFolder = (files: string[]): FileNode => ({
      id: "folder-1",
      name: "test-folder",
      type: "folder",
      path: "/project/test-folder",
      children: files.map((name, i) => ({
        id: `file-${i}`,
        name,
        type: "file" as const,
        path: `/project/test-folder/${name}`,
      })),
    });

    const mockFolderWithFiles = createMockFolder([
      "file1.ts",
      "file2.ts",
      "file3.ts",
    ]);

    it("フォルダ一括選択後に個別ファイルを解除するとindeterminateになる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      // フォルダ一括選択
      act(() => {
        result.current.toggleFolder(
          mockFolderWithFiles.path,
          mockFolderWithFiles,
          mockFolderId,
        );
      });

      expect(result.current.getSelectionState(mockFolderWithFiles)).toBe(
        "selected",
      );

      // 1ファイル解除
      act(() => {
        result.current.toggleFile(
          "/project/test-folder/file1.ts",
          mockFolderWithFiles.children![0],
          mockFolderId,
        );
      });

      expect(result.current.getSelectionState(mockFolderWithFiles)).toBe(
        "indeterminate",
      );
      expect(result.current.selectedFiles).toHaveLength(2);
    });

    it("全ファイルを個別に解除するとunselectedになる", () => {
      const { result } = renderHook(() =>
        useWorkspaceFileSelection({ selectionMode: "multiple" }),
      );

      // フォルダ一括選択
      act(() => {
        result.current.toggleFolder(
          mockFolderWithFiles.path,
          mockFolderWithFiles,
          mockFolderId,
        );
      });

      // 全ファイル個別解除
      act(() => {
        result.current.toggleFile(
          "/project/test-folder/file1.ts",
          mockFolderWithFiles.children![0],
          mockFolderId,
        );
        result.current.toggleFile(
          "/project/test-folder/file2.ts",
          mockFolderWithFiles.children![1],
          mockFolderId,
        );
        result.current.toggleFile(
          "/project/test-folder/file3.ts",
          mockFolderWithFiles.children![2],
          mockFolderId,
        );
      });

      expect(result.current.getSelectionState(mockFolderWithFiles)).toBe(
        "unselected",
      );
      expect(result.current.selectedFiles).toHaveLength(0);
    });
  });
});
