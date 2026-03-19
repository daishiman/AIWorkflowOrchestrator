/**
 * WorkspaceChatPanel ランタイム整合テスト (U-01 〜 U-06)
 *
 * TDD Red フェーズ:
 *   - U-05: errorMessage 存在時にエラー表示 → WorkspaceChatPanel 本体に未実装のため Red
 *   - U-06: selectedModelId=null で送信ボタン非活性 → WorkspaceChatPanel 本体に未実装のため Red
 *
 * P39 準拠: happy-dom 環境では fireEvent を使用（userEvent 使用禁止）
 * P9  準拠: beforeEach で全 mock をリセットし、テスト間の状態共有を防ぐ
 */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WorkspaceChatController } from "../hooks/useWorkspaceChatController";

// ---------------------------------------------------------------------------
// Mock: useWorkspaceChatController
// ---------------------------------------------------------------------------

const mockController: WorkspaceChatController = {
  messages: [],
  input: "",
  isSending: false,
  isStreaming: false,
  streamContent: "",
  errorMessage: null,
  selectedFiles: [],
  selectedFilePath: null,
  selectedModelId: "gpt-4o",
  pendingCursorPosition: null,
  mention: {
    isOpen: false,
    options: [],
    highlightedIndex: 0,
    mentionStart: -1,
    mentionEnd: -1,
    query: "",
    moveHighlight: vi.fn(),
    setHighlightedIndex: vi.fn(),
    reset: vi.fn(),
  },
  setInputValue: vi.fn(),
  clearPendingCursorPosition: vi.fn(),
  applySuggestion: vi.fn(),
  sendMessage: vi.fn().mockResolvedValue(undefined),
  cancelStream: vi.fn().mockResolvedValue(undefined),
  removeSelectedFile: vi.fn(),
  attachSelectedFile: vi.fn(),
  handleComposerKeyDown: vi.fn().mockResolvedValue(undefined),
  selectMentionAtIndex: vi.fn().mockResolvedValue(undefined),
  openMentionPreviewAtIndex: vi.fn(),
};

vi.mock("../hooks/useWorkspaceChatController", () => ({
  useWorkspaceChatController: () => mockController,
  getWorkspaceSuggestions: () => [
    "このファイルの責務を3行で要約して",
    "バグになりそうな箇所を優先度付きで指摘して",
    "最小変更でリファクタリング案を作って",
  ],
}));

// ---------------------------------------------------------------------------
// Import の順序: vi.mock の後に import
// ---------------------------------------------------------------------------

import { WorkspaceChatPanel } from "../WorkspaceChatPanel";

// ---------------------------------------------------------------------------
// beforeEach
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  // mockController をデフォルト状態にリセット
  mockController.messages = [];
  mockController.input = "";
  mockController.isSending = false;
  mockController.isStreaming = false;
  mockController.streamContent = "";
  mockController.errorMessage = null;
  mockController.selectedFiles = [];
  mockController.selectedFilePath = null;
  mockController.selectedModelId = "gpt-4o";
  mockController.pendingCursorPosition = null;
  mockController.mention = {
    isOpen: false,
    options: [],
    highlightedIndex: 0,
    mentionStart: -1,
    mentionEnd: -1,
    query: "",
    moveHighlight: vi.fn(),
    setHighlightedIndex: vi.fn(),
    reset: vi.fn(),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("WorkspaceChatPanel ランタイム整合テスト", () => {
  // U-01: zero state で suggestion bubbles 表示
  it("U-01: messages=[] かつ isStreaming=false の場合、suggestion bubbles が表示される", () => {
    render(<WorkspaceChatPanel controller={mockController} />);

    expect(screen.getByTestId("workspace-chat-zero-state")).toBeInTheDocument();
    expect(
      screen.getByTestId("workspace-chat-suggestions"),
    ).toBeInTheDocument();
  });

  // U-02: messages 存在時に suggestion 非表示
  it("U-02: messages が存在する場合、suggestion bubbles は非表示になる", () => {
    mockController.messages = [
      {
        id: "msg-1",
        role: "user",
        content: "テスト質問",
        timestamp: new Date().toISOString(),
      },
    ];

    render(<WorkspaceChatPanel controller={mockController} />);

    expect(
      screen.queryByTestId("workspace-chat-zero-state"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("workspace-chat-suggestions"),
    ).not.toBeInTheDocument();
  });

  // U-03: streaming 中に streaming indicator 表示
  it("U-03: isStreaming=true の場合、streaming indicator が表示される", () => {
    mockController.isStreaming = true;
    mockController.streamContent = "回答を生成中です...";

    render(<WorkspaceChatPanel controller={mockController} />);

    expect(
      screen.getByTestId("workspace-message-streaming"),
    ).toBeInTheDocument();
    // suggestion bubbles は非表示（isStreaming=true）
    expect(
      screen.queryByTestId("workspace-chat-zero-state"),
    ).not.toBeInTheDocument();
  });

  // U-04: file context chips に selectedFiles 表示
  it("U-04: selectedFiles が存在する場合、file context chips が表示される", () => {
    mockController.selectedFiles = [
      {
        id: "file-1",
        path: "/workspace/app.ts",
        name: "app.ts",
        extension: "ts",
        size: 100,
        mimeType: "text/plain",
        lastModified: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    render(<WorkspaceChatPanel controller={mockController} />);

    expect(
      screen.getByTestId("workspace-file-context-chips"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("workspace-chip-file-1")).toBeInTheDocument();
  });

  // U-05: errorMessage 存在時にエラー表示（Red フェーズ）
  // WorkspaceChatPanel 本体には errorMessage 表示が未実装のため Red になることが期待される。
  // WorkspaceChatInput 内の data-testid="workspace-chat-error" が WorkspaceChatPanel
  // の props.controller 経由でレンダリングされる場合は Green になるが、
  // 現在 WorkspaceChatPanel 自体にはエラー表示要素がない。
  it("U-05: errorMessage が存在する場合、エラーメッセージが表示されること（Red フェーズ）", () => {
    mockController.errorMessage = "AI応答に失敗しました: Stream failed";

    render(<WorkspaceChatPanel controller={mockController} />);

    // WorkspaceChatPanel 本体にエラー表示がないため失敗することが期待される
    expect(screen.getByTestId("workspace-chat-error")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-chat-error")).toHaveTextContent(
      "AI応答に失敗しました: Stream failed",
    );
  });

  // U-06: selectedModelId=null で送信ボタン非活性（Red フェーズ）
  // WorkspaceChatPanel / WorkspaceChatInput は現在 selectedModelId を参照しないため Red。
  it("U-06: selectedModelId=null の場合、送信ボタンが非活性になること（Red フェーズ）", () => {
    // input に値を入れて通常は送信可能な状態にする
    mockController.input = "テスト質問";
    mockController.isSending = false;
    mockController.isStreaming = false;

    // P62: selectedModelId=null で送信ボタンが非活性になること
    mockController.selectedModelId = null;

    render(<WorkspaceChatPanel controller={mockController} />);

    const sendButton = screen.getByTestId("workspace-chat-send");
    // 期待: selectedModelId=null なら disabled
    // 現状: WorkspaceChatInput は canSend を input/isSending/isStreaming のみで判定 → enabled → Red
    expect(sendButton).toBeDisabled();
  });

  // ===== Phase 6: テスト拡充 (E-05, E-16〜E-22) =====

  // E-05: unsupported capability で GuidanceBlock 表示
  it("E-05: selectedModelId=null で GuidanceBlock が表示される", () => {
    mockController.selectedModelId = null;

    render(<WorkspaceChatPanel controller={mockController} />);

    expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument();
    expect(screen.getByText(/モデルが選択されていません/)).toBeInTheDocument();
  });
});
