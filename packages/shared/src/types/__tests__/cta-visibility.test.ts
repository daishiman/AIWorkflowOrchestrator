/**
 * @file cta-visibility.test.ts
 * @description ScoringGate x CTA 制御マトリクス 16パターン テスト
 * @task TASK-SKILL-LIFECYCLE-05
 * @phase Phase 4: テスト作成（TDD RED → GREEN）
 *
 * Phase 1 usage-scenario-table.md 2.2 CTA マトリクス準拠:
 *
 * | ScoringGate       | 今すぐ使う          | 保存して後で使う | 改善してから使う | 改善を推奨 |
 * | NEEDS_IMPROVEMENT | disabled            | disabled         | primary          | hidden     |
 * | SAVE_ALLOWED      | disabled            | primary          | secondary        | visible    |
 * | USE_ALLOWED       | primary             | secondary        | hidden           | hidden     |
 * | RECOMMENDED       | primary (highlight) | secondary        | hidden           | hidden     |
 *
 * P9準拠: 純粋関数のため beforeEach リセット不要
 */

import { describe, it, expect } from "vitest";
import { getCTAVisibility, getCTAVisibilityFromScore } from "../cta-visibility";
import { getScoreGateResult } from "../skill-improver";

// ============================================
// Section 1: NEEDS_IMPROVEMENT (0-59) x 4 CTA
// ============================================

describe("getCTAVisibility: NEEDS_IMPROVEMENT", () => {
  const gateResult = getScoreGateResult(45);

  // TC-MATRIX-01: NEEDS_IMPROVEMENT x 今すぐ使う → disabled
  it("今すぐ使う は disabled", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.useNow).toBe("disabled");
  });

  // TC-MATRIX-02: NEEDS_IMPROVEMENT x 保存して後で使う → disabled
  it("保存して後で使う は disabled", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.saveLater).toBe("disabled");
  });

  // TC-MATRIX-03: NEEDS_IMPROVEMENT x 改善してから使う → primary
  it("改善してから使う は primary", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.improveFirst).toBe("primary");
  });

  // TC-MATRIX-04: NEEDS_IMPROVEMENT x 改善を推奨 → hidden
  it("改善を推奨 は hidden", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.improveRecommended).toBe("hidden");
  });

  it("ハイライトは false", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.isHighlighted).toBe(false);
  });
});

// ============================================
// Section 2: SAVE_ALLOWED (60-79) x 4 CTA
// ============================================

describe("getCTAVisibility: SAVE_ALLOWED", () => {
  const gateResult = getScoreGateResult(70);

  // TC-MATRIX-05: SAVE_ALLOWED x 今すぐ使う → disabled
  it("今すぐ使う は disabled", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.useNow).toBe("disabled");
  });

  // TC-MATRIX-06: SAVE_ALLOWED x 保存して後で使う → primary
  it("保存して後で使う は primary", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.saveLater).toBe("primary");
  });

  // TC-MATRIX-07: SAVE_ALLOWED x 改善してから使う → secondary
  it("改善してから使う は secondary", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.improveFirst).toBe("secondary");
  });

  // TC-MATRIX-08: SAVE_ALLOWED x 改善を推奨 → visible (secondary)
  it("改善を推奨 は secondary（visible）", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.improveRecommended).toBe("secondary");
  });

  it("ハイライトは false", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.isHighlighted).toBe(false);
  });
});

// ============================================
// Section 3: USE_ALLOWED (80-99) x 4 CTA
// ============================================

describe("getCTAVisibility: USE_ALLOWED", () => {
  const gateResult = getScoreGateResult(90);

  // TC-MATRIX-09: USE_ALLOWED x 今すぐ使う → primary
  it("今すぐ使う は primary", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.useNow).toBe("primary");
  });

  // TC-MATRIX-10: USE_ALLOWED x 保存して後で使う → secondary
  it("保存して後で使う は secondary", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.saveLater).toBe("secondary");
  });

  // TC-MATRIX-11: USE_ALLOWED x 改善してから使う → hidden
  it("改善してから使う は hidden", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.improveFirst).toBe("hidden");
  });

  // TC-MATRIX-12: USE_ALLOWED x 改善を推奨 → hidden
  it("改善を推奨 は hidden", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.improveRecommended).toBe("hidden");
  });

  it("ハイライトは false", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.isHighlighted).toBe(false);
  });
});

// ============================================
// Section 4: RECOMMENDED (100) x 4 CTA
// ============================================

describe("getCTAVisibility: RECOMMENDED", () => {
  const gateResult = getScoreGateResult(100);

  // TC-MATRIX-13: RECOMMENDED x 今すぐ使う → primary (highlighted)
  it("今すぐ使う は primary", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.useNow).toBe("primary");
  });

  // TC-MATRIX-14: RECOMMENDED x 保存して後で使う → secondary
  it("保存して後で使う は secondary", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.saveLater).toBe("secondary");
  });

  // TC-MATRIX-15: RECOMMENDED x 改善してから使う → hidden
  it("改善してから使う は hidden", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.improveFirst).toBe("hidden");
  });

  // TC-MATRIX-16: RECOMMENDED x 改善を推奨 → hidden
  it("改善を推奨 は hidden", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.improveRecommended).toBe("hidden");
  });

  it("ハイライトは true（推奨バッジ表示）", () => {
    const result = getCTAVisibility(gateResult);
    expect(result.isHighlighted).toBe(true);
  });
});

// ============================================
// Section 5: 境界値テスト
// ============================================

describe("getCTAVisibility: 境界値", () => {
  it("スコア 0 は NEEDS_IMPROVEMENT として制御される", () => {
    const result = getCTAVisibilityFromScore(0);
    expect(result.useNow).toBe("disabled");
    expect(result.improveFirst).toBe("primary");
  });

  it("スコア 59 は NEEDS_IMPROVEMENT として制御される", () => {
    const result = getCTAVisibilityFromScore(59);
    expect(result.useNow).toBe("disabled");
    expect(result.saveLater).toBe("disabled");
  });

  it("スコア 60 は SAVE_ALLOWED として制御される", () => {
    const result = getCTAVisibilityFromScore(60);
    expect(result.useNow).toBe("disabled");
    expect(result.saveLater).toBe("primary");
  });

  it("スコア 79 は SAVE_ALLOWED として制御される", () => {
    const result = getCTAVisibilityFromScore(79);
    expect(result.saveLater).toBe("primary");
    expect(result.improveRecommended).toBe("secondary");
  });

  it("スコア 80 は USE_ALLOWED として制御される", () => {
    const result = getCTAVisibilityFromScore(80);
    expect(result.useNow).toBe("primary");
    expect(result.improveFirst).toBe("hidden");
  });

  it("スコア 99 は USE_ALLOWED として制御される", () => {
    const result = getCTAVisibilityFromScore(99);
    expect(result.useNow).toBe("primary");
    expect(result.isHighlighted).toBe(false);
  });

  it("スコア 100 は RECOMMENDED として制御される", () => {
    const result = getCTAVisibilityFromScore(100);
    expect(result.useNow).toBe("primary");
    expect(result.isHighlighted).toBe(true);
  });
});

// ============================================
// Section 6: 異常値テスト
// ============================================

describe("getCTAVisibility: 異常値", () => {
  it("負のスコアは NEEDS_IMPROVEMENT として処理される", () => {
    const result = getCTAVisibilityFromScore(-10);
    expect(result.useNow).toBe("disabled");
    expect(result.improveFirst).toBe("primary");
  });

  it("100超のスコアは RECOMMENDED として処理される", () => {
    const result = getCTAVisibilityFromScore(150);
    expect(result.useNow).toBe("primary");
    expect(result.isHighlighted).toBe(true);
  });

  it("NaN は NEEDS_IMPROVEMENT として処理される", () => {
    const result = getCTAVisibilityFromScore(NaN);
    expect(result.useNow).toBe("disabled");
    expect(result.improveFirst).toBe("primary");
  });
});
