/**
 * registerSafetyGateHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-SAFETY-GATE-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-SAFETY-GATE-01: 重複チャンネルが存在しない
 * REG-COUNT-SAFETY-GATE-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-SAFETY-GATE-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-SAFETY-GATE-03: 各テストで handles が独立している
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
  BrowserWindow: vi.fn().mockImplementation(() => ({
    webContents: { send: vi.fn() },
    isDestroyed: vi.fn().mockReturnValue(false),
  })),
}));

describe("registerSafetyGateHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-SAFETY-GATE-01〜REG-COUNT-SAFETY-GATE-01: 正常系", () => {
    beforeEach(async () => {
      const mockMainWindow = {
        webContents: { send: vi.fn() },
        isDestroyed: vi.fn().mockReturnValue(false),
      };
      const mockSafetyGate = {
        evaluate: vi.fn().mockResolvedValue({ safe: true }),
      };
      const { registerSafetyGateHandlers } =
        await import("../safetyGateHandlers");
      registerSafetyGateHandlers(mockMainWindow as any, mockSafetyGate as any);
    });

    it("REG-SNAP-SAFETY-GATE-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-SAFETY-GATE-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-SAFETY-GATE-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(1);
    });
  });

  describe("REG-EDGE-SAFETY-GATE-01〜REG-EDGE-SAFETY-GATE-03: 境界値・異常系", () => {
    it("REG-EDGE-SAFETY-GATE-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "skill:evaluate-safety",
        "skill:evaluate-safety",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(1);
    });

    it("REG-EDGE-SAFETY-GATE-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
