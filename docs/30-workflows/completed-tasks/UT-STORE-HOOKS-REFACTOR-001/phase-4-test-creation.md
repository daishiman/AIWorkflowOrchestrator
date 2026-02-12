# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目        | 値                                 |
| ----------- | ---------------------------------- |
| Phase       | 4                                  |
| タスクID    | UT-STORE-HOOKS-REFACTOR-001        |
| 機能名      | Zustand Store Hooks 無限ループ修正 |
| 作成日      | 2026-02-11                         |
| 関連Pitfall | P31                                |

## 目的

個別セレクタHookのユニットテストを設計・実装し、P31（Zustand Store Hooks無限ループ）の再発防止を検証可能な状態にする。テストはRed状態（失敗状態）で完了する。

## 実行タスク

- **TDD原則適用**: テストファースト開発の実践
- **個別セレクタHookテスト**: useAuthMode, useLLMProviders, useSkills等の単体テスト作成
- **関数参照安定性テスト**: setter関数がuseEffect依存配列で安定することを検証
- **無限ループ防止テスト**: useEffectで関数を依存配列に含めても無限ループしないことを検証
- **統合テスト**: コンポーネント統合時の動作確認テスト作成

## 参照資料

| 資料名                       | パス                                                                              | 説明                      |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------- |
| 06-known-pitfalls.md         | `.claude/rules/06-known-pitfalls.md#P31`                                          | P31問題の詳細             |
| authModeSlice.ts             | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                         | 認証方式管理Slice         |
| llmSlice.ts                  | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                              | LLM状態管理Slice          |
| agentSlice.ts                | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                            | エージェント状態管理Slice |
| store/index.ts               | `apps/desktop/src/renderer/store/index.ts`                                        | 統合Store・既存セレクタ   |
| 状態管理アーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | テストパターンの根拠      |
| テストコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | Zustandモッキングパターン |

## 実行手順

### ステップ1: テストシナリオ設計

P31問題を解決する個別セレクタHookのテストシナリオを設計する。

#### 1.1 テスト対象Hook一覧

**authModeSlice関連（既存Hook拡張）**:
| Hook名 | 型 | 説明 |
| ----------------------- | ---------------------------- | -------------------------- |
| useAuthMode | `() => AuthMode` | 認証モード取得（既存） |
| useSetAuthMode | `() => (mode: AuthMode) => Promise<void>` | 認証モード設定関数 |
| useInitializeAuthMode | `() => () => void` | 初期化関数 |
| useFetchAuthModeStatus | `() => () => Promise<void>` | ステータス取得関数 |
| useAuthModeIsLoading | `() => boolean` | ローディング状態（既存） |

**llmSlice関連（新規Hook）**:
| Hook名 | 型 | 説明 |
| --------------------- | --------------------------------------- | -------------------- |
| useLLMProviders | `() => LLMProvider[]` | プロバイダー一覧取得 |
| useSelectedProviderId | `() => LLMProviderId \| null` | 選択中プロバイダーID |
| useSelectedModelId | `() => string \| null` | 選択中モデルID |
| useFetchProviders | `() => () => Promise<void>` | プロバイダー取得関数 |
| useSelectProvider | `() => (id: LLMProviderId) => void` | プロバイダー選択関数 |
| useSelectModel | `() => (modelId: string) => void` | モデル選択関数 |
| useLLMIsLoading | `() => boolean` | ローディング状態 |
| useLLMError | `() => LLMError \| null` | エラー状態 |

**agentSlice関連（新規Hook）**:
| Hook名 | 型 | 説明 |
| --------------------- | ------------------------------------- | -------------------- |
| useSkills | `() => Skill[]` | スキル一覧取得 |
| useImportedSkills | `() => ImportedSkill[]` | インポート済みスキル |
| useSelectedSkillName | `() => string \| null` | 選択中スキル名 |
| useFetchSkills | `() => () => Promise<void>` | スキル取得関数 |
| useSelectSkillByName | `() => (name: string \| null) => void` | スキル選択関数 |
| useExecuteSkill | `() => (prompt: string) => Promise<void>` | スキル実行関数 |
| useAbortExecution | `() => () => void` | 実行中断関数 |
| useIsExecuting | `() => boolean` | 実行中フラグ |
| useSkillError | `() => string \| null` | エラー状態 |

### ステップ2: ユニットテスト作成

#### 2.0 Zustandモッキングパターン

testing-component-patterns.mdに基づき、以下のモッキングパターンを使用：

##### パターン1: 直接返却（シンプル状態）

```typescript
vi.mock("@/renderer/store", () => ({
  useAuthMode: () => "subscription",
  useAuthModeStatus: () => "authenticated",
}));
```

##### パターン2: セレクタ関数モッキング

```typescript
const mockStore = {
  mode: "subscription",
  status: "authenticated",
};
vi.mock("@/renderer/store", () => ({
  useAppStore: (selector: (state: typeof mockStore) => unknown) =>
    selector(mockStore),
}));
```

##### 選択基準

| ケース                 | 推奨パターン              |
| ---------------------- | ------------------------- |
| 単一値のみ必要         | パターン1                 |
| 複数値・セレクタテスト | パターン2                 |
| 状態変更テスト         | パターン2 + mockStore更新 |

#### 2.1 authModeSlice個別セレクタテスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts`

```typescript
/**
 * authModeSlice 個別セレクタHookテスト
 *
 * P31対策: 個別セレクタを使用することで、useEffect依存配列に
 * 関数を含めても無限ループが発生しないことを検証する。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEffect, useState } from "react";
import {
  useAuthMode,
  useSetAuthMode,
  useInitializeAuthMode,
  useFetchAuthModeStatus,
  useAuthModeIsLoading,
} from "../../index";

describe("authModeSlice Individual Selectors", () => {
  // テストケース1: 状態が正しく取得できる
  describe("useAuthMode", () => {
    it("認証モードを正しく取得できる", () => {
      const { result } = renderHook(() => useAuthMode());
      expect(result.current).toBe("subscription"); // デフォルト値
    });
  });

  // テストケース2: 関数参照が安定している
  describe("useSetAuthMode", () => {
    it("関数参照が再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() => useSetAuthMode());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });
  });

  // テストケース3: useEffect依存配列に含めても無限ループしない
  describe("無限ループ防止", () => {
    it("useSetAuthModeをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;
        const setMode = useSetAuthMode();
        const [called, setCalled] = useState(false);

        useEffect(() => {
          if (!called) {
            setCalled(true);
          }
        }, [setMode, called]);

        return { renderCount: renderCount.current };
      });

      // 10回以内のレンダリングで安定すること（無限ループではない）
      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });

    it("useInitializeAuthModeをuseEffect依存配列に含めても無限ループしない", async () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;
        const initialize = useInitializeAuthMode();
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
          if (!initialized) {
            setInitialized(true);
          }
        }, [initialize, initialized]);

        return { renderCount: renderCount.current };
      });

      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });
  });

  // テストケース4: ローディング状態の取得
  describe("useAuthModeIsLoading", () => {
    it("ローディング状態を正しく取得できる", () => {
      const { result } = renderHook(() => useAuthModeIsLoading());
      expect(result.current).toBe(false); // 初期状態
    });
  });
});
```

#### 2.2 llmSlice個別セレクタテスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`

```typescript
/**
 * llmSlice 個別セレクタHookテスト
 *
 * P31対策: 合成Store Hook（useLLMStore）の代わりに個別セレクタを使用
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEffect, useState } from "react";
import {
  useLLMProviders,
  useSelectedProviderId,
  useSelectedModelId,
  useFetchProviders,
  useSelectProvider,
  useSelectModel,
  useLLMIsLoading,
  useLLMError,
} from "../../index";

describe("llmSlice Individual Selectors", () => {
  // テストケース1: 状態取得
  describe("状態取得Hook", () => {
    it("useLLMProvidersが空配列を返す（初期状態）", () => {
      const { result } = renderHook(() => useLLMProviders());
      expect(result.current).toEqual([]);
    });

    it("useSelectedProviderIdがnullを返す（初期状態）", () => {
      const { result } = renderHook(() => useSelectedProviderId());
      expect(result.current).toBeNull();
    });

    it("useSelectedModelIdがnullを返す（初期状態）", () => {
      const { result } = renderHook(() => useSelectedModelId());
      expect(result.current).toBeNull();
    });

    it("useLLMIsLoadingがfalseを返す（初期状態）", () => {
      const { result } = renderHook(() => useLLMIsLoading());
      expect(result.current).toBe(false);
    });

    it("useLLMErrorがnullを返す（初期状態）", () => {
      const { result } = renderHook(() => useLLMError());
      expect(result.current).toBeNull();
    });
  });

  // テストケース2: 関数参照安定性
  describe("関数参照安定性", () => {
    it("useFetchProvidersの参照が安定している", () => {
      const { result, rerender } = renderHook(() => useFetchProviders());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("useSelectProviderの参照が安定している", () => {
      const { result, rerender } = renderHook(() => useSelectProvider());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("useSelectModelの参照が安定している", () => {
      const { result, rerender } = renderHook(() => useSelectModel());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });
  });

  // テストケース3: 無限ループ防止
  describe("無限ループ防止", () => {
    it("useFetchProvidersをuseEffect依存配列に含めても無限ループしない", () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;
        const fetchProviders = useFetchProviders();
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
          if (!initialized) {
            setInitialized(true);
          }
        }, [fetchProviders, initialized]);

        return { renderCount: renderCount.current };
      });

      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });

    it("useSelectProviderをuseEffect依存配列に含めても無限ループしない", () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;
        const selectProvider = useSelectProvider();
        const [called, setCalled] = useState(false);

        useEffect(() => {
          if (!called) {
            setCalled(true);
          }
        }, [selectProvider, called]);

        return { renderCount: renderCount.current };
      });

      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });
  });
});
```

#### 2.3 agentSlice個別セレクタテスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`

```typescript
/**
 * agentSlice 個別セレクタHookテスト
 *
 * P31対策: 合成Store Hook（useSkillStore）の代わりに個別セレクタを使用
 */
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEffect, useState } from "react";
import {
  useSkills,
  useImportedSkills,
  useSelectedSkillName,
  useFetchSkills,
  useSelectSkillByName,
  useExecuteSkill,
  useAbortExecution,
  useIsExecuting,
  useSkillError,
} from "../../index";

describe("agentSlice Individual Selectors", () => {
  // テストケース1: 状態取得
  describe("状態取得Hook", () => {
    it("useSkillsが空配列を返す（初期状態）", () => {
      const { result } = renderHook(() => useSkills());
      expect(result.current).toEqual([]);
    });

    it("useImportedSkillsが空配列を返す（初期状態）", () => {
      const { result } = renderHook(() => useImportedSkills());
      expect(result.current).toEqual([]);
    });

    it("useSelectedSkillNameがnullを返す（初期状態）", () => {
      const { result } = renderHook(() => useSelectedSkillName());
      expect(result.current).toBeNull();
    });

    it("useIsExecutingがfalseを返す（初期状態）", () => {
      const { result } = renderHook(() => useIsExecuting());
      expect(result.current).toBe(false);
    });

    it("useSkillErrorがnullを返す（初期状態）", () => {
      const { result } = renderHook(() => useSkillError());
      expect(result.current).toBeNull();
    });
  });

  // テストケース2: 関数参照安定性
  describe("関数参照安定性", () => {
    it("useFetchSkillsの参照が安定している", () => {
      const { result, rerender } = renderHook(() => useFetchSkills());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("useSelectSkillByNameの参照が安定している", () => {
      const { result, rerender } = renderHook(() => useSelectSkillByName());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("useExecuteSkillの参照が安定している", () => {
      const { result, rerender } = renderHook(() => useExecuteSkill());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });

    it("useAbortExecutionの参照が安定している", () => {
      const { result, rerender } = renderHook(() => useAbortExecution());
      const firstRef = result.current;

      rerender();

      expect(result.current).toBe(firstRef);
    });
  });

  // テストケース3: 無限ループ防止
  describe("無限ループ防止", () => {
    it("useFetchSkillsをuseEffect依存配列に含めても無限ループしない", () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;
        const fetchSkills = useFetchSkills();
        const [initialized, setInitialized] = useState(false);

        useEffect(() => {
          if (!initialized) {
            setInitialized(true);
          }
        }, [fetchSkills, initialized]);

        return { renderCount: renderCount.current };
      });

      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });

    it("useSelectSkillByNameをuseEffect依存配列に含めても無限ループしない", () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;
        const selectSkill = useSelectSkillByName();
        const [called, setCalled] = useState(false);

        useEffect(() => {
          if (!called) {
            setCalled(true);
          }
        }, [selectSkill, called]);

        return { renderCount: renderCount.current };
      });

      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });

    it("useExecuteSkillをuseEffect依存配列に含めても無限ループしない", () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;
        const executeSkill = useExecuteSkill();
        const [called, setCalled] = useState(false);

        useEffect(() => {
          if (!called) {
            setCalled(true);
          }
        }, [executeSkill, called]);

        return { renderCount: renderCount.current };
      });

      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });
  });
});
```

### ステップ3: 統合テスト作成

#### 3.1 コンポーネント統合テスト

**ファイル**: `apps/desktop/src/renderer/store/__tests__/store.selectors.integration.test.ts`

```typescript
/**
 * Store セレクタ統合テスト
 *
 * コンポーネントで個別セレクタを使用した際の動作を検証
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEffect, useRef, useState } from "react";
import {
  useAuthMode,
  useSetAuthMode,
  useInitializeAuthMode,
  useLLMProviders,
  useFetchProviders,
  useSkills,
  useFetchSkills,
} from "../index";

describe("Store Selectors Integration", () => {
  // P31再現テスト: 合成Hookによる無限ループ
  describe("P31再現テスト（合成Hook問題）", () => {
    it("合成Store Hookの関数を依存配列に含めると無限ループする（問題の再現）", () => {
      // 注意: このテストは問題を文書化するためのもの
      // 個別セレクタを使用すれば解決される
    });
  });

  // P31解決テスト: 個別セレクタによる安定性
  describe("P31解決テスト（個別セレクタ）", () => {
    it("個別セレクタを使用すれば無限ループしない", () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;
        const mode = useAuthMode();
        const setMode = useSetAuthMode();
        const initialize = useInitializeAuthMode();
        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
            // 初期化ロジック
          }
        }, [initialize]);

        return { mode, renderCount: renderCount.current };
      });

      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });

    it("複数の個別セレクタを組み合わせても安定している", () => {
      const renderCount = { current: 0 };
      const MAX_RENDERS = 10;

      const { result } = renderHook(() => {
        renderCount.current++;

        // AuthMode関連
        const authMode = useAuthMode();
        const setAuthMode = useSetAuthMode();

        // LLM関連
        const providers = useLLMProviders();
        const fetchProviders = useFetchProviders();

        // Agent関連
        const skills = useSkills();
        const fetchSkills = useFetchSkills();

        const initRef = useRef(false);

        useEffect(() => {
          if (!initRef.current) {
            initRef.current = true;
          }
        }, [setAuthMode, fetchProviders, fetchSkills]);

        return {
          authMode,
          providers,
          skills,
          renderCount: renderCount.current,
        };
      });

      expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
    });
  });

  // 状態更新テスト
  describe("状態更新", () => {
    it("setAuthModeで状態が更新される", async () => {
      // 実装後に有効化
    });

    it("fetchProvidersでプロバイダー一覧が更新される", async () => {
      // 実装後に有効化
    });

    it("fetchSkillsでスキル一覧が更新される", async () => {
      // 実装後に有効化
    });
  });
});
```

### ステップ4: 境界値テスト

```typescript
// apps/desktop/src/renderer/store/__tests__/store.selectors.edge-cases.test.ts

describe("Store Selectors Edge Cases", () => {
  describe("複数コンポーネントでの同時使用", () => {
    it("同じセレクタを複数コンポーネントで使用しても参照が安定", () => {
      // 実装後に有効化
    });
  });

  describe("状態更新時の再レンダリング", () => {
    it("関係ない状態が更新されても関数参照は変わらない", () => {
      // 実装後に有効化
    });
  });

  describe("Store初期化前のアクセス", () => {
    it("Store初期化前でもエラーにならない", () => {
      // 実装後に有効化
    });
  });
});
```

## 統合テスト連携

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                  | テストファイル                        |
| ------------------ | ----------------------------------------- | ------------------------------------- |
| 関数参照安定性     | 再レンダリング間での関数参照の一致        | `*.selectors.test.ts`                 |
| 無限ループ防止     | useEffect依存配列に関数を含めた際の安定性 | `*.selectors.test.ts`                 |
| 状態取得正確性     | 初期状態と更新後の状態が正しく取得される  | `*.selectors.test.ts`                 |
| コンポーネント統合 | 複数セレクタの組み合わせ使用              | `store.selectors.integration.test.ts` |
| エッジケース       | 境界値・異常系                            | `store.selectors.edge-cases.test.ts`  |

## アーキテクチャ層別テスト

| 層               | テスト観点                       | テストファイル配置                                  |
| ---------------- | -------------------------------- | --------------------------------------------------- |
| Renderer Process | 個別セレクタHook、関数参照安定性 | `apps/desktop/src/renderer/store/slices/__tests__/` |
| 状態管理         | Zustandセレクタ、状態更新        | `apps/desktop/src/renderer/store/__tests__/`        |

## 成果物

| 成果物                 | パス                                                                               | 説明                       |
| ---------------------- | ---------------------------------------------------------------------------------- | -------------------------- |
| テスト仕様書           | `outputs/phase-4/test-specification.md`                                            | テスト設計                 |
| authModeセレクタテスト | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` | AuthMode個別セレクタテスト |
| llmセレクタテスト      | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`      | LLM個別セレクタテスト      |
| agentセレクタテスト    | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`    | Agent個別セレクタテスト    |
| 統合テスト             | `apps/desktop/src/renderer/store/__tests__/store.selectors.integration.test.ts`    | セレクタ統合テスト         |
| エッジケーステスト     | `apps/desktop/src/renderer/store/__tests__/store.selectors.edge-cases.test.ts`     | 境界値テスト               |

## 完了条件

- [ ] authModeSlice.selectors.test.ts が作成されている
- [ ] llmSlice.selectors.test.ts が作成されている
- [ ] agentSlice.selectors.test.ts が作成されている
- [ ] 統合テストファイルが作成されている
- [ ] すべてのテストが失敗状態（Red）で実行される
- [ ] テストカバレッジ目標が設定されている（Line 80%+, Branch 60%+）
- [ ] 無限ループ防止テストが含まれている
- [ ] 関数参照安定性テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] 失敗理由が「Hookが存在しない」であること
```

## 次のPhase

Phase 5: 実装（TDD: Green）
