# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 5                                      |
| 機能名 | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 作成日 | 2026-02-12                             |

## 目的

Phase 4で作成したテストを通すため、各コンポーネントを個別セレクタHook使用に移行し、useRefガードを削除する。

## 実行タスク

- 個別セレクタHook実装: Store に個別セレクタHookを追加
- コンポーネント移行: 3コンポーネントの合成Hook→個別セレクタ移行
- useRefガード削除: P31対策ガードを削除して無限ループしないことを確認

## 参照資料

| 資料名           | パス                                                            | 説明                    |
| ---------------- | --------------------------------------------------------------- | ----------------------- |
| Phase 4成果物    | `outputs/phase-4/test-specification.md`                         | テスト設計              |
| Store実装        | `apps/desktop/src/renderer/store/index.ts`                      | 現在のStore Hook実装    |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | 移行対象コンポーネント1 |
| SkillSelector    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | 移行対象コンポーネント2 |
| SettingsView     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | 移行対象コンポーネント3 |

## 実行手順

### ステップ1: 個別セレクタHook実装

#### 1.1 Store への個別セレクタ追加

**ファイル**: `apps/desktop/src/renderer/store/index.ts`

```typescript
// ============================================
// LLM Individual Selectors
// ============================================
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMSelectedProviderId = () =>
  useAppStore((state) => state.selectedProviderId);
export const useLLMSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);
export const useLLMIsLoading = () => useAppStore((state) => state.llmIsLoading);
export const useLLMError = () => useAppStore((state) => state.llmError);
export const useLLMHealthStatus = () =>
  useAppStore((state) => state.healthStatus);
export const useLLMFetchProviders = () =>
  useAppStore((state) => state.fetchProviders);
export const useLLMSelectProvider = () =>
  useAppStore((state) => state.selectProvider);
export const useLLMSelectModel = () =>
  useAppStore((state) => state.selectModel);
export const useLLMCheckHealth = () =>
  useAppStore((state) => state.checkHealth);
export const useLLMResetSelection = () =>
  useAppStore((state) => state.resetSelection);
export const useLLMClearError = () =>
  useAppStore((state) => state.clearLLMError);

// ============================================
// Skill Individual Selectors
// ============================================
export const useAvailableSkillsMetadata = () =>
  useAppStore((state) => state.availableSkillsMetadata);
export const useImportedSkills = () =>
  useAppStore((state) => state.importedSkills);
export const useSelectedSkillName = () =>
  useAppStore((state) => state.selectedSkillName);
export const useIsSkillExecuting = () =>
  useAppStore((state) => state.isExecuting);
export const useSkillError = () => useAppStore((state) => state.skillError);
export const useIsLoadingSkills = () =>
  useAppStore((state) => state.isLoadingSkills);
export const useIsScanning = () => useAppStore((state) => state.isScanning);
export const useIsImporting = () => useAppStore((state) => state.isImporting);
export const useFetchSkills = () => useAppStore((state) => state.fetchSkills);
export const useRescanSkills = () => useAppStore((state) => state.rescanSkills);
export const useImportSkill = () => useAppStore((state) => state.importSkill);
export const useRemoveSkill = () => useAppStore((state) => state.removeSkill);
export const useSelectSkill = () => useAppStore((state) => state.selectSkill);
export const useSelectSkillByName = () =>
  useAppStore((state) => state.selectSkillByName);
export const useExecuteSkill = () => useAppStore((state) => state.executeSkill);
export const useClearSkillError = () =>
  useAppStore((state) => state.clearSkillError);

// ============================================
// AuthMode Individual Selectors (追加分)
// ============================================
// 既存: useAuthMode, useAuthModeStatus, useAuthModeLoading, useAuthModeError, useIsAuthModeValid

export const useSetAuthMode = () => useAppStore((state) => state.setMode);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
export const useFetchAuthMode = () => useAppStore((state) => state.fetchMode);
export const useFetchAuthModeStatus = () =>
  useAppStore((state) => state.fetchStatus);
export const useValidateAuthMode = () => useAppStore((state) => state.validate);
export const useClearAuthModeError = () =>
  useAppStore((state) => state.clearError);
export const useResetAuthMode = () =>
  useAppStore((state) => state.resetAuthMode);
```

### ステップ2: LLMSelectorPanel コンポーネント移行

#### 2.1 Before（現在の実装）

```typescript
// apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx
import { useLLMStore } from "@/renderer/store";

export const LLMSelectorPanel: React.FC<LLMSelectorPanelProps> = ({ ... }) => {
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

  // P31対策: useRefガード
  const providersFetchedRef = useRef(false);
  useEffect(() => {
    if (!providersFetchedRef.current) {
      providersFetchedRef.current = true;
      fetchProviders();
    }
  }, []);

  // P31対策: checkHealthもuseRefガード
  const prevProviderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedProviderId && selectedProviderId !== prevProviderIdRef.current) {
      prevProviderIdRef.current = selectedProviderId;
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId]);
  // ...
};
```

#### 2.2 After（移行後の実装）

```typescript
// apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx
import {
  useLLMProviders,
  useLLMSelectedProviderId,
  useLLMSelectedModelId,
  useLLMIsLoading,
  useLLMError,
  useLLMHealthStatus,
  useLLMFetchProviders,
  useLLMSelectProvider,
  useLLMSelectModel,
  useLLMCheckHealth,
} from "@/renderer/store";

export const LLMSelectorPanel: React.FC<LLMSelectorPanelProps> = ({ ... }) => {
  // 個別セレクタによる参照安定性
  const providers = useLLMProviders();
  const selectedProviderId = useLLMSelectedProviderId();
  const selectedModelId = useLLMSelectedModelId();
  const isLoading = useLLMIsLoading();
  const error = useLLMError();
  const healthStatus = useLLMHealthStatus();
  const fetchProviders = useLLMFetchProviders();
  const selectProvider = useLLMSelectProvider();
  const selectModel = useLLMSelectModel();
  const checkHealth = useLLMCheckHealth();

  // useRefガード不要: 個別セレクタは参照が安定
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]); // fetchProvidersの参照は安定

  // useRefガード不要: selectedProviderIdの変更時のみ実行
  const prevProviderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedProviderId && selectedProviderId !== prevProviderIdRef.current) {
      prevProviderIdRef.current = selectedProviderId;
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId, checkHealth]); // checkHealthの参照は安定
  // ...
};
```

### ステップ3: SkillSelector コンポーネント移行

#### 3.1 Before（現在の実装）

```typescript
// apps/desktop/src/renderer/components/skill/SkillSelector.tsx
import { useSkillStore } from "../../store";

export const SkillSelector: React.FC<SkillSelectorProps> = ({ ... }) => {
  const {
    availableSkillsMetadata,
    importedSkills,
    selectedSkillName,
    isScanning,
    selectSkillByName,
    rescanSkills,
  } = useSkillStore();

  // P31対策: rescanSkillsは参照が不安定なため依存配列から除外
  const handleRescan = useCallback(() => {
    rescanSkills();
  }, []); // 意図的に空の依存配列（P31対策）
  // ...
};
```

#### 3.2 After（移行後の実装）

```typescript
// apps/desktop/src/renderer/components/skill/SkillSelector.tsx
import {
  useAvailableSkillsMetadata,
  useImportedSkills,
  useSelectedSkillName,
  useIsScanning,
  useSelectSkillByName,
  useRescanSkills,
} from "../../store";

export const SkillSelector: React.FC<SkillSelectorProps> = ({ ... }) => {
  // 個別セレクタによる参照安定性
  const availableSkillsMetadata = useAvailableSkillsMetadata();
  const importedSkills = useImportedSkills();
  const selectedSkillName = useSelectedSkillName();
  const isScanning = useIsScanning();
  const selectSkillByName = useSelectSkillByName();
  const rescanSkills = useRescanSkills();

  // useRefガード不要: rescanSkillsの参照は安定
  const handleRescan = useCallback(() => {
    rescanSkills();
  }, [rescanSkills]); // 依存配列に追加可能
  // ...
};
```

### ステップ4: SettingsView コンポーネント移行

#### 4.1 Before（現在の実装）

```typescript
// apps/desktop/src/renderer/views/SettingsView/index.tsx
import { useAppStore, useAuthModeStore } from "../../store";

export const SettingsView: React.FC<SettingsViewProps> = ({ ... }) => {
  const {
    mode: authMode,
    status: authModeStatus,
    isLoading: authModeLoading,
    setMode: setAuthMode,
    initializeAuthMode,
  } = useAuthModeStore();

  // P31対策: useRefガード
  const authModeInitRef = useRef(false);
  useEffect(() => {
    if (!authModeInitRef.current) {
      authModeInitRef.current = true;
      initializeAuthMode();
    }
  }, []);
  // ...
};
```

#### 4.2 After（移行後の実装）

```typescript
// apps/desktop/src/renderer/views/SettingsView/index.tsx
import {
  useAppStore,
  useAuthMode,
  useAuthModeStatus,
  useAuthModeLoading,
  useSetAuthMode,
  useInitializeAuthMode,
} from "../../store";

export const SettingsView: React.FC<SettingsViewProps> = ({ ... }) => {
  // 個別セレクタによる参照安定性
  const authMode = useAuthMode();
  const authModeStatus = useAuthModeStatus();
  const authModeLoading = useAuthModeLoading();
  const setAuthMode = useSetAuthMode();
  const initializeAuthMode = useInitializeAuthMode();

  // useRefガード不要: initializeAuthModeの参照は安定
  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]); // 依存配列に追加可能
  // ...
};
```

### ステップ5: useRefガード削除手順

#### 5.1 段階的削除プロセス

1. **個別セレクタ導入後の確認**
   - テストが全てGreen状態であることを確認
   - 手動で無限ループが発生しないことを確認

2. **useRefガード削除**
   - `useRef`による初期化ガードを削除
   - `useEffect`の依存配列にアクション関数を追加

3. **再テスト**
   - 全テストがGreen状態を維持することを確認

#### 5.2 削除対象一覧

| コンポーネント   | 削除対象                      | 行番号（目安） |
| ---------------- | ----------------------------- | -------------- |
| LLMSelectorPanel | `providersFetchedRef`         | 48-55行        |
| LLMSelectorPanel | `prevProviderIdRef`関連ガード | 58-67行        |
| SkillSelector    | 空依存配列コメント            | 290-293行      |
| SettingsView     | `authModeInitRef`             | 33-40行        |

### ステップ6: P31対策パターンの適用

#### 6.1 P31対策の変遷

| フェーズ | 対策                                         |
| -------- | -------------------------------------------- |
| 短期対策 | useRefでガードし、依存配列は空にする（現行） |
| 長期対策 | 個別セレクタベースに再設計（本タスクで実施） |

#### 6.2 個別セレクタが解決する問題

```typescript
// ❌ 問題: 合成Hookが毎回新しいオブジェクトを返す
const { fetchProviders } = useLLMStore();
// useLLMStore()は呼び出すたびに新しいオブジェクトを返すため、
// fetchProvidersの参照も毎回変わる

useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 無限ループ！

// ✅ 解決: 個別セレクタは同じ関数参照を返す
const fetchProviders = useLLMFetchProviders();
// Zustandのセレクタは、stateが変わらない限り同じ参照を返す

useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 安定！初回のみ実行
```

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                       |
| ------------------ | ------------------------------------------ |
| Store セレクタ追加 | 個別セレクタHook（LLM/Skill/AuthMode）     |
| コンポーネント更新 | 3コンポーネントの合成Hook→個別セレクタ移行 |
| useRefガード削除   | P31対策ガードの削除と依存配列の正規化      |

## アーキテクチャ層別実装

| 層               | 実装観点           | 実装ファイル配置                                |
| ---------------- | ------------------ | ----------------------------------------------- |
| Renderer Process | 状態管理Hooks      | `apps/desktop/src/renderer/store/index.ts`      |
| Renderer Process | UIコンポーネント   | `apps/desktop/src/renderer/components/**/*.tsx` |
| Renderer Process | Viewコンポーネント | `apps/desktop/src/renderer/views/**/*.tsx`      |

## 実装時の注意事項（既知のPitfall対策）

| Pitfall ID | 注意事項                      | 対策                                               |
| ---------- | ----------------------------- | -------------------------------------------------- |
| P31        | Zustand Store Hooks無限ループ | 個別セレクタを使用し、アクション関数の参照を安定化 |
| P5         | リスナー二重登録              | 本タスクではリスナー関連は変更しない               |

## 成果物

| 成果物           | パス                                                            | 説明                 |
| ---------------- | --------------------------------------------------------------- | -------------------- |
| Store更新        | `apps/desktop/src/renderer/store/index.ts`                      | 個別セレクタHook追加 |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | 個別セレクタ移行     |
| SkillSelector    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | 個別セレクタ移行     |
| SettingsView     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | 個別セレクタ移行     |

## 完了条件

- [ ] Store に全ての個別セレクタHookが実装されている
- [ ] LLMSelectorPanel が個別セレクタを使用するよう移行されている
- [ ] SkillSelector が個別セレクタを使用するよう移行されている
- [ ] SettingsView が個別セレクタを使用するよう移行されている
- [ ] useRefガードが削除されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 手動確認で無限ループが発生しないことを確認
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
# - [ ] 無限ループ関連テスト（TC-*-MIG-*）が全てパス
```

## 次のPhase

Phase 6: テスト拡充
