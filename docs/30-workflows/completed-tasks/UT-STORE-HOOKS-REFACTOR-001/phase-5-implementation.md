# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目        | 値                                 |
| ----------- | ---------------------------------- |
| Phase       | 5                                  |
| タスクID    | UT-STORE-HOOKS-REFACTOR-001        |
| 機能名      | Zustand Store Hooks 無限ループ修正 |
| 作成日      | 2026-02-11                         |
| 関連Pitfall | P31                                |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。個別セレクタHookを追加し、P31（Zustand Store Hooks無限ループ）問題を解決する。

## 実行タスク

- **store/index.ts拡張**: 個別セレクタHookの追加
- **関数参照安定性確保**: useAppStoreの適切なセレクタパターン使用
- **後方互換性維持**: 既存の合成Store Hook（useLLMStore, useSkillStore, useAuthModeStore）は維持

## 参照資料

| 資料名                 | パス                                                                         | 説明               |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 4テスト仕様書    | `docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/phase-4-test-creation.md`     | テスト設計         |
| store/index.ts         | `apps/desktop/src/renderer/store/index.ts`                                   | 既存セレクタ定義   |
| 06-known-pitfalls.md   | `.claude/rules/06-known-pitfalls.md#P31`                                     | P31問題詳細        |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | 実装パターンの正本 |

## 実行手順

### ステップ1: 実装方針の確認

#### 1.1 P31問題の根本原因

合成Store Hook（例: `useLLMStore()`）が毎回新しいオブジェクトを返すため、オブジェクト内の関数参照も毎回変わる。

```typescript
// 問題のあるパターン
export const useLLMStore = () =>
  useAppStore((state) => ({
    providers: state.providers,
    fetchProviders: state.fetchProviders, // 毎回新しいオブジェクトの中で返される
    // ...
  }));

// コンポーネントでの使用
const { fetchProviders } = useLLMStore();
useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // fetchProvidersが毎回変わるため無限ループ
```

#### 1.2 解決策: 個別セレクタHook

各状態/アクションごとに独立したセレクタHookを作成する。

```typescript
// 状態セレクタ: プリミティブ値を直接返す
export const useLLMProviders = () => useAppStore((state) => state.providers);

// アクションセレクタ: 関数を直接返す（参照が安定）
export const useFetchProviders = () =>
  useAppStore((state) => state.fetchProviders);
```

### ステップ2: authModeSlice個別セレクタ実装

**ファイル**: `apps/desktop/src/renderer/store/index.ts`

既存のauthModeセレクタを拡張:

```typescript
// ============================================
// AuthMode selectors - 個別セレクタ（P31対策）
// ============================================

// 状態セレクタ（既存を維持）
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useAuthModeLoading = () => useAppStore((state) => state.isLoading);
export const useAuthModeError = () => useAppStore((state) => state.error);
export const useIsAuthModeValid = () =>
  useAppStore((state) => state.status?.isValid ?? false);

// アクションセレクタ（新規追加）
/**
 * 認証モード設定関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useSetAuthMode = () => useAppStore((state) => state.setMode);

/**
 * 認証モード初期化関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);

/**
 * 認証モード取得関数を取得
 */
export const useFetchAuthMode = () => useAppStore((state) => state.fetchMode);

/**
 * 認証ステータス取得関数を取得
 */
export const useFetchAuthModeStatus = () =>
  useAppStore((state) => state.fetchStatus);

/**
 * 認証モードバリデーション関数を取得
 */
export const useValidateAuthMode = () => useAppStore((state) => state.validate);

/**
 * 確認ダイアログ表示関数を取得
 */
export const useOpenAuthModeConfirmDialog = () =>
  useAppStore((state) => state.openConfirmDialog);

/**
 * 確認ダイアログ非表示関数を取得
 */
export const useCloseAuthModeConfirmDialog = () =>
  useAppStore((state) => state.closeConfirmDialog);

/**
 * 認証モード変更確定関数を取得
 */
export const useConfirmAuthModeChange = () =>
  useAppStore((state) => state.confirmModeChange);

/**
 * エラークリア関数を取得
 */
export const useClearAuthModeError = () =>
  useAppStore((state) => state.clearError);

/**
 * 認証モードリセット関数を取得
 */
export const useResetAuthMode = () =>
  useAppStore((state) => state.resetAuthMode);

// 追加の状態セレクタ
export const useAuthModeIsLoading = () =>
  useAppStore((state) => state.isLoading);
export const useIsAuthModeConfirmDialogOpen = () =>
  useAppStore((state) => state.isConfirmDialogOpen);
export const useAuthModePendingMode = () =>
  useAppStore((state) => state.pendingMode);
```

### ステップ3: llmSlice個別セレクタ実装

**ファイル**: `apps/desktop/src/renderer/store/index.ts`

既存のuseLLMStoreの下に追加:

```typescript
// ============================================
// LLM selectors - 個別セレクタ（P31対策）
// ============================================

// 状態セレクタ
/**
 * LLMプロバイダー一覧を取得
 */
export const useLLMProviders = () => useAppStore((state) => state.providers);

/**
 * 選択中のプロバイダーIDを取得
 */
export const useSelectedProviderId = () =>
  useAppStore((state) => state.selectedProviderId);

/**
 * 選択中のモデルIDを取得
 */
export const useSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);

/**
 * LLMローディング状態を取得
 */
export const useLLMIsLoading = () => useAppStore((state) => state.llmIsLoading);

/**
 * LLMエラー状態を取得
 */
export const useLLMError = () => useAppStore((state) => state.llmError);

/**
 * LLMヘルスステータスを取得
 */
export const useLLMHealthStatus = () =>
  useAppStore((state) => state.healthStatus);

// アクションセレクタ
/**
 * プロバイダー取得関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useFetchProviders = () =>
  useAppStore((state) => state.fetchProviders);

/**
 * プロバイダー選択関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useSelectProvider = () =>
  useAppStore((state) => state.selectProvider);

/**
 * モデル選択関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useSelectModel = () => useAppStore((state) => state.selectModel);

/**
 * ヘルスチェック関数を取得
 */
export const useCheckLLMHealth = () =>
  useAppStore((state) => state.checkHealth);

/**
 * LLM選択リセット関数を取得
 */
export const useResetLLMSelection = () =>
  useAppStore((state) => state.resetSelection);

/**
 * LLMエラークリア関数を取得
 */
export const useClearLLMError = () =>
  useAppStore((state) => state.clearLLMError);

/**
 * LLMローディング設定関数を取得
 */
export const useSetLLMLoading = () =>
  useAppStore((state) => state.setLLMLoading);

/**
 * LLMエラー設定関数を取得
 */
export const useSetLLMError = () => useAppStore((state) => state.setLLMError);

// Computed selectors
/**
 * 選択中のプロバイダーを取得
 */
export const useSelectedProvider = () =>
  useAppStore((state) => state.getSelectedProvider());

/**
 * 選択中のモデルを取得
 */
export const useSelectedModel = () =>
  useAppStore((state) => state.getSelectedModel());

/**
 * プロバイダーが利用可能かチェック
 */
export const useIsProviderAvailable = () =>
  useAppStore((state) => state.isProviderAvailable);
```

### ステップ4: agentSlice個別セレクタ実装

**ファイル**: `apps/desktop/src/renderer/store/index.ts`

既存のuseSkillStoreの下に追加:

```typescript
// ============================================
// Agent/Skill selectors - 個別セレクタ（P31対策）
// ============================================

// 状態セレクタ
/**
 * スキル一覧を取得
 */
export const useSkills = () => useAppStore((state) => state.skills);

/**
 * 利用可能スキル一覧を取得
 */
export const useAvailableSkills = () =>
  useAppStore((state) => state.availableSkills);

/**
 * インポート済みスキルID一覧を取得
 */
export const useImportedSkillIds = () =>
  useAppStore((state) => state.importedSkillIds);

/**
 * 選択中のスキルを取得
 */
export const useSelectedSkill = () =>
  useAppStore((state) => state.selectedSkill);

/**
 * スキルフィルター文字列を取得
 */
export const useSkillFilter = () => useAppStore((state) => state.skillFilter);

/**
 * スキルカテゴリフィルターを取得
 */
export const useSkillCategory = () =>
  useAppStore((state) => state.skillCategory);

/**
 * インポートダイアログ表示状態を取得
 */
export const useIsImportDialogOpen = () =>
  useAppStore((state) => state.isImportDialogOpen);

/**
 * トーストメッセージを取得
 */
export const useToastMessage = () => useAppStore((state) => state.toastMessage);

// skillSliceから統合された状態セレクタ
/**
 * 利用可能なスキルメタデータ一覧を取得
 */
export const useAvailableSkillsMetadata = () =>
  useAppStore((state) => state.availableSkillsMetadata);

/**
 * インポート済みスキル一覧を取得
 */
export const useImportedSkills = () =>
  useAppStore((state) => state.importedSkills);

/**
 * 選択中のスキル名を取得
 */
export const useSelectedSkillName = () =>
  useAppStore((state) => state.selectedSkillName);

/**
 * スキル実行中フラグを取得
 */
export const useIsExecuting = () => useAppStore((state) => state.isExecuting);

/**
 * 実行IDを取得
 */
export const useExecutionId = () => useAppStore((state) => state.executionId);

/**
 * スキル実行ステータスを取得
 */
export const useSkillExecutionStatus = () =>
  useAppStore((state) => state.skillExecutionStatus);

/**
 * ストリーミングメッセージ一覧を取得
 */
export const useStreamingMessages = () =>
  useAppStore((state) => state.streamingMessages);

/**
 * 保留中の権限リクエストを取得
 */
export const usePendingPermission = () =>
  useAppStore((state) => state.pendingPermission);

/**
 * スキルエラー情報を取得
 */
export const useSkillError = () => useAppStore((state) => state.skillError);

/**
 * スキル一覧読み込み中フラグを取得
 */
export const useIsLoadingSkills = () =>
  useAppStore((state) => state.isLoadingSkills);

/**
 * スキャン中フラグを取得
 */
export const useIsScanning = () => useAppStore((state) => state.isScanning);

/**
 * インポート中フラグを取得
 */
export const useIsImporting = () => useAppStore((state) => state.isImporting);

/**
 * インポート中のスキル名を取得
 */
export const useImportingSkillName = () =>
  useAppStore((state) => state.importingSkillName);

// アクションセレクタ
/**
 * スキル一覧設定関数を取得
 */
export const useSetSkills = () => useAppStore((state) => state.setSkills);

/**
 * 利用可能スキル一覧設定関数を取得
 */
export const useSetAvailableSkills = () =>
  useAppStore((state) => state.setAvailableSkills);

/**
 * スキル選択関数を取得
 */
export const useSelectSkill = () => useAppStore((state) => state.selectSkill);

/**
 * スキルフィルター設定関数を取得
 */
export const useSetSkillFilter = () =>
  useAppStore((state) => state.setSkillFilter);

/**
 * スキルカテゴリ設定関数を取得
 */
export const useSetSkillCategory = () =>
  useAppStore((state) => state.setSkillCategory);

/**
 * インポートダイアログ表示関数を取得
 */
export const useOpenImportDialog = () =>
  useAppStore((state) => state.openImportDialog);

/**
 * インポートダイアログ非表示関数を取得
 */
export const useCloseImportDialog = () =>
  useAppStore((state) => state.closeImportDialog);

/**
 * トースト表示関数を取得
 */
export const useShowToast = () => useAppStore((state) => state.showToast);

/**
 * トーストクリア関数を取得
 */
export const useClearToast = () => useAppStore((state) => state.clearToast);

// skillSliceから統合されたアクションセレクタ
/**
 * スキル一覧取得関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useFetchSkills = () => useAppStore((state) => state.fetchSkills);

/**
 * スキル再スキャン関数を取得
 */
export const useRescanSkills = () => useAppStore((state) => state.rescanSkills);

/**
 * スキルインポート関数を取得
 */
export const useImportSkill = () => useAppStore((state) => state.importSkill);

/**
 * スキル削除関数を取得
 */
export const useRemoveSkill = () => useAppStore((state) => state.removeSkill);

/**
 * スキル名で選択する関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useSelectSkillByName = () =>
  useAppStore((state) => state.selectSkillByName);

/**
 * スキル実行関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useExecuteSkill = () => useAppStore((state) => state.executeSkill);

/**
 * 実行中断関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useAbortExecution = () =>
  useAppStore((state) => state.abortExecution);

/**
 * スキル権限応答関数を取得
 */
export const useRespondToSkillPermission = () =>
  useAppStore((state) => state.respondToSkillPermission);

/**
 * スキルエラークリア関数を取得
 */
export const useClearSkillError = () =>
  useAppStore((state) => state.clearSkillError);

/**
 * ストリーミングメッセージクリア関数を取得
 */
export const useClearStreamingMessages = () =>
  useAppStore((state) => state.clearStreamingMessages);

// エージェント実行状態セレクタ
/**
 * エージェント実行状態を取得
 */
export const useAgentExecutionState = () =>
  useAppStore((state) => state.executionState);

/**
 * エージェント実行ステータスを取得
 */
export const useAgentExecutionStatus = () =>
  useAppStore((state) => state.executionStatus);

/**
 * 現在の実行IDを取得
 */
export const useCurrentExecutionId = () =>
  useAppStore((state) => state.currentExecutionId);

/**
 * 実行出力を取得
 */
export const useExecutionOutput = () =>
  useAppStore((state) => state.executionOutput);

// プレビュー関連セレクタ
/**
 * プレビューコンテンツを取得
 */
export const usePreviewContent = () =>
  useAppStore((state) => state.previewContent);

/**
 * 選択中の環境タイプを取得
 */
export const useSelectedEnvironment = () =>
  useAppStore((state) => state.selectedEnvironment);

/**
 * 分割比率を取得
 */
export const useSplitRatio = () => useAppStore((state) => state.splitRatio);

// プレビューアクションセレクタ
/**
 * プレビューコンテンツ設定関数を取得
 */
export const useSetPreviewContent = () =>
  useAppStore((state) => state.setPreviewContent);

/**
 * 環境タイプ設定関数を取得
 */
export const useSetSelectedEnvironment = () =>
  useAppStore((state) => state.setSelectedEnvironment);

/**
 * 分割比率設定関数を取得
 */
export const useSetSplitRatio = () =>
  useAppStore((state) => state.setSplitRatio);

/**
 * プレビュークリア関数を取得
 */
export const useClearPreview = () => useAppStore((state) => state.clearPreview);
```

### ステップ5: 既存コンポーネントのリファクタリングガイド

既存コンポーネントでuseRefパターンを使用している箇所を、個別セレクタに置き換える。

#### 5.1 SettingsView（参考例）

**Before（P31回避のためuseRef使用）**:

```typescript
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);
```

**After（個別セレクタ使用）**:

```typescript
const initializeAuthMode = useInitializeAuthMode();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 参照が安定しているため無限ループしない
```

#### 5.2 LLMSelectorPanel（参考例）

**Before**:

```typescript
const { fetchProviders, selectProvider } = useLLMStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    fetchProviders();
  }
}, []);
```

**After**:

```typescript
const fetchProviders = useFetchProviders();
const selectProvider = useSelectProvider();
useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 参照が安定
```

## 統合テスト連携

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目       | 内容                                    |
| -------------- | --------------------------------------- |
| 状態取得       | 個別セレクタによるプリミティブ値取得    |
| アクション取得 | 個別セレクタによる関数参照取得          |
| 参照安定性     | Zustandの特性を活用した関数参照の安定化 |

## アーキテクチャ層別実装

| 層       | 実装観点             | 実装ファイル配置                           |
| -------- | -------------------- | ------------------------------------------ |
| 状態管理 | 個別セレクタHook定義 | `apps/desktop/src/renderer/store/index.ts` |

## 実装時の注意事項（既知のPitfall対策）

| Pitfall ID | 注意事項                      | 対策                                                                              |
| ---------- | ----------------------------- | --------------------------------------------------------------------------------- |
| P31        | Zustand Store Hooks無限ループ | 個別セレクタで関数参照を安定化。合成Store Hookの関数をuseEffect依存配列に含めない |
| P5         | リスナー二重登録              | React StrictModeでuseEffectが2回実行される。個別セレクタ使用で自然に解決          |

## 成果物

| 成果物         | パス                                       | 説明               |
| -------------- | ------------------------------------------ | ------------------ |
| store/index.ts | `apps/desktop/src/renderer/store/index.ts` | 個別セレクタ追加版 |

## 完了条件

- [ ] authModeSlice用の個別セレクタが追加されている
- [ ] llmSlice用の個別セレクタが追加されている
- [ ] agentSlice用の個別セレクタが追加されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 既存の合成Store Hook（useLLMStore, useSkillStore, useAuthModeStore）が維持されている
- [ ] 型エラーがない（`pnpm typecheck`通過）
- [ ] Lintエラーがない（`pnpm lint`通過）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
