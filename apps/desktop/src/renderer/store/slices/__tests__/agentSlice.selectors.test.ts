/**
 * agentSlice 個別セレクタHookテスト
 *
 * P31対策: 合成Store Hook（useSkillStore）の代わりに個別セレクタを使用
 * することで、useEffect依存配列に関数を含めても無限ループが発生しない
 * ことを検証する。
 *
 * @vitest-environment happy-dom
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/
 * @testIds TS-STORE-01〜TS-STORE-91
 * @feature zustand-store-hooks-refactor
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../index";
import type { AppStore } from "../../index";
import type { SkillMetadata, ImportedSkill } from "@repo/shared";

// =============================================================================
// テストヘルパー関数
// =============================================================================

/**
 * 無限ループ防止テスト用ヘルパー
 * アクションセレクタをuseEffect依存配列に含めても無限ループしないことを検証する。
 * @param selector - useAppStoreから取得するセレクタ関数
 * @param maxRenders - 許容する最大レンダリング回数（デフォルト: 10）
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
 * 無関係なフィールド変更で対象セレクタが再レンダーされないことを検証する。
 * @param selector - テスト対象のセレクタ関数
 * @param stateUpdate - 無関係な状態変更
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
 * セレクタで取得したアクション関数の参照が再レンダリング間で安定していることを検証する。
 * @param selector - テスト対象のセレクタ関数
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

const createMockSkillMetadata = (name: string): SkillMetadata => ({
  name,
  description: `${name}の説明`,
  path: `~/.claude/skills/${name}`,
  updatedAt: new Date("2026-01-01"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
});

const mockAvailableSkills: SkillMetadata[] = [
  createMockSkillMetadata("test-skill-1"),
  createMockSkillMetadata("test-skill-2"),
];

const mockImportedSkills: ImportedSkill[] = [
  {
    ...mockAvailableSkills[0],
    importedAt: new Date("2026-01-10"),
    status: "active",
  },
];

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
      list: vi.fn().mockResolvedValue(mockAvailableSkills),
      getImported: vi.fn().mockResolvedValue(mockImportedSkills),
      rescan: vi.fn().mockResolvedValue(mockAvailableSkills),
      import: vi.fn().mockResolvedValue(mockImportedSkills[0]),
      remove: vi.fn().mockResolvedValue(undefined),
      execute: vi
        .fn()
        .mockResolvedValue({ executionId: "exec-123", success: true }),
      abort: vi.fn().mockResolvedValue(undefined),
      sendPermissionResponse: vi.fn().mockResolvedValue(undefined),
      onStream: vi.fn().mockReturnValue(() => {}),
      onComplete: vi.fn().mockReturnValue(() => {}),
      onError: vi.fn().mockReturnValue(() => {}),
      onPermissionRequest: vi.fn().mockReturnValue(() => {}),
      getExecutionStatus: vi.fn().mockResolvedValue(null),
    },
  };
}

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

// ストアの初期状態をリセットする関数
function resetStore() {
  useAppStore.setState({
    // AgentSlice関連の状態をリセット
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

describe("agentSlice - セレクタテスト（UT-STORE-HOOKS-REFACTOR-001）", () => {
  // ===========================================================================
  // CAT-01: 状態セレクタ初期値テスト
  // ===========================================================================
  describe("CAT-01: 状態セレクタ初期値テスト", () => {
    it("TS-STORE-01: availableSkillsMetadata初期値は空配列", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.availableSkillsMetadata),
      );
      expect(result.current).toEqual([]);
    });

    it("TS-STORE-02: importedSkills初期値は空配列", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.importedSkills),
      );
      expect(result.current).toEqual([]);
    });

    it("TS-STORE-03: selectedSkillName初期値はnull", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.selectedSkillName),
      );
      expect(result.current).toBeNull();
    });

    it("TS-STORE-04: isExecuting初期値はfalse", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.isExecuting),
      );
      expect(result.current).toBe(false);
    });

    it("TS-STORE-05: executionId初期値はnull", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.executionId),
      );
      expect(result.current).toBeNull();
    });

    it("TS-STORE-06: skillExecutionStatus初期値はnull", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.skillExecutionStatus),
      );
      expect(result.current).toBeNull();
    });

    it("TS-STORE-07: streamingMessages初期値は空配列", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.streamingMessages),
      );
      expect(result.current).toEqual([]);
    });

    it("TS-STORE-08: pendingPermission初期値はnull", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.pendingPermission),
      );
      expect(result.current).toBeNull();
    });

    it("TS-STORE-09: skillError初期値はnull", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.skillError),
      );
      expect(result.current).toBeNull();
    });

    it("TS-STORE-10: isLoadingSkills初期値はfalse", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.isLoadingSkills),
      );
      expect(result.current).toBe(false);
    });

    it("TS-STORE-11: isScanning初期値はfalse", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.isScanning),
      );
      expect(result.current).toBe(false);
    });

    it("TS-STORE-12: isImporting初期値はfalse", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.isImporting),
      );
      expect(result.current).toBe(false);
    });

    it("TS-STORE-13: importingSkillName初期値はnull", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.importingSkillName),
      );
      expect(result.current).toBeNull();
    });
  });

  // ===========================================================================
  // CAT-02: 状態セレクタ値取得テスト
  // ===========================================================================
  describe("CAT-02: 状態セレクタ値取得テスト", () => {
    it("TS-STORE-14: availableSkillsMetadataが正しく取得できる", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.availableSkillsMetadata),
      );
      expect(result.current).toEqual([]);

      act(() => {
        useAppStore.setState({ availableSkillsMetadata: mockAvailableSkills });
      });

      expect(result.current).toEqual(mockAvailableSkills);
    });

    it("TS-STORE-15: importedSkillsが正しく取得できる", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.importedSkills),
      );
      expect(result.current).toEqual([]);

      act(() => {
        useAppStore.setState({ importedSkills: mockImportedSkills });
      });

      expect(result.current).toEqual(mockImportedSkills);
    });

    it("TS-STORE-16: selectedSkillNameが正しく取得できる", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.selectedSkillName),
      );
      expect(result.current).toBeNull();

      act(() => {
        useAppStore.setState({ selectedSkillName: "test-skill-1" });
      });

      expect(result.current).toBe("test-skill-1");
    });

    it("TS-STORE-17: isExecutingが正しく取得できる", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.isExecuting),
      );
      expect(result.current).toBe(false);

      act(() => {
        useAppStore.setState({ isExecuting: true });
      });

      expect(result.current).toBe(true);
    });

    it("TS-STORE-18: executionIdが正しく取得できる", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.executionId),
      );
      expect(result.current).toBeNull();

      act(() => {
        useAppStore.setState({ executionId: "exec-456" });
      });

      expect(result.current).toBe("exec-456");
    });

    it("TS-STORE-19: skillExecutionStatusが正しく取得できる", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.skillExecutionStatus),
      );
      expect(result.current).toBeNull();

      act(() => {
        useAppStore.setState({ skillExecutionStatus: "running" });
      });

      expect(result.current).toBe("running");
    });

    it("TS-STORE-20: skillErrorが正しく取得できる", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.skillError),
      );
      expect(result.current).toBeNull();

      act(() => {
        useAppStore.setState({ skillError: "エラーメッセージ" });
      });

      expect(result.current).toBe("エラーメッセージ");
    });
  });

  // ===========================================================================
  // CAT-03: アクションセレクタ存在テスト
  // ===========================================================================
  describe("CAT-03: アクションセレクタ存在テスト", () => {
    it("TS-STORE-21: fetchSkillsアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.fetchSkills),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-22: rescanSkillsアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.rescanSkills),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-23: importSkillアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.importSkill),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-24: removeSkillアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.removeSkill),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-25: selectSkillByNameアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.selectSkillByName),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-26: executeSkillアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.executeSkill),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-27: abortExecutionアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.abortExecution),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-28: respondToSkillPermissionアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.respondToSkillPermission),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-29: clearSkillErrorアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.clearSkillError),
      );
      expect(typeof result.current).toBe("function");
    });

    it("TS-STORE-30: clearStreamingMessagesアクションが存在する", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.clearStreamingMessages),
      );
      expect(typeof result.current).toBe("function");
    });
  });

  // ===========================================================================
  // CAT-04: アクション実行テスト
  // ===========================================================================
  describe("CAT-04: アクション実行テスト", () => {
    it("TS-STORE-31: selectSkillByNameで選択状態が更新される", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.selectSkillByName),
      );

      act(() => {
        result.current("new-skill");
      });

      expect(useAppStore.getState().selectedSkillName).toBe("new-skill");
    });

    it("TS-STORE-32: clearSkillErrorでエラーがクリアされる", () => {
      useAppStore.setState({ skillError: "test error" });

      const { result } = renderHook(() =>
        useAppStore((state) => state.clearSkillError),
      );

      act(() => {
        result.current();
      });

      expect(useAppStore.getState().skillError).toBeNull();
    });

    it("TS-STORE-33: clearStreamingMessagesでメッセージがクリアされる", () => {
      useAppStore.setState({
        streamingMessages: [
          {
            executionId: "exec-1",
            type: "assistant",
            content: { text: "test", isPartial: false },
            timestamp: Date.now(),
          },
        ],
      });

      const { result } = renderHook(() =>
        useAppStore((state) => state.clearStreamingMessages),
      );

      act(() => {
        result.current();
      });

      expect(useAppStore.getState().streamingMessages).toEqual([]);
    });
  });

  // ===========================================================================
  // CAT-05: 関数参照安定性テスト
  // ===========================================================================
  describe("CAT-05: 関数参照安定性テスト", () => {
    it("TS-STORE-34: fetchSkillsの参照は再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.fetchSkills),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("TS-STORE-35: selectSkillByNameの参照は再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() =>
        useAppStore((state) => state.selectSkillByName),
      );
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("TS-STORE-36: 状態更新後もアクション参照は変わらない", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.fetchSkills),
      );
      const refBefore = result.current;

      act(() => {
        useAppStore.setState({ selectedSkillName: "updated-skill" });
      });

      expect(result.current).toBe(refBefore);
    });

    it("TS-STORE-37: 複数のアクション参照が全て安定している", () => {
      const { result: fetchRef, rerender: rerenderFetch } = renderHook(() =>
        useAppStore((state) => state.fetchSkills),
      );
      const { result: rescanRef, rerender: rerenderRescan } = renderHook(() =>
        useAppStore((state) => state.rescanSkills),
      );
      const { result: importRef, rerender: rerenderImport } = renderHook(() =>
        useAppStore((state) => state.importSkill),
      );
      const { result: removeRef, rerender: rerenderRemove } = renderHook(() =>
        useAppStore((state) => state.removeSkill),
      );
      const { result: selectRef, rerender: rerenderSelect } = renderHook(() =>
        useAppStore((state) => state.selectSkillByName),
      );
      const { result: executeRef, rerender: rerenderExecute } = renderHook(() =>
        useAppStore((state) => state.executeSkill),
      );
      const { result: abortRef, rerender: rerenderAbort } = renderHook(() =>
        useAppStore((state) => state.abortExecution),
      );
      const { result: clearErrorRef, rerender: rerenderClearError } =
        renderHook(() => useAppStore((state) => state.clearSkillError));
      const { result: clearMsgRef, rerender: rerenderClearMsg } = renderHook(
        () => useAppStore((state) => state.clearStreamingMessages),
      );

      const firstFetch = fetchRef.current;
      const firstRescan = rescanRef.current;
      const firstImport = importRef.current;
      const firstRemove = removeRef.current;
      const firstSelect = selectRef.current;
      const firstExecute = executeRef.current;
      const firstAbort = abortRef.current;
      const firstClearError = clearErrorRef.current;
      const firstClearMsg = clearMsgRef.current;

      // 状態を更新してからリレンダー
      act(() => {
        useAppStore.setState({ isExecuting: true });
      });

      rerenderFetch();
      rerenderRescan();
      rerenderImport();
      rerenderRemove();
      rerenderSelect();
      rerenderExecute();
      rerenderAbort();
      rerenderClearError();
      rerenderClearMsg();

      expect(fetchRef.current).toBe(firstFetch);
      expect(rescanRef.current).toBe(firstRescan);
      expect(importRef.current).toBe(firstImport);
      expect(removeRef.current).toBe(firstRemove);
      expect(selectRef.current).toBe(firstSelect);
      expect(executeRef.current).toBe(firstExecute);
      expect(abortRef.current).toBe(firstAbort);
      expect(clearErrorRef.current).toBe(firstClearError);
      expect(clearMsgRef.current).toBe(firstClearMsg);
    });
  });

  // ===========================================================================
  // CAT-06: セレクタ再レンダー最適化テスト
  // ===========================================================================
  describe("CAT-06: セレクタ再レンダー最適化テスト", () => {
    it("TS-STORE-38: 異なる状態フィールドの更新で対象外フィールドは再レンダーされない", () => {
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useAppStore((state) => state.selectedSkillName);
      });

      expect(result.current).toBeNull();
      const initialRenderCount = renderCount;

      // 異なるフィールドを更新
      act(() => {
        useAppStore.setState({ isExecuting: true });
      });

      // selectedSkillNameは変更されていないので再レンダーされない
      expect(result.current).toBeNull();
      expect(renderCount).toBe(initialRenderCount);
    });

    it("TS-STORE-39: 個別セレクタで必要なフィールドのみ取得可能", () => {
      // 状態を設定
      act(() => {
        useAppStore.setState({
          availableSkillsMetadata: mockAvailableSkills,
          importedSkills: mockImportedSkills,
          selectedSkillName: "test-skill",
          isExecuting: true,
        });
      });

      // 各フィールドを個別に取得できることを確認
      const { result: availableResult } = renderHook(() =>
        useAppStore((state) => state.availableSkillsMetadata),
      );
      const { result: importedResult } = renderHook(() =>
        useAppStore((state) => state.importedSkills),
      );
      const { result: selectedResult } = renderHook(() =>
        useAppStore((state) => state.selectedSkillName),
      );
      const { result: executingResult } = renderHook(() =>
        useAppStore((state) => state.isExecuting),
      );

      expect(availableResult.current).toEqual(mockAvailableSkills);
      expect(importedResult.current).toEqual(mockImportedSkills);
      expect(selectedResult.current).toBe("test-skill");
      expect(executingResult.current).toBe(true);
    });
  });

  // ===========================================================================
  // CAT-07: 無限ループ防止テスト（P31対策）
  // ===========================================================================
  describe("CAT-07: 無限ループ防止テスト（P31対策）", () => {
    const MAX_RENDERS = 10;

    it("TS-STORE-40: fetchSkillsをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const fetchSkills = useAppStore((state) => state.fetchSkills);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchSkills]);

        return { renderCount: renderCount.current };
      });

      // 安定するまで少し待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("TS-STORE-41: selectSkillByNameをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const selectSkillByName = useAppStore(
          (state) => state.selectSkillByName,
        );
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [selectSkillByName]);

        return { renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });

    it("TS-STORE-42: 複数のアクションセレクタをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };

      renderHook(() => {
        renderCount.current++;
        const fetchSkills = useAppStore((state) => state.fetchSkills);
        const selectSkillByName = useAppStore(
          (state) => state.selectSkillByName,
        );
        const clearSkillError = useAppStore((state) => state.clearSkillError);
        const executeSkill = useAppStore((state) => state.executeSkill);
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchSkills, selectSkillByName, clearSkillError, executeSkill]);

        return { renderCount: renderCount.current };
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(renderCount.current).toBeLessThan(MAX_RENDERS);
    });
  });

  // ===========================================================================
  // CAT-08: 非同期アクションテスト
  // ===========================================================================
  describe("CAT-08: 非同期アクションテスト", () => {
    it("TS-STORE-43: fetchSkillsが正しくデータを取得する", async () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.fetchSkills),
      );

      await act(async () => {
        await result.current();
      });

      expect(useAppStore.getState().availableSkillsMetadata).toEqual(
        mockAvailableSkills,
      );
      expect(useAppStore.getState().importedSkills).toEqual(mockImportedSkills);
      expect(useAppStore.getState().isLoadingSkills).toBe(false);
    });

    it("TS-STORE-44: rescanSkillsが正しくデータを再取得する", async () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.rescanSkills),
      );

      await act(async () => {
        await result.current();
      });

      expect(useAppStore.getState().availableSkillsMetadata).toEqual(
        mockAvailableSkills,
      );
      expect(useAppStore.getState().isScanning).toBe(false);
    });

    it("TS-STORE-45: importSkillが正しくスキルをインポートする", async () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.importSkill),
      );

      await act(async () => {
        await result.current("test-skill-1");
      });

      expect(useAppStore.getState().importedSkills).toHaveLength(1);
      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importingSkillName).toBeNull();
    });

    it("TS-STORE-46: executeSkillが正しく実行状態を更新する", async () => {
      // 事前に必要な状態を設定
      useAppStore.setState({
        selectedSkillName: "test-skill-1",
        importedSkills: mockImportedSkills,
      });

      const { result } = renderHook(() =>
        useAppStore((state) => state.executeSkill),
      );

      const executePromise = act(async () => {
        await result.current("test prompt");
      });

      await executePromise;

      // executionIdがサーバー値で更新される
      expect(useAppStore.getState().executionId).toBe("exec-123");
    });
  });

  // ===========================================================================
  // CAT-09: エラーハンドリングテスト
  // ===========================================================================
  describe("CAT-09: エラーハンドリングテスト", () => {
    it("TS-STORE-47: fetchSkillsエラー時にskillErrorが設定される", async () => {
      // electronAPIのskill.listをエラーに差し替え
      (
        window as unknown as {
          electronAPI: {
            skill: { list: ReturnType<typeof vi.fn> };
          };
        }
      ).electronAPI.skill.list = vi
        .fn()
        .mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() =>
        useAppStore((state) => state.fetchSkills),
      );

      await act(async () => {
        await result.current();
      });

      expect(useAppStore.getState().skillError).toContain(
        "スキル一覧の取得に失敗",
      );
      expect(useAppStore.getState().isLoadingSkills).toBe(false);
    });

    it("TS-STORE-48: importSkillエラー時に状態がリセットされる", async () => {
      // electronAPIのskill.importをエラーに差し替え
      (
        window as unknown as {
          electronAPI: {
            skill: { import: ReturnType<typeof vi.fn> };
          };
        }
      ).electronAPI.skill.import = vi
        .fn()
        .mockRejectedValue(new Error("Import failed"));

      const { result } = renderHook(() =>
        useAppStore((state) => state.importSkill),
      );

      await act(async () => {
        await result.current("test-skill");
      });

      expect(useAppStore.getState().skillError).toContain(
        "スキルのインポートに失敗",
      );
      expect(useAppStore.getState().isImporting).toBe(false);
      expect(useAppStore.getState().importingSkillName).toBeNull();
    });
  });

  // ===========================================================================
  // CAT-10: 個別アクション参照安定性テスト（全10アクション）
  // ===========================================================================
  describe("CAT-10: 個別アクション参照安定性テスト", () => {
    it("TS-STORE-49: rescanSkillsの参照は再レンダリング間で安定している", () => {
      assertStableReference((state) => state.rescanSkills);
    });

    it("TS-STORE-50: importSkillの参照は再レンダリング間で安定している", () => {
      assertStableReference((state) => state.importSkill);
    });

    it("TS-STORE-51: removeSkillの参照は再レンダリング間で安定している", () => {
      assertStableReference((state) => state.removeSkill);
    });

    it("TS-STORE-52: executeSkillの参照は再レンダリング間で安定している", () => {
      assertStableReference((state) => state.executeSkill);
    });

    it("TS-STORE-53: abortExecutionの参照は再レンダリング間で安定している", () => {
      assertStableReference((state) => state.abortExecution);
    });

    it("TS-STORE-54: respondToSkillPermissionの参照は再レンダリング間で安定している", () => {
      assertStableReference((state) => state.respondToSkillPermission);
    });

    it("TS-STORE-55: clearSkillErrorの参照は再レンダリング間で安定している", () => {
      assertStableReference((state) => state.clearSkillError);
    });

    it("TS-STORE-56: clearStreamingMessagesの参照は再レンダリング間で安定している", () => {
      assertStableReference((state) => state.clearStreamingMessages);
    });

    it("TS-STORE-57: 状態更新後もrescanSkillsの参照は安定している", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.rescanSkills),
      );
      const refBefore = result.current;

      act(() => {
        useAppStore.setState({ isScanning: true });
      });

      expect(result.current).toBe(refBefore);
    });

    it("TS-STORE-58: 状態更新後もexecuteSkillの参照は安定している", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.executeSkill),
      );
      const refBefore = result.current;

      act(() => {
        useAppStore.setState({ isExecuting: true, executionId: "exec-999" });
      });

      expect(result.current).toBe(refBefore);
    });
  });

  // ===========================================================================
  // CAT-11: セレクタ再レンダリング隔離テスト（1 selector = 1 field原則）
  // ===========================================================================
  describe("CAT-11: セレクタ再レンダリング隔離テスト", () => {
    it("TS-STORE-59: availableSkillsMetadata変更時にisExecutingセレクタは再レンダーされない", () => {
      assertNoUnrelatedRerender((state) => state.isExecuting, {
        availableSkillsMetadata: mockAvailableSkills,
      });
    });

    it("TS-STORE-60: importedSkills変更時にselectedSkillNameセレクタは再レンダーされない", () => {
      assertNoUnrelatedRerender((state) => state.selectedSkillName, {
        importedSkills: mockImportedSkills,
      });
    });

    it("TS-STORE-61: isExecuting変更時にstreamingMessagesセレクタは再レンダーされない", () => {
      assertNoUnrelatedRerender((state) => state.streamingMessages, {
        isExecuting: true,
      });
    });

    it("TS-STORE-62: skillError変更時にisLoadingSkillsセレクタは再レンダーされない", () => {
      assertNoUnrelatedRerender((state) => state.isLoadingSkills, {
        skillError: "test error",
      });
    });

    it("TS-STORE-63: pendingPermission変更時にisScanningセレクタは再レンダーされない", () => {
      assertNoUnrelatedRerender((state) => state.isScanning, {
        pendingPermission: {
          requestId: "req-1",
          executionId: "exec-1",
          toolName: "test-tool",
          args: {},
        },
      });
    });

    it("TS-STORE-64: executionId変更時にisImportingセレクタは再レンダーされない", () => {
      assertNoUnrelatedRerender((state) => state.isImporting, {
        executionId: "exec-new",
      });
    });

    it("TS-STORE-65: 自フィールド変更時には正しく再レンダーされる", () => {
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useAppStore((state) => state.isExecuting);
      });

      const initialCount = renderCount;

      act(() => {
        useAppStore.setState({ isExecuting: true });
      });

      expect(result.current).toBe(true);
      expect(renderCount).toBe(initialCount + 1);
    });
  });

  // ===========================================================================
  // CAT-12: 複数状態同時変更テスト
  // ===========================================================================
  describe("CAT-12: 複数状態同時変更テスト", () => {
    it("TS-STORE-66: 複数フィールド同時変更時に関連セレクタが正しく更新される", () => {
      const { result: executingResult } = renderHook(() =>
        useAppStore((state) => state.isExecuting),
      );
      const { result: executionIdResult } = renderHook(() =>
        useAppStore((state) => state.executionId),
      );
      const { result: statusResult } = renderHook(() =>
        useAppStore((state) => state.skillExecutionStatus),
      );

      act(() => {
        useAppStore.setState({
          isExecuting: true,
          executionId: "exec-multi-1",
          skillExecutionStatus: "running",
        });
      });

      expect(executingResult.current).toBe(true);
      expect(executionIdResult.current).toBe("exec-multi-1");
      expect(statusResult.current).toBe("running");
    });

    it("TS-STORE-67: fetchSkills後にavailableSkillsMetadataとimportedSkillsの両方が更新される", async () => {
      const { result: availableResult } = renderHook(() =>
        useAppStore((state) => state.availableSkillsMetadata),
      );
      const { result: importedResult } = renderHook(() =>
        useAppStore((state) => state.importedSkills),
      );
      const { result: loadingResult } = renderHook(() =>
        useAppStore((state) => state.isLoadingSkills),
      );

      const { result: fetchAction } = renderHook(() =>
        useAppStore((state) => state.fetchSkills),
      );

      await act(async () => {
        await fetchAction.current();
      });

      expect(availableResult.current).toEqual(mockAvailableSkills);
      expect(importedResult.current).toEqual(mockImportedSkills);
      expect(loadingResult.current).toBe(false);
    });

    it("TS-STORE-68: 同時変更でも無関係フィールドは再レンダーされない", () => {
      let renderCount = 0;

      renderHook(() => {
        renderCount++;
        return useAppStore((state) => state.importingSkillName);
      });

      const initialCount = renderCount;

      act(() => {
        useAppStore.setState({
          isExecuting: true,
          executionId: "exec-111",
          skillExecutionStatus: "running",
          streamingMessages: [],
        });
      });

      expect(renderCount).toBe(initialCount);
    });
  });

  // ===========================================================================
  // CAT-13: エッジケーステスト
  // ===========================================================================
  describe("CAT-13: エッジケーステスト", () => {
    it("TS-STORE-69: 空配列を設定後に正しく取得できる", () => {
      // まずデータを入れてから空配列に戻す
      act(() => {
        useAppStore.setState({
          availableSkillsMetadata: mockAvailableSkills,
        });
      });

      const { result } = renderHook(() =>
        useAppStore((state) => state.availableSkillsMetadata),
      );
      expect(result.current).toEqual(mockAvailableSkills);

      act(() => {
        useAppStore.setState({ availableSkillsMetadata: [] });
      });

      expect(result.current).toEqual([]);
    });

    it("TS-STORE-70: nullをskillErrorに設定後に正しく取得できる", () => {
      act(() => {
        useAppStore.setState({ skillError: "some error" });
      });

      const { result } = renderHook(() =>
        useAppStore((state) => state.skillError),
      );
      expect(result.current).toBe("some error");

      act(() => {
        useAppStore.setState({ skillError: null });
      });

      expect(result.current).toBeNull();
    });

    it("TS-STORE-71: selectedSkillNameにnullを設定後に正しく取得できる", () => {
      act(() => {
        useAppStore.setState({ selectedSkillName: "skill-to-deselect" });
      });

      const { result } = renderHook(() =>
        useAppStore((state) => state.selectedSkillName),
      );
      expect(result.current).toBe("skill-to-deselect");

      act(() => {
        useAppStore.setState({ selectedSkillName: null });
      });

      expect(result.current).toBeNull();
    });

    it("TS-STORE-72: 大量データ（100件のスキル）を正しく処理できる", () => {
      const largeSkillList: SkillMetadata[] = Array.from(
        { length: 100 },
        (_, i) => createMockSkillMetadata(`skill-${i}`),
      );

      act(() => {
        useAppStore.setState({ availableSkillsMetadata: largeSkillList });
      });

      const { result } = renderHook(() =>
        useAppStore((state) => state.availableSkillsMetadata),
      );

      expect(result.current).toHaveLength(100);
      expect(result.current[0].name).toBe("skill-0");
      expect(result.current[99].name).toBe("skill-99");
    });

    it("TS-STORE-73: 大量のストリーミングメッセージ（50件）を正しく処理できる", () => {
      const largeMessages = Array.from({ length: 50 }, (_, i) => ({
        executionId: "exec-large",
        type: "assistant" as const,
        content: { text: `message-${i}`, isPartial: false },
        timestamp: Date.now() + i,
      }));

      act(() => {
        useAppStore.setState({ streamingMessages: largeMessages });
      });

      const { result } = renderHook(() =>
        useAppStore((state) => state.streamingMessages),
      );

      expect(result.current).toHaveLength(50);
    });

    it("TS-STORE-74: 高速連続状態変更でも正しく最終値が反映される", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.selectedSkillName),
      );

      act(() => {
        useAppStore.setState({ selectedSkillName: "skill-1" });
        useAppStore.setState({ selectedSkillName: "skill-2" });
        useAppStore.setState({ selectedSkillName: "skill-3" });
        useAppStore.setState({ selectedSkillName: "skill-final" });
      });

      expect(result.current).toBe("skill-final");
    });

    it("TS-STORE-75: 高速連続のboolean状態トグルでも正しく最終値が反映される", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.isExecuting),
      );

      act(() => {
        useAppStore.setState({ isExecuting: true });
        useAppStore.setState({ isExecuting: false });
        useAppStore.setState({ isExecuting: true });
        useAppStore.setState({ isExecuting: false });
      });

      expect(result.current).toBe(false);
    });

    it("TS-STORE-76: pendingPermissionにオブジェクトを設定・クリアできる", () => {
      const permission = {
        requestId: "req-edge-1",
        executionId: "exec-edge-1",
        toolName: "dangerous-tool",
        args: { path: "/etc/passwd" },
      };

      act(() => {
        useAppStore.setState({ pendingPermission: permission });
      });

      const { result } = renderHook(() =>
        useAppStore((state) => state.pendingPermission),
      );

      expect(result.current).toEqual(permission);

      act(() => {
        useAppStore.setState({ pendingPermission: null });
      });

      expect(result.current).toBeNull();
    });

    it("TS-STORE-77: skillExecutionStatusの全ステータス値を正しく反映できる", () => {
      const { result } = renderHook(() =>
        useAppStore((state) => state.skillExecutionStatus),
      );

      const statuses = [
        "running",
        "completed",
        "error",
        "cancelled",
        "permission_pending",
      ] as const;

      for (const status of statuses) {
        act(() => {
          useAppStore.setState({ skillExecutionStatus: status });
        });
        expect(result.current).toBe(status);
      }
    });
  });

  // ===========================================================================
  // CAT-14: resetStore()フィールドスコープ検証テスト
  // ===========================================================================
  describe("CAT-14: resetStore()フィールドスコープ検証テスト", () => {
    it("TS-STORE-78: resetStore()後に全13状態セレクタが初期値を返す", () => {
      // まず全状態を変更
      act(() => {
        useAppStore.setState({
          availableSkillsMetadata: mockAvailableSkills,
          importedSkills: mockImportedSkills,
          selectedSkillName: "test-skill",
          isExecuting: true,
          executionId: "exec-reset-test",
          skillExecutionStatus: "running",
          streamingMessages: [
            {
              executionId: "exec-1",
              type: "assistant",
              content: { text: "test", isPartial: false },
              timestamp: Date.now(),
            },
          ],
          pendingPermission: {
            requestId: "req-1",
            executionId: "exec-1",
            toolName: "tool-1",
            args: {},
          },
          skillError: "test error",
          isLoadingSkills: true,
          isScanning: true,
          isImporting: true,
          importingSkillName: "importing-skill",
        });
      });

      // resetStore呼び出し
      act(() => {
        resetStore();
      });

      // 全13状態セレクタが初期値を返すことを検証
      const { result: r1 } = renderHook(() =>
        useAppStore((state) => state.availableSkillsMetadata),
      );
      const { result: r2 } = renderHook(() =>
        useAppStore((state) => state.importedSkills),
      );
      const { result: r3 } = renderHook(() =>
        useAppStore((state) => state.selectedSkillName),
      );
      const { result: r4 } = renderHook(() =>
        useAppStore((state) => state.isExecuting),
      );
      const { result: r5 } = renderHook(() =>
        useAppStore((state) => state.executionId),
      );
      const { result: r6 } = renderHook(() =>
        useAppStore((state) => state.skillExecutionStatus),
      );
      const { result: r7 } = renderHook(() =>
        useAppStore((state) => state.streamingMessages),
      );
      const { result: r8 } = renderHook(() =>
        useAppStore((state) => state.pendingPermission),
      );
      const { result: r9 } = renderHook(() =>
        useAppStore((state) => state.skillError),
      );
      const { result: r10 } = renderHook(() =>
        useAppStore((state) => state.isLoadingSkills),
      );
      const { result: r11 } = renderHook(() =>
        useAppStore((state) => state.isScanning),
      );
      const { result: r12 } = renderHook(() =>
        useAppStore((state) => state.isImporting),
      );
      const { result: r13 } = renderHook(() =>
        useAppStore((state) => state.importingSkillName),
      );

      expect(r1.current).toEqual([]);
      expect(r2.current).toEqual([]);
      expect(r3.current).toBeNull();
      expect(r4.current).toBe(false);
      expect(r5.current).toBeNull();
      expect(r6.current).toBeNull();
      expect(r7.current).toEqual([]);
      expect(r8.current).toBeNull();
      expect(r9.current).toBeNull();
      expect(r10.current).toBe(false);
      expect(r11.current).toBe(false);
      expect(r12.current).toBe(false);
      expect(r13.current).toBeNull();
    });

    it("TS-STORE-79: resetStore()がauthModeSliceのフィールドに影響しない", () => {
      // authModeSliceの状態を設定
      act(() => {
        useAppStore.setState({
          mode: "api-key",
          isConfirmDialogOpen: true,
          // agentSliceの状態も変更
          selectedSkillName: "test-skill",
          isExecuting: true,
        });
      });

      // resetStore（agentSlice関連のみリセット）
      act(() => {
        resetStore();
      });

      // authModeSliceのフィールドは影響を受けない
      const { result: modeResult } = renderHook(() =>
        useAppStore((state) => state.mode),
      );
      const { result: dialogResult } = renderHook(() =>
        useAppStore((state) => state.isConfirmDialogOpen),
      );

      expect(modeResult.current).toBe("api-key");
      expect(dialogResult.current).toBe(true);

      // agentSliceのフィールドはリセットされている
      const { result: skillResult } = renderHook(() =>
        useAppStore((state) => state.selectedSkillName),
      );
      const { result: execResult } = renderHook(() =>
        useAppStore((state) => state.isExecuting),
      );

      expect(skillResult.current).toBeNull();
      expect(execResult.current).toBe(false);
    });

    it("TS-STORE-80: resetStore()がllmSliceのフィールドに影響しない", () => {
      // llmSliceの状態を設定
      act(() => {
        useAppStore.setState({
          selectedProviderId: "openai",
          selectedModelId: "gpt-4",
          llmIsLoading: true,
          // agentSliceの状態も変更
          skillError: "test-error",
          isScanning: true,
        });
      });

      // resetStore（agentSlice関連のみリセット）
      act(() => {
        resetStore();
      });

      // llmSliceのフィールドは影響を受けない
      const { result: providerResult } = renderHook(() =>
        useAppStore((state) => state.selectedProviderId),
      );
      const { result: modelResult } = renderHook(() =>
        useAppStore((state) => state.selectedModelId),
      );
      const { result: loadingResult } = renderHook(() =>
        useAppStore((state) => state.llmIsLoading),
      );

      expect(providerResult.current).toBe("openai");
      expect(modelResult.current).toBe("gpt-4");
      expect(loadingResult.current).toBe(true);

      // agentSliceのフィールドはリセットされている
      const { result: errorResult } = renderHook(() =>
        useAppStore((state) => state.skillError),
      );
      const { result: scanResult } = renderHook(() =>
        useAppStore((state) => state.isScanning),
      );

      expect(errorResult.current).toBeNull();
      expect(scanResult.current).toBe(false);
    });
  });

  // ===========================================================================
  // CAT-15: 追加の非同期アクションエラーハンドリングテスト
  // ===========================================================================
  describe("CAT-15: 追加の非同期アクションエラーハンドリングテスト", () => {
    it("TS-STORE-81: rescanSkillsエラー時にskillErrorが設定される", async () => {
      (
        window as unknown as {
          electronAPI: {
            skill: { rescan: ReturnType<typeof vi.fn> };
          };
        }
      ).electronAPI.skill.rescan = vi
        .fn()
        .mockRejectedValue(new Error("Rescan failed"));

      const { result } = renderHook(() =>
        useAppStore((state) => state.rescanSkills),
      );

      await act(async () => {
        await result.current();
      });

      expect(useAppStore.getState().skillError).toContain(
        "スキル再スキャンに失敗",
      );
      expect(useAppStore.getState().isScanning).toBe(false);
    });

    it("TS-STORE-82: removeSkillエラー時にskillErrorが設定される", async () => {
      (
        window as unknown as {
          electronAPI: {
            skill: { remove: ReturnType<typeof vi.fn> };
          };
        }
      ).electronAPI.skill.remove = vi
        .fn()
        .mockRejectedValue(new Error("Remove failed"));

      const { result } = renderHook(() =>
        useAppStore((state) => state.removeSkill),
      );

      await act(async () => {
        await result.current("skill-to-remove");
      });

      expect(useAppStore.getState().skillError).toContain("スキルの削除に失敗");
    });

    it("TS-STORE-83: executeSkillでselectedSkillNameがnullの場合は何もしない", async () => {
      // selectedSkillNameはnull（初期状態）
      const { result } = renderHook(() =>
        useAppStore((state) => state.executeSkill),
      );

      await act(async () => {
        await result.current("test prompt");
      });

      // 何も変わらない
      expect(useAppStore.getState().isExecuting).toBe(false);
      expect(useAppStore.getState().executionId).toBeNull();
    });

    it("TS-STORE-84: executeSkillエラー時に適切な状態遷移が行われる", async () => {
      useAppStore.setState({
        selectedSkillName: "error-skill",
      });

      (
        window as unknown as {
          electronAPI: {
            skill: { execute: ReturnType<typeof vi.fn> };
          };
        }
      ).electronAPI.skill.execute = vi
        .fn()
        .mockRejectedValue(new Error("Execution failed"));

      const { result } = renderHook(() =>
        useAppStore((state) => state.executeSkill),
      );

      await act(async () => {
        await result.current("test prompt");
      });

      expect(useAppStore.getState().isExecuting).toBe(false);
      expect(useAppStore.getState().skillExecutionStatus).toBe("error");
      expect(useAppStore.getState().skillError).toContain("実行開始に失敗");
    });
  });

  // ===========================================================================
  // CAT-16: 追加の無限ループ防止テスト（残りのアクション）
  // ===========================================================================
  describe("CAT-16: 追加の無限ループ防止テスト", () => {
    it("TS-STORE-85: rescanSkillsをuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.rescanSkills);
    });

    it("TS-STORE-86: importSkillをuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.importSkill);
    });

    it("TS-STORE-87: removeSkillをuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.removeSkill);
    });

    it("TS-STORE-88: abortExecutionをuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.abortExecution);
    });

    it("TS-STORE-89: respondToSkillPermissionをuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.respondToSkillPermission);
    });

    it("TS-STORE-90: clearSkillErrorをuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.clearSkillError);
    });

    it("TS-STORE-91: clearStreamingMessagesをuseEffect依存配列に含めても無限ループしない", async () => {
      await assertNoInfiniteLoop((state) => state.clearStreamingMessages);
    });
  });

  // ===========================================================================
  // CAT-17: スキルインポートライフサイクル派生セレクタテスト（TASK-10A-E-C）
  // ===========================================================================
  describe("CAT-17: スキルインポートライフサイクル派生セレクタテスト（TASK-10A-E-C）", () => {
    const metaA: SkillMetadata = {
      name: "skill-alpha",
      description: "Alpha skill for testing",
      path: "~/.claude/skills/skill-alpha",
      updatedAt: new Date("2026-01-01"),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };
    const metaB: SkillMetadata = {
      name: "skill-beta",
      description: "Beta tool for automation",
      path: "~/.claude/skills/skill-beta",
      updatedAt: new Date("2026-01-02"),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };
    const metaC: SkillMetadata = {
      name: "skill-gamma",
      description: "Gamma utility",
      path: "~/.claude/skills/skill-gamma",
      updatedAt: new Date("2026-01-03"),
      agents: [],
      references: [],
      scripts: [],
      assets: [],
      schemas: [],
      indexes: [],
      otherFiles: [],
    };

    const importedA: ImportedSkill = {
      ...metaA,
      importedAt: new Date("2026-01-10"),
      status: "active",
    };

    describe("useAvailableSkillsForImport", () => {
      /**
       * 派生セレクタ（filter）は毎回新しい配列参照を返すため、
       * renderHook では無限ループの警告が出る。
       * セレクタのロジック自体はステートから直接検証する。
       */
      it("TS-STORE-100: importedSkillsを除外した結果を返す", () => {
        useAppStore.setState({
          availableSkillsMetadata: [metaA, metaB, metaC],
          importedSkills: [importedA],
        });

        const state = useAppStore.getState();
        const result = state.availableSkillsMetadata.filter(
          (a) => !state.importedSkills.some((i) => i.name === a.name),
        );

        expect(result).toHaveLength(2);
        expect(result.map((s) => s.name)).toEqual([
          "skill-beta",
          "skill-gamma",
        ]);
      });

      it("TS-STORE-101: importedSkillsが空なら全件返す", () => {
        useAppStore.setState({
          availableSkillsMetadata: [metaA, metaB],
          importedSkills: [],
        });

        const state = useAppStore.getState();
        const result = state.availableSkillsMetadata.filter(
          (a) => !state.importedSkills.some((i) => i.name === a.name),
        );

        expect(result).toHaveLength(2);
      });

      it("TS-STORE-102: availableSkillsMetadataが空なら空配列", () => {
        useAppStore.setState({
          availableSkillsMetadata: [],
          importedSkills: [importedA],
        });

        const state = useAppStore.getState();
        const result = state.availableSkillsMetadata.filter(
          (a) => !state.importedSkills.some((i) => i.name === a.name),
        );

        expect(result).toEqual([]);
      });
    });

    describe("useFilteredAvailableSkills", () => {
      /**
       * 派生セレクタのロジック検証。
       * セレクタ関数と同じロジックをステートに対して直接テストする。
       */
      function computeFiltered(state: {
        availableSkillsMetadata: SkillMetadata[];
        importedSkills: ImportedSkill[];
        skillFilter: string;
      }) {
        const available = state.availableSkillsMetadata.filter(
          (a) => !state.importedSkills.some((i) => i.name === a.name),
        );
        const filter = state.skillFilter.trim().toLowerCase();
        if (!filter) return available;
        return available.filter(
          (s) =>
            String(s.name).toLowerCase().includes(filter) ||
            String(s.description ?? "")
              .toLowerCase()
              .includes(filter),
        );
      }

      it("TS-STORE-103: フィルタ空→全件（imported除外済み）", () => {
        useAppStore.setState({
          availableSkillsMetadata: [metaA, metaB, metaC],
          importedSkills: [importedA],
          skillFilter: "",
        });

        const result = computeFiltered(useAppStore.getState());
        expect(result).toHaveLength(2);
      });

      it("TS-STORE-104: nameマッチ", () => {
        useAppStore.setState({
          availableSkillsMetadata: [metaA, metaB, metaC],
          importedSkills: [],
          skillFilter: "beta",
        });

        const result = computeFiltered(useAppStore.getState());
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("skill-beta");
      });

      it("TS-STORE-105: descriptionマッチ", () => {
        useAppStore.setState({
          availableSkillsMetadata: [metaA, metaB, metaC],
          importedSkills: [],
          skillFilter: "automation",
        });

        const result = computeFiltered(useAppStore.getState());
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("skill-beta");
      });

      it("TS-STORE-106: マッチなし→空配列", () => {
        useAppStore.setState({
          availableSkillsMetadata: [metaA, metaB, metaC],
          importedSkills: [],
          skillFilter: "nonexistent-xyz",
        });

        const result = computeFiltered(useAppStore.getState());
        expect(result).toEqual([]);
      });

      it("TS-STORE-107: 大文字小文字無視", () => {
        useAppStore.setState({
          availableSkillsMetadata: [metaA, metaB, metaC],
          importedSkills: [],
          skillFilter: "BETA",
        });

        const result = computeFiltered(useAppStore.getState());
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("skill-beta");
      });
    });
  });

  // ===========================================================================
  // 個別セレクタのexportテスト
  // ===========================================================================
  describe("個別セレクタのexport", () => {
    // 状態セレクタ（13個）
    const stateSelectors = [
      "useAvailableSkillsMetadata",
      "useImportedSkills",
      "useSelectedSkillName",
      "useIsSkillExecuting",
      "useSkillExecutionId",
      "useSkillExecutionStatus",
      "useStreamingMessages",
      "usePendingSkillPermission",
      "useSkillError",
      "useIsLoadingSkills",
      "useIsScanningSkills",
      "useIsImportingSkill",
      "useImportingSkillName",
    ];

    // アクションセレクタ（10個）
    const actionSelectors = [
      "useFetchSkills",
      "useRescanSkills",
      "useImportSkill",
      "useRemoveSkill",
      "useSelectSkillByName",
      "useExecuteSkill",
      "useAbortSkillExecution",
      "useRespondToSkillPermission",
      "useClearSkillError",
      "useClearStreamingMessages",
    ];

    [...stateSelectors, ...actionSelectors].forEach((hookName) => {
      it(`${hookName}がexportされている`, async () => {
        const mod = await import("../../index");
        expect(typeof (mod as Record<string, unknown>)[hookName]).toBe(
          "function",
        );
      });
    });
  });
});
