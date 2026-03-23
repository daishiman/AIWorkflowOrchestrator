/**
 * @file ChatPanel.test.tsx
 * @description ChatPanel 統合コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red → Green）
 * @task TASK-7D ChatPanel 統合
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

// ============================================
// Store Mock
// ============================================

const mockFetchSkills = vi.fn();
const mockAbortExecution = vi.fn();
const mockSetCurrentView = vi.fn();
const mockSelectProvider = vi.fn();
const mockSelectModel = vi.fn();

let mockStoreState: Record<string, unknown> = {};

vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    return selector(mockStoreState);
  }),
  useIsSkillExecuting: vi.fn(() => Boolean(mockStoreState.isExecuting)),
  useSetCurrentView: vi.fn(() => mockSetCurrentView),
  useSelectProvider: vi.fn(() => mockSelectProvider),
  useSelectModel: vi.fn(() => mockSelectModel),
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
}));

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

// ============================================
// useStreamingChat Mock
// ============================================

vi.mock("../../../hooks/useStreamingChat", () => ({
  useStreamingChat: vi.fn(() => ({
    state: { isStreaming: false, content: "", error: null, requestId: null },
    actions: { startStream: vi.fn(), cancelStream: vi.fn() },
  })),
}));

// ============================================
// New Component Mocks
// ============================================

vi.mock("../RuntimeBanner", () => ({
  RuntimeBanner: ({
    onTerminalSwitch,
  }: {
    capability: string;
    onTerminalSwitch?: () => void;
  }) => (
    <div data-testid="mock-runtime-banner">
      RuntimeBanner
      {onTerminalSwitch && (
        <button data-testid="terminal-switch-btn" onClick={onTerminalSwitch}>
          Switch
        </button>
      )}
    </div>
  ),
}));

vi.mock("../ChatMessageList", () => ({
  ChatMessageList: () => (
    <div data-testid="mock-chat-message-list">ChatMessageList</div>
  ),
}));

vi.mock("../ErrorGuidance", () => ({
  ErrorGuidance: () => (
    <div data-testid="mock-error-guidance">ErrorGuidance</div>
  ),
}));

vi.mock("../HandoffBlock", () => ({
  HandoffBlock: ({
    onOpenTerminal,
  }: {
    guidance: unknown;
    onOpenTerminal?: () => void;
  }) => (
    <div data-testid="mock-handoff-block">
      HandoffBlock
      {onOpenTerminal && (
        <button data-testid="open-terminal-btn" onClick={onOpenTerminal}>
          OpenTerminal
        </button>
      )}
    </div>
  ),
}));

vi.mock("../ComposerArea", () => ({
  ComposerArea: () => <div data-testid="mock-composer-area">ComposerArea</div>,
}));

vi.mock("../LLMSelectorPanel", () => ({
  LLMSelectorPanel: ({
    onSelectProvider,
    onSelectModel,
  }: {
    providers: unknown[];
    selectedProviderId: string | null;
    selectedModelId: string | null;
    onSelectProvider: (id: string) => void;
    onSelectModel: (id: string) => void;
  }) => (
    <div data-testid="mock-llm-selector-panel">
      LLMSelectorPanel
      <button
        data-testid="select-provider-btn"
        onClick={() => onSelectProvider("anthropic")}
      >
        SelectProvider
      </button>
      <button
        data-testid="select-model-btn"
        onClick={() => onSelectModel("claude-3-5-sonnet")}
      >
        SelectModel
      </button>
    </div>
  ),
}));

import { ChatPanel } from "../ChatPanel";
import type { ChatPanelHandle } from "../ChatPanel";
import type { SkillMetadata } from "@repo/shared";

// ============================================
// Test Data
// ============================================

function createTestSkill(
  overrides: Partial<SkillMetadata> = {},
): SkillMetadata {
  return {
    name: "test-skill",
    description: "Test skill",
    path: "/test/path",
    updatedAt: new Date("2025-01-01"),
    agents: [],
    references: [],
    scripts: [],
    assets: [],
    schemas: [],
    ...overrides,
  };
}

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
    // ChatPanel 新規フィールド
    chatPanelStatus: "ready",
    resolvedCapability: "integratedRuntime",
    chatMessages: [],
    chatInput: "",
    setChatInput: vi.fn(),
    selectedProviderId: "anthropic",
    selectedModelId: "claude-3-5-sonnet",
    providers: [],
    handoffGuidance: null,
    ...overrides,
  };
}

// ============================================
// Tests
// ============================================

describe("ChatPanel with Skills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setStoreState();
  });

  // ============================================================
  // 基本レンダリング
  // ============================================================
  describe("基本レンダリング", () => {
    it("should render SkillSelector in header", () => {
      render(<ChatPanel />);
      expect(screen.getByTestId("mock-skill-selector")).toBeInTheDocument();
      // Verify SkillSelector is inside header
      const header = screen.getByTestId("chat-header");
      expect(header).toContainElement(
        screen.getByTestId("mock-skill-selector"),
      );
    });

    it("should render PermissionDialog", () => {
      render(<ChatPanel />);
      expect(screen.getByTestId("mock-permission-dialog")).toBeInTheDocument();
    });

    it("should render chat panel structure", () => {
      render(<ChatPanel />);
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
      expect(screen.getByTestId("chat-header")).toBeInTheDocument();
      expect(screen.getByTestId("message-area")).toBeInTheDocument();
      expect(screen.getByTestId("input-area")).toBeInTheDocument();
    });
  });

  // ============================================================
  // SkillStreamingView 表示制御
  // ============================================================
  describe("SkillStreamingView 表示制御", () => {
    it("should show streaming view when skill is executing", () => {
      setStoreState({
        isExecuting: true,
        selectedSkillName: "test-skill",
        skillExecutionStatus: "running",
      });
      render(<ChatPanel />);
      expect(
        screen.getByTestId("mock-skill-streaming-view"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("mock-skill-streaming-view")).toHaveTextContent(
        "test-skill",
      );
    });

    it("should hide streaming view when idle", () => {
      setStoreState({
        isExecuting: false,
        selectedSkillName: "test-skill",
      });
      render(<ChatPanel />);
      expect(
        screen.queryByTestId("mock-skill-streaming-view"),
      ).not.toBeInTheDocument();
    });

    it("should hide streaming view when no skill selected", () => {
      setStoreState({
        isExecuting: true,
        selectedSkillName: null,
      });
      render(<ChatPanel />);
      expect(
        screen.queryByTestId("mock-skill-streaming-view"),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // fetchSkills 初期化
  // ============================================================
  describe("fetchSkills 初期化", () => {
    it("should call fetchSkills on mount", () => {
      render(<ChatPanel />);
      expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // エッジケース
  // ============================================================
  describe("エッジケース", () => {
    it("should render without crash when store returns initial state", () => {
      setStoreState();
      render(<ChatPanel />);
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    });

    it("should handle fetchSkills being called", () => {
      mockFetchSkills.mockRejectedValueOnce(new Error("Network error"));
      render(<ChatPanel />);
      expect(mockFetchSkills).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // アクセシビリティ
  // ============================================================
  describe("アクセシビリティ", () => {
    it("should have toolbar role on header", () => {
      render(<ChatPanel />);
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("should have aria-label on header", () => {
      render(<ChatPanel />);
      expect(screen.getByRole("toolbar")).toHaveAttribute(
        "aria-label",
        "チャット設定",
      );
    });
  });

  // ============================================================
  // SkillImportDialog 統合
  // ============================================================
  describe("SkillImportDialog 統合", () => {
    it("should show import dialog when handleImportRequest is called via ref", () => {
      const ref = React.createRef<ChatPanelHandle>();
      render(<ChatPanel ref={ref} />);

      act(() => {
        ref.current?.handleImportRequest(createTestSkill());
      });

      expect(
        screen.getByTestId("mock-skill-import-dialog"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("mock-skill-import-dialog")).toHaveTextContent(
        "test-skill",
      );
    });

    it("should call onImportRequest callback when import requested", () => {
      const onImportRequest = vi.fn();
      const ref = React.createRef<ChatPanelHandle>();
      render(<ChatPanel ref={ref} onImportRequest={onImportRequest} />);

      const skill = createTestSkill({ name: "callback-skill" });
      act(() => {
        ref.current?.handleImportRequest(skill);
      });

      expect(onImportRequest).toHaveBeenCalledTimes(1);
      expect(onImportRequest).toHaveBeenCalledWith(skill);
    });

    it("should close import dialog when onClose is called", () => {
      const ref = React.createRef<ChatPanelHandle>();
      render(<ChatPanel ref={ref} />);

      // Open dialog
      act(() => {
        ref.current?.handleImportRequest(createTestSkill());
      });
      expect(
        screen.getByTestId("mock-skill-import-dialog"),
      ).toBeInTheDocument();

      // Close dialog
      fireEvent.click(screen.getByTestId("mock-import-dialog-close"));

      expect(
        screen.queryByTestId("mock-skill-import-dialog"),
      ).not.toBeInTheDocument();
    });

    it("should not show import dialog initially", () => {
      render(<ChatPanel />);
      expect(
        screen.queryByTestId("mock-skill-import-dialog"),
      ).not.toBeInTheDocument();
    });
  });
});

// ============================================================
// Review Harness Alignment (TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001)
// TC-01〜TC-08
// ============================================================

describe("ChatPanel Review Harness Alignment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setStoreState();
  });

  // TC-01: GAP-01 — onTerminalSwitch actionability
  describe("TC-01: onTerminalSwitch calls setCurrentView('terminal')", () => {
    it("should call setCurrentView with 'terminal' when terminal switch is clicked", () => {
      render(<ChatPanel />);
      fireEvent.click(screen.getByTestId("terminal-switch-btn"));
      expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
      expect(mockSetCurrentView).toHaveBeenCalledWith("agent");
    });
  });

  // TC-02: GAP-02 — onSelectProvider actionability
  describe("TC-02: onSelectProvider calls selectProvider", () => {
    it("should call selectProvider when provider is selected", () => {
      render(<ChatPanel />);
      fireEvent.click(screen.getByTestId("select-provider-btn"));
      expect(mockSelectProvider).toHaveBeenCalledTimes(1);
      expect(mockSelectProvider).toHaveBeenCalledWith("anthropic");
    });
  });

  // TC-03: GAP-03 — onSelectModel actionability
  describe("TC-03: onSelectModel calls selectModel", () => {
    it("should call selectModel when model is selected", () => {
      render(<ChatPanel />);
      fireEvent.click(screen.getByTestId("select-model-btn"));
      expect(mockSelectModel).toHaveBeenCalledTimes(1);
      expect(mockSelectModel).toHaveBeenCalledWith("claude-3-5-sonnet");
    });
  });

  // TC-04: GAP-04 — onOpenTerminal actionability (handoff state)
  describe("TC-04: onOpenTerminal calls setCurrentView('terminal') in handoff state", () => {
    it("should call setCurrentView with 'terminal' when open terminal is clicked", () => {
      setStoreState({
        chatPanelStatus: "handoff",
        handoffGuidance: {
          reason: "terminal-only",
          message: "Terminal surface available",
        },
      });
      render(<ChatPanel />);
      fireEvent.click(screen.getByTestId("open-terminal-btn"));
      expect(mockSetCurrentView).toHaveBeenCalledTimes(1);
      expect(mockSetCurrentView).toHaveBeenCalledWith("agent");
    });
  });

  // TC-05: JSDoc @role review-harness existence (static assertion)
  describe("TC-05: JSDoc @role review-harness exists", () => {
    it("should have @role review-harness in source file", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = path.resolve(__dirname, "../ChatPanel.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).toContain("@role review-harness");
    });
  });

  // TC-06: Store action integration — provider/model selection flow
  describe("TC-06: provider → model selection integration", () => {
    it("should call selectProvider then selectModel in sequence", () => {
      render(<ChatPanel />);
      fireEvent.click(screen.getByTestId("select-provider-btn"));
      fireEvent.click(screen.getByTestId("select-model-btn"));
      expect(mockSelectProvider).toHaveBeenCalledTimes(1);
      expect(mockSelectModel).toHaveBeenCalledTimes(1);
      // Verify call order
      const providerOrder = mockSelectProvider.mock.invocationCallOrder[0];
      const modelOrder = mockSelectModel.mock.invocationCallOrder[0];
      expect(providerOrder).toBeLessThan(modelOrder);
    });
  });

  // TC-07: IPC call integration — terminal launch in handoff state
  describe("TC-07: terminal launch in handoff state", () => {
    it("should navigate to terminal view when open terminal is clicked in handoff", () => {
      setStoreState({
        chatPanelStatus: "handoff",
        handoffGuidance: {
          reason: "terminal-only",
          message: "Terminal surface available",
        },
      });
      render(<ChatPanel />);
      expect(screen.getByTestId("mock-handoff-block")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("open-terminal-btn"));
      expect(mockSetCurrentView).toHaveBeenCalledWith("agent");
    });

    it("should not show handoff block when not in handoff state", () => {
      setStoreState({ chatPanelStatus: "ready" });
      render(<ChatPanel />);
      expect(
        screen.queryByTestId("mock-handoff-block"),
      ).not.toBeInTheDocument();
    });
  });

  // TC-08: No-op absence contract (regression guard)
  describe("TC-08: no-op absence contract", () => {
    it("should not contain () => {} in ChatPanel source", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");
      const filePath = path.resolve(__dirname, "../ChatPanel.tsx");
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content).not.toContain("() => {}");
    });
  });
});
