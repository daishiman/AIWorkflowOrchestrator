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
import type { IpcMainInvokeEvent, BrowserWindow } from "electron";
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

// validateIpcSender / withValidation モック
const { mockValidateIpcSender, mockToIPCValidationError } = vi.hoisted(() => ({
  mockValidateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  mockToIPCValidationError: vi.fn().mockReturnValue({
    success: false,
    error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
  }),
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
  withValidation: (
    channel: string,
    handler: (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown,
    options: { getAllowedWindows: () => unknown[] },
  ) => {
    return async (event: IpcMainInvokeEvent, ...args: unknown[]) => {
      const validation = mockValidateIpcSender(event, channel, options);
      if (!validation.valid) {
        return mockToIPCValidationError(validation);
      }
      return handler(event, ...args);
    };
  },
}));

// mockMainWindow
const mockMainWindow = {
  id: 1,
  webContents: { id: 1 },
} as unknown as BrowserWindow;

function createMockEvent(senderId = 1): IpcMainInvokeEvent {
  return {
    sender: { id: senderId },
    senderFrame: null,
  } as unknown as IpcMainInvokeEvent;
}

// PermissionStore モック
const mockPermissionStore: IPermissionStore = {
  isToolAllowed: vi.fn(),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn(),
  getAllowedToolEntries: vi.fn(),
  clearAll: vi.fn(),
};

import {
  registerPermissionStoreHandlers,
  unregisterPermissionStoreHandlers,
} from "../permission-store-handlers";

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
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);

      expect(mockIpcMainHandle).toHaveBeenCalledWith(
        "permission:getAllowedTools",
        expect.any(Function),
      );
    });

    it("permission:revokeTool ハンドラーを登録する", () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);

      expect(mockIpcMainHandle).toHaveBeenCalledWith(
        "permission:revokeTool",
        expect.any(Function),
      );
    });

    it("permission:clearAll ハンドラーを登録する", () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);

      expect(mockIpcMainHandle).toHaveBeenCalledWith(
        "permission:clearAll",
        expect.any(Function),
      );
    });

    it("4つのハンドラーが登録される（V2: clear-session 含む）", () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);

      expect(mockIpcMainHandle).toHaveBeenCalledTimes(4);
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

      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:getAllowedTools");
      const result = await handler!({} as IpcMainInvokeEvent);

      expect(result).toEqual({ tools: mockEntries });
      expect(mockPermissionStore.getAllowedToolEntries).toHaveBeenCalled();
    });

    it("空の許可リストを返す", async () => {
      (
        mockPermissionStore.getAllowedToolEntries as ReturnType<typeof vi.fn>
      ).mockReturnValue([]);

      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
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

      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
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
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: "Read",
      });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith("Read");
      expect(result).toEqual({ success: true });
    });

    it("存在しないツールでも成功を返す", async () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: "NonExistent",
      });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith(
        "NonExistent",
      );
      expect(result).toEqual({ success: true });
    });

    it("空のツール名はバリデーションエラーで { success: false } を返す", async () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, { toolName: "" });

      expect(mockPermissionStore.revokeTool).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });

    it("スペースのみのツール名はバリデーションエラーで { success: false } を返す（P42準拠）", async () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: "   ",
      });

      expect(mockPermissionStore.revokeTool).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });

    it("PermissionStore エラー時に success: false を返す", async () => {
      (
        mockPermissionStore.revokeTool as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        throw new Error("Store error");
      });

      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: "Read",
      });

      expect(result).toEqual({ success: false });
    });

    it("不正なリクエスト形式（toolName なし）は { success: false } を返す", async () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");

      // 不正なリクエスト（toolName がない）
      const result = await handler!({} as IpcMainInvokeEvent, {});

      expect(mockPermissionStore.revokeTool).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false });
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

      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:clearAll");
      const result = await handler!({} as IpcMainInvokeEvent);

      expect(mockPermissionStore.clearAll).toHaveBeenCalled();
      expect(result).toEqual({ success: true, clearedCount: 3 });
    });

    it("空の状態でクリアしても成功を返す", async () => {
      (
        mockPermissionStore.getAllowedTools as ReturnType<typeof vi.fn>
      ).mockReturnValue([]);

      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
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

      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
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
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      await handler!({} as IpcMainInvokeEvent, {
        toolName: "'; DROP TABLE tools; --",
      });

      expect(mockPermissionStore.revokeTool).toHaveBeenCalledWith(
        "'; DROP TABLE tools; --",
      );
    });

    it("XSS的な文字列を含むツール名", async () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
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

      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
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
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
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
    it("toolName が数値の場合は { success: false } を返す", async () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: 123,
      });

      expect(mockPermissionStore.revokeTool).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });

    it("toolName が null の場合は { success: false } を返す", async () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: null,
      });

      expect(mockPermissionStore.revokeTool).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });

    it("toolName が undefined の場合は { success: false } を返す", async () => {
      registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
      const handler = handlers.get("permission:revokeTool");
      const result = await handler!({} as IpcMainInvokeEvent, {
        toolName: undefined,
      });

      expect(mockPermissionStore.revokeTool).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false });
    });
  });
});

// =================================================================
// V2: permission:clear-session テスト (UT-06-002)
// =================================================================

describe("Permission Store IPC Handlers V2 - permission:clear-session", () => {
  let handlers: Map<
    string,
    (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown
  >;

  const mockPermissionStoreV2: IPermissionStore & {
    revokeSessionEntries: ReturnType<typeof vi.fn>;
  } = {
    isToolAllowed: vi.fn(),
    allowTool: vi.fn(),
    revokeTool: vi.fn(),
    getAllowedTools: vi.fn().mockReturnValue([]),
    getAllowedToolEntries: vi.fn().mockReturnValue([]),
    clearAll: vi.fn(),
    revokeSessionEntries: vi.fn().mockReturnValue(0),
  };

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

    mockPermissionStoreV2.revokeSessionEntries.mockReturnValue(0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // TC-IPC-01: 正常系 — session エントリのクリア
  it("有効な sessionId でセッションエントリをクリアする", async () => {
    mockPermissionStoreV2.revokeSessionEntries.mockReturnValue(3);
    registerPermissionStoreHandlers(mockMainWindow, mockPermissionStoreV2);
    const handler = handlers.get("permission:clear-session");

    expect(handler).toBeDefined();
    const result = (await handler!({} as IpcMainInvokeEvent, {
      sessionId: "test-session-123",
    })) as { success: boolean; removedCount: number };

    expect(result.success).toBe(true);
    expect(result.removedCount).toBe(3);
    expect(mockPermissionStoreV2.revokeSessionEntries).toHaveBeenCalledWith(
      "test-session-123",
    );
  });

  // TC-IPC-02: P42準拠 — sessionId が空文字列
  it("空文字列の sessionId でバリデーションエラーを返す", async () => {
    registerPermissionStoreHandlers(mockMainWindow, mockPermissionStoreV2);
    const handler = handlers.get("permission:clear-session");

    const result = (await handler!({} as IpcMainInvokeEvent, {
      sessionId: "",
    })) as { success: boolean; error: { code: string } };

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  // TC-IPC-03: P42準拠 — sessionId がスペースのみ
  it("スペースのみの sessionId でバリデーションエラーを返す", async () => {
    registerPermissionStoreHandlers(mockMainWindow, mockPermissionStoreV2);
    const handler = handlers.get("permission:clear-session");

    const result = (await handler!({} as IpcMainInvokeEvent, {
      sessionId: "   ",
    })) as { success: boolean; error: { code: string } };

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("VALIDATION_ERROR");
  });

  // TC-IPC-04: P42準拠 — sessionId が undefined / missing
  it("sessionId が未定義でバリデーションエラーを返す", async () => {
    registerPermissionStoreHandlers(mockMainWindow, mockPermissionStoreV2);
    const handler = handlers.get("permission:clear-session");

    const result = (await handler!({} as IpcMainInvokeEvent, {})) as {
      success: boolean;
      error: { code: string };
    };

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("VALIDATION_ERROR");
  });
});

// =================================================================
// sender 検証テスト (UT-06-002-UT-1)
// =================================================================

describe("Permission Store IPC Handlers - sender 検証 (UT-06-002-UT-1)", () => {
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

    (
      mockPermissionStore.getAllowedTools as ReturnType<typeof vi.fn>
    ).mockReturnValue([]);
    (
      mockPermissionStore.getAllowedToolEntries as ReturnType<typeof vi.fn>
    ).mockReturnValue([]);
    (
      mockPermissionStore.revokeTool as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {});
    (
      mockPermissionStore.clearAll as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {});

    mockValidateIpcSender.mockReturnValue({ valid: true });
    registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // SEC-01: 正常 sender から permission:getAllowedTools
  it("SEC-01: 正常 sender から permission:getAllowedTools を呼ぶと正常応答", async () => {
    const handler = handlers.get("permission:getAllowedTools");
    const result = await handler!(createMockEvent());

    expect(result).toHaveProperty("tools");
  });

  // SEC-02: 正常 sender から permission:revokeTool
  it("SEC-02: 正常 sender から permission:revokeTool を呼ぶと正常応答", async () => {
    const handler = handlers.get("permission:revokeTool");
    const result = (await handler!(createMockEvent(), {
      toolName: "Read",
    })) as { success: boolean };

    expect(result.success).toBe(true);
  });

  // SEC-03: 正常 sender から permission:clearAll
  it("SEC-03: 正常 sender から permission:clearAll を呼ぶと正常応答", async () => {
    const handler = handlers.get("permission:clearAll");
    const result = (await handler!(createMockEvent())) as {
      success: boolean;
    };

    expect(result.success).toBe(true);
  });

  // SEC-04: 正常 sender から permission:clear-session
  it("SEC-04: 正常 sender から permission:clear-session を呼ぶと正常応答", async () => {
    // clear-session は mockPermissionStore に revokeSessionEntries がないため
    // removedCount: 0 が返る（正常系）
    const handler = handlers.get("permission:clear-session");
    const result = (await handler!(createMockEvent(), {
      sessionId: "test-session",
    })) as { success: boolean };

    expect(result.success).toBe(true);
  });

  // SEC-05: 不正 sender から permission:getAllowedTools
  it("SEC-05: 不正 sender から permission:getAllowedTools を呼ぶとエラー応答を返す", async () => {
    mockValidateIpcSender.mockReturnValue({
      valid: false,
      reason: "UNKNOWN_SENDER",
    });
    const handler = handlers.get("permission:getAllowedTools");
    const result = await handler!(createMockEvent(999));

    expect(result).toEqual({
      success: false,
      error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
    });
    expect(mockPermissionStore.getAllowedToolEntries).not.toHaveBeenCalled();
  });

  // SEC-06: 不正 sender から permission:revokeTool
  it("SEC-06: 不正 sender から permission:revokeTool を呼ぶとエラー応答を返す", async () => {
    mockValidateIpcSender.mockReturnValue({
      valid: false,
      reason: "UNKNOWN_SENDER",
    });
    const handler = handlers.get("permission:revokeTool");
    const result = await handler!(createMockEvent(999), { toolName: "Read" });

    expect(result).toEqual({
      success: false,
      error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
    });
    expect(mockPermissionStore.revokeTool).not.toHaveBeenCalled();
  });

  // SEC-07: 不正 sender から permission:clearAll
  it("SEC-07: 不正 sender から permission:clearAll を呼ぶとエラー応答を返す", async () => {
    mockValidateIpcSender.mockReturnValue({
      valid: false,
      reason: "UNKNOWN_SENDER",
    });
    const handler = handlers.get("permission:clearAll");
    const result = await handler!(createMockEvent(999));

    expect(result).toEqual({
      success: false,
      error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
    });
    expect(mockPermissionStore.getAllowedTools).not.toHaveBeenCalled();
    expect(mockPermissionStore.clearAll).not.toHaveBeenCalled();
  });

  // SEC-08: 不正 sender から permission:clear-session
  it("SEC-08: 不正 sender から permission:clear-session を呼ぶとエラー応答を返す", async () => {
    mockValidateIpcSender.mockReturnValue({
      valid: false,
      reason: "UNKNOWN_SENDER",
    });
    const handler = handlers.get("permission:clear-session");
    const result = await handler!(createMockEvent(999), {
      sessionId: "test-session",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
    });
  });

  // SEC-09: 全4ハンドラで validateIpcSender が呼ばれること
  it("SEC-09: 全4ハンドラで validateIpcSender が呼ばれる", async () => {
    const channels = [
      "permission:getAllowedTools",
      "permission:revokeTool",
      "permission:clearAll",
      "permission:clear-session",
    ];
    for (const ch of channels) {
      const handler = handlers.get(ch);
      await handler!(createMockEvent(), {
        toolName: "test",
        sessionId: "s1",
      });
    }
    expect(mockValidateIpcSender).toHaveBeenCalledTimes(4);

    // P45対策: 各ハンドラが正しいチャンネル名を validateIpcSender に渡しているか検証
    const calledChannels = mockValidateIpcSender.mock.calls.map(
      (call: unknown[]) => call[1],
    );
    expect(calledChannels).toEqual([
      "permission:getAllowedTools",
      "permission:revokeTool",
      "permission:clearAll",
      "permission:clear-session",
    ]);
  });

  // SEC-10: getAllowedWindows コールバック検証（P41対策）
  it("SEC-10: getAllowedWindows コールバックが [mainWindow] を返す", async () => {
    const handler = handlers.get("permission:getAllowedTools");
    await handler!(createMockEvent());
    const options = mockValidateIpcSender.mock.calls[0][2];
    expect(options.getAllowedWindows()).toEqual([mockMainWindow]);
  });
});

// =================================================================
// sender 検証 - エッジケース (Phase 6)
// =================================================================

describe("Permission Store IPC Handlers - sender 検証エッジケース", () => {
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

    (
      mockPermissionStore.getAllowedTools as ReturnType<typeof vi.fn>
    ).mockReturnValue([]);
    (
      mockPermissionStore.getAllowedToolEntries as ReturnType<typeof vi.fn>
    ).mockReturnValue([]);
    (
      mockPermissionStore.revokeTool as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {});
    (
      mockPermissionStore.clearAll as ReturnType<typeof vi.fn>
    ).mockImplementation(() => {});

    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockReturnValue({
      success: false,
      error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
    });
    registerPermissionStoreHandlers(mockMainWindow, mockPermissionStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // SEC-11: IPC_FORBIDDEN（DevTools 経由等の不正アクセス）
  it("SEC-11: validateIpcSender が IPC_FORBIDDEN を返すとエラー応答を返す", async () => {
    const forbiddenError = {
      success: false,
      error: { code: "IPC_FORBIDDEN", message: "Forbidden" },
    };
    mockValidateIpcSender.mockReturnValue({
      valid: false,
      reason: "DEVTOOLS_OPENED",
      errorCode: "IPC_FORBIDDEN",
    });
    mockToIPCValidationError.mockReturnValue(forbiddenError);

    const handler = handlers.get("permission:getAllowedTools");
    const result = await handler!(createMockEvent(999));

    expect(result).toEqual(forbiddenError);
    expect(mockPermissionStore.getAllowedToolEntries).not.toHaveBeenCalled();
  });

  // SEC-12: 不正 sender の場合は既存バリデーション前にエラー応答を返す
  it("SEC-12: 不正 sender は P42 バリデーション前にブロックされる", async () => {
    mockValidateIpcSender.mockReturnValue({
      valid: false,
      reason: "UNKNOWN_SENDER",
    });

    const handler = handlers.get("permission:clear-session");
    const result = await handler!(createMockEvent(999), { sessionId: "" });

    // sender 検証が先に実行され、P42 バリデーションには到達しない
    expect(result).toEqual({
      success: false,
      error: { code: "IPC_UNAUTHORIZED", message: "Unauthorized" },
    });
  });

  // SEC-13: 並行リクエストで sender 検証が独立して機能する
  it("SEC-13: 並行リクエストで sender 検証が独立して機能する", async () => {
    const handler = handlers.get("permission:getAllowedTools");
    const promises = [
      handler!(createMockEvent(1)),
      handler!(createMockEvent(1)),
      handler!(createMockEvent(1)),
    ];
    const results = await Promise.all(promises);

    expect(results.every((r) => "tools" in (r as object))).toBe(true);
    expect(mockValidateIpcSender).toHaveBeenCalledTimes(3);
  });

  // SEC-14: 全4ハンドラの getAllowedWindows コールバック個別検証（P41 強化）
  it("SEC-14: 各ハンドラの getAllowedWindows が同一の [mainWindow] を返す", async () => {
    const channels = [
      "permission:getAllowedTools",
      "permission:revokeTool",
      "permission:clearAll",
      "permission:clear-session",
    ];

    for (const ch of channels) {
      mockValidateIpcSender.mockClear();
      const handler = handlers.get(ch);
      await handler!(createMockEvent(), {
        toolName: "test",
        sessionId: "s1",
      });
      const options = mockValidateIpcSender.mock.calls[0][2];
      expect(options.getAllowedWindows()).toEqual([mockMainWindow]);
    }
  });
});

// =================================================================
// unregisterPermissionStoreHandlers テスト
// =================================================================

describe("unregisterPermissionStoreHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("全4チャンネルの removeHandler が呼ばれる", () => {
    unregisterPermissionStoreHandlers();

    expect(mockIpcMainRemoveHandler).toHaveBeenCalledTimes(4);
    expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
      "permission:getAllowedTools",
    );
    expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
      "permission:revokeTool",
    );
    expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
      "permission:clearAll",
    );
    expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
      "permission:clear-session",
    );
  });
});
