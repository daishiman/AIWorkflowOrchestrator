import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatView } from "./index";

// Mock store state - flat structure matching actual store
const createMockState = (overrides = {}) => ({
  // ChatSlice
  chatMessages: [
    {
      id: "1",
      role: "user" as const,
      content: "こんにちは",
      timestamp: new Date("2024-01-15T10:00:00"),
      isStreaming: false,
    },
    {
      id: "2",
      role: "assistant" as const,
      content: "こんにちは！何かお手伝いできることはありますか？",
      timestamp: new Date("2024-01-15T10:00:05"),
      isStreaming: false,
    },
  ],
  chatInput: "",
  isSending: false,
  ragConnectionStatus: "connected" as const,
  addMessage: vi.fn(),
  setChatInput: vi.fn(),
  setIsSending: vi.fn(),
  setRagConnectionStatus: vi.fn(),
  updateMessage: vi.fn(),
  clearMessages: vi.fn(),
  ...overrides,
});

vi.mock("../../store", () => ({
  useAppStore: vi.fn(
    (selector: (state: ReturnType<typeof createMockState>) => unknown) =>
      selector(createMockState()),
  ),
}));

describe("ChatView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("レンダリング", () => {
    it("チャットビューをレンダリングする", () => {
      render(<ChatView />);
      expect(screen.getByTestId("chat-view")).toBeInTheDocument();
    });

    it("ヘッダーを表示する", () => {
      render(<ChatView />);
      expect(screen.getByText("AIチャット")).toBeInTheDocument();
    });

    it("RAG有効時にRAGステータスを表示する", () => {
      render(<ChatView />);
      expect(
        screen.getByText(/RAG有効.*ナレッジベースを参照して回答します/),
      ).toBeInTheDocument();
    });
  });

  describe("メッセージ表示", () => {
    it("メッセージ一覧を表示する", () => {
      render(<ChatView />);
      expect(screen.getByText("こんにちは")).toBeInTheDocument();
      expect(
        screen.getByText("こんにちは！何かお手伝いできることはありますか？"),
      ).toBeInTheDocument();
    });

    it("チャット履歴にaria-labelを持つ", () => {
      render(<ChatView />);
      expect(
        screen.getByRole("log", { name: "チャット履歴" }),
      ).toBeInTheDocument();
    });
  });

  describe("入力", () => {
    it("入力フィールドを表示する", () => {
      render(<ChatView />);
      expect(
        screen.getByPlaceholderText("メッセージを入力..."),
      ).toBeInTheDocument();
    });

    it("入力変更でsetChatInputを呼び出す", async () => {
      const mockSetChatInput = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ setChatInput: mockSetChatInput }),
        )) as never);

      render(<ChatView />);
      const input = screen.getByPlaceholderText("メッセージを入力...");
      fireEvent.change(input, { target: { value: "テスト" } });
      expect(mockSetChatInput).toHaveBeenCalledWith("テスト");
    });

    it("送信ボタンを表示する", () => {
      render(<ChatView />);
      expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
    });
  });

  describe("送信", () => {
    it("入力値があれば送信ボタンクリックでaddMessageを呼び出す", async () => {
      const mockAddMessage = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            chatInput: "テストメッセージ",
            addMessage: mockAddMessage,
          }),
        )) as never);

      render(<ChatView />);
      const sendButton = screen.getByRole("button", { name: "送信" });
      fireEvent.click(sendButton);
      expect(mockAddMessage).toHaveBeenCalled();
    });
  });

  describe("ローディング状態", () => {
    it("送信中は送信ボタンが無効化される", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ isSending: true }))) as never);

      render(<ChatView />);
      const sendButton = screen.getByRole("button", { name: "送信" });
      expect(sendButton).toBeDisabled();
    });
  });

  describe("空状態", () => {
    it("メッセージがない場合は案内を表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ chatMessages: [] }))) as never);

      render(<ChatView />);
      expect(
        screen.getByText("メッセージを入力してAIと会話を始めましょう"),
      ).toBeInTheDocument();
    });
  });

  describe("RAGモード", () => {
    it("RAG無効時は通常モードと表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ ragConnectionStatus: "disconnected" }),
        )) as never);

      render(<ChatView />);
      expect(screen.getByText("通常モード")).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<ChatView className="custom-class" />);
      expect(screen.getByTestId("chat-view")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(ChatView.displayName).toBe("ChatView");
    });
  });
});
