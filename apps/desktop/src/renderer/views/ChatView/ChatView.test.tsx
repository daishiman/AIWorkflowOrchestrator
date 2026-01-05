import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChatView } from "./index";

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
  systemPrompt: "",
  isSystemPromptPanelExpanded: false,
  addMessage: vi.fn(),
  setChatInput: vi.fn(),
  setIsSending: vi.fn(),
  setRagConnectionStatus: vi.fn(),
  updateMessage: vi.fn(),
  clearMessages: vi.fn(),
  sendMessage: vi.fn().mockResolvedValue(undefined),
  toggleSystemPromptPanel: vi.fn(),
  setSystemPrompt: vi.fn(),
  clearSystemPrompt: vi.fn(),
  // SystemPromptTemplateSlice
  templates: [],
  selectedTemplateId: null,
  isSaveTemplateDialogOpen: false,
  initializeTemplates: vi.fn(),
  saveTemplate: vi.fn().mockResolvedValue(undefined),
  deleteTemplate: vi.fn().mockResolvedValue(undefined),
  openSaveTemplateDialog: vi.fn(),
  closeSaveTemplateDialog: vi.fn(),
  selectTemplate: vi.fn(),
  ...overrides,
});

vi.mock("../../store", () => ({
  useAppStore: vi.fn(
    (selector: (state: ReturnType<typeof createMockState>) => unknown) =>
      selector(createMockState()),
  ),
}));

// Helper function to render ChatView with MemoryRouter
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe("ChatView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
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
    it("入力値があれば送信ボタンクリックでsendMessageを呼び出す", async () => {
      const mockSendMessage = vi.fn().mockResolvedValue(undefined);
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({
            chatInput: "テストメッセージ",
            sendMessage: mockSendMessage,
          }),
        )) as never);

      render(<ChatView />);
      const sendButton = screen.getByRole("button", { name: "送信" });
      fireEvent.click(sendButton);
      expect(mockSendMessage).toHaveBeenCalledWith("テストメッセージ");
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

  // ==========================================================================
  // TDD Red: ナビゲーションテスト（Phase 3: T-03-1）
  // - 以下のテストは未実装の機能をテストするため、現時点ではすべて失敗する
  // - Phase 4で実装を行い、テストがGreen（成功）になることを確認する
  // ==========================================================================
  describe("ナビゲーション", () => {
    describe("履歴ボタン表示", () => {
      it("履歴ボタンがヘッダーに表示される", () => {
        renderWithRouter(<ChatView />);

        // 履歴ボタンが存在することを確認
        const historyButton = screen.getByRole("button", {
          name: "チャット履歴",
        });
        expect(historyButton).toBeInTheDocument();
      });

      it("履歴ボタンにHistoryアイコンが含まれる", () => {
        renderWithRouter(<ChatView />);

        // 履歴ボタン内にアイコンが存在することを確認
        const historyButton = screen.getByRole("button", {
          name: "チャット履歴",
        });
        // lucide-reactのHistoryアイコンはsvg要素
        expect(historyButton.querySelector("svg")).toBeInTheDocument();
      });
    });

    describe("履歴ボタンの遷移動作", () => {
      it("履歴ボタンクリックで/chat/historyへ遷移する", () => {
        renderWithRouter(<ChatView />);

        const historyButton = screen.getByRole("button", {
          name: "チャット履歴",
        });
        fireEvent.click(historyButton);

        // useNavigateが/chat/historyで呼び出されることを確認
        expect(mockNavigate).toHaveBeenCalledWith("/chat/history");
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });

      it("キーボードで履歴ボタンにフォーカスして操作できる", () => {
        renderWithRouter(<ChatView />);

        const historyButton = screen.getByRole("button", {
          name: "チャット履歴",
        });

        // キーボードナビゲーションのテスト：フォーカス可能であることを確認
        historyButton.focus();
        expect(document.activeElement).toBe(historyButton);

        // フォーカス後のクリック操作（キーボードでのアクティベーション）
        fireEvent.click(historyButton);
        expect(mockNavigate).toHaveBeenCalledWith("/chat/history");
      });
    });

    describe("アクセシビリティ", () => {
      it("履歴ボタンにaria-labelが設定されている", () => {
        renderWithRouter(<ChatView />);

        const historyButton = screen.getByRole("button", {
          name: "チャット履歴",
        });

        // aria-label属性が正しく設定されていることを確認
        expect(historyButton).toHaveAttribute("aria-label", "チャット履歴");
      });

      it("履歴ボタンがtype=buttonを持つ", () => {
        renderWithRouter(<ChatView />);

        const historyButton = screen.getByRole("button", {
          name: "チャット履歴",
        });

        // フォーム送信を防ぐためtype=buttonであることを確認
        expect(historyButton).toHaveAttribute("type", "button");
      });

      it("履歴ボタンにフォーカス可能である", () => {
        renderWithRouter(<ChatView />);

        const historyButton = screen.getByRole("button", {
          name: "チャット履歴",
        });

        // ボタンにフォーカスが当たることを確認
        historyButton.focus();
        expect(document.activeElement).toBe(historyButton);
      });
    });
  });
});
