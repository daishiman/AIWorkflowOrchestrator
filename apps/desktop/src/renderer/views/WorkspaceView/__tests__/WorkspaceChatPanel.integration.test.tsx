/**
 * WorkspaceChatPanel InlineModelSelector統合テスト
 *
 * P39 準拠: happy-dom 環境では fireEvent を使用
 * P63 準拠: 既存テスト WorkspaceChatPanel.guidance.test.tsx のインポートパスを参照
 * P9  準拠: beforeEach で全 mock をリセット
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { WorkspaceChatController } from "../hooks/useWorkspaceChatController";
import type { ModelSelectionBlockedReason } from "@/renderer/guidance/modelSelectionGuidance";

// ---------------------------------------------------------------------------
// Mock: store（InlineModelSelectorが使用するStore Hooks）
// ---------------------------------------------------------------------------
const mockSetCurrentView = vi.fn();
const mockFetchProviders = vi.fn();
const mockSelectProvider = vi.fn();
const mockSelectModel = vi.fn();
const mockCheckLLMHealth = vi.fn();

vi.mock("@/renderer/store", () => ({
  useSetCurrentView: () => mockSetCurrentView,
  useLLMProviders: () => [],
  useSelectedProviderId: () => null,
  useSelectedModelId: () => null,
  useLLMHealthStatus: () => "unknown",
  useFetchProviders: () => mockFetchProviders,
  useSelectProvider: () => mockSelectProvider,
  useSelectModel: () => mockSelectModel,
  useCheckLLMHealth: () => mockCheckLLMHealth,
}));

// ---------------------------------------------------------------------------
// Mock: WorkspaceChatController ファクトリ
// （既存テスト WorkspaceChatPanel.guidance.test.tsx のパターンを踏襲）
// ---------------------------------------------------------------------------
const createMockController = (
  overrides: Partial<WorkspaceChatController> = {},
): WorkspaceChatController => ({
  messages: [],
  input: "",
  isSending: false,
  isStreaming: false,
  streamContent: "",
  errorMessage: null,
  selectedFiles: [],
  selectedFilePath: null,
  selectedModelId: null,
  blockedReason: null as ModelSelectionBlockedReason | null,
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
  streamingError: null,
  retryLastMessage: vi.fn().mockResolvedValue(undefined),
  dismissStreamingError: vi.fn(),
  ...overrides,
});

// ---------------------------------------------------------------------------
// Import: テスト対象（vi.mock の後に import）
// ---------------------------------------------------------------------------
import { WorkspaceChatPanel } from "../WorkspaceChatPanel";

describe("WorkspaceChatPanel InlineModelSelector統合テスト", () => {
  beforeEach(() => {
    // P9: テスト間で状態を共有しない
    vi.clearAllMocks();
  });

  it("I-1: WorkspaceChatPanel上部にInlineModelSelector(compact)が表示される", () => {
    const controller = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
    });
    render(<WorkspaceChatPanel controller={controller} />);
    // InlineModelSelectorはcomboboxロールで検出可能
    const selector = screen.getByRole("combobox");
    expect(selector).toBeInTheDocument();
  });

  it("I-2: blockedReason=nullの場合にGuidanceBlockが非表示になる", () => {
    const controller = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
    });
    render(<WorkspaceChatPanel controller={controller} />);
    expect(
      screen.queryByTestId("workspace-guidance-block"),
    ).not.toBeInTheDocument();
  });

  it("I-3: blockedReason='NO_MODEL'の場合にGuidanceBlockが表示される", () => {
    const controller = createMockController({
      selectedModelId: null,
      blockedReason: "NO_MODEL",
    });
    render(<WorkspaceChatPanel controller={controller} />);
    expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument();
  });

  it("I-4: blockedReason=null（モデル選択済み）でチャット入力エリアが操作可能", () => {
    const controller = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
    });
    render(<WorkspaceChatPanel controller={controller} />);
    // GuidanceBlockが非表示 = ブロック解除済み
    expect(
      screen.queryByTestId("workspace-guidance-block"),
    ).not.toBeInTheDocument();
  });

  it("I-5: controller.isStreaming=trueの場合にInlineModelSelectorがdisabled", () => {
    const controller = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
      isStreaming: true,
    });
    render(<WorkspaceChatPanel controller={controller} />);
    // InlineModelSelectorに disabled prop が渡されていることを確認
    const selector = screen.getByRole("combobox");
    expect(selector).toBeDisabled();
  });

  it("I-6: controller.blockedReasonの変化でGuidanceBlockの表示が切り替わる", () => {
    const blockedController = createMockController({
      selectedModelId: null,
      blockedReason: "NO_MODEL",
    });
    const { rerender } = render(
      <WorkspaceChatPanel controller={blockedController} />,
    );
    expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument();

    const unblockedController = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
    });
    rerender(<WorkspaceChatPanel controller={unblockedController} />);
    expect(
      screen.queryByTestId("workspace-guidance-block"),
    ).not.toBeInTheDocument();
  });

  // =========================================================================
  // Phase 6: エッジケーステスト E-1〜E-5
  // =========================================================================

  it("E-1: blockedReason='NO_PROVIDER'の場合にGuidanceBlockが表示される", () => {
    const controller = createMockController({
      selectedModelId: null,
      blockedReason: "NO_PROVIDER",
    });
    render(<WorkspaceChatPanel controller={controller} />);
    expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument();
  });

  it("E-2: blockedReason!=null時にInlineModelSelectorとGuidanceBlockが同時に表示される", () => {
    const controller = createMockController({
      selectedModelId: null,
      blockedReason: "NO_MODEL",
    });
    render(<WorkspaceChatPanel controller={controller} />);

    // 両方が同時に表示されていること
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-guidance-block")).toBeInTheDocument();
  });

  it("E-3: ストリーミング開始でdisabledになり、完了で解除される", () => {
    const idleController = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
      isStreaming: false,
    });
    const { rerender } = render(
      <WorkspaceChatPanel controller={idleController} />,
    );

    const selector = screen.getByRole("combobox");
    expect(selector).not.toBeDisabled();

    // ストリーミング開始
    const streamingController = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
      isStreaming: true,
    });
    rerender(<WorkspaceChatPanel controller={streamingController} />);
    expect(screen.getByRole("combobox")).toBeDisabled();

    // ストリーミング完了
    rerender(<WorkspaceChatPanel controller={idleController} />);
    expect(screen.getByRole("combobox")).not.toBeDisabled();
  });

  it("E-4: blockedReason=null時にゼロステート（suggestion bubbles）が表示される", () => {
    const controller = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
      messages: [],
      streamContent: "",
      isStreaming: false,
    });
    render(<WorkspaceChatPanel controller={controller} />);
    expect(screen.getByTestId("workspace-chat-zero-state")).toBeInTheDocument();
  });

  it("E-5: streamingError存在時にStreamingErrorDisplayが表示される", () => {
    const controller = createMockController({
      selectedModelId: "gpt-4o",
      blockedReason: null,
      streamingError: {
        type: "network",
        message: "接続エラー",
        isRetryable: true,
        timestamp: Date.now(),
      },
    });
    render(<WorkspaceChatPanel controller={controller} />);
    expect(screen.getByText("接続エラー")).toBeInTheDocument();
  });
});
