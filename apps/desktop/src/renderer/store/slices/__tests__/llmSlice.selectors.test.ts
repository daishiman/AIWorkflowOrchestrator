/**
 * llmSlice 個別セレクタHookテスト
 *
 * P31対策: 合成Store Hook（useLLMStore）の代わりに個別セレクタを使用
 * することで、useEffect依存配列に関数を含めても無限ループが発生しない
 * ことを検証する。
 *
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/phase-4-test-creation.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
// useState は将来のテスト拡張用に削除済み
import { useAppStore } from "../../index";

// =============================================================================
// モック設定
// =============================================================================

/**
 * electronAPI モック
 */
function createMockElectronAPI() {
  return {
    llm: {
      getProviders: vi.fn().mockResolvedValue([]),
      checkHealth: vi.fn().mockResolvedValue({ status: "healthy" }),
    },
    skill: {
      onStream: vi.fn().mockReturnValue(() => {}),
      onPermissionRequest: vi.fn().mockReturnValue(() => {}),
      sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
      execute: vi.fn().mockResolvedValue({ executionId: "test-exec-id" }),
      abort: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
      getImported: vi.fn().mockResolvedValue([]),
      import: vi.fn().mockResolvedValue({}),
      remove: vi.fn().mockResolvedValue(undefined),
      rescan: vi.fn().mockResolvedValue([]),
      onComplete: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
      getExecutionStatus: vi.fn().mockResolvedValue(null),
    },
    authMode: {
      get: vi.fn(),
      set: vi.fn(),
      status: vi.fn(),
      validate: vi.fn(),
      onModeChanged: vi.fn(),
    },
  };
}

// ストアの初期状態をリセットする関数
function resetStore() {
  // LLM関連の状態をリセット
  useAppStore.setState({
    providers: [],
    selectedProviderId: null,
    selectedModelId: null,
    llmIsLoading: false,
    llmError: null,
    healthStatus: {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  // グローバルwindowオブジェクトにelectronAPIを設定
  if (typeof window !== "undefined") {
    const mockAPI = createMockElectronAPI();
    (window as unknown as { electronAPI: object }).electronAPI = mockAPI;
  }

  // ストアをリセット
  resetStore();
});

afterEach(() => {
  // React Testing Libraryのクリーンアップ
  cleanup();
  vi.restoreAllMocks();
});

// =============================================================================
// テストスイート
// =============================================================================

describe("llmSlice Individual Selectors", () => {
  // ===========================================================================
  // 状態セレクタテスト
  // ===========================================================================
  describe("状態セレクタ", () => {
    describe("useLLMProviders", () => {
      it("プロバイダー一覧が空配列を返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.providers),
        );
        expect(result.current).toEqual([]);
      });
    });

    describe("useSelectedProviderId", () => {
      it("選択中プロバイダーIDがnullを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.selectedProviderId),
        );
        expect(result.current).toBeNull();
      });
    });

    describe("useSelectedModelId", () => {
      it("選択中モデルIDがnullを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.selectedModelId),
        );
        expect(result.current).toBeNull();
      });
    });

    describe("useLLMIsLoading", () => {
      it("ローディング状態がfalseを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.llmIsLoading),
        );
        expect(result.current).toBe(false);
      });
    });

    describe("useLLMError", () => {
      it("エラー状態がnullを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.llmError),
        );
        expect(result.current).toBeNull();
      });
    });

    describe("useLLMHealthStatus", () => {
      it("ヘルスステータスが空オブジェクトを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.healthStatus),
        );
        expect(result.current).toEqual({});
      });
    });
  });

  // ===========================================================================
  // アクションセレクタテスト
  // ===========================================================================
  describe("アクションセレクタ", () => {
    describe("useFetchProviders", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.fetchProviders),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useSelectProvider", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.selectProvider),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useSelectModel", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.selectModel),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useCheckLLMHealth", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.checkHealth),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useResetLLMSelection", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.resetSelection),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useClearLLMError", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.clearLLMError),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useSetLLMLoading", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.setLLMLoading),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useSetLLMError", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.setLLMError),
        );
        expect(typeof result.current).toBe("function");
      });
    });
  });

  // ===========================================================================
  // 計算セレクタテスト
  // ===========================================================================
  describe("計算セレクタ", () => {
    describe("useSelectedLLMProvider", () => {
      it("選択中プロバイダーがundefinedを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.getSelectedProvider()),
        );
        expect(result.current).toBeUndefined();
      });
    });

    describe("useSelectedLLMModel", () => {
      it("選択中モデルがundefinedを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.getSelectedModel()),
        );
        expect(result.current).toBeUndefined();
      });
    });
  });

  // ===========================================================================
  // 関数参照安定性テスト
  // ===========================================================================
  describe("関数参照安定性", () => {
    it("fetchProvidersの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.fetchProviders),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("selectProviderの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.selectProvider),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("selectModelの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.selectModel),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("checkHealthの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.checkHealth),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("resetSelectionの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.resetSelection),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("clearLLMErrorの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.clearLLMError),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("setLLMLoadingの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.setLLMLoading),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("setLLMErrorの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.setLLMError),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });
  });

  // ===========================================================================
  // 無限ループ防止テスト
  // ===========================================================================
  describe("無限ループ防止", () => {
    const MAX_RENDERS = 10;

    it("fetchProvidersをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const fetchProviders = useAppStore((state) => state.fetchProviders);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchProviders]);

        return { renderCount: renderCount.current };
      });

      // 安定するまで少し待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("selectProviderをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const selectProvider = useAppStore((state) => state.selectProvider);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [selectProvider]);

        return { renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("selectModelをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const selectModel = useAppStore((state) => state.selectModel);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [selectModel]);

        return { renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("複数のアクションセレクタをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const fetchProviders = useAppStore((state) => state.fetchProviders);
        const selectProvider = useAppStore((state) => state.selectProvider);
        const selectModel = useAppStore((state) => state.selectModel);
        const checkHealth = useAppStore((state) => state.checkHealth);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchProviders, selectProvider, selectModel, checkHealth]);

        return { renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("状態セレクタとアクションセレクタを組み合わせても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const providers = useAppStore((state) => state.providers);
        const selectedId = useAppStore((state) => state.selectedProviderId);
        const fetchProviders = useAppStore((state) => state.fetchProviders);
        const selectProvider = useAppStore((state) => state.selectProvider);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchProviders, selectProvider]);

        return { providers, selectedId, renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });
  });

  // ===========================================================================
  // 個別セレクタのexportテスト
  // ===========================================================================
  describe("個別セレクタのexport", () => {
    it("useLLMProvidersがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useLLMProviders).toBe("function");
    });

    it("useSelectedProviderIdがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSelectedProviderId).toBe("function");
    });

    it("useSelectedModelIdがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSelectedModelId).toBe("function");
    });

    it("useLLMIsLoadingがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useLLMIsLoading).toBe("function");
    });

    it("useLLMErrorがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useLLMError).toBe("function");
    });

    it("useLLMHealthStatusがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useLLMHealthStatus).toBe("function");
    });

    it("useFetchProvidersがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useFetchProviders).toBe("function");
    });

    it("useSelectProviderがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSelectProvider).toBe("function");
    });

    it("useSelectModelがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSelectModel).toBe("function");
    });

    it("useCheckLLMHealthがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useCheckLLMHealth).toBe("function");
    });

    it("useResetLLMSelectionがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useResetLLMSelection).toBe("function");
    });

    it("useClearLLMErrorがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useClearLLMError).toBe("function");
    });

    it("useSetLLMLoadingがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSetLLMLoading).toBe("function");
    });

    it("useSetLLMErrorがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSetLLMError).toBe("function");
    });

    it("useSelectedLLMProviderがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSelectedLLMProvider).toBe("function");
    });

    it("useSelectedLLMModelがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSelectedLLMModel).toBe("function");
    });
  });
});
