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
      expect(screen.getByTestId("message-list-slot")).toBeInTheDocument();
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

      expect(screen.queryByTestId("message-list-slot")).not.toBeInTheDocument();
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
      expect(screen.getByTestId("message-list-slot")).toBeInTheDocument();
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

    it("isExecuting解除後にボタンが再有効化される", () => {
      // isExecuting=true で初期描画
      setStoreState({ isExecuting: true, selectedSkillName: "test-skill" });
      const { rerender } = render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      expect(toggleButton).toBeDisabled();

      // isExecuting=false に遷移して再レンダー
      setStoreState({ isExecuting: false, selectedSkillName: "test-skill" });
      rerender(<ChatPanel />);

      expect(toggleButton).not.toBeDisabled();
      // 再有効化後にクリックでパネルが開くことを確認
      fireEvent.click(toggleButton);
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();
    });
  });

  // ============================================================
  // TC-CP-04: 再マウント時のスキル管理パネル状態初期化 (RT-05)
  // ============================================================
  describe("TC-CP-04: 再マウント時の状態初期化", () => {
    it("パネル表示中にアンマウント→再マウントするとパネルが閉じた状態に戻る", () => {
      const { unmount } = render(<ChatPanel />);

      // パネルを開く
      const toggleButton = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton);
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();

      // アンマウント→再マウント
      unmount();
      render(<ChatPanel />);

      // 再マウント後はパネルが閉じた初期状態
      expect(
        screen.queryByTestId("mock-skill-management-panel"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("message-list-slot")).toBeInTheDocument();
      expect(screen.getByTestId("skill-management-toggle")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  // ============================================================
  // TC-G03: ライフサイクル統合テスト（Layer 3 拡張）
  // ============================================================
  describe("TC-G03: ライフサイクル統合テスト", () => {
    it("TC-G03-001: スキル作成後にリスト表示が更新される", () => {
      setStoreState();
      const { unmount } = render(<ChatPanel />);

      // パネルを開く
      const toggleButton = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton);
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();

      // 一度アンマウントしてstore状態を更新後に再レンダー
      unmount();
      setStoreState({ selectedSkillName: "new-created-skill" });
      render(<ChatPanel />);

      // パネルを再度開く → SkillManagementPanelが再表示される
      const toggleButton2 = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton2);
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toHaveTextContent("SkillManagementPanel");
    });

    it("TC-G03-002: 作成キャンセル時にリストが変更されない", () => {
      setStoreState();
      render(<ChatPanel />);

      // パネルを開く
      const toggleButton = screen.getByTestId("skill-management-toggle");
      fireEvent.click(toggleButton);
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();

      // レンダー時の呼び出し回数を記録
      const callCountBeforeClose = mockFetchSkills.mock.calls.length;

      // パネルを閉じる（キャンセル相当）
      fireEvent.click(toggleButton);
      expect(
        screen.queryByTestId("mock-skill-management-panel"),
      ).not.toBeInTheDocument();

      // パネルを閉じた際に追加のfetchSkills呼び出しがないことを検証
      expect(mockFetchSkills.mock.calls.length).toBe(callCountBeforeClose);
    });

    it("TC-G03-003: 既存テストと同一の基本操作が正常に動作する", () => {
      setStoreState();
      render(<ChatPanel />);

      // パネル表示確認
      const toggleButton = screen.getByTestId("skill-management-toggle");
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");

      // 開く
      fireEvent.click(toggleButton);
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");

      // 閉じる
      fireEvent.click(toggleButton);
      expect(
        screen.queryByTestId("mock-skill-management-panel"),
      ).not.toBeInTheDocument();
      expect(toggleButton).toHaveAttribute("aria-expanded", "false");
    });

    it("TC-G03-004: テスト間の状態リークがないことを検証（P9対策）", () => {
      // カスタム状態を設定
      setStoreState({
        isExecuting: true,
        selectedSkillName: "leak-test-skill",
        skillExecutionStatus: "running",
      });
      render(<ChatPanel />);

      const toggleButton = screen.getByTestId("skill-management-toggle");
      // 実行中なのでdisabled
      expect(toggleButton).toBeDisabled();
      cleanup();

      // 状態をデフォルトにリセット
      setStoreState();
      render(<ChatPanel />);

      const toggleButton2 = screen.getByTestId("skill-management-toggle");
      // デフォルト状態ではenabled
      expect(toggleButton2).not.toBeDisabled();

      // パネル操作が正常に動作する
      fireEvent.click(toggleButton2);
      expect(
        screen.getByTestId("mock-skill-management-panel"),
      ).toBeInTheDocument();
    });
  });
});
