/**
 * WorkspaceSlice - ワークスペース状態管理スライス
 *
 * このファイルは、ワークスペースマネージャー機能のZustandスライスを提供します。
 * 設計書: docs/30-workflows/workspace-manager/task-step01-1-data-model.md (DM-WS-001)
 *
 * @module workspaceSlice
 */

import type { StateCreator } from "zustand";
import type {
  WorkspaceSlice,
  FolderId,
  FolderPath,
  FileId,
  PersistedWorkspaceState,
} from "../types/workspace";
export type { WorkspaceSlice } from "../types/workspace";
import {
  createWorkspace,
  createFolderPath,
  serializeWorkspace,
  deserializeWorkspace,
  addFolderToWorkspace,
  DuplicateFolderError,
} from "../types/workspace";

/**
 * WorkspaceSliceを作成する
 * @description Zustand StateCreator
 */
export const createWorkspaceSlice: StateCreator<
  WorkspaceSlice,
  [],
  [],
  WorkspaceSlice
> = (set, get) => ({
  // ============================================
  // Initial State
  // ============================================
  workspace: createWorkspace(),
  folderFileTrees: new Map(),
  workspaceIsLoading: false,
  workspaceError: null,

  // ============================================
  // Actions
  // ============================================

  /**
   * ワークスペースを読み込む
   * @description 永続化されたワークスペース状態を読み込み、パスの有効性を検証
   */
  loadWorkspace: async () => {
    set({ workspaceIsLoading: true, workspaceError: null });

    try {
      // 永続化されたワークスペースを読み込む
      const response = await window.electronAPI.workspace.load();

      if (!response.success) {
        set({
          workspaceError: response.error?.message ?? "Failed to load workspace",
          workspaceIsLoading: false,
        });
        return;
      }

      // データがない場合は空のワークスペースを使用
      if (!response.data) {
        set({ workspaceIsLoading: false });
        return;
      }

      const persistedState = response.data as PersistedWorkspaceState;
      const { workspace: deserializedWorkspace, warnings } =
        deserializeWorkspace(persistedState);

      // 警告があればコンソールに出力
      if (warnings.length > 0) {
        console.warn("Workspace load warnings:", warnings);
      }

      // パスの有効性を検証
      const paths = deserializedWorkspace.folders.map((f) => f.path);
      if (paths.length > 0) {
        const validateResponse =
          await window.electronAPI.workspace.validatePaths({
            paths,
          });

        if (validateResponse.success && validateResponse.data) {
          const validPathSet = new Set(validateResponse.data.validPaths);

          // 無効なパスを除外
          const validFolders = deserializedWorkspace.folders.filter((f) =>
            validPathSet.has(f.path),
          );

          deserializedWorkspace.folders = validFolders;
        }
      }

      // 各フォルダのファイルツリーを読み込む
      const newFileTrees = new Map<
        FolderId,
        typeof get extends () => infer R
          ? R extends { folderFileTrees: Map<FolderId, infer T> }
            ? T
            : never
          : never
      >();

      for (const folder of deserializedWorkspace.folders) {
        try {
          const treeResponse = await window.electronAPI.file.getTree({
            rootPath: folder.path,
          });
          if (treeResponse.success && treeResponse.data) {
            newFileTrees.set(folder.id, treeResponse.data);
          }
        } catch (err) {
          console.error(`Failed to load file tree for ${folder.path}:`, err);
        }
      }

      set({
        workspace: deserializedWorkspace,
        folderFileTrees: newFileTrees,
        workspaceIsLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      set({
        workspaceError: message,
        workspaceIsLoading: false,
      });
    }
  },

  /**
   * ワークスペースを保存する
   * @description 現在のワークスペース状態を永続化
   */
  saveWorkspace: async () => {
    const { workspace } = get();
    const serialized = serializeWorkspace(workspace);

    try {
      await window.electronAPI.workspace.save({ state: serialized });
    } catch (err) {
      console.error("Failed to save workspace:", err);
    }
  },

  /**
   * フォルダを追加する
   * @description ダイアログを表示してフォルダを選択し、ワークスペースに追加
   */
  addFolder: async () => {
    try {
      // ダイアログを表示してフォルダを選択
      const response = await window.electronAPI.workspace.addFolder();

      if (!response.success) {
        // キャンセルまたはエラー
        if (response.error?.code !== "CANCELED") {
          set({
            workspaceError: response.error?.message ?? "Failed to add folder",
          });
        }
        return;
      }

      if (!response.data) {
        return;
      }

      const { path: folderPathStr, displayName } = response.data;
      const folderPath = createFolderPath(folderPathStr) as FolderPath;

      // 重複チェック
      const { workspace } = get();
      if (workspace.folders.some((f) => f.path === folderPath)) {
        // 重複している場合は静かにスキップ
        return;
      }

      // ワークスペースにフォルダを追加
      const newWorkspace = addFolderToWorkspace(workspace, folderPath);

      // 追加したフォルダのファイルツリーを読み込む
      const addedFolder = newWorkspace.folders.find(
        (f) => f.path === folderPath,
      );
      if (!addedFolder) {
        return;
      }

      const treeResponse = await window.electronAPI.file.getTree({
        rootPath: folderPath,
      });

      const { folderFileTrees } = get();
      const newFileTrees = new Map(folderFileTrees);
      if (treeResponse.success && treeResponse.data) {
        newFileTrees.set(addedFolder.id, treeResponse.data);
      }

      // displayNameを反映（ダイアログから返される表示名を使用）
      if (addedFolder.displayName !== displayName) {
        Object.assign(addedFolder, { displayName });
      }

      set({
        workspace: newWorkspace,
        folderFileTrees: newFileTrees,
      });

      // ワークスペースを永続化
      await get().saveWorkspace();
    } catch (err) {
      if (err instanceof DuplicateFolderError) {
        // 重複エラーは静かにスキップ
        return;
      }
      const message = err instanceof Error ? err.message : "Unknown error";
      set({ workspaceError: message });
    }
  },

  /**
   * フォルダを削除する
   * @param folderId 削除するフォルダのID
   */
  removeFolder: (folderId: FolderId) => {
    const { workspace, folderFileTrees } = get();

    // フォルダを探す
    const folderExists = workspace.folders.some((f) => f.id === folderId);
    if (!folderExists) {
      // 存在しないフォルダIDの場合は何もしない
      return;
    }

    // ワークスペースからフォルダを削除
    const newFolders = workspace.folders.filter((f) => f.id !== folderId);
    const newWorkspace = {
      ...workspace,
      folders: newFolders,
      updatedAt: new Date(),
    };

    // ファイルツリーを削除
    const newFileTrees = new Map(folderFileTrees);
    newFileTrees.delete(folderId);

    set({
      workspace: newWorkspace,
      folderFileTrees: newFileTrees,
    });

    // ワークスペースを永続化
    get().saveWorkspace();
  },

  /**
   * フォルダの展開/折りたたみを切り替える
   * @param folderId フォルダのID
   */
  toggleFolderExpansion: (folderId: FolderId) => {
    const { workspace } = get();

    const newFolders = workspace.folders.map((f) =>
      f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f,
    );

    const newWorkspace = {
      ...workspace,
      folders: newFolders,
      updatedAt: new Date(),
    };

    set({ workspace: newWorkspace });

    // ワークスペースを永続化
    get().saveWorkspace();
  },

  /**
   * サブフォルダの展開/折りたたみを切り替える
   * @param folderId 親フォルダのID
   * @param subfolderPath サブフォルダのパス
   */
  toggleSubfolder: (folderId: FolderId, subfolderPath: string) => {
    const { workspace } = get();

    const newFolders = workspace.folders.map((f) => {
      if (f.id !== folderId) {
        return f;
      }

      const newExpandedPaths = new Set(f.expandedPaths);
      if (newExpandedPaths.has(subfolderPath)) {
        newExpandedPaths.delete(subfolderPath);
      } else {
        newExpandedPaths.add(subfolderPath);
      }

      return { ...f, expandedPaths: newExpandedPaths };
    });

    const newWorkspace = {
      ...workspace,
      folders: newFolders,
      updatedAt: new Date(),
    };

    set({ workspace: newWorkspace });

    // ワークスペースを永続化
    get().saveWorkspace();
  },

  /**
   * 選択されたファイルを設定する
   * @param fileId ファイルID（nullで選択解除）
   */
  setWorkspaceSelectedFile: (fileId: FileId | null) => {
    const { workspace } = get();

    const newWorkspace = {
      ...workspace,
      lastSelectedFileId: fileId,
      updatedAt: new Date(),
    };

    set({ workspace: newWorkspace });

    // ワークスペースを永続化
    get().saveWorkspace();
  },

  /**
   * フォルダのファイルツリーを読み込む
   * @param folderId フォルダID
   * @param folderPath フォルダパス
   */
  loadFolderTree: async (folderId: FolderId, folderPath: FolderPath) => {
    try {
      const response = await window.electronAPI.file.getTree({
        rootPath: folderPath,
      });

      if (!response.success || !response.data) {
        return;
      }

      const { folderFileTrees } = get();
      const newFileTrees = new Map(folderFileTrees);
      newFileTrees.set(folderId, response.data);

      set({ folderFileTrees: newFileTrees });
    } catch (err) {
      console.error(`Failed to load file tree for ${folderPath}:`, err);
    }
  },
});
