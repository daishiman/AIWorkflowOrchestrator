/**
 * @vitest-environment happy-dom
 *
 * SkillStreamDisplay i18n Tests (TDD Red Phase)
 *
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 * 多言語対応のテストケース
 *
 * Note: これらのテストは実装前に作成されるため、すべて失敗する（Red状態）
 *
 * @module @repo/desktop/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SkillStreamMessage } from "@repo/shared/types/skill-execution";

// テストユーティリティ
import { renderWithI18n } from "../../../test-utils/i18n-test-utils";

// Cleanup DOM between tests
afterEach(() => {
  cleanup();
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

// Mock useSkillPermission hook
const mockUseSkillPermission = {
  pendingPermission: null,
  handleApprove: vi.fn(),
  handleDeny: vi.fn(),
};

// Mock hooks
vi.mock("@/renderer/hooks/useSkillExecution", () => ({
  useSkillExecution: () => mockUseSkillExecution,
}));

vi.mock("../../hooks/useSkillExecution", () => ({
  useSkillExecution: () => mockUseSkillExecution,
}));

vi.mock("@/renderer/hooks/useSkillPermission", () => ({
  useSkillPermission: () => mockUseSkillPermission,
}));

vi.mock("../../hooks/useSkillPermission", () => ({
  useSkillPermission: () => mockUseSkillPermission,
}));

// Import component after mock setup
import { SkillStreamDisplay } from "../SkillStreamDisplay";

// ============================================================
// 日本語ロケールテスト
// ============================================================
describe("SkillStreamDisplay - Japanese locale (ja)", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  describe("Status text", () => {
    it("should display '待機中' for idle status", () => {
      mockUseSkillExecution.status = "idle";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText(/待機中/).length).toBeGreaterThanOrEqual(1);
    });

    it("should display '実行中' for running status", () => {
      mockUseSkillExecution.status = "running";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText(/実行中/).length).toBeGreaterThanOrEqual(1);
    });

    it("should display '完了' for completed status", () => {
      mockUseSkillExecution.status = "completed";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText(/完了/).length).toBeGreaterThanOrEqual(1);
    });

    it("should display 'エラー' for error status", () => {
      mockUseSkillExecution.status = "error";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText(/エラー/).length).toBeGreaterThanOrEqual(1);
    });

    it("should display '中断' for aborted status", () => {
      mockUseSkillExecution.status = "aborted";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getAllByText(/中断/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Button labels", () => {
    it("should display '中断' button when running", () => {
      mockUseSkillExecution.status = "running";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(
        screen.getByRole("button", { name: /中断|スキル実行を中断/ }),
      ).toBeInTheDocument();
    });

    it("should display 'リセット' button when completed", () => {
      mockUseSkillExecution.status = "completed";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(
        screen.getByRole("button", { name: /リセット|状態をリセット/ }),
      ).toBeInTheDocument();
    });
  });

  describe("aria-label attributes", () => {
    it("should have Japanese aria-label on LoadingSpinner", () => {
      mockUseSkillExecution.status = "running";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(
        screen.getByRole("status", { name: "実行中" }),
      ).toBeInTheDocument();
    });
  });

  describe("Messages", () => {
    it("should display 'スキル実行を開始してください' when idle", () => {
      mockUseSkillExecution.status = "idle";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(
        screen.getByText("スキル実行を開始してください"),
      ).toBeInTheDocument();
    });

    it("should display '実行中...' when running with no messages", () => {
      mockUseSkillExecution.status = "running";
      mockUseSkillExecution.messages = [];
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
      expect(screen.getByText("実行中...")).toBeInTheDocument();
    });
  });
});

// ============================================================
// 英語ロケールテスト
// ============================================================
describe("SkillStreamDisplay - English locale (en)", () => {
  beforeEach(() => {
    mockUseSkillExecution.messages = [];
    mockUseSkillExecution.status = "idle";
    mockUseSkillExecution.executionId = null;
    mockUseSkillExecution.error = null;
    mockUseSkillExecution.isAborting = false;
    vi.clearAllMocks();
  });

  describe("Status text", () => {
    it("should display 'Idle' for idle status", () => {
      mockUseSkillExecution.status = "idle";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText(/Idle/).length).toBeGreaterThanOrEqual(1);
    });

    it("should display 'Running' for running status", () => {
      mockUseSkillExecution.status = "running";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText(/Running/).length).toBeGreaterThanOrEqual(1);
    });

    it("should display 'Completed' for completed status", () => {
      mockUseSkillExecution.status = "completed";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText(/Completed/).length).toBeGreaterThanOrEqual(1);
    });

    it("should display 'Error' for error status", () => {
      mockUseSkillExecution.status = "error";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText(/Error/).length).toBeGreaterThanOrEqual(1);
    });

    it("should display 'Aborted' for aborted status", () => {
      mockUseSkillExecution.status = "aborted";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getAllByText(/Aborted/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Button labels", () => {
    it("should display 'Abort' button when running", () => {
      mockUseSkillExecution.status = "running";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getByRole("button", { name: /Abort/ })).toBeInTheDocument();
    });

    it("should display 'Reset' button when completed", () => {
      mockUseSkillExecution.status = "completed";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getByRole("button", { name: /Reset/ })).toBeInTheDocument();
    });
  });

  describe("aria-label attributes", () => {
    it("should have English aria-label on LoadingSpinner", () => {
      mockUseSkillExecution.status = "running";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(
        screen.getByRole("status", { name: "Loading" }),
      ).toBeInTheDocument();
    });
  });

  describe("Messages", () => {
    it("should display 'Start skill execution' when idle", () => {
      mockUseSkillExecution.status = "idle";
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getByText("Start skill execution")).toBeInTheDocument();
    });

    it("should display 'Executing...' when running with no messages", () => {
      mockUseSkillExecution.status = "running";
      mockUseSkillExecution.messages = [];
      renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
      expect(screen.getByText("Executing...")).toBeInTheDocument();
    });
  });
});

// ============================================================
// CopyButton フィードバックテスト
// NOTE: happy-dom環境でnavigator.clipboardのモックが困難なため一時スキップ
// TODO: TASK-3-2-F で修正予定
// ============================================================
describe.skip("SkillStreamDisplay - CopyButton feedback", () => {
  beforeEach(() => {
    mockUseSkillExecution.status = "running";
    mockUseSkillExecution.messages = [
      {
        id: "msg-1",
        type: "text",
        content: "Test message",
        timestamp: Date.now(),
      },
    ];
    vi.clearAllMocks();

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("should display 'コピーしました' after copying in Japanese locale", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("コピーしました")).toBeInTheDocument();
    });
  });

  it("should display 'Copied' after copying in English locale", async () => {
    const user = userEvent.setup();
    renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");

    const copyButton = screen.getByTestId("copy-button-msg-1");
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
  });

  it("should have Japanese aria-label on CopyButton in Japanese locale", () => {
    renderWithI18n(<SkillStreamDisplay skillId="test" />, "ja");
    expect(
      screen.getByRole("button", { name: "メッセージをコピー" }),
    ).toBeInTheDocument();
  });

  it("should have English aria-label on CopyButton in English locale", () => {
    renderWithI18n(<SkillStreamDisplay skillId="test" />, "en");
    expect(
      screen.getByRole("button", { name: "Copy message" }),
    ).toBeInTheDocument();
  });
});
