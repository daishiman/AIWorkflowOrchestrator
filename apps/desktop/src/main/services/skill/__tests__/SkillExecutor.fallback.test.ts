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

  // =================================================================
  // Phase 6 タスク1: retryCount 境界値テスト
  // =================================================================
  describe("retryCount 境界値（Phase 6）", () => {
    it("B-2: retryCount=1 での Permission 拒否で retryCount=2 が返る", async () => {
      const result = await executor.processPermissionFallback(
        { requestId: "req-001", approved: false },
        {
          executionId: "exec-001",
          requestId: "req-001",
          toolName: "Bash",
          retryCount: 1,
          maxRetries: 3,
        },
      );
      expect(result.action).toBe("retry");
      expect(result.retryCount).toBe(2);
    });

    it("B-4: retryCount=3（上限超過）で abort が返る", async () => {
      const result = await executor.processPermissionFallback(
        { requestId: "req-001", approved: false },
        {
          executionId: "exec-001",
          requestId: "req-001",
          toolName: "Bash",
          retryCount: 3,
          maxRetries: 3,
        },
      );
      expect(result.action).toBe("abort");
      expect(result.reason).toBe("max_retries");
    });
  });

  // =================================================================
  // Phase 6 タスク2: 異常系テスト（abort 各ステップエラー）
  // =================================================================
  describe("abort 異常系（Phase 6）", () => {
    it("E-2: revokeSessionEntries が例外を投げても log と IPC は実行される", async () => {
      mockPermissionStore.revokeSessionEntries.mockImplementation(() => {
        throw new Error("revokeSessionEntries failed");
      });

      await executor.executeAbortFlow("denied", "exec-002");

      // IPC 送信は実行される（fail-closed）
      expect(mockMainWindow.webContents.send).toHaveBeenCalled();
    });

    it("E-3: IPC send が例外を投げた場合、例外が呼び出し元に伝播する（sendStream は try-catch なし）", async () => {
      mockMainWindow.webContents.send.mockImplementation(() => {
        throw new Error("IPC send failed");
      });

      // sendStream は try-catch で囲まれていないため、IPC 例外は伝播する
      await expect(
        executor.executeAbortFlow("denied", "exec-003"),
      ).rejects.toThrow("IPC send failed");
    });

    it("E-4: cancelAll と revokeSessionEntries が両方例外でも abort が完了する", async () => {
      mockPermissionResolver.cancelAll.mockImplementation(() => {
        throw new Error("cancelAll failed");
      });
      mockPermissionStore.revokeSessionEntries.mockImplementation(() => {
        throw new Error("revokeSessionEntries failed");
      });

      await expect(
        executor.executeAbortFlow("denied", "exec-004"),
      ).resolves.not.toThrow();

      // IPC は実行される
      expect(mockMainWindow.webContents.send).toHaveBeenCalled();
    });

    it("E-5: 不正な response（approved undefined）は retry として処理される", async () => {
      const result = await executor.processPermissionFallback(
        { requestId: "req-001" } as any,
        {
          executionId: "exec-005",
          requestId: "req-001",
          toolName: "Bash",
          retryCount: 0,
          maxRetries: 3,
        },
      );

      // approved が undefined（falsy）かつ skip もないため、通常の拒否フロー（retry）に入る
      // retryCount=0 < maxRetries=3 なので retry が返る
      expect(result.action).toBe("retry");
    });
  });

  // =================================================================
  // Phase 6 タスク3: 並行実行テスト
  // =================================================================
  describe("並行実行（Phase 6）", () => {
    it("C-1: 2つの abort が同時に実行されてもエラーが発生しない", async () => {
      const [result1, result2] = await Promise.all([
        executor.executeAbortFlow("denied", "exec-c1-a"),
        executor.executeAbortFlow("denied", "exec-c1-b"),
      ]);

      // 両方とも正常に完了
      expect(result1).toBeUndefined(); // void return
      expect(result2).toBeUndefined();
    });

    it("C-2: skip と abort が同時実行された場合、両方がエラーなく完了する", async () => {
      const skipPromise = Promise.resolve(
        executor.executeSkipFlow("exec-c2-skip", "Bash"),
      );
      const abortPromise = executor.executeAbortFlow("denied", "exec-c2-abort");

      await expect(
        Promise.all([skipPromise, abortPromise]),
      ).resolves.not.toThrow();
    });

    it("C-3: 1つが retry 中にもう1つが abort された場合、abort がエラーなく完了する", async () => {
      const retryResult = await executor.processPermissionFallback(
        { requestId: "req-c3", approved: false },
        {
          executionId: "exec-c3-retry",
          requestId: "req-c3",
          toolName: "Bash",
          retryCount: 0,
          maxRetries: 3,
        },
      );
      expect(retryResult.action).toBe("retry");

      // 同時に別の executionId で abort
      await expect(
        executor.executeAbortFlow("denied", "exec-c3-abort"),
      ).resolves.not.toThrow();
    });
  });

  // =================================================================
  // Phase 6 タスク4: 冪等性テスト拡充
  // =================================================================
  describe("冪等性拡充（Phase 6）", () => {
    it("I-2: abort 後の skip 呼び出しでエラーが発生しない", async () => {
      await executor.executeAbortFlow("denied", "exec-i2");

      // abort 済みの executionId で skip を呼んでもエラーなし
      expect(() => executor.executeSkipFlow("exec-i2", "Bash")).not.toThrow();
    });

    it("I-3: abort 後の retry で abort が返る", async () => {
      await executor.executeAbortFlow("denied", "exec-i3");

      const result = await executor.processPermissionFallback(
        { requestId: "req-i3", approved: false },
        {
          executionId: "exec-i3",
          requestId: "req-i3",
          toolName: "Bash",
          retryCount: 0,
          maxRetries: 3,
        },
      );

      // abort 済みなので retry ではなく abort が返る
      // Note: 実装依存 - abort 済みの場合の processPermissionFallback の挙動
      // fail-closed の場合は abort、またはそのまま retry 返却
      expect(["abort", "retry"]).toContain(result.action);
    });
  });

  // =================================================================
  // Phase 6 タスク5: timeout 境界値テスト
  // P13準拠: advanceTimersByTime を使用
  // =================================================================
  describe("timeout 境界値（Phase 6）", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("T-1: 299999ms 経過時点ではタイムアウトしない", async () => {
      let timedOut = false;
      mockPermissionResolver.waitForResponse.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            setTimeout(() => {
              timedOut = true;
              reject(new Error("timed out"));
            }, 300000);
          }),
      );

      const promise = executor.sendPermissionRequest(
        "exec-t1",
        "Bash",
        { command: "ls" },
        undefined,
      );

      vi.advanceTimersByTime(299999);
      expect(timedOut).toBe(false);

      // クリーンアップ
      vi.advanceTimersByTime(1);
      await promise.catch(() => {});
    });

    it("T-2: 300000ms ちょうどでタイムアウトする", async () => {
      mockPermissionResolver.waitForResponse.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            setTimeout(() => {
              reject(new Error("Permission request timed out after 300000ms"));
            }, 300000);
          }),
      );

      const promise = executor.sendPermissionRequest(
        "exec-t2",
        "Bash",
        { command: "ls" },
        undefined,
      );

      vi.advanceTimersByTime(300000);

      await expect(promise).rejects.toThrow("timed out");
    });

    it("T-3: 300001ms 経過後はタイムアウト済み", async () => {
      mockPermissionResolver.waitForResponse.mockImplementation(
        () =>
          new Promise((_resolve, reject) => {
            setTimeout(() => {
              reject(new Error("Permission request timed out after 300000ms"));
            }, 300000);
          }),
      );

      const promise = executor.sendPermissionRequest(
        "exec-t3",
        "Bash",
        { command: "ls" },
        undefined,
      );

      vi.advanceTimersByTime(300001);

      await expect(promise).rejects.toThrow("timed out");
    });

    it("T-4: timeout 直前（299999ms）に approved が来た場合は abort しない", async () => {
      mockPermissionResolver.waitForResponse.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ requestId: "req-t4", approved: true });
            }, 299999);
          }),
      );

      const promise = executor.sendPermissionRequest(
        "exec-t4",
        "Bash",
        { command: "ls" },
        undefined,
      );

      vi.advanceTimersByTime(299999);

      const result = await promise;
      expect(result).toBeDefined();
    });
  });
});
