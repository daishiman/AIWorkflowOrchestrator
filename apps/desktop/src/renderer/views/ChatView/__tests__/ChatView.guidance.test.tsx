/**
 * ChatView LLMGuidanceBanner 統合テスト
 *
 * TC-4: ChatView での統合
 *
 * P39 準拠: happy-dom 環境では fireEvent を使用
 * P63 準拠: 既存テストのインポートパスを参照して記述
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MODEL_SELECTION_GUIDANCE } from "@/renderer/guidance/modelSelectionGuidance";

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
// Mock: store
// ---------------------------------------------------------------------------
const mockSetCurrentView = vi.fn();
const mockUseSelectedModelId = vi.fn<[], string | null>(() => null);
const mockUseSelectedProviderId = vi.fn<[], string | null>(() => null);

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
  sendMessage: vi.fn().mockResolvedValue(undefined),
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
}));

// ---------------------------------------------------------------------------
// Import: テスト対象
// ---------------------------------------------------------------------------
import { ChatView } from "../index";

describe("ChatView LLMGuidanceBanner 統合テスト", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseSelectedModelId.mockReturnValue(null);
    mockUseSelectedProviderId.mockReturnValue(null);

    const store = await import("@/renderer/store");
    vi.mocked(store.useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
    vi.mocked(store.useChatError).mockReturnValue(null);
    vi.mocked(store.useClearChatError).mockReturnValue(vi.fn());
  });

  // =========================================================================
  // TC-4: ChatView での統合
  // =========================================================================
  describe("TC-4: ChatView での統合", () => {
    it("TC-4-1: モデル未選択時 ChatView に LLMGuidanceBanner が表示される", () => {
      mockUseSelectedModelId.mockReturnValue(null);
      mockUseSelectedProviderId.mockReturnValue(null);

      render(
        <MemoryRouter>
          <ChatView />
        </MemoryRouter>,
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText(MODEL_SELECTION_GUIDANCE.message),
      ).toBeInTheDocument();
    });

    it("TC-4-2: バナーの設定ボタンで setCurrentView('settings') が呼ばれる", () => {
      mockUseSelectedModelId.mockReturnValue(null);
      mockUseSelectedProviderId.mockReturnValue(null);

      render(
        <MemoryRouter>
          <ChatView />
        </MemoryRouter>,
      );
      const settingsButton = screen.getByRole("button", {
        name: MODEL_SELECTION_GUIDANCE.actionAriaLabel,
      });
      fireEvent.click(settingsButton);
      expect(mockSetCurrentView).toHaveBeenCalledWith("settings");
    });
  });
});
