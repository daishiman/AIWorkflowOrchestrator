/**
 * skillAnalyticsHandlers Unit Tests
 *
 * TASK-9J Phase 4: TDD Red Phase
 * 27 test cases (H-01 to H-27)
 *
 * Tests IPC handler registration, sender validation, P42 validation,
 * happy path and error handling for 5 analytics channels.
 * P9 compliance: beforeEach resets all mocks.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IpcMainInvokeEvent } from "electron";
import { IPC_CHANNELS } from "../../../preload/channels";
import {
  registerSkillAnalyticsHandlers,
  unregisterSkillAnalyticsHandlers,
} from "../skillAnalyticsHandlers";

// =============================================================================
// モック設定
// =============================================================================
const {
  handlerMap,
  mockIpcMainHandle,
  mockIpcMainRemoveHandler,
  mockValidateIpcSender,
  mockToIPCValidationError,
} = vi.hoisted(() => {
  const handlers = new Map<string, (...args: unknown[]) => unknown>();
  return {
    handlerMap: handlers,
    mockIpcMainHandle: vi.fn(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlers.set(channel, handler);
      },
    ),
    mockIpcMainRemoveHandler: vi.fn((channel: string) => {
      handlers.delete(channel);
    }),
    mockValidateIpcSender: vi.fn(() => ({ valid: true })),
    mockToIPCValidationError: vi.fn(() => new Error("Unauthorized IPC call")),
  };
});

vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: mockIpcMainRemoveHandler,
  },
  BrowserWindow: vi.fn(),
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

// =============================================================================
// ヘルパー
// =============================================================================
function createMockEvent(): IpcMainInvokeEvent {
  return {
    sender: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

function createMockMainWindow() {
  return {
    id: 1,
    webContents: { id: 1 },
    isDestroyed: () => false,
  } as never;
}

// =============================================================================
// テスト
// =============================================================================
describe("skillAnalyticsHandlers", () => {
  const mockSkillAnalytics = {
    recordEvent: vi.fn(),
    getStatistics: vi.fn(),
    getSummary: vi.fn(),
    getUsageTrend: vi.fn(),
    exportData: vi.fn(),
    clearData: vi.fn(),
  };

  let event: IpcMainInvokeEvent;
  let mainWindow: ReturnType<typeof createMockMainWindow>;

  beforeEach(() => {
    handlerMap.clear();
    vi.clearAllMocks();

    event = createMockEvent();
    mainWindow = createMockMainWindow();

    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockReturnValue(
      new Error("Unauthorized IPC call"),
    );

    mockSkillAnalytics.recordEvent.mockReturnValue({
      id: "evt-001",
      skillName: "daily-report",
      eventType: "execution",
      timestamp: "2026-02-28T09:00:00.000Z",
      success: true,
      toolsUsed: ["Read"],
    });

    mockSkillAnalytics.getStatistics.mockReturnValue({
      skillName: "daily-report",
      totalExecutions: 10,
      successRate: 0.9,
      averageDuration: 1500,
      errorRate: 0.1,
      totalTokens: 5000,
      lastUsed: "2026-02-28T09:00:00.000Z",
      mostUsedTools: [],
    });

    mockSkillAnalytics.getSummary.mockReturnValue({
      totalSkills: 3,
      totalExecutions: 30,
      overallSuccessRate: 0.85,
      mostUsedSkills: [],
      recentActivity: [],
    });

    mockSkillAnalytics.getUsageTrend.mockReturnValue({
      period: {
        start: "2026-02-01T00:00:00.000Z",
        end: "2026-02-28T23:59:59.999Z",
        granularity: "day",
      },
      dataPoints: [],
    });

    mockSkillAnalytics.exportData.mockReturnValue("[]");

    registerSkillAnalyticsHandlers(mainWindow, mockSkillAnalytics as never);
  });

  // ===========================================================================
  // H-01 ~ H-05: ハンドラ登録テスト
  // ===========================================================================
  describe("ハンドラ登録", () => {
    it("H-01: skill:analytics:record ハンドラが登録される", () => {
      expect(handlerMap.has(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)).toBe(true);
    });

    it("H-02: skill:analytics:statistics ハンドラが登録される", () => {
      expect(handlerMap.has(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS)).toBe(
        true,
      );
    });

    it("H-03: skill:analytics:summary ハンドラが登録される", () => {
      expect(handlerMap.has(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY)).toBe(true);
    });

    it("H-04: skill:analytics:trend ハンドラが登録される", () => {
      expect(handlerMap.has(IPC_CHANNELS.SKILL_ANALYTICS_TREND)).toBe(true);
    });

    it("H-05: skill:analytics:export ハンドラが登録される", () => {
      expect(handlerMap.has(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT)).toBe(true);
    });
  });

  // ===========================================================================
  // H-06 ~ H-10: Sender検証テスト
  // ===========================================================================
  describe("Sender検証", () => {
    it("H-06: record ハンドラは sender 検証失敗時に throw する", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      await expect(
        handler(event, {
          skillName: "test",
          eventType: "execution",
          success: true,
          toolsUsed: [],
        }),
      ).rejects.toThrow();
    });

    it("H-07: statistics ハンドラは sender 検証失敗時に throw する", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS)!;
      await expect(handler(event, { skillName: "test" })).rejects.toThrow();
    });

    it("H-08: summary ハンドラは sender 検証失敗時に throw する", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY)!;
      await expect(handler(event)).rejects.toThrow();
    });

    it("H-09: trend ハンドラは sender 検証失敗時に throw する", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_TREND)!;
      await expect(
        handler(event, {
          period: {
            start: "2026-02-01T00:00:00.000Z",
            end: "2026-02-28T23:59:59.999Z",
            granularity: "day",
          },
        }),
      ).rejects.toThrow();
    });

    it("H-10: export ハンドラは sender 検証失敗時に throw する", async () => {
      mockValidateIpcSender.mockReturnValueOnce({
        valid: false,
        errorCode: "IPC_UNAUTHORIZED",
        errorMessage: "Unauthorized",
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT)!;
      await expect(handler(event, { format: "json" })).rejects.toThrow();
    });
  });

  // ===========================================================================
  // H-11 ~ H-15: P42バリデーションテスト
  // ===========================================================================
  describe("P42準拠バリデーション", () => {
    it("H-11: record ハンドラは skillName が空文字列の場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      const result = (await handler(event, {
        skillName: "",
        eventType: "execution",
        success: true,
        toolsUsed: [],
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("skillName");
    });

    it("H-12: record ハンドラは skillName がスペースのみの場合にエラーを返す（P42 trim）", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      const result = (await handler(event, {
        skillName: "   ",
        eventType: "execution",
        success: true,
        toolsUsed: [],
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("skillName");
    });

    it("H-13: statistics ハンドラは skillName が空文字列の場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS)!;
      const result = (await handler(event, {
        skillName: "",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("skillName");
    });

    it("H-14: trend ハンドラは period.granularity が無効値の場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_TREND)!;
      const result = (await handler(event, {
        period: {
          start: "2026-02-01T00:00:00.000Z",
          end: "2026-02-28T23:59:59.999Z",
          granularity: "invalid",
        },
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("granularity");
    });

    it("H-15: export ハンドラは format が無効値の場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT)!;
      const result = (await handler(event, {
        format: "xml",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("format");
    });
  });

  // ===========================================================================
  // H-16 ~ H-20: ハッピーパステスト
  // ===========================================================================
  describe("ハッピーパス", () => {
    it("H-16: record ハンドラは正常なイベントを記録し success: true を返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      const result = (await handler(event, {
        skillName: "daily-report",
        eventType: "execution",
        success: true,
        toolsUsed: ["Read"],
      })) as { success: boolean; data: unknown };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSkillAnalytics.recordEvent).toHaveBeenCalled();
    });

    it("H-17: statistics ハンドラは統計情報を返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS)!;
      const result = (await handler(event, {
        skillName: "daily-report",
      })) as { success: boolean; data: unknown };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSkillAnalytics.getStatistics).toHaveBeenCalledWith(
        "daily-report",
        undefined,
      );
    });

    it("H-18: summary ハンドラはサマリーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY)!;
      const result = (await handler(event)) as {
        success: boolean;
        data: unknown;
      };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSkillAnalytics.getSummary).toHaveBeenCalled();
    });

    it("H-19: trend ハンドラはトレンドデータを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_TREND)!;
      const result = (await handler(event, {
        period: {
          start: "2026-02-01T00:00:00.000Z",
          end: "2026-02-28T23:59:59.999Z",
          granularity: "day",
        },
      })) as { success: boolean; data: unknown };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSkillAnalytics.getUsageTrend).toHaveBeenCalled();
    });

    it("H-20: export ハンドラはエクスポートデータを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT)!;
      const result = (await handler(event, {
        format: "json",
      })) as { success: boolean; data: unknown };

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockSkillAnalytics.exportData).toHaveBeenCalledWith(
        "json",
        undefined,
      );
    });
  });

  // ===========================================================================
  // H-21 ~ H-27: エラーハンドリング・エッジケース
  // ===========================================================================
  describe("エラーハンドリング・エッジケース", () => {
    it("H-21: record ハンドラは args が null の場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      const result = (await handler(event, null)) as {
        success: boolean;
        error: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("object");
    });

    it("H-22: record ハンドラは eventType が不正な場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      const result = (await handler(event, {
        skillName: "test",
        eventType: "invalid_type",
        success: true,
        toolsUsed: [],
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("eventType");
    });

    it("H-23: record ハンドラは内部エラー時に 'Internal error' を返す（情報漏洩防止）", async () => {
      mockSkillAnalytics.recordEvent.mockImplementationOnce(() => {
        throw new Error("Database connection failed");
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      const result = (await handler(event, {
        skillName: "test",
        eventType: "execution",
        success: true,
        toolsUsed: [],
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Internal error");
      expect(result.error).not.toContain("Database");
    });

    it("H-24: statistics ハンドラは period を指定すると期間フィルタ付きで呼ばれる", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS)!;
      await handler(event, {
        skillName: "daily-report",
        period: {
          start: "2026-02-01T00:00:00.000Z",
          end: "2026-02-28T23:59:59.999Z",
        },
      });

      expect(mockSkillAnalytics.getStatistics).toHaveBeenCalledWith(
        "daily-report",
        {
          start: "2026-02-01T00:00:00.000Z",
          end: "2026-02-28T23:59:59.999Z",
        },
      );
    });

    it("H-25: trend ハンドラは period が非オブジェクトの場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_TREND)!;
      const result = (await handler(event, {
        period: "not-an-object",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("period");
    });

    it("H-26: export ハンドラは period を指定すると期間フィルタ付きで呼ばれる", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT)!;
      await handler(event, {
        format: "csv",
        period: {
          start: "2026-02-01T00:00:00.000Z",
          end: "2026-02-28T23:59:59.999Z",
        },
      });

      expect(mockSkillAnalytics.exportData).toHaveBeenCalledWith("csv", {
        start: "2026-02-01T00:00:00.000Z",
        end: "2026-02-28T23:59:59.999Z",
      });
    });

    it("H-27: unregisterSkillAnalyticsHandlers で5つのハンドラが解除される", () => {
      unregisterSkillAnalyticsHandlers();

      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_ANALYTICS_RECORD,
      );
      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS,
      );
      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY,
      );
      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_ANALYTICS_TREND,
      );
      expect(mockIpcMainRemoveHandler).toHaveBeenCalledWith(
        IPC_CHANNELS.SKILL_ANALYTICS_EXPORT,
      );
    });
  });

  // ===========================================================================
  // validateIpcSender の getAllowedWindows コールバック検証 (P41対策)
  // ===========================================================================
  describe("validateIpcSender コールバック検証（P41対策）", () => {
    it("getAllowedWindows コールバックが mainWindow を返す", async () => {
      // ハンドラを呼び出して validateIpcSender が実行されるようにする
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY)!;
      await handler(event);

      expect(mockValidateIpcSender).toHaveBeenCalled();

      const lastCall = mockValidateIpcSender.mock.calls[0];
      const options = lastCall[2] as {
        getAllowedWindows: () => unknown[];
      };
      const allowedWindows = options.getAllowedWindows();
      expect(allowedWindows).toContain(mainWindow);
    });
  });

  // ===========================================================================
  // Phase 6: テスト拡充 - 境界値・セキュリティ・エッジケース
  // ===========================================================================
  describe("Phase 6: テスト拡充", () => {
    // HB-01: record で toolsUsed が配列でない場合は空配列にフォールバック
    it("HB-01: record で toolsUsed が非配列の場合は空配列にフォールバックする", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      const result = (await handler(event, {
        skillName: "test",
        eventType: "execution",
        success: true,
        toolsUsed: "not-array",
      })) as { success: boolean; data: { toolsUsed: string[] } };

      expect(result.success).toBe(true);
      // recordEvent に空配列が渡される
      expect(mockSkillAnalytics.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({ toolsUsed: [] }),
      );
    });

    // HB-02: record で duration が数値以外の場合は undefined にフォールバック
    it("HB-02: record で duration が非数値の場合は undefined にフォールバックする", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_RECORD)!;
      await handler(event, {
        skillName: "test",
        eventType: "execution",
        success: true,
        toolsUsed: [],
        duration: "not-a-number",
      });

      expect(mockSkillAnalytics.recordEvent).toHaveBeenCalledWith(
        expect.objectContaining({ duration: undefined }),
      );
    });

    // HB-03: statistics で内部エラー時に Internal error を返す
    it("HB-03: statistics ハンドラは内部エラー時に 'Internal error' を返す", async () => {
      mockSkillAnalytics.getStatistics.mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS)!;
      const result = (await handler(event, {
        skillName: "test",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Internal error");
    });

    // HB-04: summary で内部エラー時に Internal error を返す
    it("HB-04: summary ハンドラは内部エラー時に 'Internal error' を返す", async () => {
      mockSkillAnalytics.getSummary.mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_SUMMARY)!;
      const result = (await handler(event)) as {
        success: boolean;
        error: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Internal error");
    });

    // HB-05: trend で内部エラー時に Internal error を返す
    it("HB-05: trend ハンドラは内部エラー時に 'Internal error' を返す", async () => {
      mockSkillAnalytics.getUsageTrend.mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_TREND)!;
      const result = (await handler(event, {
        period: {
          start: "2026-02-01T00:00:00.000Z",
          end: "2026-02-28T23:59:59.999Z",
          granularity: "day",
        },
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Internal error");
    });

    // HB-06: export で内部エラー時に Internal error を返す
    it("HB-06: export ハンドラは内部エラー時に 'Internal error' を返す", async () => {
      mockSkillAnalytics.exportData.mockImplementationOnce(() => {
        throw new Error("Unexpected error");
      });

      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_EXPORT)!;
      const result = (await handler(event, {
        format: "json",
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Internal error");
    });

    // HB-07: trend で skillName がオプショナルで正しく動作する
    it("HB-07: trend ハンドラで skillName を指定するとフィルタ付きで呼ばれる", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_TREND)!;
      await handler(event, {
        period: {
          start: "2026-02-01T00:00:00.000Z",
          end: "2026-02-28T23:59:59.999Z",
          granularity: "day",
        },
        skillName: "daily-report",
      });

      expect(mockSkillAnalytics.getUsageTrend).toHaveBeenCalledWith(
        expect.objectContaining({ granularity: "day" }),
        "daily-report",
      );
    });

    // HB-08: trend で period.start が空文字の場合にエラーを返す
    it("HB-08: trend ハンドラで period.start が空文字の場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_TREND)!;
      const result = (await handler(event, {
        period: {
          start: "",
          end: "2026-02-28T23:59:59.999Z",
          granularity: "day",
        },
      })) as { success: boolean; error: string };

      expect(result.success).toBe(false);
      expect(result.error).toContain("period.start");
    });

    // HB-09: statistics で args が配列の場合にエラーを返す
    it("HB-09: statistics ハンドラで args が配列の場合にエラーを返す", async () => {
      const handler = handlerMap.get(IPC_CHANNELS.SKILL_ANALYTICS_STATISTICS)!;
      const result = (await handler(event, ["not-object"])) as {
        success: boolean;
        error: string;
      };

      expect(result.success).toBe(false);
      expect(result.error).toContain("object");
    });
  });
});
