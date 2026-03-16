/**
 * @file safetyGateHandlers.test.ts
 * @description SafetyGate IPC ハンドラ ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red）
 * @task TASK-SKILL-LIFECYCLE-08-SKILL-PUBLISHING-VERSION-COMPATIBILITY
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { ipcMain, BrowserWindow, type IpcMainInvokeEvent } from "electron";

// electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

// IPC_CHANNELS モック
vi.mock("../../../preload/channels", () => ({
  IPC_CHANNELS: {
    SKILL_EVALUATE_SAFETY: "skill:evaluate-safety",
  },
}));

import { IPC_CHANNELS } from "../../../preload/channels";
import { registerSafetyGateHandlers } from "../safetyGateHandlers";
import type { DefaultSafetyGate } from "../../permissions/default-safety-gate";

describe("safetyGateHandlers", () => {
  let mockMainWindow: BrowserWindow;
  let mockSafetyGate: DefaultSafetyGate;
  let handler: (
    event: IpcMainInvokeEvent,
    skillName: unknown,
  ) => Promise<unknown>;

  beforeEach(() => {
    vi.resetAllMocks();

    mockMainWindow = {
      webContents: { id: 1 },
      isDestroyed: vi.fn().mockReturnValue(false),
    } as unknown as BrowserWindow;

    mockSafetyGate = {
      evaluate: vi.fn(),
    } as unknown as DefaultSafetyGate;

    // ハンドラ登録
    registerSafetyGateHandlers(mockMainWindow, mockSafetyGate);

    // ipcMain.handle の第2引数からハンドラ関数を取得
    const handleMock = ipcMain.handle as ReturnType<typeof vi.fn>;
    expect(handleMock).toHaveBeenCalledWith(
      IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
      expect.any(Function),
    );
    handler = handleMock.mock.calls[0][1];
  });

  /**
   * 正常な送信元イベントを生成
   */
  function createValidEvent(): IpcMainInvokeEvent {
    return {
      sender: mockMainWindow.webContents,
    } as IpcMainInvokeEvent;
  }

  /**
   * 不正な送信元イベントを生成
   */
  function createUnauthorizedEvent(): IpcMainInvokeEvent {
    return {
      sender: { id: 999 },
    } as IpcMainInvokeEvent;
  }

  describe("正常系", () => {
    it("I-1: 有効な skillName で evaluate 結果が返る", async () => {
      const expectedResult = {
        skillName: "my-safe-skill",
        evaluatedAt: Date.now(),
        overallGrade: "SAFE",
        details: [],
      };
      (mockSafetyGate.evaluate as ReturnType<typeof vi.fn>).mockResolvedValue(
        expectedResult,
      );

      const result = (await handler(createValidEvent(), "my-safe-skill")) as {
        success: boolean;
        data: unknown;
      };

      expect(mockSafetyGate.evaluate).toHaveBeenCalledWith("my-safe-skill");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
    });

    it("I-2: evaluate 結果の全フィールドが返却される", async () => {
      const fullResult = {
        skillName: "risky-skill",
        evaluatedAt: Date.now(),
        overallGrade: "UNSAFE",
        details: [
          {
            checkId: "CRITICAL_TOOL_REQUIRED",
            toolName: "Bash",
            riskLevel: "critical",
            status: "blocked",
            message:
              'ツール "Bash" は critical リスクレベルのため使用がブロックされました',
          },
        ],
      };
      (mockSafetyGate.evaluate as ReturnType<typeof vi.fn>).mockResolvedValue(
        fullResult,
      );

      const result = (await handler(createValidEvent(), "risky-skill")) as {
        success: boolean;
        data: typeof fullResult;
      };

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("skillName", "risky-skill");
      expect(result.data).toHaveProperty("overallGrade", "UNSAFE");
      expect(result.data).toHaveProperty("details");
      expect(result.data.details).toHaveLength(1);
    });
  });

  describe("バリデーション異常系（P42準拠 3段バリデーション）", () => {
    it("I-3: skillName が undefined → VALIDATION_ERROR", async () => {
      const result = (await handler(createValidEvent(), undefined)) as {
        success: boolean;
        error: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.message).toContain("skillName");
      expect(mockSafetyGate.evaluate).not.toHaveBeenCalled();
    });

    it("I-4: skillName が空文字列 → VALIDATION_ERROR", async () => {
      const result = (await handler(createValidEvent(), "")) as {
        success: boolean;
        error: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.message).toContain("skillName");
      expect(mockSafetyGate.evaluate).not.toHaveBeenCalled();
    });

    it('I-5: skillName がスペースのみ "   " → VALIDATION_ERROR（P42準拠）', async () => {
      const result = (await handler(createValidEvent(), "   ")) as {
        success: boolean;
        error: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.message).toContain("skillName");
      expect(mockSafetyGate.evaluate).not.toHaveBeenCalled();
    });

    it("skillName が数値型 → VALIDATION_ERROR", async () => {
      const result = (await handler(createValidEvent(), 42)) as {
        success: boolean;
        error: { code: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(mockSafetyGate.evaluate).not.toHaveBeenCalled();
    });

    it("skillName が null → VALIDATION_ERROR", async () => {
      const result = (await handler(createValidEvent(), null)) as {
        success: boolean;
        error: { code: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(mockSafetyGate.evaluate).not.toHaveBeenCalled();
    });
  });

  describe("セキュリティ", () => {
    it("I-6: 不正な送信元 → UNAUTHORIZED", async () => {
      const result = (await handler(createUnauthorizedEvent(), "my-skill")) as {
        success: boolean;
        error: { code: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UNAUTHORIZED");
      expect(mockSafetyGate.evaluate).not.toHaveBeenCalled();
    });
  });

  describe("エラー伝搬", () => {
    it("I-7: evaluate が throw → エラーレスポンス", async () => {
      (mockSafetyGate.evaluate as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Safety evaluation failed"),
      );

      const result = (await handler(createValidEvent(), "error-skill")) as {
        success: boolean;
        error: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toMatch(/ERROR|INTERNAL_ERROR/);
      expect(result.error.message).toBeDefined();
    });

    it("I-8: code プロパティを持つエラーオブジェクトが throw → code が伝搬", async () => {
      (mockSafetyGate.evaluate as ReturnType<typeof vi.fn>).mockRejectedValue({
        code: "SKILL_NOT_FOUND",
        message: "Skill does not exist",
      });

      const result = (await handler(createValidEvent(), "missing-skill")) as {
        success: boolean;
        error: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("SKILL_NOT_FOUND");
      expect(result.error.message).toBe("Skill does not exist");
    });

    it("I-9: code のみ・message なしのエラー → デフォルトメッセージ", async () => {
      (mockSafetyGate.evaluate as ReturnType<typeof vi.fn>).mockRejectedValue({
        code: "UNKNOWN_ERROR",
      });

      const result = (await handler(createValidEvent(), "no-msg-skill")) as {
        success: boolean;
        error: { code: string; message: string };
      };

      expect(result.success).toBe(false);
      expect(result.error.code).toBe("UNKNOWN_ERROR");
      expect(result.error.message).toBe("Safety evaluation failed");
    });
  });
});
