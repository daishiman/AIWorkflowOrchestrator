/**
 * @file useSkillAnalysis-gate.test.ts
 * @description useSkillAnalysis ゲート機能追加分 ユニットテスト（RED状態）
 * @phase Phase 4: テスト作成
 * @task TASK-SKILL-LIFECYCLE-04
 *
 * テスト対象の追加機能（未実装）:
 *   1. previousAnalysis フィールド（改善前スコアのスナップショット保持）
 *   2. スコア差分（Δ）計算: scoreDelta, scoreDirection
 *   3. evaluatePrompt() Preload API 呼び出し
 *
 * P9準拠: beforeEachで全モック状態をリセット
 * P39準拠: userEvent不使用（happy-dom環境）
 * P40準拠: apps/desktop から実行
 * P31準拠: 個別セレクタをモック
 */

import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

// ============================================
// モック変数（モジュールスコープ）
// ============================================

let mockCurrentAnalysis: SkillAnalysis | null = null;
let mockPreviousAnalysis: SkillAnalysis | null = null;
let mockIsAnalyzing = false;
let mockIsImproving = false;
let mockSkillError: string | null = null;
const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();

// P31準拠: 個別セレクタをモック（合成Hook不使用）
vi.mock("../../../store", () => ({
  useCurrentAnalysis: () => mockCurrentAnalysis,
  usePreviousAnalysis: () => mockPreviousAnalysis,
  useIsAnalyzingSkill: () => mockIsAnalyzing,
  useIsImprovingSkill: () => mockIsImproving,
  useSkillError: () => mockSkillError,
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => mockAutoImproveSkill,
  useClearSkillError: () => vi.fn(),
  useClearAnalysis: () => vi.fn(),
}));

// evaluatePrompt Preload API モック
const mockEvaluatePrompt = vi.fn();

// ============================================
// テストヘルパー
// ============================================

const createMockAnalysis = (
  overrides?: Partial<SkillAnalysis>,
): SkillAnalysis => ({
  skillName: "test-skill",
  overallScore: 75,
  categories: [],
  suggestions: [
    {
      type: "prompt",
      priority: "high",
      description: "提案1: 自動修正可能",
      autoFixable: true,
    },
    {
      type: "structure",
      priority: "medium",
      description: "提案2: 手動修正のみ",
      autoFixable: false,
    },
  ],
  risks: [],
  ...overrides,
});

// ============================================
// テストスイート 1: previousAnalysis 保持
// ============================================

describe("useSkillAnalysis - previousAnalysis 保持", () => {
  beforeEach(() => {
    // P9準拠: 全モック状態をリセット
    mockCurrentAnalysis = null;
    mockPreviousAnalysis = null;
    mockIsAnalyzing = false;
    mockIsImproving = false;
    mockSkillError = null;
    mockAnalyzeSkill.mockReset();
    mockApplySkillImprovements.mockReset();
    mockAutoImproveSkill.mockReset();
    mockEvaluatePrompt.mockReset();
    mockAnalyzeSkill.mockResolvedValue(undefined);
    mockApplySkillImprovements.mockImplementation(async () => {
      mockPreviousAnalysis = mockCurrentAnalysis;
    });
    mockAutoImproveSkill.mockResolvedValue(undefined);
    vi.restoreAllMocks();

    // window.electronAPI.skill.evaluatePrompt のモック設定
    Object.defineProperty(window, "electronAPI", {
      value: {
        skill: {
          evaluatePrompt: mockEvaluatePrompt,
        },
      },
      writable: true,
      configurable: true,
    });
  });

  // ------------------------------------------
  // TC-GATE-01: 改善適用前は previousAnalysis が null
  // ------------------------------------------
  it("TC-GATE-01: 改善適用前は previousAnalysis が null である", async () => {
    mockCurrentAnalysis = createMockAnalysis({ overallScore: 75 });
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // handleApplySelected を呼ぶ前は previousAnalysis が null
    expect(result.current.previousAnalysis).toBeNull();
  });

  // ------------------------------------------
  // TC-GATE-02: handleApplySelected 呼び出し後に previousAnalysis が保持される
  // ------------------------------------------
  it("TC-GATE-02: handleApplySelected 呼び出し後に previousAnalysis に適用前の analysis がセットされる", async () => {
    const beforeAnalysis = createMockAnalysis({ overallScore: 55 });
    mockCurrentAnalysis = beforeAnalysis;
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // 提案を選択
    act(() => {
      result.current.handleToggleSuggestion(0);
    });

    // 適用実行: この時点の analysis (overallScore=55) が previousAnalysis として保持される
    await act(async () => {
      await result.current.handleApplySelected();
    });

    // Store snapshot 相当を反映（モック環境）
    mockPreviousAnalysis = beforeAnalysis;
    hookResult!.rerender();

    expect(result.current.previousAnalysis).not.toBeNull();
    expect(result.current.previousAnalysis?.overallScore).toBe(55);
    expect(result.current.previousAnalysis?.skillName).toBe("test-skill");
  });
});

// ============================================
// テストスイート 2: スコア差分（Δ）計算
// ============================================

describe("useSkillAnalysis - スコア差分（Δ）計算", () => {
  beforeEach(() => {
    // P9準拠: 全モック状態をリセット
    mockCurrentAnalysis = null;
    mockPreviousAnalysis = null;
    mockIsAnalyzing = false;
    mockIsImproving = false;
    mockSkillError = null;
    mockAnalyzeSkill.mockReset();
    mockApplySkillImprovements.mockReset();
    mockAutoImproveSkill.mockReset();
    mockEvaluatePrompt.mockReset();
    mockAnalyzeSkill.mockResolvedValue(undefined);
    mockApplySkillImprovements.mockImplementation(async () => {
      mockPreviousAnalysis = mockCurrentAnalysis;
    });
    mockAutoImproveSkill.mockResolvedValue(undefined);
    vi.restoreAllMocks();

    Object.defineProperty(window, "electronAPI", {
      value: {
        skill: {
          evaluatePrompt: mockEvaluatePrompt,
        },
      },
      writable: true,
      configurable: true,
    });
  });

  // ------------------------------------------
  // TC-GATE-03: 大幅上昇（+25）→ direction="up"
  // ------------------------------------------
  it("TC-GATE-03: previousAnalysis.overallScore=55 → analysis.overallScore=80 のとき scoreDelta=+25, scoreDirection='up'", async () => {
    // 最初は overallScore=55 でフックをレンダリング
    const beforeAnalysis = createMockAnalysis({ overallScore: 55 });
    mockCurrentAnalysis = beforeAnalysis;
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // 提案を選択して適用（previousAnalysis = overallScore:55 が保存される）
    act(() => {
      result.current.handleToggleSuggestion(0);
    });
    await act(async () => {
      await result.current.handleApplySelected();
    });
    mockPreviousAnalysis = beforeAnalysis;

    // 改善後の analysis に overallScore=80 をセット
    mockCurrentAnalysis = createMockAnalysis({ overallScore: 80 });
    hookResult!.rerender();

    expect(result.current.scoreDelta).toBe(25);
    expect(result.current.scoreDirection).toBe("up");
  });

  // ------------------------------------------
  // TC-GATE-04: 微小変化（+1）→ direction="neutral"（±2以内）
  // ------------------------------------------
  it("TC-GATE-04: previousAnalysis.overallScore=80 → analysis.overallScore=81 のとき scoreDelta=+1, scoreDirection='neutral'", async () => {
    const beforeAnalysis = createMockAnalysis({ overallScore: 80 });
    mockCurrentAnalysis = beforeAnalysis;
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // 提案を選択して適用（previousAnalysis = overallScore:80 が保存される）
    act(() => {
      result.current.handleToggleSuggestion(0);
    });
    await act(async () => {
      await result.current.handleApplySelected();
    });
    mockPreviousAnalysis = beforeAnalysis;

    // 改善後の analysis に overallScore=81 をセット（差分=+1、±2以内なので neutral）
    mockCurrentAnalysis = createMockAnalysis({ overallScore: 81 });
    hookResult!.rerender();

    expect(result.current.scoreDelta).toBe(1);
    expect(result.current.scoreDirection).toBe("neutral");
  });

  // ------------------------------------------
  // TC-GATE-05: 大幅下降（-30）→ direction="down"
  // ------------------------------------------
  it("TC-GATE-05: previousAnalysis.overallScore=80 → analysis.overallScore=50 のとき scoreDelta=-30, scoreDirection='down'", async () => {
    const beforeAnalysis = createMockAnalysis({ overallScore: 80 });
    mockCurrentAnalysis = beforeAnalysis;
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // 提案を選択して適用（previousAnalysis = overallScore:80 が保存される）
    act(() => {
      result.current.handleToggleSuggestion(0);
    });
    await act(async () => {
      await result.current.handleApplySelected();
    });
    mockPreviousAnalysis = beforeAnalysis;

    // 改善後の analysis に overallScore=50 をセット（差分=-30）
    mockCurrentAnalysis = createMockAnalysis({ overallScore: 50 });
    hookResult!.rerender();

    expect(result.current.scoreDelta).toBe(-30);
    expect(result.current.scoreDirection).toBe("down");
  });
});

// ============================================
// テストスイート 3: evaluatePrompt Preload API
// ============================================

describe("useSkillAnalysis - evaluatePrompt Preload API", () => {
  beforeEach(() => {
    // P9準拠: 全モック状態をリセット
    mockCurrentAnalysis = null;
    mockPreviousAnalysis = null;
    mockIsAnalyzing = false;
    mockIsImproving = false;
    mockSkillError = null;
    mockAnalyzeSkill.mockReset();
    mockApplySkillImprovements.mockReset();
    mockAutoImproveSkill.mockReset();
    mockEvaluatePrompt.mockReset();
    mockAnalyzeSkill.mockResolvedValue(undefined);
    mockApplySkillImprovements.mockImplementation(async () => {
      mockPreviousAnalysis = mockCurrentAnalysis;
    });
    mockAutoImproveSkill.mockResolvedValue(undefined);
    mockEvaluatePrompt.mockResolvedValue({ score: 80, feedback: "良好" });
    vi.restoreAllMocks();

    Object.defineProperty(window, "electronAPI", {
      value: {
        skill: {
          evaluatePrompt: mockEvaluatePrompt,
        },
      },
      writable: true,
      configurable: true,
    });
  });

  // ------------------------------------------
  // TC-GATE-06: handleEvaluatePrompt で evaluatePrompt が呼ばれる
  // ------------------------------------------
  it("TC-GATE-06: handleEvaluatePrompt('valid prompt') で window.electronAPI.skill.evaluatePrompt が呼ばれる", async () => {
    mockCurrentAnalysis = createMockAnalysis();
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    await act(async () => {
      await result.current.handleEvaluatePrompt("valid prompt");
    });

    expect(mockEvaluatePrompt).toHaveBeenCalledWith("valid prompt");
    expect(mockEvaluatePrompt).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // TC-GATE-07: handleEvaluatePrompt に空文字列を渡した場合はエラーハンドリング
  // ------------------------------------------
  it("TC-GATE-07: handleEvaluatePrompt('') を渡した場合、evaluatePrompt は呼ばれずエラー状態になる", async () => {
    mockCurrentAnalysis = createMockAnalysis();
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    await act(async () => {
      await result.current.handleEvaluatePrompt("");
    });

    // 空文字列の場合は evaluatePrompt が呼ばれない
    expect(mockEvaluatePrompt).not.toHaveBeenCalled();

    // エラー状態またはフラグが設定される
    // （実装により evaluateError または isEvaluateError のいずれかを返す）
    const hasErrorState =
      result.current.evaluateError !== undefined ||
      result.current.isEvaluateError === true;
    expect(hasErrorState).toBe(true);
  });
});
