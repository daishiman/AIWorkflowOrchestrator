# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| 機能名 | UT-STORE-HOOKS-REFACTOR-001 |
| 作成日 | 2026-02-11                  |

## 目的

Zustand Store Hooksの個別セレクタベース再設計に関する要件を定義し、P31（無限ループ問題）の抜本的解決策の受け入れ基準を明確化する。

## 実行タスク

- 要件抽出: P31問題の根本原因から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名                 | パス                                                                         | 説明                      |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| 既知の落とし穴（P31）  | `.claude/rules/06-known-pitfalls.md`                                         | 無限ループ問題の詳細      |
| 状態管理ルール         | `.claude/rules/03-state-management.md`                                       | Zustand設計原則           |
| store/index.ts         | `apps/desktop/src/renderer/store/index.ts`                                   | 現在の合成Store Hook実装  |
| authModeSlice.ts       | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                    | 認証方式Slice             |
| llmSlice.ts            | `apps/desktop/src/renderer/store/slices/llmSlice.ts`                         | LLM Slice                 |
| agentSlice.ts          | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                       | Agent Slice               |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | P31対策パターン・設計根拠 |
| 設定画面UI仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`        | SettingsView状態管理      |
| LLMセレクタUI仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`    | LLMSelector状態管理       |

## 実行手順

### 1. 要件抽出

#### 1.1 問題の根本原因分析

**P31: Zustand Store Hooks無限ループ**

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

- 合成Store Hookは呼び出しのたびに新しいオブジェクト参照を生成
- Zustandのセレクタは参照等価性で比較するため、毎回再レンダリングが発生
- 関数（アクション）を含むオブジェクトは`useEffect`の依存配列で無限ループを引き起こす

### 2. 機能要件（FR）

| FR ID | 要件                                         | 優先度 | 状態         |
| ----- | -------------------------------------------- | ------ | ------------ |
| FR-1  | 各Sliceに個別セレクタHookを追加              | 必須   | 未実装       |
| FR-2  | 状態セレクタ: `useXxx()` 形式で提供          | 必須   | 部分的に実装 |
| FR-3  | アクションセレクタ: `useSetXxx()` 形式で提供 | 必須   | 未実装       |
| FR-4  | 既存の合成Store Hookを非推奨化               | 必須   | 未実装       |
| FR-5  | shallowセレクタによる最適化                  | 推奨   | 未実装       |

### 3. 非機能要件（NFR）

| NFR ID | 要件                                          | 優先度 | 状態 |
| ------ | --------------------------------------------- | ------ | ---- |
| NFR-1  | 既存APIとの後方互換性維持                     | 必須   | -    |
| NFR-2  | ESLint `react-hooks/exhaustive-deps` 警告なし | 必須   | -    |
| NFR-3  | `useRef`ガード不要な設計                      | 必須   | -    |
| NFR-4  | 再レンダリング回数の最小化                    | 推奨   | -    |
| NFR-5  | TypeScript型安全性の維持                      | 必須   | -    |
| NFR-6  | テストカバレッジ80%以上                       | 必須   | -    |

### 4. 対象Slice別要件

#### 4.1 AuthModeSlice

**状態セレクタ（既存 + 新規）**

| セレクタ名               | 型              | 状態  | 説明                   |
| ------------------------ | --------------- | ----- | ---------------------- | ------------------ |
| `useAuthMode`            | `AuthMode`      | 既存  | 認証方式               |
| `useAuthModeStatus`      | `AuthModeStatus | null` | 既存                   | 認証状態           |
| `useAuthModeLoading`     | `boolean`       | 既存  | ローディング状態       |
| `useAuthModeError`       | `string         | null` | 既存                   | エラーメッセージ   |
| `useIsAuthModeValid`     | `boolean`       | 既存  | 認証有効性             |
| `useIsConfirmDialogOpen` | `boolean`       | 新規  | 確認ダイアログ表示状態 |
| `usePendingMode`         | `AuthMode       | null` | 新規                   | 切り替え先認証方式 |

**アクションセレクタ（新規）**

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

#### 4.2 LLMSlice

**状態セレクタ（新規）**

| セレクタ名              | 型                                       | 説明             |
| ----------------------- | ---------------------------------------- | ---------------- | ------------------ |
| `useLLMProviders`       | `LLMProvider[]`                          | プロバイダー一覧 |
| `useSelectedProviderId` | `LLMProviderId                           | null`            | 選択中プロバイダー |
| `useSelectedModelId`    | `string                                  | null`            | 選択中モデル       |
| `useLLMIsLoading`       | `boolean`                                | ローディング状態 |
| `useLLMError`           | `LLMError                                | null`            | エラー情報         |
| `useLLMHealthStatus`    | `Record<LLMProviderId, HealthCheckResult | undefined>`      | ヘルス状態         |

**アクションセレクタ（新規）**

| セレクタ名             | 型                                             | 説明             |
| ---------------------- | ---------------------------------------------- | ---------------- | ---------- |
| `useFetchLLMProviders` | `() => Promise<void>`                          | プロバイダー取得 |
| `useSelectLLMProvider` | `(providerId: LLMProviderId) => void`          | プロバイダー選択 |
| `useSelectLLMModel`    | `(modelId: string) => void`                    | モデル選択       |
| `useCheckLLMHealth`    | `(providerId: LLMProviderId) => Promise<void>` | ヘルスチェック   |
| `useResetLLMSelection` | `() => void`                                   | 選択リセット     |
| `useClearLLMError`     | `() => void`                                   | エラークリア     |
| `useSetLLMLoading`     | `(loading: boolean) => void`                   | ローディング設定 |
| `useSetLLMError`       | `(error: LLMError                              | null) => void`   | エラー設定 |

**計算セレクタ（新規）**

| セレクタ名                  | 型                                       | 説明                 |
| --------------------------- | ---------------------------------------- | -------------------- | ---------------------- |
| `useSelectedLLMProvider`    | `LLMProvider                             | undefined`           | 選択中プロバイダー情報 |
| `useSelectedLLMModel`       | `LLMModel                                | undefined`           | 選択中モデル情報       |
| `useIsLLMProviderAvailable` | `(providerId: LLMProviderId) => boolean` | プロバイダー利用可否 |

#### 4.3 AgentSlice（主要なもの抜粋）

AgentSliceは状態・アクションが多いため、主要なものを優先的に実装する。

**優先度: 高**

| セレクタ名               | 型                                  | カテゴリ       | 説明                 |
| ------------------------ | ----------------------------------- | -------------- | -------------------- | -------------- |
| `useImportedSkills`      | `ImportedSkill[]`                   | 状態           | インポート済みスキル |
| `useSelectedSkillName`   | `string                             | null`          | 状態                 | 選択中スキル名 |
| `useIsSkillExecuting`    | `boolean`                           | 状態           | 実行中フラグ         |
| `useSkillError`          | `string                             | null`          | 状態                 | エラー情報     |
| `useFetchSkills`         | `() => Promise<void>`               | アクション     | スキル取得           |
| `useSelectSkillByName`   | `(name: string                      | null) => void` | アクション           | スキル選択     |
| `useExecuteSkill`        | `(prompt: string) => Promise<void>` | アクション     | スキル実行           |
| `useAbortSkillExecution` | `() => void`                        | アクション     | 実行中断             |

## 統合テスト連携【必須】

### 接続要件

| 接続要件カテゴリ | 記載内容                                          |
| ---------------- | ------------------------------------------------- |
| API接続          | IPCチャンネル経由のStore操作（変更なし）          |
| 認証フロー       | AuthModeSliceの認証状態管理（変更なし）           |
| データフロー     | セレクタHook -> Zustand Store -> Main Process IPC |

### 統合テスト観点

| 観点                 | 確認内容                                                |
| -------------------- | ------------------------------------------------------- |
| 無限ループ発生なし   | 個別セレクタを`useEffect`依存配列に含めてもループしない |
| 再レンダリング最適化 | 関連状態のみが更新された時のみ再レンダリング            |
| 後方互換性           | 既存の合成Store Hookが引き続き動作する                  |

## アーキテクチャ層別要件

| 層                         | 確認観点                                     |
| -------------------------- | -------------------------------------------- |
| フロントエンド（Renderer） | セレクタHookの型安全性、再レンダリング最適化 |
| 状態管理                   | Zustand shallow比較、参照等価性              |

## 成果物

| 成果物       | パス                                         | 説明           |
| ------------ | -------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 本ドキュメント |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義         |

## 完了条件

- [x] 全要件が抽出されている
- [x] 各要件に受け入れ基準がある
- [x] FR/NFRが分類されている
- [x] 接続要件（API/認証/データフロー）が明記されている
- [x] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 受け入れ基準（Acceptance Criteria）

### AC-1: 無限ループ解消

```typescript
// 以下のパターンで無限ループが発生しないこと
const fetchProviders = useFetchLLMProviders();
useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // ESLint警告なし、無限ループなし
```

### AC-2: 後方互換性

```typescript
// 既存コードが引き続き動作すること
const { mode, fetchMode } = useAuthModeStore(); // 非推奨だが動作する
```

### AC-3: 型安全性

```typescript
// 正しい型推論が効くこと
const mode = useAuthMode(); // AuthMode型として推論
const setMode = useSetAuthMode(); // (mode: AuthMode) => Promise<void>として推論
```

### AC-4: 再レンダリング最適化

```typescript
// 無関係な状態変更で再レンダリングしないこと
const mode = useAuthMode();
// status変更時に再レンダリングしない
```

## 次のPhase

Phase 2: 設計
