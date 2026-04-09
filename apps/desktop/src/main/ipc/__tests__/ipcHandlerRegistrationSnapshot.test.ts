/**
 * IPC ハンドラ登録完全性スナップショットテスト
 *
 * UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001
 *
 * `registerRuntimeSkillCreatorHandlers()` が登録する 19 チャネル
 * （public runtime 17 + auxiliary 2）の完全性を CI で固定する。
 *
 * TC-01: 登録チャネル名がスナップショットと一致する
 * TC-02: 重複チャネルが存在しない
 * TC-03: 登録チャネル総数が 19
 * TC-04: 重複登録が注入された場合にアサーションが FAIL する（ネガティブ）
 * TC-05: 想定外チャネル追加でスナップショット差分が生じる（ネガティブ）
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BrowserWindow } from "electron";

// --- vi.hoisted でモック変数を定義 ---
const { mockIpcMainHandle } = vi.hoisted(() => {
  return {
    mockIpcMainHandle: vi.fn(),
  };
});

// --- Electron モック ---
vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
  },
}));

// チャネル名収集ヘルパー（ソート済み配列を返す）
function getRegisteredChannels(): string[] {
  return mockIpcMainHandle.mock.calls.map((args) => args[0] as string).sort();
}

const mockMainWindow = {
  isDestroyed: () => false,
  webContents: {
    send: vi.fn(),
  },
} as unknown as BrowserWindow;

describe("IPC ハンドラ登録完全性", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe("TC-01〜TC-03: registerRuntimeSkillCreatorHandlers の正常系", () => {
    let channels: string[];

    beforeEach(async () => {
      const { registerRuntimeSkillCreatorHandlers } =
        await import("../creatorHandlers");
      registerRuntimeSkillCreatorHandlers(mockMainWindow);
      channels = getRegisteredChannels();
    });

    it("TC-01: 登録チャネル名がスナップショットと一致する", () => {
      expect(channels).toMatchSnapshot();
    });

    it("TC-02: 重複チャネルが存在しない", () => {
      const unique = new Set(channels);
      expect(unique.size).toBe(channels.length);
    });

    it("TC-03: 登録チャネル総数が 19（public runtime 17 + auxiliary 2）", () => {
      expect(channels).toHaveLength(19);
    });
  });

  describe("TC-04〜TC-05: ネガティブテスト（fail path）", () => {
    it("TC-04: 重複登録が注入された場合に重複チャネルが検出される", () => {
      // 同一チャネルを 2 回 handle() するシミュレーション
      mockIpcMainHandle("skill-creator:plan", vi.fn());
      mockIpcMainHandle("skill-creator:plan", vi.fn()); // 重複
      mockIpcMainHandle("skill-creator:execute-plan", vi.fn());

      const channels = getRegisteredChannels();
      const unique = new Set(channels);

      // 重複があれば Set サイズ < 配列長になる
      expect(unique.size).toBeLessThan(channels.length);
    });

    it("TC-05: 想定外チャネルが追加された場合に件数差分が検出できる", async () => {
      const { registerRuntimeSkillCreatorHandlers } =
        await import("../creatorHandlers");

      registerRuntimeSkillCreatorHandlers(mockMainWindow);
      // 想定外チャネルを追加注入
      mockIpcMainHandle("skill-creator:unexpected-channel", vi.fn());

      const channels = getRegisteredChannels();
      // 19 件より多くなる → 件数チェックで検出できる
      expect(channels.length).toBeGreaterThan(19);
    });
  });
});
