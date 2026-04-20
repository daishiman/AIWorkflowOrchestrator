/**
 * registerStoreHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-STORE-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-STORE-01: 重複チャンネルが存在しない
 * REG-COUNT-STORE-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-STORE-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-STORE-03: 各テストで handles が独立している
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

describe("registerStoreHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-STORE-01〜REG-COUNT-STORE-01: 正常系", () => {
    beforeEach(async () => {
      const { registerStoreHandlers } = await import("../storeHandlers");
      registerStoreHandlers();
    });

    it("REG-SNAP-STORE-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-STORE-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-STORE-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(4);
    });
  });

  describe("REG-EDGE-STORE-01〜REG-EDGE-STORE-03: 境界値・異常系", () => {
    it("REG-EDGE-STORE-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["store:get", "store:get", "store:set"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-STORE-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
