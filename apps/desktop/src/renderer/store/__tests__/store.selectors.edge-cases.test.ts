/**
 * Zustand Store セレクタ エッジケーステスト
 *
 * UT-STORE-HOOKS-REFACTOR-001 Phase 6: テスト拡充
 * null/undefined状態のハンドリングと境界値テストを行う。
 *
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
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

describe("Store Selectors Edge Cases", () => {
  // ===========================================================================
  // null/undefined状態のハンドリング
  // ===========================================================================
  describe("null/undefined状態のハンドリング", () => {
    describe("AuthMode", () => {
      it("statusがnullの場合、isValidはfalseを返す", () => {
        useAppStore.setState({ status: null });

        const { result } = renderHook(() =>
          useAppStore((state) => state.status?.isValid ?? false),
        );

        expect(result.current).toBe(false);
      });

      it("errorがnullの場合、正常に取得できる", () => {
        useAppStore.setState({ error: null });

        const { result } = renderHook(() =>
          useAppStore((state) => state.error),
        );

        expect(result.current).toBeNull();
      });

      it("pendingModeがnullの場合、正常に取得できる", () => {
        useAppStore.setState({ pendingMode: null });

        const { result } = renderHook(() =>
          useAppStore((state) => state.pendingMode),
        );

        expect(result.current).toBeNull();
      });
    });

    describe("LLM", () => {
      it("selectedProviderIdがnullの場合、正常に取得できる", () => {
        useAppStore.setState({ selectedProviderId: null });

        const { result } = renderHook(() =>
          useAppStore((state) => state.selectedProviderId),
        );

        expect(result.current).toBeNull();
      });

      it("selectedModelIdがnullの場合、正常に取得できる", () => {
        useAppStore.setState({ selectedModelId: null });

        const { result } = renderHook(() =>
          useAppStore((state) => state.selectedModelId),
        );

        expect(result.current).toBeNull();
      });

      it("providersが空配列の場合、正常に取得できる", () => {
        useAppStore.setState({ providers: [] });

        const { result } = renderHook(() =>
          useAppStore((state) => state.providers),
        );

        expect(result.current).toEqual([]);
        expect(result.current).toHaveLength(0);
      });

      it("getSelectedProviderがundefinedを返す場合（プロバイダー未選択）", () => {
        useAppStore.setState({
          providers: [],
          selectedProviderId: null,
        });

        const { result } = renderHook(() =>
          useAppStore((state) => state.getSelectedProvider()),
        );

        expect(result.current).toBeUndefined();
      });
    });

    describe("Skill", () => {
      it("selectedSkillNameがnullの場合、正常に取得できる", () => {
        useAppStore.setState({ selectedSkillName: null });

        const { result } = renderHook(() =>
          useAppStore((state) => state.selectedSkillName),
        );

        expect(result.current).toBeNull();
      });

      it("executionIdがnullの場合、正常に取得できる", () => {
        useAppStore.setState({ executionId: null });

        const { result } = renderHook(() =>
          useAppStore((state) => state.executionId),
        );

        expect(result.current).toBeNull();
      });

      it("streamingMessagesが空配列の場合、正常に取得できる", () => {
        useAppStore.setState({ streamingMessages: [] });

        const { result } = renderHook(() =>
          useAppStore((state) => state.streamingMessages),
        );

        expect(result.current).toEqual([]);
      });

      it("pendingPermissionがnullの場合、正常に取得できる", () => {
        useAppStore.setState({ pendingPermission: null });

        const { result } = renderHook(() =>
          useAppStore((state) => state.pendingPermission),
        );

        expect(result.current).toBeNull();
      });
    });
  });

  // ===========================================================================
  // 境界値テスト
  // ===========================================================================
  describe("境界値テスト", () => {
    it("空文字列のエラーメッセージを正しく処理する", async () => {
      useAppStore.setState({ error: "" });

      const { result } = renderHook(() => useAppStore((state) => state.error));

      expect(result.current).toBe("");
      // 空文字列はfalsyだが、nullとは異なる
      expect(result.current !== null).toBe(true);
    });

    it("非常に長いエラーメッセージを処理できる", () => {
      const longError = "a".repeat(10000);
      useAppStore.setState({ error: longError });

      const { result } = renderHook(() => useAppStore((state) => state.error));

      expect(result.current).toBe(longError);
      expect(result.current?.length).toBe(10000);
    });

    it("大量のプロバイダーを処理できる", () => {
      const manyProviders = Array.from({ length: 100 }, (_, i) => ({
        id: `provider-${i}`,
        name: `Provider ${i}`,
        models: [],
      }));

      useAppStore.setState({ providers: manyProviders });

      const { result } = renderHook(() =>
        useAppStore((state) => state.providers),
      );

      expect(result.current).toHaveLength(100);
      expect(result.current[0].id).toBe("provider-0");
      expect(result.current[99].id).toBe("provider-99");
    });

    it("大量のスキルメタデータを処理できる", () => {
      const manySkills = Array.from({ length: 100 }, (_, i) => ({
        name: `skill-${i}`,
        description: `Skill ${i}`,
        path: `~/.claude/skills/skill-${i}`,
        updatedAt: new Date(),
        agents: [],
        references: [],
        scripts: [],
        assets: [],
        schemas: [],
        indexes: [],
        otherFiles: [],
      }));

      useAppStore.setState({ availableSkillsMetadata: manySkills });

      const { result } = renderHook(() =>
        useAppStore((state) => state.availableSkillsMetadata),
      );

      expect(result.current).toHaveLength(100);
    });

    it("大量のストリーミングメッセージを処理できる", () => {
      const manyMessages = Array.from({ length: 1000 }, (_, i) => ({
        executionId: "exec-1",
        type: "assistant" as const,
        content: { text: `Message ${i}`, isPartial: false },
        timestamp: Date.now() + i,
      }));

      useAppStore.setState({ streamingMessages: manyMessages });

      const { result } = renderHook(() =>
        useAppStore((state) => state.streamingMessages),
      );

      expect(result.current).toHaveLength(1000);
    });
  });

  // ===========================================================================
  // 状態遷移テスト
  // ===========================================================================
  describe("状態遷移テスト", () => {
    it("ローディング状態からエラー状態への遷移", async () => {
      const { result } = renderHook(() => ({
        isLoading: useAppStore((state) => state.isLoading),
        error: useAppStore((state) => state.error),
      }));

      // 初期状態
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // ローディング開始
      await act(async () => {
        useAppStore.setState({ isLoading: true });
      });
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      // エラー発生
      await act(async () => {
        useAppStore.setState({ isLoading: false, error: "Failed" });
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Failed");

      // エラークリア
      await act(async () => {
        useAppStore.setState({ error: null });
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("スキル実行状態の遷移", async () => {
      const { result } = renderHook(() => ({
        isExecuting: useAppStore((state) => state.isExecuting),
        executionId: useAppStore((state) => state.executionId),
        skillExecutionStatus: useAppStore(
          (state) => state.skillExecutionStatus,
        ),
      }));

      // 初期状態
      expect(result.current.isExecuting).toBe(false);
      expect(result.current.executionId).toBeNull();
      expect(result.current.skillExecutionStatus).toBeNull();

      // 実行開始
      await act(async () => {
        useAppStore.setState({
          isExecuting: true,
          executionId: "exec-123",
          skillExecutionStatus: "running",
        });
      });
      expect(result.current.isExecuting).toBe(true);
      expect(result.current.executionId).toBe("exec-123");
      expect(result.current.skillExecutionStatus).toBe("running");

      // 実行完了
      await act(async () => {
        useAppStore.setState({
          isExecuting: false,
          skillExecutionStatus: "completed",
        });
      });
      expect(result.current.isExecuting).toBe(false);
      expect(result.current.executionId).toBe("exec-123"); // IDは残る
      expect(result.current.skillExecutionStatus).toBe("completed");
    });

    it("認証モード変更の遷移（確認ダイアログを経由）", async () => {
      const { result } = renderHook(() => ({
        mode: useAppStore((state) => state.mode),
        isConfirmDialogOpen: useAppStore((state) => state.isConfirmDialogOpen),
        pendingMode: useAppStore((state) => state.pendingMode),
      }));

      // 初期状態
      expect(result.current.mode).toBe("subscription");
      expect(result.current.isConfirmDialogOpen).toBe(false);
      expect(result.current.pendingMode).toBeNull();

      // 確認ダイアログを開く
      await act(async () => {
        useAppStore.setState({
          isConfirmDialogOpen: true,
          pendingMode: "api-key",
        });
      });
      expect(result.current.mode).toBe("subscription"); // まだ変更されていない
      expect(result.current.isConfirmDialogOpen).toBe(true);
      expect(result.current.pendingMode).toBe("api-key");

      // 変更を確定
      await act(async () => {
        useAppStore.setState({
          mode: "api-key",
          isConfirmDialogOpen: false,
          pendingMode: null,
        });
      });
      expect(result.current.mode).toBe("api-key");
      expect(result.current.isConfirmDialogOpen).toBe(false);
      expect(result.current.pendingMode).toBeNull();
    });
  });

  // ===========================================================================
  // 型安全性テスト
  // ===========================================================================
  describe("型安全性テスト", () => {
    it("認証モードは正しい型のみ受け付ける", () => {
      // subscription
      useAppStore.setState({ mode: "subscription" });
      let result = renderHook(() => useAppStore((state) => state.mode));
      expect(result.result.current).toBe("subscription");

      // api-key
      useAppStore.setState({ mode: "api-key" });
      result = renderHook(() => useAppStore((state) => state.mode));
      expect(result.result.current).toBe("api-key");
    });

    it("boolean状態は正しい型で取得できる", () => {
      useAppStore.setState({
        isLoading: true,
        isExecuting: true,
        isConfirmDialogOpen: true,
      });

      const { result } = renderHook(() => ({
        isLoading: useAppStore((state) => state.isLoading),
        isExecuting: useAppStore((state) => state.isExecuting),
        isConfirmDialogOpen: useAppStore((state) => state.isConfirmDialogOpen),
      }));

      expect(typeof result.current.isLoading).toBe("boolean");
      expect(typeof result.current.isExecuting).toBe("boolean");
      expect(typeof result.current.isConfirmDialogOpen).toBe("boolean");
    });

    it("配列状態は正しい型で取得できる", () => {
      useAppStore.setState({
        providers: [],
        streamingMessages: [],
        availableSkillsMetadata: [],
      });

      const { result } = renderHook(() => ({
        providers: useAppStore((state) => state.providers),
        streamingMessages: useAppStore((state) => state.streamingMessages),
        availableSkillsMetadata: useAppStore(
          (state) => state.availableSkillsMetadata,
        ),
      }));

      expect(Array.isArray(result.current.providers)).toBe(true);
      expect(Array.isArray(result.current.streamingMessages)).toBe(true);
      expect(Array.isArray(result.current.availableSkillsMetadata)).toBe(true);
    });
  });

  // ===========================================================================
  // 同時更新テスト
  // ===========================================================================
  describe("同時更新テスト", () => {
    it("複数の状態を同時に更新できる", async () => {
      const { result } = renderHook(() => ({
        mode: useAppStore((state) => state.mode),
        isLoading: useAppStore((state) => state.isLoading),
        selectedProviderId: useAppStore((state) => state.selectedProviderId),
      }));

      await act(async () => {
        useAppStore.setState({
          mode: "api-key",
          isLoading: true,
          selectedProviderId: "provider-1",
        });
      });

      expect(result.current.mode).toBe("api-key");
      expect(result.current.isLoading).toBe(true);
      expect(result.current.selectedProviderId).toBe("provider-1");
    });

    it("連続した更新が正しく反映される", async () => {
      const { result } = renderHook(() => useAppStore((state) => state.mode));

      // 連続更新
      await act(async () => {
        useAppStore.setState({ mode: "api-key" });
      });
      expect(result.current).toBe("api-key");

      await act(async () => {
        useAppStore.setState({ mode: "subscription" });
      });
      expect(result.current).toBe("subscription");

      await act(async () => {
        useAppStore.setState({ mode: "api-key" });
      });
      expect(result.current).toBe("api-key");
    });

    it("部分的な状態更新が他の状態に影響しない", async () => {
      // 初期状態を設定
      useAppStore.setState({
        mode: "subscription",
        selectedProviderId: "provider-1",
        selectedSkillName: "skill-1",
      });

      const { result } = renderHook(() => ({
        mode: useAppStore((state) => state.mode),
        selectedProviderId: useAppStore((state) => state.selectedProviderId),
        selectedSkillName: useAppStore((state) => state.selectedSkillName),
      }));

      // 一部の状態のみ更新
      await act(async () => {
        useAppStore.setState({ mode: "api-key" });
      });

      expect(result.current.mode).toBe("api-key");
      expect(result.current.selectedProviderId).toBe("provider-1"); // 変更なし
      expect(result.current.selectedSkillName).toBe("skill-1"); // 変更なし
    });
  });
});
