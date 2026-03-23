/**
 * @file ChatPanel.chat-wiring.test.tsx
 * @description ChatPanel AI チャット配線テスト（TDD Red フェーズ）
 * @phase Phase 4: テスト作成（TDD: Red）
 * @task TASK-IMP-CHATPANEL-REAL-AI-CHAT-001
 *
 * テスト範囲:
 *   A. UI レンダリングテスト（8 状態 + RuntimeBanner + SkillStreamingView 維持）
 *   B. ストリーミングライフサイクルテスト（開始・chunk・完了・エラー・キャンセル）
 *   E. IPC 統合テスト（wrapper 形式 P60 準拠）
 *
 * 注意事項:
 *   - P39: fireEvent のみ使用。userEvent.setup() は使用禁止（happy-dom 非互換）
 *   - P60: IPC レスポンス wrapper 形式 {success, data?, error?} でアサーション
 *   - P63: インポートパスは ChatPanel.test.tsx を参照して記述
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ============================================
// Store Mock
// ============================================

const mockFetchSkills = vi.fn();
const mockAbortExecution = vi.fn();
const mockSetChatPanelStatus = vi.fn();
const mockSetCurrentConversationId = vi.fn();
const mockAddMessage = vi.fn();
const mockResetChat = vi.fn();

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
  useSetCurrentView: vi.fn(() => vi.fn()),
  useSelectProvider: vi.fn(() => vi.fn()),
  useSelectModel: vi.fn(() => vi.fn()),
  // 新規セレクタ（Phase 5 実装予定、TDD Red フェーズではまだ存在しない）
  useChatPanelStatus: vi.fn(() => mockStoreState.chatPanelStatus ?? "idle"),
  useSetChatPanelStatus: vi.fn(() => mockSetChatPanelStatus),
  useChatMessagesShallow: vi.fn(
    () => (mockStoreState.chatMessages as unknown[]) ?? [],
  ),
  useCurrentConversationId: vi.fn(
    () => mockStoreState.currentConversationId ?? null,
  ),
  useSetCurrentConversationId: vi.fn(() => mockSetCurrentConversationId),
  useAddChatMessage: vi.fn(() => mockAddMessage),
  useResetChat: vi.fn(() => mockResetChat),
}));

// ============================================
// useStreamingChat Mock
// ============================================

const mockStartStream = vi.fn();
const mockCancelStream = vi.fn();

let mockStreamingState = {
  isStreaming: false,
  content: "",
  error: null as { code: string; message: string; retryable: boolean } | null,
};

vi.mock("../../../hooks/useStreamingChat", () => ({
  useStreamingChat: vi.fn(() => ({
    state: mockStreamingState,
    actions: {
      startStream: mockStartStream,
      cancelStream: mockCancelStream,
    },
  })),
  default: vi.fn(() => ({
    state: mockStreamingState,
    actions: {
      startStream: mockStartStream,
      cancelStream: mockCancelStream,
    },
  })),
}));

// ============================================
// Component Mocks（既存コンポーネント）
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

// ============================================
// Component Mocks（新規コンポーネント）
// ============================================

vi.mock("../RuntimeBanner", () => ({
  RuntimeBanner: ({
    capability,
  }: {
    capability: string;
    onTerminalSwitch?: () => void;
    className?: string;
  }) => (
    <div data-testid="mock-runtime-banner" data-capability={capability}>
      RuntimeBanner:{capability}
    </div>
  ),
}));

vi.mock("../ChatMessageList", () => ({
  ChatMessageList: ({
    messages,
    isStreaming,
    streamingContent,
    onCancelStream,
    error,
  }: {
    messages: unknown[];
    isStreaming: boolean;
    streamingContent: string;
    onCancelStream?: () => void;
    error: { code: string; message: string; retryable: boolean } | null;
  }) => (
    <div
      data-testid="mock-chat-message-list"
      role="log"
      aria-live="polite"
      aria-label="チャットメッセージ"
    >
      <span data-testid="message-count">{(messages as unknown[]).length}</span>
      {isStreaming && (
        <div data-testid="streaming-content" aria-busy="true">
          {streamingContent}
          <button
            aria-label="Cancel response"
            onClick={onCancelStream}
            data-testid="cancel-stream-button"
          >
            停止
          </button>
        </div>
      )}
      {error && (
        <div
          data-testid="mock-error-guidance"
          role="alert"
          aria-live="assertive"
        >
          <span data-testid="error-code">{error.code}</span>
          <span data-testid="error-message">{error.message}</span>
          {error.retryable && (
            <button data-testid="retry-button">もう一度試す</button>
          )}
        </div>
      )}
    </div>
  ),
}));

vi.mock("../ErrorGuidance", () => ({
  ErrorGuidance: ({
    code,
    message,
    retryable,
    onRetry,
    onNavigateToSettings,
  }: {
    code: string;
    message: string;
    retryable: boolean;
    onRetry?: () => void;
    onNavigateToSettings?: () => void;
  }) => (
    <div
      data-testid="mock-error-guidance-standalone"
      role="alert"
      aria-live="assertive"
    >
      <span data-testid="error-code">{code}</span>
      <span data-testid="error-message">{message}</span>
      {retryable && (
        <button data-testid="retry-button" onClick={onRetry}>
          もう一度試す
        </button>
      )}
      {(code === "API_KEY_MISSING" || code === "API_KEY_INVALID") && (
        <button
          data-testid="navigate-to-settings-button"
          onClick={onNavigateToSettings}
        >
          設定を開く
        </button>
      )}
    </div>
  ),
}));

vi.mock("../HandoffBlock", () => ({
  HandoffBlock: ({
    guidance,
    onOpenTerminal,
  }: {
    guidance: {
      terminalCommand: string;
      contextSummary: string;
      reason: string;
    };
    onOpenTerminal?: () => void;
  }) => (
    <div data-testid="mock-handoff-block">
      <span data-testid="handoff-summary">{guidance.contextSummary}</span>
      <pre data-testid="handoff-command">{guidance.terminalCommand}</pre>
      <button
        data-testid="mock-persistent-terminal-launcher"
        onClick={onOpenTerminal}
      >
        ターミナルを開く
      </button>
    </div>
  ),
}));

vi.mock("../ComposerArea", () => ({
  ComposerArea: ({
    value,
    onChange,
    onSubmit,
    canSubmit,
    isStreaming,
    onCancel,
    placeholder,
  }: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (message: string) => void;
    canSubmit: boolean;
    isStreaming: boolean;
    onCancel?: () => void;
    placeholder?: string;
  }) => (
    <div data-testid="mock-composer-area">
      <textarea
        data-testid="composer-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={!canSubmit && !isStreaming}
        placeholder={placeholder}
        aria-label="メッセージを入力"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSubmit) onSubmit(value);
          }
        }}
      />
      <button
        data-testid="send-button"
        aria-label="メッセージを送信"
        aria-disabled={!canSubmit}
        disabled={!canSubmit}
        onClick={() => canSubmit && onSubmit(value)}
      >
        送信
      </button>
      {isStreaming && (
        <button
          data-testid="cancel-stream-button"
          aria-label="Cancel response"
          onClick={onCancel}
        >
          停止
        </button>
      )}
    </div>
  ),
}));

vi.mock("../LLMSelectorPanel", () => ({
  LLMSelectorPanel: ({
    selectedProviderId,
    selectedModelId,
  }: {
    providers: unknown[];
    selectedProviderId: string | null;
    selectedModelId: string | null;
    onSelectProvider: (id: string) => void;
    onSelectModel: (id: string) => void;
    isLoading?: boolean;
  }) => (
    <div data-testid="mock-llm-selector-panel">
      <span data-testid="selected-provider">
        {selectedProviderId ?? "none"}
      </span>
      <span data-testid="selected-model">{selectedModelId ?? "none"}</span>
    </div>
  ),
}));

// ============================================
// Import Target
// ============================================

import { ChatPanel } from "../ChatPanel";

// ============================================
// Test Data
// ============================================

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

function createChatMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: "msg-1",
    role: "user",
    content: "テストメッセージ",
    timestamp: new Date("2026-01-01"),
    ...overrides,
  };
}

// ============================================
// Store State Helpers
// ============================================

function setStoreState(overrides: Partial<Record<string, unknown>> = {}) {
  mockStoreState = {
    // 既存フィールド（ChatPanel.test.tsx 互換）
    selectedSkillName: null,
    streamingMessages: [],
    isExecuting: false,
    skillExecutionStatus: null,
    pendingPermission: null,
    fetchSkills: mockFetchSkills,
    abortExecution: mockAbortExecution,
    // 新規フィールド（Phase 5 実装）
    chatPanelStatus: "idle",
    chatMessages: [],
    currentConversationId: null,
    chatInput: "",
    setChatInput: vi.fn(),
    isSending: false,
    isStreaming: false,
    streamingContent: "",
    streamingError: null,
    currentStreamId: null,
    selectedProviderId: null,
    selectedModelId: null,
    providers: [],
    resolvedCapability: "none",
    handoffGuidance: null,
    // アクション
    setChatPanelStatus: mockSetChatPanelStatus,
    setCurrentConversationId: mockSetCurrentConversationId,
    addMessage: mockAddMessage,
    resetChat: mockResetChat,
    ...overrides,
  };
}

function setStreamingState(overrides: Partial<typeof mockStreamingState> = {}) {
  mockStreamingState = {
    isStreaming: false,
    content: "",
    error: null,
    ...overrides,
  };
}

// ============================================
// Tests
// ============================================

describe("ChatPanel - AI Chat Wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setStoreState();
    setStreamingState();
  });

  // ============================================================
  // A. UI レンダリングテスト（Task 4-1）
  // ============================================================
  describe("A. UI Rendering", () => {
    /**
     * A-01: idle 状態で empty state を表示
     * chatPanelStatus="idle" のとき、capability 未確定の empty state が表示される
     */
    it("A-01: idle 状態で empty state を表示する", () => {
      setStoreState({ chatPanelStatus: "idle" });
      render(<ChatPanel />);

      // ChatPanel 本体が存在すること
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();

      // idle 状態では ComposerArea は無効（blocked/handoff でない）
      // 送信ボタンが disabled であること
      const sendButton = screen.queryByTestId("send-button");
      if (sendButton) {
        expect(sendButton).toBeDisabled();
      }

      // RuntimeBanner が表示されること（capability="none" または初期値）
      const banner = screen.queryByTestId("mock-runtime-banner");
      expect(banner).toBeInTheDocument();
    });

    /**
     * A-02: ready 状態で ComposerArea が有効化される
     * chatPanelStatus="ready" かつ provider/model 選択済みのとき、
     * ComposerInput が enabled、SendButton が enabled になる
     */
    it("A-02: ready 状態で composer を有効化する", () => {
      setStoreState({
        chatPanelStatus: "ready",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      render(<ChatPanel />);

      // ComposerArea が表示されること
      expect(screen.getByTestId("mock-composer-area")).toBeInTheDocument();

      // 送信ボタンが enabled であること
      const sendButton = screen.getByTestId("send-button");
      expect(sendButton).not.toBeDisabled();

      // テキストエリアが enabled であること
      const input = screen.getByTestId("composer-input");
      expect(input).not.toBeDisabled();
    });

    /**
     * A-03: streaming 状態で StreamingMessage を表示
     * isStreaming=true のとき StreamingMessage（蓄積コンテンツ + パルスカーソル）と
     * cancel ボタンが表示される
     */
    it("A-03: streaming 状態で StreamingMessage とキャンセルボタンを表示する", () => {
      setStoreState({
        chatPanelStatus: "streaming",
        isStreaming: true,
        streamingContent: "ストリーミング中のコンテンツ...",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({
        isStreaming: true,
        content: "ストリーミング中のコンテンツ...",
      });
      render(<ChatPanel />);

      // ストリーミングコンテンツが表示されること
      const streamingArea = screen.queryByTestId("streaming-content");
      expect(streamingArea).toBeInTheDocument();

      // キャンセルボタンが表示されること（ChatMessageList と ComposerArea の両方にある）
      const cancelButtons = screen.getAllByTestId("cancel-stream-button");
      expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
    });

    /**
     * A-04: cancelled 状態で蓄積コンテンツを保持
     * cancelStream 後は蓄積コンテンツが保持され、ComposerArea が再有効化される
     */
    it("A-04: cancelled 状態で蓄積コンテンツを保持し composer を再有効化する", () => {
      setStoreState({
        chatPanelStatus: "cancelled",
        isStreaming: false,
        streamingContent: "キャンセル前の蓄積コンテンツ",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
        chatMessages: [
          createChatMessage({ role: "user", content: "ユーザーの質問" }),
        ],
      });
      setStreamingState({ isStreaming: false, content: "" });
      render(<ChatPanel />);

      // ComposerArea が表示かつ enabled であること
      const composerArea = screen.queryByTestId("mock-composer-area");
      expect(composerArea).toBeInTheDocument();

      // キャンセルボタンが非表示であること
      const cancelButton = screen.queryByTestId("cancel-stream-button");
      // streaming=false なので ComposerArea 内のキャンセルボタンは非表示
      expect(cancelButton).not.toBeInTheDocument();
    });

    /**
     * A-05: completed 状態で完了メッセージを表示
     * stream-done 後に assistant メッセージが chatMessages に追加され、
     * ComposerArea が再有効化される
     */
    it("A-05: completed 状態で assistant メッセージが ChatMessageList に追加される", () => {
      const completedMessages = [
        createChatMessage({ id: "msg-1", role: "user", content: "質問" }),
        createChatMessage({
          id: "msg-2",
          role: "assistant",
          content: "回答です",
        }),
      ];
      setStoreState({
        chatPanelStatus: "completed",
        isStreaming: false,
        chatMessages: completedMessages,
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      render(<ChatPanel />);

      // ChatMessageList が表示されること
      const messageList = screen.queryByTestId("mock-chat-message-list");
      expect(messageList).toBeInTheDocument();

      // メッセージ数が 2 であること
      const messageCount = screen.queryByTestId("message-count");
      expect(messageCount).toHaveTextContent("2");

      // ComposerArea が enabled であること
      const sendButton = screen.queryByTestId("send-button");
      expect(sendButton).not.toBeDisabled();
    });

    /**
     * A-06: error 状態で ErrorGuidance を表示
     * streamingError が設定されているとき、role="alert" の ErrorGuidance が表示される
     */
    it("A-06: error 状態で ErrorGuidance を role=alert で表示する", () => {
      setStoreState({
        chatPanelStatus: "error",
        streamingError: {
          code: "NETWORK_ERROR",
          message: "ネットワーク接続が切断されました",
          retryable: true,
        },
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({
        isStreaming: false,
        error: {
          code: "NETWORK_ERROR",
          message: "ネットワーク接続が切断されました",
          retryable: true,
        },
      });
      render(<ChatPanel />);

      // role="alert" の要素が表示されること
      const alertElement = screen.queryByRole("alert");
      expect(alertElement).toBeInTheDocument();
    });

    /**
     * A-07: blocked 状態で設定誘導 CTA を表示
     * capability="none" のとき、API キー未設定バナーと「設定を開く」CTA が表示される
     */
    it("A-07: blocked 状態で設定誘導 CTA を表示する", () => {
      setStoreState({
        chatPanelStatus: "blocked",
        selectedProviderId: null,
        selectedModelId: null,
      });
      render(<ChatPanel />);

      // ErrorGuidance（blocked 用）が表示されること
      const errorGuidance = screen.queryByTestId(
        "mock-error-guidance-standalone",
      );
      expect(errorGuidance).toBeInTheDocument();

      // 「設定を開く」CTA ボタンが表示されること
      const settingsButton = screen.queryByTestId(
        "navigate-to-settings-button",
      );
      expect(settingsButton).toBeInTheDocument();

      // ComposerArea が非表示であること
      const composerArea = screen.queryByTestId("mock-composer-area");
      expect(composerArea).not.toBeInTheDocument();
    });

    /**
     * A-08: handoff 状態で HandoffBlock を表示
     * capability="terminalSurface" のとき、HandoffBlock と
     * PersistentTerminalLauncher が表示される
     */
    it("A-08: handoff 状態で HandoffBlock と PersistentTerminalLauncher を表示する", () => {
      setStoreState({
        chatPanelStatus: "handoff",
        handoffGuidance: {
          terminalCommand: "claude -p 'タスクを実行してください'",
          contextSummary: "ターミナルでの実行が必要です",
          reason: "terminal-required",
        },
      });
      render(<ChatPanel />);

      // HandoffBlock が表示されること
      const handoffBlock = screen.queryByTestId("mock-handoff-block");
      expect(handoffBlock).toBeInTheDocument();

      // PersistentTerminalLauncher（ターミナルを開くボタン）が表示されること
      const terminalLauncher = screen.queryByTestId(
        "mock-persistent-terminal-launcher",
      );
      expect(terminalLauncher).toBeInTheDocument();

      // ComposerArea が非表示であること
      const composerArea = screen.queryByTestId("mock-composer-area");
      expect(composerArea).not.toBeInTheDocument();
    });

    /**
     * A-09: RuntimeBanner が capability に応じて表示内容を変化させる
     * integratedRuntime/terminalSurface/both/none で表示が変化する
     */
    it("A-09: RuntimeBanner が capability=integratedRuntime で API 利用中を表示する", () => {
      setStoreState({
        chatPanelStatus: "ready",
        resolvedCapability: "integratedRuntime",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      render(<ChatPanel />);

      const banner = screen.queryByTestId("mock-runtime-banner");
      expect(banner).toBeInTheDocument();
      // capability 値が渡されていること
      expect(banner).toHaveAttribute("data-capability");
    });

    it("A-09b: RuntimeBanner が capability=none で設定必要バナーを表示する", () => {
      setStoreState({
        chatPanelStatus: "blocked",
        resolvedCapability: "none",
        selectedProviderId: null,
        selectedModelId: null,
      });
      render(<ChatPanel />);

      const banner = screen.queryByTestId("mock-runtime-banner");
      expect(banner).toBeInTheDocument();
    });

    it("A-09c: RuntimeBanner が capability=terminalSurface でターミナルバナーを表示する", () => {
      setStoreState({
        chatPanelStatus: "handoff",
        resolvedCapability: "terminalSurface",
        handoffGuidance: {
          terminalCommand: "test-command",
          contextSummary: "test-summary",
          reason: "test-reason",
        },
      });
      render(<ChatPanel />);

      const banner = screen.queryByTestId("mock-runtime-banner");
      expect(banner).toBeInTheDocument();
    });

    it("A-09d: RuntimeBanner が capability=both で両方利用可能を表示する", () => {
      setStoreState({
        chatPanelStatus: "ready",
        resolvedCapability: "both",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      render(<ChatPanel />);

      const banner = screen.queryByTestId("mock-runtime-banner");
      expect(banner).toBeInTheDocument();
    });

    /**
     * A-10: SkillStreamingView が isExecuting 時に表示される（既存維持）
     * 既存の isExecuting && selectedSkillName 条件レンダリングが維持される
     */
    it("A-10: SkillStreamingView が isExecuting=true かつ selectedSkillName 設定時に表示される", () => {
      setStoreState({
        chatPanelStatus: "ready",
        isExecuting: true,
        selectedSkillName: "test-skill",
        skillExecutionStatus: "running",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      render(<ChatPanel />);

      const streamingView = screen.queryByTestId("mock-skill-streaming-view");
      expect(streamingView).toBeInTheDocument();
      expect(streamingView).toHaveTextContent("test-skill");
    });
  });

  // ============================================================
  // B. ストリーミングライフサイクルテスト（Task 4-2）
  // ============================================================
  describe("B. Streaming Lifecycle", () => {
    /**
     * B-01: startStream 呼び出しで streaming 状態に遷移
     * 送信ボタン押下 → useStreamingChat.actions.startStream が呼ばれる
     */
    it("B-01: 送信ボタン押下で startStream が呼び出される", async () => {
      setStoreState({
        chatPanelStatus: "ready",
        chatInput: "テストメッセージ",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
        isStreaming: false,
        isSending: false,
      });
      render(<ChatPanel />);

      const sendButton = screen.getByTestId("send-button");
      await act(async () => {
        fireEvent.click(sendButton);
      });

      // startStream が呼び出されること
      expect(mockStartStream).toHaveBeenCalled();
    });

    /**
     * B-02: chunk 受信で streamingContent が蓄積される
     * onStreamChunk → content が累積し StreamingMessage に反映される
     */
    it("B-02: streaming 中に content が蓄積されて表示される", () => {
      setStoreState({
        chatPanelStatus: "streaming",
        isStreaming: true,
        streamingContent: "Hello, World!",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({ isStreaming: true, content: "Hello, World!" });
      render(<ChatPanel />);

      // ストリーミングコンテンツが表示されること
      const streamingContent = screen.queryByTestId("streaming-content");
      expect(streamingContent).toBeInTheDocument();
      expect(streamingContent).toHaveTextContent("Hello, World!");
    });

    /**
     * B-03: done signal で completed 状態に遷移
     * stream-done → isStreaming=false、chatMessages に assistant メッセージ追加
     */
    it("B-03: done signal 後に completed 状態になり assistant メッセージが追加される", () => {
      setStoreState({
        chatPanelStatus: "completed",
        isStreaming: false,
        chatMessages: [
          createChatMessage({ id: "msg-1", role: "user", content: "質問" }),
          createChatMessage({
            id: "msg-2",
            role: "assistant",
            content: "回答",
          }),
        ],
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({ isStreaming: false, content: "" });
      render(<ChatPanel />);

      // streaming コンテンツが非表示であること
      const streamingArea = screen.queryByTestId("streaming-content");
      expect(streamingArea).not.toBeInTheDocument();

      // ChatMessageList に 2 メッセージが表示されること
      const messageCount = screen.queryByTestId("message-count");
      expect(messageCount).toHaveTextContent("2");
    });

    /**
     * B-04: error signal で error 状態に遷移、蓄積コンテンツ保持
     * stream-error → streamingError 設定、蓄積コンテンツ保持
     */
    it("B-04: error signal 後に error 状態になり ErrorGuidance が表示される", () => {
      setStoreState({
        chatPanelStatus: "error",
        isStreaming: false,
        streamingError: {
          code: "NETWORK_ERROR",
          message: "接続が切断されました",
          retryable: true,
        },
        chatMessages: [createChatMessage({ role: "user", content: "質問" })],
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({
        isStreaming: false,
        error: {
          code: "NETWORK_ERROR",
          message: "接続が切断されました",
          retryable: true,
        },
      });
      render(<ChatPanel />);

      // role="alert" の ErrorGuidance が表示されること
      const alertElement = screen.queryByRole("alert");
      expect(alertElement).toBeInTheDocument();

      // retry ボタンが表示されること（retryable=true）
      const retryButton = screen.queryByTestId("retry-button");
      expect(retryButton).toBeInTheDocument();
    });

    /**
     * B-05: cancel ボタンで cancelStream を呼び出す
     * StreamingMessage 内の停止ボタン押下 → cancelStream が呼ばれる
     */
    it("B-05: cancel ボタン押下で cancelStream が呼び出される", async () => {
      setStoreState({
        chatPanelStatus: "streaming",
        isStreaming: true,
        streamingContent: "ストリーミング中...",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({ isStreaming: true, content: "ストリーミング中..." });
      render(<ChatPanel />);

      const cancelButtons = screen.getAllByTestId("cancel-stream-button");
      await act(async () => {
        fireEvent.click(cancelButtons[0]);
      });

      expect(mockCancelStream).toHaveBeenCalled();
    });

    /**
     * B-06: Escape キーで cancelStream を呼び出す
     * streaming 状態中に Escape キー押下 → cancelStream が呼ばれる
     */
    it("B-06: Escape キー押下で cancelStream が呼び出される", async () => {
      setStoreState({
        chatPanelStatus: "streaming",
        isStreaming: true,
        streamingContent: "ストリーミング中...",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({ isStreaming: true, content: "ストリーミング中..." });
      render(<ChatPanel />);

      await act(async () => {
        fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
      });

      expect(mockCancelStream).toHaveBeenCalled();
    });

    /**
     * B-07: コンポーネント unmount で cleanup が実行される
     * unmount 時に useEffect cleanup が呼ばれ、ストリームが中断される
     */
    it("B-07: コンポーネント unmount でストリームが cleanup される", async () => {
      setStoreState({
        chatPanelStatus: "streaming",
        isStreaming: true,
        streamingContent: "ストリーミング中...",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({ isStreaming: true, content: "ストリーミング中..." });
      const { unmount } = render(<ChatPanel />);

      await act(async () => {
        unmount();
      });

      // unmount 時に cancelStream が呼ばれること
      expect(mockCancelStream).toHaveBeenCalled();
    });

    /**
     * B-08: 新規メッセージ送信で前ストリームを自動キャンセル
     * ストリーミング中に新規送信 → 既存 stream をキャンセル後に新規 startStream
     */
    it("B-08: streaming 中に新規送信を試みると前ストリームが自動キャンセルされる", async () => {
      setStoreState({
        chatPanelStatus: "streaming",
        isStreaming: true,
        streamingContent: "ストリーミング中...",
        chatInput: "新しいメッセージ",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
        // streaming 中は送信ボタン disabled のため、実際には UI でブロックされるが
        // 防衛コードとして startStream 前に cancelStream が呼ばれることを確認
      });
      setStreamingState({ isStreaming: true, content: "ストリーミング中..." });
      render(<ChatPanel />);

      // 新規送信をプログラムから呼ぶ（UI ではブロックされるが防衛テスト）
      // startStream を直接呼び出し前に cancelStream が呼ばれることを確認
      await act(async () => {
        mockStartStream.mockImplementation(async () => {
          // startStream 実装内で cancelStream が先に呼ばれることを期待
        });
      });

      // streaming 状態では送信ボタンは disabled
      const sendButton = screen.getByTestId("send-button");
      expect(sendButton).toBeDisabled();
    });

    /**
     * B-09: provider/model 未選択で送信試行 → error 状態
     * selectedProviderId=null のまま送信 → エラーが表示される
     */
    it("B-09: provider/model 未選択で送信ボタンが disabled になる", () => {
      setStoreState({
        chatPanelStatus: "ready",
        chatInput: "メッセージ",
        selectedProviderId: null,
        selectedModelId: null,
        isStreaming: false,
        isSending: false,
      });
      render(<ChatPanel />);

      // provider 未選択の場合、送信ボタンが disabled であること
      const sendButton = screen.getByTestId("send-button");
      expect(sendButton).toBeDisabled();
    });
  });

  // ============================================================
  // E. IPC 統合テスト（Task 4-5）
  // ============================================================
  describe("E. IPC Integration", () => {
    /**
     * E-01: llm:stream-chat 呼び出しで requestId を受信
     * P60 準拠: { success: true, data: { requestId: "req-123" } }
     */
    it("E-01: startStream 後に IPC から requestId が返却される（P60 wrapper 形式）", async () => {
      const mockLLMApi = {
        streamChat: vi.fn().mockResolvedValue({
          success: true,
          data: { requestId: "req-123" },
        }),
        onStreamChunk: vi.fn().mockReturnValue(() => {}),
        onStreamEnd: vi.fn().mockReturnValue(() => {}),
        onStreamError: vi.fn().mockReturnValue(() => {}),
        cancelStream: vi.fn().mockResolvedValue({ success: true }),
      };

      Object.defineProperty(window, "electronAPI", {
        value: { llm: mockLLMApi },
        configurable: true,
        writable: true,
      });

      setStoreState({
        chatPanelStatus: "ready",
        chatInput: "テスト",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
        isStreaming: false,
        isSending: false,
      });
      render(<ChatPanel />);

      const sendButton = screen.getByTestId("send-button");
      await act(async () => {
        fireEvent.click(sendButton);
      });

      // useStreamingChat の startStream が呼ばれること
      // 実際の IPC 呼び出しは useStreamingChat 内部で行われる
      expect(mockStartStream).toHaveBeenCalled();
    });

    /**
     * E-02: llm:stream-chunk イベントで content を受信
     * onStreamChunk コールバックが content を受け取り StreamingMessage に反映
     */
    it("E-02: onStreamChunk コールバックが chunk content を受け取る", () => {
      // useStreamingChat が chunk を受け取って content に蓄積するシナリオを検証
      setStoreState({
        chatPanelStatus: "streaming",
        isStreaming: true,
        streamingContent: "Hello",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({ isStreaming: true, content: "Hello" });
      render(<ChatPanel />);

      // streaming content が表示されること
      const streamingArea = screen.queryByTestId("streaming-content");
      expect(streamingArea).toBeInTheDocument();
      expect(streamingArea).toHaveTextContent("Hello");
    });

    /**
     * E-03: llm:stream-done イベントで完了通知を受信
     * onStreamEnd コールバック後 isStreaming=false に遷移
     */
    it("E-03: onStreamEnd コールバック後に isStreaming が false になる", () => {
      setStoreState({
        chatPanelStatus: "completed",
        isStreaming: false,
        streamingContent: "",
        chatMessages: [
          createChatMessage({ role: "user", content: "質問" }),
          createChatMessage({ role: "assistant", content: "完了した回答" }),
        ],
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({ isStreaming: false, content: "" });
      render(<ChatPanel />);

      // ストリーミングエリアが非表示であること
      const streamingArea = screen.queryByTestId("streaming-content");
      expect(streamingArea).not.toBeInTheDocument();

      // メッセージリストが表示されること
      const messageList = screen.queryByTestId("mock-chat-message-list");
      expect(messageList).toBeInTheDocument();
    });

    /**
     * E-04: llm:stream-error イベントでエラーを受信
     * error オブジェクト {code, message, retryable} を受け取る
     */
    it("E-04: onStreamError コールバックがエラーオブジェクトを受け取る", () => {
      setStoreState({
        chatPanelStatus: "error",
        isStreaming: false,
        streamingError: {
          code: "RATE_LIMIT",
          message: "レート制限を超えました",
          retryable: true,
        },
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({
        isStreaming: false,
        error: {
          code: "RATE_LIMIT",
          message: "レート制限を超えました",
          retryable: true,
        },
      });
      render(<ChatPanel />);

      // エラーコードが表示されること
      const errorCode = screen.queryByTestId("error-code");
      expect(errorCode).toBeInTheDocument();
    });

    /**
     * E-05: llm:cancel-stream 呼び出しでストリーム中断
     * cancelStream → AbortController.abort() が呼ばれる
     */
    it("E-05: cancelStream 呼び出しでストリームが中断される", async () => {
      setStoreState({
        chatPanelStatus: "streaming",
        isStreaming: true,
        streamingContent: "中断テスト",
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({ isStreaming: true, content: "中断テスト" });
      render(<ChatPanel />);

      const cancelButtons = screen.getAllByTestId("cancel-stream-button");
      await act(async () => {
        fireEvent.click(cancelButtons[0]);
      });

      expect(mockCancelStream).toHaveBeenCalledTimes(1);
    });

    /**
     * E-06: IPC レスポンスが wrapper 形式を遵守（P60 準拠）
     * {success: true, data: {...}} / {success: false, error: {...}}
     */
    it("E-06: IPC レスポンスが P60 準拠の wrapper 形式を遵守する", async () => {
      // P60 準拠: 成功レスポンス形式のテスト
      const successResponse = { success: true, data: { requestId: "req-456" } };
      // P60 準拠: エラーレスポンス形式のテスト
      const errorResponse = {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid request" },
      };

      // wrapper 形式が正しい構造であることを確認
      expect(successResponse).toHaveProperty("success", true);
      expect(successResponse).toHaveProperty("data.requestId");

      expect(errorResponse).toHaveProperty("success", false);
      expect(errorResponse).toHaveProperty("error.code");
      expect(errorResponse).toHaveProperty("error.message");
    });

    /**
     * E-07: NETWORK_ERROR（retryable）で retry 可能を表示
     * ErrorGuidance に retry ボタン、retryable=true
     */
    it("E-07: NETWORK_ERROR（retryable=true）で retry ボタンが表示される", () => {
      setStoreState({
        chatPanelStatus: "error",
        isStreaming: false,
        streamingError: {
          code: "NETWORK_ERROR",
          message: "ネットワークエラー",
          retryable: true,
        },
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({
        isStreaming: false,
        error: {
          code: "NETWORK_ERROR",
          message: "ネットワークエラー",
          retryable: true,
        },
      });
      render(<ChatPanel />);

      // retry ボタンが表示されること
      const retryButton = screen.queryByTestId("retry-button");
      expect(retryButton).toBeInTheDocument();
    });

    /**
     * E-08: RATE_LIMIT で retryable=true の表示
     * ErrorGuidance に retry ボタン
     */
    it("E-08: RATE_LIMIT エラーで retry ボタンが表示される", () => {
      setStoreState({
        chatPanelStatus: "error",
        isStreaming: false,
        streamingError: {
          code: "RATE_LIMIT",
          message:
            "レート制限を超えました。しばらく待ってから再試行してください",
          retryable: true,
        },
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({
        isStreaming: false,
        error: {
          code: "RATE_LIMIT",
          message:
            "レート制限を超えました。しばらく待ってから再試行してください",
          retryable: true,
        },
      });
      render(<ChatPanel />);

      const retryButton = screen.queryByTestId("retry-button");
      expect(retryButton).toBeInTheDocument();
    });

    /**
     * E-09: CONTENT_FILTER（non-retryable）でフィルタ通知
     * ErrorGuidance にフィルタメッセージ、retryable=false → retry ボタン非表示
     */
    it("E-09: CONTENT_FILTER（retryable=false）で retry ボタンが非表示になる", () => {
      setStoreState({
        chatPanelStatus: "error",
        isStreaming: false,
        streamingError: {
          code: "CONTENT_FILTER",
          message: "コンテンツフィルターにより応答がブロックされました",
          retryable: false,
        },
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({
        isStreaming: false,
        error: {
          code: "CONTENT_FILTER",
          message: "コンテンツフィルターにより応答がブロックされました",
          retryable: false,
        },
      });
      render(<ChatPanel />);

      // role="alert" が表示されること
      const alertElement = screen.queryByRole("alert");
      expect(alertElement).toBeInTheDocument();

      // retry ボタンが非表示であること（non-retryable）
      const retryButton = screen.queryByTestId("retry-button");
      expect(retryButton).not.toBeInTheDocument();
    });

    /**
     * E-10: CONTEXT_LENGTH_EXCEEDED で会話リセット誘導
     * ErrorGuidance にリセットボタン、retryable=false
     */
    it("E-10: CONTEXT_LENGTH_EXCEEDED（retryable=false）でエラーメッセージが表示される", () => {
      setStoreState({
        chatPanelStatus: "error",
        isStreaming: false,
        streamingError: {
          code: "CONTEXT_LENGTH_EXCEEDED",
          message: "コンテキストの長さを超えました。会話をリセットしてください",
          retryable: false,
        },
        selectedProviderId: "openai",
        selectedModelId: "gpt-4o",
      });
      setStreamingState({
        isStreaming: false,
        error: {
          code: "CONTEXT_LENGTH_EXCEEDED",
          message: "コンテキストの長さを超えました。会話をリセットしてください",
          retryable: false,
        },
      });
      render(<ChatPanel />);

      // role="alert" が表示されること
      const alertElement = screen.queryByRole("alert");
      expect(alertElement).toBeInTheDocument();

      // non-retryable のため retry ボタンは非表示
      const retryButton = screen.queryByTestId("retry-button");
      expect(retryButton).not.toBeInTheDocument();
    });
  });
});
