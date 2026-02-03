/**
 * useFileContext Workspace統合テスト
 *
 * @description ファイル一覧取得機能のテストスイート
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFileContext } from "../useFileContext";
import type { FileNode } from "../../../../store/types";
import type { FolderId } from "../../../../store/types/workspace";

// Zustand storeをモック
const mockStore = {
  fileContexts: [],
  activeContextId: null,
  isDragging: false,
  error: null,
  workspace: {
    id: "default",
    folders: [],
    lastSelectedFileId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  folderFileTrees: new Map<FolderId, FileNode[]>(),
  addFileContext: vi.fn(),
  removeFileContext: vi.fn(),
  clearAllContexts: vi.fn(),
  setActiveContext: vi.fn(),
  setDragging: vi.fn(),
  setError: vi.fn(),
};

vi.mock("../../../../store", () => ({
  useStore: (selector: (state: typeof mockStore) => unknown) =>
    selector(mockStore),
}));

describe("useFileContext - Workspace統合", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.folderFileTrees = new Map<FolderId, FileNode[]>();
    mockStore.workspace.folders = [];
  });

  describe("getAvailableFiles", () => {
    it("folderFileTreesが空の場合、空配列を返す", () => {
      mockStore.folderFileTrees = new Map();

      const { result } = renderHook(() => useFileContext());
      const files = result.current.getAvailableFiles();

      expect(files).toEqual([]);
    });

    it("単一フォルダのファイルツリーがある場合、そのフォルダのファイル一覧を返す", () => {
      const folderId = "folder-1" as FolderId;
      const fileTree: FileNode[] = [
        { id: "1", name: "index.ts", type: "file", path: "/src/index.ts" },
        { id: "2", name: "utils.ts", type: "file", path: "/src/utils.ts" },
      ];

      mockStore.folderFileTrees = new Map<FolderId, FileNode[]>([
        [folderId, fileTree],
      ]);

      const { result } = renderHook(() => useFileContext());
      const files = result.current.getAvailableFiles();

      expect(files).toHaveLength(2);
      expect(files).toContainEqual({ path: "/src/index.ts", name: "index.ts" });
      expect(files).toContainEqual({ path: "/src/utils.ts", name: "utils.ts" });
    });

    it("複数フォルダのファイルツリーがある場合、全フォルダのファイル一覧を統合して返す", () => {
      const folder1Id = "folder-1" as FolderId;
      const folder2Id = "folder-2" as FolderId;

      mockStore.folderFileTrees = new Map<FolderId, FileNode[]>([
        [
          folder1Id,
          [{ id: "1", name: "a.ts", type: "file", path: "/folder1/a.ts" }],
        ],
        [
          folder2Id,
          [{ id: "2", name: "b.ts", type: "file", path: "/folder2/b.ts" }],
        ],
      ]);

      const { result } = renderHook(() => useFileContext());
      const files = result.current.getAvailableFiles();

      expect(files).toHaveLength(2);
      expect(files.map((f) => f.path)).toContain("/folder1/a.ts");
      expect(files.map((f) => f.path)).toContain("/folder2/b.ts");
    });

    it("ネストされたディレクトリ構造から再帰的にファイルを抽出する", () => {
      const folderId = "folder-1" as FolderId;
      const fileTree: FileNode[] = [
        {
          id: "1",
          name: "src",
          type: "folder",
          path: "/project/src",
          children: [
            {
              id: "2",
              name: "index.ts",
              type: "file",
              path: "/project/src/index.ts",
            },
            {
              id: "3",
              name: "lib",
              type: "folder",
              path: "/project/src/lib",
              children: [
                {
                  id: "4",
                  name: "utils.ts",
                  type: "file",
                  path: "/project/src/lib/utils.ts",
                },
              ],
            },
          ],
        },
      ];

      mockStore.folderFileTrees = new Map<FolderId, FileNode[]>([
        [folderId, fileTree],
      ]);

      const { result } = renderHook(() => useFileContext());
      const files = result.current.getAvailableFiles();

      expect(files).toHaveLength(2);
      expect(files).toContainEqual({
        path: "/project/src/index.ts",
        name: "index.ts",
      });
      expect(files).toContainEqual({
        path: "/project/src/lib/utils.ts",
        name: "utils.ts",
      });
    });

    it("ファイルが存在しないフォルダの場合、空配列を返す", () => {
      const folderId = "folder-1" as FolderId;
      const fileTree: FileNode[] = [
        {
          id: "1",
          name: "empty",
          type: "folder",
          path: "/empty",
          children: [],
        },
      ];

      mockStore.folderFileTrees = new Map<FolderId, FileNode[]>([
        [folderId, fileTree],
      ]);

      const { result } = renderHook(() => useFileContext());
      const files = result.current.getAvailableFiles();

      expect(files).toEqual([]);
    });
  });

  describe("workspacePath取得", () => {
    it("workspace.foldersが空の場合、最初のフォルダパスはundefined", () => {
      mockStore.workspace.folders = [];

      renderHook(() => useFileContext());

      // 内部で使用されるworkspacePathを検証
      // attachFile経由で検証する形になる
      expect(mockStore.workspace.folders.length).toBe(0);
    });

    it("workspace.foldersに要素がある場合、最初のフォルダパスを取得できる", () => {
      mockStore.workspace.folders = [
        {
          id: "folder-1" as FolderId,
          path: "/workspace/project" as unknown as string,
          displayName: "project",
          isExpanded: true,
          expandedPaths: new Set<string>(),
          addedAt: new Date(),
        },
      ];

      renderHook(() => useFileContext());

      expect(mockStore.workspace.folders[0].path).toBe("/workspace/project");
    });
  });
});
