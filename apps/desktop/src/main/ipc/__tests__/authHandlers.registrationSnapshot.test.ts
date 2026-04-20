/**
 * registerAuthHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-AUTH-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-AUTH-01: 重複チャンネルが存在しない
 * REG-COUNT-AUTH-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-AUTH-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-AUTH-03: 各テストで handles が独立している
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
  net: {
    isOnline: vi.fn().mockReturnValue(true),
  },
  BrowserWindow: vi.fn(),
}));

vi.mock("@repo/shared/infrastructure/auth", () => ({
  toAuthUser: vi.fn().mockReturnValue(null),
  parseAuthCallback: vi.fn().mockReturnValue(null),
}));

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  withValidation: vi
    .fn()
    .mockImplementation((_channel: string, handler: unknown) => handler),
}));

vi.mock("../../services/tokenRefreshScheduler", () => ({
  TokenRefreshScheduler: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
  })),
}));

vi.mock("../../auth/authFlowOrchestrator", () => ({
  AuthFlowOrchestrator: vi.fn().mockImplementation(() => ({
    startOAuthFlow: vi.fn(),
    handleCallback: vi.fn(),
  })),
}));

const mockMainWindow = {
  isDestroyed: () => false,
  webContents: { send: vi.fn() },
} as unknown as BrowserWindow;

const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
  },
} as unknown as import("@supabase/supabase-js").SupabaseClient;

const mockSecureStorage = {
  storeRefreshToken: vi.fn(),
  getRefreshToken: vi.fn(),
  clearTokens: vi.fn(),
};

describe("registerAuthHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-AUTH-01〜REG-COUNT-AUTH-01: 正常系", () => {
    beforeEach(async () => {
      const { registerAuthHandlers } = await import("../authHandlers");
      registerAuthHandlers(mockMainWindow, mockSupabase, mockSecureStorage);
    });

    it("REG-SNAP-AUTH-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-AUTH-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-AUTH-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(7);
    });
  });

  describe("REG-EDGE-AUTH-01〜REG-EDGE-AUTH-03: 境界値・異常系", () => {
    it("REG-EDGE-AUTH-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["auth:login", "auth:login", "auth:logout"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-AUTH-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
