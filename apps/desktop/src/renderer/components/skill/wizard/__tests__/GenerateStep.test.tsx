/**
 * @file GenerateStep.test.tsx
 * @description GenerateStep コンポーネント ユニットテスト
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenerateStep } from "../GenerateStep";
import type { GenerateStepProps } from "../GenerateStep";
import type { PlanResult } from "../../../../store/slices/agentSlice";

// ---- ヘルパー ----

const baseProps: GenerateStepProps = {
  stage: "idle",
  percent: 0,
  message: "",
};

function renderStep(overrides: Partial<GenerateStepProps> = {}) {
  return render(<GenerateStep {...baseProps} {...overrides} />);
}

describe("GenerateStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================
  // プログレスバー
  // ==========================================================
  describe("プログレスバー", () => {
    it("idle ではプログレスバーが表示されない", () => {
      renderStep({ stage: "idle" });
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("planning でプログレスバーが表示される", () => {
      renderStep({ stage: "planning", percent: 10 });
      const bar = screen.getByRole("progressbar");
      expect(bar).toBeInTheDocument();
      expect(bar).toHaveAttribute("aria-valuenow", "10");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
    });

    it("done でプログレスバーが表示される", () => {
      renderStep({ stage: "done", percent: 100 });
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("error ではプログレスバーが表示されない", () => {
      renderStep({
        stage: "error",
        error: { code: "LLM_ERROR", message: "err" },
      });
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("cancelled ではプログレスバーが表示されない", () => {
      renderStep({ stage: "cancelled" });
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("percent がクランプされる（-10 → 0%, 200 → 100%）", () => {
      const { rerender } = render(
        <GenerateStep
          {...baseProps}
          stage="planning"
          percent={-10}
          message=""
        />,
      );
      const bar = screen.getByRole("progressbar");
      expect(bar).toHaveAttribute("aria-valuenow", "-10");
      const inner = bar.querySelector("div");
      expect(inner?.style.width).toBe("0%");

      rerender(
        <GenerateStep
          {...baseProps}
          stage="planning"
          percent={200}
          message=""
        />,
      );
      const inner2 = screen.getByRole("progressbar").querySelector("div");
      expect(inner2?.style.width).toBe("100%");
    });
  });

  // ==========================================================
  // ステップリスト
  // ==========================================================
  describe("ステップリスト", () => {
    it("planning ステージで4段階のステップが表示される", () => {
      renderStep({ stage: "planning", percent: 10 });
      expect(
        screen.getByText("スキルの構造を計画しています..."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("SKILL.md を生成しています..."),
      ).toBeInTheDocument();
      expect(
        screen.getByText("エージェント定義を生成しています..."),
      ).toBeInTheDocument();
      expect(screen.getByText("スキルを検証しています...")).toBeInTheDocument();
    });

    it("generating-agents で前のステップが completed 表示される", () => {
      renderStep({ stage: "generating-agents", percent: 60 });
      const checkmarks = screen.getAllByText("✓");
      expect(checkmarks).toHaveLength(2);
    });

    it("done では全ステップが completed 表示される", () => {
      renderStep({ stage: "done", percent: 100 });
      const checkmarks = screen.getAllByText("✓");
      expect(checkmarks).toHaveLength(4);
    });

    it("idle ではステップリストが表示されない", () => {
      renderStep({ stage: "idle" });
      expect(
        screen.queryByText("スキルの構造を計画しています..."),
      ).not.toBeInTheDocument();
    });
  });

  // ==========================================================
  // メッセージ表示
  // ==========================================================
  describe("メッセージ表示", () => {
    it("生成中にメッセージが表示される", () => {
      renderStep({
        stage: "generating-skill",
        percent: 30,
        message: "ファイル構造を解析中...",
      });
      expect(screen.getByText("ファイル構造を解析中...")).toBeInTheDocument();
    });

    it("generationProgress が message 未設定時に表示される", () => {
      renderStep({
        stage: "planning",
        percent: 10,
        message: "",
        generationProgress: "計画を生成中...",
      });
      expect(screen.getByText("計画を生成中...")).toBeInTheDocument();
    });

    it("message が generationProgress より優先される", () => {
      renderStep({
        stage: "planning",
        percent: 10,
        message: "優先メッセージ",
        generationProgress: "計画を生成中...",
      });
      expect(screen.getByText("優先メッセージ")).toBeInTheDocument();
      expect(screen.queryByText("計画を生成中...")).not.toBeInTheDocument();
    });

    it("idle ではメッセージが表示されない", () => {
      renderStep({ stage: "idle", message: "test" });
      expect(screen.queryByText("test")).not.toBeInTheDocument();
    });
  });

  // ==========================================================
  // プレビュー
  // ==========================================================
  describe("プレビュー", () => {
    it("previewContent が渡された場合にプレビューパネルが表示される", () => {
      renderStep({
        stage: "generating-skill",
        percent: 40,
        previewContent: "# SKILL.md\nname: test",
      });
      expect(screen.getByText("プレビュー")).toBeInTheDocument();
      const pre = screen.getByText((_content, element) => {
        return (
          element?.tagName === "PRE" &&
          element.textContent === "# SKILL.md\nname: test"
        );
      });
      expect(pre).toBeInTheDocument();
    });

    it("previewContent が null の場合にプレビューが表示されない", () => {
      renderStep({ stage: "generating-skill", percent: 40 });
      expect(screen.queryByText("プレビュー")).not.toBeInTheDocument();
    });
  });

  // ==========================================================
  // エラー表示
  // ==========================================================
  describe("エラー表示", () => {
    it("API_KEY_NOT_SET エラーで「設定を開く」ボタンが表示される", () => {
      const onOpenSettings = vi.fn();
      renderStep({
        stage: "error",
        percent: 0,
        error: {
          code: "API_KEY_NOT_SET",
          message: "APIキーが設定されていません",
        },
        onOpenSettings,
      });
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(screen.getByText("APIキーが未設定です")).toBeInTheDocument();
      const button = screen.getByText("設定を開く");
      fireEvent.click(button);
      expect(onOpenSettings).toHaveBeenCalledOnce();
    });

    it("LLM_ERROR エラーでリトライボタンが表示される", () => {
      const onRetry = vi.fn();
      renderStep({
        stage: "error",
        percent: 0,
        error: { code: "LLM_ERROR", message: "レートリミット超過" },
        onRetry,
      });
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("生成エラー")).toBeInTheDocument();
      const button = screen.getByText("リトライ");
      fireEvent.click(button);
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it("NETWORK_ERROR エラーで接続確認メッセージが表示される", () => {
      renderStep({
        stage: "error",
        percent: 0,
        error: { code: "NETWORK_ERROR", message: "接続がタイムアウトしました" },
      });
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("ネットワークエラー")).toBeInTheDocument();
      expect(screen.getByText("接続を確認してください")).toBeInTheDocument();
    });

    it("error が null の場合はエラーが表示されない", () => {
      renderStep({ stage: "planning", percent: 10 });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  // ==========================================================
  // キャンセルボタン
  // ==========================================================
  describe("キャンセルボタン", () => {
    it("生成中にキャンセルボタンが表示される", () => {
      const onCancel = vi.fn();
      renderStep({ stage: "planning", percent: 10, onCancel });
      const button = screen.getByText("キャンセル");
      fireEvent.click(button);
      expect(onCancel).toHaveBeenCalledOnce();
    });

    it("idle ではキャンセルボタンが表示されない", () => {
      renderStep({ stage: "idle", onCancel: vi.fn() });
      expect(screen.queryByText("キャンセル")).not.toBeInTheDocument();
    });

    it("done ではキャンセルボタンが表示されない", () => {
      renderStep({ stage: "done", percent: 100, onCancel: vi.fn() });
      expect(screen.queryByText("キャンセル")).not.toBeInTheDocument();
    });

    it("onCancel が未定義の場合はキャンセルボタンが表示されない", () => {
      renderStep({ stage: "planning", percent: 10 });
      expect(screen.queryByText("キャンセル")).not.toBeInTheDocument();
    });
  });

  // ==========================================================
  // 完了・キャンセル済み表示
  // ==========================================================
  describe("完了・キャンセル済み表示", () => {
    it("done で完了メッセージが表示される", () => {
      renderStep({ stage: "done", percent: 100 });
      expect(screen.getByText("生成が完了しました")).toBeInTheDocument();
    });

    it("cancelled でキャンセルメッセージが表示される", () => {
      renderStep({ stage: "cancelled" });
      expect(screen.getByText("キャンセルしました")).toBeInTheDocument();
    });
  });

  // ==========================================================
  // Legacy LLM plan/execute
  // ==========================================================
  describe("LLM plan/execute 互換表示", () => {
    const planResult: PlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      skillSpec: "# generated skill spec",
      estimatedSteps: 3,
    };

    it("planResult が渡されると生成計画と実行するボタンが表示される", () => {
      const onExecutePlan = vi.fn();
      const onCancelPlan = vi.fn();
      renderStep({
        planResult,
        onExecutePlan,
        onCancelPlan,
      });

      expect(screen.getByText("生成計画")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "実行する" }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      expect(onExecutePlan).toHaveBeenCalledOnce();
    });

    it("planResult があるときはキャンセルボタンが 1 つだけ表示される", () => {
      renderStep({
        planResult,
        onCancelPlan: vi.fn(),
      });

      expect(
        screen.getAllByRole("button", { name: "キャンセル" }),
      ).toHaveLength(1);
    });

    it("terminal_handoff の guidance が表示される", () => {
      renderStep({
        planResult: {
          type: "terminal_handoff",
          planId: "plan-002",
          guidance: {
            reason: "terminal での実行が必要です",
            terminalCommand: "codex run --handoff",
          },
        },
        onCancelPlan: vi.fn(),
      });

      expect(
        screen.getByText("terminal での実行が必要です"),
      ).toBeInTheDocument();
      expect(screen.getByText("codex run --handoff")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "実行する" }),
      ).not.toBeInTheDocument();
    });

    it("LLM エラー時は「最初からやり直す」ボタンが表示される", () => {
      const onCancelPlan = vi.fn();
      renderStep({
        stage: "error",
        percent: 0,
        error: {
          code: "LLM_ERROR",
          message: "planSkill 呼び出しに失敗しました",
        },
        onCancelPlan,
      });

      const button = screen.getByRole("button", { name: "最初からやり直す" });
      fireEvent.click(button);
      expect(onCancelPlan).toHaveBeenCalledOnce();
    });

    it("isGenerating=true のとき実行ボタンが disabled になる", () => {
      const onExecutePlan = vi.fn();
      renderStep({
        planResult,
        onExecutePlan,
        onCancelPlan: vi.fn(),
        isGenerating: true,
      });

      expect(screen.getByRole("button", { name: "実行する" })).toBeDisabled();
    });
  });

  // ==========================================================
  // アクセシビリティ
  // ==========================================================
  describe("アクセシビリティ", () => {
    it("ステップリストに aria-live='polite' が設定されている", () => {
      const { container } = renderStep({ stage: "planning", percent: 10 });
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  // ==========================================================
  // ref forwarding
  // ==========================================================
  describe("ref forwarding", () => {
    it("ref が正しくフォワードされる", () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<GenerateStep ref={ref} {...baseProps} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  // ==========================================================
  // 境界値テスト
  // ==========================================================
  describe("境界値テスト", () => {
    it("percent = 0 でプログレスバーの幅が 0%", () => {
      renderStep({ stage: "planning", percent: 0 });
      const bar = screen.getByRole("progressbar");
      const inner = bar.querySelector("div");
      expect(inner?.style.width).toBe("0%");
    });

    it("percent = 50 でプログレスバーの幅が 50%", () => {
      renderStep({ stage: "generating-skill", percent: 50 });
      const bar = screen.getByRole("progressbar");
      const inner = bar.querySelector("div");
      expect(inner?.style.width).toBe("50%");
    });

    it("percent = 100 でプログレスバーの幅が 100%", () => {
      renderStep({ stage: "done", percent: 100 });
      const bar = screen.getByRole("progressbar");
      const inner = bar.querySelector("div");
      expect(inner?.style.width).toBe("100%");
    });

    it("previewContent が空文字列の場合はプレビューが表示されない", () => {
      renderStep({
        stage: "generating-skill",
        percent: 40,
        previewContent: "",
      });
      expect(screen.queryByText("プレビュー")).not.toBeInTheDocument();
    });
  });

  // ------------------------------------------
  // TASK-SW-FIX-STATE-DETAIL-001: 問題13 templateモード キャンセルボタン
  // ------------------------------------------
  describe("問題13修正: templateモードのエラー時にキャンセルボタンが表示される", () => {
    it("TC-03: templateモードでエラーが発生した場合、キャンセルボタンが表示される", () => {
      const mockOnCancel = vi.fn();
      renderStep({
        mode: "template",
        stage: "error",
        error: { code: "LLM_ERROR", message: "生成に失敗しました" },
        onCancel: mockOnCancel,
      });

      expect(
        screen.getByRole("button", { name: "最初からやり直す" }),
      ).toBeInTheDocument();
    });

    it("TC-04: templateモードエラー後にキャンセルボタンを押すと onCancel が呼ばれる", () => {
      const mockOnCancel = vi.fn();
      renderStep({
        mode: "template",
        stage: "error",
        error: { code: "LLM_ERROR", message: "生成に失敗しました" },
        onCancel: mockOnCancel,
      });

      fireEvent.click(screen.getByRole("button", { name: "最初からやり直す" }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it("TC-05: 非templateモード（mode 省略）のエラー状態では templateキャンセルボタンが表示されない（回帰）", () => {
      const mockOnCancel = vi.fn();
      renderStep({
        stage: "error",
        error: { code: "LLM_ERROR", message: "生成に失敗しました" },
        onCancel: mockOnCancel,
      });

      expect(
        screen.queryByRole("button", { name: "最初からやり直す" }),
      ).not.toBeInTheDocument();
    });

    // Phase 6 境界ケース
    it("TC-B2: templateモード + 生成中ステージ（非エラー）ではキャンセルボタンが表示されない", () => {
      const mockOnCancel = vi.fn();
      renderStep({
        mode: "template",
        stage: "generating-skill",
        onCancel: mockOnCancel,
      });

      // 生成中（非エラー）状態では最初からやり直すボタンは不要
      expect(
        screen.queryByRole("button", { name: "最初からやり直す" }),
      ).not.toBeInTheDocument();
    });
  });
});

// ==========================================================
// TASK-SW-FIX-STATE-DETAIL-001: 問題13 templateモードキャンセルボタン（TC-03〜TC-05）
// ==========================================================

describe("TASK-SW-FIX-STATE-DETAIL-001: 問題13 templateモードキャンセルボタン", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TC-03: isTemplateMode=true かつエラー時にキャンセルボタンが表示される", () => {
    const onCancel = vi.fn();
    renderStep({
      stage: "error",
      error: { code: "LLM_ERROR", message: "生成エラー" },
      isTemplateMode: true,
      onCancel,
    });
    expect(
      screen.getByRole("button", { name: "キャンセル" }),
    ).toBeInTheDocument();
  });

  it("TC-04: isTemplateMode=true エラー後にキャンセルボタン押下でonCancelが呼ばれる", () => {
    const onCancel = vi.fn();
    renderStep({
      stage: "error",
      error: { code: "LLM_ERROR", message: "生成エラー" },
      isTemplateMode: true,
      onCancel,
    });
    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("TC-05: isTemplateMode未指定（通常モード）のエラー状態ではキャンセルボタンが表示されない（回帰）", () => {
    renderStep({
      stage: "error",
      error: { code: "LLM_ERROR", message: "生成エラー" },
      onCancel: vi.fn(),
    });
    // 通常モードのエラー時は既存のキャンセルボタン条件（isActive=false）により非表示
    expect(
      screen.queryByRole("button", { name: "キャンセル" }),
    ).not.toBeInTheDocument();
  });

  it("TC-12: isTemplateMode=true かつエラーなし（idle）ではtemplateモード専用キャンセルボタンが表示されない（境界）", () => {
    const onCancel = vi.fn();
    renderStep({
      stage: "idle",
      percent: 0,
      isTemplateMode: true,
      onCancel,
      // error なし
    });
    // error=undefined のため問題13修正ボタン（isTemplateMode && error && onCancel）は非表示
    expect(
      screen.queryByRole("button", { name: "キャンセル" }),
    ).not.toBeInTheDocument();
  });
});
