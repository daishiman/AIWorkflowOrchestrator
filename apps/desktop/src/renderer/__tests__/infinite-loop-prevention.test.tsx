/**
 * @file 無限ループ防止 総合テスト
 * @description UT-STORE-HOOKS-COMPONENT-MIGRATION-001
 *
 * このテストファイルは、Zustand Store Hooks の無限ループ問題（P31）に対する
 * 個別セレクタベースの解決策を包括的に検証します。
 *
 * テスト対象:
 * 1. LLMSelectorPanel - LLM 関連セレクタの無限ループ防止
 * 2. SkillSelector - スキル関連セレクタの無限ループ防止
 * 3. SettingsView - AuthMode 関連セレクタの無限ループ防止
 * 4. StrictMode 互換性 - useEffect 二重実行対応
 * 5. 高頻度状態更新 - 連続的な状態変更への耐性
 *
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-COMPONENT-MIGRATION-001/
 */

import React, { useEffect, useRef, StrictMode } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  renderHook,
  act,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useAppStore } from "@/renderer/store";

// ============================================
// 実際のセレクタをインポート
// ============================================

import {
  // LLM セレクタ
  useFetchProviders,
  useCheckLLMHealth,
  useLLMProviders,
  useSelectedProviderId,
  useSelectedModelId,
  useLLMIsLoading,
  useLLMError,
  useLLMHealthStatus,
  useSelectProvider,
  useSelectModel,
  // Skill セレクタ
  useRescanSkills,
  useSelectSkillByName,
  useFetchSkills,
  useImportSkill,
  useRemoveSkill,
  useExecuteSkill,
  useClearSkillError,
  useAvailableSkillsMetadata,
  useImportedSkills,
  useSelectedSkillName,
  useIsScanningSkills,
  useIsSkillExecuting,
  useSkillError,
  useIsLoadingSkills,
  useIsImportingSkill,
  // AuthMode セレクタ
  useInitializeAuthMode,
  useSetAuthMode,
  useFetchAuthMode,
  useAuthMode,
  useAuthModeStatus,
  useAuthModeLoading,
  useAuthModeError,
  useIsAuthModeValid,
} from "@/renderer/store";

// ============================================
// window.electronAPI モック
// ============================================

const mockElectronAPI = {
  llm: {
    getProviders: vi.fn(),
    checkHealth: vi.fn(),
    selectProvider: vi.fn(),
    selectModel: vi.fn(),
  },
  skill: {
    list: vi.fn(),
    getImported: vi.fn(),
    rescan: vi.fn(),
    import: vi.fn(),
    remove: vi.fn(),
    execute: vi.fn(),
    abort: vi.fn(),
    sendPermissionResponse: vi.fn(),
  },
  authMode: {
    get: vi.fn(),
    set: vi.fn(),
    status: vi.fn(),
    validate: vi.fn(),
    onModeChanged: vi.fn(),
  },
};

// ============================================
// テストセットアップ
// ============================================

describe("Infinite Loop Prevention Tests", () => {
  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();

    // window.electronAPI を設定
    Object.defineProperty(window, "electronAPI", {
      value: mockElectronAPI,
      writable: true,
      configurable: true,
    });

    // デフォルトモック応答を設定
    mockElectronAPI.llm.getProviders.mockResolvedValue([]);
    mockElectronAPI.llm.checkHealth.mockResolvedValue({
      status: "healthy",
      providerId: "openai",
      checkedAt: new Date(),
    });
    mockElectronAPI.skill.list.mockResolvedValue([]);
    mockElectronAPI.skill.getImported.mockResolvedValue([]);
    mockElectronAPI.skill.rescan.mockResolvedValue([]);
    mockElectronAPI.authMode.get.mockResolvedValue({
      success: true,
      data: { mode: "subscription" },
    });
    mockElectronAPI.authMode.status.mockResolvedValue({
      success: true,
      data: {
        mode: "subscription",
        isValid: true,
        message: "認証有効",
        lastCheckedAt: Date.now(),
      },
    });
    mockElectronAPI.authMode.validate.mockResolvedValue({
      success: true,
      data: { isValid: true },
    });
    mockElectronAPI.authMode.onModeChanged.mockReturnValue(() => {});

    // ストアの状態をリセット
    useAppStore.setState({
      // LLM
      providers: [],
      selectedProviderId: null,
      selectedModelId: null,
      llmIsLoading: false,
      llmError: null,
      healthStatus: {},
      // Skill
      availableSkillsMetadata: [],
      importedSkills: [],
      selectedSkillName: null,
      isScanning: false,
      isExecuting: false,
      skillError: null,
      isLoadingSkills: false,
      isImporting: false,
      importingSkillName: null,
      streamingMessages: [],
      pendingPermission: null,
      executionId: null,
      skillExecutionStatus: null,
      // AuthMode
      mode: "subscription",
      status: null,
      isLoading: false,
      error: null,
      isConfirmDialogOpen: false,
      pendingMode: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============================================
  // 1. LLMSelectorPanel 無限ループ防止テスト
  // ============================================

  describe("LLMSelectorPanel Infinite Loop Prevention", () => {
    describe("個別セレクタの参照安定性", () => {
      it("useFetchProviders は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useFetchProviders());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;
        rerender();
        const ref3 = result.current;

        expect(ref1).toBe(ref2);
        expect(ref2).toBe(ref3);
        expect(typeof ref1).toBe("function");
      });

      it("useCheckLLMHealth は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useCheckLLMHealth());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
        expect(typeof ref1).toBe("function");
      });

      it("useLLMProviders は providers が変更されない限り同じ参照を返す", () => {
        const { result, rerender } = renderHook(() => useLLMProviders());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
      });

      it("状態変更後もアクション関数の参照は維持される", () => {
        const { result: fetchResult, rerender: rerenderFetch } = renderHook(
          () => useFetchProviders(),
        );
        const { result: checkResult, rerender: rerenderCheck } = renderHook(
          () => useCheckLLMHealth(),
        );

        const fetchRefBefore = fetchResult.current;
        const checkRefBefore = checkResult.current;

        // 状態を変更
        act(() => {
          useAppStore.setState({ llmIsLoading: true });
        });

        rerenderFetch();
        rerenderCheck();

        expect(fetchResult.current).toBe(fetchRefBefore);
        expect(checkResult.current).toBe(checkRefBefore);
      });
    });

    describe("useEffect での使用シミュレーション", () => {
      it("個別セレクタを useEffect の依存配列に含めても無限ループしない", () => {
        let effectCount = 0;
        const maxRenders = 20;
        let renderCount = 0;

        const TestComponent: React.FC = () => {
          const fetchProviders = useFetchProviders();
          const checkHealth = useCheckLLMHealth();
          const providers = useLLMProviders();

          renderCount++;
          if (renderCount > maxRenders) {
            throw new Error(
              "Infinite loop detected in LLMSelectorPanel simulation!",
            );
          }

          useEffect(() => {
            effectCount++;
            // 通常の初期化処理をシミュレート
          }, [fetchProviders, checkHealth]);

          return (
            <div data-testid="llm-component">Providers: {providers.length}</div>
          );
        };

        render(<TestComponent />);

        // 無限ループしていない
        expect(renderCount).toBeLessThanOrEqual(maxRenders);
        // useEffect は1回だけ実行される（StrictMode なしの場合）
        expect(effectCount).toBe(1);
      });

      it("初期化処理が1回だけ実行される", async () => {
        const initializationCalls: string[] = [];

        const TestComponent: React.FC = () => {
          const fetchProviders = useFetchProviders();
          const isLoading = useLLMIsLoading();
          const initRef = useRef(false);

          useEffect(() => {
            if (!initRef.current) {
              initRef.current = true;
              initializationCalls.push("fetchProviders");
              fetchProviders();
            }
          }, [fetchProviders]);

          return (
            <div data-testid="init-component">
              {isLoading ? "Loading..." : "Ready"}
            </div>
          );
        };

        render(<TestComponent />);

        await waitFor(() => {
          expect(initializationCalls).toHaveLength(1);
          expect(initializationCalls[0]).toBe("fetchProviders");
        });
      });
    });

    describe("合成 Hook との比較（概念実証）", () => {
      it("合成セレクタパターンは毎回新しいオブジェクトを生成する", () => {
        // P31 問題の概念実証:
        // useLLMStore のような合成 Hook は、呼び出すたびに新しいオブジェクトを返す。
        // これを useEffect の依存配列に含めると無限ループが発生する。
        //
        // 実際の Hook を使ったテストは無限ループを引き起こすため、
        // ここでは概念的にセレクタ関数の挙動を示す。

        const state = useAppStore.getState();

        // 合成セレクタの模倣
        const compositeSelector = () => ({
          providers: state.providers,
          selectedProviderId: state.selectedProviderId,
          fetchProviders: state.fetchProviders,
          selectProvider: state.selectProvider,
        });

        const result1 = compositeSelector();
        const result2 = compositeSelector();

        // 同じ値を返すが、異なるオブジェクト参照（これが P31 問題の原因）
        expect(result1).not.toBe(result2);
        // 内部の値や関数参照は同一
        expect(result1.providers).toBe(result2.providers);
        expect(result1.fetchProviders).toBe(result2.fetchProviders);
      });

      it("個別セレクタは安定した参照を返す（解決策）", () => {
        // 対照的に、個別セレクタは安定した参照を返す
        const { result, rerender } = renderHook(() => ({
          // 個別セレクタを使用
          fetchProviders: useFetchProviders(),
          selectProvider: useSelectProvider(),
        }));

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        // 各関数参照は安定している
        expect(ref1.fetchProviders).toBe(ref2.fetchProviders);
        expect(ref1.selectProvider).toBe(ref2.selectProvider);
      });
    });
  });

  // ============================================
  // 2. SkillSelector 無限ループ防止テスト
  // ============================================

  describe("SkillSelector Infinite Loop Prevention", () => {
    describe("個別セレクタの参照安定性", () => {
      it("useRescanSkills は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useRescanSkills());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
        expect(typeof ref1).toBe("function");
      });

      it("useSelectSkillByName は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useSelectSkillByName());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
        expect(typeof ref1).toBe("function");
      });

      it("useFetchSkills は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useFetchSkills());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
      });

      it("useImportSkill は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useImportSkill());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
      });

      it("useRemoveSkill は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useRemoveSkill());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
      });

      it("useExecuteSkill は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useExecuteSkill());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
      });

      it("useClearSkillError は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useClearSkillError());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
      });
    });

    describe("useEffect での使用シミュレーション", () => {
      it("個別セレクタを useEffect の依存配列に含めても無限ループしない", () => {
        let renderCount = 0;
        const maxRenders = 20;

        const TestComponent: React.FC = () => {
          const rescanSkills = useRescanSkills();
          const selectSkillByName = useSelectSkillByName();
          const availableSkills = useAvailableSkillsMetadata();

          renderCount++;
          if (renderCount > maxRenders) {
            throw new Error(
              "Infinite loop detected in SkillSelector simulation!",
            );
          }

          useEffect(() => {
            // スキル初期化処理をシミュレート
          }, [rescanSkills, selectSkillByName]);

          return (
            <div data-testid="skill-component">
              Skills: {availableSkills.length}
            </div>
          );
        };

        render(<TestComponent />);

        expect(renderCount).toBeLessThanOrEqual(maxRenders);
      });

      it("スキル選択が1回だけ実行される", async () => {
        const selectionCalls: string[] = [];

        const TestComponent: React.FC = () => {
          const selectSkillByName = useSelectSkillByName();
          const selectedSkillName = useSelectedSkillName();
          const initRef = useRef(false);

          useEffect(() => {
            if (!initRef.current) {
              initRef.current = true;
              selectionCalls.push("selectSkill");
              selectSkillByName("test-skill");
            }
          }, [selectSkillByName]);

          return (
            <div data-testid="skill-select-component">
              Selected: {selectedSkillName ?? "none"}
            </div>
          );
        };

        render(<TestComponent />);

        await waitFor(() => {
          expect(selectionCalls).toHaveLength(1);
        });
      });
    });

    describe("合成 Hook との比較（概念実証）", () => {
      it("合成セレクタパターンは毎回新しいオブジェクトを生成する", () => {
        const state = useAppStore.getState();

        // 合成セレクタの模倣
        const compositeSelector = () => ({
          availableSkillsMetadata: state.availableSkillsMetadata,
          importedSkills: state.importedSkills,
          rescanSkills: state.rescanSkills,
          selectSkillByName: state.selectSkillByName,
        });

        const result1 = compositeSelector();
        const result2 = compositeSelector();

        // 異なるオブジェクト参照
        expect(result1).not.toBe(result2);
        // 内部の関数参照は同一
        expect(result1.rescanSkills).toBe(result2.rescanSkills);
      });

      it("個別セレクタは安定した参照を返す（解決策）", () => {
        const { result, rerender } = renderHook(() => ({
          rescanSkills: useRescanSkills(),
          selectSkillByName: useSelectSkillByName(),
        }));

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1.rescanSkills).toBe(ref2.rescanSkills);
        expect(ref1.selectSkillByName).toBe(ref2.selectSkillByName);
      });
    });
  });

  // ============================================
  // 3. SettingsView 無限ループ防止テスト
  // ============================================

  describe("SettingsView Infinite Loop Prevention", () => {
    describe("個別セレクタの参照安定性", () => {
      it("useInitializeAuthMode は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useInitializeAuthMode());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
        expect(typeof ref1).toBe("function");
      });

      it("useSetAuthMode は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useSetAuthMode());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
        expect(typeof ref1).toBe("function");
      });

      it("useFetchAuthMode は複数レンダーでも同じ関数参照を返す", () => {
        const { result, rerender } = renderHook(() => useFetchAuthMode());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
      });

      it("useAuthMode は mode が変更されない限り同じ値を返す", () => {
        const { result, rerender } = renderHook(() => useAuthMode());

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1).toBe(ref2);
        expect(ref1).toBe("subscription");
      });
    });

    describe("useEffect での使用シミュレーション", () => {
      it("個別セレクタを useEffect の依存配列に含めても無限ループしない", () => {
        let renderCount = 0;
        const maxRenders = 20;

        const TestComponent: React.FC = () => {
          const initializeAuthMode = useInitializeAuthMode();
          const setAuthMode = useSetAuthMode();
          const mode = useAuthMode();

          renderCount++;
          if (renderCount > maxRenders) {
            throw new Error(
              "Infinite loop detected in SettingsView simulation!",
            );
          }

          useEffect(() => {
            // AuthMode 初期化処理をシミュレート
          }, [initializeAuthMode, setAuthMode]);

          return <div data-testid="settings-component">Mode: {mode}</div>;
        };

        render(<TestComponent />);

        expect(renderCount).toBeLessThanOrEqual(maxRenders);
      });

      it("P31 の問題パターン: useRef ガードで無限ループを防止できる", async () => {
        const initCalls: string[] = [];

        // P31 で示された修正パターンをテスト
        const TestComponent: React.FC = () => {
          const initializeAuthMode = useInitializeAuthMode();
          const mode = useAuthMode();
          const initRef = useRef(false);

          useEffect(() => {
            if (!initRef.current) {
              initRef.current = true;
              initCalls.push("initialize");
              initializeAuthMode();
            }
          }, [initializeAuthMode]);

          return <div data-testid="auth-mode-component">Mode: {mode}</div>;
        };

        render(<TestComponent />);

        await waitFor(() => {
          expect(initCalls).toHaveLength(1);
          expect(initCalls[0]).toBe("initialize");
        });
      });
    });

    describe("合成 Hook との比較（概念実証）", () => {
      it("合成セレクタパターンは毎回新しいオブジェクトを生成する", () => {
        const state = useAppStore.getState();

        // 合成セレクタの模倣
        const compositeSelector = () => ({
          mode: state.mode,
          status: state.status,
          initializeAuthMode: state.initializeAuthMode,
          setMode: state.setMode,
        });

        const result1 = compositeSelector();
        const result2 = compositeSelector();

        // 異なるオブジェクト参照
        expect(result1).not.toBe(result2);
        // 内部の関数参照は同一
        expect(result1.initializeAuthMode).toBe(result2.initializeAuthMode);
      });

      it("個別セレクタは安定した参照を返す（解決策）", () => {
        const { result, rerender } = renderHook(() => ({
          initializeAuthMode: useInitializeAuthMode(),
          setAuthMode: useSetAuthMode(),
        }));

        const ref1 = result.current;
        rerender();
        const ref2 = result.current;

        expect(ref1.initializeAuthMode).toBe(ref2.initializeAuthMode);
        expect(ref1.setAuthMode).toBe(ref2.setAuthMode);
      });
    });
  });

  // ============================================
  // 4. StrictMode 互換性テスト
  // ============================================

  describe("StrictMode Compatibility", () => {
    it("StrictMode で useEffect が2回呼ばれても問題なく動作する", async () => {
      const effectCalls: string[] = [];
      const cleanupCalls: string[] = [];

      const TestComponent: React.FC = () => {
        const fetchProviders = useFetchProviders();
        const initRef = useRef(false);

        useEffect(() => {
          effectCalls.push("effect");

          if (!initRef.current) {
            initRef.current = true;
            // 実際の初期化処理
          }

          return () => {
            cleanupCalls.push("cleanup");
          };
        }, [fetchProviders]);

        return <div>StrictMode Test</div>;
      };

      render(
        <StrictMode>
          <TestComponent />
        </StrictMode>,
      );

      await waitFor(() => {
        // StrictMode では effect が2回呼ばれる可能性がある
        // しかし、useRef ガードにより実際の初期化は1回のみ
        expect(effectCalls.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("StrictMode でも個別セレクタの参照は安定している", () => {
      const references: Array<() => Promise<void>> = [];

      const TestComponent: React.FC = () => {
        const fetchProviders = useFetchProviders();

        useEffect(() => {
          references.push(fetchProviders);
        }, [fetchProviders]);

        return <div>StrictMode Reference Test</div>;
      };

      render(
        <StrictMode>
          <TestComponent />
        </StrictMode>,
      );

      // すべての参照が同一であることを確認
      if (references.length > 1) {
        for (let i = 1; i < references.length; i++) {
          expect(references[i]).toBe(references[0]);
        }
      }
    });

    it("複数の個別セレクタを同時に使用しても StrictMode で問題ない", async () => {
      let renderCount = 0;
      const maxRenders = 50; // StrictMode は2倍レンダーするため余裕を持たせる

      const TestComponent: React.FC = () => {
        // 複数のセレクタを同時使用
        const fetchProviders = useFetchProviders();
        const checkHealth = useCheckLLMHealth();
        const rescanSkills = useRescanSkills();
        const initializeAuthMode = useInitializeAuthMode();

        renderCount++;
        if (renderCount > maxRenders) {
          throw new Error("Infinite loop detected in StrictMode!");
        }

        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [fetchProviders, checkHealth, rescanSkills, initializeAuthMode]);

        return <div>Multi-Selector StrictMode Test</div>;
      };

      render(
        <StrictMode>
          <TestComponent />
        </StrictMode>,
      );

      expect(renderCount).toBeLessThanOrEqual(maxRenders);
    });
  });

  // ============================================
  // 5. 高頻度状態更新テスト
  // ============================================

  describe("High-Frequency State Updates", () => {
    it("連続的な状態更新でも無限ループしない", async () => {
      let renderCount = 0;
      const maxRenders = 100;

      const TestComponent: React.FC = () => {
        const providers = useLLMProviders();
        const isLoading = useLLMIsLoading();

        renderCount++;
        if (renderCount > maxRenders) {
          throw new Error(
            "Infinite loop detected during high-frequency updates!",
          );
        }

        return (
          <div>
            Providers: {providers.length}, Loading: {String(isLoading)}
          </div>
        );
      };

      render(<TestComponent />);

      // 高頻度の状態更新をシミュレート
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          useAppStore.setState({ llmIsLoading: true });
        });
        await act(async () => {
          useAppStore.setState({ llmIsLoading: false });
        });
      }

      expect(renderCount).toBeLessThanOrEqual(maxRenders);
    });

    it("アクション関数の連続呼び出しでも参照は安定", async () => {
      const references: Array<() => void> = [];

      const TestComponent: React.FC = () => {
        const selectProvider = useSelectProvider();

        useEffect(() => {
          references.push(selectProvider);
        });

        return <div>Reference Stability Test</div>;
      };

      const { rerender } = render(<TestComponent />);

      // 状態を変更しながら複数回 rerender
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          useAppStore.setState({
            selectedProviderId: `provider-${i}` as never,
          });
        });
        rerender(<TestComponent />);
      }

      // すべての参照が同一
      for (let i = 1; i < references.length; i++) {
        expect(references[i]).toBe(references[0]);
      }
    });

    it("複数コンポーネントが同じセレクタを使用しても問題ない", async () => {
      let componentACount = 0;
      let componentBCount = 0;
      const maxRenders = 50;

      const ComponentA: React.FC = () => {
        const providers = useLLMProviders();
        const _fetchProviders = useFetchProviders();

        componentACount++;
        if (componentACount > maxRenders) {
          throw new Error("Infinite loop in ComponentA!");
        }

        return <div>A: {providers.length}</div>;
      };

      const ComponentB: React.FC = () => {
        const providers = useLLMProviders();
        const _fetchProviders = useFetchProviders();

        componentBCount++;
        if (componentBCount > maxRenders) {
          throw new Error("Infinite loop in ComponentB!");
        }

        return <div>B: {providers.length}</div>;
      };

      render(
        <>
          <ComponentA />
          <ComponentB />
        </>,
      );

      // 状態を更新
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          useAppStore.setState({
            providers: [
              { id: `openai`, name: "OpenAI", models: [], isAvailable: true },
            ] as never,
          });
        });
      }

      expect(componentACount).toBeLessThanOrEqual(maxRenders);
      expect(componentBCount).toBeLessThanOrEqual(maxRenders);
    });

    it("状態とアクションを同時に使用しても安定", async () => {
      let renderCount = 0;
      const maxRenders = 50;

      const TestComponent: React.FC = () => {
        // 状態セレクタ
        const mode = useAuthMode();
        const isLoading = useAuthModeLoading();
        const error = useAuthModeError();
        const _status = useAuthModeStatus();

        // アクションセレクタ
        const _setAuthMode = useSetAuthMode();
        const _initializeAuthMode = useInitializeAuthMode();
        const _fetchAuthMode = useFetchAuthMode();

        renderCount++;
        if (renderCount > maxRenders) {
          throw new Error("Infinite loop with mixed selectors!");
        }

        return (
          <div>
            Mode: {mode}, Loading: {String(isLoading)}, Error: {error ?? "none"}
          </div>
        );
      };

      render(<TestComponent />);

      // 複数の状態を更新
      await act(async () => {
        useAppStore.setState({ mode: "api-key" });
      });
      await act(async () => {
        useAppStore.setState({ isLoading: true });
      });
      await act(async () => {
        useAppStore.setState({ isLoading: false, error: "Test error" });
      });

      expect(renderCount).toBeLessThanOrEqual(maxRenders);
    });
  });

  // ============================================
  // 6. 実際のコンポーネントパターンテスト
  // ============================================

  describe("Real Component Patterns", () => {
    it("LLMSelectorPanel のような初期化パターンが無限ループしない", async () => {
      const apiCalls: string[] = [];
      let renderCount = 0;

      // 実際の LLMSelectorPanel の初期化パターンをシミュレート
      const LLMSelectorPanelSimulation: React.FC = () => {
        const providers = useLLMProviders();
        const selectedProviderId = useSelectedProviderId();
        const _selectedModelId = useSelectedModelId();
        const isLoading = useLLMIsLoading();
        const _error = useLLMError();
        const _healthStatus = useLLMHealthStatus();

        const fetchProviders = useFetchProviders();
        const _selectProvider = useSelectProvider();
        const _selectModel = useSelectModel();
        const _checkHealth = useCheckLLMHealth();

        const initRef = useRef(false);

        renderCount++;

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
            apiCalls.push("fetchProviders");
            fetchProviders();
          }
        }, [fetchProviders]);

        return (
          <div data-testid="llm-panel">
            <div>Providers: {providers.length}</div>
            <div>Selected: {selectedProviderId ?? "none"}</div>
            <div>Loading: {String(isLoading)}</div>
          </div>
        );
      };

      render(<LLMSelectorPanelSimulation />);

      await waitFor(() => {
        expect(screen.getByTestId("llm-panel")).toBeInTheDocument();
      });

      // fetchProviders は1回のみ呼ばれる
      expect(apiCalls).toHaveLength(1);
      expect(apiCalls[0]).toBe("fetchProviders");

      // レンダー回数は合理的な範囲内
      expect(renderCount).toBeLessThan(20);
    });

    it("SkillSelector のような選択パターンが無限ループしない", async () => {
      const selections: string[] = [];
      let renderCount = 0;

      const SkillSelectorSimulation: React.FC = () => {
        const availableSkills = useAvailableSkillsMetadata();
        const importedSkills = useImportedSkills();
        const selectedSkillName = useSelectedSkillName();
        const _isScanning = useIsScanningSkills();
        const _isLoading = useIsLoadingSkills();

        const fetchSkills = useFetchSkills();
        const _selectSkillByName = useSelectSkillByName();
        const _rescanSkills = useRescanSkills();

        const initRef = useRef(false);

        renderCount++;

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
            selections.push("fetchSkills");
            fetchSkills();
          }
        }, [fetchSkills]);

        return (
          <div data-testid="skill-selector">
            <div>Available: {availableSkills.length}</div>
            <div>Imported: {importedSkills.length}</div>
            <div>Selected: {selectedSkillName ?? "none"}</div>
          </div>
        );
      };

      render(<SkillSelectorSimulation />);

      await waitFor(() => {
        expect(screen.getByTestId("skill-selector")).toBeInTheDocument();
      });

      expect(selections).toHaveLength(1);
      expect(renderCount).toBeLessThan(20);
    });

    it("SettingsView のような AuthMode 初期化パターンが無限ループしない", async () => {
      const initCalls: string[] = [];
      let renderCount = 0;

      const SettingsViewSimulation: React.FC = () => {
        const mode = useAuthMode();
        const _status = useAuthModeStatus();
        const isLoading = useAuthModeLoading();
        const _error = useAuthModeError();
        const isValid = useIsAuthModeValid();

        const initializeAuthMode = useInitializeAuthMode();
        const _setAuthMode = useSetAuthMode();
        const _fetchAuthMode = useFetchAuthMode();

        const initRef = useRef(false);

        renderCount++;

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
            initCalls.push("initializeAuthMode");
            initializeAuthMode();
          }
        }, [initializeAuthMode]);

        return (
          <div data-testid="settings-view">
            <div>Mode: {mode}</div>
            <div>Valid: {String(isValid)}</div>
            <div>Loading: {String(isLoading)}</div>
          </div>
        );
      };

      render(<SettingsViewSimulation />);

      await waitFor(() => {
        expect(screen.getByTestId("settings-view")).toBeInTheDocument();
      });

      expect(initCalls).toHaveLength(1);
      expect(initCalls[0]).toBe("initializeAuthMode");
      expect(renderCount).toBeLessThan(20);
    });
  });

  // ============================================
  // 7. エッジケーステスト
  // ============================================

  describe("Edge Cases", () => {
    it("undefined/null 状態でも安定動作する", () => {
      useAppStore.setState({
        selectedProviderId: null,
        selectedModelId: null,
        selectedSkillName: null,
        status: null,
        llmError: null,
        skillError: null,
        error: null,
      });

      const { result } = renderHook(() => ({
        providerId: useSelectedProviderId(),
        modelId: useSelectedModelId(),
        skillName: useSelectedSkillName(),
        status: useAuthModeStatus(),
        llmError: useLLMError(),
        skillError: useSkillError(),
        authError: useAuthModeError(),
      }));

      expect(result.current.providerId).toBeNull();
      expect(result.current.modelId).toBeNull();
      expect(result.current.skillName).toBeNull();
      expect(result.current.status).toBeNull();
      expect(result.current.llmError).toBeNull();
      expect(result.current.skillError).toBeNull();
      expect(result.current.authError).toBeNull();
    });

    it("空配列状態でも安定動作する", () => {
      useAppStore.setState({
        providers: [],
        availableSkillsMetadata: [],
        importedSkills: [],
        streamingMessages: [],
      });

      const { result } = renderHook(() => ({
        providers: useLLMProviders(),
        availableSkills: useAvailableSkillsMetadata(),
        importedSkills: useImportedSkills(),
      }));

      expect(result.current.providers).toEqual([]);
      expect(result.current.availableSkills).toEqual([]);
      expect(result.current.importedSkills).toEqual([]);
    });

    it("ブール値の切り替えでも無限ループしない", async () => {
      let renderCount = 0;
      const maxRenders = 100;

      const TestComponent: React.FC = () => {
        const isLoading = useLLMIsLoading();
        const isScanning = useIsScanningSkills();
        const isExecuting = useIsSkillExecuting();
        const isImporting = useIsImportingSkill();
        const authLoading = useAuthModeLoading();

        renderCount++;
        if (renderCount > maxRenders) {
          throw new Error("Infinite loop during boolean toggle!");
        }

        return (
          <div>
            {String(isLoading)}, {String(isScanning)}, {String(isExecuting)},{" "}
            {String(isImporting)}, {String(authLoading)}
          </div>
        );
      };

      render(<TestComponent />);

      // ブール値を高速で切り替え
      for (let i = 0; i < 20; i++) {
        await act(async () => {
          useAppStore.setState({
            llmIsLoading: i % 2 === 0,
            isScanning: i % 2 === 1,
            isExecuting: i % 2 === 0,
            isImporting: i % 2 === 1,
            isLoading: i % 2 === 0,
          });
        });
      }

      expect(renderCount).toBeLessThanOrEqual(maxRenders);
    });
  });
});
