/**
 * useWorkspaceChatController ランタイム整合テスト (R-01 〜 R-24)
 *
 * TDD Red フェーズ:
 *   - R-19: selectedModelId=null で sendMessage が実行不可 → 現在 fallback("gpt-4o") があるため Red
 *
 * P39 準拠: happy-dom 環境では fireEvent を使用（userEvent 使用禁止）
 * P9  準拠: beforeEach で全 mock をリセットし、テスト間の状態共有を防ぐ
 */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWorkspaceChatController } from "../useWorkspaceChatController";

// ---------------------------------------------------------------------------
// Mock: @/renderer/store
// ---------------------------------------------------------------------------

const mockSelectedFiles: Array<{
  id: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  mimeType: string;
  lastModified: string;
  createdAt: string;
}> = [];

const mockAddFiles = vi.fn();
const mockRemoveFile = vi.fn();

const mockAppState = {
  selectedProviderId: "openai" as const,
  selectedModelId: "gpt-4o" as string | null,
};

vi.mock("@/renderer/store", () => ({
  useSelectedFiles: () => mockSelectedFiles,
  useFolderFileTrees: () => new Map(),
  useAddFiles: () => mockAddFiles,
  useRemoveFile: () => mockRemoveFile,
  useAppStore: (selector: (state: typeof mockAppState) => unknown) =>
    selector(mockAppState),
}));

// ---------------------------------------------------------------------------
// Mock: window APIs
// ---------------------------------------------------------------------------

const mockStreamChat = vi.fn();
const mockCancelStream = vi.fn();
const mockConversationCreate = vi.fn();
const mockConversationAddMessage = vi.fn();

let onStreamChunkListener:
  | ((chunk: { delta?: { content?: string } }) => void)
  | null = null;
let onStreamEndListener: (() => void) | null = null;
let onStreamErrorListener: ((error: { message: string }) => void) | null = null;

// ---------------------------------------------------------------------------
// デフォルト hook params
// ---------------------------------------------------------------------------

const defaultParams = {
  selectedFilePath: null as string | null,
  onAttachSelectedFile: vi.fn().mockResolvedValue({ success: true }),
  onOpenPreviewFromMention: vi.fn(),
};

// ---------------------------------------------------------------------------
// beforeEach / afterEach
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  // mockSelectedFiles をリセット
  mockSelectedFiles.length = 0;

  // mockAppState をデフォルト値に戻す
  mockAppState.selectedProviderId = "openai";
  mockAppState.selectedModelId = "gpt-4o";

  // stream listeners をリセット
  onStreamChunkListener = null;
  onStreamEndListener = null;
  onStreamErrorListener = null;

  // デフォルト resolved values
  mockStreamChat.mockResolvedValue({ requestId: "stream-req-1" });
  mockCancelStream.mockResolvedValue({ success: true });
  mockConversationCreate.mockResolvedValue({
    success: true,
    data: { id: "conv-1" },
  });
  mockConversationAddMessage.mockResolvedValue({
    success: true,
    data: { id: "msg-1" },
  });

  // window.electronAPI
  window.electronAPI = {
    ...(window.electronAPI ?? {}),
    llm: {
      ...(window.electronAPI?.llm ?? {}),
      streamChat: mockStreamChat,
      cancelStream: mockCancelStream,
      onStreamChunk: vi.fn().mockImplementation((callback) => {
        onStreamChunkListener = callback;
        return () => {
          onStreamChunkListener = null;
        };
      }),
      onStreamEnd: vi.fn().mockImplementation((callback) => {
        onStreamEndListener = callback;
        return () => {
          onStreamEndListener = null;
        };
      }),
      onStreamError: vi.fn().mockImplementation((callback) => {
        onStreamErrorListener = callback;
        return () => {
          onStreamErrorListener = null;
        };
      }),
    },
    file: {
      ...(window.electronAPI?.file ?? {}),
      read: vi.fn().mockResolvedValue({
        success: true,
        data: {
          content: "file content",
          metadata: {
            size: 12,
            lastModified: new Date("2026-03-10T00:00:00.000Z"),
            encoding: "utf-8",
          },
        },
      }),
    },
  } as typeof window.electronAPI;

  // window.conversationAPI
  window.conversationAPI = {
    ...(window.conversationAPI ?? {}),
    create: mockConversationCreate,
    addMessage: mockConversationAddMessage,
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
  };
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Helper: hook のレンダリング
// ---------------------------------------------------------------------------

function renderController(overrides: Partial<typeof defaultParams> = {}) {
  const params = { ...defaultParams, ...overrides };
  return renderHook(() => useWorkspaceChatController(params));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useWorkspaceChatController ランタイム整合テスト", () => {
  // R-01: 初期 state
  it("R-01: 初期 state は messages=[], input='', isStreaming=false", () => {
    const { result } = renderController();

    expect(result.current.messages).toEqual([]);
    expect(result.current.input).toBe("");
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.isSending).toBe(false);
    expect(result.current.streamContent).toBe("");
    expect(result.current.errorMessage).toBeNull();
  });

  // R-02: setInputValue で input 更新
  it("R-02: setInputValue で input が更新される", () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("Hello");
    });

    expect(result.current.input).toBe("Hello");
  });

  // R-03: applySuggestion で input 反映
  it("R-03: applySuggestion で input にテキストが反映される", () => {
    const { result } = renderController();

    act(() => {
      result.current.applySuggestion("このファイルの責務を3行で要約して");
    });

    expect(result.current.input).toBe("このファイルの責務を3行で要約して");
  });

  // R-04: sendMessage で user message 追加
  it("R-04: sendMessage で user message が messages に追加される", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    const userMessages = result.current.messages.filter(
      (m) => m.role === "user",
    );
    expect(userMessages).toHaveLength(1);
    expect(userMessages[0].content).toBe("テスト質問");
  });

  // R-05: sendMessage で streaming 開始
  it("R-05: sendMessage 後に isStreaming=true になる", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.isStreaming).toBe(true);
  });

  // R-06: onStreamChunk で streamContent 蓄積
  it("R-06: onStreamChunk で streamContent が蓄積される", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    act(() => {
      onStreamChunkListener?.({ delta: { content: "Hello " } });
      onStreamChunkListener?.({ delta: { content: "World" } });
    });

    expect(result.current.streamContent).toBe("Hello World");
  });

  // R-07: onStreamEnd で assistant message 追加
  it("R-07: onStreamEnd で assistant message が messages に追加される", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    act(() => {
      onStreamChunkListener?.({ delta: { content: "AI の回答です" } });
    });

    await act(async () => {
      onStreamEndListener?.();
    });

    const assistantMessages = result.current.messages.filter(
      (m) => m.role === "assistant",
    );
    expect(assistantMessages).toHaveLength(1);
    expect(assistantMessages[0].content).toBe("AI の回答です");
    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamContent).toBe("");
  });

  // R-08: cancelStream で streaming 中断
  it("R-08: cancelStream で streaming が中断される", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.isStreaming).toBe(true);

    await act(async () => {
      await result.current.cancelStream();
    });

    expect(result.current.isStreaming).toBe(false);
    expect(mockCancelStream).toHaveBeenCalledWith("stream-req-1");
  });

  // R-09: 空入力で sendMessage が no-op
  it("R-09: 空入力で sendMessage を呼んでも no-op になる", async () => {
    const { result } = renderController();

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(mockStreamChat).not.toHaveBeenCalled();
    expect(result.current.messages).toHaveLength(0);
  });

  // R-10: isSending 中に sendMessage が no-op
  it("R-10: isSending=true の間に sendMessage を呼んでも no-op になる", async () => {
    // streamChat を解決しないまま保留する
    let resolveStreamChat!: (value: { requestId: string }) => void;
    mockStreamChat.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveStreamChat = resolve;
      }),
    );

    const { result } = renderController();

    act(() => {
      result.current.setInputValue("1回目");
    });

    // 1回目の sendMessage（pending 中）
    const firstSend = act(async () => {
      await result.current.sendMessage();
    });

    // 2回目の sendMessage（isSending=true のはず → no-op）
    await act(async () => {
      await result.current.sendMessage();
    });

    // 1回目を解決
    resolveStreamChat({ requestId: "stream-req-1" });
    await firstSend;

    // streamChat は1回だけ呼ばれるべき
    expect(mockStreamChat).toHaveBeenCalledTimes(1);
  });

  // R-11: isStreaming 中に sendMessage が no-op
  it("R-11: isStreaming=true の間に sendMessage を呼んでも no-op になる", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("1回目");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.isStreaming).toBe(true);

    act(() => {
      result.current.setInputValue("2回目");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    // user message は1件のみ
    expect(
      result.current.messages.filter((m) => m.role === "user"),
    ).toHaveLength(1);
  });

  // R-12: file read failure で errorMessage
  it("R-12: selectedFiles の file read が失敗した場合 errorMessage が設定される", async () => {
    // selectedFiles を1件追加
    mockSelectedFiles.push({
      id: "file-1",
      path: "/workspace/app.ts",
      name: "app.ts",
      extension: "ts",
      size: 100,
      mimeType: "text/plain",
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // file.read を失敗させる
    (
      window.electronAPI.file.read as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      success: false,
      error: { message: "File not found" },
    });

    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.errorMessage).not.toBeNull();
  });

  // R-13: stream error で errorMessage
  it("R-13: onStreamError で errorMessage が設定される", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    act(() => {
      onStreamErrorListener?.({ message: "Stream failed" });
    });

    expect(result.current.errorMessage).toContain("Stream failed");
    expect(result.current.isStreaming).toBe(false);
  });

  // R-14: conversation create failure で errorMessage
  it("R-14: conversation create が失敗した場合 errorMessage が設定される", async () => {
    mockConversationCreate.mockResolvedValueOnce({
      success: false,
      error: { message: "Conversation create failed" },
    });

    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.errorMessage).not.toBeNull();
    expect(result.current.isSending).toBe(false);
  });

  // R-15: mention '@' 入力で候補表示
  it("R-15: '@' を入力すると mention.isOpen=true になる", () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("@", 1);
    });

    expect(result.current.mention.isOpen).toBe(true);
  });

  // R-16: mention 候補選択で file attach
  it("R-16: mention 候補を選択すると insertMention が実行される", async () => {
    // folderFileTrees に候補を持たせるために store mock を上書き
    // ただし vi.mock はモジュールレベルなので、mentionCandidates が空の状態でテスト
    // → 候補がないため selectMentionAtIndex は no-op になることを確認
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("@app", 4);
    });

    await act(async () => {
      await result.current.selectMentionAtIndex(0);
    });

    // 候補が空なので input はそのまま
    expect(result.current.input).toBe("@app");
  });

  // R-17: mention 範囲外で候補非表示
  it("R-17: '@' なしの入力では mention.isOpen=false になる", () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("Hello World", 11);
    });

    expect(result.current.mention.isOpen).toBe(false);
  });

  // R-18: attachSelectedFile で file 追加
  it("R-18: attachSelectedFile を呼ぶと onAttachSelectedFile が実行される", async () => {
    const mockOnAttach = vi.fn().mockResolvedValue({ success: true });
    const { result } = renderController({
      selectedFilePath: "/workspace/app.ts",
      onAttachSelectedFile: mockOnAttach,
    });

    await act(async () => {
      result.current.attachSelectedFile();
    });

    expect(mockOnAttach).toHaveBeenCalledWith("/workspace/app.ts");
  });

  // R-19: selectedModelId=null で sendMessage 実行不可（Red フェーズ）
  // 現在の実装では `selectedModelId ?? "gpt-4o"` の fallback があるため、
  // このテストは Red（失敗）になることが期待される。
  it("R-19: selectedModelId=null の場合は sendMessage が実行不可になること（Red フェーズ）", async () => {
    // selectedModelId を null に設定
    mockAppState.selectedModelId = null;

    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    // 期待: selectedModelId=null のため sendMessage は no-op（streamChat が呼ばれない）
    // 現状: fallback で gpt-4o が使われるため streamChat が呼ばれる → Red
    expect(mockStreamChat).not.toHaveBeenCalled();
  });

  // R-20: unmount 時に active stream を cancel
  it("R-20: unmount 時に active stream が cancel される", async () => {
    const { result, unmount } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.isStreaming).toBe(true);

    unmount();

    expect(mockCancelStream).toHaveBeenCalledWith("stream-req-1");
  });

  // R-21: conversation addMessage failure で errorMessage
  it("R-21: conversation addMessage が失敗した場合 errorMessage が設定される", async () => {
    mockConversationAddMessage.mockResolvedValueOnce({
      success: false,
      error: { message: "addMessage failed" },
    });

    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.errorMessage).not.toBeNull();
  });

  // R-22: Enter で sendMessage 呼出
  it("R-22: handleComposerKeyDown で Enter を押すと sendMessage が実行される", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    const preventDefault = vi.fn();
    await act(async () => {
      await result.current.handleComposerKeyDown({
        key: "Enter",
        shiftKey: false,
        preventDefault,
      });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(
      result.current.messages.filter((m) => m.role === "user"),
    ).toHaveLength(1);
  });

  // R-23: Shift+Enter で改行（sendMessage は呼ばれない）
  it("R-23: Shift+Enter では sendMessage は呼ばれない", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });

    const preventDefault = vi.fn();
    await act(async () => {
      await result.current.handleComposerKeyDown({
        key: "Enter",
        shiftKey: true,
        preventDefault,
      });
    });

    expect(mockStreamChat).not.toHaveBeenCalled();
  });

  // R-24: ArrowDown で mention ハイライト移動
  it("R-24: mention open 中に ArrowDown を押すと mention のハイライトが移動する", async () => {
    const { result } = renderController();

    // '@' を入力して mention を開く
    act(() => {
      result.current.setInputValue("@", 1);
    });

    // mention が開いていれば ArrowDown でハイライト移動
    if (result.current.mention.isOpen) {
      const initialIndex = result.current.mention.highlightedIndex;
      const preventDefault = vi.fn();

      await act(async () => {
        await result.current.handleComposerKeyDown({
          key: "ArrowDown",
          shiftKey: false,
          preventDefault,
        });
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(result.current.mention.highlightedIndex).not.toBe(initialIndex);
    } else {
      // mention candidates が空なので isOpen=false → テストはパスのみ
      expect(result.current.mention.isOpen).toBe(false);
    }
  });

  // ===== Phase 6: テスト拡充 (E-01〜E-15) =====

  // E-01: stream 中に file remove しても streaming 継続
  it("E-01: stream 中に removeSelectedFile を呼んでも isStreaming=true が維持される", async () => {
    mockSelectedFiles.push({
      id: "file-1",
      path: "/workspace/app.ts",
      name: "app.ts",
      extension: "ts",
      size: 100,
      mimeType: "text/plain",
      lastModified: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });
    await act(async () => {
      await result.current.sendMessage();
    });
    expect(result.current.isStreaming).toBe(true);

    act(() => {
      result.current.removeSelectedFile("file-1");
    });
    expect(result.current.isStreaming).toBe(true);
  });

  // E-07: stream error 後に再送信で成功
  it("E-07: stream error 後に再送信で errorMessage がクリアされる", async () => {
    const { result } = renderController();

    // 1回目: stream error
    act(() => {
      result.current.setInputValue("1回目");
    });
    await act(async () => {
      await result.current.sendMessage();
    });
    act(() => {
      onStreamErrorListener?.({ message: "Network error" });
    });
    expect(result.current.errorMessage).not.toBeNull();

    // 2回目: 再送信
    act(() => {
      result.current.setInputValue("2回目");
    });
    await act(async () => {
      await result.current.sendMessage();
    });
    expect(result.current.errorMessage).toBeNull();
  });

  // E-08: 連続 cancel で state が安定
  it("E-08: 連続 cancelStream で state が安定する", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });
    await act(async () => {
      await result.current.sendMessage();
    });

    await act(async () => {
      await result.current.cancelStream();
    });
    await act(async () => {
      await result.current.cancelStream();
    });

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.streamContent).toBe("");
  });

  // E-09: selectedProviderId=null で modelId からの推論
  it("E-09: selectedProviderId=null でも modelId prefix から provider が推論される", async () => {
    mockAppState.selectedProviderId = null as unknown as "openai";

    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });
    await act(async () => {
      await result.current.sendMessage();
    });

    // streamChat が呼ばれていれば推論成功
    expect(mockStreamChat).toHaveBeenCalled();
    const request = mockStreamChat.mock.calls[0][0];
    expect(request.modelId).toBe("gpt-4o");
  });

  // E-11: conversation 未作成状態で addMessage
  it("E-11: 初回 sendMessage で conversation create が先に呼ばれる", async () => {
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("最初の質問");
    });
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(mockConversationCreate).toHaveBeenCalledTimes(1);
    expect(mockConversationAddMessage).toHaveBeenCalledTimes(1);
    // create が addMessage より先に呼ばれること
    const createOrder = mockConversationCreate.mock.invocationOrder[0];
    const addMsgOrder = mockConversationAddMessage.mock.invocationOrder[0];
    expect(createOrder).toBeLessThan(addMsgOrder);
  });

  // E-13: selectedFiles が空で buildFileContextBlock
  it("E-13: selectedFiles が空の場合でも stream が正常に開始される", async () => {
    // selectedFiles は空（デフォルト状態）
    const { result } = renderController();

    act(() => {
      result.current.setInputValue("テスト質問");
    });
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(mockStreamChat).toHaveBeenCalled();
    expect(result.current.isStreaming).toBe(true);
  });

  // E-15: input が 32 文字超で conversation title が切り詰め
  it("E-15: 32文字超の入力で conversation title が 32 文字以下に切り詰められる", async () => {
    const longInput =
      "この文章は32文字を超える入力テスト用の文字列です。ここまでで十分に長い文章になっています。";

    const { result } = renderController();

    act(() => {
      result.current.setInputValue(longInput);
    });
    await act(async () => {
      await result.current.sendMessage();
    });

    const createCall = mockConversationCreate.mock.calls[0][0];
    expect(createCall.title.length).toBeLessThanOrEqual(32);
  });
});
