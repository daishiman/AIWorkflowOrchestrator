/**
 * registerApiKeyHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-APIKEY-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-APIKEY-01: 重複チャンネルが存在しない
 * REG-COUNT-APIKEY-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-APIKEY-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-APIKEY-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow } from "electron";

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
  BrowserWindow: vi.fn(),
}));

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi
    .fn()
    .mockImplementation((_channel: string, handler: unknown) => handler),
}));

vi.mock("../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    clearInstance: vi.fn(),
  },
}));

vi.mock("@repo/shared/infrastructure/ai/apiKeyValidator", () => ({
  validateApiKey: vi.fn().mockResolvedValue({ valid: true }),
}));

const mockMainWindow = {
  isDestroyed: () => false,
  webContents: { send: vi.fn() },
} as unknown as BrowserWindow;

const mockApiKeyStorage = {
  save: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  list: vi.fn().mockResolvedValue([]),
};

describe("registerApiKeyHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-APIKEY-01〜REG-COUNT-APIKEY-01: 正常系", () => {
    beforeEach(async () => {
      const { registerApiKeyHandlers } = await import("../apiKeyHandlers");
      registerApiKeyHandlers(
        mockMainWindow,
        mockApiKeyStorage as unknown as import("../infrastructure/apiKeyStorage").ApiKeyStorage,
      );
    });

    it("REG-SNAP-APIKEY-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-APIKEY-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-APIKEY-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(4);
    });
  });

  describe("REG-EDGE-APIKEY-01〜REG-EDGE-APIKEY-03: 境界値・異常系", () => {
    it("REG-EDGE-APIKEY-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["apiKey:save", "apiKey:save", "apiKey:delete"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-APIKEY-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
