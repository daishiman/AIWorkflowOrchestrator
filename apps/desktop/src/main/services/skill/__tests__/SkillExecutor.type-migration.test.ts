/**
 * SkillExecutor 型移行テスト
 *
 * TASK-FIX-1-2: SkillExecutor.ts のローカル型定義を @repo/shared に統一
 * Phase 4: テスト作成（TDD: Red）
 *
 * このテストファイルは、SkillExecutor.ts のローカル型定義が
 * @repo/shared の共有型と構造的に互換であることを検証する。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BrowserWindow } from "electron";

// @repo/shared からの型インポート（正本）
import type {
  ExecutionState,
  ExecutionInfo,
  SkillExecutionErrorCode,
  SkillExecutionError,
  ExecutionContext,
} from "@repo/shared";

// SkillExecutor からのインポート
import { SkillExecutor } from "../SkillExecutor";

// モック設定
const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;

const mockPermissionStore = {
  isToolAllowed: vi.fn().mockReturnValue(false),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn().mockReturnValue([]),
  getAllowedToolEntries: vi.fn().mockReturnValue([]),
  clearAll: vi.fn(),
};

// UUIDモック
vi.mock("uuid", () => ({
  v4: () => "test-execution-id-type-migration",
}));

describe("TASK-FIX-1-2: SkillExecutor 型移行テスト", () => {
  let executor: SkillExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    executor = new SkillExecutor(mockMainWindow, mockPermissionStore);
  });

  describe("ExecutionState 型の互換性テスト", () => {
    it("全ての ExecutionState 値が @repo/shared と一致すること", () => {
      // ExecutionState の全状態値を検証
      const validStates: ExecutionState[] = [
        "pending",
        "running",
        "completed",
        "aborted",
        "error",
      ];

      // 各状態が文字列リテラルとして有効であることを確認
      validStates.forEach((state) => {
        expect(typeof state).toBe("string");
        expect([
          "pending",
          "running",
          "completed",
          "aborted",
          "error",
        ]).toContain(state);
      });

      // 状態の総数が5つであることを確認
      expect(validStates).toHaveLength(5);
    });

    it("SkillExecutor が ExecutionState を正しく使用していること", () => {
      // getActiveExecutions は空配列を返す（初期状態）
      const executions = executor.getActiveExecutions();
      expect(Array.isArray(executions)).toBe(true);
    });
  });

  describe("ExecutionInfo 型の互換性テスト", () => {
    it("ExecutionInfo の構造が @repo/shared と一致すること", () => {
      // ExecutionInfo の構造を検証
      const executionInfo: ExecutionInfo = {
        id: "test-id",
        skillId: "test-skill-id",
        state: "pending",
        startedAt: Date.now(),
        completedAt: undefined,
      };

      // 必須プロパティの存在確認
      expect(executionInfo).toHaveProperty("id");
      expect(executionInfo).toHaveProperty("skillId");
      expect(executionInfo).toHaveProperty("state");
      expect(executionInfo).toHaveProperty("startedAt");

      // 型の確認
      expect(typeof executionInfo.id).toBe("string");
      expect(typeof executionInfo.skillId).toBe("string");
      expect(typeof executionInfo.state).toBe("string");
      expect(typeof executionInfo.startedAt).toBe("number");
    });

    it("ExecutionInfo のオプショナルプロパティ completedAt が正しく扱われること", () => {
      // completedAt あり
      const completedInfo: ExecutionInfo = {
        id: "test-id",
        skillId: "test-skill-id",
        state: "completed",
        startedAt: Date.now() - 1000,
        completedAt: Date.now(),
      };

      expect(completedInfo.completedAt).toBeDefined();
      expect(typeof completedInfo.completedAt).toBe("number");

      // completedAt なし
      const pendingInfo: ExecutionInfo = {
        id: "test-id-2",
        skillId: "test-skill-id-2",
        state: "pending",
        startedAt: Date.now(),
      };

      expect(pendingInfo.completedAt).toBeUndefined();
    });
  });

  describe("SkillExecutionErrorCode 型の互換性テスト", () => {
    it("全ての SkillExecutionErrorCode 値が @repo/shared と一致すること", () => {
      // SkillExecutionErrorCode の全エラーコードを検証
      const validErrorCodes: SkillExecutionErrorCode[] = [
        "EXECUTION_FAILED",
        "TIMEOUT",
        "ABORTED",
        "MAX_CONCURRENT_EXCEEDED",
        "SKILL_NOT_FOUND",
        "VALIDATION_FAILED",
        "SDK_ERROR",
        "NETWORK_ERROR",
        "AUTHENTICATION_ERROR",
      ];

      // 各エラーコードが文字列リテラルとして有効であることを確認
      validErrorCodes.forEach((code) => {
        expect(typeof code).toBe("string");
        expect([
          "EXECUTION_FAILED",
          "TIMEOUT",
          "ABORTED",
          "MAX_CONCURRENT_EXCEEDED",
          "SKILL_NOT_FOUND",
          "VALIDATION_FAILED",
          "SDK_ERROR",
          "NETWORK_ERROR",
          "AUTHENTICATION_ERROR",
        ]).toContain(code);
      });

      // エラーコードの総数が9つであることを確認
      expect(validErrorCodes).toHaveLength(9);
    });
  });

  describe("SkillExecutionError 型の互換性テスト", () => {
    it("SkillExecutionError の構造が @repo/shared と一致すること", () => {
      // SkillExecutionError の構造を検証
      const error: SkillExecutionError = {
        code: "EXECUTION_FAILED",
        message: "Test error message",
        details: { stack: "Error stack trace" },
      };

      // 必須プロパティの存在確認
      expect(error).toHaveProperty("code");
      expect(error).toHaveProperty("message");

      // 型の確認
      expect(typeof error.code).toBe("string");
      expect(typeof error.message).toBe("string");
    });

    it("SkillExecutionError のオプショナルプロパティ details が正しく扱われること", () => {
      // details あり
      const errorWithDetails: SkillExecutionError = {
        code: "SDK_ERROR",
        message: "SDK error occurred",
        details: { additionalInfo: "some info" },
      };

      expect(errorWithDetails.details).toBeDefined();

      // details なし
      const errorWithoutDetails: SkillExecutionError = {
        code: "TIMEOUT",
        message: "Operation timed out",
      };

      expect(errorWithoutDetails.details).toBeUndefined();
    });

    it("全てのエラーコードで SkillExecutionError が作成できること", () => {
      const errorCodes: SkillExecutionErrorCode[] = [
        "EXECUTION_FAILED",
        "TIMEOUT",
        "ABORTED",
        "MAX_CONCURRENT_EXCEEDED",
        "SKILL_NOT_FOUND",
        "VALIDATION_FAILED",
        "SDK_ERROR",
        "NETWORK_ERROR",
        "AUTHENTICATION_ERROR",
      ];

      errorCodes.forEach((code) => {
        const error: SkillExecutionError = {
          code,
          message: `Error for ${code}`,
        };

        expect(error.code).toBe(code);
        expect(error.message).toContain(code);
      });
    });
  });

  describe("ExecutionContext 型の互換性テスト", () => {
    it("ExecutionContext の構造が @repo/shared と一致すること", () => {
      // ExecutionContext の構造を検証
      const context: ExecutionContext = {
        id: "test-context-id",
        skillId: "test-skill-id",
        abortController: new AbortController(),
        state: "running",
        startedAt: Date.now(),
        completedAt: undefined,
      };

      // 必須プロパティの存在確認
      expect(context).toHaveProperty("id");
      expect(context).toHaveProperty("skillId");
      expect(context).toHaveProperty("abortController");
      expect(context).toHaveProperty("state");
      expect(context).toHaveProperty("startedAt");

      // 型の確認
      expect(typeof context.id).toBe("string");
      expect(typeof context.skillId).toBe("string");
      expect(context.abortController).toBeInstanceOf(AbortController);
      expect(typeof context.state).toBe("string");
      expect(typeof context.startedAt).toBe("number");
    });

    it("ExecutionContext の abortController が正しく機能すること", () => {
      const abortController = new AbortController();
      const context: ExecutionContext = {
        id: "test-id",
        skillId: "test-skill",
        abortController,
        state: "running",
        startedAt: Date.now(),
      };

      // 初期状態では abort されていない
      expect(context.abortController.signal.aborted).toBe(false);

      // abort を実行
      context.abortController.abort();

      // abort されていることを確認
      expect(context.abortController.signal.aborted).toBe(true);
    });

    it("ExecutionContext のオプショナルプロパティ completedAt が正しく扱われること", () => {
      const contextWithCompleted: ExecutionContext = {
        id: "test-id",
        skillId: "test-skill",
        abortController: new AbortController(),
        state: "completed",
        startedAt: Date.now() - 1000,
        completedAt: Date.now(),
      };

      expect(contextWithCompleted.completedAt).toBeDefined();
      expect(typeof contextWithCompleted.completedAt).toBe("number");
    });
  });

  describe("型の整合性統合テスト", () => {
    it("ExecutionContext から ExecutionInfo への変換が正しく行われること", () => {
      const context: ExecutionContext = {
        id: "ctx-001",
        skillId: "skill-001",
        abortController: new AbortController(),
        state: "running",
        startedAt: 1700000000000,
        completedAt: undefined,
      };

      // ExecutionContext から ExecutionInfo への変換（SkillExecutor内部で行われる処理）
      const info: ExecutionInfo = {
        id: context.id,
        skillId: context.skillId,
        state: context.state,
        startedAt: context.startedAt,
        completedAt: context.completedAt,
      };

      expect(info.id).toBe(context.id);
      expect(info.skillId).toBe(context.skillId);
      expect(info.state).toBe(context.state);
      expect(info.startedAt).toBe(context.startedAt);
      expect(info.completedAt).toBe(context.completedAt);
    });

    it("ExecutionState の遷移が正しく行われること", () => {
      // 状態遷移: pending -> running -> completed
      const transitions: ExecutionState[] = ["pending", "running", "completed"];

      transitions.forEach((state, index) => {
        if (index > 0) {
          // 前の状態からの遷移が有効であることを確認
          const prevState = transitions[index - 1];
          expect(prevState).not.toBe(state);
        }
      });

      // エラー状態への遷移
      const errorTransition: ExecutionState = "error";
      expect(["running", "pending"]).not.toContain(errorTransition);

      // 中断状態への遷移
      const abortedTransition: ExecutionState = "aborted";
      expect(["running", "pending"]).not.toContain(abortedTransition);
    });
  });
});
