/**
 * registerFsHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-FS-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-FS-01: 重複チャンネルが存在しない
 * REG-COUNT-FS-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-FS-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-FS-03: 各テストで handles が独立している
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
}));

vi.mock("fs/promises", () => ({
  readdir: vi.fn().mockResolvedValue([]),
  readFile: vi.fn().mockResolvedValue(""),
  writeFile: vi.fn().mockResolvedValue(undefined),
  rename: vi.fn().mockResolvedValue(undefined),
  stat: vi.fn().mockResolvedValue({ size: 0, mtime: new Date() }),
  access: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../services/watcher", () => ({
  FileWatcher: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    start: vi.fn(),
    stop: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe("registerFsHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-FS-01〜REG-COUNT-FS-01: 正常系", () => {
    beforeEach(async () => {
      const { registerFsHandlers } = await import("../fileHandlers");
      registerFsHandlers();
    });

    it("REG-SNAP-FS-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-FS-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-FS-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(2);
    });
  });

  describe("REG-EDGE-FS-01〜REG-EDGE-FS-03: 境界値・異常系", () => {
    it("REG-EDGE-FS-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["fs:writeFile", "fs:writeFile"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(1);
    });

    it("REG-EDGE-FS-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
