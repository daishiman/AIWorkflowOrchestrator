/**
 * @file agentSlice スキルライフサイクルセレクタテスト
 * @description TASK-10A-D: スキルライフサイクル管理の個別セレクタHookテスト
 *
 * P31対策: 個別セレクタが安定した参照を返し、無限ループが発生しないことを検証する。
 *
 * @vitest-environment happy-dom
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @feature skill-lifecycle-ui-integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../index";
import type { AppStore } from "../../index";
import {
  useCurrentAnalysis,
  useIsAnalyzingSkill,
  useIsImprovingSkill,
  useAnalyzeSkill,
  useApplySkillImprovements,
  useAutoImproveSkill,
  useCreateSkill,
  useClearAnalysis,
} from "../../index";
import type { SkillAnalysis } from "@repo/shared/types/skill-improver";

// =============================================================================
// テストヘルパー関数
// =============================================================================

/**
 * 無限ループ防止テスト用ヘルパー
 */
async function assertNoInfiniteLoop(
  selector: (state: AppStore) => unknown,
  maxRenders = 10,
) {
  const renderCount = { current: 0 };

  renderHook(() => {
    renderCount.current++;
    const action = useAppStore(selector);
    const initRef = useRef(false);

    useEffect(() => {
      if (!initRef.current) {
        initRef.current = true;
      }
    }, [action]);

    return { renderCount: renderCount.current };
  });

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  expect(renderCount.current).toBeLessThan(maxRenders);
}

/**
 * 再レンダリング隔離テスト用ヘルパー
 */
function assertNoUnrelatedRerender(
  selector: (state: AppStore) => unknown,
  stateUpdate: Partial<AppStore>,
) {
  let renderCount = 0;

  renderHook(() => {
    renderCount++;
    return useAppStore(selector);
  });

  const initialCount = renderCount;

  act(() => {
    useAppStore.setState(stateUpdate);
  });

  expect(renderCount).toBe(initialCount);
}

/**
 * アクション参照安定性テスト用ヘルパー
 */
function assertStableReference(selector: (state: AppStore) => unknown) {
  const { result, rerender } = renderHook(() => useAppStore(selector));
  const firstRef = result.current;

  rerender();

  expect(result.current).toBe(firstRef);
}

// =============================================================================
// モックデータ
// =============================================================================

const mockAnalysis: SkillAnalysis = {
  skillName: "test-skill",
  overallScore: 85,
  categories: [
    {
      name: "prompt",
      score: 90,
      details: "プロンプト品質は良好です",
      issues: [],
    },
  ],
  suggestions: [
    {
      type: "structure",
      priority: "medium",
      description: "ファイル分割を推奨",
      autoFixable: true,
    },
  ],
  risks: [],
};

// =============================================================================
// モック設定
// =============================================================================

// localStorage ポリフィル（happy-dom環境でundefinedの場合に備える）
if (typeof globalThis.localStorage === "undefined") {
  const store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  } as Storage;
}

function resetStore() {
  useAppStore.setState({
    currentAnalysis: null,
    isAnalyzing: false,
    isImproving: false,
    skillError: null,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// =============================================================================
// テストスイート
// =============================================================================

describe("agentSlice - スキルライフサイクルセレクタテスト（TASK-10A-D）", () => {
  // ===========================================================================
  // 状態セレクタ初期値テスト
  // ===========================================================================
  describe("状態セレクタ初期値テスト", () => {
    it("useCurrentAnalysis初期値はnull", () => {
      const { result } = renderHook(() => useCurrentAnalysis());
      expect(result.current).toBeNull();
    });

    it("useIsAnalyzingSkill初期値はfalse", () => {
      const { result } = renderHook(() => useIsAnalyzingSkill());
      expect(result.current).toBe(false);
    });

    it("useIsImprovingSkill初期値はfalse", () => {
      const { result } = renderHook(() => useIsImprovingSkill());
      expect(result.current).toBe(false);
    });
  });

  // ===========================================================================
  // 状態変更反映テスト
  // ===========================================================================
  describe("状態変更反映テスト", () => {
    it("useCurrentAnalysisがsetStateで更新される", () => {
      const { result } = renderHook(() => useCurrentAnalysis());

      act(() => {
        useAppStore.setState({ currentAnalysis: mockAnalysis });
      });

      expect(result.current).toEqual(mockAnalysis);
    });

    it("useIsAnalyzingSkillがsetStateで更新される", () => {
      const { result } = renderHook(() => useIsAnalyzingSkill());

      act(() => {
        useAppStore.setState({ isAnalyzing: true });
      });

      expect(result.current).toBe(true);
    });

    it("useIsImprovingSkillがsetStateで更新される", () => {
      const { result } = renderHook(() => useIsImprovingSkill());

      act(() => {
        useAppStore.setState({ isImproving: true });
      });

      expect(result.current).toBe(true);
    });
  });

  // ===========================================================================
  // アクションセレクタ存在確認テスト
  // ===========================================================================
  describe("アクションセレクタ存在確認テスト", () => {
    it("useAnalyzeSkillがfunction型を返す", () => {
      const { result } = renderHook(() => useAnalyzeSkill());
      expect(typeof result.current).toBe("function");
    });

    it("useApplySkillImprovementsがfunction型を返す", () => {
      const { result } = renderHook(() => useApplySkillImprovements());
      expect(typeof result.current).toBe("function");
    });

    it("useAutoImproveSkillがfunction型を返す", () => {
      const { result } = renderHook(() => useAutoImproveSkill());
      expect(typeof result.current).toBe("function");
    });

    it("useCreateSkillがfunction型を返す", () => {
      const { result } = renderHook(() => useCreateSkill());
      expect(typeof result.current).toBe("function");
    });

    it("useClearAnalysisがfunction型を返す", () => {
      const { result } = renderHook(() => useClearAnalysis());
      expect(typeof result.current).toBe("function");
    });
  });

  // ===========================================================================
  // P31対策: 参照安定性テスト
  // ===========================================================================
  describe("P31対策: 参照安定性テスト", () => {
    it("useAnalyzeSkillの参照が再レンダリングで安定", () => {
      assertStableReference((state) => state.analyzeSkill);
    });

    it("useApplySkillImprovementsの参照が再レンダリングで安定", () => {
      assertStableReference((state) => state.applySkillImprovements);
    });

    it("useAutoImproveSkillの参照が再レンダリングで安定", () => {
      assertStableReference((state) => state.autoImproveSkill);
    });

    it("useCreateSkillの参照が再レンダリングで安定", () => {
      assertStableReference((state) => state.createSkill);
    });

    it("useClearAnalysisの参照が再レンダリングで安定", () => {
      assertStableReference((state) => state.clearAnalysis);
    });
  });

  // ===========================================================================
  // P31対策: 無限ループ防止テスト
  // ===========================================================================
  describe("P31対策: 無限ループ防止テスト", () => {
    it("analyzeSkillセレクタでuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.analyzeSkill);
    });

    it("applySkillImprovementsセレクタでuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.applySkillImprovements);
    });

    it("autoImproveSkillセレクタでuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.autoImproveSkill);
    });

    it("createSkillセレクタでuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.createSkill);
    });

    it("clearAnalysisセレクタでuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.clearAnalysis);
    });
  });

  // ===========================================================================
  // 再レンダリング隔離テスト
  // ===========================================================================
  describe("再レンダリング隔離テスト", () => {
    it("currentAnalysisは無関係なフィールド変更で再レンダーしない", () => {
      assertNoUnrelatedRerender((state) => state.currentAnalysis, {
        skillError: "some error",
      } as Partial<AppStore>);
    });

    it("isAnalyzingは無関係なフィールド変更で再レンダーしない", () => {
      assertNoUnrelatedRerender((state) => state.isAnalyzing, {
        skillError: "some error",
      } as Partial<AppStore>);
    });

    it("isImprovingは無関係なフィールド変更で再レンダーしない", () => {
      assertNoUnrelatedRerender((state) => state.isImproving, {
        skillError: "some error",
      } as Partial<AppStore>);
    });
  });

  // ===========================================================================
  // clearAnalysis アクション動作テスト
  // ===========================================================================
  describe("clearAnalysis動作テスト", () => {
    it("useClearAnalysisでcurrentAnalysisがnullになる", () => {
      // 初期状態を設定
      act(() => {
        useAppStore.setState({ currentAnalysis: mockAnalysis });
      });

      const { result: analysisResult } = renderHook(() => useCurrentAnalysis());
      expect(analysisResult.current).toEqual(mockAnalysis);

      const { result: clearResult } = renderHook(() => useClearAnalysis());

      act(() => {
        clearResult.current();
      });

      // 新しいHookで最新の値を取得
      const { result: updatedResult } = renderHook(() => useCurrentAnalysis());
      expect(updatedResult.current).toBeNull();
    });
  });
});
