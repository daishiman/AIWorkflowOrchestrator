/**
 * registerUserSettingsHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-USERSETTINGS-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-USERSETTINGS-01: 重複チャンネルが存在しない
 * REG-COUNT-USERSETTINGS-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-USERSETTINGS-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-USERSETTINGS-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockIpcMainHandle, mockIpcMainOn } = vi.hoisted(() => ({
  mockIpcMainHandle: vi.fn(),
  mockIpcMainOn: vi.fn().mockReturnValue({ removeAllListeners: vi.fn() }),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: vi.fn(),
    on: mockIpcMainOn,
    removeAllListeners: vi.fn(),
  },
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(true),
    encryptString: vi.fn().mockReturnValue(Buffer.from("encrypted")),
    decryptString: vi.fn().mockReturnValue("decrypted"),
  },
}));

vi.mock("electron-store", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockReturnValue(undefined),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn().mockReturnValue(false),
      clear: vi.fn(),
    })),
  };
});

describe("registerUserSettingsHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-USERSETTINGS-01〜REG-COUNT-USERSETTINGS-01: 正常系", () => {
    beforeEach(async () => {
      const { registerUserSettingsHandlers } = await import("../storeHandlers");
      registerUserSettingsHandlers();
    });

    it("REG-SNAP-USERSETTINGS-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-USERSETTINGS-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-USERSETTINGS-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(2);
    });
  });

  describe("REG-EDGE-USERSETTINGS-01〜REG-EDGE-USERSETTINGS-03: 境界値・異常系", () => {
    it("REG-EDGE-USERSETTINGS-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "userSettings:get",
        "userSettings:get",
        "userSettings:set",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-USERSETTINGS-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
