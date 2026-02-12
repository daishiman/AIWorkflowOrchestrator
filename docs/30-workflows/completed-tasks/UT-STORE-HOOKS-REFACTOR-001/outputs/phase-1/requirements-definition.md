# 要件定義書

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | UT-STORE-HOOKS-REFACTOR-001 |
| Phase      | 1                           |
| 作成日     | 2026-02-11                  |
| ステータス | 完了                        |

## 1. 概要

### 1.1 背景

Zustand Store Hooksの合成Hook（`useAuthModeStore()`, `useLLMStore()`等）が毎回新しいオブジェクト参照を生成するため、`useEffect`の依存配列に含めると無限ループが発生する問題（P31）が発生している。

### 1.2 目的

個別セレクタベースの再設計により、P31（無限ループ問題）を抜本的に解決する。

### 1.3 根本原因分析

```typescript
// 問題のあるコード
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    // ... 状態
    fetchMode: state.fetchMode,
    // ... アクション（関数）
  }));
```

**根本原因**:

1. 合成Store Hookは呼び出しのたびに新しいオブジェクト参照を生成
2. Zustandのセレクタは参照等価性で比較するため、毎回再レンダリングが発生
3. 関数（アクション）を含むオブジェクトは`useEffect`の依存配列で無限ループを引き起こす

## 2. 機能要件（FR）

| FR ID | 要件                                         | 優先度 | 現状態       |
| ----- | -------------------------------------------- | ------ | ------------ |
| FR-1  | 各Sliceに個別セレクタHookを追加              | 必須   | 未実装       |
| FR-2  | 状態セレクタ: `useXxx()` 形式で提供          | 必須   | 部分的に実装 |
| FR-3  | アクションセレクタ: `useSetXxx()` 形式で提供 | 必須   | 未実装       |
| FR-4  | 既存の合成Store Hookを非推奨化               | 必須   | 未実装       |
| FR-5  | shallowセレクタによる最適化                  | 推奨   | 未実装       |

## 3. 非機能要件（NFR）

| NFR ID | 要件                                          | 優先度 | 検証方法                     |
| ------ | --------------------------------------------- | ------ | ---------------------------- |
| NFR-1  | 既存APIとの後方互換性維持                     | 必須   | 既存コードのコンパイル・動作 |
| NFR-2  | ESLint `react-hooks/exhaustive-deps` 警告なし | 必須   | ESLint実行結果               |
| NFR-3  | `useRef`ガード不要な設計                      | 必須   | コードレビュー               |
| NFR-4  | 再レンダリング回数の最小化                    | 推奨   | React DevTools Profiler      |
| NFR-5  | TypeScript型安全性の維持                      | 必須   | TypeScriptコンパイル         |
| NFR-6  | テストカバレッジ80%以上                       | 必須   | Vitestカバレッジレポート     |

## 4. 対象Slice別要件

### 4.1 AuthModeSlice

#### 状態セレクタ（既存 + 新規）

| セレクタ名               | 型                 | 状態 | 説明                   |
| ------------------------ | ------------------ | ---- | ---------------------- |
| `useAuthMode`            | `AuthMode`         | 既存 | 認証方式               |
| `useAuthModeStatus`      | `AuthModeStatus`   | 既存 | 認証状態               |
| `useAuthModeLoading`     | `boolean`          | 既存 | ローディング状態       |
| `useAuthModeError`       | `string \| null`   | 既存 | エラーメッセージ       |
| `useIsAuthModeValid`     | `boolean`          | 既存 | 認証有効性             |
| `useIsConfirmDialogOpen` | `boolean`          | 新規 | 確認ダイアログ表示状態 |
| `usePendingMode`         | `AuthMode \| null` | 新規 | 切り替え先認証方式     |

#### アクションセレクタ（新規）

| セレクタ名               | 型                                        | 説明                 |
| ------------------------ | ----------------------------------------- | -------------------- |
| `useFetchAuthMode`       | `() => Promise<void>`                     | 認証方式取得         |
| `useSetAuthMode`         | `(mode: AuthMode) => Promise<void>`       | 認証方式設定         |
| `useFetchAuthModeStatus` | `() => Promise<void>`                     | 認証状態取得         |
| `useValidateAuthMode`    | `() => Promise<AuthModeValidationResult>` | バリデーション       |
| `useOpenConfirmDialog`   | `(targetMode: AuthMode) => void`          | 確認ダイアログ表示   |
| `useCloseConfirmDialog`  | `() => void`                              | 確認ダイアログ閉じる |
| `useConfirmModeChange`   | `() => Promise<void>`                     | 切り替え確定         |
| `useClearAuthModeError`  | `() => void`                              | エラークリア         |
| `useResetAuthMode`       | `() => void`                              | 状態リセット         |
| `useInitializeAuthMode`  | `() => void`                              | 初期化               |

### 4.2 LLMSlice

#### 状態セレクタ（新規）

| セレクタ名              | 型                                                      | 説明               |
| ----------------------- | ------------------------------------------------------- | ------------------ |
| `useLLMProviders`       | `LLMProvider[]`                                         | プロバイダー一覧   |
| `useSelectedProviderId` | `LLMProviderId \| null`                                 | 選択中プロバイダー |
| `useSelectedModelId`    | `string \| null`                                        | 選択中モデル       |
| `useLLMIsLoading`       | `boolean`                                               | ローディング状態   |
| `useLLMError`           | `LLMError \| null`                                      | エラー情報         |
| `useLLMHealthStatus`    | `Record<LLMProviderId, HealthCheckResult \| undefined>` | ヘルス状態         |

#### アクションセレクタ（新規）

| セレクタ名             | 型                                             | 説明             |
| ---------------------- | ---------------------------------------------- | ---------------- |
| `useFetchLLMProviders` | `() => Promise<void>`                          | プロバイダー取得 |
| `useSelectLLMProvider` | `(providerId: LLMProviderId) => void`          | プロバイダー選択 |
| `useSelectLLMModel`    | `(modelId: string) => void`                    | モデル選択       |
| `useCheckLLMHealth`    | `(providerId: LLMProviderId) => Promise<void>` | ヘルスチェック   |
| `useResetLLMSelection` | `() => void`                                   | 選択リセット     |
| `useClearLLMError`     | `() => void`                                   | エラークリア     |
| `useSetLLMLoading`     | `(loading: boolean) => void`                   | ローディング設定 |
| `useSetLLMError`       | `(error: LLMError \| null) => void`            | エラー設定       |

#### 計算セレクタ（新規）

| セレクタ名                  | 型                                       | 説明                   |
| --------------------------- | ---------------------------------------- | ---------------------- |
| `useSelectedLLMProvider`    | `LLMProvider \| undefined`               | 選択中プロバイダー情報 |
| `useSelectedLLMModel`       | `LLMModel \| undefined`                  | 選択中モデル情報       |
| `useIsLLMProviderAvailable` | `(providerId: LLMProviderId) => boolean` | プロバイダー利用可否   |

### 4.3 AgentSlice（主要セレクタ）

#### 優先度: 高

| セレクタ名               | 型                                  | カテゴリ   | 説明                 |
| ------------------------ | ----------------------------------- | ---------- | -------------------- |
| `useImportedSkills`      | `ImportedSkill[]`                   | 状態       | インポート済みスキル |
| `useSelectedSkillName`   | `string \| null`                    | 状態       | 選択中スキル名       |
| `useIsSkillExecuting`    | `boolean`                           | 状態       | 実行中フラグ         |
| `useSkillError`          | `string \| null`                    | 状態       | エラー情報           |
| `useFetchSkills`         | `() => Promise<void>`               | アクション | スキル取得           |
| `useSelectSkillByName`   | `(name: string \| null) => void`    | アクション | スキル選択           |
| `useExecuteSkill`        | `(prompt: string) => Promise<void>` | アクション | スキル実行           |
| `useAbortSkillExecution` | `() => void`                        | アクション | 実行中断             |

## 5. 接続要件

### 5.1 API接続

| 接続要件カテゴリ | 記載内容                                          |
| ---------------- | ------------------------------------------------- |
| API接続          | IPCチャンネル経由のStore操作（変更なし）          |
| 認証フロー       | AuthModeSliceの認証状態管理（変更なし）           |
| データフロー     | セレクタHook -> Zustand Store -> Main Process IPC |

### 5.2 統合テスト観点

| 観点                 | 確認内容                                                |
| -------------------- | ------------------------------------------------------- |
| 無限ループ発生なし   | 個別セレクタを`useEffect`依存配列に含めてもループしない |
| 再レンダリング最適化 | 関連状態のみが更新された時のみ再レンダリング            |
| 後方互換性           | 既存の合成Store Hookが引き続き動作する                  |

## 6. アーキテクチャ層別要件

| 層                         | 確認観点                                     |
| -------------------------- | -------------------------------------------- |
| フロントエンド（Renderer） | セレクタHookの型安全性、再レンダリング最適化 |
| 状態管理                   | Zustand shallow比較、参照等価性              |

## 7. 参照資料

| 資料名                 | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| 既知の落とし穴（P31）  | `.claude/rules/06-known-pitfalls.md`                                         |
| 状態管理ルール         | `.claude/rules/03-state-management.md`                                       |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |
