import { beforeEach, describe, expect, it, vi } from "vitest";
import { createChatSlice, type ChatSlice } from "./chatSlice";
import { buildWorkspaceChatContext } from "../../features/chat-platform/session";

const mockStreamChat = vi.fn();
const mockCancelStream = vi.fn();

describe("chatSlice", () => {
  let store: ChatSlice;

  beforeEach(() => {
    vi.clearAllMocks();

    window.electronAPI = {
      ...(window.electronAPI ?? {}),
      llm: {
        ...(window.electronAPI?.llm ?? {}),
        streamChat: mockStreamChat.mockResolvedValue({ requestId: "req-1" }),
        cancelStream: mockCancelStream.mockResolvedValue({ success: true }),
        onStreamChunk: vi.fn(() => () => {}),
        onStreamEnd: vi.fn(() => () => {}),
        onStreamError: vi.fn(() => () => {}),
      },
    } as typeof window.electronAPI;

    const state: Partial<ChatSlice> = {};
    const setState = (
      updater:
        | Partial<ChatSlice>
        | ((current: ChatSlice) => Partial<ChatSlice>),
    ) => {
      const partial = typeof updater === "function" ? updater(store) : updater;
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createChatSlice(
      setState as never,
      (() => store) as never,
      {} as never,
    );
  });

  it("初期状態で general session を 1 件持つ", () => {
    expect(store.activeChatMode).toBe("general");
    expect(store.activeChatSessionId).not.toBeNull();
    expect(store.chatSessionOrder).toHaveLength(1);
    expect(store.chatMessages[0]?.role).toBe("assistant");
  });

  it("Workspace mode を有効化すると文脈付き session を作成する", () => {
    const sessionId = store.activateChatMode(
      "workspace",
      buildWorkspaceChatContext(
        [{ path: "/workspace/app.ts", name: "app.ts" }],
        "/workspace",
      ),
    );

    expect(store.activeChatMode).toBe("workspace");
    expect(store.activeChatSessionId).toBe(sessionId);
    expect(store.chatSessions[sessionId]?.context.workspacePath).toBe(
      "/workspace",
    );
    expect(store.chatSessions[sessionId]?.context.selectedFileNames).toEqual([
      "app.ts",
    ]);
  });

  it("skill-lifecycle session は再利用しつつ context を更新する", () => {
    const firstSessionId = store.activateChatMode("skill-lifecycle", {
      lifecycleJob: "create",
      entryPoint: "skill-center",
    });
    const secondSessionId = store.activateChatMode("skill-lifecycle", {
      selectedSkillName: "skill-creator",
    });

    expect(secondSessionId).toBe(firstSessionId);
    expect(store.chatSessions[firstSessionId]?.context.lifecycleJob).toBe(
      "create",
    );
    expect(store.chatSessions[firstSessionId]?.context.selectedSkillName).toBe(
      "skill-creator",
    );
  });

  it("sendMessage で user message と streaming placeholder を追加する", async () => {
    await store.sendMessage("仕様を整理して", {
      providerId: "openai",
      modelId: "gpt-4o",
    });

    const activeSession = store.chatSessions[store.activeChatSessionId ?? ""];

    expect(mockStreamChat).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: "openai",
        modelId: "gpt-4o",
        temperature: 1,
        stream: true,
      }),
    );
    expect(activeSession?.messages.at(-2)).toMatchObject({
      role: "user",
      content: "仕様を整理して",
    });
    expect(activeSession?.messages.at(-1)).toMatchObject({
      role: "assistant",
      content: "",
      isStreaming: true,
    });
    expect(store.currentStreamId).toBe("req-1");
    expect(store.isStreaming).toBe(true);
  });

  it("appendStreamChunk と endStreaming で応答を確定する", async () => {
    await store.sendMessage("続けて", {
      modelId: "gpt-4o",
    });

    store.appendStreamChunk("回答");
    store.appendStreamChunk("します");

    expect(
      store.chatSessions[store.activeChatSessionId ?? ""].messages.at(-1)
        ?.content,
    ).toBe("回答します");

    store.endStreaming();

    expect(store.isStreaming).toBe(false);
    expect(store.streamingContent).toBe("");
    expect(
      store.chatSessions[store.activeChatSessionId ?? ""].messages.at(-1)
        ?.isStreaming,
    ).toBe(false);
  });

  it("abortStreaming で cancel を呼び partial message を中断扱いにする", async () => {
    await store.sendMessage("中断テスト", {
      modelId: "gpt-4o",
    });

    await store.abortStreaming();

    expect(mockCancelStream).toHaveBeenCalledWith("req-1");
    expect(store.isStreaming).toBe(false);
    expect(
      store.chatSessions[store.activeChatSessionId ?? ""].messages.at(-1)
        ?.content,
    ).toBe("[ストリーミングを中断しました]");
  });

  it("model 未選択なら MODEL_REQUIRED error を設定する", async () => {
    await store.sendMessage("モデルなし送信");

    expect(mockStreamChat).not.toHaveBeenCalled();
    expect(store.streamingError).toMatchObject({
      code: "MODEL_REQUIRED",
      retryable: false,
    });
  });
});
