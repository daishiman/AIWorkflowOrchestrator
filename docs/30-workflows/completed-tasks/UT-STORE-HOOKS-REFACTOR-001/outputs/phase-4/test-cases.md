# Phase 4: テスト作成成果物 - テストケース一覧

## メタ情報

| 項目        | 値                                 |
| ----------- | ---------------------------------- |
| Phase       | 4                                  |
| タスクID    | UT-STORE-HOOKS-REFACTOR-001        |
| 機能名      | Zustand Store Hooks 無限ループ修正 |
| 作成日      | 2026-02-11                         |
| 関連Pitfall | P31                                |

## 概要

Phase 4で作成した全テストケースの詳細一覧。各テストの目的、実装仕様、検証内容をまとめています。

## テストケース一覧

### 1. AuthModeSlice個別セレクタテストケース

**テストファイル**: `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts`

#### TC-001: useAuthModeが認証モードを正しく取得できる

| 項目             | 内容                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| テストID         | TC-001                                                                                            |
| テスト名         | useAuthModeが認証モードを正しく取得できる                                                         |
| テストカテゴリー | 状態セレクタテスト                                                                                |
| テスト対象Hook   | `useAuthMode()`                                                                                   |
| 前提条件         | Storeが初期化されている                                                                           |
| テスト手順       | 1. `renderHook(() => useAuthMode())` で Hook をレンダリング<br>2. `result.current` で戻り値を取得 |
| 期待値           | `result.current === "subscription"`                                                               |
| テスト方法       | `expect(result.current).toBe("subscription")`                                                     |
| 優先度           | 必須                                                                                              |
| 状態             | RED                                                                                               |

#### TC-002: useSetAuthModeの参照が再レンダリング間で安定している

| 項目             | 内容                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID         | TC-002                                                                                                                                                 |
| テスト名         | useSetAuthModeの参照が再レンダリング間で安定している                                                                                                   |
| テストカテゴリー | 関数参照安定性テスト                                                                                                                                   |
| テスト対象Hook   | `useSetAuthMode()`                                                                                                                                     |
| 前提条件         | Storeが初期化されている                                                                                                                                |
| テスト手順       | 1. 最初のレンダリングで `useSetAuthMode()` の参照を取得<br>2. `rerender()` を実行<br>3. 2回目のレンダリング後の参照を取得<br>4. 両者を比較             |
| 期待値           | 1回目の参照 === 2回目の参照                                                                                                                            |
| テスト方法       | `const { result, rerender } = renderHook(() => useSetAuthMode()); const firstRef = result.current; rerender(); expect(result.current).toBe(firstRef);` |
| 優先度           | 必須（P31対策）                                                                                                                                        |
| 状態             | RED                                                                                                                                                    |

#### TC-003: useSetAuthModeをuseEffect依存配列に含めても無限ループしない

| 項目               | 内容                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-003                                                                                                                                                                                         |
| テスト名           | useSetAuthModeをuseEffect依存配列に含めても無限ループしない                                                                                                                                    |
| テストカテゴリー   | 無限ループ防止テスト                                                                                                                                                                           |
| テスト対象Hook     | `useSetAuthMode()`                                                                                                                                                                             |
| テスト対象パターン | `useEffect` 依存配列使用パターン                                                                                                                                                               |
| 前提条件           | Storeが初期化されている                                                                                                                                                                        |
| テスト手順         | 1. `renderHook` でコンポーネントをシミュレート<br>2. `useSetAuthMode()` の参照を取得<br>3. `useEffect` の依存配列に `setMode` を含める<br>4. レンダリング回数がMAX_RENDERS未満であることを確認 |
| 期待値             | `renderCount < 10` （MAX_RENDERS=10）                                                                                                                                                          |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                                                                                |
| 重要性             | **最高**（P31問題の根本解決を検証）                                                                                                                                                            |
| 優先度             | 必須                                                                                                                                                                                           |
| 状態               | RED                                                                                                                                                                                            |

#### TC-004: useInitializeAuthModeをuseEffect依存配列に含めても無限ループしない

| 項目               | 内容                                                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-004                                                                                                                                                                                                  |
| テスト名           | useInitializeAuthModeをuseEffect依存配列に含めても無限ループしない                                                                                                                                      |
| テストカテゴリー   | 無限ループ防止テスト                                                                                                                                                                                    |
| テスト対象Hook     | `useInitializeAuthMode()`                                                                                                                                                                               |
| テスト対象パターン | 初期化処理パターン                                                                                                                                                                                      |
| 前提条件           | Storeが初期化されている                                                                                                                                                                                 |
| テスト手順         | 1. `renderHook` でコンポーネントをシミュレート<br>2. `useInitializeAuthMode()` の参照を取得<br>3. `useEffect` 内で初期化フラグをセット（依存配列に `initialize` を含める）<br>4. レンダリング回数を確認 |
| 期待値             | `renderCount < 10`                                                                                                                                                                                      |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                                                                                         |
| 優先度             | 必須                                                                                                                                                                                                    |
| 状態               | RED                                                                                                                                                                                                     |

#### TC-005: useAuthModeIsLoadingがローディング状態を正しく取得できる

| 項目             | 内容                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| テストID         | TC-005                                                                                |
| テスト名         | useAuthModeIsLoadingがローディング状態を正しく取得できる                              |
| テストカテゴリー | 状態セレクタテスト                                                                    |
| テスト対象Hook   | `useAuthModeIsLoading()`                                                              |
| 前提条件         | Storeが初期化されている                                                               |
| テスト手順       | 1. `renderHook(() => useAuthModeIsLoading())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current === false` （初期状態）                                               |
| テスト方法       | `expect(result.current).toBe(false);`                                                 |
| 優先度           | 推奨                                                                                  |
| 状態             | RED                                                                                   |

### 2. LLMSlice個別セレクタテストケース

**テストファイル**: `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`

#### TC-006: useLLMProvidersが空配列を返す（初期状態）

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| テストID         | TC-006                                                                           |
| テスト名         | useLLMProvidersが空配列を返す（初期状態）                                        |
| テストカテゴリー | 状態セレクタテスト                                                               |
| テスト対象Hook   | `useLLMProviders()`                                                              |
| 前提条件         | Storeが初期化されている、プロバイダーがロードされていない                        |
| テスト手順       | 1. `renderHook(() => useLLMProviders())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current` が空配列 `[]`                                                   |
| テスト方法       | `expect(result.current).toEqual([]);`                                            |
| 優先度           | 必須                                                                             |
| 状態             | RED                                                                              |

#### TC-007: useSelectedProviderIdがnullを返す（初期状態）

| 項目             | 内容                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| テストID         | TC-007                                                                                 |
| テスト名         | useSelectedProviderIdがnullを返す（初期状態）                                          |
| テストカテゴリー | 状態セレクタテスト                                                                     |
| テスト対象Hook   | `useSelectedProviderId()`                                                              |
| 前提条件         | Storeが初期化されている、プロバイダーが選択されていない                                |
| テスト手順       | 1. `renderHook(() => useSelectedProviderId())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current === null`                                                              |
| テスト方法       | `expect(result.current).toBeNull();`                                                   |
| 優先度           | 必須                                                                                   |
| 状態             | RED                                                                                    |

#### TC-008: useSelectedModelIdがnullを返す（初期状態）

| 項目             | 内容                                                                                |
| ---------------- | ----------------------------------------------------------------------------------- |
| テストID         | TC-008                                                                              |
| テスト名         | useSelectedModelIdがnullを返す（初期状態）                                          |
| テストカテゴリー | 状態セレクタテスト                                                                  |
| テスト対象Hook   | `useSelectedModelId()`                                                              |
| 前提条件         | Storeが初期化されている、モデルが選択されていない                                   |
| テスト手順       | 1. `renderHook(() => useSelectedModelId())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current === null`                                                           |
| テスト方法       | `expect(result.current).toBeNull();`                                                |
| 優先度           | 必須                                                                                |
| 状態             | RED                                                                                 |

#### TC-009: useLLMIsLoadingがfalseを返す（初期状態）

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| テストID         | TC-009                                                                           |
| テスト名         | useLLMIsLoadingがfalseを返す（初期状態）                                         |
| テストカテゴリー | 状態セレクタテスト                                                               |
| テスト対象Hook   | `useLLMIsLoading()`                                                              |
| 前提条件         | Storeが初期化されている                                                          |
| テスト手順       | 1. `renderHook(() => useLLMIsLoading())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current === false`                                                       |
| テスト方法       | `expect(result.current).toBe(false);`                                            |
| 優先度           | 必須                                                                             |
| 状態             | RED                                                                              |

#### TC-010: useLLMErrorがnullを返す（初期状態）

| 項目             | 内容                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| テストID         | TC-010                                                                       |
| テスト名         | useLLMErrorがnullを返す（初期状態）                                          |
| テストカテゴリー | 状態セレクタテスト                                                           |
| テスト対象Hook   | `useLLMError()`                                                              |
| 前提条件         | Storeが初期化されている、エラーが発生していない                              |
| テスト手順       | 1. `renderHook(() => useLLMError())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current === null`                                                    |
| テスト方法       | `expect(result.current).toBeNull();`                                         |
| 優先度           | 必須                                                                         |
| 状態             | RED                                                                          |

#### TC-011: useFetchProvidersの参照が安定している

| 項目               | 内容                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-011                                                                                                                        |
| テスト名           | useFetchProvidersの参照が安定している                                                                                         |
| テストカテゴリー   | 関数参照安定性テスト                                                                                                          |
| テスト対象Hook     | `useFetchProviders()`                                                                                                         |
| テスト対象パターン | 非同期関数参照の安定性                                                                                                        |
| 前提条件           | Storeが初期化されている                                                                                                       |
| テスト手順         | 1. 最初のレンダリングで `useFetchProviders()` の参照を取得<br>2. `rerender()` を実行<br>3. 2回目の参照を取得<br>4. 両者を比較 |
| 期待値             | 1回目の参照 === 2回目の参照                                                                                                   |
| テスト方法         | `expect(result.current).toBe(firstRef);`                                                                                      |
| 優先度             | 必須（P31対策）                                                                                                               |
| 状態               | RED                                                                                                                           |

#### TC-012: useSelectProviderの参照が安定している

| 項目               | 内容                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-012                                                                                                                        |
| テスト名           | useSelectProviderの参照が安定している                                                                                         |
| テストカテゴリー   | 関数参照安定性テスト                                                                                                          |
| テスト対象Hook     | `useSelectProvider()`                                                                                                         |
| テスト対象パターン | 状態更新関数の参照安定性                                                                                                      |
| 前提条件           | Storeが初期化されている                                                                                                       |
| テスト手順         | 1. 最初のレンダリングで `useSelectProvider()` の参照を取得<br>2. `rerender()` を実行<br>3. 2回目の参照を取得<br>4. 両者を比較 |
| 期待値             | 1回目の参照 === 2回目の参照                                                                                                   |
| テスト方法         | `expect(result.current).toBe(firstRef);`                                                                                      |
| 優先度             | 必須（P31対策）                                                                                                               |
| 状態               | RED                                                                                                                           |

#### TC-013: useSelectModelの参照が安定している

| 項目               | 内容                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-013                                                                                                                     |
| テスト名           | useSelectModelの参照が安定している                                                                                         |
| テストカテゴリー   | 関数参照安定性テスト                                                                                                       |
| テスト対象Hook     | `useSelectModel()`                                                                                                         |
| テスト対象パターン | 状態更新関数の参照安定性                                                                                                   |
| 前提条件           | Storeが初期化されている                                                                                                    |
| テスト手順         | 1. 最初のレンダリングで `useSelectModel()` の参照を取得<br>2. `rerender()` を実行<br>3. 2回目の参照を取得<br>4. 両者を比較 |
| 期待値             | 1回目の参照 === 2回目の参照                                                                                                |
| テスト方法         | `expect(result.current).toBe(firstRef);`                                                                                   |
| 優先度             | 必須（P31対策）                                                                                                            |
| 状態               | RED                                                                                                                        |

#### TC-014: useFetchProvidersをuseEffect依存配列に含めても無限ループしない

| 項目               | 内容                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-014                                                                                                                                                                        |
| テスト名           | useFetchProvidersをuseEffect依存配列に含めても無限ループしない                                                                                                                |
| テストカテゴリー   | 無限ループ防止テスト                                                                                                                                                          |
| テスト対象Hook     | `useFetchProviders()`                                                                                                                                                         |
| テスト対象パターン | 初期化時のデータフェッチパターン                                                                                                                                              |
| 前提条件           | Storeが初期化されている                                                                                                                                                       |
| テスト手順         | 1. `renderHook` でコンポーネントをシミュレート<br>2. `useFetchProviders()` の参照を取得<br>3. `useEffect` の依存配列に `fetchProviders` を含める<br>4. レンダリング回数を確認 |
| 期待値             | `renderCount < 10`                                                                                                                                                            |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                                                               |
| 優先度             | 必須                                                                                                                                                                          |
| 状態               | RED                                                                                                                                                                           |

#### TC-015: useSelectProviderをuseEffect依存配列に含めても無限ループしない

| 項目               | 内容                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-015                                                                                                                                                                        |
| テスト名           | useSelectProviderをuseEffect依存配列に含めても無限ループしない                                                                                                                |
| テストカテゴリー   | 無限ループ防止テスト                                                                                                                                                          |
| テスト対象Hook     | `useSelectProvider()`                                                                                                                                                         |
| テスト対象パターン | ユーザー操作（選択）パターン                                                                                                                                                  |
| 前提条件           | Storeが初期化されている                                                                                                                                                       |
| テスト手順         | 1. `renderHook` でコンポーネントをシミュレート<br>2. `useSelectProvider()` の参照を取得<br>3. `useEffect` の依存配列に `selectProvider` を含める<br>4. レンダリング回数を確認 |
| 期待値             | `renderCount < 10`                                                                                                                                                            |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                                                               |
| 優先度             | 必須                                                                                                                                                                          |
| 状態               | RED                                                                                                                                                                           |

### 3. AgentSlice個別セレクタテストケース

**テストファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`

#### TC-016: useSkillsが空配列を返す（初期状態）

| 項目             | 内容                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| テストID         | TC-016                                                                     |
| テスト名         | useSkillsが空配列を返す（初期状態）                                        |
| テストカテゴリー | 状態セレクタテスト                                                         |
| テスト対象Hook   | `useSkills()`                                                              |
| 前提条件         | Storeが初期化されている、スキルがロードされていない                        |
| テスト手順       | 1. `renderHook(() => useSkills())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current` が空配列 `[]`                                             |
| テスト方法       | `expect(result.current).toEqual([]);`                                      |
| 優先度           | 必須                                                                       |
| 状態             | RED                                                                        |

#### TC-017: useImportedSkillsが空配列を返す（初期状態）

| 項目             | 内容                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| テストID         | TC-017                                                                             |
| テスト名         | useImportedSkillsが空配列を返す（初期状態）                                        |
| テストカテゴリー | 状態セレクタテスト                                                                 |
| テスト対象Hook   | `useImportedSkills()`                                                              |
| 前提条件         | Storeが初期化されている、スキルがインポートされていない                            |
| テスト手順       | 1. `renderHook(() => useImportedSkills())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current` が空配列 `[]`                                                     |
| テスト方法       | `expect(result.current).toEqual([]);`                                              |
| 優先度           | 必須                                                                               |
| 状態             | RED                                                                                |

#### TC-018: useSelectedSkillNameがnullを返す（初期状態）

| 項目             | 内容                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------- |
| テストID         | TC-018                                                                                |
| テスト名         | useSelectedSkillNameがnullを返す（初期状態）                                          |
| テストカテゴリー | 状態セレクタテスト                                                                    |
| テスト対象Hook   | `useSelectedSkillName()`                                                              |
| 前提条件         | Storeが初期化されている、スキルが選択されていない                                     |
| テスト手順       | 1. `renderHook(() => useSelectedSkillName())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current === null`                                                             |
| テスト方法       | `expect(result.current).toBeNull();`                                                  |
| 優先度           | 必須                                                                                  |
| 状態             | RED                                                                                   |

#### TC-019: useIsExecutingがfalseを返す（初期状態）

| 項目             | 内容                                                                            |
| ---------------- | ------------------------------------------------------------------------------- |
| テストID         | TC-019                                                                          |
| テスト名         | useIsExecutingがfalseを返す（初期状態）                                         |
| テストカテゴリー | 状態セレクタテスト                                                              |
| テスト対象Hook   | `useIsExecuting()`                                                              |
| 前提条件         | Storeが初期化されている                                                         |
| テスト手順       | 1. `renderHook(() => useIsExecuting())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current === false`                                                      |
| テスト方法       | `expect(result.current).toBe(false);`                                           |
| 優先度           | 必須                                                                            |
| 状態             | RED                                                                             |

#### TC-020: useSkillErrorがnullを返す（初期状態）

| 項目             | 内容                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| テストID         | TC-020                                                                         |
| テスト名         | useSkillErrorがnullを返す（初期状態）                                          |
| テストカテゴリー | 状態セレクタテスト                                                             |
| テスト対象Hook   | `useSkillError()`                                                              |
| 前提条件         | Storeが初期化されている、エラーが発生していない                                |
| テスト手順       | 1. `renderHook(() => useSkillError())` でHookをレンダリング<br>2. 戻り値を取得 |
| 期待値           | `result.current === null`                                                      |
| テスト方法       | `expect(result.current).toBeNull();`                                           |
| 優先度           | 必須                                                                           |
| 状態             | RED                                                                            |

#### TC-021: useFetchSkillsの参照が安定している

| 項目             | 内容                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| テストID         | TC-021                                                                                                                     |
| テスト名         | useFetchSkillsの参照が安定している                                                                                         |
| テストカテゴリー | 関数参照安定性テスト                                                                                                       |
| テスト対象Hook   | `useFetchSkills()`                                                                                                         |
| 前提条件         | Storeが初期化されている                                                                                                    |
| テスト手順       | 1. 最初のレンダリングで `useFetchSkills()` の参照を取得<br>2. `rerender()` を実行<br>3. 2回目の参照を取得<br>4. 両者を比較 |
| 期待値           | 1回目の参照 === 2回目の参照                                                                                                |
| テスト方法       | `expect(result.current).toBe(firstRef);`                                                                                   |
| 優先度           | 必須（P31対策）                                                                                                            |
| 状態             | RED                                                                                                                        |

#### TC-022: useSelectSkillByNameの参照が安定している

| 項目             | 内容                                                                                                                             |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| テストID         | TC-022                                                                                                                           |
| テスト名         | useSelectSkillByNameの参照が安定している                                                                                         |
| テストカテゴリー | 関数参照安定性テスト                                                                                                             |
| テスト対象Hook   | `useSelectSkillByName()`                                                                                                         |
| 前提条件         | Storeが初期化されている                                                                                                          |
| テスト手順       | 1. 最初のレンダリングで `useSelectSkillByName()` の参照を取得<br>2. `rerender()` を実行<br>3. 2回目の参照を取得<br>4. 両者を比較 |
| 期待値           | 1回目の参照 === 2回目の参照                                                                                                      |
| テスト方法       | `expect(result.current).toBe(firstRef);`                                                                                         |
| 優先度           | 必須（P31対策）                                                                                                                  |
| 状態             | RED                                                                                                                              |

#### TC-023: useExecuteSkillの参照が安定している

| 項目             | 内容                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| テストID         | TC-023                                                                                                                      |
| テスト名         | useExecuteSkillの参照が安定している                                                                                         |
| テストカテゴリー | 関数参照安定性テスト                                                                                                        |
| テスト対象Hook   | `useExecuteSkill()`                                                                                                         |
| 前提条件         | Storeが初期化されている                                                                                                     |
| テスト手順       | 1. 最初のレンダリングで `useExecuteSkill()` の参照を取得<br>2. `rerender()` を実行<br>3. 2回目の参照を取得<br>4. 両者を比較 |
| 期待値           | 1回目の参照 === 2回目の参照                                                                                                 |
| テスト方法       | `expect(result.current).toBe(firstRef);`                                                                                    |
| 優先度           | 必須（P31対策）                                                                                                             |
| 状態             | RED                                                                                                                         |

#### TC-024: useAbortExecutionの参照が安定している

| 項目             | 内容                                                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| テストID         | TC-024                                                                                                                        |
| テスト名         | useAbortExecutionの参照が安定している                                                                                         |
| テストカテゴリー | 関数参照安定性テスト                                                                                                          |
| テスト対象Hook   | `useAbortExecution()`                                                                                                         |
| 前提条件         | Storeが初期化されている                                                                                                       |
| テスト手順       | 1. 最初のレンダリングで `useAbortExecution()` の参照を取得<br>2. `rerender()` を実行<br>3. 2回目の参照を取得<br>4. 両者を比較 |
| 期待値           | 1回目の参照 === 2回目の参照                                                                                                   |
| テスト方法       | `expect(result.current).toBe(firstRef);`                                                                                      |
| 優先度           | 必須（P31対策）                                                                                                               |
| 状態             | RED                                                                                                                           |

#### TC-025: useFetchSkillsをuseEffect依存配列に含めても無限ループしない

| 項目               | 内容                                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-025                                                                                                                                                                  |
| テスト名           | useFetchSkillsをuseEffect依存配列に含めても無限ループしない                                                                                                             |
| テストカテゴリー   | 無限ループ防止テスト                                                                                                                                                    |
| テスト対象Hook     | `useFetchSkills()`                                                                                                                                                      |
| テスト対象パターン | スキル初期化パターン                                                                                                                                                    |
| 前提条件           | Storeが初期化されている                                                                                                                                                 |
| テスト手順         | 1. `renderHook` でコンポーネントをシミュレート<br>2. `useFetchSkills()` の参照を取得<br>3. `useEffect` の依存配列に `fetchSkills` を含める<br>4. レンダリング回数を確認 |
| 期待値             | `renderCount < 10`                                                                                                                                                      |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                                                         |
| 優先度             | 必須                                                                                                                                                                    |
| 状態               | RED                                                                                                                                                                     |

#### TC-026: useSelectSkillByNameをuseEffect依存配列に含めても無限ループしない

| 項目               | 内容                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-026                                                                                                                                                                        |
| テスト名           | useSelectSkillByNameをuseEffect依存配列に含めても無限ループしない                                                                                                             |
| テストカテゴリー   | 無限ループ防止テスト                                                                                                                                                          |
| テスト対象Hook     | `useSelectSkillByName()`                                                                                                                                                      |
| テスト対象パターン | スキル選択パターン                                                                                                                                                            |
| 前提条件           | Storeが初期化されている                                                                                                                                                       |
| テスト手順         | 1. `renderHook` でコンポーネントをシミュレート<br>2. `useSelectSkillByName()` の参照を取得<br>3. `useEffect` の依存配列に `selectSkill` を含める<br>4. レンダリング回数を確認 |
| 期待値             | `renderCount < 10`                                                                                                                                                            |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                                                               |
| 優先度             | 必須                                                                                                                                                                          |
| 状態               | RED                                                                                                                                                                           |

#### TC-027: useExecuteSkillをuseEffect依存配列に含めても無限ループしない

| 項目               | 内容                                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-027                                                                                                                                                                    |
| テスト名           | useExecuteSkillをuseEffect依存配列に含めても無限ループしない                                                                                                              |
| テストカテゴリー   | 無限ループ防止テスト                                                                                                                                                      |
| テスト対象Hook     | `useExecuteSkill()`                                                                                                                                                       |
| テスト対象パターン | スキル実行パターン                                                                                                                                                        |
| 前提条件           | Storeが初期化されている                                                                                                                                                   |
| テスト手順         | 1. `renderHook` でコンポーネントをシミュレート<br>2. `useExecuteSkill()` の参照を取得<br>3. `useEffect` の依存配列に `executeSkill` を含める<br>4. レンダリング回数を確認 |
| 期待値             | `renderCount < 10`                                                                                                                                                        |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                                                           |
| 優先度             | 必須                                                                                                                                                                      |
| 状態               | RED                                                                                                                                                                       |

### 4. 統合テストケース

**テストファイル**: `apps/desktop/src/renderer/store/__tests__/store.selectors.integration.test.ts`

#### TC-028: 個別セレクタを使用すれば無限ループしない

| 項目               | 内容                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID           | TC-028                                                                                                                                     |
| テスト名           | 個別セレクタを使用すれば無限ループしない                                                                                                   |
| テストカテゴリー   | P31解決テスト                                                                                                                              |
| テスト対象パターン | SettingsView初期化パターン                                                                                                                 |
| 前提条件           | Storeが初期化されている                                                                                                                    |
| テスト手順         | 1. 複数の個別セレクタ（mode, setMode, initialize）を使用<br>2. `useEffect` の依存配列に `initialize` を含める<br>3. レンダリング回数を確認 |
| 期待値             | `renderCount < 10` （無限ループしない）                                                                                                    |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                            |
| 優先度             | 必須                                                                                                                                       |
| 状態               | RED                                                                                                                                        |

#### TC-029: 複数の個別セレクタを組み合わせても安定している

| 項目               | 内容                                                                                                                                                                                                                                                                 |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-029                                                                                                                                                                                                                                                               |
| テスト名           | 複数の個別セレクタを組み合わせても安定している                                                                                                                                                                                                                       |
| テストカテゴリー   | 統合テスト                                                                                                                                                                                                                                                           |
| テスト対象パターン | 複数ドメイン統合パターン（AuthMode + LLM + Agent）                                                                                                                                                                                                                   |
| 前提条件           | Storeが初期化されている                                                                                                                                                                                                                                              |
| テスト手順         | 1. AuthMode系セレクタ（useAuthMode, useSetAuthMode）を取得<br>2. LLM系セレクタ（useLLMProviders, useFetchProviders）を取得<br>3. Agent系セレクタ（useSkills, useFetchSkills）を取得<br>4. すべての関数を `useEffect` の依存配列に含める<br>5. レンダリング回数を確認 |
| 期待値             | `renderCount < 10` （複数セレクタ併用でも安定）                                                                                                                                                                                                                      |
| テスト方法         | `expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);`                                                                                                                                                                                                      |
| 重要性             | **高**（実装レベルでのP31解決を検証）                                                                                                                                                                                                                                |
| 優先度             | 必須                                                                                                                                                                                                                                                                 |
| 状態               | RED                                                                                                                                                                                                                                                                  |

#### TC-030: 状態更新テスト（実装後有効化）

| 項目               | 内容                          |
| ------------------ | ----------------------------- |
| テストID           | TC-030                        |
| テスト名           | setAuthModeで状態が更新される |
| テストカテゴリー   | 状態更新テスト                |
| テスト対象パターン | 状態変更パターン              |
| 前提条件           | （実装後）                    |
| テスト手順         | （実装後）                    |
| 期待値             | （実装後）                    |
| テスト方法         | （実装後）                    |
| 優先度             | 推奨                          |
| 状態               | 未実装（実装後有効化）        |

#### TC-031: fetchProvidersでプロバイダー一覧が更新される

| 項目               | 内容                                         |
| ------------------ | -------------------------------------------- |
| テストID           | TC-031                                       |
| テスト名           | fetchProvidersでプロバイダー一覧が更新される |
| テストカテゴリー   | 非同期操作テスト                             |
| テスト対象パターン | 非同期データフェッチパターン                 |
| 前提条件           | （実装後）                                   |
| テスト手順         | （実装後）                                   |
| 期待値             | （実装後）                                   |
| テスト方法         | （実装後）                                   |
| 優先度             | 推奨                                         |
| 状態               | 未実装（実装後有効化）                       |

## テストケース統計

### テストケース分類別集計

| テストカテゴリー     | テスト数 | テストID範囲                                   |
| -------------------- | -------- | ---------------------------------------------- |
| 状態セレクタテスト   | 12個     | TC-001, TC-005, TC-006〜TC-010, TC-016〜TC-020 |
| 関数参照安定性テスト | 9個      | TC-002, TC-011〜TC-013, TC-021〜TC-024         |
| 無限ループ防止テスト | 8個      | TC-003, TC-004, TC-014, TC-015, TC-025〜TC-027 |
| 統合テスト           | 2個      | TC-028, TC-029                                 |
| 状態更新テスト       | 2個      | TC-030, TC-031                                 |
| **合計**             | **33個** |                                                |

### テスト優先度別集計

| 優先度   | テスト数 | 説明                          |
| -------- | -------- | ----------------------------- |
| 必須     | 27個     | P31問題の解決・基本機能の検証 |
| 推奨     | 4個      | 状態更新・補助的な検証        |
| **合計** | **31個** |                               |

### テスト実行状態別集計

| 状態     | テスト数 | 説明                               |
| -------- | -------- | ---------------------------------- |
| RED      | 29個     | Phase 4で作成（実装対象）          |
| 未実装   | 2個      | 実装後有効化対象（TC-030, TC-031） |
| **合計** | **31個** |                                    |

## テストの依存関係

```
Phase 4: テスト作成 (RED)
├─ 状態セレクタテスト (TC-001, TC-005〜TC-010, TC-016〜TC-020)
│  └─ 初期状態の正確性を検証
│
├─ 関数参照安定性テスト (TC-002, TC-011〜TC-013, TC-021〜TC-024)
│  └─ P31問題の根本原因（関数参照の不安定性）に対応
│
├─ 無限ループ防止テスト (TC-003, TC-004, TC-014, TC-015, TC-025〜TC-027)
│  └─ P31問題の現象（無限ループ）に対応
│     └─ 関数参照安定性テストに依存
│
└─ 統合テスト (TC-028, TC-029)
   └─ 複数セレクタ組み合わせでP31が解決されることを検証
      └─ 関数参照安定性テスト、無限ループ防止テストに依存
```

## 次フェーズへの引き継ぎ

Phase 5実装時に、以下のテストケースが GREEN 状態に変わることが期待されます：

- **TC-001〜TC-031**: 個別セレクタHookの実装により、すべてのテストが GREEN 状態に遷移

これにより、P31問題（Zustand Store Hooks無限ループ）が完全に解決されたことが検証可能になります。
