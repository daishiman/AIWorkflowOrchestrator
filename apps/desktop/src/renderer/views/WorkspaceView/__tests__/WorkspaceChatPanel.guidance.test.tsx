/**
 * WorkspaceChatPanel GuidanceBlock 改善テスト
 *
 * TC-5: GuidanceBlock 改善
 *
 * P39 準拠: happy-dom 環境では fireEvent を使用
 * P63 準拠: 既存テスト WorkspaceChatPanel.runtime.test.tsx のインポートパスを参照
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { WorkspaceChatController } from "../hooks/useWorkspaceChatController";

// ---------------------------------------------------------------------------
// Mock: store
// ---------------------------------------------------------------------------
const mockSetCurrentView = vi.fn();

vi.mock("@/renderer/store", () => ({
  useSetCurrentView: () => mockSetCurrentView,
}));

// ---------------------------------------------------------------------------
// Mock: WorkspaceChatController
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
// Import: テスト対象
// ---------------------------------------------------------------------------
import { WorkspaceChatPanel } from "../WorkspaceChatPanel";

describe("WorkspaceChatPanel GuidanceBlock 改善テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // TC-5: GuidanceBlock 改善
  // =========================================================================
  describe("TC-5: GuidanceBlock 改善", () => {
    it("TC-5-1: モデル未選択時 GuidanceBlock に設定ボタンが表示される", () => {
      const controller = createMockController({ selectedModelId: null });

      render(<WorkspaceChatPanel controller={controller} />);

      const settingsButton = screen.getByRole("button", {
        name: /Settings/,
      });
      expect(settingsButton).toBeInTheDocument();
    });

    it("TC-5-2: 設定ボタンクリックで設定画面へ遷移する", () => {
      const controller = createMockController({ selectedModelId: null });

      render(<WorkspaceChatPanel controller={controller} />);

      const settingsButton = screen.getByRole("button", {
        name: /Settings/,
      });
      fireEvent.click(settingsButton);
      expect(mockSetCurrentView).toHaveBeenCalledWith("settings");
    });
  });
});
