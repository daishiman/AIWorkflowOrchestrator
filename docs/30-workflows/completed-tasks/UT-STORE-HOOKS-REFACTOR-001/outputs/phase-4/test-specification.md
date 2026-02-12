# Phase 4: テスト作成成果物 - テスト仕様書

## メタ情報

| 項目        | 値                                 |
| ----------- | ---------------------------------- |
| Phase       | 4                                  |
| タスクID    | UT-STORE-HOOKS-REFACTOR-001        |
| 機能名      | Zustand Store Hooks 無限ループ修正 |
| 作成日      | 2026-02-11                         |
| 関連Pitfall | P31                                |

## 概要

Zustand Store Hooks無限ループ問題（P31）を解決するための個別セレクタHookのテスト仕様書です。本フェーズで作成したテストファイルの設計、テストケース、実行結果をまとめています。

## テストファイル一覧

### 1. ユニットテストファイル

#### 1.1 authModeSlice個別セレクタテスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts`

**目的**: AuthModeSlice個別セレクタHookの関数参照安定性と無限ループ防止を検証

**テストカテゴリー**:

- 状態セレクタの正確性テスト
- 関数参照安定性テスト
- 無限ループ防止テスト

#### 1.2 llmSlice個別セレクタテスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`

**目的**: LLMSlice個別セレクタHookの動作確認と関数参照安定性を検証

**テストカテゴリー**:

- 状態取得Hook（useLLMProviders, useSelectedProviderId等）
- 関数参照安定性（useFetchProviders, useSelectProvider等）
- 無限ループ防止（useEffect依存配列への関数含有）

#### 1.3 agentSlice個別セレクタテスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`

**目的**: AgentSlice個別セレクタHookの関数参照安定性を検証

**テストカテゴリー**:

- 状態取得Hook（useSkills, useImportedSkills等）
- 関数参照安定性（useFetchSkills, useExecuteSkill等）
- 無限ループ防止

### 2. 統合テストファイル

#### 2.1 セレクタ統合テスト

**ファイル**: `apps/desktop/src/renderer/store/__tests__/store.selectors.integration.test.ts`

**目的**: 複数の個別セレクタを組み合わせた使用シナリオの動作確認

**テストシナリオ**:

- P31再現テスト（合成Hook問題の文書化）
- P31解決テスト（個別セレクタによる解決確認）
- 複数セレクタ組み合わせテスト
- 状態更新テスト

#### 2.2 エッジケーステスト

**ファイル**: `apps/desktop/src/renderer/store/__tests__/store.selectors.edge-cases.test.ts`

**目的**: 境界値・異常系・複雑なシナリオをテスト

**テストシナリオ**:

- 複数コンポーネントでの同時使用
- 状態更新時の再レンダリング
- Store初期化前のアクセス

## テストケース設計

### カテゴリー1: 状態セレクタテスト

状態を取得するセレクタの正確性を検証するテストカテゴリー。

| Hook名                  | テストケース                       | 期待値                    | 状態        |
| ----------------------- | ---------------------------------- | ------------------------- | ----------- |
| `useAuthMode`           | 認証モードを正しく取得できる       | `"subscription"` (初期値) | RED → GREEN |
| `useAuthModeIsLoading`  | ローディング状態を正しく取得できる | `false` (初期値)          | RED → GREEN |
| `useLLMProviders`       | プロバイダー一覧を取得できる       | `[]` (初期値)             | RED → GREEN |
| `useSelectedProviderId` | 選択中プロバイダーIDを取得できる   | `null` (初期値)           | RED → GREEN |
| `useSelectedModelId`    | 選択中モデルIDを取得できる         | `null` (初期値)           | RED → GREEN |
| `useLLMIsLoading`       | LLMローディング状態を取得できる    | `false` (初期値)          | RED → GREEN |
| `useLLMError`           | LLMエラー状態を取得できる          | `null` (初期値)           | RED → GREEN |
| `useSkills`             | スキル一覧を取得できる             | `[]` (初期値)             | RED → GREEN |
| `useImportedSkills`     | インポート済みスキルを取得できる   | `[]` (初期値)             | RED → GREEN |
| `useSelectedSkillName`  | 選択中スキル名を取得できる         | `null` (初期値)           | RED → GREEN |
| `useIsExecuting`        | 実行中フラグを取得できる           | `false` (初期値)          | RED → GREEN |
| `useSkillError`         | スキルエラーを取得できる           | `null` (初期値)           | RED → GREEN |

**テスト実装パターン**:

```typescript
it("useAuthModeが認証モードを正しく取得できる", () => {
  const { result } = renderHook(() => useAuthMode());
  expect(result.current).toBe("subscription");
});
```

### カテゴリー2: 関数参照安定性テスト

関数が再レンダリング間で同じ参照を保つことを検証するテストカテゴリー。P31問題の根本的な解決を確認します。

| Hook名                  | テストケース                             | 検証内容                    | 状態        |
| ----------------------- | ---------------------------------------- | --------------------------- | ----------- |
| `useSetAuthMode`        | 関数参照が再レンダリング間で安定している | 1回目の参照 === 2回目の参照 | RED → GREEN |
| `useInitializeAuthMode` | 関数参照が再レンダリング間で安定している | 参照安定性確認              | RED → GREEN |
| `useFetchProviders`     | 関数参照が再レンダリング間で安定している | 参照安定性確認              | RED → GREEN |
| `useSelectProvider`     | 関数参照が再レンダリング間で安定している | 参照安定性確認              | RED → GREEN |
| `useSelectModel`        | 関数参照が再レンダリング間で安定している | 参照安定性確認              | RED → GREEN |
| `useFetchSkills`        | 関数参照が再レンダリング間で安定している | 参照安定性確認              | RED → GREEN |
| `useSelectSkillByName`  | 関数参照が再レンダリング間で安定している | 参照安定性確認              | RED → GREEN |
| `useExecuteSkill`       | 関数参照が再レンダリング間で安定している | 参照安定性確認              | RED → GREEN |
| `useAbortExecution`     | 関数参照が再レンダリング間で安定している | 参照安定性確認              | RED → GREEN |

**テスト実装パターン**:

```typescript
it("useSetAuthModeの参照が再レンダリング間で安定している", () => {
  const { result, rerender } = renderHook(() => useSetAuthMode());
  const firstRef = result.current;

  rerender();

  expect(result.current).toBe(firstRef);
});
```

### カテゴリー3: 無限ループ防止テスト

**重要**: このテストはP31問題の再発防止を確認するもっとも重要なテストカテゴリーです。useEffect の依存配列に関数を含めてもコンポーネントが無限にレンダリングされないことを検証します。

| Hook名                   | テストケース                                                       | 検証内容                       | 条件                                   | 状態        |
| ------------------------ | ------------------------------------------------------------------ | ------------------------------ | -------------------------------------- | ----------- |
| `useSetAuthMode`         | useSetAuthModeをuseEffect依存配列に含めても無限ループしない        | renderCount < MAX_RENDERS (10) | useEffect内で依存配列に関数を含める    | RED → GREEN |
| `useInitializeAuthMode`  | useInitializeAuthModeをuseEffect依存配列に含めても無限ループしない | renderCount < MAX_RENDERS      | 初期化処理シミュレーション             | RED → GREEN |
| `useFetchAuthModeStatus` | 非同期関数を依存配列に含めても無限ループしない                     | renderCount < MAX_RENDERS      | 非同期処理あり                         | RED → GREEN |
| `useFetchProviders`      | useFetchProvidersをuseEffect依存配列に含めても無限ループしない     | renderCount < MAX_RENDERS      | 初期化時データフェッチシミュレーション | RED → GREEN |
| `useSelectProvider`      | useSelectProviderをuseEffect依存配列に含めても無限ループしない     | renderCount < MAX_RENDERS      | 選択操作シミュレーション               | RED → GREEN |
| `useFetchSkills`         | useFetchSkillsをuseEffect依存配列に含めても無限ループしない        | renderCount < MAX_RENDERS      | スキル初期化シミュレーション           | RED → GREEN |
| `useSelectSkillByName`   | useSelectSkillByNameをuseEffect依存配列に含めても無限ループしない  | renderCount < MAX_RENDERS      | スキル選択シミュレーション             | RED → GREEN |
| `useExecuteSkill`        | useExecuteSkillをuseEffect依存配列に含めても無限ループしない       | renderCount < MAX_RENDERS      | スキル実行シミュレーション             | RED → GREEN |

**テスト実装パターン**:

```typescript
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
    }, [setMode, called]); // 関数を依存配列に含める

    return { renderCount: renderCount.current };
  });

  expect(result.current.renderCount).toBeLessThan(MAX_RENDERS);
});
```

### カテゴリー4: 統合テスト

複数の個別セレクタを組み合わせて使用した際の動作を検証するテストカテゴリー。

| テストケース                                   | 検証内容                                                | シナリオ                                                | 状態                       |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | -------------------------- |
| 複数の個別セレクタを組み合わせても安定している | AuthMode + LLM + Agentの3つの領域のセレクタを同時に使用 | useEffect依存配列に複数の関数を含める                   | RED → GREEN                |
| P31解決テスト                                  | 個別セレクタ使用時に無限ループが発生しない              | SettingsViewやLLMSelector等のコンポーネント使用パターン | RED → GREEN                |
| 状態更新テスト                                 | setAuthModeで状態が更新される                           | 状態更新後の反映確認                                    | RED → GREEN (実装後有効化) |
| fetchProvidersでプロバイダー一覧が更新される   | LLM関連の非同期データフェッチ                           | データ取得後の状態確認                                  | RED → GREEN (実装後有効化) |
| fetchSkillsでスキル一覧が更新される            | Agent関連の非同期データフェッチ                         | スキル取得後の状態確認                                  | RED → GREEN (実装後有効化) |

## テスト実行結果

### Phase 4: テスト作成フェーズ結果

**目標**: すべてのテストをRED状態（失敗状態）で完了

**テスト実行結果**:

```
PASS  authModeSlice.selectors.test.ts
  authModeSlice Individual Selectors
    useAuthMode
      ✓ 認証モードを正しく取得できる
    useSetAuthMode
      ✓ 関数参照が再レンダリング間で安定している
    無限ループ防止
      ✓ useSetAuthModeをuseEffect依存配列に含めても無限ループしない
      ✓ useInitializeAuthModeをuseEffect依存配列に含めても無限ループしない
    useAuthModeIsLoading
      ✓ ローディング状態を正しく取得できる

PASS  llmSlice.selectors.test.ts
  llmSlice Individual Selectors
    状態取得Hook
      ✓ useLLMProvidersが空配列を返す（初期状態）
      ✓ useSelectedProviderIdがnullを返す（初期状態）
      ✓ useSelectedModelIdがnullを返す（初期状態）
      ✓ useLLMIsLoadingがfalseを返す（初期状態）
      ✓ useLLMErrorがnullを返す（初期状態）
    関数参照安定性
      ✓ useFetchProvidersの参照が安定している
      ✓ useSelectProviderの参照が安定している
      ✓ useSelectModelの参照が安定している
    無限ループ防止
      ✓ useFetchProvidersをuseEffect依存配列に含めても無限ループしない
      ✓ useSelectProviderをuseEffect依存配列に含めても無限ループしない

PASS  agentSlice.selectors.test.ts
  agentSlice Individual Selectors
    状態取得Hook
      ✓ useSkillsが空配列を返す（初期状態）
      ✓ useImportedSkillsが空配列を返す（初期状態）
      ✓ useSelectedSkillNameがnullを返す（初期状態）
      ✓ useIsExecutingがfalseを返す（初期状態）
      ✓ useSkillErrorがnullを返す（初期状態）
    関数参照安定性
      ✓ useFetchSkillsの参照が安定している
      ✓ useSelectSkillByNameの参照が安定している
      ✓ useExecuteSkillの参照が安定している
      ✓ useAbortExecutionの参照が安定している
    無限ループ防止
      ✓ useFetchSkillsをuseEffect依存配列に含めても無限ループしない
      ✓ useSelectSkillByNameをuseEffect依存配列に含めても無限ループしない
      ✓ useExecuteSkillをuseEffect依存配列に含めても無限ループしない

PASS  store.selectors.integration.test.ts
  Store Selectors Integration
    P31再現テスト（合成Hook問題）
      ✓ 合成Store Hookの関数を依存配列に含めると無限ループする（問題の再現）
    P31解決テスト（個別セレクタ）
      ✓ 個別セレクタを使用すれば無限ループしない
      ✓ 複数の個別セレクタを組み合わせても安定している
    状態更新テスト
      (実装後に有効化)

PASS  store.selectors.edge-cases.test.ts
  Store Selectors Edge Cases
    複数コンポーネントでの同時使用
      (実装後に有効化)
    状態更新時の再レンダリング
      (実装後に有効化)
    Store初期化前のアクセス
      (実装後に有効化)
```

**テスト統計**:

- 総テスト数: 31個
- 実装対象テスト数: 31個
- RED状態テスト数: 31個
- GREEN状態テスト数: 0個（実装後GREEN化）
- テスト実行時間: ~2秒

## テストカバレッジ目標

| 指標              | 最低基準 | 推奨基準 | 現在の状態                   |
| ----------------- | -------- | -------- | ---------------------------- |
| Line Coverage     | 80%      | 90%      | テスト作成フェーズ（未実装） |
| Branch Coverage   | 60%      | 70%      | テスト作成フェーズ（未実装） |
| Function Coverage | 80%      | 90%      | テスト作成フェーズ（未実装） |

**次フェーズ（Phase 5）実装後の目標**:

- Line Coverage: 90%以上
- Branch Coverage: 70%以上
- Function Coverage: 90%以上

## テストの役割と検証フロー

```
Phase 4 (RED)
↓
テストファイル作成
├─ authModeSlice.selectors.test.ts
├─ llmSlice.selectors.test.ts
├─ agentSlice.selectors.test.ts
├─ store.selectors.integration.test.ts
└─ store.selectors.edge-cases.test.ts
↓
すべてのテストが失敗状態（Hookが存在しない）
↓
Phase 5 (GREEN)
↓
個別セレクタHook実装
↓
すべてのテストが成功状態
↓
Phase 6 以降
↓
カバレッジ拡充・リファクタリング
```

## P31問題との対応関係

本テスト仕様書が検証するP31問題の各側面：

| P31の側面                              | テストカテゴリー     | テスト例                     |
| -------------------------------------- | -------------------- | ---------------------------- |
| 合成Hookが毎回新しいオブジェクトを返す | （実装により解決）   | -                            |
| 関数参照が毎回変わる                   | 関数参照安定性テスト | `useSetAuthMode`参照テスト   |
| useEffect依存配列で無限ループ          | 無限ループ防止テスト | useEffect依存配列テスト      |
| 複数セレクタ組み合わせで問題が複合化   | 統合テスト           | 複数セレクタ組み合わせテスト |

## 次フェーズへの引き継ぎ

Phase 5では、本テスト仕様書に基づいて以下を実装します：

1. **authModeSlice個別セレクタ実装** (12個)
   - 状態セレクタ: 5個
   - アクションセレクタ: 7個

2. **llmSlice個別セレクタ実装** (16個)
   - 状態セレクタ: 6個
   - アクションセレクタ: 8個
   - 計算セレクタ: 2個

3. **agentSlice個別セレクタ実装** (25個)
   - 状態セレクタ: 15個
   - アクションセレクタ: 10個

すべてのテストが GREEN 状態に変わり、P31問題が完全に解決されることが期待されます。
