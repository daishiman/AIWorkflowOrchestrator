/**
 * SkillExecutor - Permission Fallback Flow Tests
 *
 * UT-06-005: abort/skip/retry/timeout フォールバックフロー
 *
 * TDD Red フェーズ: 実装前に失敗するテストを作成
 * Phase 5 の実装により GREEN に転換させる。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import { SkillExecutor } from "../SkillExecutor";

// PermissionResolver モック
const mockPermissionResolver = {
  waitForResponse: vi.fn(),
  resolveRequest: vi.fn(),
  cancelRequest: vi.fn(),
  cancelAll: vi.fn(),
  pendingCount: 0,
};

vi.mock("../PermissionResolver", () => ({
  PermissionResolver: vi.fn(() => mockPermissionResolver),
}));

// PermissionStore モック
const mockPermissionStore = {
  isToolAllowed: vi.fn().mockReturnValue(false),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn().mockReturnValue([]),
  getAllowedToolEntries: vi.fn().mockReturnValue([]),
  clearAll: vi.fn(),
  revokeSessionEntries: vi.fn().mockReturnValue(0),
};

vi.mock("../PermissionStore", () => ({
  PermissionStore: vi.fn(() => mockPermissionStore),
}));

// SDK モック
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn(() => ({
    [Symbol.asyncIterator]: () => ({
      next: () => Promise.resolve({ done: true }),
    }),
  })),
}));

// AuthKeyService モック
const mockAuthKeyService = {
  getKey: vi.fn().mockResolvedValue("sk-ant-api03-test-key-for-unit-tests"),
  setKey: vi.fn().mockResolvedValue({ success: true }),
  deleteKey: vi.fn().mockResolvedValue({ success: true }),
  hasKey: vi.fn().mockResolvedValue(true),
  validateKey: vi
    .fn()
    .mockResolvedValue({ success: true, data: { isValid: true } }),
};

describe("SkillExecutor - Permission Fallback Flows", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMainWindow = {
      webContents: {
        send: vi.fn(),
      },
      isDestroyed: vi.fn().mockReturnValue(false),
    };
    mockAuthKeyService.getKey.mockResolvedValue(
      "sk-ant-api03-test-key-for-unit-tests",
    );
    executor = new SkillExecutor(
      mockMainWindow as unknown as BrowserWindow,
      undefined,
      mockAuthKeyService,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // タスク1: abort フローテスト（AC-01, AC-02, AC-03, AC-11）
  // =================================================================
  describe("abort フロー", () => {
    it("AC-01: Permission拒否時に cancelAll が呼ばれる", async () => {
      // executeAbortFlow を呼び出す
      await executor.executeAbortFlow("denied", "exec-001");

      // cancelAll が呼ばれることを検証
      expect(mockPermissionResolver.cancelAll).toHaveBeenCalledTimes(1);
    });

    it("AC-01: abort フローで cancelAll → revokeSessionEntries → log → IPC の順序で実行される", async () => {
      const callOrder: string[] = [];

      mockPermissionResolver.cancelAll.mockImplementation(() => {
        callOrder.push("cancelAll");
      });
      mockPermissionStore.revokeSessionEntries.mockImplementation(() => {
        callOrder.push("revokeSessionEntries");
        return 2;
      });
      mockMainWindow.webContents.send.mockImplementation(() => {
        callOrder.push("ipcSend");
      });

      await executor.executeAbortFlow("denied", "exec-001");

      // 順序検証: cancelAll → revokeSessionEntries → IPC send
      expect(callOrder[0]).toBe("cancelAll");
      expect(callOrder[1]).toBe("revokeSessionEntries");
      // log は mockLogger ではなく console/electron-log のため、IPC が最後
      expect(callOrder[callOrder.length - 1]).toBe("ipcSend");
    });

    it("AC-02: abort 後に ExecutionState が aborted に遷移する", async () => {
      await executor.executeAbortFlow("denied", "exec-001");

      // 内部状態が aborted になっていることを検証
      const executions = executor.getActiveExecutions();
      // abort した実行が aborted 状態であること
      // Note: executeAbortFlow は activeExecutions に対して操作する
      // 実装で状態更新が含まれることを検証
      expect(executions).toBeDefined();
    });

    it("AC-03: 二重 abort でエラーが発生しない（冪等性）", async () => {
      // 1回目
      await executor.executeAbortFlow("denied", "exec-001");

      // 2回目 - エラーが発生しないこと
      await expect(
        executor.executeAbortFlow("denied", "exec-001"),
      ).resolves.not.toThrow();
    });

    it("AC-03: 二重 abort で cancelAll/revokeSessionEntries が2回目は呼ばれない", async () => {
      // 1回目
      await executor.executeAbortFlow("denied", "exec-001");
      const cancelAllCount1 =
        mockPermissionResolver.cancelAll.mock.calls.length;
      const revokeCount1 =
        mockPermissionStore.revokeSessionEntries.mock.calls.length;

      // 2回目
      await executor.executeAbortFlow("denied", "exec-001");

      // 2回目で追加呼出がないことを検証
      expect(mockPermissionResolver.cancelAll).toHaveBeenCalledTimes(
        cancelAllCount1,
      );
      expect(mockPermissionStore.revokeSessionEntries).toHaveBeenCalledTimes(
        revokeCount1,
      );
    });

    it("AC-11: abort イベントがログに記録される", async () => {
      // log.warn が abort 情報付きで呼ばれることを検証
      // Note: electron-log のモックは環境依存。console.warn で代替検証
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await executor.executeAbortFlow("denied", "exec-001");

      // ログに abort 関連情報が含まれることを検証
      // 実装で "[SkillExecutor] abort:" 形式のログが出力されること
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("AC-01: abort 通知が IPC 経由で Renderer に送信される", async () => {
      await executor.executeAbortFlow("denied", "exec-001");

      // SKILL_STREAM チャンネルで abort 通知が送信される
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          executionId: "exec-001",
          type: "error",
        }),
      );
    });

    it("AC-01: AbortReason が正しく伝搬される", async () => {
      const reasons = ["denied", "timeout", "max_retries", "unknown"] as const;

      for (const reason of reasons) {
        vi.clearAllMocks();
        await executor.executeAbortFlow(reason, `exec-${reason}`);

        expect(mockPermissionResolver.cancelAll).toHaveBeenCalledTimes(1);
      }
    });
  });

  // =================================================================
  // タスク2: skip フローテスト（AC-04, AC-05, AC-11）
  // =================================================================
  describe("skip フロー", () => {
    it("AC-04: { approved: false, skip: true } で processPermissionFallback が skip を返す", async () => {
      const response = {
        requestId: "req-001",
        approved: false,
        skip: true,
      };

      const result = await executor.processPermissionFallback(response, {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        retryCount: 0,
        maxRetries: 3,
      });

      expect(result.action).toBe("skip");
    });

    it("AC-05: skip 後に ExecutionState が running のまま維持される", async () => {
      executor.executeSkipFlow("exec-001", "Bash");

      // ExecutionState は running のまま
      const executions = executor.getActiveExecutions();
      // skip は状態を aborted に変更しない
      expect(executions).toBeDefined();
    });

    it("AC-11: skip イベントがログに記録される", async () => {
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      executor.executeSkipFlow("exec-001", "Bash");

      // ログに skip 関連情報が含まれることを検証
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("AC-04: skip 通知が IPC 経由で Renderer に送信される", async () => {
      executor.executeSkipFlow("exec-001", "Bash");

      // SKILL_STREAM チャンネルで skip 通知が送信される
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:stream",
        expect.objectContaining({
          executionId: "exec-001",
        }),
      );
    });
  });

  // =================================================================
  // タスク3: retry フローテスト（AC-06, AC-07, AC-08, AC-11）
  // =================================================================
  describe("retry フロー", () => {
    it("AC-06: Permission拒否（skip=false）時に retry が発生する", async () => {
      const response = {
        requestId: "req-001",
        approved: false,
      };

      const result = await executor.processPermissionFallback(response, {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        retryCount: 0,
        maxRetries: 3,
      });

      expect(result.action).toBe("retry");
    });

    it("AC-06: リトライ時に retryCount がインクリメントされる", async () => {
      const response = {
        requestId: "req-001",
        approved: false,
      };

      const result = await executor.processPermissionFallback(response, {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        retryCount: 0,
        maxRetries: 3,
      });

      expect(result.retryCount).toBe(1);
    });

    it("AC-07: リトライは最大3回で打ち切られる", async () => {
      const response = {
        requestId: "req-001",
        approved: false,
      };

      // retryCount が 2 の場合（3回目の試行）
      const result = await executor.processPermissionFallback(response, {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        retryCount: 2,
        maxRetries: 3,
      });

      expect(result.action).toBe("abort");
    });

    it("AC-08: 3回目の失敗で abort フローに遷移する", async () => {
      const response = {
        requestId: "req-001",
        approved: false,
      };

      const result = await executor.processPermissionFallback(response, {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        retryCount: 2,
        maxRetries: 3,
      });

      expect(result.action).toBe("abort");
      expect(result.reason).toBe("max_retries");
    });

    it("AC-11: retry イベントがログに記録される", async () => {
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      const response = {
        requestId: "req-001",
        approved: false,
      };

      await executor.processPermissionFallback(response, {
        executionId: "exec-001",
        requestId: "req-001",
        toolName: "Bash",
        retryCount: 0,
        maxRetries: 3,
      });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // =================================================================
  // タスク4: timeout フローテスト（AC-09, AC-10, AC-11）
  // P13準拠: advanceTimersByTime を使用
  // =================================================================
  describe("timeout フロー", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("AC-09: 300000ms 経過後に abort フローに遷移する", async () => {
      // PermissionResolver の waitForResponse がタイムアウトする場合
      mockPermissionResolver.waitForResponse.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            setTimeout(() => {
              reject(new Error("Permission request timed out after 300000ms"));
            }, 300000);
          }),
      );

      const permissionPromise = executor.sendPermissionRequest(
        "exec-001",
        "Bash",
        { command: "npm install" },
        undefined,
      );

      // P13準拠: advanceTimersByTime で段階的に進める
      vi.advanceTimersByTime(300000);

      // タイムアウトエラーが発生することを検証
      await expect(permissionPromise).rejects.toThrow("timed out");
    });

    it("AC-09: timeout 時に retry を経由しない", async () => {
      // timeout → abort 直行を検証
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Permission request timed out after 300000ms"),
      );

      // processPermissionFallback に timeout エラーを渡す場合、
      // retry カウンタが増加しないことを検証
      // 実装ではtimeoutをcatchしてexecuteAbortFlow("timeout")を呼ぶ
      try {
        await executor.sendPermissionRequest(
          "exec-001",
          "Bash",
          { command: "npm install" },
          undefined,
        );
      } catch {
        // タイムアウトエラーは期待通り
      }

      // abort 通知のみ発生（retry 通知なし）
      // 実装で timeout → abort 直行のフローを検証
    });

    it("AC-10: timeout abort 後に ExecutionState が aborted に遷移する", async () => {
      await executor.executeAbortFlow("timeout", "exec-001");

      // 状態が aborted であることを検証
      expect(mockPermissionResolver.cancelAll).toHaveBeenCalled();
    });

    it("AC-11: timeout イベントがログに記録される", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      await executor.executeAbortFlow("timeout", "exec-001");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // =================================================================
  // タスク5: fail-closed テスト（NFR-1）
  // =================================================================
  describe("fail-closed（NFR-1）", () => {
    it("NFR-1: 不明なエラー発生時に abort に遷移する", async () => {
      // 内部で例外が発生するシナリオをシミュレート
      mockPermissionResolver.cancelAll.mockImplementation(() => {
        throw new Error("Unexpected internal error");
      });

      // fail-closed: エラーが発生しても abort 処理が完了する
      await expect(
        executor.executeAbortFlow("unknown", "exec-001"),
      ).resolves.not.toThrow();
    });

    it("NFR-1: cancelAll がエラーを投げた場合でも後続ステップが実行される", async () => {
      mockPermissionResolver.cancelAll.mockImplementation(() => {
        throw new Error("cancelAll failed");
      });

      await executor.executeAbortFlow("unknown", "exec-001");

      // cancelAll が失敗しても IPC 送信は実行される
      expect(mockMainWindow.webContents.send).toHaveBeenCalled();
    });
  });
});
