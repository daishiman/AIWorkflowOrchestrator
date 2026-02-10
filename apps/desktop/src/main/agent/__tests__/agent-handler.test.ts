/**
 * Agent IPC Handler Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for IPC communication between Main and Renderer processes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AgentHandler } from "../agent-handler";
import type { IpcMainInvokeEvent } from "electron";
import {
  AgentErrorCode,
  AgentValidationError,
  AgentSessionError,
} from "@repo/shared/agent";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    getAllWindows: vi.fn(() => [
      {
        webContents: {
          send: vi.fn(),
        },
      },
    ]),
  },
}));

// Mock AgentClient and SessionManager via barrel export
const mockAgentClient = {
  initialize: vi.fn().mockResolvedValue(undefined),
  getStatus: vi.fn().mockReturnValue({
    status: "initialized",
    timestamp: Date.now(),
  }),
  query: vi.fn().mockResolvedValue(undefined),
  abort: vi.fn(),
  isQueryRunning: vi.fn().mockReturnValue(false),
};

const mockSessionManager = {
  createSession: vi.fn().mockReturnValue("test-session-id"),
  resumeSession: vi.fn(),
  destroySession: vi.fn(),
  getSession: vi.fn(),
};

vi.mock("@repo/shared/agent", async () => {
  const actual = await vi.importActual("@repo/shared/agent");
  return {
    ...actual,
    AgentClient: vi.fn().mockImplementation(() => mockAgentClient),
    SessionManager: vi.fn().mockImplementation(() => mockSessionManager),
  };
});

describe("AgentHandler", () => {
  let handler: AgentHandler;
  let mockEvent: IpcMainInvokeEvent;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-setup mock return values after clearAllMocks
    mockAgentClient.initialize.mockResolvedValue(undefined);
    mockAgentClient.getStatus.mockReturnValue({
      status: "initialized",
      timestamp: Date.now(),
    });
    mockAgentClient.query.mockResolvedValue(undefined);
    mockAgentClient.isQueryRunning.mockReturnValue(false);
    mockSessionManager.createSession.mockReturnValue("test-session-id");

    // Re-setup AgentClient and SessionManager mock implementations
    const { AgentClient, SessionManager } = await import("@repo/shared/agent");
    vi.mocked(AgentClient).mockImplementation(() => mockAgentClient as any);
    vi.mocked(SessionManager).mockImplementation(
      () => mockSessionManager as any,
    );

    handler = new AgentHandler({
      apiKey: "test-api-key",
    });

    await handler.initialize();

    mockEvent = {
      sender: {
        send: vi.fn(),
      },
    } as unknown as IpcMainInvokeEvent;
  });

  afterEach(() => {
    handler.dispose();
  });

  describe("initialization", () => {
    it("should register all IPC handlers on initialize", async () => {
      const { ipcMain } = await import("electron");

      expect(ipcMain.handle).toHaveBeenCalledWith(
        "agent:query",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "agent:getStatus",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "agent:createSession",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "agent:resumeSession",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "agent:destroySession",
        expect.any(Function),
      );
      expect(ipcMain.handle).toHaveBeenCalledWith(
        "agent:abort",
        expect.any(Function),
      );
    });

    it("should remove handlers on dispose", async () => {
      const { ipcMain } = await import("electron");

      handler.dispose();

      expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:query");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:getStatus");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:createSession");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:resumeSession");
      expect(ipcMain.removeHandler).toHaveBeenCalledWith(
        "agent:destroySession",
      );
      expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:abort");
    });
  });

  describe("agent:query handler", () => {
    it("should handle valid query request", async () => {
      const request = {
        prompt: "Hello, Claude!",
        options: {
          timeout: 30000,
        },
      };

      await expect(
        handler.handleQuery(mockEvent, request),
      ).resolves.not.toThrow();
    });

    it("should reject empty prompt with validation error", async () => {
      const request = {
        prompt: "",
      };

      await expect(handler.handleQuery(mockEvent, request)).rejects.toThrow(
        AgentValidationError,
      );
    });

    it("should reject prompt exceeding maximum length", async () => {
      const request = {
        prompt: "a".repeat(10001),
      };

      await expect(handler.handleQuery(mockEvent, request)).rejects.toThrow(
        AgentValidationError,
      );
    });

    it("should reject invalid timeout value", async () => {
      const request = {
        prompt: "Hello",
        options: {
          timeout: 0,
        },
      };

      await expect(handler.handleQuery(mockEvent, request)).rejects.toThrow(
        AgentValidationError,
      );
    });

    it("should send messages to renderer via IPC", async () => {
      const { AgentClient } = await import("@repo/shared/agent");

      vi.mocked(AgentClient).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            getStatus: vi.fn().mockReturnValue({
              status: "initialized",
              timestamp: Date.now(),
            }),
            query: vi.fn().mockImplementation((_prompt, onMessage) => {
              onMessage({
                id: "msg-1",
                type: "text",
                content: "Hello!",
                timestamp: Date.now(),
                isComplete: false,
              });
              return Promise.resolve();
            }),
            abort: vi.fn(),
            isQueryRunning: vi.fn().mockReturnValue(false),
          }) as unknown as InstanceType<typeof AgentClient>,
      );

      // Re-initialize handler with new mock
      handler = new AgentHandler({ apiKey: "test-api-key" });
      await handler.initialize();

      await handler.handleQuery(mockEvent, { prompt: "Hello" });

      expect(mockEvent.sender.send).toHaveBeenCalledWith(
        "agent:message",
        expect.objectContaining({
          type: "text",
          content: "Hello!",
        }),
      );
    });
  });

  describe("agent:abort handler", () => {
    it("should call abort on AgentClient", async () => {
      const { AgentClient } = await import("@repo/shared/agent");
      const mockAbort = vi.fn();

      vi.mocked(AgentClient).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            getStatus: vi.fn(),
            query: vi.fn(),
            abort: mockAbort,
            isQueryRunning: vi.fn().mockReturnValue(false),
          }) as unknown as InstanceType<typeof AgentClient>,
      );

      handler = new AgentHandler({ apiKey: "test-api-key" });
      await handler.initialize();

      handler.handleAbort();

      expect(mockAbort).toHaveBeenCalled();
    });

    // TC-E-01: dispose後にabortが呼ばれた場合
    it("should handle abort gracefully after dispose", async () => {
      const { AgentClient } = await import("@repo/shared/agent");
      const mockAbort = vi.fn();

      vi.mocked(AgentClient).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            getStatus: vi.fn(),
            query: vi.fn(),
            abort: mockAbort,
            isQueryRunning: vi.fn().mockReturnValue(false),
          }) as unknown as InstanceType<typeof AgentClient>,
      );

      handler = new AgentHandler({ apiKey: "test-api-key" });
      await handler.initialize();

      // disposeを呼び出す
      handler.dispose();

      // dispose後にabortを呼び出しても例外が発生しないことを確認
      expect(() => handler.handleAbort()).not.toThrow();
      // AgentClientのabortは呼ばれる（現在の実装では disposed チェックなし）
      expect(mockAbort).toHaveBeenCalled();
    });

    // TC-E-02: 複数回連続でabortが呼ばれた場合
    it("should handle multiple consecutive abort calls", async () => {
      const { AgentClient } = await import("@repo/shared/agent");
      const mockAbort = vi.fn();

      vi.mocked(AgentClient).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            getStatus: vi.fn(),
            query: vi.fn(),
            abort: mockAbort,
            isQueryRunning: vi.fn().mockReturnValue(true),
          }) as unknown as InstanceType<typeof AgentClient>,
      );

      handler = new AgentHandler({ apiKey: "test-api-key" });
      await handler.initialize();

      // 複数回連続でabortを呼び出す
      handler.handleAbort();
      handler.handleAbort();
      handler.handleAbort();

      // 3回呼び出されることを確認
      expect(mockAbort).toHaveBeenCalledTimes(3);
    });

    // TC-E-03: クエリ実行中でない状態でabortが呼ばれた場合
    it("should handle abort when no query is running", async () => {
      const { AgentClient } = await import("@repo/shared/agent");
      const mockAbort = vi.fn();
      const mockIsQueryRunning = vi.fn().mockReturnValue(false);

      vi.mocked(AgentClient).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            getStatus: vi.fn(),
            query: vi.fn(),
            abort: mockAbort,
            isQueryRunning: mockIsQueryRunning,
          }) as unknown as InstanceType<typeof AgentClient>,
      );

      handler = new AgentHandler({ apiKey: "test-api-key" });
      await handler.initialize();

      // クエリが実行中でない状態でabortを呼び出す
      expect(() => handler.handleAbort()).not.toThrow();
      // abortは呼ばれる（AgentClient側で実行中かどうかを判断する）
      expect(mockAbort).toHaveBeenCalled();
    });
  });

  describe("agent:getStatus handler", () => {
    it("should return current agent status", async () => {
      const status = await handler.handleGetStatus();

      expect(status).toEqual({
        status: "initialized",
        timestamp: expect.any(Number),
      });
    });

    it("should return error status when not initialized", async () => {
      const { AgentClient } = await import("@repo/shared/agent");

      vi.mocked(AgentClient).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            getStatus: vi.fn().mockReturnValue({
              status: "not_initialized",
              timestamp: Date.now(),
            }),
            query: vi.fn(),
            abort: vi.fn(),
            isQueryRunning: vi.fn().mockReturnValue(false),
          }) as unknown as InstanceType<typeof AgentClient>,
      );

      handler = new AgentHandler({ apiKey: "test-api-key" });
      await handler.initialize();

      const status = await handler.handleGetStatus();

      expect(status.status).toBe("not_initialized");
    });
  });

  describe("agent:createSession handler", () => {
    it("should create and return new session ID", async () => {
      const result = await handler.handleCreateSession();

      expect(result).toEqual({
        sessionId: "test-session-id",
      });
    });
  });

  describe("agent:resumeSession handler", () => {
    it("should resume existing session", async () => {
      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      };

      await expect(handler.handleResumeSession(request)).resolves.not.toThrow();
    });

    it("should reject invalid sessionId format", async () => {
      const request = {
        sessionId: "invalid-uuid",
      };

      await expect(handler.handleResumeSession(request)).rejects.toThrow(
        AgentValidationError,
      );
    });

    it("should throw SESSION_NOT_FOUND for non-existent session", async () => {
      const { SessionManager } = await import("@repo/shared/agent");

      vi.mocked(SessionManager).mockImplementation(
        () =>
          ({
            createSession: vi.fn(),
            resumeSession: vi.fn().mockImplementation(() => {
              throw new AgentSessionError(
                "Session not found",
                AgentErrorCode.SESSION_NOT_FOUND,
              );
            }),
            destroySession: vi.fn(),
            getSession: vi.fn(),
          }) as unknown as InstanceType<typeof SessionManager>,
      );

      handler = new AgentHandler({ apiKey: "test-api-key" });
      await handler.initialize();

      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      };

      await expect(handler.handleResumeSession(request)).rejects.toThrow(
        AgentSessionError,
      );
    });
  });

  describe("agent:destroySession handler", () => {
    it("should destroy existing session", async () => {
      const request = {
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
      };

      await expect(
        handler.handleDestroySession(request),
      ).resolves.not.toThrow();
    });

    it("should reject invalid sessionId format", async () => {
      const request = {
        sessionId: "invalid-uuid",
      };

      await expect(handler.handleDestroySession(request)).rejects.toThrow(
        AgentValidationError,
      );
    });
  });

  describe("error serialization", () => {
    it("should serialize AgentError for IPC transmission", async () => {
      const request = {
        prompt: "",
      };

      try {
        await handler.handleQuery(mockEvent, request);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toHaveProperty("code");
        expect(error).toHaveProperty("message");
      }
    });
  });

  describe("concurrent query handling", () => {
    it("should cancel previous query when new query starts", async () => {
      const { AgentClient } = await import("@repo/shared/agent");
      const mockAbort = vi.fn();

      vi.mocked(AgentClient).mockImplementation(
        () =>
          ({
            initialize: vi.fn().mockResolvedValue(undefined),
            getStatus: vi.fn(),
            query: vi.fn().mockImplementation(() => new Promise(() => {})),
            abort: mockAbort,
            isQueryRunning: vi.fn().mockReturnValue(true),
          }) as unknown as InstanceType<typeof AgentClient>,
      );

      handler = new AgentHandler({ apiKey: "test-api-key" });
      await handler.initialize();

      // Start first query (will hang)
      handler.handleQuery(mockEvent, { prompt: "First" });

      // Start second query
      handler.handleQuery(mockEvent, { prompt: "Second" });

      expect(mockAbort).toHaveBeenCalled();
    });
  });
});
