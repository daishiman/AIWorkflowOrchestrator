/**
 * SkillCreatorIpcBridge テスト
 * TASK-SDK-SC-01: SDK Session Bridge
 *
 * TDD Phase 4 (Red) → Phase 5 (Green)
 * T-06: IPC ハンドラー登録・解除
 * T-10: 多重登録防止
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UserInputAnswer, UserInputQuestion } from "@repo/shared/types";
import { SKILL_CREATOR_SESSION_CHANNELS } from "@repo/shared/ipc/channels";

// ── Electron モック ──────────────────────────────────────

type InvokeEvent = {
  sender: {
    id: number;
  };
};

const mockHandlers = new Map<
  string,
  (event: InvokeEvent, ...args: unknown[]) => Promise<unknown>
>();

const mockIpcMain = {
  handle: vi.fn(
    (
      channel: string,
      handler: (event: InvokeEvent, ...args: unknown[]) => Promise<unknown>,
    ) => {
      mockHandlers.set(channel, handler);
    },
  ),
  removeHandler: vi.fn((channel: string) => {
    mockHandlers.delete(channel);
  }),
};

vi.mock("electron", () => ({
  ipcMain: mockIpcMain,
}));

// ── SdkSession モック ────────────────────────────────────

const mockSessionStartSession = vi.fn().mockResolvedValue(undefined);
const mockSessionSendAnswer = vi.fn();
const mockSessionAbort = vi.fn();
const mockSessionGetState = vi.fn().mockReturnValue({
  sessionId: "test-session",
  status: "running",
  startedAt: new Date(),
  updatedAt: new Date(),
});

class MockSdkSession {
  startSession = mockSessionStartSession;
  sendAnswer = mockSessionSendAnswer;
  abort = mockSessionAbort;
  getState = mockSessionGetState;
}

// ── BrowserWindow モック ─────────────────────────────────

function createMockWindow(isDestroyed = false) {
  return {
    webContents: {
      id: 1001,
      send: vi.fn(),
      isDestroyed: vi.fn().mockReturnValue(isDestroyed),
    },
    once: vi.fn(),
    removeListener: vi.fn(),
  };
}

function makeInvokeEvent(senderId = 1001): InvokeEvent {
  return {
    sender: {
      id: senderId,
    },
  };
}

// ── テスト ──────────────────────────────────────────────

describe("SkillCreatorIpcBridge", () => {
  let SkillCreatorIpcBridge: typeof import("../SkillCreatorIpcBridge").SkillCreatorIpcBridge;
  let mockWindow: ReturnType<typeof createMockWindow>;
  let capturedCallbacks: {
    onQuestion?: (q: UserInputQuestion) => void;
    onComplete?: (r: string) => void;
    onError?: (e: string) => void;
  };

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("../SkillCreatorIpcBridge");
    SkillCreatorIpcBridge = mod.SkillCreatorIpcBridge;

    mockWindow = createMockWindow();
    capturedCallbacks = {};

    vi.clearAllMocks();
    mockHandlers.clear();

    mockSessionStartSession.mockResolvedValue(undefined);
    mockSessionGetState.mockReturnValue({
      sessionId: "test-session",
      status: "running",
      startedAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ────────────────────────────────────────────────────
  // T-06: IPC ハンドラーの登録・解除
  // ────────────────────────────────────────────────────
  describe("T-06: IPC ハンドラーの登録・解除", () => {
    it("should register start-session and answer handlers on register()", () => {
      const factory = vi.fn().mockImplementation(() => new MockSdkSession());
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );

      bridge.register();

      expect(mockWindow.once).toHaveBeenCalledWith(
        "closed",
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
        expect.any(Function),
      );
      expect(mockIpcMain.handle).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.ANSWER,
        expect.any(Function),
      );
    });

    it("should remove all handlers on unregister()", () => {
      const factory = vi.fn().mockImplementation(() => new MockSdkSession());
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );

      bridge.register();
      bridge.unregister();

      expect(mockWindow.removeListener).toHaveBeenCalledWith(
        "closed",
        expect.any(Function),
      );
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      );
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.ANSWER,
      );
    });

    it("should emit question-received to renderer when onQuestion is called", async () => {
      const factory = vi
        .fn()
        .mockImplementation(
          (_id: string, onQuestion: (q: UserInputQuestion) => void) => {
            capturedCallbacks.onQuestion = onQuestion;
            return new MockSdkSession();
          },
        );
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );
      bridge.register();

      const handler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      );
      await handler?.(makeInvokeEvent(), { request: "テスト" });

      const question: UserInputQuestion = {
        toolCallId: "tc-001",
        type: "free_text",
        question: "テスト質問",
      };
      capturedCallbacks.onQuestion?.(question);

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED,
        question,
      );
    });

    it("should emit session-complete to renderer with an object envelope", async () => {
      const factory = vi
        .fn()
        .mockImplementation(
          (_id: string, _onQ: unknown, onComplete: (r: string) => void) => {
            capturedCallbacks.onComplete = onComplete;
            return new MockSdkSession();
          },
        );
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );
      bridge.register();

      const handler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      );
      await handler?.(makeInvokeEvent(), { request: "テスト" });

      capturedCallbacks.onComplete?.("セッション完了");

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.SESSION_COMPLETE,
        { result: "セッション完了" },
      );
    });

    it("should emit session-error to renderer with an object envelope", async () => {
      const factory = vi
        .fn()
        .mockImplementation(
          (
            _id: string,
            _onQ: unknown,
            _onC: unknown,
            onError: (e: string) => void,
          ) => {
            capturedCallbacks.onError = onError;
            return new MockSdkSession();
          },
        );
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );
      bridge.register();

      const handler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      );
      await handler?.(makeInvokeEvent(), { request: "テスト" });

      capturedCallbacks.onError?.("エラーが発生しました");

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.SESSION_ERROR,
        { error: "エラーが発生しました" },
      );
    });

    it("should route answer IPC to currentSession.sendAnswer()", async () => {
      const factory = vi.fn().mockImplementation(() => new MockSdkSession());
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );
      bridge.register();

      mockSessionGetState.mockReturnValueOnce({
        sessionId: "test-session",
        status: "awaiting-input",
        currentQuestion: {
          toolCallId: "tc-001",
          type: "free_text",
          question: "質問",
        },
        startedAt: new Date(),
        updatedAt: new Date(),
      });

      const startHandler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      );
      await startHandler?.(makeInvokeEvent(), { request: "テスト" });

      const answerHandler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.ANSWER,
      );
      const answer: UserInputAnswer = {
        toolCallId: "tc-001",
        value: "回答テキスト",
      };
      await answerHandler?.(makeInvokeEvent(), answer);

      expect(mockSessionSendAnswer).toHaveBeenCalledWith(answer);
    });

    it("should reject answer IPC from a non-active window", async () => {
      const factory = vi.fn().mockImplementation(() => new MockSdkSession());
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );
      bridge.register();

      const answerHandler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.ANSWER,
      );
      await expect(
        answerHandler?.(makeInvokeEvent(9999), {
          toolCallId: "tc-001",
          value: "回答",
        }),
      ).rejects.toThrow("IPC sender does not match");
    });

    it("should not send to renderer when webContents is destroyed", async () => {
      const destroyedWindow = createMockWindow(true);
      const factory = vi
        .fn()
        .mockImplementation(
          (_id: string, onQuestion: (q: UserInputQuestion) => void) => {
            capturedCallbacks.onQuestion = onQuestion;
            return new MockSdkSession();
          },
        );
      const bridge = new SkillCreatorIpcBridge(
        destroyedWindow as never,
        factory as never,
      );
      bridge.register();

      const handler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      );
      await handler?.(makeInvokeEvent(), { request: "テスト" });

      capturedCallbacks.onQuestion?.({
        toolCallId: "tc-001",
        type: "free_text",
        question: "質問",
      });

      expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────
  // T-10: IpcBridge 多重登録防止
  // ────────────────────────────────────────────────────
  describe("T-10: IpcBridge 多重登録防止", () => {
    it("should call unregister internally when register() is called twice", () => {
      const factory = vi.fn().mockImplementation(() => new MockSdkSession());
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );

      bridge.register();
      bridge.register();

      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      );
      expect(mockIpcMain.removeHandler).toHaveBeenCalledWith(
        SKILL_CREATOR_SESSION_CHANNELS.ANSWER,
      );
    });

    it("should work correctly after unregister() and register() cycle", () => {
      const factory = vi.fn().mockImplementation(() => new MockSdkSession());
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );

      bridge.register();
      bridge.unregister();
      bridge.register();

      expect(
        mockHandlers.has(SKILL_CREATOR_SESSION_CHANNELS.START_SESSION),
      ).toBe(true);
      expect(mockHandlers.has(SKILL_CREATOR_SESSION_CHANNELS.ANSWER)).toBe(
        true,
      );
      expect(mockWindow.once).toHaveBeenCalledTimes(2);
    });

    it("should reject a second start-session request while a session is active", async () => {
      const factory = vi.fn().mockImplementation(() => new MockSdkSession());
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );
      bridge.register();

      const handler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.START_SESSION,
      );
      await handler?.(makeInvokeEvent(), { request: "最初の要求" });

      await expect(
        handler?.(makeInvokeEvent(), { request: "二回目の要求" }),
      ).rejects.toThrow("already running");
    });

    it("should reject answer when no active session exists", async () => {
      const factory = vi.fn().mockImplementation(() => new MockSdkSession());
      const bridge = new SkillCreatorIpcBridge(
        mockWindow as never,
        factory as never,
      );
      bridge.register();

      const answerHandler = mockHandlers.get(
        SKILL_CREATOR_SESSION_CHANNELS.ANSWER,
      );
      await expect(
        answerHandler?.(makeInvokeEvent(), {
          toolCallId: "tc-x",
          value: "回答",
        }),
      ).rejects.toThrow("no active session");
    });
  });
});
