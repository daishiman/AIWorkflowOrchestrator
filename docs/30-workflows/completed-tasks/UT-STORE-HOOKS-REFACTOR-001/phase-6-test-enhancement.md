# Phase 6: テスト拡充

## メタ情報

| 項目        | 値                                 |
| ----------- | ---------------------------------- |
| Phase       | 6                                  |
| タスクID    | UT-STORE-HOOKS-REFACTOR-001        |
| 機能名      | Zustand Store Hooks 無限ループ修正 |
| 作成日      | 2026-02-11                         |
| 関連Pitfall | P31                                |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。既存コンポーネントでuseRefパターンを削除した後の動作確認テストも含む。

## 実行タスク

- **カバレッジ分析**: テストカバレッジの測定と不足領域の特定
- **コンポーネント統合テスト**: SettingsView, LLMSelectorPanel等の統合テスト追加
- **useRef削除後テスト**: 既存コンポーネントのリファクタリング後の動作確認
- **境界値テスト**: エッジケース・異常系のテスト追加

## 参照資料

| 資料名                     | パス                                                                           | 説明                 |
| -------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| Phase 4テスト仕様書        | `docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/phase-4-test-creation.md`       | テスト設計           |
| Phase 5実装仕様書          | `docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/phase-5-implementation.md`      | 実装内容             |
| 既存SettingsViewテスト     | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`           | 既存テスト           |
| 既存LLMSelectorPanelテスト | `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx` | 既存テスト           |
| 状態管理アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | カバレッジ観点の根拠 |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                 | 目標 |
| -------------------- | ---- |
| 個別セレクタHook     | 100% |
| コンポーネント統合   | 80%+ |
| 正常系シナリオ       | 100% |
| 異常系シナリオ       | 80%+ |
| 無限ループ防止テスト | 100% |

## 実行手順

### ステップ1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage
```

### ステップ2: ギャップ分析

- 未到達の行/分岐/関数を特定
- 個別セレクタHookのカバレッジを確認
- コンポーネント統合テストの不足領域を特定

### ステップ3: 追加テスト作成

#### 3.1 SettingsView統合テスト拡充

**ファイル**: `apps/desktop/src/renderer/views/SettingsView/SettingsView.selectors.test.tsx`

```typescript
/**
 * SettingsView セレクタ統合テスト
 *
 * 個別セレクタを使用した場合の動作確認
 * P31対策後のリファクタリング検証
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsView } from './index';

// モック設定
vi.mock('../../store', () => ({
  useAuthMode: vi.fn(() => 'subscription'),
  useSetAuthMode: vi.fn(() => vi.fn()),
  useInitializeAuthMode: vi.fn(() => vi.fn()),
  useAuthModeStatus: vi.fn(() => null),
  useAuthModeIsLoading: vi.fn(() => false),
  useAuthModeError: vi.fn(() => null),
  // 他のセレクタ...
}));

describe('SettingsView with Individual Selectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('useInitializeAuthModeが初期化時に1回だけ呼ばれる', async () => {
      const mockInitialize = vi.fn();
      vi.mocked(useInitializeAuthMode).mockReturnValue(mockInitialize);

      render(<SettingsView />);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalledTimes(1);
      });
    });

    it('無限ループが発生しない（10回以上の呼び出しがない）', async () => {
      const mockInitialize = vi.fn();
      vi.mocked(useInitializeAuthMode).mockReturnValue(mockInitialize);

      render(<SettingsView />);

      // 少し待機
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('認証モード切り替え', () => {
    it('APIキーモードに切り替えできる', async () => {
      const user = userEvent.setup();
      const mockSetMode = vi.fn();
      vi.mocked(useSetAuthMode).mockReturnValue(mockSetMode);

      render(<SettingsView />);

      // APIキーモードボタンをクリック
      const apiKeyButton = screen.getByRole('button', { name: /api.*key/i });
      await user.click(apiKeyButton);

      expect(mockSetMode).toHaveBeenCalled();
    });
  });

  describe('状態表示', () => {
    it('認証モードが正しく表示される', () => {
      vi.mocked(useAuthMode).mockReturnValue('api-key');

      render(<SettingsView />);

      expect(screen.getByText(/api.*key/i)).toBeInTheDocument();
    });

    it('ローディング状態が表示される', () => {
      vi.mocked(useAuthModeIsLoading).mockReturnValue(true);

      render(<SettingsView />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('エラー状態が表示される', () => {
      vi.mocked(useAuthModeError).mockReturnValue('認証エラー');

      render(<SettingsView />);

      expect(screen.getByText(/認証エラー/)).toBeInTheDocument();
    });
  });
});
```

#### 3.2 LLMSelectorPanel統合テスト拡充

**ファイル**: `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.selectors.test.tsx`

```typescript
/**
 * LLMSelectorPanel セレクタ統合テスト
 *
 * 個別セレクタを使用した場合の動作確認
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LLMSelectorPanel } from '../LLMSelectorPanel';

// モック設定
vi.mock('../../../store', () => ({
  useLLMProviders: vi.fn(() => []),
  useFetchProviders: vi.fn(() => vi.fn()),
  useSelectProvider: vi.fn(() => vi.fn()),
  useSelectModel: vi.fn(() => vi.fn()),
  useSelectedProviderId: vi.fn(() => null),
  useSelectedModelId: vi.fn(() => null),
  useLLMIsLoading: vi.fn(() => false),
  useLLMError: vi.fn(() => null),
}));

describe('LLMSelectorPanel with Individual Selectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('useFetchProvidersが初期化時に1回だけ呼ばれる', async () => {
      const mockFetch = vi.fn();
      vi.mocked(useFetchProviders).mockReturnValue(mockFetch);

      render(<LLMSelectorPanel />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it('無限ループが発生しない', async () => {
      const mockFetch = vi.fn();
      vi.mocked(useFetchProviders).mockReturnValue(mockFetch);

      render(<LLMSelectorPanel />);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('プロバイダー選択', () => {
    it('プロバイダーを選択できる', async () => {
      const user = userEvent.setup();
      const mockSelect = vi.fn();
      vi.mocked(useSelectProvider).mockReturnValue(mockSelect);
      vi.mocked(useLLMProviders).mockReturnValue([
        { id: 'claude', name: 'Claude', models: [], isAvailable: true }
      ]);

      render(<LLMSelectorPanel />);

      const providerButton = screen.getByRole('button', { name: /claude/i });
      await user.click(providerButton);

      expect(mockSelect).toHaveBeenCalledWith('claude');
    });
  });

  describe('状態表示', () => {
    it('プロバイダー一覧が表示される', () => {
      vi.mocked(useLLMProviders).mockReturnValue([
        { id: 'claude', name: 'Claude', models: [], isAvailable: true },
        { id: 'openai', name: 'OpenAI', models: [], isAvailable: true }
      ]);

      render(<LLMSelectorPanel />);

      expect(screen.getByText(/claude/i)).toBeInTheDocument();
      expect(screen.getByText(/openai/i)).toBeInTheDocument();
    });

    it('ローディング状態が表示される', () => {
      vi.mocked(useLLMIsLoading).mockReturnValue(true);

      render(<LLMSelectorPanel />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
```

#### 3.3 AgentView統合テスト拡充

**ファイル**: `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.selectors.test.tsx`

```typescript
/**
 * AgentView セレクタ統合テスト
 *
 * 個別セレクタを使用した場合の動作確認
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentView } from '../index';

// モック設定
vi.mock('../../../store', () => ({
  useSkills: vi.fn(() => []),
  useImportedSkills: vi.fn(() => []),
  useFetchSkills: vi.fn(() => vi.fn()),
  useSelectSkillByName: vi.fn(() => vi.fn()),
  useExecuteSkill: vi.fn(() => vi.fn()),
  useAbortExecution: vi.fn(() => vi.fn()),
  useSelectedSkillName: vi.fn(() => null),
  useIsExecuting: vi.fn(() => false),
  useSkillError: vi.fn(() => null),
  useIsLoadingSkills: vi.fn(() => false),
}));

describe('AgentView with Individual Selectors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('初期化', () => {
    it('useFetchSkillsが初期化時に1回だけ呼ばれる', async () => {
      const mockFetch = vi.fn();
      vi.mocked(useFetchSkills).mockReturnValue(mockFetch);

      render(<AgentView />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });
    });

    it('無限ループが発生しない', async () => {
      const mockFetch = vi.fn();
      vi.mocked(useFetchSkills).mockReturnValue(mockFetch);

      render(<AgentView />);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('スキル選択', () => {
    it('スキルを選択できる', async () => {
      const user = userEvent.setup();
      const mockSelect = vi.fn();
      vi.mocked(useSelectSkillByName).mockReturnValue(mockSelect);
      vi.mocked(useImportedSkills).mockReturnValue([
        { name: 'test-skill', description: 'Test Skill' }
      ]);

      render(<AgentView />);

      const skillButton = screen.getByRole('button', { name: /test-skill/i });
      await user.click(skillButton);

      expect(mockSelect).toHaveBeenCalledWith('test-skill');
    });
  });

  describe('スキル実行', () => {
    it('スキルを実行できる', async () => {
      const user = userEvent.setup();
      const mockExecute = vi.fn();
      vi.mocked(useExecuteSkill).mockReturnValue(mockExecute);
      vi.mocked(useSelectedSkillName).mockReturnValue('test-skill');

      render(<AgentView />);

      const promptInput = screen.getByRole('textbox');
      await user.type(promptInput, 'テストプロンプト');

      const executeButton = screen.getByRole('button', { name: /実行/i });
      await user.click(executeButton);

      expect(mockExecute).toHaveBeenCalledWith('テストプロンプト');
    });

    it('実行中にabortできる', async () => {
      const user = userEvent.setup();
      const mockAbort = vi.fn();
      vi.mocked(useAbortExecution).mockReturnValue(mockAbort);
      vi.mocked(useIsExecuting).mockReturnValue(true);

      render(<AgentView />);

      const abortButton = screen.getByRole('button', { name: /中断/i });
      await user.click(abortButton);

      expect(mockAbort).toHaveBeenCalled();
    });
  });
});
```

### ステップ4: useRef削除後テスト

既存コンポーネントでuseRefパターンを削除した後の動作確認テスト。

**ファイル**: `apps/desktop/src/renderer/store/__tests__/store.selectors.migration.test.ts`

```typescript
/**
 * Store セレクタ移行テスト
 *
 * useRefパターンから個別セレクタへの移行検証
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEffect, useRef, useState } from "react";
import {
  useInitializeAuthMode,
  useFetchProviders,
  useFetchSkills,
} from "../index";

describe("Store Selectors Migration", () => {
  describe("useRef削除後の動作確認", () => {
    it("useInitializeAuthModeはuseRefなしで安全に使用できる", () => {
      const initCalls = { count: 0 };
      const MAX_SAFE_RENDERS = 5;

      const { result } = renderHook(() => {
        const initialize = useInitializeAuthMode();
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
          if (!initialized) {
            initCalls.count++;
            setInitialized(true);
          }
        }, [initialize, initialized]);

        return { initialized };
      });

      expect(result.current.initialized).toBe(true);
      expect(initCalls.count).toBeLessThanOrEqual(MAX_SAFE_RENDERS);
    });

    it("useFetchProvidersはuseRefなしで安全に使用できる", () => {
      const fetchCalls = { count: 0 };
      const MAX_SAFE_RENDERS = 5;

      const { result } = renderHook(() => {
        const fetchProviders = useFetchProviders();
        const [loaded, setLoaded] = useState(false);

        useEffect(() => {
          if (!loaded) {
            fetchCalls.count++;
            setLoaded(true);
          }
        }, [fetchProviders, loaded]);

        return { loaded };
      });

      expect(result.current.loaded).toBe(true);
      expect(fetchCalls.count).toBeLessThanOrEqual(MAX_SAFE_RENDERS);
    });

    it("useFetchSkillsはuseRefなしで安全に使用できる", () => {
      const fetchCalls = { count: 0 };
      const MAX_SAFE_RENDERS = 5;

      const { result } = renderHook(() => {
        const fetchSkills = useFetchSkills();
        const [loaded, setLoaded] = useState(false);

        useEffect(() => {
          if (!loaded) {
            fetchCalls.count++;
            setLoaded(true);
          }
        }, [fetchSkills, loaded]);

        return { loaded };
      });

      expect(result.current.loaded).toBe(true);
      expect(fetchCalls.count).toBeLessThanOrEqual(MAX_SAFE_RENDERS);
    });
  });

  describe("複数セレクタの組み合わせ", () => {
    it("複数の初期化関数を同時に使用しても安全", () => {
      const totalCalls = { count: 0 };
      const MAX_SAFE_RENDERS = 10;

      const { result } = renderHook(() => {
        const initAuth = useInitializeAuthMode();
        const fetchProviders = useFetchProviders();
        const fetchSkills = useFetchSkills();
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
          if (!initialized) {
            totalCalls.count++;
            setInitialized(true);
          }
        }, [initAuth, fetchProviders, fetchSkills, initialized]);

        return { initialized };
      });

      expect(result.current.initialized).toBe(true);
      expect(totalCalls.count).toBeLessThanOrEqual(MAX_SAFE_RENDERS);
    });
  });
});
```

### ステップ5: エッジケーステスト拡充

**ファイル**: `apps/desktop/src/renderer/store/__tests__/store.selectors.edge-cases.test.ts`

```typescript
/**
 * Store セレクタ エッジケーステスト
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAppStore } from "../index";
import {
  useAuthMode,
  useSetAuthMode,
  useLLMProviders,
  useFetchProviders,
  useSkills,
  useFetchSkills,
} from "../index";

describe("Store Selectors Edge Cases", () => {
  describe("Store状態リセット後の動作", () => {
    it("Storeリセット後もセレクタが正しく動作する", () => {
      const { result: authModeResult } = renderHook(() => useAuthMode());
      expect(authModeResult.current).toBe("subscription");

      // Storeをリセット
      act(() => {
        useAppStore.getState().resetAuthMode();
      });

      expect(authModeResult.current).toBe("subscription");
    });
  });

  describe("複数コンポーネントでの同時使用", () => {
    it("同じセレクタを複数のHookインスタンスで使用しても参照が同じ", () => {
      const { result: result1 } = renderHook(() => useFetchProviders());
      const { result: result2 } = renderHook(() => useFetchProviders());

      // 同じ関数参照であることを確認
      expect(result1.current).toBe(result2.current);
    });

    it("異なるセレクタは独立して動作する", () => {
      const { result: providersResult } = renderHook(() => useLLMProviders());
      const { result: skillsResult } = renderHook(() => useSkills());

      expect(providersResult.current).toEqual([]);
      expect(skillsResult.current).toEqual([]);
    });
  });

  describe("状態更新時の再レンダリング", () => {
    it("関係ない状態が更新されてもセレクタの戻り値は変わらない", () => {
      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useFetchProviders();
      });

      const firstRef = result.current;

      // 関係ない状態を更新
      act(() => {
        useAppStore.getState().setSkillFilter("test");
      });

      // 関数参照は変わらない
      expect(result.current).toBe(firstRef);
    });
  });

  describe("null/undefined状態のハンドリング", () => {
    it("selectedSkillNameがnullでも正しく動作する", () => {
      const { result } = renderHook(() => useSelectedSkillName());
      expect(result.current).toBeNull();
    });

    it("authModeStatusがnullでも正しく動作する", () => {
      const { result } = renderHook(() => useAuthModeStatus());
      expect(result.current).toBeNull();
    });
  });

  describe("型安全性", () => {
    it("useAuthModeは正しい型を返す", () => {
      const { result } = renderHook(() => useAuthMode());
      // TypeScript型チェック: 'subscription' | 'api-key'
      expect(["subscription", "api-key"]).toContain(result.current);
    });

    it("useLLMProvidersは配列を返す", () => {
      const { result } = renderHook(() => useLLMProviders());
      expect(Array.isArray(result.current)).toBe(true);
    });
  });
});
```

### ステップ6: 統合テスト再実行

```bash
pnpm --filter @repo/desktop test:integration
pnpm --filter @repo/desktop test:e2e
```

## 統合テスト連携

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                         | 目標 |
| ------------------ | -------------------------------- | ---- |
| 個別セレクタHook   | 状態取得・関数参照安定性         | 100% |
| コンポーネント統合 | SettingsView, LLMSelectorPanel等 | 80%+ |
| 無限ループ防止     | useEffect依存配列での使用        | 100% |
| useRef移行         | リファクタリング後の動作         | 100% |
| エッジケース       | null/undefined、同時使用         | 80%+ |

## 成果物

| 成果物                         | パス                                                                                     | 説明               |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート             | `outputs/phase-6/coverage-report.md`                                                     | カバレッジ分析結果 |
| SettingsViewセレクタテスト     | `apps/desktop/src/renderer/views/SettingsView/SettingsView.selectors.test.tsx`           | コンポーネント統合 |
| LLMSelectorPanelセレクタテスト | `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.selectors.test.tsx` | コンポーネント統合 |
| AgentViewセレクタテスト        | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.selectors.test.tsx`       | コンポーネント統合 |
| 移行テスト                     | `apps/desktop/src/renderer/store/__tests__/store.selectors.migration.test.ts`            | useRef移行検証     |
| エッジケーステスト             | `apps/desktop/src/renderer/store/__tests__/store.selectors.edge-cases.test.ts`           | 境界値テスト       |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 個別セレクタHookのカバレッジ100%
- [ ] コンポーネント統合テストが追加されている
- [ ] useRef移行テストが成功している
- [ ] エッジケーステストが追加されている
- [ ] 全テストが成功している
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
