/**
 * @file scoring-gate.test.ts
 * @description スコアリングゲート関数 ユニットテスト（TDD: RED状態）
 * @phase Phase 4: テスト作成
 * @task TASK-SKILL-LIFECYCLE-04
 *
 * P9準拠: 純粋関数のためbeforeEachリセット不要
 * テスト対象関数はまだ実装されていない（RED状態）
 */

import { describe, it, expect } from "vitest";
import {
  normalizeScore,
  getScoreGate,
  getScoreGateResult,
  calculateScoreFromBreakdown,
  calculateScoreDelta,
} from "@repo/shared/types/skill-improver";

// ============================================
// Section 1: normalizeScore
// ============================================

describe("normalizeScore", () => {
  // UT-NORM-01: 正常値は四捨五入してそのまま返す
  it("正常値を四捨五入して返す", () => {
    expect(normalizeScore(75.6)).toBe(76);
  });

  // UT-NORM-02: 下限clamp（負の値は0にクランプ）
  it("負の値は0にクランプする", () => {
    expect(normalizeScore(-10)).toBe(0);
  });

  // UT-NORM-03: 上限clamp（100超は100にクランプ）
  it("100を超える値は100にクランプする", () => {
    expect(normalizeScore(105)).toBe(100);
  });

  // UT-NORM-04: 異常値（NaN）は0を返す
  it("NaNは0を返す", () => {
    expect(normalizeScore(NaN)).toBe(0);
  });
});

// ============================================
// Section 2: getScoreGate 境界値テスト
// ============================================

describe("getScoreGate", () => {
  // UT-GATE-01a: スコア0 → NEEDS_IMPROVEMENT
  it("スコア0はNEEDS_IMPROVEMENTを返す", () => {
    expect(getScoreGate(0)).toBe("NEEDS_IMPROVEMENT");
  });

  // UT-GATE-01b: スコア59 → NEEDS_IMPROVEMENT（SAVE_ALLOWED境界未満）
  it("スコア59はNEEDS_IMPROVEMENTを返す", () => {
    expect(getScoreGate(59)).toBe("NEEDS_IMPROVEMENT");
  });

  // UT-GATE-02a: スコア60 → SAVE_ALLOWED（境界値）
  it("スコア60はSAVE_ALLOWEDを返す", () => {
    expect(getScoreGate(60)).toBe("SAVE_ALLOWED");
  });

  // UT-GATE-02b: スコア79 → SAVE_ALLOWED（USE_ALLOWED境界未満）
  it("スコア79はSAVE_ALLOWEDを返す", () => {
    expect(getScoreGate(79)).toBe("SAVE_ALLOWED");
  });

  // UT-GATE-03a: スコア80 → USE_ALLOWED（境界値）
  it("スコア80はUSE_ALLOWEDを返す", () => {
    expect(getScoreGate(80)).toBe("USE_ALLOWED");
  });

  // UT-GATE-03b: スコア99 → USE_ALLOWED（RECOMMENDED境界未満）
  it("スコア99はUSE_ALLOWEDを返す", () => {
    expect(getScoreGate(99)).toBe("USE_ALLOWED");
  });

  // UT-GATE-04: スコア100 → RECOMMENDED（最高値）
  it("スコア100はRECOMMENDEDを返す", () => {
    expect(getScoreGate(100)).toBe("RECOMMENDED");
  });

  // UT-GATE-ERR1: スコア-1 → NEEDS_IMPROVEMENT（下限clamp）
  it("スコア-1はNEEDS_IMPROVEMENTを返す（下限clamp）", () => {
    expect(getScoreGate(-1)).toBe("NEEDS_IMPROVEMENT");
  });

  // UT-GATE-ERR2: スコア101 → RECOMMENDED（上限clamp）
  it("スコア101はRECOMMENDEDを返す（上限clamp）", () => {
    expect(getScoreGate(101)).toBe("RECOMMENDED");
  });

  // UT-GATE-ERR3: NaN → NEEDS_IMPROVEMENT
  it("NaNはNEEDS_IMPROVEMENTを返す", () => {
    expect(getScoreGate(NaN)).toBe("NEEDS_IMPROVEMENT");
  });
});

// ============================================
// Section 3: getScoreGateResult フラグテスト
// ============================================

describe("getScoreGateResult", () => {
  // UT-FLAG-01: NEEDS_IMPROVEMENT → 全フラグfalse
  it("NEEDS_IMPROVEMENTスコアはcanSave=false, canUse=false, isRecommended=falseを返す", () => {
    const result = getScoreGateResult(0);
    expect(result.canSave).toBe(false);
    expect(result.canUse).toBe(false);
    expect(result.isRecommended).toBe(false);
  });

  // UT-FLAG-02: SAVE_ALLOWED → canSave=true, canUse=false, isRecommended=false
  it("SAVE_ALLOWEDスコアはcanSave=true, canUse=false, isRecommended=falseを返す", () => {
    const result = getScoreGateResult(60);
    expect(result.canSave).toBe(true);
    expect(result.canUse).toBe(false);
    expect(result.isRecommended).toBe(false);
  });

  // UT-FLAG-03: USE_ALLOWED → canSave=true, canUse=true, isRecommended=false
  it("USE_ALLOWEDスコアはcanSave=true, canUse=true, isRecommended=falseを返す", () => {
    const result = getScoreGateResult(80);
    expect(result.canSave).toBe(true);
    expect(result.canUse).toBe(true);
    expect(result.isRecommended).toBe(false);
  });

  // UT-FLAG-04: RECOMMENDED → 全フラグtrue
  it("RECOMMENDEDスコアはcanSave=true, canUse=true, isRecommended=trueを返す", () => {
    const result = getScoreGateResult(100);
    expect(result.canSave).toBe(true);
    expect(result.canUse).toBe(true);
    expect(result.isRecommended).toBe(true);
  });
});

// ============================================
// Section 4: calculateScoreFromBreakdown
// ============================================

describe("calculateScoreFromBreakdown", () => {
  // UT-CALC-01: 全項目80 → 80（均等平均）
  it("全項目80のbreakdownは80を返す", () => {
    const breakdown = {
      clarity: 80,
      specificity: 80,
      completeness: 80,
      reproducibility: 80,
      security: 80,
    };
    expect(calculateScoreFromBreakdown(breakdown)).toBe(80);
  });

  // UT-CALC-02: 全項目0 → 0（最低値）
  it("全項目0のbreakdownは0を返す", () => {
    const breakdown = {
      clarity: 0,
      specificity: 0,
      completeness: 0,
      reproducibility: 0,
      security: 0,
    };
    expect(calculateScoreFromBreakdown(breakdown)).toBe(0);
  });

  // UT-CALC-03: 全項目100 → 100（最高値）
  it("全項目100のbreakdownは100を返す", () => {
    const breakdown = {
      clarity: 100,
      specificity: 100,
      completeness: 100,
      reproducibility: 100,
      security: 100,
    };
    expect(calculateScoreFromBreakdown(breakdown)).toBe(100);
  });

  // UT-CALC-04: 混合値 → 40（(80+60+40+20+0)/5 = 40）
  it("混合値のbreakdownは均等平均を返す", () => {
    const breakdown = {
      clarity: 80,
      specificity: 60,
      completeness: 40,
      reproducibility: 20,
      security: 0,
    };
    expect(calculateScoreFromBreakdown(breakdown)).toBe(40);
  });
});

// ============================================
// Section 5: calculateScoreDelta (Phase 6 追加境界値テスト)
// ============================================

describe("calculateScoreDelta (@repo/shared)", () => {
  // UT-DELTA-01: 大幅上昇（差分 >= 3）→ direction="up"
  it("差分+25は direction='up' を返す", () => {
    const result = calculateScoreDelta(60, 85);
    expect(result.previousScore).toBe(60);
    expect(result.newScore).toBe(85);
    expect(result.delta).toBe(25);
    expect(result.direction).toBe("up");
  });

  // UT-DELTA-02: 微小上昇（差分 <= 2）→ direction="neutral"
  it("差分+2は direction='neutral' を返す", () => {
    const result = calculateScoreDelta(80, 82);
    expect(result.delta).toBe(2);
    expect(result.direction).toBe("neutral");
  });

  // UT-DELTA-03: 差分0 → direction="neutral"
  it("差分0は direction='neutral' を返す", () => {
    const result = calculateScoreDelta(75, 75);
    expect(result.delta).toBe(0);
    expect(result.direction).toBe("neutral");
  });

  // UT-DELTA-04: 微小下降（差分 >= -2）→ direction="neutral"
  it("差分-2は direction='neutral' を返す", () => {
    const result = calculateScoreDelta(80, 78);
    expect(result.delta).toBe(-2);
    expect(result.direction).toBe("neutral");
  });

  // UT-DELTA-05: 大幅下降（差分 <= -3）→ direction="down"
  it("差分-30は direction='down' を返す", () => {
    const result = calculateScoreDelta(80, 50);
    expect(result.previousScore).toBe(80);
    expect(result.newScore).toBe(50);
    expect(result.delta).toBe(-30);
    expect(result.direction).toBe("down");
  });

  // UT-DELTA-06: 差分 = 3（neutral/up 境界値）→ direction="up"
  it("差分+3は direction='up' を返す（境界値）", () => {
    const result = calculateScoreDelta(77, 80);
    expect(result.delta).toBe(3);
    expect(result.direction).toBe("up");
  });

  // UT-DELTA-07: 差分 = -3（neutral/down 境界値）→ direction="down"
  it("差分-3は direction='down' を返す（境界値）", () => {
    const result = calculateScoreDelta(80, 77);
    expect(result.delta).toBe(-3);
    expect(result.direction).toBe("down");
  });

  // UT-DELTA-08: スコアが 0-100 の範囲外の場合はクランプされる
  it("スコア105を渡すと100にクランプされる", () => {
    const result = calculateScoreDelta(0, 105);
    expect(result.newScore).toBe(100);
    expect(result.delta).toBe(100);
    expect(result.direction).toBe("up");
  });
});
