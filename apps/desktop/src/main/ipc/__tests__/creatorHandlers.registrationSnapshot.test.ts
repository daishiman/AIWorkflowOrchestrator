/**
 * creatorHandlers チャンネル登録スナップショットテスト
 *
 * UT-IPC-HANDLER-CI-001
 *
 * `registerRuntimeSkillCreatorHandlers()` が登録するチャンネル一覧を
 * vi.spyOn パターンで固定し、重複・欠損を CI で自動検出する。
 *
 * REG-SNAP-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-01: 重複チャンネルが存在しない
 * REG-COUNT-01: 登録チャンネル総数が 19
 * REG-EDGE-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-02: ipcMain.on() は handle spy に含まれない
 * REG-EDGE-03: 各テストで handles が独立している
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow } from "electron";

// --- vi.hoisted でモック変数を定義 ---
const { mockIpcMainHandle, mockIpcMainOn } = vi.hoisted(() => ({
  mockIpcMainHandle: vi.fn(),
  mockIpcMainOn: vi.fn().mockReturnValue({ removeAllListeners: vi.fn() }),
}));

// --- Electron モック ---
vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: vi.fn(),
    on: mockIpcMainOn,
    removeAllListeners: vi.fn(),
  },
}));

const mockMainWindow = {
  isDestroyed: () => false,
  webContents: { send: vi.fn() },
} as unknown as BrowserWindow;

describe("registerRuntimeSkillCreatorHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    // vi.spyOn パターン: mockIpcMainHandle の呼び出しをキャプチャ
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-01〜REG-COUNT-01: 正常系", () => {
    beforeEach(async () => {
      const { registerRuntimeSkillCreatorHandlers } =
        await import("../creatorHandlers");
      registerRuntimeSkillCreatorHandlers(mockMainWindow);
    });

    it("REG-SNAP-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      // ソートしてスナップショットに固定（登録順に依存しない）
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-01: 重複チャンネルが存在しない", () => {
      // Set のサイズ === 配列長 → 重複なし
      // 失敗時: "Expected N but received M" where M < N (重複分だけ Set が小さくなる)
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-01: 登録チャンネル総数が 19（public runtime 17 + auxiliary 2）", () => {
      expect(handles).toHaveLength(19);
    });
  });

  describe("REG-EDGE-01〜REG-EDGE-03: 境界値・異常系", () => {
    it("REG-EDGE-01: 重複チャンネルが存在する場合に検出できる", () => {
      // 意図的な重複リストで検出能力を証明する
      const duplicateHandles = [
        "skill-creator:get-adapter-status",
        "skill-creator:get-adapter-status", // 意図的な重複
        "skill-creator:plan",
      ];

      // Set サイズ < 配列長 → 重複あり
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
      expect(duplicateHandles.length).toBe(3);
    });

    it("REG-EDGE-02: ipcMain.on() は handle spy に含まれない", async () => {
      const onChannels: string[] = [];
      mockIpcMainOn.mockImplementation((channel: string) => {
        onChannels.push(channel);
        return { removeAllListeners: vi.fn() };
      });

      const { registerRuntimeSkillCreatorHandlers } =
        await import("../creatorHandlers");
      registerRuntimeSkillCreatorHandlers(mockMainWindow);

      // handle チャンネルと on チャンネルに重複がないことを確認
      const overlap = handles.filter((ch) => onChannels.includes(ch));
      expect(overlap).toHaveLength(0);
    });

    it("REG-EDGE-03: 各テストで handles が独立している（beforeEach リセット確認）", () => {
      // beforeEach で handles = [] に初期化されているため
      // このテスト開始時点では handles は空のはず
      expect(handles).toHaveLength(0);
    });
  });
});
