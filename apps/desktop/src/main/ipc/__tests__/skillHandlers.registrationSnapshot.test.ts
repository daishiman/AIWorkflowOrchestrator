/**
 * registerSkillHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-SKILL-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-SKILL-01: 重複チャンネルが存在しない
 * REG-COUNT-SKILL-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-SKILL-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-SKILL-03: 各テストで handles が独立している
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

vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("electron-store", () => ({
  default: class MockElectronStore {
    private data: Record<string, unknown> = {};
    get store() {
      return this.data;
    }
    get(key: string) {
      return this.data[key];
    }
    set(key: string | Record<string, unknown>, value?: unknown) {
      if (typeof key === "object") {
        Object.assign(this.data, key);
      } else {
        this.data[key] = value;
      }
    }
    clear() {
      this.data = {};
    }
  },
}));

describe("registerSkillHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-SKILL-01〜REG-COUNT-SKILL-01: 正常系", () => {
    beforeEach(async () => {
      const mockMainWindow = {
        webContents: { send: vi.fn() },
        isDestroyed: vi.fn().mockReturnValue(false),
      };
      const mockSkillService = {
        scanAvailableSkills: vi.fn().mockResolvedValue({ skills: [] }),
        getImportedSkills: vi.fn().mockResolvedValue([]),
        importSkills: vi.fn().mockResolvedValue({ success: true, errors: [] }),
        getSkillByName: vi.fn().mockResolvedValue(null),
        getSkillById: vi.fn().mockResolvedValue(null),
        removeSkill: vi.fn().mockResolvedValue({ success: true }),
        updateSkill: vi.fn().mockResolvedValue({ success: true }),
        executeSkill: vi.fn().mockResolvedValue({ success: true }),
        getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills"),
        setSkillExecutor: vi.fn(),
        createSkillFromWizard: vi.fn().mockResolvedValue({ success: true }),
      };
      const { registerSkillHandlers } = await import("../skillHandlers");
      registerSkillHandlers(mockMainWindow as any, mockSkillService as any);
    });

    it("REG-SNAP-SKILL-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-SKILL-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-SKILL-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(17);
    });
  });

  describe("REG-EDGE-SKILL-01〜REG-EDGE-SKILL-03: 境界値・異常系", () => {
    it("REG-EDGE-SKILL-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["skill:list", "skill:list", "skill:execute"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-SKILL-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
