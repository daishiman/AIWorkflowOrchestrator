/**
 * SkillCreatorSdkSession テスト
 * TASK-SDK-SC-01: SDK Session Bridge
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { SkillCreatorSdkSession } from "../SkillCreatorSdkSession";
import type { UserInputQuestion } from "@repo/shared/types";

vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn(() => "# SKILL.md content\nname: skill-creator\n"),
  },
}));

vi.mock("fast-glob", () => ({
  default: {
    sync: vi.fn(() => ["agents/test.md", "scripts/detect_mode.js"]),
  },
}));

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn(),
  createSdkMcpServer: vi.fn((options: { name: string }) => ({
    type: "sdk",
    name: options.name,
    instance: {
      close: vi.fn().mockResolvedValue(undefined),
    },
  })),
  tool: vi.fn(
    (
      name: string,
      description: string,
      inputSchema: unknown,
      handler: unknown,
    ) => ({
      name,
      description,
      inputSchema,
      handler,
    }),
  ),
}));

function makeCompletedStream(messages: unknown[] = []): AsyncIterable<unknown> {
  return {
    [Symbol.asyncIterator]() {
      let index = 0;
      return {
        async next() {
          if (index < messages.length) {
            return { done: false, value: messages[index++] };
          }
          return { done: true, value: undefined };
        },
      };
    },
  };
}

function makeAssistantToolUseMessage(
  toolCallId: string,
  type = "free_text",
  question = "テスト質問です",
): unknown {
  return {
    type: "assistant",
    message: {
      content: [
        {
          type: "tool_use",
          id: toolCallId,
          name: "AskUserQuestion",
          input: { type, question, options: [] },
        },
      ],
    },
  };
}

function makeAssistantTextMessage(text: string): unknown {
  return {
    type: "assistant",
    message: {
      content: [{ type: "text", text }],
    },
  };
}

function makeResultMessage(result = "完了しました"): unknown {
  return {
    type: "result",
    subtype: "success",
    result,
  };
}

function makeResultErrorMessage(subtype: string): unknown {
  return {
    type: "result",
    subtype,
  };
}

function createSession(
  onQuestion: (q: UserInputQuestion) => void = vi.fn(),
  onComplete: (r: string) => void = vi.fn(),
  onError: (e: string) => void = vi.fn(),
): SkillCreatorSdkSession {
  return new SkillCreatorSdkSession(
    "test-session-001",
    "/test/skill-creator",
    onQuestion,
    onComplete,
    onError,
  );
}

describe("SkillCreatorSdkSession", () => {
  let querySpy: MockInstance;
  let createMcpServerSpy: MockInstance;
  let toolSpy: MockInstance;

  beforeEach(async () => {
    const sdk = await import("@anthropic-ai/claude-agent-sdk");
    querySpy = vi.mocked(sdk.query);
    createMcpServerSpy = vi.mocked(sdk.createSdkMcpServer);
    toolSpy = vi.mocked(sdk.tool);

    querySpy.mockReturnValue(makeCompletedStream());
    createMcpServerSpy.mockImplementation((options: { name: string }) => ({
      type: "sdk",
      name: options.name,
      instance: {
        close: vi.fn().mockResolvedValue(undefined),
      },
    }));
    toolSpy.mockImplementation(
      (
        name: string,
        description: string,
        inputSchema: unknown,
        handler: unknown,
      ) => ({
        name,
        description,
        inputSchema,
        handler,
      }),
    );
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("query() に session 向けの MCP server と built-in tools を渡す", async () => {
    querySpy.mockReturnValue(makeCompletedStream([makeResultMessage()]));
    const session = createSession();

    await session.startSession("スキルを作成してください");

    expect(querySpy).toHaveBeenCalledOnce();
    const callArg = querySpy.mock.calls[0][0] as {
      prompt: string;
      options?: {
        sessionId?: string;
        tools?: Array<string>;
        mcpServers?: Record<string, unknown>;
      };
    };

    expect(callArg.prompt).toContain("スキルを作成してください");
    expect(callArg.options?.sessionId).toBe("test-session-001");
    expect(callArg.options?.tools).toEqual(
      expect.arrayContaining([
        "Read",
        "Write",
        "Edit",
        "Glob",
        "Grep",
        "Bash",
        "Task",
      ]),
    );
    expect(callArg.options?.mcpServers).toHaveProperty(
      "skill-creator-user-input",
    );
    expect(createMcpServerSpy).toHaveBeenCalledOnce();
    expect(toolSpy).toHaveBeenCalledWith(
      "AskUserQuestion",
      expect.any(String),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("AskUserQuestion tool_use を受けると question を通知し、回答後に完了する", async () => {
    const onQuestion = vi.fn();
    const onComplete = vi.fn();
    const session = createSession(onQuestion, onComplete);

    const toolCallId = "tc-001";
    querySpy.mockReturnValue(
      makeCompletedStream([
        makeAssistantToolUseMessage(toolCallId, "free_text", "お名前は？"),
        makeResultMessage("生成完了"),
      ]),
    );

    setTimeout(() => {
      session.sendAnswer({ toolCallId, value: "テストユーザー" });
    }, 10);

    await session.startSession("テスト");

    expect(onQuestion).toHaveBeenCalledOnce();
    expect(onQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        toolCallId,
        type: "free_text",
        question: "お名前は？",
      }),
    );
    expect(onComplete).toHaveBeenCalledWith("生成完了");
    expect(session.getState().status).toBe("completed");
    expect(session.getState().result).toBe("生成完了");
  });

  it("AskUserQuestion の text fallback でも question を通知できる", async () => {
    const onQuestion = vi.fn();
    const session = createSession(onQuestion);

    querySpy.mockReturnValue(
      makeCompletedStream([
        makeAssistantTextMessage("AskUserQuestion: どのスキルを作成しますか？"),
        makeResultMessage(),
      ]),
    );

    setTimeout(() => {
      const state = session.getState();
      if (state.currentQuestion) {
        session.sendAnswer({
          toolCallId: state.currentQuestion.toolCallId,
          value: "テストスキル",
        });
      }
    }, 10);

    await session.startSession("テスト");

    expect(onQuestion).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "free_text",
        question: expect.stringContaining("どのスキルを作成しますか"),
      }),
    );
  });

  it("pending question がないときの sendAnswer() は例外にする", () => {
    const session = createSession();

    expect(() =>
      session.sendAnswer({ toolCallId: "tc-none", value: "回答" }),
    ).toThrow("No pending question");
  });

  it("30秒応答がないと timeout エラーになる", async () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    const session = createSession(vi.fn(), vi.fn(), onError);

    querySpy.mockReturnValue(
      makeCompletedStream([
        makeAssistantToolUseMessage(
          "tc-timeout",
          "free_text",
          "回答してください",
        ),
      ]),
    );

    const startPromise = session.startSession("テスト");
    await vi.advanceTimersByTimeAsync(30_001);
    await startPromise.catch(() => {});

    expect(onError).toHaveBeenCalledWith(expect.stringContaining("timeout"));
    expect(session.getState().status).toBe("error");
  });

  it("result error subtype は error 状態に遷移する", async () => {
    const onError = vi.fn();
    const session = createSession(vi.fn(), vi.fn(), onError);

    querySpy.mockReturnValue(
      makeCompletedStream([makeResultErrorMessage("error_max_turns")]),
    );

    await session.startSession("テスト");

    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining("error_max_turns"),
    );
    expect(session.getState().status).toBe("error");
  });

  it("silent abort はユーザー向けエラーを出さずに停止する", () => {
    const onError = vi.fn();
    const session = createSession(vi.fn(), vi.fn(), onError);

    (
      session as SkillCreatorSdkSession & {
        abort: (message?: string, options?: { silent?: boolean }) => void;
      }
    ).abort("window closed", { silent: true });

    expect(onError).not.toHaveBeenCalled();
    expect(session.getState().status).toBe("error");
  });
});
