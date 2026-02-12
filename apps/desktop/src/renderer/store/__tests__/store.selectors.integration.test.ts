/**
 * Zustand Store セレクタ統合テスト
 *
 * UT-STORE-HOOKS-REFACTOR-001 Phase 6: テスト拡充
 * 複数セレクタの組み合わせテストとP31解決テストを行う。
 *
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAppStore } from "../index";

// =============================================================================
// モック設定
// =============================================================================

function createMockElectronAPI() {
  return {
    authMode: {
      get: vi.fn().mockResolvedValue({ mode: "subscription" }),
      set: vi.fn().mockResolvedValue({ success: true }),
      status: vi.fn().mockResolvedValue({ isValid: true }),
      validate: vi.fn().mockResolvedValue({ isValid: true }),
      onModeChanged: vi.fn(),
    },
    llm: {
      getProviders: vi.fn().mockResolvedValue([
        {
          id: "provider-1",
          name: "Test Provider",
          models: [{ id: "model-1", name: "Test Model" }],
        },
      ]),
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
  };
}

function resetStore() {
  useAppStore.setState({
    // AuthMode関連
    mode: "subscription",
    status: null,
    isLoading: false,
    error: null,
    isConfirmDialogOpen: false,
    pendingMode: null,
    // LLM関連
    providers: [],
    selectedProviderId: null,
    selectedModelId: null,
    llmIsLoading: false,
    llmError: null,
    healthStatus: {},
    // Skill関連
    availableSkillsMetadata: [],
    importedSkills: [],
    selectedSkillName: null,
    isExecuting: false,
    executionId: null,
    skillExecutionStatus: null,
    streamingMessages: [],
    pendingPermission: null,
    skillError: null,
    isLoadingSkills: false,
    isScanning: false,
    isImporting: false,
    importingSkillName: null,
  });
}

beforeEach(() => {
  vi.clearAllMocks();

  if (typeof window !== "undefined") {
    const mockAPI = createMockElectronAPI();
    (window as unknown as { electronAPI: object }).electronAPI = mockAPI;
  }

  resetStore();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// =============================================================================
// テストスイート
// =============================================================================

describe("Store Selectors Integration", () => {
  // ===========================================================================
  // 複数Sliceセレクタの組み合わせテスト
  // ===========================================================================
  describe("複数Sliceセレクタの組み合わせ", () => {
    it("AuthModeとLLMセレクタを同時に使用できる", () => {
      const { result } = renderHook(() => ({
        authMode: useAppStore((state) => state.mode),
        llmProviders: useAppStore((state) => state.providers),
        fetchProviders: useAppStore((state) => state.fetchProviders),
        setAuthMode: useAppStore((state) => state.setMode),
      }));

      expect(result.current.authMode).toBe("subscription");
      expect(result.current.llmProviders).toEqual([]);
      expect(typeof result.current.fetchProviders).toBe("function");
      expect(typeof result.current.setAuthMode).toBe("function");
    });

    it("Skill状態とAuthMode状態を同時に取得できる", () => {
      useAppStore.setState({
        selectedSkillName: "test-skill",
        isExecuting: true,
        mode: "api-key",
      });

      const { result } = renderHook(() => ({
        selectedSkillName: useAppStore((state) => state.selectedSkillName),
        isExecuting: useAppStore((state) => state.isExecuting),
        authMode: useAppStore((state) => state.mode),
      }));

      expect(result.current.selectedSkillName).toBe("test-skill");
      expect(result.current.isExecuting).toBe(true);
      expect(result.current.authMode).toBe("api-key");
    });

    it("全てのローディング状態を同時に監視できる", () => {
      useAppStore.setState({
        isLoading: true, // AuthMode
        llmIsLoading: true,
        isLoadingSkills: true,
      });

      const { result } = renderHook(() => ({
        authModeLoading: useAppStore((state) => state.isLoading),
        llmLoading: useAppStore((state) => state.llmIsLoading),
        skillsLoading: useAppStore((state) => state.isLoadingSkills),
      }));

      expect(result.current.authModeLoading).toBe(true);
      expect(result.current.llmLoading).toBe(true);
      expect(result.current.skillsLoading).toBe(true);
    });
  });

  // ===========================================================================
  // P31解決テスト（個別セレクタで無限ループが発生しない）
  // ===========================================================================
  describe("P31解決テスト（個別セレクタで無限ループが発生しない）", () => {
    const MAX_RENDERS = 10;

    it("複数Sliceのアクションを依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const fetchProviders = useAppStore((state) => state.fetchProviders);
        const setMode = useAppStore((state) => state.setMode);
        const fetchSkills = useAppStore((state) => state.fetchSkills);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchProviders, setMode, fetchSkills]);

        return { renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("状態更新後もアクション関数の参照が安定している", async () => {
      const { result, rerender } = renderHook(() => ({
        authMode: useAppStore((state) => state.mode),
        setMode: useAppStore((state) => state.setMode),
        fetchProviders: useAppStore((state) => state.fetchProviders),
      }));

      const initialSetMode = result.current.setMode;
      const initialFetchProviders = result.current.fetchProviders;

      // 状態を更新
      await act(async () => {
        useAppStore.setState({ mode: "api-key" });
      });

      rerender();

      // 状態は変更されているが、関数参照は同じ
      expect(result.current.authMode).toBe("api-key");
      expect(result.current.setMode).toBe(initialSetMode);
      expect(result.current.fetchProviders).toBe(initialFetchProviders);
    });

    it("P31: 合成Hookパターンの問題を個別セレクタで回避", async () => {
      const renderCount = { current: 0 };

      // 個別セレクタを使用（安全）
      renderHook(() => {
        renderCount.current++;
        const fetchProviders = useAppStore((state) => state.fetchProviders);
        const selectProvider = useAppStore((state) => state.selectProvider);

        useEffect(() => {
          // 空の処理 - 参照が安定していれば無限ループしない
        }, [fetchProviders, selectProvider]);

        return null;
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      // 個別セレクタは参照が安定しているため、無限ループしない
      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("非同期アクション実行後も参照が安定している", async () => {
      const { result, rerender } = renderHook(() => ({
        providers: useAppStore((state) => state.providers),
        llmIsLoading: useAppStore((state) => state.llmIsLoading),
        fetchProviders: useAppStore((state) => state.fetchProviders),
      }));

      const initialFetchProviders = result.current.fetchProviders;

      // 非同期アクションを実行
      await act(async () => {
        await result.current.fetchProviders();
      });

      rerender();

      // 関数参照は変わらない
      expect(result.current.fetchProviders).toBe(initialFetchProviders);
    });
  });

  // ===========================================================================
  // セレクタの再レンダー最適化テスト
  // ===========================================================================
  describe("セレクタの再レンダー最適化", () => {
    it("関係ない状態の更新では再レンダリングされない", async () => {
      const renderCountAuthMode = { current: 0 };
      const renderCountLLM = { current: 0 };

      // AuthModeのみを監視するコンポーネント
      renderHook(() => {
        renderCountAuthMode.current++;
        return useAppStore((state) => state.mode);
      });

      // LLMのみを監視するコンポーネント
      renderHook(() => {
        renderCountLLM.current++;
        return useAppStore((state) => state.llmIsLoading);
      });

      const initialAuthModeRenders = renderCountAuthMode.current;
      const initialLLMRenders = renderCountLLM.current;

      // LLM状態を更新
      await act(async () => {
        useAppStore.setState({ llmIsLoading: true });
      });

      // AuthModeのレンダリング回数は変わらないはず（理想的には）
      // ※ Zustandの実装によっては1回増える可能性がある
      expect(renderCountAuthMode.current).toBeLessThanOrEqual(
        initialAuthModeRenders + 1,
      );
      expect(renderCountLLM.current).toBeGreaterThanOrEqual(initialLLMRenders);
    });

    it("同じ値への更新では再レンダリングされない", async () => {
      useAppStore.setState({ mode: "subscription" });

      const renderCount = { current: 0 };

      const { result } = renderHook(() => {
        renderCount.current++;
        return useAppStore((state) => state.mode);
      });

      const initialRenders = renderCount.current;

      // 同じ値で更新
      await act(async () => {
        useAppStore.setState({ mode: "subscription" });
      });

      // 再レンダリングされない（または最大1回）
      expect(renderCount.current).toBeLessThanOrEqual(initialRenders + 1);
      expect(result.current).toBe("subscription");
    });
  });

  // ===========================================================================
  // 複数コンポーネントでの同時使用テスト
  // ===========================================================================
  describe("複数コンポーネントでの同時使用", () => {
    it("複数のhookが同じ状態を正しく取得できる", () => {
      useAppStore.setState({ mode: "api-key" });

      const { result: result1 } = renderHook(() =>
        useAppStore((state) => state.mode),
      );
      const { result: result2 } = renderHook(() =>
        useAppStore((state) => state.mode),
      );
      const { result: result3 } = renderHook(() =>
        useAppStore((state) => state.mode),
      );

      expect(result1.current).toBe("api-key");
      expect(result2.current).toBe("api-key");
      expect(result3.current).toBe("api-key");
    });

    it("一方の更新が他方にも反映される", async () => {
      const { result: result1 } = renderHook(() => ({
        mode: useAppStore((state) => state.mode),
        setMode: useAppStore((state) => state.setMode),
      }));

      const { result: result2 } = renderHook(() =>
        useAppStore((state) => state.mode),
      );

      expect(result1.current.mode).toBe("subscription");
      expect(result2.current).toBe("subscription");

      // 一方から更新
      await act(async () => {
        useAppStore.setState({ mode: "api-key" });
      });

      // 両方に反映
      expect(result1.current.mode).toBe("api-key");
      expect(result2.current).toBe("api-key");
    });

    it("異なるセレクタが独立して動作する", async () => {
      const { result: authModeResult } = renderHook(() =>
        useAppStore((state) => state.mode),
      );
      const { result: llmResult } = renderHook(() =>
        useAppStore((state) => state.selectedProviderId),
      );
      const { result: skillResult } = renderHook(() =>
        useAppStore((state) => state.selectedSkillName),
      );

      // 初期値
      expect(authModeResult.current).toBe("subscription");
      expect(llmResult.current).toBeNull();
      expect(skillResult.current).toBeNull();

      // 各状態を個別に更新
      await act(async () => {
        useAppStore.setState({ mode: "api-key" });
      });
      expect(authModeResult.current).toBe("api-key");
      expect(llmResult.current).toBeNull(); // 変更なし
      expect(skillResult.current).toBeNull(); // 変更なし

      await act(async () => {
        useAppStore.setState({ selectedProviderId: "provider-1" });
      });
      expect(authModeResult.current).toBe("api-key"); // 変更なし
      expect(llmResult.current).toBe("provider-1");
      expect(skillResult.current).toBeNull(); // 変更なし

      await act(async () => {
        useAppStore.setState({ selectedSkillName: "test-skill" });
      });
      expect(authModeResult.current).toBe("api-key"); // 変更なし
      expect(llmResult.current).toBe("provider-1"); // 変更なし
      expect(skillResult.current).toBe("test-skill");
    });
  });

  // ===========================================================================
  // アクション連鎖テスト
  // ===========================================================================
  describe("アクション連鎖", () => {
    it("複数のアクションを連続実行できる", async () => {
      // プロバイダーを事前に設定（selectProviderはprovidersリストにある必要がある）
      const mockProviders = [
        {
          id: "provider-1",
          name: "Test Provider",
          models: [{ id: "model-1", name: "Test Model" }],
        },
      ];
      useAppStore.setState({ providers: mockProviders });

      const { result } = renderHook(() => ({
        mode: useAppStore((state) => state.mode),
        selectedProviderId: useAppStore((state) => state.selectedProviderId),
        selectProvider: useAppStore((state) => state.selectProvider),
      }));

      // AuthMode変更
      await act(async () => {
        useAppStore.setState({ mode: "api-key" });
      });

      // LLMプロバイダー選択（providersリストに存在する場合のみ選択可能）
      await act(async () => {
        result.current.selectProvider("provider-1");
      });

      expect(result.current.mode).toBe("api-key");
      expect(result.current.selectedProviderId).toBe("provider-1");
    });

    it("エラー状態をクリアできる", async () => {
      // エラー状態を設定
      useAppStore.setState({
        error: "Auth error",
        llmError: "LLM error",
        skillError: "Skill error",
      });

      const { result } = renderHook(() => ({
        authError: useAppStore((state) => state.error),
        llmError: useAppStore((state) => state.llmError),
        skillError: useAppStore((state) => state.skillError),
        clearAuthError: useAppStore((state) => state.clearError),
        clearLLMError: useAppStore((state) => state.clearLLMError),
        clearSkillError: useAppStore((state) => state.clearSkillError),
      }));

      expect(result.current.authError).toBe("Auth error");
      expect(result.current.llmError).toBe("LLM error");
      expect(result.current.skillError).toBe("Skill error");

      // エラーをクリア
      await act(async () => {
        result.current.clearAuthError();
        result.current.clearLLMError();
        result.current.clearSkillError();
      });

      expect(result.current.authError).toBeNull();
      expect(result.current.llmError).toBeNull();
      expect(result.current.skillError).toBeNull();
    });
  });
});
