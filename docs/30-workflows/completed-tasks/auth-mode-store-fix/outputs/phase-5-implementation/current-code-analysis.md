# 現状コード分析レポート

## メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| タスクID | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase    | 5 - 実装（事前調査）                 |
| 作成日   | 2026-02-10                           |
| 目的     | 修正対象ファイルの現状把握           |

---

## 1. SettingsView/index.tsx

### 1.1 ファイルパス

```
apps/desktop/src/renderer/views/SettingsView/index.tsx
```

### 1.2 無限ループの原因箇所

#### 行番号: 24-31（useAuthModeStoreの使用）

```typescript
// Auth mode store
const {
  mode: authMode,
  status: authModeStatus,
  isLoading: authModeLoading,
  setMode: setAuthMode,
  initializeAuthMode,
} = useAuthModeStore();
```

#### 行番号: 34-36（問題のuseEffect）

```typescript
// Initialize auth mode on mount
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);
```

### 1.3 問題分析

- `useAuthModeStore()` は合成フックであり、毎回新しいオブジェクトを返す
- `initializeAuthMode` は毎回新しい関数参照を持つ
- 依存配列に `initializeAuthMode` を含めることで、レンダリングごとにuseEffectが再実行される
- これが無限ループの直接的原因

### 1.4 仕様書との比較

| 項目       | 仕様書（phase-2-design.md 2.1.1） | 現在のコード | 一致 |
| ---------- | --------------------------------- | ------------ | ---- |
| コード内容 | L34-36と同一                      | L34-36       | YES  |
| 行番号     | L34-36                            | L34-36       | YES  |

---

## 2. LLMSelectorPanel.tsx

### 2.1 ファイルパス

```
apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx
```

### 2.2 無限ループの原因箇所

#### 行番号: 26-37（useLLMStoreの使用）

```typescript
const {
  providers,
  selectedProviderId,
  selectedModelId,
  isLoading,
  error,
  healthStatus,
  fetchProviders,
  selectProvider,
  selectModel,
  checkHealth,
} = useLLMStore();
```

#### 行番号: 49-51（問題のuseEffect #1 - fetchProviders）

```typescript
// Fetch providers on mount
useEffect(() => {
  fetchProviders();
}, [fetchProviders]);
```

#### 行番号: 54-58（問題のuseEffect #2 - checkHealth）

```typescript
// Check health when provider changes
useEffect(() => {
  if (selectedProviderId) {
    checkHealth(selectedProviderId);
  }
}, [selectedProviderId, checkHealth]);
```

### 2.3 問題分析

- `useLLMStore()` は合成フックであり、毎回新しいオブジェクトを返す
- `fetchProviders` と `checkHealth` は毎回新しい関数参照を持つ
- 依存配列にこれらを含めることで、レンダリングごとにuseEffectが再実行される

### 2.4 仕様書との比較

| 項目           | 仕様書（phase-2-design.md 2.2.1） | 現在のコード | 一致 |
| -------------- | --------------------------------- | ------------ | ---- |
| fetchProviders | L49-51と同一                      | L49-51       | YES  |
| checkHealth    | L54-58と同一                      | L54-58       | YES  |
| 行番号（記載） | L49-58                            | L49-58       | YES  |

---

## 3. SkillSelector.tsx

### 3.1 ファイルパス

```
apps/desktop/src/renderer/components/skill/SkillSelector.tsx
```

### 3.2 確認対象箇所

#### 行番号: 157-164（useSkillStoreの使用）

```typescript
const {
  availableSkills,
  importedSkills,
  selectedSkillName,
  isScanning,
  selectSkillByName,
  rescanSkills,
} = useSkillStore();
```

#### 行番号: 287-289（問題のuseCallback - handleRescan）

```typescript
const handleRescan = useCallback(() => {
  rescanSkills();
}, [rescanSkills]);
```

### 3.3 問題分析

- `useSkillStore()` は合成フックであり、毎回新しいオブジェクトを返す
- `rescanSkills` は毎回新しい関数参照を持つ
- useCallbackの依存配列に `rescanSkills` を含めることで、`handleRescan` が毎レンダリングで新しい参照になる
- これ自体は無限ループの直接原因ではないが、不必要な再生成が発生している

### 3.4 仕様書との比較

| 項目       | 仕様書（phase-2-design.md 2.3.1） | 現在のコード | 一致 |
| ---------- | --------------------------------- | ------------ | ---- |
| コード内容 | L287-289と同一                    | L287-289     | YES  |
| 行番号     | L287-289                          | L287-289     | YES  |

---

## 4. store/index.ts

### 4.1 ファイルパス

```
apps/desktop/src/renderer/store/index.ts
```

### 4.2 根本原因箇所

#### 行番号: 264-283（useLLMStore - 合成フック）

```typescript
// LLM selectors - single hook for all LLM-related state and actions
export const useLLMStore = () =>
  useAppStore((state) => ({
    providers: state.providers,
    selectedProviderId: state.selectedProviderId,
    selectedModelId: state.selectedModelId,
    isLoading: state.llmIsLoading,
    error: state.llmError,
    healthStatus: state.healthStatus,
    fetchProviders: state.fetchProviders,
    selectProvider: state.selectProvider,
    selectModel: state.selectModel,
    checkHealth: state.checkHealth,
    resetSelection: state.resetSelection,
    clearError: state.clearLLMError,
    setLoading: state.setLLMLoading,
    setError: state.setLLMError,
    getSelectedProvider: state.getSelectedProvider,
    getSelectedModel: state.getSelectedModel,
    isProviderAvailable: state.isProviderAvailable,
  }));
```

#### 行番号: 286-315（useSkillStore - 合成フック）

```typescript
// Skill selectors - single hook for all Skill-related state and actions
export const useSkillStore = () =>
  useAppStore((state) => ({
    // 状態
    availableSkills: state.availableSkills,
    importedSkills: state.importedSkills,
    selectedSkillName: state.selectedSkillName,
    isExecuting: state.isExecuting,
    executionId: state.executionId,
    executionStatus: state.executionStatus,
    streamingMessages: state.streamingMessages,
    pendingPermission: state.pendingPermission,
    skillError: state.skillError,
    // ローディング状態
    isLoadingSkills: state.isLoadingSkills,
    isScanning: state.isScanning,
    isImporting: state.isImporting,
    importingSkillName: state.importingSkillName,
    // アクション
    fetchSkills: state.fetchSkills,
    rescanSkills: state.rescanSkills,
    importSkill: state.importSkill,
    removeSkill: state.removeSkill,
    selectSkill: state.selectSkill,
    selectSkillByName: state.selectSkillByName,
    executeSkill: state.executeSkill,
    abortExecution: state.abortExecution,
    respondToPermission: state.respondToPermission,
    clearError: state.clearError,
    clearStreamingMessages: state.clearStreamingMessages,
  }));
```

#### 行番号: 318-338（useAuthModeStore - 合成フック）

```typescript
// AuthMode selectors - single hook for all AuthMode-related state and actions
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    // 状態
    mode: state.mode,
    status: state.status,
    isLoading: state.isLoading,
    error: state.error,
    isConfirmDialogOpen: state.isConfirmDialogOpen,
    pendingMode: state.pendingMode,
    // アクション
    fetchMode: state.fetchMode,
    setMode: state.setMode,
    fetchStatus: state.fetchStatus,
    validate: state.validate,
    openConfirmDialog: state.openConfirmDialog,
    closeConfirmDialog: state.closeConfirmDialog,
    confirmModeChange: state.confirmModeChange,
    clearError: state.clearError,
    resetAuthMode: state.resetAuthMode,
    initializeAuthMode: state.initializeAuthMode,
  }));
```

### 4.3 根本原因分析

**問題のパターン:**

```typescript
export const useXxxStore = () =>
  useAppStore((state) => ({
    // 毎回新しいオブジェクトを生成
    someFunction: state.someFunction,
    // ...
  }));
```

**なぜ無限ループが発生するか:**

1. `useAppStore((state) => ({ ... }))` は毎回新しいオブジェクトを返す
2. オブジェクト内の関数（`initializeAuthMode`等）も毎回新しい参照として認識される
3. この関数をuseEffectの依存配列に含めると、毎レンダリングで再実行される
4. 再実行により状態が更新され、再レンダリングが発生
5. 1に戻り、無限ループ

---

## 5. 調査結果まとめ

### 5.1 仕様書との整合性

| ファイル               | 仕様書記載の行番号 | 実際の行番号   | 整合性   |
| ---------------------- | ------------------ | -------------- | -------- |
| SettingsView/index.tsx | L34-36             | L34-36         | 完全一致 |
| LLMSelectorPanel.tsx   | L49-51, L54-58     | L49-51, L54-58 | 完全一致 |
| SkillSelector.tsx      | L287-289           | L287-289       | 完全一致 |

### 5.2 修正が必要な箇所一覧

| ファイル               | 行番号   | 問題のコード                             | 修正方法                        |
| ---------------------- | -------- | ---------------------------------------- | ------------------------------- |
| SettingsView/index.tsx | L34-36   | `}, [initializeAuthMode]);`              | useRef + 空依存配列             |
| LLMSelectorPanel.tsx   | L49-51   | `}, [fetchProviders]);`                  | useRef + 空依存配列             |
| LLMSelectorPanel.tsx   | L54-58   | `}, [selectedProviderId, checkHealth]);` | useRef + selectedProviderIdのみ |
| SkillSelector.tsx      | L287-289 | `}, [rescanSkills]);`                    | 空依存配列                      |

### 5.3 Phase 5 実装への推奨事項

1. **仕様書（phase-2-design.md）の記載と現状コードが完全一致している**ため、仕様書通りの修正を適用可能
2. import文への `useRef` 追加を忘れないこと
3. ESLintの `exhaustive-deps` 警告抑制コメントを必ず追加すること

---

## 6. 調査完了チェックリスト

- [x] SettingsView/index.tsx の無限ループ原因箇所を特定
- [x] LLMSelectorPanel.tsx の無限ループ原因箇所を特定
- [x] SkillSelector.tsx の依存配列問題箇所を特定
- [x] store/index.ts の合成フック問題を確認
- [x] 仕様書（phase-2-design.md）との整合性を確認
- [x] 具体的な行番号と該当コードを記載
