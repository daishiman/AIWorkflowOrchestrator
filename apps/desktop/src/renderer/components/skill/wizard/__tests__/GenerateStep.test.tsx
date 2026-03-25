/**
 * @file GenerateStep.test.tsx
 * @description GenerateStep コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenerateStep } from "../GenerateStep";
import type { PlanResult } from "../../../../store/slices/agentSlice";

describe("GenerateStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------
  // 1. isGenerating=trueでスピナー表示
  // ------------------------------------------
  it("isGenerating=trueでスピナーが表示される", () => {
    render(<GenerateStep isGenerating={true} error={null} />);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
  });

  // ------------------------------------------
  // 2. isGenerating=trueで「生成中...」テキスト表示
  // ------------------------------------------
  it("isGenerating=trueで「生成中...」テキストが表示される", () => {
    render(<GenerateStep isGenerating={true} error={null} />);

    expect(screen.getByText("生成中...")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 3. isGenerating=falseでスピナー非表示
  // ------------------------------------------
  it("isGenerating=falseでスピナーが表示されない", () => {
    render(<GenerateStep isGenerating={false} error={null} />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText("生成中...")).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 4. error設定でエラーメッセージ表示
  // ------------------------------------------
  it("error設定でエラーメッセージが表示される", () => {
    const testError = new Error("接続に失敗しました");
    render(<GenerateStep isGenerating={false} error={testError} />);

    expect(screen.getByText("接続に失敗しました")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 5. error=nullでエラー非表示
  // ------------------------------------------
  it("error=nullでエラーメッセージが表示されない", () => {
    render(<GenerateStep isGenerating={false} error={null} />);

    // エラーメッセージの要素がないことを確認
    expect(
      screen.queryByText("スキル生成に失敗しました"),
    ).not.toBeInTheDocument();
  });

  // ------------------------------------------
  // 6. aria-liveが存在
  // ------------------------------------------
  it("isGenerating=trueでaria-live='polite'要素が存在する", () => {
    const { container } = render(
      <GenerateStep isGenerating={true} error={null} />,
    );

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  // ------------------------------------------
  // 7. エラーメッセージが空の場合のフォールバック
  // ------------------------------------------
  it("error.messageが空の場合にフォールバックメッセージが表示される", () => {
    const emptyError = new Error("");
    render(<GenerateStep isGenerating={false} error={emptyError} />);

    expect(screen.getByText("スキル生成に失敗しました")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 8. isGeneratingとerrorが同時に設定可能
  // ------------------------------------------
  it("isGeneratingとerrorが同時に表示される", () => {
    const testError = new Error("タイムアウトしました");
    render(<GenerateStep isGenerating={true} error={testError} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("タイムアウトしました")).toBeInTheDocument();
  });

  // ==========================================================
  // Phase 6: 追加異常系
  // ==========================================================
  describe("GenerateStep - 追加異常系", () => {
    it("isGenerating=false かつ error=null のときスピナーもエラーも表示されない", () => {
      const { container } = render(
        <GenerateStep isGenerating={false} error={null} />,
      );
      expect(
        container.querySelector('[role="status"]'),
      ).not.toBeInTheDocument();
    });
  });

  // ==========================================================
  // Phase 4 追加: TASK-SC-07 AC-3,4,5,6,7,8
  // ==========================================================
  const mockOnExecutePlan = vi.fn();
  const mockOnCancelPlan = vi.fn();

  describe("generationProgress 表示（AC-6）", () => {
    it("generationProgress が設定されているとき進捗テキストが表示される", () => {
      render(
        <GenerateStep
          isGenerating={true}
          error={null}
          generationMode="llm"
          generationProgress="計画を生成中..."
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(screen.getByText("計画を生成中...")).toBeInTheDocument();
    });

    it("generationProgress=null のとき進捗テキストが表示されない", () => {
      render(
        <GenerateStep
          isGenerating={true}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(screen.queryByText("計画を生成中...")).not.toBeInTheDocument();
    });
  });

  describe("plan 結果表示（AC-3）", () => {
    const planResult: PlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 5,
    };

    it("planResult が設定されているとき生成計画セクションが表示される", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={planResult}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(screen.getByText("生成計画")).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it("planResult=null のとき生成計画セクションが表示されない", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(screen.queryByText("生成計画")).not.toBeInTheDocument();
    });

    it("terminal_handoff のとき guidance が表示される", () => {
      const terminalPlan: PlanResult = {
        type: "terminal_handoff",
        guidance: {
          reason: "大規模タスクはCLIで実行する必要があります",
          command: "npx skill-creator plan",
        },
      };
      render(
        <GenerateStep
          isGenerating={false}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={terminalPlan}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(
        screen.getByText(/大規模タスクはCLIで実行する必要があります/),
      ).toBeInTheDocument();
    });
  });

  describe("実行ボタン（AC-4）", () => {
    const planResult: PlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 3,
    };

    it("planResult が設定されているとき「実行する」ボタンが表示される", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={planResult}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(
        screen.getByRole("button", { name: "実行する" }),
      ).toBeInTheDocument();
    });

    it("「実行する」クリックで onExecutePlan が呼ばれる", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={planResult}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "実行する" }));
      expect(mockOnExecutePlan).toHaveBeenCalledTimes(1);
    });

    it("isGenerating=true のとき「実行する」ボタンが disabled になる", () => {
      render(
        <GenerateStep
          isGenerating={true}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={planResult}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(screen.getByRole("button", { name: "実行する" })).toBeDisabled();
    });
  });

  describe("キャンセルボタン（AC-5）", () => {
    const planResult: PlanResult = {
      type: "integrated_api",
      planId: "plan-001",
      estimatedSteps: 3,
    };

    it("planResult が設定されているとき「キャンセル」ボタンが表示される", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={planResult}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(
        screen.getByRole("button", { name: "キャンセル" }),
      ).toBeInTheDocument();
    });

    it("「キャンセル」クリックで onCancelPlan が呼ばれる", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={null}
          generationMode="llm"
          generationProgress={null}
          planResult={planResult}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(mockOnCancelPlan).toHaveBeenCalledTimes(1);
    });
  });

  describe("テンプレートモード非破壊（AC-8）", () => {
    it("generationMode='template' のとき実行/キャンセルボタンが表示されない", () => {
      render(
        <GenerateStep
          isGenerating={true}
          error={null}
          generationMode="template"
          generationProgress={null}
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(
        screen.queryByRole("button", { name: "実行する" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "キャンセル" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("生成中キャンセル（P2）", () => {
    it("LLMモードで生成中にキャンセルボタンが表示される", () => {
      render(
        <GenerateStep
          isGenerating={true}
          error={null}
          generationMode="llm"
          generationProgress="計画を生成中..."
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(
        screen.getByRole("button", { name: "キャンセル" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "実行する" }),
      ).not.toBeInTheDocument();
    });

    it("生成中キャンセルクリックで onCancelPlan が呼ばれる", () => {
      render(
        <GenerateStep
          isGenerating={true}
          error={null}
          generationMode="llm"
          generationProgress="計画を生成中..."
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(mockOnCancelPlan).toHaveBeenCalledTimes(1);
    });
  });

  describe("エラー時リカバリー（P1）", () => {
    it("LLMモードでエラー時に「最初からやり直す」ボタンが表示される", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={new Error("計画生成に失敗しました")}
          generationMode="llm"
          generationProgress={null}
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(
        screen.getByRole("button", { name: "最初からやり直す" }),
      ).toBeInTheDocument();
    });

    it("「最初からやり直す」クリックで onCancelPlan が呼ばれる", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={new Error("計画生成に失敗しました")}
          generationMode="llm"
          generationProgress={null}
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "最初からやり直す" }));
      expect(mockOnCancelPlan).toHaveBeenCalledTimes(1);
    });
  });

  describe("generationError 表示（AC-7）", () => {
    it("error が設定されているときエラーメッセージが表示される", () => {
      render(
        <GenerateStep
          isGenerating={false}
          error={new Error("planSkill 呼び出しに失敗しました")}
          generationMode="llm"
          generationProgress={null}
          planResult={null}
          onExecutePlan={mockOnExecutePlan}
          onCancelPlan={mockOnCancelPlan}
        />,
      );
      expect(
        screen.getByText("planSkill 呼び出しに失敗しました"),
      ).toBeInTheDocument();
    });
  });
});
