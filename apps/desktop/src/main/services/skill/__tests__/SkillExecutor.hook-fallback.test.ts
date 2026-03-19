/**
 * SkillExecutor - PreToolUse Hook Fallback Integration Tests
 *
 * UT-06-005-A: handlePermissionCheck / sendPermissionRequestWithTimeout
 * PreToolUse Hook と processPermissionFallback の統合テスト
 *
 * TC-A-001: Permission 拒否時に processPermissionFallback が呼ばれる (AC-001)
 * TC-A-002: タイムアウト時に executeAbortFlow("timeout") が呼ばれる (AC-002)
 * TC-A-003: retry 時に sendPermissionRequest が再発行される (AC-003)
 * TC-A-004: skip 時に { proceed: false } が返される (AC-004)
 * TC-A-005: abort 時にスキル実行が停止する (AC-005)
 * TC-A-006: フォールバック処理の例外時に abort に遷移する (AC-006)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import { SkillExecutor, PermissionTimeoutError } from "../SkillExecutor";

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

describe("SkillExecutor - PreToolUse Hook Fallback Integration", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMainWindow = {
      webContents: { send: vi.fn() },
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
    vi.useRealTimers();
  });

  // =================================================================
  // TC-A-001: Permission 拒否時に processPermissionFallback が呼ばれる
  // =================================================================
  describe("TC-A-001: Permission 拒否 → processPermissionFallback 呼出", () => {
    it("Permission 拒否で retry が返された場合、max_retries 到達後に abort される", async () => {
      // sendPermissionRequest が拒否を返す（毎回）
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-001",
        approved: false,
      });

      // handlePermissionCheck を呼び出す
      // retry が PERMISSION_MAX_RETRIES(3) 回で abort に至る
      await expect(
        executor.handlePermissionCheck("exec-001", "Bash", { command: "ls" }),
      ).rejects.toThrow();

      // executeAbortFlow が max_retries 理由で呼ばれた証拠
      // cancelAll が呼ばれていること
      expect(mockPermissionResolver.cancelAll).toHaveBeenCalled();
    });

    it("Permission 拒否で skip が返された場合、{ proceed: false } が返される", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-001",
        approved: false,
        skip: true,
      });

      const result = await executor.handlePermissionCheck("exec-001", "Bash", {
        command: "ls",
      });

      expect(result).toEqual(expect.objectContaining({ proceed: false }));
    });
  });

  // =================================================================
  // TC-A-002: タイムアウト時に executeAbortFlow("timeout") が呼ばれる
  // =================================================================
  describe("TC-A-002: タイムアウト → abort('timeout')", () => {
    it("sendPermissionRequest が30秒以内に応答しない場合、abort される", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);

      // タイムアウトを短くした executor で検証（テスト速度のため）
      // defaultTimeout を短い値に上書き
      Object.defineProperty(executor, "defaultTimeout", { value: 50 });

      // waitForResponse が解決しない（永続的 pending）
      mockPermissionResolver.waitForResponse.mockImplementation(
        () => new Promise(() => {}), // never resolves
      );

      await expect(
        executor.handlePermissionCheck("exec-timeout", "Bash", {
          command: "ls",
        }),
      ).rejects.toThrow("timed out");

      // abort が "timeout" 理由で呼ばれた
      expect(mockPermissionResolver.cancelAll).toHaveBeenCalled();
    });
  });

  // =================================================================
  // TC-A-003: retry 時に sendPermissionRequest が再発行される
  // =================================================================
  describe("TC-A-003: retry → sendPermissionRequest 再発行", () => {
    it("Permission 拒否 → retry → 2回目で承認される場合、{ proceed: true } が返る", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);

      // 1回目: 拒否（retryに遷移）、2回目: 承認
      mockPermissionResolver.waitForResponse
        .mockResolvedValueOnce({
          requestId: "req-001",
          approved: false,
        })
        .mockResolvedValueOnce({
          requestId: "req-002",
          approved: true,
        });

      const result = await executor.handlePermissionCheck(
        "exec-retry",
        "Bash",
        { command: "ls" },
      );

      expect(result).toEqual({ proceed: true });
      // sendPermissionRequest が2回呼ばれたことを検証
      // (waitForResponse がsendPermissionRequest内で呼ばれる)
      expect(mockPermissionResolver.waitForResponse).toHaveBeenCalledTimes(2);
    });

    it("3回 retry 後に max_retries で abort される (FR-106)", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);

      // 4回とも拒否（retry 3回 + 最初の1回）
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-deny",
        approved: false,
      });

      await expect(
        executor.handlePermissionCheck("exec-max-retry", "Bash", {
          command: "ls",
        }),
      ).rejects.toThrow();

      expect(mockPermissionResolver.cancelAll).toHaveBeenCalled();
    });
  });

  // =================================================================
  // TC-A-004: skip 時に { proceed: false, message: "..." } が返される
  // =================================================================
  describe("TC-A-004: skip → { proceed: false }", () => {
    it("skip 応答時にツール実行がスキップされる", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-skip",
        approved: false,
        skip: true,
      });

      const result = await executor.handlePermissionCheck(
        "exec-skip",
        "Write",
        { file_path: "/tmp/test.txt" },
      );

      expect(result.proceed).toBe(false);
      if (!result.proceed) {
        expect(result.message).toBeDefined();
      }
    });
  });

  // =================================================================
  // TC-A-005: abort 時にスキル実行が停止する
  // =================================================================
  describe("TC-A-005: abort → スキル実行停止", () => {
    it("Permission 拒否で max_retries 到達後、エラーがスローされる", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-abort",
        approved: false,
      });

      await expect(
        executor.handlePermissionCheck("exec-abort", "Bash", {
          command: "rm -rf /",
        }),
      ).rejects.toThrow();
    });
  });

  // =================================================================
  // TC-A-006: フォールバック処理の例外時に abort に遷移する (NFR-101)
  // =================================================================
  describe("TC-A-006: fail-closed (NFR-101)", () => {
    it("processPermissionFallback 内部で例外が発生した場合、abort に遷移する", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);

      // waitForResponse が正常に返すが、内部でエラーが起きるようにする
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Unexpected IPC failure"),
      );

      await expect(
        executor.handlePermissionCheck("exec-fail-closed", "Bash", {
          command: "ls",
        }),
      ).rejects.toThrow();

      // fail-closed: abort が実行される
      expect(mockPermissionResolver.cancelAll).toHaveBeenCalled();
    });
  });

  // =================================================================
  // 既存 FR-001〜FR-003 との共存テスト (NFR-105)
  // =================================================================
  describe("NFR-105: 既存 FR-001〜FR-003 との非干渉", () => {
    it("Permission 許可済みツールは自動承認される", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(true);

      const result = await executor.handlePermissionCheck(
        "exec-allowed",
        "Read",
        { file_path: "/tmp/test.txt" },
      );

      expect(result).toEqual({ proceed: true });
      // waitForResponse は呼ばれない（自動承認なので）
      expect(mockPermissionResolver.waitForResponse).not.toHaveBeenCalled();
    });
  });

  // =================================================================
  // Phase 6: テスト拡充 — 境界値・追加パス
  // =================================================================
  describe("TC-B: 境界値・追加カバレッジ", () => {
    it("承認 + rememberChoice=true で allowTool が呼ばれる", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-remember",
        approved: true,
        rememberChoice: true,
      });

      const result = await executor.handlePermissionCheck(
        "exec-remember",
        "Bash",
        { command: "ls" },
      );

      expect(result).toEqual({ proceed: true });
      expect(mockPermissionStore.allowTool).toHaveBeenCalledWith("Bash");
    });

    it("承認 + rememberChoice=false で allowTool が呼ばれない", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-no-remember",
        approved: true,
        rememberChoice: false,
      });

      const result = await executor.handlePermissionCheck(
        "exec-no-remember",
        "Edit",
        { file_path: "/tmp/test" },
      );

      expect(result).toEqual({ proceed: true });
      expect(mockPermissionStore.allowTool).not.toHaveBeenCalled();
    });

    it("retry 1回で承認された場合、waitForResponse が2回呼ばれる", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse
        .mockResolvedValueOnce({ requestId: "req-1", approved: false })
        .mockResolvedValueOnce({ requestId: "req-2", approved: true });

      const result = await executor.handlePermissionCheck(
        "exec-retry-1",
        "Bash",
        { command: "ls" },
      );

      expect(result).toEqual({ proceed: true });
      expect(mockPermissionResolver.waitForResponse).toHaveBeenCalledTimes(2);
    });

    it("retry 2回目で skip が返された場合、{ proceed: false } が返る", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse
        .mockResolvedValueOnce({ requestId: "req-1", approved: false })
        .mockResolvedValueOnce({
          requestId: "req-2",
          approved: false,
          skip: true,
        });

      const result = await executor.handlePermissionCheck(
        "exec-retry-skip",
        "Bash",
        { command: "ls" },
      );

      expect(result.proceed).toBe(false);
      expect(mockPermissionResolver.waitForResponse).toHaveBeenCalledTimes(2);
    });

    it("PermissionTimeoutError が正しいプロパティを持つ", () => {
      const error = new PermissionTimeoutError(30000, "Bash");
      expect(error.name).toBe("PermissionTimeoutError");
      expect(error.timeoutMs).toBe(30000);
      expect(error.message).toContain("30000ms");
      expect(error.message).toContain("Bash");
      expect(error).toBeInstanceOf(Error);
    });

    it("abort 冪等性: 2回目の handlePermissionCheck は同一 executionId で abort 済み", async () => {
      mockPermissionStore.isToolAllowed.mockReturnValue(false);
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-idempotent",
        approved: false,
      });

      // 1回目: max_retries で abort
      await expect(
        executor.handlePermissionCheck("exec-idempotent", "Bash", {
          command: "ls",
        }),
      ).rejects.toThrow();

      // 2回目: 同じ executionId — abort 済みなので即座にエラー
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-idempotent-2",
        approved: false,
      });

      await expect(
        executor.handlePermissionCheck("exec-idempotent", "Bash", {
          command: "ls",
        }),
      ).rejects.toThrow();
    });
  });
});
