import { afterEach, describe, expect, it, vi } from "vitest";
import { ipcMain, type IpcMainInvokeEvent } from "electron";
import { AgentHandler } from "../agent-handler";
import {
  AgentErrorCode,
  AgentSessionError,
  type AgentStatus,
  type SDKMessage,
} from "@repo/shared/agent";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
}));

interface AgentClientDouble {
  initialize: ReturnType<typeof vi.fn>;
  getStatus: ReturnType<typeof vi.fn>;
  query: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
  isQueryRunning: ReturnType<typeof vi.fn>;
}

interface SessionManagerDouble {
  createSession: ReturnType<typeof vi.fn>;
  resumeSession: ReturnType<typeof vi.fn>;
  destroySession: ReturnType<typeof vi.fn>;
}

let activeHandler: AgentHandler | null = null;

function buildAgentClientDouble(
  overrides: Partial<AgentClientDouble> = {},
): AgentClientDouble {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
    getStatus: vi.fn().mockReturnValue({
      status: "initialized",
      timestamp: Date.now(),
    } satisfies AgentStatus),
    query: vi.fn().mockResolvedValue(undefined),
    abort: vi.fn(),
    isQueryRunning: vi.fn().mockReturnValue(false),
    ...overrides,
  };
}

function buildSessionManagerDouble(
  overrides: Partial<SessionManagerDouble> = {},
): SessionManagerDouble {
  return {
    createSession: vi.fn().mockReturnValue("test-session-id"),
    resumeSession: vi.fn(),
    destroySession: vi.fn(),
    ...overrides,
  };
}

async function setup(
  options: {
    agentClient?: Partial<AgentClientDouble>;
    sessionManager?: Partial<SessionManagerDouble>;
  } = {},
) {
  const agentClient = buildAgentClientDouble(options.agentClient);
  const sessionManager = buildSessionManagerDouble(options.sessionManager);

  const handler = new AgentHandler({ apiKey: "test-api-key" });
  (handler as unknown as { agentClient: AgentClientDouble }).agentClient =
    agentClient;
  (
    handler as unknown as { sessionManager: SessionManagerDouble }
  ).sessionManager = sessionManager;

  await handler.initialize();
  activeHandler = handler;

  const mockEvent = {
    sender: { send: vi.fn() },
  } as unknown as IpcMainInvokeEvent;

  return { handler, agentClient, sessionManager, mockEvent };
}

afterEach(() => {
  if (activeHandler) {
    activeHandler.dispose();
    activeHandler = null;
  }
  vi.clearAllMocks();
});

describe("AgentHandler", () => {
  it("initialize時に必要なIPCハンドラを登録する", async () => {
    const { agentClient } = await setup();

    expect(agentClient.initialize).toHaveBeenCalledTimes(1);
    expect(ipcMain.handle).toHaveBeenCalledWith(
      "agent:query",
      expect.any(Function),
    );
    expect(ipcMain.handle).toHaveBeenCalledWith(
      "agent:get-status",
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

  it("dispose時にIPCハンドラを解除する", async () => {
    const { handler } = await setup();

    handler.dispose();

    expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:query");
    expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:get-status");
    expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:createSession");
    expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:resumeSession");
    expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:destroySession");
    expect(ipcMain.removeHandler).toHaveBeenCalledWith("agent:abort");
  });

  it("有効なqueryリクエストを処理してrendererへ転送する", async () => {
    const message: SDKMessage = {
      id: "msg-1",
      type: "text",
      content: "Hello!",
      timestamp: Date.now(),
      isComplete: false,
    };
    const { handler, mockEvent, agentClient } = await setup({
      agentClient: {
        query: vi.fn().mockImplementation(async (_prompt, onMessage) => {
          onMessage(message);
        }),
      },
    });

    await handler.handleQuery(mockEvent, { prompt: "Hello" });

    expect(agentClient.query).toHaveBeenCalledWith(
      "Hello",
      expect.any(Function),
      undefined,
    );
    expect(mockEvent.sender.send).toHaveBeenCalledWith(
      "agent:message",
      message,
    );
  });

  it("不正なqueryリクエストはVALIDATION_ERRORを返す", async () => {
    const { handler, mockEvent } = await setup();

    await expect(
      handler.handleQuery(mockEvent, { prompt: "" }),
    ).rejects.toMatchObject({
      code: AgentErrorCode.VALIDATION_ERROR,
    });
    await expect(
      handler.handleQuery(mockEvent, { prompt: "a".repeat(10001) }),
    ).rejects.toMatchObject({
      code: AgentErrorCode.VALIDATION_ERROR,
    });
    await expect(
      handler.handleQuery(mockEvent, {
        prompt: "Hello",
        options: { timeout: 0 },
      }),
    ).rejects.toMatchObject({
      code: AgentErrorCode.VALIDATION_ERROR,
    });
  });

  it("query実行中フラグが立っている場合はabortしてから新規queryを実行する", async () => {
    const { handler, mockEvent, agentClient } = await setup({
      agentClient: {
        isQueryRunning: vi.fn().mockReturnValue(true),
      },
    });

    await handler.handleQuery(mockEvent, { prompt: "Second" });

    expect(agentClient.abort).toHaveBeenCalledTimes(1);
    expect(agentClient.query).toHaveBeenCalledTimes(1);
  });

  it("handleAbortはAgentClient.abortを呼び出す", async () => {
    const { handler, agentClient } = await setup();

    handler.handleAbort();

    expect(agentClient.abort).toHaveBeenCalledTimes(1);
  });

  it("handleGetStatusはAgentClientの状態を返す", async () => {
    const status: AgentStatus = {
      status: "not_initialized",
      timestamp: Date.now(),
    };
    const { handler } = await setup({
      agentClient: {
        getStatus: vi.fn().mockReturnValue(status),
      },
    });

    await expect(handler.handleGetStatus()).resolves.toEqual(status);
  });

  it("handleCreateSessionはSessionManagerの戻り値を返す", async () => {
    const { handler } = await setup({
      sessionManager: {
        createSession: vi.fn().mockReturnValue("session-from-double"),
      },
    });

    await expect(handler.handleCreateSession()).resolves.toEqual({
      sessionId: "session-from-double",
    });
  });

  it("handleResumeSessionは正常系でsessionManager.resumeSessionを呼ぶ", async () => {
    const sessionId = "550e8400-e29b-41d4-a716-446655440000";
    const { handler, sessionManager } = await setup();

    await expect(
      handler.handleResumeSession({ sessionId }),
    ).resolves.toBeUndefined();
    expect(sessionManager.resumeSession).toHaveBeenCalledWith(sessionId);
  });

  it("handleResumeSessionは不正なsessionIdでVALIDATION_ERRORを返す", async () => {
    const { handler } = await setup();

    await expect(
      handler.handleResumeSession({ sessionId: "invalid-uuid" }),
    ).rejects.toMatchObject({
      code: AgentErrorCode.VALIDATION_ERROR,
    });
  });

  it("handleResumeSessionはSESSION_NOT_FOUNDを透過する", async () => {
    const sessionId = "550e8400-e29b-41d4-a716-446655440000";
    const { handler } = await setup({
      sessionManager: {
        resumeSession: vi.fn().mockImplementation(() => {
          throw new AgentSessionError(
            "Session not found",
            AgentErrorCode.SESSION_NOT_FOUND,
          );
        }),
      },
    });

    await expect(
      handler.handleResumeSession({ sessionId }),
    ).rejects.toMatchObject({
      code: AgentErrorCode.SESSION_NOT_FOUND,
    });
  });

  it("handleDestroySessionは正常系でsessionManager.destroySessionを呼ぶ", async () => {
    const sessionId = "550e8400-e29b-41d4-a716-446655440000";
    const { handler, sessionManager } = await setup();

    await expect(
      handler.handleDestroySession({ sessionId }),
    ).resolves.toBeUndefined();
    expect(sessionManager.destroySession).toHaveBeenCalledWith(sessionId);
  });

  it("handleDestroySessionは不正なsessionIdでVALIDATION_ERRORを返す", async () => {
    const { handler } = await setup();

    await expect(
      handler.handleDestroySession({ sessionId: "invalid-uuid" }),
    ).rejects.toMatchObject({
      code: AgentErrorCode.VALIDATION_ERROR,
    });
  });

  it("エラーオブジェクトはcode/messageを持つ", async () => {
    const { handler, mockEvent } = await setup();

    try {
      await handler.handleQuery(mockEvent, { prompt: "" });
      expect.fail("Should throw validation error");
    } catch (error) {
      expect(error).toHaveProperty("code", AgentErrorCode.VALIDATION_ERROR);
      expect(error).toHaveProperty("message");
    }
  });
});
