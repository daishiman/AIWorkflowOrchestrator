/**
 * @file ScoreDisplay.test.tsx
 * @description ScoreDisplay コンポーネント ユニットテスト
 * @phase Phase 4: テスト作成（TDD: Red → Green） + Phase 6: テスト拡充
 * @task TASK-UI-SCORE-DISPLAY
 *
 * P39準拠: fireEventのみ使用（happy-dom環境でuserEvent禁止）
 * P47準拠: scoreVariantStyles をimportして検証
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import {
  createMockAnalysis,
  createMockCategory,
  createHighScoreAnalysis,
  createLowScoreAnalysis,
} from "./helpers/test-data-factory";
import {
  ScoreDisplay,
  scoreVariantStyles,
  scoreBarStyles,
  getScoreVariant,
} from "../ScoreDisplay";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

// ============================================
// Test Suite
// ============================================

describe("ScoreDisplay", () => {
  let defaultAnalysis: SkillAnalysis;

  beforeEach(() => {
    defaultAnalysis = createMockAnalysis();
  });

  // ------------------------------------------
  // 1. 総合スコアを数値表示する
  // ------------------------------------------
  it("総合スコアを数値表示する", () => {
    render(<ScoreDisplay analysis={defaultAnalysis} />);

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("総合スコア")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 2. カテゴリ別スコアバーを表示する
  // ------------------------------------------
  it("カテゴリ別スコアバーを表示する", () => {
    render(<ScoreDisplay analysis={defaultAnalysis} />);

    expect(screen.getByText("カテゴリ別分析")).toBeInTheDocument();
    expect(screen.getByText("Code Quality")).toBeInTheDocument();
    expect(screen.getByText("Security")).toBeInTheDocument();
    expect(screen.getByText("Documentation")).toBeInTheDocument();

    // プログレスバーが3つ存在する
    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars).toHaveLength(3);
  });

  // ------------------------------------------
  // 3. 高スコア（80-100）に成功色を適用する
  // ------------------------------------------
  it("高スコア（80-100）に成功色を適用する", () => {
    const highScoreAnalysis = createHighScoreAnalysis();
    render(<ScoreDisplay analysis={highScoreAnalysis} />);

    // 総合スコア要素は text-4xl クラスで特定
    const scoreElements = screen.getAllByText("85");
    const overallScoreElement = scoreElements.find((el) =>
      el.className.includes("text-4xl"),
    );
    expect(overallScoreElement).toBeDefined();
    expect(overallScoreElement!.className).toContain(
      scoreVariantStyles.success,
    );
    expect(getScoreVariant(85)).toBe("success");
    expect(getScoreVariant(80)).toBe("success");
    expect(getScoreVariant(100)).toBe("success");
  });

  // ------------------------------------------
  // 4. 中スコア（60-79）に警告色を適用する
  // ------------------------------------------
  it("中スコア（60-79）に警告色を適用する", () => {
    const mediumAnalysis = createMockAnalysis({ overallScore: 72 });
    render(<ScoreDisplay analysis={mediumAnalysis} />);

    const overallScoreElement = screen.getByText("72");
    expect(overallScoreElement.className).toContain(scoreVariantStyles.warning);
    expect(getScoreVariant(60)).toBe("warning");
    expect(getScoreVariant(72)).toBe("warning");
    expect(getScoreVariant(79)).toBe("warning");
  });

  // ------------------------------------------
  // 5. 低スコア（0-59）にエラー色を適用する
  // ------------------------------------------
  it("低スコア（0-59）にエラー色を適用する", () => {
    const lowScoreAnalysis = createLowScoreAnalysis();
    render(<ScoreDisplay analysis={lowScoreAnalysis} />);

    // 総合スコア要素は text-4xl クラスで特定
    const scoreElements = screen.getAllByText("35");
    const overallScoreElement = scoreElements.find((el) =>
      el.className.includes("text-4xl"),
    );
    expect(overallScoreElement).toBeDefined();
    expect(overallScoreElement!.className).toContain(scoreVariantStyles.error);
    expect(getScoreVariant(0)).toBe("error");
    expect(getScoreVariant(35)).toBe("error");
    expect(getScoreVariant(59)).toBe("error");
  });

  // ------------------------------------------
  // 6. カテゴリの詳細テキストを表示する
  // ------------------------------------------
  it("カテゴリの詳細テキストを表示する", () => {
    const analysis = createMockAnalysis({
      categories: [
        createMockCategory({
          name: "Code Quality",
          score: 80,
          details: "コードの品質は良好です",
        }),
      ],
    });
    render(<ScoreDisplay analysis={analysis} />);

    expect(screen.getByText("コードの品質は良好です")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 7. カテゴリの課題リストを表示する
  // ------------------------------------------
  it("カテゴリの課題リストを表示する", () => {
    const analysis = createMockAnalysis({
      categories: [
        createMockCategory({
          name: "Security",
          score: 50,
          issues: ["SQLインジェクションの脆弱性", "入力値検証の不足"],
        }),
      ],
    });
    render(<ScoreDisplay analysis={analysis} />);

    expect(screen.getByText("SQLインジェクションの脆弱性")).toBeInTheDocument();
    expect(screen.getByText("入力値検証の不足")).toBeInTheDocument();
  });

  // ------------------------------------------
  // 8. ARIA属性が正しく設定される
  // ------------------------------------------
  it("ARIA属性が正しく設定される", () => {
    const analysis = createMockAnalysis({
      categories: [
        createMockCategory({ name: "Code Quality", score: 80 }),
        createMockCategory({ name: "Security", score: 60 }),
      ],
    });
    render(<ScoreDisplay analysis={analysis} />);

    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars).toHaveLength(2);

    // 各プログレスバーにaria属性が設定されている
    const firstBar = progressBars[0];
    expect(firstBar).toHaveAttribute("aria-valuenow", "80");
    expect(firstBar).toHaveAttribute("aria-valuemin", "0");
    expect(firstBar).toHaveAttribute("aria-valuemax", "100");

    const secondBar = progressBars[1];
    expect(secondBar).toHaveAttribute("aria-valuenow", "60");
    expect(secondBar).toHaveAttribute("aria-valuemin", "0");
    expect(secondBar).toHaveAttribute("aria-valuemax", "100");
  });

  // ============================================
  // Phase 6: 境界値テスト
  // ============================================

  // ------------------------------------------
  // 9. スコア0の場合にエラー色適用
  // ------------------------------------------
  it("スコア0の場合にエラー色適用", () => {
    const analysis = createMockAnalysis({
      overallScore: 0,
      categories: [],
    });
    render(<ScoreDisplay analysis={analysis} />);

    const scoreElement = screen.getByText("0");
    expect(scoreElement.className).toContain(scoreVariantStyles.error);
    expect(getScoreVariant(0)).toBe("error");
  });

  // ------------------------------------------
  // 10. スコア59の場合にエラー色適用
  // ------------------------------------------
  it("スコア59の場合にエラー色適用", () => {
    const analysis = createMockAnalysis({
      overallScore: 59,
      categories: [],
    });
    render(<ScoreDisplay analysis={analysis} />);

    const scoreElement = screen.getByText("59");
    expect(scoreElement.className).toContain(scoreVariantStyles.error);
    expect(getScoreVariant(59)).toBe("error");
  });

  // ------------------------------------------
  // 11. スコア60の場合に警告色適用
  // ------------------------------------------
  it("スコア60の場合に警告色適用", () => {
    const analysis = createMockAnalysis({
      overallScore: 60,
      categories: [],
    });
    render(<ScoreDisplay analysis={analysis} />);

    const scoreElement = screen.getByText("60");
    expect(scoreElement.className).toContain(scoreVariantStyles.warning);
    expect(getScoreVariant(60)).toBe("warning");
  });

  // ------------------------------------------
  // 12. スコア79の場合に警告色適用
  // ------------------------------------------
  it("スコア79の場合に警告色適用", () => {
    const analysis = createMockAnalysis({
      overallScore: 79,
      categories: [],
    });
    render(<ScoreDisplay analysis={analysis} />);

    const scoreElement = screen.getByText("79");
    expect(scoreElement.className).toContain(scoreVariantStyles.warning);
    expect(getScoreVariant(79)).toBe("warning");
  });

  // ------------------------------------------
  // 13. スコア80の場合に成功色適用
  // ------------------------------------------
  it("スコア80の場合に成功色適用", () => {
    const analysis = createMockAnalysis({
      overallScore: 80,
      categories: [],
    });
    render(<ScoreDisplay analysis={analysis} />);

    const scoreElement = screen.getByText("80");
    expect(scoreElement.className).toContain(scoreVariantStyles.success);
    expect(getScoreVariant(80)).toBe("success");
  });

  // ------------------------------------------
  // 14. スコア100の場合に成功色適用
  // ------------------------------------------
  it("スコア100の場合に成功色適用", () => {
    const analysis = createMockAnalysis({
      overallScore: 100,
      categories: [],
    });
    render(<ScoreDisplay analysis={analysis} />);

    const scoreElement = screen.getByText("100");
    expect(scoreElement.className).toContain(scoreVariantStyles.success);
    expect(getScoreVariant(100)).toBe("success");
  });

  // ============================================
  // Phase 6: a11y テスト
  // ============================================

  // ------------------------------------------
  // 15. ScoreDisplay にARIA progressbar属性がある
  // ------------------------------------------
  it("ScoreDisplay にARIA progressbar属性がある", () => {
    render(<ScoreDisplay analysis={defaultAnalysis} />);

    const progressBars = screen.getAllByRole("progressbar");
    expect(progressBars.length).toBeGreaterThan(0);

    for (const bar of progressBars) {
      expect(bar).toHaveAttribute("aria-valuenow");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");

      // aria-valuenow の値が 0-100 の範囲内であること
      const value = Number(bar.getAttribute("aria-valuenow"));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  // ============================================
  // Phase 6: スタイルテスト
  // ============================================

  // ------------------------------------------
  // 16. scoreVariantStyles が正しいCSS変数を含む
  // ------------------------------------------
  it("scoreVariantStyles が正しいCSS変数を含む", () => {
    expect(scoreVariantStyles.success).toContain("--status-success");
    expect(scoreVariantStyles.warning).toContain("--status-warning");
    expect(scoreVariantStyles.error).toContain("--status-error");

    // scoreBarStyles も3バリアント全て定義されている
    expect(scoreBarStyles.success).toContain("--status-success");
    expect(scoreBarStyles.warning).toContain("--status-warning");
    expect(scoreBarStyles.error).toContain("--status-error");
  });

  // ------------------------------------------
  // 17. getScoreVariant が境界値で正しいバリアントを返す
  // ------------------------------------------
  it("getScoreVariant が境界値で正しいバリアントを返す", () => {
    // エラー範囲 (0-59)
    expect(getScoreVariant(0)).toBe("error");
    expect(getScoreVariant(30)).toBe("error");
    expect(getScoreVariant(59)).toBe("error");

    // 警告範囲 (60-79)
    expect(getScoreVariant(60)).toBe("warning");
    expect(getScoreVariant(70)).toBe("warning");
    expect(getScoreVariant(79)).toBe("warning");

    // 成功範囲 (80-100)
    expect(getScoreVariant(80)).toBe("success");
    expect(getScoreVariant(90)).toBe("success");
    expect(getScoreVariant(100)).toBe("success");
  });
});
