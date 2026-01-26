/**
 * Permission Store Handlers Unit Tests
 *
 * TASK-3-1-E: rememberChoice機能永続化
 * Phase 5: 実装完了（TDD: Green）
 *
 * 権限設定用IPCハンドラーのテスト
 * PermissionStoreを使用した永続化権限の管理機能のテスト。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IpcMainInvokeEvent } from "electron";
import type { IPermissionStore, AllowedToolEntry } from "@repo/shared";

// ipcMain モック - vi.hoisted を使用してホイスティング問題を解決
const { mockIpcMainHandle, mockIpcMainRemoveHandler } = vi.hoisted(() => ({
  mockIpcMainHandle: vi.fn(),
  mockIpcMainRemoveHandler: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: mockIpcMainRemoveHandler,
  },
}));

// PermissionStore モック
const mockPermissionStore: IPermissionStore = {
  isToolAllowed: vi.fn(),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn(),
  getAllowedToolEntries: vi.fn(),
  clearAll: vi.fn(),
};

import { registerPermissionStoreHandlers } from "../permission-store-handlers";

describe("Permission Store IPC Handlers", () => {
  let handlers: Map<
    string,
    (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown
  >;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    // ipcMain.handle の呼び出しをキャプチャ
    mockIpcMainHandle.mockImplementation(
      (
        channel: string,
        handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown,
      ) => {
        handlers.set(channel, handler);
      },
    );

    // デフォルトのモック設定
    (
      mockPermissionStore.getAllowedTools as ReturnType<typeof vi.fn>
    ).mockReturnValue([]);
    (
      mockPermissionStore.getAllowedToolEntries as ReturnType<typeof vi.fn>
    ).mockReturnValue([]);
    (
      mockPermissionStore.isToolAllowed as ReturnType<typeof vi.fn>
    ).mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // ハンドラー登録テスト
  // =================================================================

  describe("registerPermissionStoreHandlers", () => {
    it("permission:getAllowedTools ハンドラーを登録する", () => {
      registerPermissionStoreHandlers(mockPermissionStore);

      expect(mockIpcMainHandle).toHaveBeenCalledWith(
        "permission:getAllowedTools",
        expect.any(Function),
      );
    });

    it("permission:revokeTool ハンドラーを登録する", () => {
      registerPermissionStoreHandlers(mockPermissionStore);

      expect(mockIpcMainHandle).toHaveBeenCalledWith(
        "permission:revokeTool",
        expect.any(Function),
      );
    });

    it("permission:clearAll ハンドラーを登録する", () => {
      registerPermissionStoreHandlers(mockPermissionStore);

      expect(mockIpcMainHandle).toHaveBeenCalledWith(
        "permission:clearAll",
        expect.any(Function),
      );
    });

    it("3つのハンドラーが登録される", () => {
      registerPermissionStoreHandlers(mockPermissionStore);

      expect(mockIpcMainHandle).toHaveBeenCalledTimes(3);
    });
  });

  // =================================================================
  // permission:getAllowedTools テスト
  // =================================================================

  describe("permission:getAllowedTools", () => {
    it("許可済みツール一覧を返す", async () => {
      const mockEntries: AllowedToolEntry[] = [
        { toolName: "Read", allowedAt: "2026-01-25T12:00:00.000Z" },
        { toolName: "Write", allowedAt: "2026-01-25T12:05:00.000Z" },
      ];
      (
        mockPermissionStore.getAllowedToolEntries as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockEntries);

      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:getAllowedTools");
      const result = await handler!({} as IpcMainInvokeEvent);

      expect(result).toEqual({ tools: mockEntries });
      expect(mockPermissionStore.getAllowedToolEntries).toHaveBeenCalled();
    });

    it("空の許可リストを返す", async () => {
      (
        mockPermissionStore.getAllowedToolEntries as ReturnType<typeof vi.fn>
      ).mockReturnValue([]);

      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:getAllowedTools");
      const result = await handler!({} as IpcMainInvokeEvent);

      expect(result).toEqual({ tools: [] });
    });

    it("PermissionStore エラー時に空配列を返す", async () => {
      (
        mockPermissionStore.getAllowedToolEntries as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw new Error("Store error");
      });

      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:getAllowedTools");
      const result = await handler!({} as IpcMainInvokeEvent);

      expect(result).toEqual({ tools: [] });
    });
  });

  // =================================================================
  // permission:revokeTool テスト
  // =================================================================

  describe("permission:revokeTool", () => {
    it("ツールの許可を取り消す", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: "Read",
      });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith("Read");
      expect(result).toEqual({ success: true });
    });

    it("存在しないツールでも成功を返す", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: "NonExistent",
      });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith(
        "NonExistent",
      );
      expect(result).toEqual({ success: true });
    });

    it("空のツール名でも処理を実行する", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, { toolName: "" });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith("");
      expect(result).toEqual({ success: true });
    });

    it("PermissionStore エラー時に success: false を返す", async () => {
      (
        mockPermissionStore.revokeTool as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw new Error("Store error");
      });

      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: "Read",
      });

      expect(result).toEqual({ success: false });
    });

    it("不正なリクエスト形式を処理する", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");

      // 不正なリクエスト（toolName がない）
      const result = await handler!({} as IpcMainInvokeEvent, {});

      expect(result).toBeDefined();
    });
  });

  // =================================================================
  // permission:clearAll テスト
  // =================================================================

  describe("permission:clearAll", () => {
    it("全ての許可設定をクリアする", async () => {
      (
        mockPermissionStore.getAllowedTools as ReturnType<typeof vi.fn>
      ).mockReturnValue(["Read", "Write", "Glob"]);

      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:clearAll");
      const result = await handler!({} as IpcMainInvokeEvent);

      expect(mockPermissionStore.clearAll).toHaveBeenCalled();
      expect(result).toEqual({ success: true, clearedCount: 3 });
    });

    it("空の状態でクリアしても成功を返す", async () => {
      (
        mockPermissionStore.getAllowedTools as ReturnType<typeof vi.fn>
      ).mockReturnValue([]);

      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:clearAll");
      const result = await handler!({} as IpcMainInvokeEvent);

      expect(mockPermissionStore.clearAll).toHaveBeenCalled();
      expect(result).toEqual({ success: true, clearedCount: 0 });
    });

    it("PermissionStore エラー時に success: false を返す", async () => {
      (
        mockPermissionStore.clearAll as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw new Error("Store error");
      });

      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:clearAll");
      const result = await handler!({} as IpcMainInvokeEvent);

      expect(result).toEqual({ success: false, clearedCount: 0 });
    });
  });

  // =================================================================
  // セキュリティテスト
  // =================================================================

  describe("セキュリティ", () => {
    it("引数のサニタイズ（SQLインジェクション的な文字列）", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      await handler!({} as IpcMainInvokeEvent, {
        toolName: "'; DROP TABLE tools; --",
      });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith(
        "'; DROP TABLE tools; --",
      );
    });

    it("XSS的な文字列を含むツール名", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      await handler!({} as IpcMainInvokeEvent, {
        toolName: "<script>alert('xss')</script>",
      });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith(
        "<script>alert('xss')</script>",
      );
    });

    it("非常に長いツール名", async () => {
      const longToolName = "A".repeat(10000);

      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: longToolName,
      });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith(longToolName);
      expect(result).toBeDefined();
    });
  });
});

/**
 * Phase 6: エッジケーステスト
 */
describe("Permission Store IPC Handlers - Edge Cases", () => {
  let handlers: Map<
    string,
    (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown
  >;

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = new Map();

    mockIpcMainHandle.mockImplementation(
      (
        channel: string,
        handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown,
      ) => {
        handlers.set(channel, handler);
      },
    );

    // Reset all mocks to default implementations
    (
      mockPermissionStore.getAllowedTools as ReturnType<typeof vi.fn>
    ).mockReturnValue([]);
    (
      mockPermissionStore.getAllowedToolEntries as ReturnType<typeof vi.fn>
    ).mockReturnValue([]);
    (
      mockPermissionStore.isToolAllowed as ReturnType<typeof vi.fn>
    ).mockReturnValue(false);
    (
      mockPermissionStore.revokeTool as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {});
    (
      mockPermissionStore.allowTool as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {});
    (
      mockPermissionStore.clearAll as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {});
  });

  describe("並行リクエスト", () => {
    it("同時に複数の revokeTool リクエストを処理できる", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");

      const promises = [
        handler!({} as IpcMainInvokeEvent, { toolName: "Read" }),
        handler!({} as IpcMainInvokeEvent, { toolName: "Write" }),
        handler!({} as IpcMainInvokeEvent, { toolName: "Glob" }),
      ];

      const results = (await Promise.all(promises)) as Array<{
        success: boolean;
      }>;

      expect(results.every((r) => r.success)).toBe(true);
      expect(mockPermissionStore.revokeTool).toHaveBeenCalledTimes(3);
    });
  });

  describe("型変換", () => {
    it("toolName が数値の場合", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: 123,
      });

      expect(result).toBeDefined();
    });

    it("toolName が null の場合", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: null,
      });

      expect(result).toBeDefined();
    });

    it("toolName が undefined の場合", async () => {
      registerPermissionStoreHandlers(mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: undefined,
      });

      expect(result).toBeDefined();
    });
  });
});
