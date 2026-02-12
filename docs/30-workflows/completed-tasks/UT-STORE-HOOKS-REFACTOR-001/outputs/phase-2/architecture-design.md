# アーキテクチャ設計書

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| 機能名     | UT-STORE-HOOKS-REFACTOR-001 |
| Phase      | 2                           |
| 作成日     | 2026-02-11                  |
| ステータス | 完了                        |

## 1. 設計概要

### 1.1 目的

個別セレクタパターンの詳細設計を行い、P31（無限ループ問題）を抜本的に解決するアーキテクチャを定義する。

### 1.2 設計原則

#### 原則1: 単一値セレクタ

```typescript
// DO: 単一の状態値を返す
export const useAuthMode = () => useAppStore((state) => state.mode);

// DON'T: 複数の値をオブジェクトで返す
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    status: state.status,
  }));
```

#### 原則2: アクションは直接参照

```typescript
// DO: Zustandのアクションは参照が変わらない
export const useSetAuthMode = () => useAppStore((state) => state.setMode);

// 理由: Zustandのset/get関数はStore作成時に一度だけ生成され、
// その後は同じ参照を返すため、依存配列に含めても無限ループしない
```

#### 原則3: 計算セレクタは派生値のみ

```typescript
// DO: 状態から計算される派生値
export const useIsAuthModeValid = () =>
  useAppStore((state) => state.status?.isValid ?? false);
```

## 2. セレクタ分類

| 分類               | 命名パターン                         | 戻り値                    | 例                     |
| ------------------ | ------------------------------------ | ------------------------- | ---------------------- |
| 状態セレクタ       | `useXxx`                             | プリミティブ/オブジェクト | `useAuthMode()`        |
| アクションセレクタ | `useXxxAction` または `useSetXxx`    | 関数                      | `useSetAuthMode()`     |
| 計算セレクタ       | `useIsXxx`, `useHasXxx`, `useGetXxx` | 計算値                    | `useIsAuthModeValid()` |

## 3. 代替案比較

| アプローチ               | メリット                          | デメリット                         | 採用判定   |
| ------------------------ | --------------------------------- | ---------------------------------- | ---------- |
| **個別セレクタ（採用）** | 参照安定、Zustand推奨、テスト容易 | セレクタ関数が増加                 | 採用       |
| useCallback/useMemo      | ローカルメモ化可能                | 毎レンダー管理必要、根本解決でない | 不採用     |
| zustand/shallow          | オブジェクト比較最適化            | 構造変更で無効化、問題を隠蔽       | 補助的使用 |
| useRefガード（現状）     | 即座に無限ループ回避              | ESLint警告抑制必須、技術的負債     | 短期のみ   |

**選定理由**: 個別セレクタパターンはZustand公式ドキュメントで推奨されており、参照の安定性が保証される。合成Hookが毎回新しいオブジェクトを返す問題を根本から解決できる。

## 4. AuthModeSlice設計

### 4.1 状態セレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts

// 既存（維持）
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useAuthModeLoading = () => useAppStore((state) => state.isLoading);
export const useAuthModeError = () => useAppStore((state) => state.error);
export const useIsAuthModeValid = () =>
  useAppStore((state) => state.status?.isValid ?? false);

// 新規追加
export const useIsConfirmDialogOpen = () =>
  useAppStore((state) => state.isConfirmDialogOpen);
export const usePendingMode = () => useAppStore((state) => state.pendingMode);
```

### 4.2 アクションセレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts

// 認証方式操作
export const useFetchAuthMode = () => useAppStore((state) => state.fetchMode);
export const useSetAuthMode = () => useAppStore((state) => state.setMode);
export const useFetchAuthModeStatus = () =>
  useAppStore((state) => state.fetchStatus);
export const useValidateAuthMode = () => useAppStore((state) => state.validate);

// 確認ダイアログ操作
export const useOpenConfirmDialog = () =>
  useAppStore((state) => state.openConfirmDialog);
export const useCloseConfirmDialog = () =>
  useAppStore((state) => state.closeConfirmDialog);
export const useConfirmModeChange = () =>
  useAppStore((state) => state.confirmModeChange);

// その他操作
export const useClearAuthModeError = () =>
  useAppStore((state) => state.clearError);
export const useResetAuthMode = () =>
  useAppStore((state) => state.resetAuthMode);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
```

### 4.3 合成Store Hook（非推奨化）

```typescript
/**
 * @deprecated 個別セレクタを使用してください
 * @see useAuthMode, useSetAuthMode など
 *
 * 理由: 合成Store Hookは毎回新しいオブジェクトを返すため、
 * useEffectの依存配列に含めると無限ループが発生する可能性があります。
 *
 * @example
 * // Before (非推奨)
 * const { mode, fetchMode } = useAuthModeStore();
 *
 * // After (推奨)
 * const mode = useAuthMode();
 * const fetchMode = useFetchAuthMode();
 */
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    // ... 既存のまま（後方互換性のため維持）
  }));
```

## 5. LLMSlice設計

### 5.1 状態セレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts

export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useSelectedProviderId = () =>
  useAppStore((state) => state.selectedProviderId);
export const useSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);
export const useLLMIsLoading = () => useAppStore((state) => state.llmIsLoading);
export const useLLMError = () => useAppStore((state) => state.llmError);
export const useLLMHealthStatus = () =>
  useAppStore((state) => state.healthStatus);
```

### 5.2 アクションセレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts

export const useFetchLLMProviders = () =>
  useAppStore((state) => state.fetchProviders);
export const useSelectLLMProvider = () =>
  useAppStore((state) => state.selectProvider);
export const useSelectLLMModel = () =>
  useAppStore((state) => state.selectModel);
export const useCheckLLMHealth = () =>
  useAppStore((state) => state.checkHealth);
export const useResetLLMSelection = () =>
  useAppStore((state) => state.resetSelection);
export const useClearLLMError = () =>
  useAppStore((state) => state.clearLLMError);
export const useSetLLMLoading = () =>
  useAppStore((state) => state.setLLMLoading);
export const useSetLLMError = () => useAppStore((state) => state.setLLMError);
```

### 5.3 計算セレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts

/**
 * 選択中のプロバイダー情報を取得
 * 注意: 状態依存の計算のため、providersまたはselectedProviderIdが変わると再計算される
 */
export const useSelectedLLMProvider = () =>
  useAppStore((state) => {
    if (!state.selectedProviderId) return undefined;
    return state.providers.find((p) => p.id === state.selectedProviderId);
  });

/**
 * 選択中のモデル情報を取得
 */
export const useSelectedLLMModel = () =>
  useAppStore((state) => {
    if (!state.selectedProviderId || !state.selectedModelId) return undefined;
    const provider = state.providers.find(
      (p) => p.id === state.selectedProviderId,
    );
    if (!provider) return undefined;
    return provider.models.find((m) => m.id === state.selectedModelId);
  });
```

## 6. AgentSlice設計（主要部分）

### 6.1 スキル関連状態セレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts

// スキル一覧
export const useAvailableSkillsMetadata = () =>
  useAppStore((state) => state.availableSkillsMetadata);
export const useImportedSkills = () =>
  useAppStore((state) => state.importedSkills);
export const useSelectedSkillName = () =>
  useAppStore((state) => state.selectedSkillName);

// 実行状態
export const useIsSkillExecuting = () =>
  useAppStore((state) => state.isExecuting);
export const useSkillExecutionId = () =>
  useAppStore((state) => state.executionId);
export const useSkillExecutionStatus = () =>
  useAppStore((state) => state.skillExecutionStatus);
export const useStreamingMessages = () =>
  useAppStore((state) => state.streamingMessages);
export const usePendingSkillPermission = () =>
  useAppStore((state) => state.pendingPermission);
export const useSkillError = () => useAppStore((state) => state.skillError);

// ローディング状態
export const useIsLoadingSkills = () =>
  useAppStore((state) => state.isLoadingSkills);
export const useIsScanningSkills = () =>
  useAppStore((state) => state.isScanning);
export const useIsImportingSkill = () =>
  useAppStore((state) => state.isImporting);
export const useImportingSkillName = () =>
  useAppStore((state) => state.importingSkillName);
```

### 6.2 スキル関連アクションセレクタ

```typescript
// apps/desktop/src/renderer/store/index.ts

// スキル操作
export const useFetchSkills = () => useAppStore((state) => state.fetchSkills);
export const useRescanSkills = () => useAppStore((state) => state.rescanSkills);
export const useImportSkill = () => useAppStore((state) => state.importSkill);
export const useRemoveSkill = () => useAppStore((state) => state.removeSkill);
export const useSelectSkillByName = () =>
  useAppStore((state) => state.selectSkillByName);

// 実行操作
export const useExecuteSkill = () => useAppStore((state) => state.executeSkill);
export const useAbortSkillExecution = () =>
  useAppStore((state) => state.abortExecution);
export const useRespondToSkillPermission = () =>
  useAppStore((state) => state.respondToSkillPermission);

// エラー/クリア操作
export const useClearSkillError = () =>
  useAppStore((state) => state.clearSkillError);
export const useClearStreamingMessages = () =>
  useAppStore((state) => state.clearStreamingMessages);
```

## 7. shallow比較による最適化（オプション）

複数の状態を1つのセレクタで取得する必要がある場合、`shallow`比較を使用して不要な再レンダリングを防ぐ。

```typescript
import { useShallow } from "zustand/react/shallow";

/**
 * 認証方式の状態をまとめて取得（shallow比較版）
 *
 * 使用シーン: 複数の状態を同時に使用するが、個別に取得すると
 * コードが冗長になる場合
 *
 * 注意: アクション（関数）は含めないこと
 */
export const useAuthModeState = () =>
  useAppStore(
    useShallow((state) => ({
      mode: state.mode,
      status: state.status,
      isLoading: state.isLoading,
      error: state.error,
    })),
  );
```

## 8. アーキテクチャ層別設計

| 層               | 設計観点                               | 仕様参照先                             |
| ---------------- | -------------------------------------- | -------------------------------------- |
| Renderer Process | 個別セレクタHook、再レンダリング最適化 | 本ドキュメント                         |
| 状態管理         | Zustand shallow比較、参照等価性保証    | `.claude/rules/03-state-management.md` |

## 9. 統合ポイント/契約

| 統合ポイント      | 契約定義                        |
| ----------------- | ------------------------------- |
| セレクタ -> Store | 単一値の取得、参照等価性の保証  |
| アクション参照    | Zustandのアクションは参照が不変 |
| 計算セレクタ      | 依存状態が変わった時のみ再計算  |

## 10. 設計検証項目

| 検証項目             | 確認方法                                         |
| -------------------- | ------------------------------------------------ |
| 無限ループ発生なし   | アクションセレクタを依存配列に含めたテスト       |
| 再レンダリング最小化 | React DevToolsのProfilerで再レンダリング回数確認 |
| 型安全性             | TypeScriptコンパイルエラーなし                   |

## 11. 参照資料

| 資料名                 | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| Zustand公式ガイド      | https://docs.pmnd.rs/zustand/guides/prevent-rerenders                        |
| 状態管理ルール         | `.claude/rules/03-state-management.md`                                       |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |
