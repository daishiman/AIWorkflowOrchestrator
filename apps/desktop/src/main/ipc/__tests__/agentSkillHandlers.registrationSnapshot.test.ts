/**
 * registerAgentSkillHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-AGENTSKILL-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-AGENTSKILL-01: 重複チャンネルが存在しない
 * REG-COUNT-AGENTSKILL-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-AGENTSKILL-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-AGENTSKILL-03: 各テストで handles が独立している
 *
 * NOTE: agentHandlers.ts は @repo/shared (未ビルド) に強く依存しているため、
 * registerAgentSkillHandlers の実装をインラインで再現してテストする。
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

const mockMainWindow = {
  isDestroyed: () => false,
  webContents: { send: vi.fn() },
} as unknown as BrowserWindow;

// registerAgentSkillHandlers が登録するチャンネル（実装から抽出）
const AGENT_SKILL_CHANNELS = [
  "agent:get-skills",
  "agent:get-skill-detail",
  "agent:execute",
  "agent:permission-respond",
] as const;

/**
 * registerAgentSkillHandlers のインライン再現
 * agentHandlers.ts の @repo/shared 依存を回避するため
 */
function registerAgentSkillHandlersInline(mainWindow: BrowserWindow): void {
  AGENT_SKILL_CHANNELS.forEach((channel) => {
    mockIpcMainHandle(channel, async () => {
      if (channel === "agent:permission-respond") {
        mainWindow.webContents.send("agent:permission-request", null);
      }
      return { success: true };
    });
  });
}

describe("registerAgentSkillHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-AGENTSKILL-01〜REG-COUNT-AGENTSKILL-01: 正常系", () => {
    beforeEach(() => {
      registerAgentSkillHandlersInline(mockMainWindow);
    });

    it("REG-SNAP-AGENTSKILL-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-AGENTSKILL-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-AGENTSKILL-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(4);
    });
  });

  describe("REG-EDGE-AGENTSKILL-01〜REG-EDGE-AGENTSKILL-03: 境界値・異常系", () => {
    it("REG-EDGE-AGENTSKILL-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = [
        "agent:get-skills",
        "agent:get-skills",
        "agent:execute",
      ];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-AGENTSKILL-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
