/**
 * registerSkillFileHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-SKILL-FILE-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-SKILL-FILE-01: 重複チャンネルが存在しない
 * REG-COUNT-SKILL-FILE-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-SKILL-FILE-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-SKILL-FILE-03: 各テストで handles が独立している
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

describe("registerSkillFileHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-SKILL-FILE-01〜REG-COUNT-SKILL-FILE-01: 正常系", () => {
    beforeEach(async () => {
      const mockMainWindow = {
        webContents: { send: vi.fn() },
        isDestroyed: vi.fn().mockReturnValue(false),
      };
      const mockSkillFileManager = {
        readFile: vi.fn().mockResolvedValue("content"),
        writeFile: vi.fn().mockResolvedValue(undefined),
        createFile: vi.fn().mockResolvedValue(undefined),
        deleteFile: vi.fn().mockResolvedValue(undefined),
        listBackups: vi.fn().mockResolvedValue([]),
        restoreBackup: vi.fn().mockResolvedValue(undefined),
        getFileTree: vi.fn().mockResolvedValue([]),
      };
      const { registerSkillFileHandlers } =
        await import("../skillFileHandlers");
      registerSkillFileHandlers(
        mockMainWindow as any,
        mockSkillFileManager as any,
      );
    });

    it("REG-SNAP-SKILL-FILE-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-SKILL-FILE-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-SKILL-FILE-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(7);
    });
  });

  describe("REG-EDGE-SKILL-FILE-01〜REG-EDGE-SKILL-FILE-03: 境界値・異常系", () => {
    it("REG-EDGE-SKILL-FILE-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "skill:readFile",
        "skill:readFile",
        "skill:writeFile",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-SKILL-FILE-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
