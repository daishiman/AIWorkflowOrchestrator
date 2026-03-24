/**
 * @file AgentSlice LLM 生成状態管理テスト
 * @description TASK-SC-06-UI-RUNTIME-CONNECTION Phase 4 - TDD Red
 *
 * AgentSlice に追加する LLM 生成状態フィールド・アクション・個別セレクタのテスト。
 * Phase 5 で実装を追加するまでテストは Red 状態になる。
 *
 * @see docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-02-design.md
 * @see .claude/rules/06-known-pitfalls.md#P31
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "../index";

// 個別セレクタ（Phase 5 で store/index.ts にエクスポート予定）
// テスト時は直接 useAppStore から取得して検証する
const useIsSkillGenerating = () => useAppStore((state) => state.isGenerating);
const useGenerationProgress = () =>
  useAppStore((state) => state.generationProgress);
const useGenerationError = () => useAppStore((state) => state.generationError);
const useCurrentPlanId = () => useAppStore((state) => state.currentPlanId);
const useCurrentPlanResult = () =>
  useAppStore((state) => state.currentPlanResult);

beforeEach(() => {
  // Store を初期状態にリセット（P9 対策: テスト間状態リーク防止）
  const store = useAppStore.getState();
  if (typeof store.clearGenerationState === "function") {
    store.clearGenerationState();
  }
});

// =====================================================================
// U-S-1: 初期状態で生成状態フィールドがデフォルト値
// =====================================================================
describe("U-S-1: initial generation state fields", () => {
  it("AgentSlice の生成状態フィールドが全てデフォルト値である", () => {
    const { result } = renderHook(() => useAppStore());

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationProgress).toBeNull();
    expect(result.current.generationError).toBeNull();
    expect(result.current.currentPlanId).toBeNull();
    expect(result.current.currentPlanResult).toBeNull();
  });
});

// =====================================================================
// U-S-2: setIsGenerating で isGenerating を切り替え可能
// =====================================================================
describe("U-S-2: setIsGenerating action", () => {
  it("setIsGenerating(true) で isGenerating が true になる", () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setIsGenerating(true);
    });

    expect(result.current.isGenerating).toBe(true);

    act(() => {
      result.current.setIsGenerating(false);
    });

    expect(result.current.isGenerating).toBe(false);
  });
});

// =====================================================================
// U-S-3: setGenerationProgress が generationProgress を更新する
// =====================================================================
describe("U-S-3: setGenerationProgress action", () => {
  it("setGenerationProgress で進捗メッセージを設定・解除できる", () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setGenerationProgress("計画を生成中...");
    });

    expect(result.current.generationProgress).toBe("計画を生成中...");

    act(() => {
      result.current.setGenerationProgress(null);
    });

    expect(result.current.generationProgress).toBeNull();
  });
});

// =====================================================================
// U-S-4: setGenerationError が generationError を更新する
// =====================================================================
describe("U-S-4: setGenerationError action", () => {
  it("setGenerationError でエラーメッセージを設定できる", () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setGenerationError("ネットワークエラー");
    });

    expect(result.current.generationError).toBe("ネットワークエラー");
  });
});

// =====================================================================
// U-S-5: setCurrentPlanId と setCurrentPlanResult
// =====================================================================
describe("U-S-5: setCurrentPlanId and setCurrentPlanResult", () => {
  it("plan ID と plan 結果を正しく設定できる", () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.setCurrentPlanId("plan-001");
    });

    expect(result.current.currentPlanId).toBe("plan-001");

    const planResult = {
      type: "integrated_api" as const,
      planId: "plan-001",
      estimatedSteps: 5,
    };

    act(() => {
      result.current.setCurrentPlanResult(planResult);
    });

    expect(result.current.currentPlanResult).toEqual(planResult);
  });
});

// =====================================================================
// U-S-6: clearGenerationState が全フィールドをリセット
// =====================================================================
describe("U-S-6: clearGenerationState resets all fields", () => {
  it("全生成状態フィールドが初期値にリセットされる", () => {
    const { result } = renderHook(() => useAppStore());

    // まず全フィールドを設定
    act(() => {
      result.current.setIsGenerating(true);
      result.current.setGenerationProgress("生成中...");
      result.current.setGenerationError("エラー");
      result.current.setCurrentPlanId("plan-001");
      result.current.setCurrentPlanResult({
        type: "integrated_api",
        planId: "plan-001",
        estimatedSteps: 5,
      });
    });

    // clearGenerationState で全リセット
    act(() => {
      result.current.clearGenerationState();
    });

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.generationProgress).toBeNull();
    expect(result.current.generationError).toBeNull();
    expect(result.current.currentPlanId).toBeNull();
    expect(result.current.currentPlanResult).toBeNull();
  });
});

// =====================================================================
// U-S-7: 個別セレクタが状態変化を正しく反映（P31 対策）
// =====================================================================
describe("U-S-7: individual selectors reflect state changes (P31)", () => {
  it("useIsSkillGenerating が isGenerating の変化を反映する", () => {
    const { result } = renderHook(() => useIsSkillGenerating());

    expect(result.current).toBe(false);

    act(() => {
      useAppStore.getState().setIsGenerating(true);
    });

    expect(result.current).toBe(true);
  });

  it("useGenerationProgress が generationProgress の変化を反映する", () => {
    const { result } = renderHook(() => useGenerationProgress());

    expect(result.current).toBeNull();

    act(() => {
      useAppStore.getState().setGenerationProgress("テスト進捗");
    });

    expect(result.current).toBe("テスト進捗");
  });

  it("useGenerationError が generationError の変化を反映する", () => {
    const { result } = renderHook(() => useGenerationError());

    expect(result.current).toBeNull();

    act(() => {
      useAppStore.getState().setGenerationError("テストエラー");
    });

    expect(result.current).toBe("テストエラー");
  });

  it("useCurrentPlanId が currentPlanId の変化を反映する", () => {
    const { result } = renderHook(() => useCurrentPlanId());

    expect(result.current).toBeNull();

    act(() => {
      useAppStore.getState().setCurrentPlanId("plan-test");
    });

    expect(result.current).toBe("plan-test");
  });

  it("useCurrentPlanResult が currentPlanResult の変化を反映する", () => {
    const { result } = renderHook(() => useCurrentPlanResult());

    expect(result.current).toBeNull();

    const planResult = {
      type: "integrated_api" as const,
      planId: "plan-test",
      estimatedSteps: 3,
    };

    act(() => {
      useAppStore.getState().setCurrentPlanResult(planResult);
    });

    expect(result.current).toEqual(planResult);
  });
});
