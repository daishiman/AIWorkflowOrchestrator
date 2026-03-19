/**
 * @file ChatPanel.settings-sync.test.tsx
 * @description ChatPanel 設定同期 & Capability 表示テスト（TDD: Red → Green）
 * @phase Phase 5: 実装
 * @task TASK-IMP-CHATPANEL-REAL-AI-CHAT-001
 *
 * テストケース一覧:
 *   C-01: selected config が Store に設定されている場合 → startStream に providerId/modelId が含まれる
 *   C-02: selected config が未設定の場合 → blocked 状態、エラーメッセージ表示
 *   C-03: API key 未設定（API_KEY_MISSING）の場合 → blocked 状態、Settings 誘導 CTA 表示
 *   C-04: API key 無効（API_KEY_INVALID）の場合 → error 状態、ChatMessageList にエラー表示
 *   C-05: capability=integratedRuntime の場合 → RuntimeBanner に「API 利用可能」表示、composer 有効
 *   C-06: capability=terminalSurface の場合 → RuntimeBanner に「Terminal 利用可能」表示
 *   C-07: capability=both の場合 → RuntimeBanner に両方利用可能を表示
 *   C-08: capability=none の場合 → RuntimeBanner に「設定が必要」表示、blocked 状態
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ============================================
// Store Mock
// ============================================

const mockFetchSkills = vi.fn();
const mockAbortExecution = vi.fn();
const mockStartStream = vi.fn();
const mockCancelStream = vi.fn();
const mockSetChatInput = vi.fn();

let mockStoreState: Record<string, unknown> = {};

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    return selector(mockStoreState);
  }),
  useIsSkillExecuting: vi.fn(() => Boolean(mockStoreState.isExecuting)),
  useSkillStore: vi.fn(() => ({
    availableSkills: [],
    importedSkills: [],
    selectedSkillName: null,
    isLoadingSkills: false,
    isScanning: false,
    selectSkillByName: vi.fn(),
    fetchSkills: mockFetchSkills,
    rescanSkills: vi.fn(),
  })),
  // LLM 個別セレクタ (P31 対応)
  useSelectedProviderId: vi.fn(() => mockStoreState.selectedProviderId ?? null),
  useSelectedModelId: vi.fn(() => mockStoreState.selectedModelId ?? null),
  useChatPanelStatus: vi.fn(() => mockStoreState.chatPanelStatus ?? "idle"),
}));

// ============================================
// useStreamingChat Hook Mock (state/actions 構造)
// ============================================

let mockStreamingState = {
  content: "",
  isStreaming: false,
  error: null as { code: string; message: string; retryable: boolean } | null,
  requestId: null as string | null,
};

vi.mock("../../../hooks/useStreamingChat", () => ({
  useStreamingChat: vi.fn(() => ({
    state: mockStreamingState,
    actions: {
      startStream: mockStartStream,
      cancelStream: mockCancelStream,
    },
  })),
}));

// ============================================
// IPC Mock (window.electronAPI)
// ============================================

const mockLLMStreamChat = vi.fn();
const mockLLMCheckHealth = vi.fn();
const mockLLMSetSelectedConfig = vi.fn();
const mockLLMOnStreamChunk = vi.fn(() => vi.fn());
const mockLLMOnStreamEnd = vi.fn(() => vi.fn());
const mockLLMOnStreamError = vi.fn(() => vi.fn());
const mockLLMCancelStream = vi.fn();

const mockStreamChatSetup = () => {
  Object.defineProperty(window, "electronAPI", {
    value: {
      llm: {
        streamChat: mockLLMStreamChat,
        checkHealth: mockLLMCheckHealth,
        setSelectedConfig: mockLLMSetSelectedConfig,
        onStreamChunk: mockLLMOnStreamChunk,
        onStreamEnd: mockLLMOnStreamEnd,
        onStreamError: mockLLMOnStreamError,
        cancelStream: mockLLMCancelStream,
      },
      authKey: {
        exists: vi.fn().mockResolvedValue({ exists: true, source: "saved" }),
      },
    },
    writable: true,
    configurable: true,
  });
};

// ============================================
// Component Mocks
// ============================================

vi.mock("../../skill/SkillSelector", () => ({
  SkillSelector: () => (
    <div data-testid="mock-skill-selector">SkillSelector</div>
  ),
}));

vi.mock("../../skill/SkillImportDialog", () => ({
  SkillImportDialog: ({
    skill,
    isOpen,
    onClose,
  }: {
    skill: { name: string };
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="mock-skill-import-dialog">
        {skill.name}
        <button data-testid="mock-import-dialog-close" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock("../../skill/PermissionDialog", () => ({
  PermissionDialog: () => (
    <div data-testid="mock-permission-dialog">PermissionDialog</div>
  ),
}));

vi.mock("../../skill/SkillStreamingView", () => ({
  SkillStreamingView: ({
    skillName,
  }: {
    skillName: string;
    messages: unknown[];
    status: string | null;
  }) => <div data-testid="mock-skill-streaming-view">{skillName}</div>,
}));

vi.mock("../../skill/SkillManagementPanel", () => ({
  SkillManagementPanel: () => (
    <div data-testid="mock-skill-management-panel">SkillManagementPanel</div>
  ),
}));

// RuntimeBanner のモック（capability を受け取り data-testid で識別可能にする）
vi.mock("../RuntimeBanner", () => ({
  RuntimeBanner: ({ capability }: { capability: string; status?: string }) => (
    <div
      data-testid="mock-runtime-banner"
      data-capability={capability}
      role="status"
    >
      {capability === "integratedRuntime" && "API利用中"}
      {capability === "terminalSurface" && "Terminal経由"}
      {capability === "both" && "API利用中 + Terminal"}
      {capability === "none" && "設定が必要です"}
    </div>
  ),
}));

// ChatMessageList のモック
vi.mock("../ChatMessageList", () => ({
  ChatMessageList: ({
    error,
  }: {
    messages: unknown[];
    isStreaming: boolean;
    streamingContent: string;
    onCancelStream: () => void;
    error: { code: string; message: string } | null;
  }) => (
    <div data-testid="mock-chat-message-list">
      {error && (
        <div data-testid="mock-chat-error" data-error-code={error.code}>
          {error.message}
        </div>
      )}
    </div>
  ),
}));

// HandoffBlock のモック
vi.mock("../HandoffBlock", () => ({
  HandoffBlock: ({
    guidance,
  }: {
    guidance: string;
    onOpenTerminal: () => void;
  }) => <div data-testid="mock-handoff-block">{guidance}</div>,
}));

// LLMSelectorPanel のモック
vi.mock("../LLMSelectorPanel", () => ({
  LLMSelectorPanel: () => (
    <div data-testid="mock-llm-selector-panel">LLMSelectorPanel</div>
  ),
}));

// ComposerArea のモック（disabled 状態を data-testid で識別可能にする）
vi.mock("../ComposerArea", () => ({
  ComposerArea: ({
    disabled,
    onSubmit,
    onSend,
  }: {
    disabled?: boolean;
    onSubmit?: (message: string) => void;
    onSend?: (message: string) => void;
    isStreaming?: boolean;
    onCancel?: () => void;
    value?: string;
    onChange?: (v: string) => void;
    canSubmit?: boolean;
    placeholder?: string;
  }) => (
    <div data-testid="mock-composer-area">
      <input
        data-testid="mock-composer-input"
        disabled={disabled}
        placeholder="メッセージを入力"
      />
      <button
        data-testid="mock-send-button"
        disabled={disabled}
        onClick={() => {
          onSubmit?.("テストメッセージ");
          onSend?.("テストメッセージ");
        }}
      >
        送信する
      </button>
    </div>
  ),
}));

// ErrorGuidance のモック
vi.mock("../ErrorGuidance", () => ({
  ErrorGuidance: ({
    code,
    onNavigateToSettings,
  }: {
    code: string;
    message: string;
    retryable: boolean;
    onNavigateToSettings?: () => void;
    onRetry?: () => void;
  }) => (
    <div data-testid="mock-error-guidance" data-error-code={code} role="alert">
      {code === "API_KEY_MISSING" && (
        <>
          <span>APIキーが設定されていません</span>
          <button
            data-testid="mock-settings-cta"
            onClick={onNavigateToSettings}
          >
            設定を開く
          </button>
        </>
      )}
      {code === "API_KEY_INVALID" && (
        <>
          <span>APIキーが無効です</span>
          <button
            data-testid="mock-settings-redirect"
            onClick={onNavigateToSettings}
          >
            設定を開く
          </button>
        </>
      )}
      {code === "CONFIG_MISSING" && (
        <span>プロバイダーとモデルを選択してください</span>
      )}
    </div>
  ),
}));

import { ChatPanel } from "../ChatPanel";

// ============================================
// Helpers
// ============================================

function setStoreState(overrides: Partial<Record<string, unknown>> = {}) {
  mockStoreState = {
    selectedSkillName: null,
    streamingMessages: [],
    isExecuting: false,
    skillExecutionStatus: null,
    pendingPermission: null,
    fetchSkills: mockFetchSkills,
    abortExecution: mockAbortExecution,
    // LLM 設定（デフォルト: 未選択）
    selectedProviderId: null,
    selectedModelId: null,
    // ChatPanel ステータス（デフォルト: idle）
    chatPanelStatus: "idle",
    // capability（デフォルト: none）- 実装は resolvedCapability を参照
    resolvedCapability: "none",
    // ChatPanel 必須フィールド
    chatMessages: [],
    chatInput: "",
    setChatInput: mockSetChatInput,
    providers: [],
    handoffGuidance: null,
    ...overrides,
  };
}

// ============================================
// Tests
// ============================================

describe("ChatPanel - Settings Sync & Capability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStreamingState = {
      content: "",
      isStreaming: false,
      error: null,
      requestId: null,
    };
    setStoreState();
    mockStreamChatSetup();
  });

  // ============================================================
  // C-01〜C-02: Selected Config Sync
  // ============================================================
  describe("C-01〜C-02: Selected Config Sync", () => {
    it("C-01: selected config が Store に設定されている場合 → startStream に providerId/modelId が含まれる", async () => {
      // Arrange: selectedProviderId / selectedModelId がストアに設定された状態
      setStoreState({
        selectedProviderId: "anthropic",
        selectedModelId: "claude-3-5-sonnet-20241022",
        chatPanelStatus: "ready",
        resolvedCapability: "integratedRuntime",
      });

      render(<ChatPanel />);

      // Act: 送信ボタンをクリックしてメッセージを送信
      const sendButton = screen.getByTestId("mock-send-button");
      await act(async () => {
        fireEvent.click(sendButton);
      });

      // Assert: startStream が呼ばれ、providerId / modelId が含まれていること
      // （P62対策: DEFAULT_CONFIG fallback なし。selectedProviderId/modelId を使用）
      expect(mockStartStream).toHaveBeenCalledWith(
        expect.objectContaining({
          providerId: "anthropic",
          modelId: "claude-3-5-sonnet-20241022",
        }),
      );
    });

    it("C-02: selected config が未設定の場合 → blocked 状態、エラーメッセージ表示", async () => {
      // Arrange: selectedProviderId / selectedModelId が null の状態
      // P62対策: DEFAULT_CONFIG fallback なし → blocked 状態になること
      setStoreState({
        selectedProviderId: null,
        selectedModelId: null,
        chatPanelStatus: "blocked",
        resolvedCapability: "none",
      });

      render(<ChatPanel />);

      // Assert: blocked 状態では ComposerArea が表示されないこと
      const composerArea = screen.queryByTestId("mock-composer-area");
      expect(composerArea).not.toBeInTheDocument();

      // エラーガイダンス（API_KEY_MISSING）が表示されていること
      const errorGuidance = screen.getByTestId("mock-error-guidance");
      expect(errorGuidance).toBeInTheDocument();
      expect(errorGuidance).toHaveAttribute(
        "data-error-code",
        "API_KEY_MISSING",
      );

      // streamChat は呼ばれないこと（fallback なし）
      expect(mockStartStream).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // C-03〜C-04: Missing Credentials
  // ============================================================
  describe("C-03〜C-04: Missing Credentials", () => {
    it("C-03: API key 未設定（API_KEY_MISSING）の場合 → blocked 状態、Settings 誘導 CTA 表示", async () => {
      // Arrange: API key が設定されていない状態 → blocked
      // selectedProviderId null → blockedErrorCode = "API_KEY_MISSING"
      setStoreState({
        selectedProviderId: null,
        selectedModelId: null,
        chatPanelStatus: "blocked",
        resolvedCapability: "none",
      });

      render(<ChatPanel />);

      // Assert: ErrorGuidance が API_KEY_MISSING で表示されていること
      const errorGuidance = screen.getByTestId("mock-error-guidance");
      expect(errorGuidance).toBeInTheDocument();
      expect(errorGuidance).toHaveAttribute(
        "data-error-code",
        "API_KEY_MISSING",
      );

      // Settings 誘導 CTA ボタンが存在すること
      const settingsCta = screen.getByTestId("mock-settings-cta");
      expect(settingsCta).toBeInTheDocument();
      expect(settingsCta).toHaveTextContent("設定を開く");

      // blocked 状態では ComposerArea が非表示
      const composerArea = screen.queryByTestId("mock-composer-area");
      expect(composerArea).not.toBeInTheDocument();
    });

    it("C-04: API key 無効（API_KEY_INVALID）の場合 → error 状態、ChatMessageList にエラー表示", async () => {
      // Arrange: API key が無効な状態 → error（blocked ではない）
      // error 状態では ChatMessageList が描画され、streamingState.error 経由でエラーを表示
      setStoreState({
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
        chatPanelStatus: "error",
        resolvedCapability: "integratedRuntime",
      });

      mockStreamingState = {
        content: "",
        isStreaming: false,
        error: {
          code: "API_KEY_INVALID",
          message: "APIキーが無効です",
          retryable: false,
        },
        requestId: null,
      };

      render(<ChatPanel />);

      // Assert: ChatMessageList が描画され、error が渡されていること
      const chatError = screen.getByTestId("mock-chat-error");
      expect(chatError).toBeInTheDocument();
      expect(chatError).toHaveAttribute("data-error-code", "API_KEY_INVALID");
      expect(chatError).toHaveTextContent("APIキーが無効です");

      // error 状態でも ComposerArea は表示される（blocked/handoff でないため）
      const composerArea = screen.getByTestId("mock-composer-area");
      expect(composerArea).toBeInTheDocument();
    });
  });

  // ============================================================
  // C-05〜C-08: Capability Variants
  // ============================================================
  describe("C-05〜C-08: Capability Variants", () => {
    it("C-05: capability=integratedRuntime の場合 → RuntimeBanner に「API 利用可能」表示、composer 有効", () => {
      // Arrange: capability が integratedRuntime（API 直接利用可能）
      setStoreState({
        selectedProviderId: "anthropic",
        selectedModelId: "claude-3-5-sonnet-20241022",
        chatPanelStatus: "ready",
        resolvedCapability: "integratedRuntime",
      });

      render(<ChatPanel />);

      // Assert: RuntimeBanner が integratedRuntime を表示していること
      const runtimeBanner = screen.getByTestId("mock-runtime-banner");
      expect(runtimeBanner).toBeInTheDocument();
      expect(runtimeBanner).toHaveAttribute(
        "data-capability",
        "integratedRuntime",
      );
      // バッジラベル「API利用中」が表示されていること
      expect(runtimeBanner).toHaveTextContent("API利用中");

      // ComposerArea が有効（disabled でない）こと
      const sendButton = screen.getByTestId("mock-send-button");
      expect(sendButton).not.toBeDisabled();

      const composerInput = screen.getByTestId("mock-composer-input");
      expect(composerInput).not.toBeDisabled();
    });

    it("C-06: capability=terminalSurface の場合 → RuntimeBanner に「Terminal 利用可能」表示", () => {
      // Arrange: capability が terminalSurface（Terminal 経由のみ）
      setStoreState({
        selectedProviderId: null,
        selectedModelId: null,
        chatPanelStatus: "handoff",
        resolvedCapability: "terminalSurface",
        handoffGuidance: "Terminal経由で利用してください",
      });

      render(<ChatPanel />);

      // Assert: RuntimeBanner が terminalSurface を表示していること
      const runtimeBanner = screen.getByTestId("mock-runtime-banner");
      expect(runtimeBanner).toBeInTheDocument();
      expect(runtimeBanner).toHaveAttribute(
        "data-capability",
        "terminalSurface",
      );
      // バッジラベル「Terminal経由」が表示されていること
      expect(runtimeBanner).toHaveTextContent("Terminal経由");
    });

    it("C-07: capability=both の場合 → RuntimeBanner に両方利用可能を表示", () => {
      // Arrange: capability が both（API + Terminal の両方利用可能）
      setStoreState({
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
        chatPanelStatus: "ready",
        resolvedCapability: "both",
      });

      render(<ChatPanel />);

      // Assert: RuntimeBanner が both を表示していること
      const runtimeBanner = screen.getByTestId("mock-runtime-banner");
      expect(runtimeBanner).toBeInTheDocument();
      expect(runtimeBanner).toHaveAttribute("data-capability", "both");
      // バッジラベルに「API利用中 + Terminal」が表示されていること
      expect(runtimeBanner).toHaveTextContent("API利用中 + Terminal");
    });

    it("C-08: capability=none の場合 → RuntimeBanner に「設定が必要」表示、blocked 状態", () => {
      // Arrange: capability が none（API も Terminal も利用不可）
      setStoreState({
        selectedProviderId: null,
        selectedModelId: null,
        chatPanelStatus: "blocked",
        resolvedCapability: "none",
      });

      render(<ChatPanel />);

      // Assert: RuntimeBanner が none を表示していること
      const runtimeBanner = screen.getByTestId("mock-runtime-banner");
      expect(runtimeBanner).toBeInTheDocument();
      expect(runtimeBanner).toHaveAttribute("data-capability", "none");
      // バッジラベル「設定が必要です」が表示されていること
      expect(runtimeBanner).toHaveTextContent("設定が必要です");

      // blocked 状態: ComposerArea が非表示であること
      const composerArea = screen.queryByTestId("mock-composer-area");
      expect(composerArea).not.toBeInTheDocument();

      // startStream は呼ばれないこと
      expect(mockStartStream).not.toHaveBeenCalled();
    });
  });
});
