/**
 * E2Eテスト用 electronAPI モック
 *
 * Playwrightでブラウザテストを実行する際に、
 * Electron APIの代わりに使用するモック実装
 */

import type { ElectronAPI } from "../../src/preload/types";

// モック用のファイルデータ（将来の拡張用に保持）
const _mockFiles: Map<string, { name: string; size: number; path: string }> =
  new Map();

export const createMockElectronAPI = (): ElectronAPI => ({
  file: {
    getTree: async () => ({ success: true, data: { files: [], folders: [] } }),
    read: async () => ({ success: true, data: { content: "" } }),
    write: async () => ({ success: true, data: {} }),
    rename: async () => ({ success: true, data: {} }),
    watchStart: async () => ({
      success: true,
      data: { watchId: "mock-watch" },
    }),
    watchStop: async () => ({ success: true, data: {} }),
    onChanged: () => () => {},
  },

  store: {
    get: async () => ({ success: true, data: { value: null } }),
    set: async () => ({ success: true, data: {} }),
    getSecure: async () => ({ success: true, data: { value: null } }),
    setSecure: async () => ({ success: true, data: {} }),
  },

  ai: {
    chat: async () => ({ success: true, data: { response: "" } }),
    checkConnection: async () => ({
      success: true,
      data: { connected: false },
    }),
    index: async () => ({ success: true, data: {} }),
  },

  graph: {
    get: async () => ({ success: true, data: { nodes: [], edges: [] } }),
    refresh: async () => ({ success: true, data: {} }),
  },

  dashboard: {
    getStats: async () => ({
      success: true,
      data: { totalFiles: 0, totalFolders: 0, recentActivity: [] },
    }),
    getActivity: async () => ({ success: true, data: { activities: [] } }),
  },

  window: {
    getState: async () => ({
      success: true,
      data: { isMaximized: false, isFullScreen: false },
    }),
    onResized: () => () => {},
  },

  app: {
    getVersion: async () => ({
      success: true,
      data: { version: "1.0.0-test" },
    }),
    onMenuAction: () => () => {},
  },

  theme: {
    get: async () => ({ success: true, data: { theme: "dark" } }),
    set: async () => ({ success: true, data: {} }),
    getSystem: async () => ({ success: true, data: { theme: "dark" } }),
    onSystemChanged: () => () => {},
  },

  auth: {
    login: async () => ({ success: true, data: { session: null } }),
    logout: async () => ({ success: true, data: {} }),
    getSession: async () => ({ success: true, data: { session: null } }),
    refresh: async () => ({ success: true, data: { session: null } }),
    checkOnline: async () => ({ success: true, data: { online: true } }),
    onAuthStateChanged: () => () => {},
  },

  profile: {
    get: async () => ({ success: true, data: { profile: null } }),
    update: async () => ({ success: true, data: {} }),
    delete: async () => ({ success: true, data: {} }),
    getProviders: async () => ({ success: true, data: { providers: [] } }),
    linkProvider: async () => ({ success: true, data: {} }),
    unlinkProvider: async () => ({ success: true, data: {} }),
  },

  avatar: {
    upload: async () => ({ success: true, data: { url: "" } }),
    useProvider: async () => ({ success: true, data: {} }),
    remove: async () => ({ success: true, data: {} }),
  },

  apiKey: {
    save: async () => ({ success: true, data: {} }),
    delete: async () => ({ success: true, data: {} }),
    validate: async () => ({ success: true, data: { valid: false } }),
    list: async () => ({ success: true, data: { keys: [] } }),
  },

  workspace: {
    load: async () => ({ success: true, data: { folders: [] } }),
    save: async () => ({ success: true, data: {} }),
    addFolder: async () => ({
      success: true,
      data: { path: "/mock/folder", name: "folder" },
    }),
    removeFolder: async () => ({ success: true, data: {} }),
    validatePaths: async () => ({ success: true, data: { valid: true } }),
    onFolderChanged: () => () => {},
  },

  search: {
    executeFile: async () => ({
      success: true,
      data: { matches: [], totalMatches: 0 },
    }),
    executeWorkspace: async () => ({
      success: true,
      data: { files: [], totalFiles: 0 },
    }),
  },

  replace: {
    fileSingle: async () => ({ success: true, data: { replaced: true } }),
    fileAll: async () => ({ success: true, data: { replacedCount: 0 } }),
    workspaceAll: async () => ({ success: true, data: { replacedCount: 0 } }),
    undo: async () => ({ success: true, data: { undone: true } }),
    redo: async () => ({ success: true, data: { redone: true } }),
  },

  fileSelection: {
    openDialog: async (_request) => {
      // テスト用モック - 選択をシミュレート
      return {
        success: true,
        data: {
          canceled: false,
          filePaths: ["/mock/test-file.txt"],
        },
      };
    },
    getMetadata: async (request) => {
      return {
        success: true,
        data: {
          name: "test-file.txt",
          path: request.filePath,
          size: 1024,
          extension: ".txt",
          isFile: true,
          isDirectory: false,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        },
      };
    },
    getMultipleMetadata: async (request) => {
      const files = request.filePaths.map((filePath, index) => ({
        id: `file-${index}`,
        name: filePath.split("/").pop() || "unknown",
        path: filePath,
        size: 1024 * (index + 1),
        extension: ".txt",
        isFile: true,
        isDirectory: false,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      }));
      return {
        success: true,
        data: {
          files,
          errors: [],
        },
      };
    },
    validatePath: async (_request) => {
      return {
        success: true,
        data: {
          exists: true,
          isFile: true,
          isDirectory: false,
        },
      };
    },
  },

  invoke: async () => ({ success: true, data: {} }),

  dialog: {
    showOpenDialog: async () => ({
      canceled: false,
      filePaths: ["/mock/selected-file.txt"],
    }),
    showSaveDialog: async () => ({
      canceled: false,
      filePath: "/mock/saved-file.txt",
    }),
  },
});
