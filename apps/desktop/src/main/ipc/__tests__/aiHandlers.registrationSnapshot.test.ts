/**
 * registerAIHandlers チャンネル登録スナップショットテスト
 *
 * TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001
 *
 * REG-SNAP-AI-01: 登録チャンネル一覧がスナップショットと一致する
 * REG-DEDUP-AI-01: 重複チャンネルが存在しない
 * REG-COUNT-AI-01: 登録チャンネル総数が期待値と一致する
 * REG-EDGE-AI-01: 重複チャンネルを追加した場合に検出できる
 * REG-EDGE-AI-03: 各テストで handles が独立している
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

vi.mock("../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
    clearInstance: vi.fn(),
  },
}));

vi.mock("../utils/buildMessages", () => ({
  buildMessages: vi.fn().mockReturnValue([]),
}));

vi.mock("./llmConfigProvider", () => ({
  getSelectedLLMConfig: vi.fn().mockResolvedValue(null),
}));

describe("registerAIHandlers - チャンネル登録スナップショット", () => {
  let handles: string[];

  beforeEach(() => {
    handles = [];
    vi.clearAllMocks();
    vi.resetModules();
    mockIpcMainHandle.mockImplementation((channel: string) => {
      handles.push(channel);
    });
  });

  describe("REG-SNAP-AI-01〜REG-COUNT-AI-01: 正常系", () => {
    beforeEach(async () => {
      const { registerAIHandlers } = await import("../aiHandlers");
      registerAIHandlers();
    });

    it("REG-SNAP-AI-01: 登録チャンネル一覧がスナップショットと一致する", () => {
      expect([...handles].sort()).toMatchSnapshot();
    });

    it("REG-DEDUP-AI-01: 重複チャンネルが存在しない", () => {
      expect(new Set(handles).size).toBe(handles.length);
    });

    it("REG-COUNT-AI-01: 登録チャンネル総数が期待値と一致する", () => {
      expect(handles).toHaveLength(3);
    });
  });

  describe("REG-EDGE-AI-01〜REG-EDGE-AI-03: 境界値・異常系", () => {
    it("REG-EDGE-AI-01: 重複チャンネルが存在する場合に検出できる", () => {
      const duplicateHandles = ["ai:chat", "ai:chat", "ai:check-connection"];
      expect(new Set(duplicateHandles).size).not.toBe(duplicateHandles.length);
      expect(new Set(duplicateHandles).size).toBe(2);
    });

    it("REG-EDGE-AI-03: 各テストで handles が独立している", () => {
      expect(handles).toHaveLength(0);
    });
  });
});
