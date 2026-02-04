/**
 * @vitest-environment jsdom
 *
 * SkillStreamDisplay i18n Integration Tests
 *
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 * 統合テスト - コンポーネント間のロケール一貫性を検証
 *
 * TASK-3-2-F: jsdom環境に切替完了
 *
 * @module @repo/desktop/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, cleanup, waitFor, render } from "@testing-library/react";
import type { SkillStreamMessage } from "@repo/shared/types/skill";
import { createTestI18n } from "../../../test-utils/i18n-test-utils";
import { I18nextProvider } from "react-i18next";

// Cleanup DOM between tests
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock useSkillExecution hook
const mockUseSkillExecution = {
  messages: [] as SkillStreamMessage[],
  status: "idle" as "idle" | "running" | "completed" | "error" | "aborted",
  executionId: null as string | null,
  error: null as { code: string; message: string } | null,
  isAborting: false,
  execute: vi.fn(),
  abort: vi.fn(),
  reset: vi.fn(),
};

// Mock the hook (both relative and alias paths)
vi.mock("../../hooks/useSkillExecution", () => ({
  useSkillExecution: () => mockUseSkillExecution,
}));

vi.mock("@/renderer/hooks/useSkillExecution", () => ({
  useSkillExecution: () => mockUseSkillExecution,
}));

// Mock useSkillPermission hook
const mockUseSkillPermission = {
  pendingPermission: null,
  handleApprove: vi.fn(),
  handleDeny: vi.fn(),
};

vi.mock("../../hooks/useSkillPermission", () => ({
  useSkillPermission: () => mockUseSkillPermission,
}));

vi.mock("@/renderer/hooks/useSkillPermission", () => ({
  useSkillPermission: () => mockUseSkillPermission,
}));

// Import component after mock setup
import { SkillStreamDisplay } from "../SkillStreamDisplay";

/**
 * ヘルパー: i18nプロバイダー付きレンダリング
 */
function renderWithProvider(
  ui: React.ReactElement,
  locale: string,
): ReturnType<typeof render> {
  const i18n = createTestI18n(locale);
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

// ============================================================
// 統合テスト: 言語切替
// jsdom環境で動作（TASK-3-2-F完了）
// ============================================================
describe("SkillStreamDisplay - i18n Integration (Phase 6)", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
  });

  describe("Language switching", () => {
    it("should update UI when language changes from ja to en", async () => {
      const i18n = createTestI18n("ja");

      const { rerender } = render(
        <I18nextProvider i18n={i18n}>
          <SkillStreamDisplay skillId="test" />
        </I18nextProvider>,
      );

      // 日本語で表示されていることを確認（複数表示の可能性あり）
      expect(screen.getAllByText("待機中").length).toBeGreaterThanOrEqual(1);

      // 言語を英語に変更
      await i18n.changeLanguage("en");

      // 再レンダリング
      rerender(
        <I18nextProvider i18n={i18n}>
          <SkillStreamDisplay skillId="test" />
        </I18nextProvider>,
      );

      // 英語で表示されることを確認（複数表示の可能性あり）
      await waitFor(() => {
        expect(screen.getAllByText("Idle").length).toBeGreaterThanOrEqual(1);
      });
    });

    it("should update UI when language changes from en to ja", async () => {
      const i18n = createTestI18n("en");

      const { rerender } = render(
        <I18nextProvider i18n={i18n}>
          <SkillStreamDisplay skillId="test" />
        </I18nextProvider>,
      );

      // 英語で表示されていることを確認（複数表示の可能性あり）
      expect(screen.getAllByText("Idle").length).toBeGreaterThanOrEqual(1);

      // 言語を日本語に変更
      await i18n.changeLanguage("ja");

      // 再レンダリング
      rerender(
        <I18nextProvider i18n={i18n}>
          <SkillStreamDisplay skillId="test" />
        </I18nextProvider>,
      );

      // 日本語で表示されることを確認（複数表示の可能性あり）
      await waitFor(() => {
        expect(screen.getAllByText("待機中").length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ============================================================
  // コンポーネント間のロケール一貫性
  // ============================================================
  describe("Locale consistency across components", () => {
    it("should use same locale for status and timestamp in Japanese", () => {
      const now = Date.now();
      mockUseSkillExecution.status = "running";
      mockUseSkillExecution.messages = [
        {
          id: "msg-1",
          executionId: "test-exec-001",
          type: "text",
          content: "Test message",
          timestamp: now - 60000, // 1分前
          isComplete: false,
        },
      ];

      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");

      // ステータスが日本語（複数表示の可能性あり）
      expect(screen.getAllByText("実行中").length).toBeGreaterThanOrEqual(1);

      // タイムスタンプも日本語
      const timestamp = screen.getByTestId("message-timestamp-msg-1");
      expect(timestamp).toHaveTextContent("1分前");
    });

    it("should use same locale for status and timestamp in English", () => {
      const now = Date.now();
      mockUseSkillExecution.status = "running";
      mockUseSkillExecution.messages = [
        {
          id: "msg-1",
          executionId: "test-exec-001",
          type: "text",
          content: "Test message",
          timestamp: now - 60000, // 1 minute ago
          isComplete: false,
        },
      ];

      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");

      // ステータスが英語（複数表示の可能性あり）
      expect(screen.getAllByText("Running").length).toBeGreaterThanOrEqual(1);

      // タイムスタンプも英語
      const timestamp = screen.getByTestId("message-timestamp-msg-1");
      expect(timestamp).toHaveTextContent("1 minute ago");
    });
  });

  // ============================================================
  // ステータス翻訳テスト（日本語）
  // ============================================================
  describe("Status translations - Japanese", () => {
    it("should translate idle status correctly", () => {
      mockUseSkillExecution.status = "idle";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText("待機中").length).toBeGreaterThanOrEqual(1);
    });

    it("should translate running status correctly", () => {
      mockUseSkillExecution.status = "running";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText("実行中").length).toBeGreaterThanOrEqual(1);
    });

    it("should translate completed status correctly", () => {
      mockUseSkillExecution.status = "completed";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText("完了").length).toBeGreaterThanOrEqual(1);
    });

    it("should translate error status correctly", () => {
      mockUseSkillExecution.status = "error";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText("エラー").length).toBeGreaterThanOrEqual(1);
    });

    it("should translate aborted status correctly", () => {
      mockUseSkillExecution.status = "aborted";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText("中断").length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================
  // ステータス翻訳テスト（英語）
  // ============================================================
  describe("Status translations - English", () => {
    it("should translate idle status correctly", () => {
      mockUseSkillExecution.status = "idle";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText("Idle").length).toBeGreaterThanOrEqual(1);
    });

    it("should translate running status correctly", () => {
      mockUseSkillExecution.status = "running";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText("Running").length).toBeGreaterThanOrEqual(1);
    });

    it("should translate completed status correctly", () => {
      mockUseSkillExecution.status = "completed";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
    });

    it("should translate error status correctly", () => {
      mockUseSkillExecution.status = "error";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText("Error").length).toBeGreaterThanOrEqual(1);
    });

    it("should translate aborted status correctly", () => {
      mockUseSkillExecution.status = "aborted";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText("Aborted").length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================
  // ボタンのローカライズ
  // ============================================================
  describe("Button localization", () => {
    it("should translate abort button in Japanese", () => {
      mockUseSkillExecution.status = "running";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getByRole("button", { name: /中断/ })).toBeInTheDocument();
    });

    it("should translate abort button in English", () => {
      mockUseSkillExecution.status = "running";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getByRole("button", { name: /Abort/ })).toBeInTheDocument();
    });

    it("should translate reset button in Japanese", () => {
      mockUseSkillExecution.status = "completed";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");
      expect(
        screen.getByRole("button", { name: /リセット/ }),
      ).toBeInTheDocument();
    });

    it("should translate reset button in English", () => {
      mockUseSkillExecution.status = "completed";
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getByRole("button", { name: /Reset/ })).toBeInTheDocument();
    });
  });

  // ============================================================
  // 空状態メッセージのローカライズ
  // ============================================================
  describe("Empty state message localization", () => {
    it("should display Japanese empty state message", () => {
      mockUseSkillExecution.status = "idle";
      mockUseSkillExecution.messages = [];
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "ja");
      expect(
        screen.getByText("スキル実行を開始してください"),
      ).toBeInTheDocument();
    });

    it("should display English empty state message", () => {
      mockUseSkillExecution.status = "idle";
      mockUseSkillExecution.messages = [];
      renderWithProvider(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getByText("Start skill execution")).toBeInTheDocument();
    });
  });
});
