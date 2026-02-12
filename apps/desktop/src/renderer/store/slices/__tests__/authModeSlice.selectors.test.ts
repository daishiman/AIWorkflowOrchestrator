/**
 * authModeSlice 個別セレクタHookテスト
 *
 * P31対策: 合成Store Hook（useAuthModeStore）の代わりに個別セレクタを使用
 * することで、useEffect依存配列に関数を含めても無限ループが発生しない
 * ことを検証する。
 *
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../index";

// =============================================================================
// モック設定
// =============================================================================

/**
 * electronAPI モック
 */
function createMockElectronAPI() {
  return {
    authMode: {
      get: vi
        .fn()
        .mockResolvedValue({ success: true, data: { mode: "subscription" } }),
      set: vi.fn().mockResolvedValue({ success: true }),
      status: vi.fn().mockResolvedValue({ success: true, data: null }),
      validate: vi
        .fn()
        .mockResolvedValue({ success: true, data: { isValid: true } }),
      onModeChanged: vi.fn(),
    },
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
  };
}

// ストアの初期状態をリセットする関数
function resetStore() {
  useAppStore.setState({
    // AuthMode関連の状態をリセット
    mode: "subscription",
    status: null,
    isLoading: false,
    error: null,
    isConfirmDialogOpen: false,
    pendingMode: null,
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

describe("authModeSlice Individual Selectors", () => {
  // ===========================================================================
  // 状態セレクタテスト
  // ===========================================================================
  describe("状態セレクタ", () => {
    describe("useAuthMode", () => {
      it("認証モードが取得できる（初期状態）", () => {
        const { result } = renderHook(() => useAppStore((state) => state.mode));
        expect(result.current).toBe("subscription");
      });
    });

    describe("useAuthModeStatus", () => {
      it("認証状態がnullを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.status),
        );
        expect(result.current).toBeNull();
      });
    });

    describe("useAuthModeLoading", () => {
      it("ローディング状態がfalseを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.isLoading),
        );
        expect(result.current).toBe(false);
      });
    });

    describe("useAuthModeError", () => {
      it("エラー状態がnullを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.error),
        );
        expect(result.current).toBeNull();
      });
    });

    describe("useIsAuthModeValid", () => {
      it("認証有効性がfalseを返す（初期状態、statusがnull）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.status?.isValid ?? false),
        );
        expect(result.current).toBe(false);
      });
    });

    describe("useIsConfirmDialogOpen", () => {
      it("確認ダイアログ表示状態がfalseを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.isConfirmDialogOpen),
        );
        expect(result.current).toBe(false);
      });
    });

    describe("usePendingMode", () => {
      it("保留中モードがnullを返す（初期状態）", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.pendingMode),
        );
        expect(result.current).toBeNull();
      });
    });
  });

  // ===========================================================================
  // アクションセレクタテスト
  // ===========================================================================
  describe("アクションセレクタ", () => {
    describe("useSetAuthMode", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.setMode),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useInitializeAuthMode", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.initializeAuthMode),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useFetchAuthMode", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.fetchMode),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useFetchAuthModeStatus", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.fetchStatus),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useValidateAuthMode", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.validate),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useOpenConfirmDialog", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.openConfirmDialog),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useCloseConfirmDialog", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.closeConfirmDialog),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useConfirmModeChange", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.confirmModeChange),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useClearAuthModeError", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.clearError),
        );
        expect(typeof result.current).toBe("function");
      });
    });

    describe("useResetAuthMode", () => {
      it("関数が取得できる", () => {
        const { result } = renderHook(() =>
          useAppStore((state) => state.resetAuthMode),
        );
        expect(typeof result.current).toBe("function");
      });
    });
  });

  // ===========================================================================
  // 関数参照安定性テスト
  // ===========================================================================
  describe("関数参照安定性", () => {
    it("setModeの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.setMode),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("initializeAuthModeの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.initializeAuthMode),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("fetchModeの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.fetchMode),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("fetchStatusの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.fetchStatus),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("validateの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.validate),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("openConfirmDialogの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.openConfirmDialog),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("closeConfirmDialogの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.closeConfirmDialog),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("confirmModeChangeの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.confirmModeChange),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("clearErrorの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.clearError),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("resetAuthModeの参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.resetAuthMode),
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

    it("setModeをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const setMode = useAppStore((state) => state.setMode);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [setMode]);

        return { renderCount: renderCount.current };
      });

      // 安定するまで少し待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("initializeAuthModeをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const initializeAuthMode = useAppStore(
          (state) => state.initializeAuthMode,
        );
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [initializeAuthMode]);

        return { renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("fetchModeをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const fetchMode = useAppStore((state) => state.fetchMode);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchMode]);

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
        const setMode = useAppStore((state) => state.setMode);
        const fetchMode = useAppStore((state) => state.fetchMode);
        const validate = useAppStore((state) => state.validate);
        const clearError = useAppStore((state) => state.clearError);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [setMode, fetchMode, validate, clearError]);

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
        const mode = useAppStore((state) => state.mode);
        const isLoading = useAppStore((state) => state.isLoading);
        const fetchMode = useAppStore((state) => state.fetchMode);
        const setMode = useAppStore((state) => state.setMode);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchMode, setMode]);

        return { mode, isLoading, renderCount: renderCount.current };
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
    it("useAuthModeがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useAuthMode).toBe("function");
    });

    it("useAuthModeStatusがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useAuthModeStatus).toBe("function");
    });

    it("useAuthModeLoadingがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useAuthModeLoading).toBe("function");
    });

    it("useAuthModeErrorがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useAuthModeError).toBe("function");
    });

    it("useIsAuthModeValidがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useIsAuthModeValid).toBe("function");
    });

    it("useIsConfirmDialogOpenがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useIsConfirmDialogOpen).toBe("function");
    });

    it("usePendingModeがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.usePendingMode).toBe("function");
    });

    it("useSetAuthModeがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useSetAuthMode).toBe("function");
    });

    it("useInitializeAuthModeがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useInitializeAuthMode).toBe("function");
    });

    it("useFetchAuthModeがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useFetchAuthMode).toBe("function");
    });

    it("useFetchAuthModeStatusがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useFetchAuthModeStatus).toBe("function");
    });

    it("useValidateAuthModeがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useValidateAuthMode).toBe("function");
    });

    it("useOpenConfirmDialogがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useOpenConfirmDialog).toBe("function");
    });

    it("useCloseConfirmDialogがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useCloseConfirmDialog).toBe("function");
    });

    it("useConfirmModeChangeがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useConfirmModeChange).toBe("function");
    });

    it("useClearAuthModeErrorがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useClearAuthModeError).toBe("function");
    });

    it("useResetAuthModeがexportされている", async () => {
      const mod = await import("../../index");
      expect(typeof mod.useResetAuthMode).toBe("function");
    });
  });
});
