/**
 * ChatView InlineModelSelector 統合テスト
 *
 * TC-I-1〜TC-I-5: ChatViewへのInlineModelSelector配置
 *
 * P39 準拠: happy-dom 環境では fireEvent を使用（userEvent 使用禁止）
 * P63 準拠: 既存テスト（ChatView.guidance.test.tsx）のインポートパスを参照
 * P40 準拠: cd apps/desktop で実行
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ---------------------------------------------------------------------------
// Mock: react-router-dom
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ---------------------------------------------------------------------------
// Mock: store (ChatView + LLMGuidanceBanner + InlineModelSelector)
// ---------------------------------------------------------------------------
const mockSetCurrentView = vi.fn();
const mockSendMessage = vi.fn().mockResolvedValue(undefined);
const mockUseSelectedModelId = vi.fn<[], string | null>(() => null);
const mockUseSelectedProviderId = vi.fn<[], string | null>(() => null);
const mockUseLLMProviders = vi.fn(() => []);
const mockUseLLMHealthStatus = vi.fn(() => ({}));
const mockUseFetchProviders = vi.fn(() => vi.fn());
const mockUseSelectProvider = vi.fn(() => vi.fn());
const mockUseSelectModel = vi.fn(() => vi.fn());
const mockUseCheckLLMHealth = vi.fn(() => vi.fn());

const createMockState = (overrides = {}) => ({
  chatMessages: [],
  chatInput: "",
  isSending: false,
  ragConnectionStatus: "connected" as const,
  systemPrompt: "",
  isSystemPromptPanelExpanded: false,
  addMessage: vi.fn(),
  setChatInput: vi.fn(),
  setCurrentView: mockSetCurrentView,
  setIsSending: vi.fn(),
  setRagConnectionStatus: vi.fn(),
  updateMessage: vi.fn(),
  clearMessages: vi.fn(),
  sendMessage: mockSendMessage,
  toggleSystemPromptPanel: vi.fn(),
  setSystemPrompt: vi.fn(),
  clearSystemPrompt: vi.fn(),
  templates: [],
  selectedTemplateId: null,
  isSaveTemplateDialogOpen: false,
  initializeTemplates: vi.fn(),
  saveTemplate: vi.fn().mockResolvedValue(undefined),
  deleteTemplate: vi.fn().mockResolvedValue(undefined),
  openSaveTemplateDialog: vi.fn(),
  closeSaveTemplateDialog: vi.fn(),
  selectTemplate: vi.fn(),
  chatError: null as string | null,
  clearChatError: vi.fn(),
  ...overrides,
});

vi.mock("@/renderer/store", () => ({
  useAppStore: vi.fn(
    (selector: (state: ReturnType<typeof createMockState>) => unknown) =>
      selector(createMockState()),
  ),
  useChatError: vi.fn(() => null),
  useClearChatError: vi.fn(() => vi.fn()),
  useSelectedModelId: () => mockUseSelectedModelId(),
  useSelectedProviderId: () => mockUseSelectedProviderId(),
  useSetCurrentView: () => mockSetCurrentView,
  useLLMProviders: () => mockUseLLMProviders(),
  useLLMHealthStatus: () => mockUseLLMHealthStatus(),
  useFetchProviders: () => mockUseFetchProviders(),
  useSelectProvider: () => mockUseSelectProvider(),
  useSelectModel: () => mockUseSelectModel(),
  useCheckLLMHealth: () => mockUseCheckLLMHealth(),
  useIsSending: () => false,
}));

// ---------------------------------------------------------------------------
// Import: テスト対象
// ---------------------------------------------------------------------------
import { ChatView } from "../index";

// ---------------------------------------------------------------------------
// テストデータ
// ---------------------------------------------------------------------------
const TEST_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-4", name: "GPT-4", isDefault: true, contextWindow: 128000 },
      { id: "gpt-3.5", name: "GPT-3.5", isDefault: false },
    ],
  },
];

describe("ChatView InlineModelSelector 統合テスト", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseSelectedModelId.mockReturnValue(null);
    mockUseSelectedProviderId.mockReturnValue(null);
    mockUseLLMProviders.mockReturnValue([]);
    mockUseLLMHealthStatus.mockReturnValue({});

    const store = await import("@/renderer/store");
    vi.mocked(store.useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
    vi.mocked(store.useChatError).mockReturnValue(null);
    vi.mocked(store.useClearChatError).mockReturnValue(vi.fn());
  });

  // =========================================================================
  // TC-I-1: ChatViewヘッダーにInlineModelSelectorが表示される
  // =========================================================================
  it("TC-I-1: ChatViewヘッダーにInlineModelSelectorが表示される", () => {
    mockUseLLMProviders.mockReturnValue(TEST_PROVIDERS);
    mockUseSelectedProviderId.mockReturnValue("openai");
    mockUseSelectedModelId.mockReturnValue("gpt-4");

    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    // InlineModelSelectorのトリガーボタン（role="combobox"）が表示される
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  // =========================================================================
  // TC-I-2: モデル選択後にチャット送信が動作する
  // =========================================================================
  it("TC-I-2: モデル選択後にチャット送信が動作する", async () => {
    mockUseLLMProviders.mockReturnValue(TEST_PROVIDERS);
    mockUseSelectedProviderId.mockReturnValue("openai");
    mockUseSelectedModelId.mockReturnValue("gpt-4");

    const mockSetChatInput = vi.fn();
    const store = await import("@/renderer/store");
    vi.mocked(store.useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) =>
      selector(
        createMockState({
          chatInput: "テストメッセージ",
          setChatInput: mockSetChatInput,
          sendMessage: mockSendMessage,
        }),
      )) as never);

    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    // 送信ボタンをクリック
    const sendButton = screen.getByRole("button", { name: /送信/i });
    await act(async () => {
      fireEvent.click(sendButton);
    });

    expect(mockSendMessage).toHaveBeenCalled();
  });

  // =========================================================================
  // TC-I-3: モデル未選択時にLLMGuidanceBannerが表示される
  // =========================================================================
  it("TC-I-3: モデル未選択時にLLMGuidanceBannerが表示される", () => {
    mockUseSelectedModelId.mockReturnValue(null);
    mockUseSelectedProviderId.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    // LLMGuidanceBannerのrole="alert"が表示される
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/AIモデルが選択されていません/),
    ).toBeInTheDocument();
  });

  // =========================================================================
  // TC-I-4: モデル選択後にLLMGuidanceBannerが非表示になる
  // =========================================================================
  it("TC-I-4: モデル選択後にLLMGuidanceBannerが非表示になる", () => {
    mockUseSelectedModelId.mockReturnValue("gpt-4");
    mockUseSelectedProviderId.mockReturnValue("openai");

    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    // LLMGuidanceBannerが表示されない
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // =========================================================================
  // TC-I-5: ストリーミング中はInlineModelSelectorがdisabledになる
  // =========================================================================
  it("TC-I-5: ストリーミング中はInlineModelSelectorがdisabledになる", async () => {
    mockUseLLMProviders.mockReturnValue(TEST_PROVIDERS);
    mockUseSelectedProviderId.mockReturnValue("openai");
    mockUseSelectedModelId.mockReturnValue("gpt-4");

    const store = await import("@/renderer/store");
    vi.mocked(store.useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) =>
      selector(
        createMockState({
          isSending: true,
        }),
      )) as never);

    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    // InlineModelSelectorのcomboboxボタンがdisabledになる
    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeDisabled();
  });

  // =========================================================================
  // Phase 6: エッジケーステスト
  // =========================================================================

  // TC-E-1: プロバイダー0件時のChatView表示
  it("TC-E-1: プロバイダー0件時はInlineModelSelectorの空状態が表示される", () => {
    mockUseLLMProviders.mockReturnValue([]);
    mockUseSelectedProviderId.mockReturnValue(null);
    mockUseSelectedModelId.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    // InlineModelSelectorは表示される（プレースホルダー「モデルを選択」）
    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeInTheDocument();
    // LLMGuidanceBannerも表示される
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // TC-E-2: ストリーミング中にドロップダウンが操作不可
  it("TC-E-2: ストリーミング中はInlineModelSelectorのクリックが無効", async () => {
    mockUseLLMProviders.mockReturnValue(TEST_PROVIDERS);
    mockUseSelectedProviderId.mockReturnValue("openai");
    mockUseSelectedModelId.mockReturnValue("gpt-4");

    const store = await import("@/renderer/store");
    vi.mocked(store.useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) =>
      selector(
        createMockState({
          isSending: true,
        }),
      )) as never);

    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox).toBeDisabled();
    // disabled時にクリックしてもlistboxは開かない
    fireEvent.click(combobox);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // TC-E-3: InlineModelSelectorとLLMGuidanceBannerが同時に表示される
  it("TC-E-3: モデル未選択時にInlineModelSelectorとLLMGuidanceBannerが共存する", () => {
    mockUseLLMProviders.mockReturnValue(TEST_PROVIDERS);
    mockUseSelectedProviderId.mockReturnValue(null);
    mockUseSelectedModelId.mockReturnValue(null);

    render(
      <MemoryRouter>
        <ChatView />
      </MemoryRouter>,
    );

    // 両方が同時に表示される
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText(/AIモデルが選択されていません/),
    ).toBeInTheDocument();
  });
});
