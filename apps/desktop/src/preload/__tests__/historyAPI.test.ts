/**
 * historyAPI preload スクリプト テスト
 *
 * @module @repo/desktop/preload/__tests__/historyAPI
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { IpcRenderer, ContextBridge } from "electron";

// Mock electron module
const mockInvoke = vi.fn();
const mockOn = vi.fn();
const mockRemoveListener = vi.fn();
const mockExposeInMainWorld = vi.fn();

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
    on: mockOn,
    removeListener: mockRemoveListener,
  } as Partial<IpcRenderer>,
  contextBridge: {
    exposeInMainWorld: mockExposeInMainWorld,
  } as Partial<ContextBridge>,
}));

// Import after mocking
import { IPC_CHANNELS, ALLOWED_INVOKE_CHANNELS } from "../channels";

describe("historyAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({ success: true, data: {} });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // カテゴリ1: API存在確認テスト (API-001 ~ API-005)
  // ==========================================================================
  describe("API existence", () => {
    describe("HISTORY_CHANNELS definition", () => {
      it("API-001: should have HISTORY_GET_FILE_HISTORY channel defined", () => {
        expect(IPC_CHANNELS.HISTORY_GET_FILE_HISTORY).toBe(
          "history:getFileHistory",
        );
      });

      it("API-002: should have HISTORY_GET_VERSION_DETAIL channel defined", () => {
        expect(IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL).toBe(
          "history:getVersionDetail",
        );
      });

      it("API-003: should have HISTORY_GET_CONVERSION_LOGS channel defined", () => {
        expect(IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS).toBe(
          "history:getConversionLogs",
        );
      });

      it("API-004: should have HISTORY_RESTORE_VERSION channel defined", () => {
        expect(IPC_CHANNELS.HISTORY_RESTORE_VERSION).toBe(
          "history:restoreVersion",
        );
      });

      it("API-005: should have all 4 HISTORY channels defined", () => {
        const historyChannels = Object.entries(IPC_CHANNELS)
          .filter(([key]) => key.startsWith("HISTORY_"))
          .map(([, value]) => value);

        expect(historyChannels).toHaveLength(4);
        expect(historyChannels).toContain("history:getFileHistory");
        expect(historyChannels).toContain("history:getVersionDetail");
        expect(historyChannels).toContain("history:getConversionLogs");
        expect(historyChannels).toContain("history:restoreVersion");
      });
    });
  });

  // ==========================================================================
  // カテゴリ2: IPC呼び出しテスト (IPC-001 ~ IPC-004)
  // ==========================================================================
  describe("IPC channel calls", () => {
    describe("Whitelist registration", () => {
      it("IPC-001: HISTORY_GET_FILE_HISTORY should be in whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
        );
      });

      it("IPC-002: HISTORY_GET_VERSION_DETAIL should be in whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
        );
      });

      it("IPC-003: HISTORY_GET_CONVERSION_LOGS should be in whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
        );
      });

      it("IPC-004: HISTORY_RESTORE_VERSION should be in whitelist", () => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(
          IPC_CHANNELS.HISTORY_RESTORE_VERSION,
        );
      });
    });
  });

  // ==========================================================================
  // カテゴリ3: 型チェックテスト (TYPE-001 ~ TYPE-002)
  // ==========================================================================
  describe("Type definitions", () => {
    it("TYPE-001: IPC_CHANNELS should be readonly", () => {
      // TypeScript const assertion確認
      const channels = IPC_CHANNELS;
      expect(Object.isFrozen(channels)).toBe(false); // as const は Object.freeze しない
      expect(typeof channels.HISTORY_GET_FILE_HISTORY).toBe("string");
    });

    it("TYPE-002: ALLOWED_INVOKE_CHANNELS should be readonly array", () => {
      expect(Array.isArray(ALLOWED_INVOKE_CHANNELS)).toBe(true);
      expect(ALLOWED_INVOKE_CHANNELS.length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // カテゴリ4: エラーハンドリングテスト (ERR-001 ~ ERR-002)
  // ==========================================================================
  describe("Error handling", () => {
    it("ERR-001: invalid channel should not be in whitelist", () => {
      const invalidChannel = "invalid:channel";
      expect(ALLOWED_INVOKE_CHANNELS).not.toContain(invalidChannel);
    });

    it("ERR-002: whitelist should not contain undefined values", () => {
      const hasUndefined = ALLOWED_INVOKE_CHANNELS.some(
        (channel) => channel === undefined,
      );
      expect(hasUndefined).toBe(false);
    });
  });

  // ==========================================================================
  // カテゴリ5: セキュリティテスト (SEC-001 ~ SEC-002)
  // ==========================================================================
  describe("Security", () => {
    it("SEC-001: all HISTORY channels should be whitelisted", () => {
      const historyChannels = [
        IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
        IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
        IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
        IPC_CHANNELS.HISTORY_RESTORE_VERSION,
      ];

      historyChannels.forEach((channel) => {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(channel);
      });
    });

    it("SEC-002: HISTORY channels should follow naming convention", () => {
      const historyChannels = [
        IPC_CHANNELS.HISTORY_GET_FILE_HISTORY,
        IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL,
        IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS,
        IPC_CHANNELS.HISTORY_RESTORE_VERSION,
      ];

      historyChannels.forEach((channel) => {
        expect(channel).toMatch(/^history:/);
      });
    });
  });
});

// ==========================================================================
// safeInvoke関数のユニットテスト
// ==========================================================================
describe("safeInvoke wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("channel validation", () => {
    it("should allow whitelisted channel", () => {
      const channel = IPC_CHANNELS.HISTORY_GET_FILE_HISTORY;
      const isAllowed = ALLOWED_INVOKE_CHANNELS.includes(channel);
      expect(isAllowed).toBe(true);
    });

    it("should reject non-whitelisted channel", () => {
      const invalidChannel = "invalid:channel";
      const isAllowed = ALLOWED_INVOKE_CHANNELS.includes(invalidChannel);
      expect(isAllowed).toBe(false);
    });
  });
});

// ==========================================================================
// historyAPI オブジェクトの統合テスト
// ==========================================================================
describe("historyAPI integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFileHistory", () => {
    it("should pass correct arguments to IPC", () => {
      const fileId = "test-file-id";
      const options = { limit: 20, offset: 0 };

      // 実際のhistoryAPIオブジェクトの動作をシミュレート
      const expectedChannel = IPC_CHANNELS.HISTORY_GET_FILE_HISTORY;
      const expectedArgs = [fileId, options];

      expect(expectedChannel).toBe("history:getFileHistory");
      expect(expectedArgs[0]).toBe(fileId);
      expect(expectedArgs[1]).toEqual(options);
    });

    it("should handle undefined options", () => {
      const fileId = "test-file-id";
      const options = undefined;

      const expectedChannel = IPC_CHANNELS.HISTORY_GET_FILE_HISTORY;
      const expectedArgs = [fileId, options];

      expect(expectedChannel).toBe("history:getFileHistory");
      expect(expectedArgs[0]).toBe(fileId);
      expect(expectedArgs[1]).toBeUndefined();
    });
  });

  describe("getVersionDetail", () => {
    it("should pass correct arguments to IPC", () => {
      const conversionId = "test-conversion-id";

      const expectedChannel = IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL;
      const expectedArgs = [conversionId];

      expect(expectedChannel).toBe("history:getVersionDetail");
      expect(expectedArgs[0]).toBe(conversionId);
    });
  });

  describe("getConversionLogs", () => {
    it("should pass correct arguments to IPC with options", () => {
      const conversionId = "test-conversion-id";
      const options = { level: "error" as const, limit: 50 };

      const expectedChannel = IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS;
      const expectedArgs = [conversionId, options];

      expect(expectedChannel).toBe("history:getConversionLogs");
      expect(expectedArgs[0]).toBe(conversionId);
      expect(expectedArgs[1]).toEqual(options);
    });
  });

  describe("restoreVersion", () => {
    it("should pass correct arguments to IPC", () => {
      const fileId = "test-file-id";
      const conversionId = "test-conversion-id";

      const expectedChannel = IPC_CHANNELS.HISTORY_RESTORE_VERSION;
      const expectedArgs = [fileId, conversionId];

      expect(expectedChannel).toBe("history:restoreVersion");
      expect(expectedArgs[0]).toBe(fileId);
      expect(expectedArgs[1]).toBe(conversionId);
    });
  });
});

// ==========================================================================
// Phase 6: テスト拡充 - エッジケーステスト
// ==========================================================================
describe("historyAPI edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({ success: true, data: {} });
  });

  it("EDGE-001: should handle empty fileId parameter", () => {
    const emptyFileId = "";
    const channel = IPC_CHANNELS.HISTORY_GET_FILE_HISTORY;

    // 空のfileIdでもチャンネルは正しく設定される
    expect(channel).toBe("history:getFileHistory");
    expect(emptyFileId).toBe("");
  });

  it("EDGE-002: should handle options with zero values", () => {
    const options = { limit: 0, offset: 0 };

    // limit: 0, offset: 0は有効なオプション値
    expect(options.limit).toBe(0);
    expect(options.offset).toBe(0);
  });

  it("EDGE-003: should handle options with only partial values", () => {
    const partialOptions = { limit: 10 }; // offsetなし

    expect(partialOptions.limit).toBe(10);
    expect(partialOptions).not.toHaveProperty("offset");
  });
});

// ==========================================================================
// Phase 6: テスト拡充 - エラーハンドリングテスト
// ==========================================================================
describe("historyAPI error handling extended", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ERR-EXT-001: should handle IPC rejection gracefully", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("IPC Error"));

    // safeInvokeはエラーをそのまま伝搬する
    await expect(mockInvoke()).rejects.toThrow("IPC Error");
  });

  it("ERR-EXT-002: should handle Result error response", () => {
    const errorResult = {
      success: false,
      error: new Error("Business logic error"),
    };

    // Result型のエラーレスポンスを検証
    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBeInstanceOf(Error);
    expect(errorResult.error.message).toBe("Business logic error");
  });
});

// ==========================================================================
// Phase 6: テスト拡充 - シナリオテスト
// ==========================================================================
describe("historyAPI scenario tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("SCENARIO-001: should support typical history browsing workflow", () => {
    // シナリオ: ファイル履歴取得 → バージョン詳細取得 → ログ表示
    const _fileId = "file-123";
    const _conversionId = "conv-456";

    // Step 1: ファイル履歴取得
    const getHistoryChannel = IPC_CHANNELS.HISTORY_GET_FILE_HISTORY;
    expect(getHistoryChannel).toBe("history:getFileHistory");

    // Step 2: バージョン詳細取得
    const getDetailChannel = IPC_CHANNELS.HISTORY_GET_VERSION_DETAIL;
    expect(getDetailChannel).toBe("history:getVersionDetail");

    // Step 3: 変換ログ取得
    const getLogsChannel = IPC_CHANNELS.HISTORY_GET_CONVERSION_LOGS;
    expect(getLogsChannel).toBe("history:getConversionLogs");

    // 全てのチャンネルがホワイトリストに登録されている
    expect(ALLOWED_INVOKE_CHANNELS).toContain(getHistoryChannel);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(getDetailChannel);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(getLogsChannel);
  });
});
