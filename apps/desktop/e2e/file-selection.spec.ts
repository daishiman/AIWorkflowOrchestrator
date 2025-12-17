/**
 * ファイル選択機能 E2E テスト
 *
 * FileSelectorコンポーネントのE2Eテスト
 * - ファイル選択ダイアログの動作
 * - ドラッグ&ドロップ
 * - ファイルフィルター
 * - 選択ファイルの管理
 */

import { test, expect, Page } from "@playwright/test";

// electronAPIのモックを注入
const injectElectronAPIMock = async (page: Page) => {
  await page.addInitScript(() => {
    // @ts-expect-error - グローバル変数としてモックを注入
    window.electronAPI = {
      file: {
        getTree: async () => ({
          success: true,
          data: { files: [], folders: [] },
        }),
        read: async () => ({ success: true, data: { content: "" } }),
        write: async () => ({ success: true, data: {} }),
        rename: async () => ({ success: true, data: {} }),
        watchStart: async () => ({ success: true, data: { watchId: "mock" } }),
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
        getVersion: async () => ({ success: true, data: { version: "1.0.0" } }),
        onMenuAction: () => () => {},
      },
      theme: {
        get: async () => ({ success: true, data: { theme: "dark" } }),
        set: async () => ({ success: true, data: {} }),
        getSystem: async () => ({ success: true, data: { theme: "dark" } }),
        onSystemChanged: () => () => {},
      },
      auth: {
        login: async () => ({
          success: true,
          data: {
            session: {
              user: { id: "test-user", email: "test@example.com" },
              access_token: "mock-token",
              expires_at: Date.now() + 3600000,
            },
          },
        }),
        logout: async () => ({ success: true, data: {} }),
        getSession: async () => ({
          success: true,
          data: {
            session: {
              user: { id: "test-user", email: "test@example.com" },
              access_token: "mock-token",
              expires_at: Date.now() + 3600000,
            },
          },
        }),
        refresh: async () => ({
          success: true,
          data: {
            session: {
              user: { id: "test-user", email: "test@example.com" },
              access_token: "mock-token",
              expires_at: Date.now() + 3600000,
            },
          },
        }),
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
          data: { path: "/mock", name: "mock" },
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
        workspaceAll: async () => ({
          success: true,
          data: { replacedCount: 0 },
        }),
        undo: async () => ({ success: true, data: { undone: true } }),
        redo: async () => ({ success: true, data: { redone: true } }),
      },
      fileSelection: {
        openDialog: async () => ({
          success: true,
          data: {
            canceled: false,
            filePaths: ["/mock/test-file.txt", "/mock/another-file.pdf"],
          },
        }),
        getMetadata: async () => ({
          success: true,
          data: {
            name: "test-file.txt",
            path: "/mock/test-file.txt",
            size: 1024,
            extension: ".txt",
            isFile: true,
            isDirectory: false,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
          },
        }),
        getMultipleMetadata: async () => ({
          success: true,
          data: {
            files: [
              {
                id: "file-1",
                name: "test-file.txt",
                path: "/mock/test-file.txt",
                size: 1024,
                extension: ".txt",
              },
              {
                id: "file-2",
                name: "another-file.pdf",
                path: "/mock/another-file.pdf",
                size: 2048,
                extension: ".pdf",
              },
            ],
            errors: [],
          },
        }),
        validatePath: async () => ({
          success: true,
          data: { exists: true, isFile: true, isDirectory: false },
        }),
      },
      invoke: async () => ({ success: true, data: {} }),
      dialog: {
        showOpenDialog: async () => ({
          canceled: false,
          filePaths: ["/mock/file.txt"],
        }),
        showSaveDialog: async () => ({
          canceled: false,
          filePath: "/mock/file.txt",
        }),
      },
    };
  });
};

test.describe("ファイル選択機能 E2E テスト", () => {
  test.beforeEach(async ({ page }) => {
    // electronAPIモックを注入
    await injectElectronAPIMock(page);

    // アプリケーションに移動
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test.describe("EditorView FileSelector統合", () => {
    // 各テストでEditorViewに移動するヘルパー
    const navigateToEditor = async (page: Page) => {
      // EditorボタンをクリックしてEditorViewに移動
      // aria-label="Editor"またはテキスト"Editor"を含むボタン
      const editorButton = page.getByRole("button", { name: "Editor" });
      await editorButton.click();

      // EditorViewが表示されるまで待機
      await page.waitForSelector('[data-testid="editor-view"]', {
        timeout: 10000,
      });
    };

    test("FileSelectorTriggerボタンがツールバーに表示される", async ({
      page,
    }) => {
      await navigateToEditor(page);

      // FileSelectorTriggerボタンが表示されていることを確認
      const triggerButton = page.locator(
        '[data-testid="file-selector-trigger"]',
      );
      await expect(triggerButton).toBeVisible();
    });

    test("トリガーボタンクリックでモーダルが開く", async ({ page }) => {
      await navigateToEditor(page);

      // トリガーボタンをクリック
      const triggerButton = page.locator(
        '[data-testid="file-selector-trigger"]',
      );
      await triggerButton.click();

      // モーダルが表示されることを確認
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
    });

    test("モーダルをEscapeキーで閉じることができる", async ({ page }) => {
      await navigateToEditor(page);

      // モーダルを開く
      const triggerButton = page.locator(
        '[data-testid="file-selector-trigger"]',
      );
      await triggerButton.click();

      // モーダルが表示されていることを確認
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Escapeキーで閉じる
      await page.keyboard.press("Escape");

      // モーダルが非表示になることを確認
      await expect(modal).not.toBeVisible();
    });

    test("キャンセルボタンでモーダルを閉じることができる", async ({ page }) => {
      await navigateToEditor(page);

      // モーダルを開く
      await page.locator('[data-testid="file-selector-trigger"]').click();

      // モーダルが表示されていることを確認
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // キャンセルボタンをクリック
      await page.locator('button:has-text("キャンセル")').click();

      // モーダルが非表示になることを確認
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe("FileSelector コンポーネント", () => {
    test("アプリケーションが正常に読み込まれる", async ({ page }) => {
      await expect(page).toHaveTitle(
        /AI Workflow Orchestrator|Knowledge Studio/,
      );
    });
  });

  test.describe("モック検証", () => {
    test("electronAPIモックが正しく注入されている", async ({ page }) => {
      const hasElectronAPI = await page.evaluate(() => {
        return typeof window.electronAPI !== "undefined";
      });
      expect(hasElectronAPI).toBe(true);
    });

    test("fileSelection APIが利用可能", async ({ page }) => {
      const hasFileSelection = await page.evaluate(() => {
        return typeof window.electronAPI?.fileSelection !== "undefined";
      });
      expect(hasFileSelection).toBe(true);
    });

    test("openDialogが正しいレスポンスを返す", async ({ page }) => {
      const result = await page.evaluate(async () => {
        return await window.electronAPI?.fileSelection?.openDialog({
          filterCategory: "all",
          multiSelections: true,
        });
      });

      expect(result).toHaveProperty("success", true);
      expect(result?.data).toHaveProperty("canceled", false);
      expect(result?.data?.filePaths).toContain("/mock/test-file.txt");
    });

    test("getMultipleMetadataが正しいレスポンスを返す", async ({ page }) => {
      const result = await page.evaluate(async () => {
        return await window.electronAPI?.fileSelection?.getMultipleMetadata({
          filePaths: ["/mock/test.txt"],
        });
      });

      expect(result).toHaveProperty("success", true);
      expect(result?.data?.files).toHaveLength(2);
      expect(result?.data?.files[0]).toHaveProperty("name", "test-file.txt");
    });

    test("validatePathが正しいレスポンスを返す", async ({ page }) => {
      const result = await page.evaluate(async () => {
        return await window.electronAPI?.fileSelection?.validatePath({
          filePath: "/mock/test.txt",
        });
      });

      expect(result).toHaveProperty("success", true);
      expect(result?.data).toHaveProperty("exists", true);
      expect(result?.data).toHaveProperty("isFile", true);
    });
  });
});

// TypeScript用の型拡張
declare global {
  interface Window {
    electronAPI?: {
      fileSelection?: {
        openDialog: (req: unknown) => Promise<unknown>;
        getMetadata: (req: unknown) => Promise<unknown>;
        getMultipleMetadata: (req: unknown) => Promise<unknown>;
        validatePath: (req: unknown) => Promise<unknown>;
      };
      [key: string]: unknown;
    };
  }
}
