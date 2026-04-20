/**
 * registerSkillCreatorHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-SKILL-CREATOR-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-SKILL-CREATOR-01: 重複チャンネルが存在しない
 * REG-COUNT-SKILL-CREATOR-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-SKILL-CREATOR-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-SKILL-CREATOR-03: 各テストで handles が独立している
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

describe("registerSkillCreatorHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-SKILL-CREATOR-01〜REG-COUNT-SKILL-CREATOR-01: 正常系", () => {
    beforeEach(async () => {
      const mockMainWindow = {
        webContents: { send: vi.fn() },
        isDestroyed: vi.fn().mockReturnValue(false),
      };
      const mockSkillCreatorService = {
        detectMode: vi.fn().mockResolvedValue("create"),
        createSkill: vi.fn().mockResolvedValue("/mock/skill"),
        executeTasks: vi.fn().mockResolvedValue({ success: true }),
        validateSkill: vi.fn().mockResolvedValue(true),
        validateWithSchema: vi.fn().mockResolvedValue(true),
        improveSkill: vi.fn().mockResolvedValue({ success: true }),
        forkSkill: vi.fn().mockResolvedValue("/mock/forked"),
        shareSkill: vi.fn().mockResolvedValue("exported"),
        scheduleSkill: vi.fn().mockResolvedValue(undefined),
        debugSkill: vi.fn().mockResolvedValue({ success: true }),
        generateDocs: vi.fn().mockResolvedValue("docs"),
        getStats: vi.fn().mockResolvedValue({}),
        cancelCurrentOperation: vi.fn(),
      };
      const { registerSkillCreatorHandlers } =
        await import("../skillCreatorHandlers");
      registerSkillCreatorHandlers(
        mockMainWindow as any,
        mockSkillCreatorService as any,
      );
    });

    it("REG-SNAP-SKILL-CREATOR-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-SKILL-CREATOR-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-SKILL-CREATOR-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(32);
    });
  });

  describe("REG-EDGE-SKILL-CREATOR-01〜REG-EDGE-SKILL-CREATOR-03: 境界値・異常系", () => {
    it("REG-EDGE-SKILL-CREATOR-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "skill-creator:create",
        "skill-creator:create",
        "skill-creator:validate",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-SKILL-CREATOR-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
