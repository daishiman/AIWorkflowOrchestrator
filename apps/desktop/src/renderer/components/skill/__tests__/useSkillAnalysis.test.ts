/**
 * @file useSkillAnalysis.test.ts
 * @description useSkillAnalysis カスタムフック ユニットテスト
 * @phase Phase 4: テスト作成
 * @task TASK-10A-F
 *
 * P9準拠: beforeEachで全モック状態をリセット
 * P39準拠: userEvent不使用（happy-dom環境）
 * P40準拠: apps/desktop から実行
 */

import { vi, describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

// ============================================
// モック変数（モジュールスコープ）
// ============================================

let mockCurrentAnalysis: SkillAnalysis | null = null;
let mockIsAnalyzing = false;
let mockIsImproving = false;
let mockSkillError: string | null = null;
const mockAnalyzeSkill = vi.fn();
const mockApplySkillImprovements = vi.fn();
const mockAutoImproveSkill = vi.fn();
const mockEvaluatePostImprove = vi.fn();
let mockLatestPromptRequest: string | null = "改善して";

vi.mock("../../../store", () => ({
  useAppStore: {
    getState: () => ({
      currentAnalysis: mockCurrentAnalysis,
    }),
  },
  useCurrentAnalysis: () => mockCurrentAnalysis,
  useIsAnalyzingSkill: () => mockIsAnalyzing,
  useIsImprovingSkill: () => mockIsImproving,
  useSkillError: () => mockSkillError,
  useAnalyzeSkill: () => mockAnalyzeSkill,
  useApplySkillImprovements: () => mockApplySkillImprovements,
  useAutoImproveSkill: () => mockAutoImproveSkill,
  useEvaluatePostImprove: () => mockEvaluatePostImprove,
  useLatestPromptRequest: () => mockLatestPromptRequest,
  useClearSkillError: () => vi.fn(),
  useClearAnalysis: () => vi.fn(),
}));

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
    {
      type: "security",
      priority: "low",
      description: "提案3: 自動修正可能",
      autoFixable: true,
    },
  ],
  risks: [],
  ...overrides,
});

// ============================================
// テスト
// ============================================

describe("useSkillAnalysis", () => {
  beforeEach(() => {
    // P9準拠: 全モック状態をリセット
    mockCurrentAnalysis = null;
    mockIsAnalyzing = false;
    mockIsImproving = false;
    mockSkillError = null;
    mockAnalyzeSkill.mockReset();
    mockApplySkillImprovements.mockReset();
    mockAutoImproveSkill.mockReset();
    mockEvaluatePostImprove.mockReset();
    mockLatestPromptRequest = "改善して";
    mockAnalyzeSkill.mockResolvedValue(undefined);
    mockApplySkillImprovements.mockResolvedValue(undefined);
    mockAutoImproveSkill.mockResolvedValue(undefined);
    mockEvaluatePostImprove.mockResolvedValue(undefined);
    vi.restoreAllMocks();
  });

  // ------------------------------------------
  // TC-UA-01: 初期化時に analyzeSkill が呼ばれる
  // ------------------------------------------
  it("TC-UA-01: renderHook で初期化時に analyzeSkill が呼ばれる", async () => {
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    await act(async () => {
      renderHook(() => useSkillAnalysis("test-skill"));
    });

    expect(mockAnalyzeSkill).toHaveBeenCalledWith("test-skill");
    expect(mockAnalyzeSkill).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // TC-UA-02: handleToggleSuggestion で選択/選択解除がトグルする
  // ------------------------------------------
  it("TC-UA-02: handleToggleSuggestion で選択/選択解除がトグルする", async () => {
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // 初期状態: 空のSet
    expect(result.current.selectedSuggestions.size).toBe(0);

    // 選択: インデックス1を追加
    act(() => {
      result.current.handleToggleSuggestion(1);
    });
    expect(result.current.selectedSuggestions.has(1)).toBe(true);
    expect(result.current.selectedSuggestions.size).toBe(1);

    // 再度トグル: インデックス1を解除
    act(() => {
      result.current.handleToggleSuggestion(1);
    });
    expect(result.current.selectedSuggestions.has(1)).toBe(false);
    expect(result.current.selectedSuggestions.size).toBe(0);
  });

  // ------------------------------------------
  // TC-UA-03: handleSelectAutoFixable で autoFixable=true の提案のみ選択される
  // ------------------------------------------
  it("TC-UA-03: handleSelectAutoFixable で autoFixable=true の提案のみ選択される", async () => {
    mockCurrentAnalysis = createMockAnalysis();
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    act(() => {
      result.current.handleSelectAutoFixable();
    });

    // suggestions[0] (autoFixable=true) と suggestions[2] (autoFixable=true) のみ選択
    expect(result.current.selectedSuggestions.has(0)).toBe(true);
    expect(result.current.selectedSuggestions.has(1)).toBe(false);
    expect(result.current.selectedSuggestions.has(2)).toBe(true);
    expect(result.current.selectedSuggestions.size).toBe(2);
  });

  // ------------------------------------------
  // TC-UA-04: handleApplySelected で選択済み提案が applySkillImprovements に渡される
  // ------------------------------------------
  it("TC-UA-04: handleApplySelected で選択済み提案が applySkillImprovements に渡される", async () => {
    const analysis = createMockAnalysis();
    mockCurrentAnalysis = analysis;
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // インデックス0と2を選択
    act(() => {
      result.current.handleToggleSuggestion(0);
    });
    act(() => {
      result.current.handleToggleSuggestion(2);
    });

    // 適用実行
    await act(async () => {
      await result.current.handleApplySelected();
    });

    expect(mockApplySkillImprovements).toHaveBeenCalledWith("test-skill", [
      analysis.suggestions[0],
      analysis.suggestions[2],
    ]);
    expect(mockApplySkillImprovements).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // TC-UA-05: handleAutoImprove で window.confirm(true) のとき autoImproveSkill が呼ばれる
  // ------------------------------------------
  it("TC-UA-05: handleAutoImprove で window.confirm(true) のとき autoImproveSkill が呼ばれる", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    await act(async () => {
      await result.current.handleAutoImprove();
    });

    expect(window.confirm).toHaveBeenCalledWith("全自動改善を実行しますか？");
    expect(mockAutoImproveSkill).toHaveBeenCalledWith("test-skill");
    expect(mockAutoImproveSkill).toHaveBeenCalledTimes(1);
  });

  // ------------------------------------------
  // TC-UA-06: handleAutoImprove で window.confirm(false) のとき autoImproveSkill が呼ばれない
  // ------------------------------------------
  it("TC-UA-06: handleAutoImprove で window.confirm(false) のとき autoImproveSkill が呼ばれない", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    await act(async () => {
      await result.current.handleAutoImprove();
    });

    expect(window.confirm).toHaveBeenCalledWith("全自動改善を実行しますか？");
    expect(mockAutoImproveSkill).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // TC-UA-07: handleApplySelected で selectedSuggestions.size === 0 のとき早期リターンする
  // ------------------------------------------
  it("TC-UA-07: handleApplySelected で selectedSuggestions.size === 0 のとき早期リターンする", async () => {
    mockCurrentAnalysis = createMockAnalysis();
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // 何も選択せずに適用
    await act(async () => {
      await result.current.handleApplySelected();
    });

    expect(mockApplySkillImprovements).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // TC-UA-08: handleApplySelected で analysis === null のとき早期リターンする
  // ------------------------------------------
  it("TC-UA-08: handleApplySelected で analysis === null のとき早期リターンする", async () => {
    mockCurrentAnalysis = null;
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(() => useSkillAnalysis("test-skill"));
    });
    const { result } = hookResult!;

    // 選択はあるがanalysisがnull（手動でselectedSuggestionsを設定するため、toggleで追加）
    act(() => {
      result.current.handleToggleSuggestion(0);
    });

    await act(async () => {
      await result.current.handleApplySelected();
    });

    expect(mockApplySkillImprovements).not.toHaveBeenCalled();
  });
});

// ============================================
// buildAutoFixableSelection 純粋関数テスト
// ============================================

describe("buildAutoFixableSelection", () => {
  // ------------------------------------------
  // TC-UA-09: autoFixable=true のインデックスのみ含む Set を返す
  // ------------------------------------------
  it("TC-UA-09: autoFixable=true のインデックスのみ含む Set を返す", async () => {
    const { buildAutoFixableSelection } =
      await import("../hooks/useSkillAnalysis");

    const suggestions = [
      {
        type: "prompt" as const,
        priority: "high" as const,
        description: "修正可能1",
        autoFixable: true,
      },
      {
        type: "structure" as const,
        priority: "medium" as const,
        description: "手動のみ",
        autoFixable: false,
      },
      {
        type: "security" as const,
        priority: "low" as const,
        description: "修正可能2",
        autoFixable: true,
      },
      {
        type: "performance" as const,
        priority: "high" as const,
        description: "手動のみ2",
        autoFixable: false,
      },
    ];

    const result = buildAutoFixableSelection(suggestions);

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(2);
    expect(result.has(0)).toBe(true);
    expect(result.has(1)).toBe(false);
    expect(result.has(2)).toBe(true);
    expect(result.has(3)).toBe(false);
  });

  it("全て autoFixable=false の場合、空の Set を返す", async () => {
    const { buildAutoFixableSelection } =
      await import("../hooks/useSkillAnalysis");

    const suggestions = [
      {
        type: "prompt" as const,
        priority: "high" as const,
        description: "手動のみ",
        autoFixable: false,
      },
    ];

    const result = buildAutoFixableSelection(suggestions);

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });

  it("空配列の場合、空の Set を返す", async () => {
    const { buildAutoFixableSelection } =
      await import("../hooks/useSkillAnalysis");

    const result = buildAutoFixableSelection([]);

    expect(result).toBeInstanceOf(Set);
    expect(result.size).toBe(0);
  });
});

// ============================================
// skillName 変更時の再実行テスト
// ============================================

describe("useSkillAnalysis skillName変更", () => {
  beforeEach(() => {
    mockCurrentAnalysis = null;
    mockIsAnalyzing = false;
    mockIsImproving = false;
    mockSkillError = null;
    mockAnalyzeSkill.mockReset();
    mockApplySkillImprovements.mockReset();
    mockAutoImproveSkill.mockReset();
    mockAnalyzeSkill.mockResolvedValue(undefined);
    mockApplySkillImprovements.mockResolvedValue(undefined);
    mockAutoImproveSkill.mockResolvedValue(undefined);
    vi.restoreAllMocks();
  });

  // ------------------------------------------
  // TC-UA-S01: skillName が変更された場合に handleAnalyze が再実行される
  // ------------------------------------------
  it("TC-UA-S01: skillName が変更された場合に handleAnalyze が再実行される", async () => {
    const { useSkillAnalysis } = await import("../hooks/useSkillAnalysis");

    let hookResult: ReturnType<typeof renderHook>;
    await act(async () => {
      hookResult = renderHook(
        ({ name }: { name: string }) => useSkillAnalysis(name),
        { initialProps: { name: "skill-A" } },
      );
    });

    // 初回: skill-A で analyzeSkill が呼ばれる
    expect(mockAnalyzeSkill).toHaveBeenCalledWith("skill-A");
    const callCountAfterFirst = mockAnalyzeSkill.mock.calls.length;

    // skillName を変更して再レンダリング
    await act(async () => {
      hookResult!.rerender({ name: "skill-B" });
    });

    // skill-B で analyzeSkill が再度呼ばれる
    expect(mockAnalyzeSkill.mock.calls.length).toBeGreaterThan(
      callCountAfterFirst,
    );
    expect(
      mockAnalyzeSkill.mock.calls[mockAnalyzeSkill.mock.calls.length - 1][0],
    ).toBe("skill-B");
  });
});
