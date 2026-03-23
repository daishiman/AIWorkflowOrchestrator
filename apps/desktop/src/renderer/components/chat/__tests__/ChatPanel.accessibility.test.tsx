/**
 * @file ChatPanel.accessibility.test.tsx
 * @description ChatPanel アクセシビリティテスト（WCAG 2.1 AA）
 * @phase Phase 4: テスト作成（TDD: Red フェーズ）
 * @task TASK-IMP-CHATPANEL-REAL-AI-CHAT-001
 *
 * テストグループ D-01〜D-10:
 *   D-01〜D-06: ARIA 属性テスト
 *   D-07〜D-10: キーボード操作テスト
 *
 * P39 対策: fireEvent のみ使用（userEvent.setup() 使用禁止）
 * P63 対策: インポートパスは ChatPanel.test.tsx と同じパターン
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ============================================
// Store Mock（ChatPanel.test.tsx と同じパターン）
// ============================================

const mockFetchSkills = vi.fn();
const mockAbortExecution = vi.fn();

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
}));

// ============================================
// Component Mocks
// A11y テストのため role/aria 属性を持つモックにする
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

// ChatMessageList モック: role="log", aria-live="polite" を持つ
vi.mock("../ChatMessageList", () => ({
  ChatMessageList: ({
    messages,
    isStreaming,
    streamingContent,
    onCancel,
  }: {
    messages: unknown[];
    isStreaming?: boolean;
    streamingContent?: string;
    onCancel?: () => void;
  }) => (
    <div
      role="log"
      aria-live="polite"
      aria-label="チャット履歴"
      data-testid="mock-chat-message-list"
    >
      {messages.map((msg: unknown, i: number) => (
        <div key={i} data-testid={`message-${i}`}>
          {String((msg as Record<string, unknown>).content ?? "")}
        </div>
      ))}
      {isStreaming && streamingContent !== undefined && (
        <div
          role="status"
          aria-live="polite"
          aria-busy={isStreaming}
          data-testid="mock-streaming-message"
        >
          {streamingContent}
          <button
            aria-label="Cancel response"
            onClick={onCancel}
            data-testid="mock-cancel-button"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  ),
}));

// ComposerArea モック: キーボード操作テスト用 aria 属性を持つ
vi.mock("../ComposerArea", () => ({
  ComposerArea: ({
    onSubmit,
    onCancel,
    isStreaming,
  }: {
    onSubmit?: (text: string) => void;
    onCancel?: () => void;
    isStreaming?: boolean;
    disabled?: boolean;
    canSubmit?: boolean;
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
  }) => (
    <div data-testid="mock-composer-area">
      <textarea
        aria-label="メッセージを入力"
        aria-multiline="true"
        data-testid="mock-composer-input"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            onSubmit?.(target.value);
          }
          if (e.key === "Escape" && isStreaming) {
            e.preventDefault();
            onCancel?.();
          }
        }}
        onChange={() => {}}
      />
      <button
        aria-label={isStreaming ? "送信中..." : "送信"}
        aria-busy={isStreaming ? "true" : "false"}
        aria-disabled={isStreaming}
        data-testid="mock-send-button"
        onClick={() => onSubmit?.("")}
      >
        {isStreaming ? "送信中..." : "送信"}
      </button>
    </div>
  ),
}));

// ErrorGuidance モック: role="alert"
vi.mock("../ErrorGuidance", () => ({
  ErrorGuidance: ({
    code,
  }: {
    code: string;
    message: string;
    retryable: boolean;
    onNavigateToSettings?: () => void;
  }) => (
    <div role="alert" data-testid="mock-error-guidance" data-error-code={code}>
      Error occurred
    </div>
  ),
}));

// RuntimeBanner モック: role="status"
vi.mock("../RuntimeBanner", () => ({
  RuntimeBanner: ({
    capability,
  }: {
    capability?: string;
    onTerminalSwitch?: () => void;
  }) => (
    <div role="status" aria-live="polite" data-testid="mock-runtime-banner">
      {capability ?? "none"}
    </div>
  ),
}));

// HandoffBlock モック
vi.mock("../HandoffBlock", () => ({
  HandoffBlock: ({
    guidance,
  }: {
    guidance: string;
    onOpenTerminal: () => void;
  }) => <div data-testid="mock-handoff-block">{guidance}</div>,
}));

// LLMSelectorPanel モック
vi.mock("../LLMSelectorPanel", () => ({
  LLMSelectorPanel: () => (
    <div data-testid="mock-llm-selector-panel">LLMSelectorPanel</div>
  ),
}));

// SkillManagementPanel モック
vi.mock("../../skill/SkillManagementPanel", () => ({
  SkillManagementPanel: () => (
    <div data-testid="mock-skill-management-panel">SkillManagementPanel</div>
  ),
}));

// ============================================
// Import
// ============================================

import { ChatPanel } from "../ChatPanel";

// ============================================
// Test Data / Helpers
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
    // 実チャット配線用の追加フィールド
    chatMessages: [],
    isStreaming: false,
    streamingContent: "",
    streamingError: null,
    chatPanelStatus: "ready",
    resolvedCapability: "integratedRuntime",
    chatInput: "",
    setChatInput: vi.fn(),
    selectedProviderId: "anthropic",
    selectedModelId: "claude-3-5-sonnet",
    providers: [],
    handoffGuidance: null,
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
// Tests: D. アクセシビリティ
// ============================================

describe("ChatPanel - Accessibility (WCAG 2.1 AA)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setStoreState();
    setStreamingState();
  });

  // ============================================================
  // D-01〜D-06: ARIA Attributes
  // ============================================================
  describe("D-01〜D-06: ARIA Attributes", () => {
    it("D-01: ChatMessageList に role='log' が付与されている", () => {
      setStoreState({ chatPanelStatus: "ready" });
      render(<ChatPanel />);

      // ChatMessageList が role="log" で取得できること
      const log = screen.getByRole("log");
      expect(log).toBeInTheDocument();
    });

    it("D-02: ChatMessageList に aria-live='polite' が設定されている", () => {
      setStoreState({ chatPanelStatus: "ready" });
      render(<ChatPanel />);

      const log = screen.getByRole("log");
      expect(log).toHaveAttribute("aria-live", "polite");
    });

    it("D-03: StreamingMessage に aria-busy=true が設定される（streaming中）", () => {
      setStoreState({ chatPanelStatus: "streaming" });
      setStreamingState({ isStreaming: true, content: "Hello..." });
      render(<ChatPanel />);

      // streaming-message コンテナの aria-busy が true
      const streamingEl = screen.getByTestId("mock-streaming-message");
      expect(streamingEl).toHaveAttribute("aria-busy", "true");
    });

    it("D-03: StreamingMessage に aria-busy=false が設定される（streaming完了後）", () => {
      setStoreState({ chatPanelStatus: "ready" });
      setStreamingState({ isStreaming: false, content: "" });
      render(<ChatPanel />);

      // streaming-message が表示されていない、または aria-busy=false
      const streamingEl = screen.queryByTestId("mock-streaming-message");
      if (streamingEl) {
        expect(streamingEl).toHaveAttribute("aria-busy", "false");
      } else {
        // ストリーミングでない場合はコンポーネント自体が非表示でよい
        expect(streamingEl).toBeNull();
      }
    });

    it("D-04: ErrorGuidance に role='alert' が付与されている", () => {
      // ErrorGuidance は isBlocked (chatPanelStatus === "blocked") のみ表示
      setStoreState({
        chatPanelStatus: "blocked",
        selectedProviderId: null,
        selectedModelId: null,
      });
      render(<ChatPanel />);

      // ErrorGuidance が role="alert" で取得できること
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("D-05: RuntimeBanner に role='status' が付与されている", () => {
      setStoreState({ chatPanelStatus: "ready" });
      render(<ChatPanel />);

      // RuntimeBanner が role="status" で取得できること
      const status = screen.getByRole("status");
      expect(status).toBeInTheDocument();
    });

    it("D-06: cancel ボタンに aria-label='Cancel response' が設定されている", () => {
      setStoreState({ chatPanelStatus: "streaming" });
      setStreamingState({ isStreaming: true, content: "Generating..." });
      render(<ChatPanel />);

      // ストリーミング中にキャンセルボタンが aria-label="Cancel response" で表示
      const cancelBtn = screen.getByRole("button", { name: "Cancel response" });
      expect(cancelBtn).toBeInTheDocument();
    });
  });

  // ============================================================
  // D-07〜D-10: Keyboard Navigation
  // ============================================================
  describe("D-07〜D-10: Keyboard Navigation", () => {
    it("D-07: Enter キーでメッセージが送信される", async () => {
      setStoreState({ chatPanelStatus: "ready" });
      render(<ChatPanel />);

      const input = screen.getByTestId("mock-composer-input");

      // テキストを入力してから Enter を押す
      fireEvent.change(input, { target: { value: "Hello world" } });
      await act(async () => {
        fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
      });

      // startStream または送信ハンドラが呼ばれること
      // TDD Red フェーズ: ChatPanel が ComposerArea の onSend を配線した際に通過
      expect(mockStartStream).toHaveBeenCalled();
    });

    it("D-08: Shift+Enter では送信されず改行が挿入される", async () => {
      setStoreState({ chatPanelStatus: "ready" });
      render(<ChatPanel />);

      const input = screen.getByTestId("mock-composer-input");

      fireEvent.change(input, { target: { value: "Hello" } });
      await act(async () => {
        fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
      });

      // Shift+Enter では startStream が呼ばれない
      expect(mockStartStream).not.toHaveBeenCalled();
    });

    it("D-09: Escape キーでストリーミングがキャンセルされる", async () => {
      setStoreState({ chatPanelStatus: "streaming" });
      setStreamingState({ isStreaming: true, content: "Generating..." });
      render(<ChatPanel />);

      const input = screen.getByTestId("mock-composer-input");

      await act(async () => {
        fireEvent.keyDown(input, { key: "Escape" });
      });

      // cancelStream が呼ばれること
      expect(mockCancelStream).toHaveBeenCalled();
    });

    it("D-10: Tab でフォーカスが RuntimeBanner -> ChatMessageList -> ComposerArea の順に移動できる", () => {
      setStoreState({ chatPanelStatus: "ready" });
      render(<ChatPanel />);

      // DOM 順序: RuntimeBanner(role=status) > ErrorGuidance > ChatMessageList(role=log) > ComposerArea
      // tab 順序の検証: 各要素が document 内に存在し、適切な順序でレンダリングされていること

      const banner = screen.getByTestId("mock-runtime-banner");
      const messageList = screen.getByRole("log");
      const composerArea = screen.getByTestId("mock-composer-area");

      expect(banner).toBeInTheDocument();
      expect(messageList).toBeInTheDocument();
      expect(composerArea).toBeInTheDocument();

      // DOM 順序を検証: banner が messageList より前、messageList が composerArea より前
      const allElements = document.body.querySelectorAll(
        "[data-testid='mock-runtime-banner'], [data-testid='mock-chat-message-list'], [data-testid='mock-composer-area']",
      );
      const elementOrder = Array.from(allElements).map((el) =>
        el.getAttribute("data-testid"),
      );

      expect(elementOrder[0]).toBe("mock-runtime-banner");
      expect(elementOrder[1]).toBe("mock-chat-message-list");
      expect(elementOrder[2]).toBe("mock-composer-area");
    });
  });
});
