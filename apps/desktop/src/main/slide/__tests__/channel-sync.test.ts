/**
 * Preload <-> Main チャネル同期テスト
 * Main の SLIDE_INVOKE_CHANNELS / SLIDE_PUSH_CHANNELS と
 * Preload の IPC_CHANNELS が一致することを検証 (P44対策)
 * @module main/slide/__tests__/channel-sync.test
 */

import { vi, describe, it, expect } from "vitest";

// ipc-handlers.ts の依存チェーン (skill-executor -> agent-client -> electron-store) をモック
vi.mock("electron", () => ({
  ipcMain: { handle: vi.fn(), removeHandler: vi.fn() },
  BrowserWindow: vi.fn(),
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(false),
  },
}));

vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn(),
}));

vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
}));

vi.mock("../../ipc/sanitizeErrorMessage", () => ({
  sanitizeErrorMessage: vi.fn((_e: unknown, f: string) => f),
}));

import { SLIDE_INVOKE_CHANNELS, SLIDE_PUSH_CHANNELS } from "../ipc-handlers";
import { IPC_CHANNELS } from "../../../preload/channels";

describe("Preload <-> Main チャネル同期 (P44)", () => {
  describe("invoke channels should match", () => {
    it("EXECUTE_PHASE should match", () => {
      expect(SLIDE_INVOKE_CHANNELS.EXECUTE_PHASE).toBe(
        IPC_CHANNELS.SLIDE_EXECUTE_PHASE,
      );
    });

    it("WATCH_START should match", () => {
      expect(SLIDE_INVOKE_CHANNELS.WATCH_START).toBe(
        IPC_CHANNELS.SLIDE_WATCH_START,
      );
    });

    it("WATCH_STOP should match", () => {
      expect(SLIDE_INVOKE_CHANNELS.WATCH_STOP).toBe(
        IPC_CHANNELS.SLIDE_WATCH_STOP,
      );
    });

    it("SYNC_STATUS should match", () => {
      expect(SLIDE_INVOKE_CHANNELS.SYNC_STATUS).toBe(
        IPC_CHANNELS.SLIDE_SYNC_STATUS,
      );
    });

    it("REVERSE_SYNC should match", () => {
      expect(SLIDE_INVOKE_CHANNELS.REVERSE_SYNC).toBe(
        IPC_CHANNELS.SLIDE_REVERSE_SYNC,
      );
    });

    it("CANCEL should match", () => {
      expect(SLIDE_INVOKE_CHANNELS.CANCEL).toBe(IPC_CHANNELS.SLIDE_CANCEL);
    });

    it("CAPABILITY_GET should match", () => {
      expect(SLIDE_INVOKE_CHANNELS.CAPABILITY_GET).toBe(
        IPC_CHANNELS.SLIDE_CAPABILITY_GET,
      );
    });
  });

  describe("push channels should match", () => {
    it("SYNC_STATUS_CHANGED should match", () => {
      expect(SLIDE_PUSH_CHANNELS.SYNC_STATUS_CHANGED).toBe(
        IPC_CHANNELS.SLIDE_SYNC_STATUS_CHANGED,
      );
    });

    it("SYNC_PROGRESS should match", () => {
      expect(SLIDE_PUSH_CHANNELS.SYNC_PROGRESS).toBe(
        IPC_CHANNELS.SLIDE_SYNC_PROGRESS,
      );
    });

    it("SYNC_ERROR should match", () => {
      expect(SLIDE_PUSH_CHANNELS.SYNC_ERROR).toBe(
        IPC_CHANNELS.SLIDE_SYNC_ERROR,
      );
    });

    it("EXECUTION_PROGRESS should match", () => {
      expect(SLIDE_PUSH_CHANNELS.EXECUTION_PROGRESS).toBe(
        IPC_CHANNELS.SLIDE_EXECUTION_PROGRESS,
      );
    });

    it("STRUCTURE_CHANGED should match", () => {
      expect(SLIDE_PUSH_CHANNELS.STRUCTURE_CHANGED).toBe(
        IPC_CHANNELS.SLIDE_STRUCTURE_CHANGED,
      );
    });

    it("WATCH_STATUS should match", () => {
      expect(SLIDE_PUSH_CHANNELS.WATCH_STATUS).toBe(
        IPC_CHANNELS.SLIDE_WATCH_STATUS,
      );
    });
  });

  // UT-SLIDE-IMPL-001 T4-1 ~ T4-3: SLIDE_CAPABILITY_GET チャネル検証
  describe("SLIDE_CAPABILITY_GET channel (T4-1 ~ T4-3)", () => {
    it("T4-1: SLIDE_CAPABILITY_GET should be defined in IPC_CHANNELS", () => {
      expect(IPC_CHANNELS.SLIDE_CAPABILITY_GET).toBeDefined();
    });

    it("T4-2: SLIDE_CAPABILITY_GET should be in ALLOWED_INVOKE_CHANNELS", async () => {
      const { ALLOWED_INVOKE_CHANNELS } =
        await import("../../../preload/channels");
      expect(ALLOWED_INVOKE_CHANNELS).toContain(
        IPC_CHANNELS.SLIDE_CAPABILITY_GET,
      );
    });

    it("T4-3: channel name should be slide:capability:get", () => {
      expect(IPC_CHANNELS.SLIDE_CAPABILITY_GET).toBe("slide:capability:get");
    });
  });

  describe("legacy channel names", () => {
    it("should NOT contain legacy names in Preload IPC_CHANNELS", () => {
      const allValues = Object.values(IPC_CHANNELS);
      // フラット形式なので string 値のみフィルタ
      const stringValues = allValues.filter(
        (v): v is string => typeof v === "string",
      );
      expect(stringValues).not.toContain("slide:startWatching");
      expect(stringValues).not.toContain("slide:stopWatching");
      expect(stringValues).not.toContain("slide:getSyncStatus");
      expect(stringValues).not.toContain("slide:manualSync");
      expect(stringValues).not.toContain("slide:cancelExecution");
    });
  });
});
