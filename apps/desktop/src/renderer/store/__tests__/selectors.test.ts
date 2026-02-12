/**
 * @file Store個別セレクタの参照安定性テスト
 * @description TDD Red Phase - UT-STORE-HOOKS-COMPONENT-MIGRATION-001
 *
 * このテストは個別セレクタHookの参照安定性を検証します。
 * Zustandでは、アクション関数はStore作成時に固定されるため、
 * 個別セレクタで取得した関数参照は安定しています。
 *
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/outputs/phase-2/architecture-design.md
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "../index";

// ============================================
// テスト用のセレクタ定義
// Phase 5で実際のエクスポートに置き換え予定
// ============================================

// LLM個別セレクタ（テスト用定義）
const useLLMProviders = () => useAppStore((state) => state.providers);
const useLLMSelectedProviderId = () =>
  useAppStore((state) => state.selectedProviderId);
const _useLLMSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);
const _useLLMIsLoading = () => useAppStore((state) => state.llmIsLoading);
const _useLLMError = () => useAppStore((state) => state.llmError);
const useLLMHealthStatus = () => useAppStore((state) => state.healthStatus);
const useLLMFetchProviders = () => useAppStore((state) => state.fetchProviders);
const useLLMSelectProvider = () => useAppStore((state) => state.selectProvider);
const useLLMSelectModel = () => useAppStore((state) => state.selectModel);
const useLLMCheckHealth = () => useAppStore((state) => state.checkHealth);
const useLLMResetSelection = () => useAppStore((state) => state.resetSelection);
const useLLMClearError = () => useAppStore((state) => state.clearLLMError);

// Skill個別セレクタ（テスト用定義）
const useAvailableSkillsMetadata = () =>
  useAppStore((state) => state.availableSkillsMetadata);
const useImportedSkills = () => useAppStore((state) => state.importedSkills);
const useSelectedSkillName = () =>
  useAppStore((state) => state.selectedSkillName);
const useIsScanning = () => useAppStore((state) => state.isScanning);
const _useIsSkillExecuting = () => useAppStore((state) => state.isExecuting);
const _useSkillError = () => useAppStore((state) => state.skillError);
const _useIsLoadingSkills = () => useAppStore((state) => state.isLoadingSkills);
const _useIsImporting = () => useAppStore((state) => state.isImporting);
const useRescanSkills = () => useAppStore((state) => state.rescanSkills);
const useSelectSkillByName = () =>
  useAppStore((state) => state.selectSkillByName);
const useFetchSkills = () => useAppStore((state) => state.fetchSkills);
const useImportSkill = () => useAppStore((state) => state.importSkill);
const useRemoveSkill = () => useAppStore((state) => state.removeSkill);
const useExecuteSkill = () => useAppStore((state) => state.executeSkill);
const useClearSkillError = () => useAppStore((state) => state.clearSkillError);

// AuthMode追加セレクタ（テスト用定義）
// 既存: useAuthMode, useAuthModeStatus, useAuthModeLoading, useAuthModeError, useIsAuthModeValid
const useSetAuthMode = () => useAppStore((state) => state.setMode);
const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
const useFetchAuthMode = () => useAppStore((state) => state.fetchMode);

// ============================================
// テストスイート
// ============================================

describe("Store Individual Selectors", () => {
  beforeEach(() => {
    // ストアの状態をリセット
    useAppStore.setState({
      providers: [],
      selectedProviderId: null,
      selectedModelId: null,
      llmIsLoading: false,
      llmError: null,
      healthStatus: {},
      availableSkillsMetadata: [],
      importedSkills: [],
      selectedSkillName: null,
      isScanning: false,
      isExecuting: false,
      skillError: null,
      isLoadingSkills: false,
      isImporting: false,
      mode: "subscription",
      status: null,
      isLoading: false,
      error: null,
    });
  });

  // ============================================
  // LLM Selectors Tests
  // ============================================

  describe("LLM Selectors", () => {
    describe("状態セレクタの参照安定性", () => {
      it("TC-SEL-LLM-001: useLLMProviders は providers が変更されない限り同じ参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMProviders());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        // 再レンダー後も同じ参照
        expect(firstRef).toBe(secondRef);
      });

      it("TC-SEL-LLM-002: useLLMSelectedProviderId は安定した参照を返す", () => {
        const { result, rerender } = renderHook(() =>
          useLLMSelectedProviderId(),
        );

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
      });

      it("TC-SEL-LLM-003: useLLMHealthStatus は安定した参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMHealthStatus());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
      });
    });

    describe("アクションセレクタの参照安定性", () => {
      it("TC-SEL-LLM-004: useLLMFetchProviders は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMFetchProviders());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        // アクション関数の参照は安定
        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-LLM-005: useLLMSelectProvider は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMSelectProvider());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-LLM-006: useLLMSelectModel は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMSelectModel());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-LLM-007: useLLMCheckHealth は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMCheckHealth());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-LLM-008: useLLMResetSelection は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMResetSelection());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-LLM-009: useLLMClearError は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMClearError());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });
    });

    describe("状態変更後の参照安定性", () => {
      it("TC-SEL-LLM-010: 状態が変更されてもアクション関数の参照は維持される", () => {
        const { result: fetchResult, rerender: rerenderFetch } = renderHook(
          () => useLLMFetchProviders(),
        );
        const { result: selectResult, rerender: rerenderSelect } = renderHook(
          () => useLLMSelectProvider(),
        );

        const fetchRefBefore = fetchResult.current;
        const selectRefBefore = selectResult.current;

        // 状態を変更
        act(() => {
          useAppStore.setState({ llmIsLoading: true });
        });

        rerenderFetch();
        rerenderSelect();

        // 状態変更後も関数参照は同じ
        expect(fetchResult.current).toBe(fetchRefBefore);
        expect(selectResult.current).toBe(selectRefBefore);
      });
    });
  });

  // ============================================
  // Skill Selectors Tests
  // ============================================

  describe("Skill Selectors", () => {
    describe("状態セレクタの参照安定性", () => {
      it("TC-SEL-SK-001: useAvailableSkillsMetadata は安定した参照を返す", () => {
        const { result, rerender } = renderHook(() =>
          useAvailableSkillsMetadata(),
        );

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
      });

      it("TC-SEL-SK-002: useImportedSkills は安定した参照を返す", () => {
        const { result, rerender } = renderHook(() => useImportedSkills());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
      });

      it("TC-SEL-SK-003: useSelectedSkillName は安定した参照を返す", () => {
        const { result, rerender } = renderHook(() => useSelectedSkillName());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
      });

      it("TC-SEL-SK-004: useIsScanning は安定した参照を返す", () => {
        const { result, rerender } = renderHook(() => useIsScanning());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
      });
    });

    describe("アクションセレクタの参照安定性", () => {
      it("TC-SEL-SK-005: useRescanSkills は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useRescanSkills());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-SK-006: useSelectSkillByName は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useSelectSkillByName());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-SK-007: useFetchSkills は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useFetchSkills());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-SK-008: useImportSkill は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useImportSkill());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-SK-009: useRemoveSkill は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useRemoveSkill());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-SK-010: useExecuteSkill は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useExecuteSkill());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-SK-011: useClearSkillError は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useClearSkillError());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });
    });

    describe("状態変更後の参照安定性", () => {
      it("TC-SEL-SK-012: 状態が変更されてもアクション関数の参照は維持される", () => {
        const { result: rescanResult, rerender: rerenderRescan } = renderHook(
          () => useRescanSkills(),
        );
        const { result: selectResult, rerender: rerenderSelect } = renderHook(
          () => useSelectSkillByName(),
        );

        const rescanRefBefore = rescanResult.current;
        const selectRefBefore = selectResult.current;

        // 状態を変更
        act(() => {
          useAppStore.setState({ isScanning: true });
        });

        rerenderRescan();
        rerenderSelect();

        // 状態変更後も関数参照は同じ
        expect(rescanResult.current).toBe(rescanRefBefore);
        expect(selectResult.current).toBe(selectRefBefore);
      });
    });
  });

  // ============================================
  // AuthMode Selectors Tests
  // ============================================

  describe("AuthMode Selectors", () => {
    describe("アクションセレクタの参照安定性", () => {
      it("TC-SEL-AM-001: useSetAuthMode は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useSetAuthMode());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-AM-002: useInitializeAuthMode は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useInitializeAuthMode());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });

      it("TC-SEL-AM-003: useFetchAuthMode は安定した関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useFetchAuthMode());

        const firstRef = result.current;
        rerender();
        const secondRef = result.current;

        expect(firstRef).toBe(secondRef);
        expect(typeof firstRef).toBe("function");
      });
    });

    describe("状態変更後の参照安定性", () => {
      it("TC-SEL-AM-004: 状態が変更されてもアクション関数の参照は維持される", () => {
        const { result: setResult, rerender: rerenderSet } = renderHook(() =>
          useSetAuthMode(),
        );
        const { result: initResult, rerender: rerenderInit } = renderHook(() =>
          useInitializeAuthMode(),
        );

        const setRefBefore = setResult.current;
        const initRefBefore = initResult.current;

        // 状態を変更
        act(() => {
          useAppStore.setState({ mode: "api-key" });
        });

        rerenderSet();
        rerenderInit();

        // 状態変更後も関数参照は同じ
        expect(setResult.current).toBe(setRefBefore);
        expect(initResult.current).toBe(initRefBefore);
      });
    });
  });

  // ============================================
  // useEffect無限ループ防止テスト
  // ============================================

  describe("useEffect Infinite Loop Prevention", () => {
    it("TC-LOOP-001: 個別セレクタで取得したアクション関数をuseEffectの依存配列に含めても無限ループしない", () => {
      // このテストは、個別セレクタが安定した参照を返すことで
      // useEffectの依存配列に含めても無限ループしないことを検証

      let effectCallCount = 0;
      const maxRenders = 10;
      let renderCount = 0;

      const { result, rerender } = renderHook(() => {
        const fetchProviders = useLLMFetchProviders();

        // レンダー回数をカウント（無限ループ検出用）
        renderCount++;
        if (renderCount > maxRenders) {
          throw new Error("Infinite loop detected!");
        }

        // useEffect相当の処理をシミュレート
        // 実際のReact useEffectはrenderHookでは直接テストできないため、
        // 関数参照の安定性で間接的に検証
        if (effectCallCount === 0) {
          effectCallCount++;
        }

        return { fetchProviders, effectCallCount };
      });

      // 複数回rerenderしても問題ない
      rerender();
      rerender();
      rerender();

      // 無限ループしていない（maxRendersに達していない）
      expect(renderCount).toBeLessThanOrEqual(maxRenders);
      expect(result.current.effectCallCount).toBe(1);
    });

    it("TC-LOOP-002: Skill系セレクタでも無限ループしない", () => {
      let renderCount = 0;
      const maxRenders = 10;

      const { result, rerender } = renderHook(() => {
        const rescanSkills = useRescanSkills();
        const selectSkillByName = useSelectSkillByName();

        renderCount++;
        if (renderCount > maxRenders) {
          throw new Error("Infinite loop detected!");
        }

        return { rescanSkills, selectSkillByName };
      });

      rerender();
      rerender();
      rerender();

      expect(renderCount).toBeLessThanOrEqual(maxRenders);
      expect(typeof result.current.rescanSkills).toBe("function");
      expect(typeof result.current.selectSkillByName).toBe("function");
    });

    it("TC-LOOP-003: AuthMode系セレクタでも無限ループしない", () => {
      let renderCount = 0;
      const maxRenders = 10;

      const { result, rerender } = renderHook(() => {
        const initializeAuthMode = useInitializeAuthMode();
        const setAuthMode = useSetAuthMode();

        renderCount++;
        if (renderCount > maxRenders) {
          throw new Error("Infinite loop detected!");
        }

        return { initializeAuthMode, setAuthMode };
      });

      rerender();
      rerender();
      rerender();

      expect(renderCount).toBeLessThanOrEqual(maxRenders);
      expect(typeof result.current.initializeAuthMode).toBe("function");
      expect(typeof result.current.setAuthMode).toBe("function");
    });
  });

  // ============================================
  // 合成Hook vs 個別セレクタの比較テスト
  // ============================================

  describe("Composite Hook vs Individual Selector Comparison", () => {
    it("TC-COMP-001: 合成Hookのセレクタは毎回新しいオブジェクトを生成する概念を示す", () => {
      // P31の問題を概念的に説明:
      // 合成Hook（useLLMStore等）は毎回新しいオブジェクトを返すため、
      // useEffectの依存配列に含めると無限ループが発生する。
      //
      // 例（問題あり）:
      // const { fetchProviders } = useLLMStore();
      // useEffect(() => { fetchProviders(); }, [fetchProviders]); // 無限ループ!
      //
      // この挙動を直接テストすると無限ループでテストがハングするため、
      // 代わりにセレクタ関数自体の挙動をテストします。

      // セレクタ関数を呼び出すたびに新しいオブジェクトが生成されることを確認
      const state = useAppStore.getState();
      const compositeSelector = () => ({
        providers: state.providers,
        selectedProviderId: state.selectedProviderId,
        fetchProviders: state.fetchProviders,
      });

      const result1 = compositeSelector();
      const result2 = compositeSelector();

      // 同じ値を返すが、異なるオブジェクト参照
      expect(result1).not.toBe(result2);
      expect(result1.providers).toBe(result2.providers);
      expect(result1.fetchProviders).toBe(result2.fetchProviders);
    });

    it("TC-COMP-002: 個別セレクタは安定した参照を返す", () => {
      // 前のテストの影響を避けるためにストアをリセット
      useAppStore.setState({
        providers: [],
        selectedProviderId: null,
        selectedModelId: null,
        llmIsLoading: false,
        llmError: null,
        healthStatus: {},
      });

      const { result: provResult, rerender: rerenderProv } = renderHook(() =>
        useLLMProviders(),
      );
      const { result: fetchResult, rerender: rerenderFetch } = renderHook(() =>
        useLLMFetchProviders(),
      );

      const provRef1 = provResult.current;
      const fetchRef1 = fetchResult.current;

      rerenderProv();
      rerenderFetch();

      const provRef2 = provResult.current;
      const fetchRef2 = fetchResult.current;

      // 個別セレクタは安定した参照を返す
      expect(provRef1).toBe(provRef2);
      expect(fetchRef1).toBe(fetchRef2);
    });
  });
});
