/**
 * WorkspaceSlice Unit Tests - TDD Red Phase
 *
 * このテストファイルは、設計書 DM-WS-001, IPC-WS-001, UI-WS-001 に基づいて作成されています。
 * TDD原則に従い、実装前にテストを作成しています。
 *
 * テスト対象: WorkspaceSlice（Zustand スライス）
 * 参照設計書: docs/30-workflows/workspace-manager/task-step01-1-data-model.md
 *            docs/30-workflows/workspace-manager/task-step01-3-ui-design.md §4
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// 型定義（実装時に作成予定）
import type {
  WorkspaceSlice,
  FolderId,
  FolderPath,
  FileId,
  FolderEntry,
  PersistedWorkspaceState,
} from "../types/workspace";
import type { FileNode } from "../types";

// スライス作成関数（実装時に作成予定）
import { createWorkspaceSlice } from "./workspaceSlice";

// ドメインファクトリ関数（実装時に作成予定）
import {
  createWorkspace,
  createFolderPath,
  createFolderId,
  addFolderToWorkspace,
  removeFolderFromWorkspace,
  serializeWorkspace,
  deserializeWorkspace,
  DuplicateFolderError,
  FolderNotFoundError,
  InvalidPathError,
} from "../types/workspace";

// Mock electronAPI
const mockElectronAPI = {
  workspace: {
    load: vi.fn(),
    save: vi.fn(),
    addFolder: vi.fn(),
    removeFolder: vi.fn(),
    validatePaths: vi.fn(),
    onFolderChanged: vi.fn(),
  },
  file: {
    getTree: vi.fn(),
  },
};

// Mock window.electronAPI
if (typeof global.window === "undefined") {
  (global as unknown as { window: Window }).window = {} as Window;
}
(
  global.window as unknown as { electronAPI: typeof mockElectronAPI }
).electronAPI = mockElectronAPI;

describe("workspaceSlice", () => {
  let store: WorkspaceSlice;
  let mockSet: (
    fn:
      | ((state: WorkspaceSlice) => Partial<WorkspaceSlice>)
      | Partial<WorkspaceSlice>,
  ) => void;
  let mockGet: () => WorkspaceSlice;

  beforeEach(() => {
    vi.clearAllMocks();
    const state: Partial<WorkspaceSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<WorkspaceSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };
    mockGet = () => store;

    store = createWorkspaceSlice(
      mockSet as never,
      mockGet as never,
      {} as never,
    );
  });

  // ============================================
  // 初期状態のテスト
  // ============================================
  describe("初期状態", () => {
    it("workspaceが空のワークスペースである", () => {
      expect(store.workspace).toBeDefined();
      expect(store.workspace.id).toBe("default");
      expect(store.workspace.folders).toEqual([]);
      expect(store.workspace.lastSelectedFileId).toBeNull();
    });

    it("folderFileTreesが空のMapである", () => {
      expect(store.folderFileTrees).toBeInstanceOf(Map);
      expect(store.folderFileTrees.size).toBe(0);
    });

    it("isLoadingがfalseである", () => {
      expect(store.workspaceIsLoading).toBe(false);
    });

    it("errorがnullである", () => {
      expect(store.workspaceError).toBeNull();
    });
  });

  // ============================================
  // loadWorkspace アクションのテスト
  // ============================================
  describe("loadWorkspace", () => {
    describe("正常系", () => {
      it("永続化されたワークスペースを読み込む", async () => {
        const persistedState: PersistedWorkspaceState = {
          version: 1,
          folders: [
            {
              id: "folder-1",
              path: "/Users/test/project",
              displayName: "project",
              isExpanded: true,
              expandedPaths: [],
              addedAt: new Date().toISOString(),
            },
          ],
          lastSelectedFilePath: null,
          updatedAt: new Date().toISOString(),
        };

        mockElectronAPI.workspace.load.mockResolvedValue({
          success: true,
          data: persistedState,
        });

        mockElectronAPI.workspace.validatePaths.mockResolvedValue({
          success: true,
          data: {
            validPaths: ["/Users/test/project"],
            invalidPaths: [],
          },
        });

        mockElectronAPI.file.getTree.mockResolvedValue({
          success: true,
          data: [],
        });

        await store.loadWorkspace();

        expect(store.workspaceIsLoading).toBe(false);
        expect(store.workspace.folders).toHaveLength(1);
        expect(store.workspace.folders[0].path).toBe("/Users/test/project");
      });

      it("存在しないパスを除外する", async () => {
        const persistedState: PersistedWorkspaceState = {
          version: 1,
          folders: [
            {
              id: "folder-1",
              path: "/Users/test/existing",
              displayName: "existing",
              isExpanded: false,
              expandedPaths: [],
              addedAt: new Date().toISOString(),
            },
            {
              id: "folder-2",
              path: "/Users/test/deleted",
              displayName: "deleted",
              isExpanded: false,
              expandedPaths: [],
              addedAt: new Date().toISOString(),
            },
          ],
          lastSelectedFilePath: null,
          updatedAt: new Date().toISOString(),
        };

        mockElectronAPI.workspace.load.mockResolvedValue({
          success: true,
          data: persistedState,
        });

        mockElectronAPI.workspace.validatePaths.mockResolvedValue({
          success: true,
          data: {
            validPaths: ["/Users/test/existing"],
            invalidPaths: [
              { path: "/Users/test/deleted", reason: "NOT_FOUND" },
            ],
          },
        });

        await store.loadWorkspace();

        expect(store.workspace.folders).toHaveLength(1);
        expect(store.workspace.folders[0].path).toBe("/Users/test/existing");
      });

      it("初回起動時は空のワークスペースを使用する", async () => {
        mockElectronAPI.workspace.load.mockResolvedValue({
          success: true,
          data: undefined,
        });

        await store.loadWorkspace();

        expect(store.workspace.folders).toHaveLength(0);
        expect(store.workspaceIsLoading).toBe(false);
      });
    });

    describe("異常系", () => {
      it("エラー時にerror状態を設定する", async () => {
        mockElectronAPI.workspace.load.mockResolvedValue({
          success: false,
          error: { code: "STORAGE_ERROR", message: "Failed to load" },
        });

        await store.loadWorkspace();

        expect(store.workspaceError).toBe("Failed to load");
        expect(store.workspaceIsLoading).toBe(false);
      });

      it("ネットワークエラー時にerror状態を設定する", async () => {
        mockElectronAPI.workspace.load.mockRejectedValue(
          new Error("Network error"),
        );

        await store.loadWorkspace();

        expect(store.workspaceError).toBe("Network error");
        expect(store.workspaceIsLoading).toBe(false);
      });
    });

    describe("ローディング状態", () => {
      it("読み込み中はisLoadingがtrueになる", async () => {
        let isLoadingDuringLoad = false;

        mockElectronAPI.workspace.load.mockImplementation(async () => {
          isLoadingDuringLoad = store.workspaceIsLoading;
          return { success: true, data: undefined };
        });

        await store.loadWorkspace();

        expect(isLoadingDuringLoad).toBe(true);
      });
    });
  });

  // ============================================
  // saveWorkspace アクションのテスト
  // ============================================
  describe("saveWorkspace", () => {
    it("ワークスペース状態を永続化する", async () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      await store.saveWorkspace();

      expect(mockElectronAPI.workspace.save).toHaveBeenCalledWith({
        state: expect.objectContaining({
          version: 1,
          folders: expect.any(Array),
        }),
      });
    });

    it("シリアライズ形式で保存する", async () => {
      // フォルダを追加した状態をシミュレート
      store.workspace = {
        ...store.workspace,
        folders: [
          {
            id: "test-id" as FolderId,
            path: "/test/path" as FolderPath,
            displayName: "path",
            isExpanded: true,
            expandedPaths: new Set(["sub1", "sub2"]),
            addedAt: new Date(),
          },
        ],
      };

      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      await store.saveWorkspace();

      const savedState = mockElectronAPI.workspace.save.mock.calls[0][0].state;
      expect(savedState.folders[0].expandedPaths).toEqual(["sub1", "sub2"]);
    });
  });

  // ============================================
  // addFolder アクションのテスト
  // ============================================
  describe("addFolder", () => {
    describe("正常系", () => {
      it("フォルダを追加する", async () => {
        mockElectronAPI.workspace.addFolder.mockResolvedValue({
          success: true,
          data: {
            path: "/Users/test/new-project",
            displayName: "new-project",
            exists: true,
            isDirectory: true,
          },
        });

        mockElectronAPI.file.getTree.mockResolvedValue({
          success: true,
          data: [],
        });

        mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

        await store.addFolder();

        expect(store.workspace.folders).toHaveLength(1);
        expect(store.workspace.folders[0].displayName).toBe("new-project");
      });

      it("追加後にファイルツリーを読み込む", async () => {
        const fileTree: FileNode[] = [
          {
            id: "1",
            name: "src",
            type: "folder",
            path: "/Users/test/new-project/src",
          },
        ];

        mockElectronAPI.workspace.addFolder.mockResolvedValue({
          success: true,
          data: {
            path: "/Users/test/new-project",
            displayName: "new-project",
            exists: true,
            isDirectory: true,
          },
        });

        mockElectronAPI.file.getTree.mockResolvedValue({
          success: true,
          data: fileTree,
        });

        mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

        await store.addFolder();

        const folderId = store.workspace.folders[0].id;
        expect(store.folderFileTrees.get(folderId)).toEqual(fileTree);
      });

      it("追加後にワークスペースを永続化する", async () => {
        mockElectronAPI.workspace.addFolder.mockResolvedValue({
          success: true,
          data: {
            path: "/Users/test/new-project",
            displayName: "new-project",
            exists: true,
            isDirectory: true,
          },
        });

        mockElectronAPI.file.getTree.mockResolvedValue({
          success: true,
          data: [],
        });

        mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

        await store.addFolder();

        expect(mockElectronAPI.workspace.save).toHaveBeenCalled();
      });
    });

    describe("異常系", () => {
      it("キャンセル時は何も追加しない", async () => {
        mockElectronAPI.workspace.addFolder.mockResolvedValue({
          success: false,
          error: { code: "CANCELED", message: "User canceled" },
        });

        await store.addFolder();

        expect(store.workspace.folders).toHaveLength(0);
      });

      it("重複フォルダの追加を防止する", async () => {
        // 既存フォルダをセット
        store.workspace = {
          ...store.workspace,
          folders: [
            {
              id: "existing" as FolderId,
              path: "/Users/test/existing" as FolderPath,
              displayName: "existing",
              isExpanded: false,
              expandedPaths: new Set(),
              addedAt: new Date(),
            },
          ],
        };

        mockElectronAPI.workspace.addFolder.mockResolvedValue({
          success: true,
          data: {
            path: "/Users/test/existing",
            displayName: "existing",
            exists: true,
            isDirectory: true,
          },
        });

        await store.addFolder();

        // 重複追加されないことを確認
        expect(store.workspace.folders).toHaveLength(1);
      });
    });
  });

  // ============================================
  // removeFolder アクションのテスト
  // ============================================
  describe("removeFolder", () => {
    beforeEach(() => {
      // フォルダを追加した状態をセット
      const folderId = "folder-1" as FolderId;
      store.workspace = {
        ...store.workspace,
        folders: [
          {
            id: folderId,
            path: "/Users/test/project" as FolderPath,
            displayName: "project",
            isExpanded: false,
            expandedPaths: new Set(),
            addedAt: new Date(),
          },
        ],
      };
      store.folderFileTrees = new Map([[folderId, []]]);
    });

    it("フォルダを削除する", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.removeFolder("folder-1" as FolderId);

      expect(store.workspace.folders).toHaveLength(0);
    });

    it("フォルダのファイルツリーも削除する", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.removeFolder("folder-1" as FolderId);

      expect(store.folderFileTrees.has("folder-1" as FolderId)).toBe(false);
    });

    it("削除後にワークスペースを永続化する", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.removeFolder("folder-1" as FolderId);

      expect(mockElectronAPI.workspace.save).toHaveBeenCalled();
    });

    it("存在しないフォルダIDでエラーにならない", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      // エラーが発生しないことを確認
      expect(() => {
        store.removeFolder("non-existent" as FolderId);
      }).not.toThrow();

      // 既存のフォルダは残っている
      expect(store.workspace.folders).toHaveLength(1);
    });
  });

  // ============================================
  // toggleFolderExpansion アクションのテスト
  // ============================================
  describe("toggleFolderExpansion", () => {
    beforeEach(() => {
      store.workspace = {
        ...store.workspace,
        folders: [
          {
            id: "folder-1" as FolderId,
            path: "/Users/test/project" as FolderPath,
            displayName: "project",
            isExpanded: false,
            expandedPaths: new Set(),
            addedAt: new Date(),
          },
        ],
      };
    });

    it("折りたたみ状態のフォルダを展開する", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.toggleFolderExpansion("folder-1" as FolderId);

      expect(store.workspace.folders[0].isExpanded).toBe(true);
    });

    it("展開状態のフォルダを折りたたむ", () => {
      store.workspace.folders[0].isExpanded = true;
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.toggleFolderExpansion("folder-1" as FolderId);

      expect(store.workspace.folders[0].isExpanded).toBe(false);
    });

    it("状態変更後にワークスペースを永続化する", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.toggleFolderExpansion("folder-1" as FolderId);

      expect(mockElectronAPI.workspace.save).toHaveBeenCalled();
    });
  });

  // ============================================
  // toggleSubfolder アクションのテスト
  // ============================================
  describe("toggleSubfolder", () => {
    beforeEach(() => {
      store.workspace = {
        ...store.workspace,
        folders: [
          {
            id: "folder-1" as FolderId,
            path: "/Users/test/project" as FolderPath,
            displayName: "project",
            isExpanded: true,
            expandedPaths: new Set(),
            addedAt: new Date(),
          },
        ],
      };
    });

    it("サブフォルダを展開パスに追加する", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.toggleSubfolder("folder-1" as FolderId, "/Users/test/project/src");

      expect(
        store.workspace.folders[0].expandedPaths.has("/Users/test/project/src"),
      ).toBe(true);
    });

    it("展開済みのサブフォルダを折りたたむ", () => {
      store.workspace.folders[0].expandedPaths = new Set([
        "/Users/test/project/src",
      ]);
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.toggleSubfolder("folder-1" as FolderId, "/Users/test/project/src");

      expect(
        store.workspace.folders[0].expandedPaths.has("/Users/test/project/src"),
      ).toBe(false);
    });
  });

  // ============================================
  // setWorkspaceSelectedFile アクションのテスト
  // ============================================
  describe("setWorkspaceSelectedFile", () => {
    it("ファイルIDを設定する", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.setWorkspaceSelectedFile("/Users/test/file.ts" as FileId);

      expect(store.workspace.lastSelectedFileId).toBe("/Users/test/file.ts");
    });

    it("nullを設定できる", () => {
      store.workspace = {
        ...store.workspace,
        lastSelectedFileId: "/Users/test/file.ts" as FileId,
      };
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.setWorkspaceSelectedFile(null);

      expect(store.workspace.lastSelectedFileId).toBeNull();
    });

    it("状態変更後にワークスペースを永続化する", () => {
      mockElectronAPI.workspace.save.mockResolvedValue({ success: true });

      store.setWorkspaceSelectedFile("/Users/test/file.ts" as FileId);

      expect(mockElectronAPI.workspace.save).toHaveBeenCalled();
    });
  });

  // ============================================
  // loadFolderTree アクションのテスト
  // ============================================
  describe("loadFolderTree", () => {
    it("フォルダのファイルツリーを読み込む", async () => {
      const fileTree: FileNode[] = [
        {
          id: "1",
          name: "src",
          type: "folder",
          path: "/Users/test/project/src",
        },
        {
          id: "2",
          name: "package.json",
          type: "file",
          path: "/Users/test/project/package.json",
        },
      ];

      mockElectronAPI.file.getTree.mockResolvedValue({
        success: true,
        data: fileTree,
      });

      await store.loadFolderTree(
        "folder-1" as FolderId,
        "/Users/test/project" as FolderPath,
      );

      expect(store.folderFileTrees.get("folder-1" as FolderId)).toEqual(
        fileTree,
      );
    });

    it("エラー時はファイルツリーを更新しない", async () => {
      mockElectronAPI.file.getTree.mockResolvedValue({
        success: false,
        error: "Access denied",
      });

      await store.loadFolderTree(
        "folder-1" as FolderId,
        "/Users/test/project" as FolderPath,
      );

      expect(store.folderFileTrees.has("folder-1" as FolderId)).toBe(false);
    });
  });
});

// ============================================
// ドメインモデルのテスト（値オブジェクト、エンティティ）
// ============================================
describe("Workspace Domain Model", () => {
  describe("FolderPath Value Object", () => {
    describe("createFolderPath", () => {
      it("有効な絶対パスを受け入れる", () => {
        const path = createFolderPath("/Users/test/project");
        expect(path).toBe("/Users/test/project");
      });

      it("末尾スラッシュを正規化する", () => {
        const path = createFolderPath("/Users/test/project/");
        expect(path).toBe("/Users/test/project");
      });

      it("連続スラッシュを正規化する", () => {
        const path = createFolderPath("/Users//test///project");
        expect(path).toBe("/Users/test/project");
      });

      it("相対パスを拒否する", () => {
        expect(() => createFolderPath("relative/path")).toThrow(
          InvalidPathError,
        );
      });

      it("パストラバーサルを拒否する", () => {
        expect(() => createFolderPath("/Users/test/../secret")).toThrow(
          InvalidPathError,
        );
      });
    });
  });

  describe("FolderId Value Object", () => {
    describe("createFolderId", () => {
      it("UUID形式のIDを生成する", () => {
        const id = createFolderId();
        // UUID v4形式を検証
        expect(id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        );
      });

      it("毎回異なるIDを生成する", () => {
        const id1 = createFolderId();
        const id2 = createFolderId();
        expect(id1).not.toBe(id2);
      });
    });
  });

  describe("Workspace Aggregate", () => {
    describe("createWorkspace", () => {
      it("空のワークスペースを作成する", () => {
        const workspace = createWorkspace();
        expect(workspace.id).toBe("default");
        expect(workspace.folders).toEqual([]);
        expect(workspace.lastSelectedFileId).toBeNull();
        expect(workspace.createdAt).toBeInstanceOf(Date);
        expect(workspace.updatedAt).toBeInstanceOf(Date);
      });
    });

    describe("addFolderToWorkspace", () => {
      it("フォルダを追加する", () => {
        const workspace = createWorkspace();
        const newWorkspace = addFolderToWorkspace(
          workspace,
          "/Users/test/project" as FolderPath,
        );

        expect(newWorkspace.folders).toHaveLength(1);
        expect(newWorkspace.folders[0].path).toBe("/Users/test/project");
        expect(newWorkspace.updatedAt.getTime()).toBeGreaterThanOrEqual(
          workspace.updatedAt.getTime(),
        );
      });

      it("重複パスを拒否する", () => {
        const workspace = createWorkspace();
        const workspace1 = addFolderToWorkspace(
          workspace,
          "/Users/test/project" as FolderPath,
        );

        expect(() =>
          addFolderToWorkspace(workspace1, "/Users/test/project" as FolderPath),
        ).toThrow(DuplicateFolderError);
      });
    });

    describe("removeFolderFromWorkspace", () => {
      it("フォルダを削除する", () => {
        const workspace = createWorkspace();
        const workspace1 = addFolderToWorkspace(
          workspace,
          "/Users/test/project" as FolderPath,
        );
        const folderId = workspace1.folders[0].id;

        const workspace2 = removeFolderFromWorkspace(workspace1, folderId);

        expect(workspace2.folders).toHaveLength(0);
      });

      it("存在しないIDでエラーを投げる", () => {
        const workspace = createWorkspace();

        expect(() =>
          removeFolderFromWorkspace(workspace, "non-existent" as FolderId),
        ).toThrow(FolderNotFoundError);
      });
    });
  });

  describe("Serialization", () => {
    describe("serializeWorkspace", () => {
      it("ワークスペースをJSON形式にシリアライズする", () => {
        const workspace = createWorkspace();
        const workspace1 = addFolderToWorkspace(
          workspace,
          "/Users/test/project" as FolderPath,
        );
        // expandedPathsを設定
        workspace1.folders[0].expandedPaths = new Set(["sub1", "sub2"]);

        const serialized = serializeWorkspace(workspace1);

        expect(serialized.version).toBe(1);
        expect(serialized.folders[0].expandedPaths).toEqual(["sub1", "sub2"]);
        expect(serialized.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO形式
      });
    });

    describe("deserializeWorkspace", () => {
      it("永続化形式からワークスペースを復元する", () => {
        const persisted: PersistedWorkspaceState = {
          version: 1,
          folders: [
            {
              id: "test-id",
              path: "/Users/test/project",
              displayName: "project",
              isExpanded: true,
              expandedPaths: ["sub1"],
              addedAt: new Date().toISOString(),
            },
          ],
          lastSelectedFilePath: "/Users/test/project/file.ts",
          updatedAt: new Date().toISOString(),
        };

        const { workspace, warnings } = deserializeWorkspace(persisted);

        expect(workspace.folders).toHaveLength(1);
        expect(workspace.folders[0].expandedPaths).toBeInstanceOf(Set);
        expect(workspace.folders[0].expandedPaths.has("sub1")).toBe(true);
        expect(warnings).toHaveLength(0);
      });

      it("無効なパスを警告付きでスキップする", () => {
        const persisted: PersistedWorkspaceState = {
          version: 1,
          folders: [
            {
              id: "test-id",
              path: "../invalid/path", // 相対パス（無効）
              displayName: "invalid",
              isExpanded: false,
              expandedPaths: [],
              addedAt: new Date().toISOString(),
            },
          ],
          lastSelectedFilePath: null,
          updatedAt: new Date().toISOString(),
        };

        const { workspace, warnings } = deserializeWorkspace(persisted);

        expect(workspace.folders).toHaveLength(0);
        expect(warnings).toHaveLength(1);
      });
    });
  });
});

// ============================================
// 境界値テスト
// ============================================
describe("Boundary Value Tests", () => {
  describe("フォルダ数の境界値", () => {
    it("0個のフォルダを持つワークスペース", () => {
      const workspace = createWorkspace();
      expect(workspace.folders).toHaveLength(0);
    });

    it("1個のフォルダを持つワークスペース", () => {
      const workspace = createWorkspace();
      const workspace1 = addFolderToWorkspace(workspace, "/test" as FolderPath);
      expect(workspace1.folders).toHaveLength(1);
    });

    it("多数のフォルダを持つワークスペース（10個）", () => {
      let workspace = createWorkspace();
      for (let i = 0; i < 10; i++) {
        workspace = addFolderToWorkspace(workspace, `/test${i}` as FolderPath);
      }
      expect(workspace.folders).toHaveLength(10);
    });
  });

  describe("パス長の境界値", () => {
    it("最小パス（ルート）", () => {
      const path = createFolderPath("/");
      expect(path).toBe("/");
    });

    it("長いパス（255文字）", () => {
      const longPath = "/" + "a".repeat(254);
      const path = createFolderPath(longPath);
      expect(path).toBe(longPath);
    });
  });

  describe("展開パスの境界値", () => {
    it("0個の展開パス", () => {
      const folder: FolderEntry = {
        id: "test" as FolderId,
        path: "/test" as FolderPath,
        displayName: "test",
        isExpanded: false,
        expandedPaths: new Set(),
        addedAt: new Date(),
      };
      expect(folder.expandedPaths.size).toBe(0);
    });

    it("多数の展開パス（100個）", () => {
      const paths = new Set(
        Array.from({ length: 100 }, (_, i) => `/test/sub${i}`),
      );
      const folder: FolderEntry = {
        id: "test" as FolderId,
        path: "/test" as FolderPath,
        displayName: "test",
        isExpanded: true,
        expandedPaths: paths,
        addedAt: new Date(),
      };
      expect(folder.expandedPaths.size).toBe(100);
    });
  });
});
