# Phase 2: 設計

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 2                           |
| 機能名 | UT-STORE-HOOKS-REFACTOR-001 |
| 作成日 | 2026-02-11                  |

## 目的

個別セレクタパターンの詳細設計を行い、P31（無限ループ問題）を抜本的に解決するアーキテクチャを定義する。

## 実行タスク

- アーキテクチャ設計: 個別セレクタパターンの設計
- セレクタ分類: 状態セレクタ/アクションセレクタ/計算セレクタの設計
- 最適化設計: shallowセレクタによる再レンダリング最適化の設計

## 参照資料

| 資料名                 | パス                                                                         | 説明                   |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------- |
| 要件定義書             | `./phase-1-requirements.md`                                                  | Phase 1成果物          |
| Zustand公式            | https://docs.pmnd.rs/zustand/guides/prevent-rerenders                        | 再レンダリング防止     |
| 状態管理ルール         | `.claude/rules/03-state-management.md`                                       | Zustand設計原則        |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | 個別セレクタ設計の正本 |

## 実行手順

### 1. 個別セレクタパターン設計

#### 1.1 設計原則

**原則1: 単一値セレクタ**

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

**原則2: アクションは直接参照**

```typescript
// DO: Zustandのアクションは参照が変わらない
export const useSetAuthMode = () => useAppStore((state) => state.setMode);

// 理由: Zustandのset/get関数はStore作成時に一度だけ生成され、
// その後は同じ参照を返すため、依存配列に含めても無限ループしない
```

**原則3: 計算セレクタは派生値のみ**

```typescript
// DO: 状態から計算される派生値
export const useIsAuthModeValid = () =>
  useAppStore((state) => state.status?.isValid ?? false);
```

#### 1.2 セレクタ分類

| 分類               | 命名パターン                         | 戻り値                    | 例                     |
| ------------------ | ------------------------------------ | ------------------------- | ---------------------- |
| 状態セレクタ       | `useXxx`                             | プリミティブ/オブジェクト | `useAuthMode()`        |
| アクションセレクタ | `useXxxAction` または `useSetXxx`    | 関数                      | `useSetAuthMode()`     |
| 計算セレクタ       | `useIsXxx`, `useHasXxx`, `useGetXxx` | 計算値                    | `useIsAuthModeValid()` |

#### 1.3 既存実装の活用

以下の個別セレクタは既に`arch-state-management.md`に基づき実装されています：

| Slice         | 既存セレクタ           | 用途                     |
| ------------- | ---------------------- | ------------------------ |
| authModeSlice | `useAuthMode()`        | 認証モード値の取得       |
| authModeSlice | `useAuthModeStatus()`  | 認証ステータスの取得     |
| authModeSlice | `useAuthModeLoading()` | ローディング状態の取得   |
| authModeSlice | `useAuthModeError()`   | エラー状態の取得         |
| authModeSlice | `useIsAuthModeValid()` | 認証モード有効性の計算値 |

これらを活用し、合成Hook（`useAuthModeStore()`）の参照を段階的に個別セレクタに置き換えます。

#### 1.4 代替案比較

| アプローチ               | メリット                          | デメリット                         | 採用判定   |
| ------------------------ | --------------------------------- | ---------------------------------- | ---------- |
| **個別セレクタ（採用）** | 参照安定、Zustand推奨、テスト容易 | セレクタ関数が増加                 | 採用       |
| useCallback/useMemo      | ローカルメモ化可能                | 毎レンダー管理必要、根本解決でない | 不採用     |
| zustand/shallow          | オブジェクト比較最適化            | 構造変更で無効化、問題を隠蔽       | 補助的使用 |
| useRefガード（現状）     | 即座に無限ループ回避              | ESLint警告抑制必須、技術的負債     | 短期のみ   |

**選定理由**: 個別セレクタパターンはZustand公式ドキュメントで推奨されており、参照の安定性が保証されます。合成Hookが毎回新しいオブジェクトを返す問題を根本から解決できます。

#### 1.5 マイグレーション戦略

##### Phase A: 個別セレクタへの移行

```typescript
// 修正前（useRefガード必須）
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);

// 修正後（依存配列に含めても安全）
const initializeAuthMode = useInitializeAuthMode();
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);
```

##### Phase B: 合成Hookの非推奨化（将来）

1. `useAuthModeStore()`, `useLLMStore()` に `@deprecated` JSDocを追加
2. 新規コードでは個別セレクタのみ使用
3. 既存コードは段階的に移行（破壊的変更なし）

##### 移行優先度

| コンポーネント                 | 優先度 | 理由                     |
| ------------------------------ | ------ | ------------------------ |
| SettingsView/index.tsx         | 高     | 無限ループ問題の発生箇所 |
| LLMSettingsCard.tsx            | 高     | 無限ループ問題の発生箇所 |
| SkillSettingsSection.tsx       | 高     | 無限ループ問題の発生箇所 |
| その他`useAuthModeStore()`使用 | 中     | 潜在的リスクあり         |
| その他`useLLMStore()`使用      | 中     | 潜在的リスクあり         |

### 2. AuthModeSlice設計

#### 2.1 状態セレクタ

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

#### 2.2 アクションセレクタ

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

#### 2.3 合成Store Hook（非推奨化）

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

### 3. LLMSlice設計

#### 3.1 状態セレクタ

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

#### 3.2 アクションセレクタ

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

#### 3.3 計算セレクタ

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

### 4. AgentSlice設計（主要部分）

#### 4.1 スキル関連状態セレクタ

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

#### 4.2 スキル関連アクションセレクタ

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

### 5. shallow比較による最適化（オプション）

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

### 6. 移行パターン

#### 6.1 既存コードの移行例

**Before (問題あり)**

```typescript
// SettingsView/index.tsx
const { mode, initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);
```

**After (推奨)**

```typescript
// SettingsView/index.tsx
const mode = useAuthMode();
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 安全に依存配列に含められる
```

## 統合テスト連携【必須】

### 統合ポイント/契約

| 統合ポイント      | 契約定義                        |
| ----------------- | ------------------------------- |
| セレクタ -> Store | 単一値の取得、参照等価性の保証  |
| アクション参照    | Zustandのアクションは参照が不変 |
| 計算セレクタ      | 依存状態が変わった時のみ再計算  |

### 設計検証項目

| 検証項目             | 確認方法                                         |
| -------------------- | ------------------------------------------------ |
| 無限ループ発生なし   | アクションセレクタを依存配列に含めたテスト       |
| 再レンダリング最小化 | React DevToolsのProfilerで再レンダリング回数確認 |
| 型安全性             | TypeScriptコンパイルエラーなし                   |

## アーキテクチャ層別設計

| 層               | 設計観点                               | 仕様参照先                             |
| ---------------- | -------------------------------------- | -------------------------------------- |
| Renderer Process | 個別セレクタHook、再レンダリング最適化 | 本ドキュメント                         |
| 状態管理         | Zustand shallow比較、参照等価性保証    | `.claude/rules/03-state-management.md` |

## 成果物

| 成果物       | パス                     | 説明               |
| ------------ | ------------------------ | ------------------ |
| 設計書       | 本ドキュメント           | アーキテクチャ設計 |
| セレクタ一覧 | 本ドキュメント内テーブル | 全セレクタの設計   |

## 完了条件

- [x] アーキテクチャが定義されている
- [x] 全Sliceの個別セレクタが設計されている
- [x] 移行パターンが定義されている
- [x] 要件との整合性が確認されている
- [x] 統合ポイント/契約が設計に反映されている
- [x] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
