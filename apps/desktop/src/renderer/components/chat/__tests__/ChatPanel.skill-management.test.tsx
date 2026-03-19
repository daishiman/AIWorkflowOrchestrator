/**
 * @file ChatPanel.skill-management.test.tsx
 * @description ChatPanel スキル管理パネル導線テスト
 * @phase Phase 4-5: テスト作成・実装
 * @task TASK-10A-D スキルライフサイクルUI統合
 * @vitest-environment happy-dom
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

// ============================================
// Store Mock
// ============================================

const mockFetchSkills = vi.fn();

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
  SkillImportDialog: () => null,
}));

vi.mock("../../skill/PermissionDialog", () => ({
  PermissionDialog: () => <div data-testid="mock-permission-dialog" />,
}));

vi.mock("../../skill/SkillStreamingView", () => ({
  SkillStreamingView: () => <div data-testid="mock-streaming-view" />,
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
  RuntimeBanner: () => (
    <div data-testid="mock-runtime-banner">RuntimeBanner</div>
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
  HandoffBlock: () => <div data-testid="mock-handoff-block">HandoffBlock</div>,
}));

vi.mock("../ComposerArea", () => ({
  ComposerArea: () => <div data-testid="mock-composer-area">ComposerArea</div>,
}));

vi.mock("../LLMSelectorPanel", () => ({
  LLMSelectorPanel: () => (
    <div data-testid="mock-llm-selector-panel">LLMSelectorPanel</div>
  ),
}));

import { ChatPanel } from "../ChatPanel";

// ============================================
// Helpers
// ============================================

const defaultStoreState = {
  selectedSkillName: null,
  streamingMessages: [],
  isExecuting: false,
  skillExecutionStatus: null,
  fetchSkills: mockFetchSkills,
  pendingPermission: null,
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
};

function setStoreState(overrides: Partial<Record<string, unknown>> = {}) {
  mockStoreState = {
    ...defaultStoreState,
    ...overrides,
  };
}

// ============================================
// Tests
// ============================================

describe("ChatPanel スキル管理パネル導線", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setStoreState();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================================
  // TC-CP-01: スキル管理ボタンがChatPanelヘッダーに表示される
  // ============================================================
  describe("TC-CP-01: スキル管理ボタン表示", () => {
    it("スキル管理ボタンがヘッダー内に表示される", () => {
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent("スキル管理");

      // ヘッダー内に配置されていることを確認
      const header = screen.getByTestId("chat-header");
      expect(header).toContainElement(toggleButton);
    });

    it("初期状態ではaria-expandedがfalseである", () => {
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });

    it("初期状態ではスキル管理パネルを開くaria-labelが設定される", () => {
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      expect(toggleButton).toHaveAttribute(
        "aria-label",
        "スキル管理パネルを開く",
      );
    });

    it("初期状態ではスキル管理パネルが非表示でメッセージエリアが表示される", () => {
      render(<ChatPanel />);

      expect(
        screen.queryByTestId("mock-skill-management-panel"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("mock-chat-message-list")).toBeInTheDocument();
    });
  });

  // ============================================================
  // TC-CP-02: スキル管理ボタンクリックでパネル表示切替
  // ============================================================
  describe("TC-CP-02: スキル管理パネル表示切替", () => {
    it("ボタンクリックでスキル管理パネルが表示される", () => {
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton);

      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toHaveTextContent("SkillManagementPanel");
    });

    it("パネル表示中はメッセージリストが非表示になる", () => {
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton);

      expect(
        screen.queryByTestId("mock-chat-message-list"),
      ).not.toBeInTheDocument();
    });

    it("パネル表示中にaria-expandedがtrueになる", () => {
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    });

    it("パネル表示中にaria-labelが閉じるに変わる", () => {
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute(
        "aria-label",
        "スキル管理パネルを閉じる",
      );
    });

    it("再度クリックでパネルが閉じてメッセージエリアに戻る", () => {
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");

      // 開く
      fireEvent.click(toggleButton);
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();

      // 閉じる
      fireEvent.click(toggleButton);
      expect(
        screen.queryByTestId("mock-skill-management-panel"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("mock-chat-message-list")).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
      expect(toggleButton).toHaveAttribute(
        "aria-label",
        "スキル管理パネルを開く",
      );
    });
  });

  // ============================================================
  // TC-CP-03: スキル実行中はスキル管理ボタンが無効化される
  // ============================================================
  describe("TC-CP-03: スキル実行中の無効化", () => {
    it("isExecutingがtrueの場合、ボタンがdisabledになる", () => {
      setStoreState({ isExecuting: true, selectedSkillName: "test-skill" });
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      expect(toggleButton).toBeDisabled();
    });

    it("isExecutingがfalseの場合、ボタンがenabledである", () => {
      setStoreState({ isExecuting: false });
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      expect(toggleButton).not.toBeDisabled();
    });

    it("disabled状態ではクリックしてもパネルが開かない", () => {
      setStoreState({ isExecuting: true, selectedSkillName: "test-skill" });
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton);

      expect(
        screen.queryByTestId("mock-skill-management-panel"),
      ).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // G3: ChatPanel 結線テスト (TASK-10A-G)
  // ============================================================
  describe("G3: ChatPanel 結線テスト", () => {
    // G3-INT: ChatPanel 結線
    describe("G3-INT: ChatPanel 結線", () => {
      it("G3-INT-1: スキル管理ボタンで panel 表示を切り替えられる（toggle）", () => {
        setStoreState();
        render(<ChatPanel />);

        const toggleButton = screen.getByTestId("skill-management-toggle");

        // 初期状態: パネル非表示
        expect(
          screen.queryByTestId("mock-skill-management-panel"),
        ).not.toBeInTheDocument();

        // 1回目クリック: パネル表示
        fireEvent.click(toggleButton);
        expect(
          screen.getByTestId("mock-skill-management-panel"),
        ).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");

        // 2回目クリック: パネル非表示に戻る
        fireEvent.click(toggleButton);
        expect(
          screen.queryByTestId("mock-skill-management-panel"),
        ).not.toBeInTheDocument();
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");

        // 3回目クリック: 再度パネル表示（トグル動作の安定性確認）
        fireEvent.click(toggleButton);
        expect(
          screen.getByTestId("mock-skill-management-panel"),
        ).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute("aria-expanded", "true");
      });

      it("G3-INT-2: panel 表示中はメッセージ領域が非表示になる（排他表示）", () => {
        setStoreState();
        render(<ChatPanel />);

        // 初期状態: メッセージ領域が表示されている
        expect(
          screen.getByTestId("mock-chat-message-list"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId("mock-skill-management-panel"),
        ).not.toBeInTheDocument();

        // パネルを開く: メッセージ領域が消えてパネルが表示
        const toggleButton = screen.getByTestId("skill-management-toggle");
        fireEvent.click(toggleButton);

        expect(
          screen.queryByTestId("mock-chat-message-list"),
        ).not.toBeInTheDocument();
        expect(
          screen.getByTestId("mock-skill-management-panel"),
        ).toBeInTheDocument();

        // パネルを閉じる: メッセージ領域が復帰してパネルが消える
        fireEvent.click(toggleButton);

        expect(
          screen.getByTestId("mock-chat-message-list"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId("mock-skill-management-panel"),
        ).not.toBeInTheDocument();
      });

      it("G3-INT-3: スキル実行中はスキル管理パネル操作が制限される（executing guard）", () => {
        // 実行中状態を設定
        setStoreState({ isExecuting: true, selectedSkillName: "test-skill" });
        render(<ChatPanel />);

        const toggleButton = screen.getByTestId("skill-management-toggle");

        // ボタンが無効化されている
        expect(toggleButton).toBeDisabled();
        expect(toggleButton).toHaveAttribute("aria-expanded", "false");

        // クリックしてもパネルが開かない
        fireEvent.click(toggleButton);
        expect(
          screen.queryByTestId("mock-skill-management-panel"),
        ).not.toBeInTheDocument();

        // メッセージ領域は表示されたまま
        expect(
          screen.getByTestId("mock-chat-message-list"),
        ).toBeInTheDocument();
      });
    });

    // G3-ISO: テスト間分離
    describe("G3-ISO: テスト間分離", () => {
      it("G3-ISO-1: 前のテストの Store 状態が次のテストに漏れない（P9）", () => {
        // beforeEach で setStoreState() によりデフォルト状態にリセット済み
        // isExecuting がデフォルト false であることを確認（前テストで true に設定されていたが漏れていない）
        expect(mockStoreState.isExecuting).toBe(false);
        expect(mockStoreState.selectedSkillName).toBe(null);

        render(<ChatPanel />);

        // ボタンが有効（前テストの disabled 状態が漏れていない）
        const toggleButton = screen.getByTestId("skill-management-toggle");
        expect(toggleButton).not.toBeDisabled();

        // パネルが非表示（前テストの表示状態が漏れていない）
        expect(
          screen.queryByTestId("mock-skill-management-panel"),
        ).not.toBeInTheDocument();
      });

      it("G3-ISO-2: モック関数の呼び出し回数がテスト間でリセットされる", () => {
        // beforeEach で vi.clearAllMocks() によりリセット済み
        // mockFetchSkills の呼び出し回数が 0 から始まることを確認
        expect(mockFetchSkills).not.toHaveBeenCalled();

        render(<ChatPanel />);

        // マウント時に fetchSkills が1回だけ呼ばれる（前テストの呼び出し回数が累積していない）
        expect(mockFetchSkills).toHaveBeenCalledTimes(1);
      });
    });
  });
});
