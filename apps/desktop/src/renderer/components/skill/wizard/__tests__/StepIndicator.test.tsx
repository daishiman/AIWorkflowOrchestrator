/**
 * @file StepIndicator.test.tsx
 * @description StepIndicator コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red -> Green）
 * @task TASK-10A-C
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P47準拠: stepStateStyles をimportして検証
 * P9準拠: beforeEachで状態リセット
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator, stepStateStyles } from "../StepIndicator";

const STEPS = ["スキル情報", "設定", "生成", "完了"];

describe("StepIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ------------------------------------------
  // 1. 全ステップのラベルが表示される
  // ------------------------------------------
  it("全ステップのラベルが表示される", () => {
    render(<StepIndicator steps={STEPS} currentStep={0} />);

    STEPS.forEach((label, index) => {
      expect(
        screen.getByText(`ステップ ${index + 1}: ${label}`),
      ).toBeInTheDocument();
    });
  });

  // ------------------------------------------
  // 2. currentStep=0のとき最初のステップがアクティブ
  // ------------------------------------------
  it("currentStep=0のとき最初のステップがaria-current='step'を持つ", () => {
    render(<StepIndicator steps={STEPS} currentStep={0} />);

    const allSteps = screen
      .getByRole("navigation")
      .querySelectorAll("[aria-current]");
    expect(allSteps).toHaveLength(1);
    expect(allSteps[0]).toHaveAttribute("aria-current", "step");
    // 最初のステップが「1」を含むこと
    expect(allSteps[0]).toHaveTextContent("1");
  });

  // ------------------------------------------
  // 3. currentStep=2のとき3番目がアクティブ
  // ------------------------------------------
  it("currentStep=2のとき3番目がアクティブ", () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />);

    const activeStep = screen
      .getByRole("navigation")
      .querySelector('[aria-current="step"]');
    expect(activeStep).toBeInTheDocument();
    expect(activeStep).toHaveTextContent("3");
  });

  // ------------------------------------------
  // 4. 完了ステップにcompleted状態付与（P47準拠）
  // ------------------------------------------
  it("完了ステップにcompleted状態のスタイルが付与される", () => {
    render(<StepIndicator steps={STEPS} currentStep={2} />);

    const nav = screen.getByRole("navigation");
    const stepDivs = nav.querySelectorAll("[data-state]");

    // ステップ1, 2 (index 0, 1) は completed
    expect(stepDivs[0]).toHaveAttribute("data-state", "completed");
    expect(stepDivs[1]).toHaveAttribute("data-state", "completed");

    // P47準拠: Record定数のスタイルが含まれる
    const completedClasses = stepStateStyles.completed;
    completedClasses.split(" ").forEach((cls) => {
      expect(stepDivs[0].className).toContain(cls);
    });
  });

  // ------------------------------------------
  // 5. 未到達ステップにpending状態付与
  // ------------------------------------------
  it("未到達ステップにpending状態のスタイルが付与される", () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />);

    const nav = screen.getByRole("navigation");
    const stepDivs = nav.querySelectorAll("[data-state]");

    // ステップ3, 4 (index 2, 3) は pending
    expect(stepDivs[2]).toHaveAttribute("data-state", "pending");
    expect(stepDivs[3]).toHaveAttribute("data-state", "pending");

    // P47準拠: Record定数のスタイルが含まれる
    const pendingClasses = stepStateStyles.pending;
    pendingClasses.split(" ").forEach((cls) => {
      expect(stepDivs[2].className).toContain(cls);
    });
  });

  // ------------------------------------------
  // 6. aria-labelが付与される
  // ------------------------------------------
  it("navにaria-labelが付与される", () => {
    render(<StepIndicator steps={STEPS} currentStep={0} />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "ウィザードの進捗");
  });

  // ------------------------------------------
  // 7. 各ステップにステップ番号含む
  // ------------------------------------------
  it("各ステップにステップ番号が含まれる", () => {
    render(<StepIndicator steps={STEPS} currentStep={0} />);

    const nav = screen.getByRole("navigation");
    const stepDivs = nav.querySelectorAll("[data-state]");

    STEPS.forEach((_, index) => {
      expect(stepDivs[index]).toHaveTextContent(String(index + 1));
    });
  });

  // ------------------------------------------
  // 8. activeステップにactiveスタイルが付与される（P47準拠）
  // ------------------------------------------
  it("activeステップにactiveスタイルが付与される", () => {
    render(<StepIndicator steps={STEPS} currentStep={1} />);

    const nav = screen.getByRole("navigation");
    const stepDivs = nav.querySelectorAll("[data-state]");

    expect(stepDivs[1]).toHaveAttribute("data-state", "active");

    const activeClasses = stepStateStyles.active;
    activeClasses.split(" ").forEach((cls) => {
      expect(stepDivs[1].className).toContain(cls);
    });
  });

  // ==========================================================
  // Phase 6: 境界値テスト
  // ==========================================================
  describe("StepIndicator - 境界値テスト", () => {
    it("currentStep=3（最後のステップ）が正しくアクティブになる", () => {
      render(<StepIndicator steps={STEPS} currentStep={3} />);
      const nav = screen.getByRole("navigation");
      const activeStep = nav.querySelector('[aria-current="step"]');
      expect(activeStep).toBeInTheDocument();
      expect(activeStep).toHaveTextContent("4");
      expect(activeStep).toHaveAttribute("data-state", "active");
    });

    it("currentStep=3 のとき0〜2が completed になる", () => {
      render(<StepIndicator steps={STEPS} currentStep={3} />);
      const nav = screen.getByRole("navigation");
      const stepDivs = nav.querySelectorAll("[data-state]");
      expect(stepDivs[0]).toHaveAttribute("data-state", "completed");
      expect(stepDivs[1]).toHaveAttribute("data-state", "completed");
      expect(stepDivs[2]).toHaveAttribute("data-state", "completed");
      expect(stepDivs[3]).toHaveAttribute("data-state", "active");
    });

    it("currentStep=0 のとき1〜3が pending になる", () => {
      render(<StepIndicator steps={STEPS} currentStep={0} />);
      const nav = screen.getByRole("navigation");
      const stepDivs = nav.querySelectorAll("[data-state]");
      expect(stepDivs[0]).toHaveAttribute("data-state", "active");
      expect(stepDivs[1]).toHaveAttribute("data-state", "pending");
      expect(stepDivs[2]).toHaveAttribute("data-state", "pending");
      expect(stepDivs[3]).toHaveAttribute("data-state", "pending");
    });
  });
});
