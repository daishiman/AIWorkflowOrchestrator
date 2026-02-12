# Phase 2: 設計書

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| タスクID   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスク名   | Store Hooks コンポーネント移行         |
| Phase      | 2                                      |
| 作成日     | 2026-02-12                             |
| ステータス | 完了                                   |

---

## 1. アーキテクチャ設計

### 1.1 ファイル構成

```
apps/desktop/src/renderer/store/
├── index.ts                    # メインStore定義・エクスポート
├── slices/
│   ├── llmSlice.ts            # LLMSlice定義（変更なし）
│   ├── agentSlice.ts          # AgentSlice定義（Skill含む、変更なし）
│   └── authModeSlice.ts       # AuthModeSlice定義（変更なし）
└── (個別セレクタはindex.tsに追加)
```

### 1.2 設計原則

| 原則         | 説明                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| 参照安定性   | 個別セレクタHookは安定した参照を返す（アクション関数はStore生成時に固定） |
| 単一責務     | 各セレクタは単一の値/関数のみを返す                                       |
| 後方互換性   | 合成Hookは引き続き使用可能（内部でshallow比較を使用）                     |
| 最小限の変更 | 既存Store構造は維持、セレクタ層のみ追加                                   |

---

## 2. 個別セレクタHook設計

### 2.1 LLM系セレクタ（store/index.tsに追加）

```typescript
// ============================================
// LLM Individual Selectors (新規追加)
// ============================================

// === 状態セレクタ（値を返す） ===
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMSelectedProviderId = () =>
  useAppStore((state) => state.selectedProviderId);
export const useLLMSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);
export const useLLMIsLoading = () => useAppStore((state) => state.llmIsLoading);
export const useLLMError = () => useAppStore((state) => state.llmError);
export const useLLMHealthStatus = () =>
  useAppStore((state) => state.healthStatus);

// === アクションセレクタ（関数を返す） ===
// NOTE: アクション関数はStoreで安定した参照を持つため、個別セレクタで取得しても参照が変わらない
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
```

### 2.2 Skill系セレクタ（store/index.tsに追加）

```typescript
// ============================================
// Skill Individual Selectors (新規追加)
// ============================================

// === 状態セレクタ（値を返す） ===
export const useAvailableSkillsMetadata = () =>
  useAppStore((state) => state.availableSkillsMetadata);
export const useImportedSkills = () =>
  useAppStore((state) => state.importedSkills);
export const useSelectedSkillName = () =>
  useAppStore((state) => state.selectedSkillName);
export const useIsScanning = () => useAppStore((state) => state.isScanning);
export const useIsSkillExecuting = () =>
  useAppStore((state) => state.isExecuting);
export const useSkillError = () => useAppStore((state) => state.skillError);
export const useIsLoadingSkills = () =>
  useAppStore((state) => state.isLoadingSkills);
export const useIsImporting = () => useAppStore((state) => state.isImporting);

// === アクションセレクタ（関数を返す） ===
export const useRescanSkills = () => useAppStore((state) => state.rescanSkills);
export const useSelectSkillByName = () =>
  useAppStore((state) => state.selectSkillByName);
export const useFetchSkills = () => useAppStore((state) => state.fetchSkills);
export const useImportSkill = () => useAppStore((state) => state.importSkill);
export const useRemoveSkill = () => useAppStore((state) => state.removeSkill);
export const useExecuteSkill = () => useAppStore((state) => state.executeSkill);
export const useClearSkillError = () =>
  useAppStore((state) => state.clearSkillError);
```

### 2.3 AuthMode追加セレクタ（store/index.tsに追加）

```typescript
// ============================================
// AuthMode Additional Selectors (新規追加)
// ============================================
// 既存: useAuthMode, useAuthModeStatus, useAuthModeLoading, useAuthModeError, useIsAuthModeValid

// === アクションセレクタ（新規追加） ===
export const useSetAuthMode = () => useAppStore((state) => state.setMode);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
export const useFetchAuthMode = () => useAppStore((state) => state.fetchMode);
```

---

## 3. コンポーネント移行設計

### 3.1 LLMSelectorPanel.tsx

#### Before（現在の実装）

```typescript
import { useLLMStore } from "@/renderer/store";

export const LLMSelectorPanel: React.FC<Props> = ({ ... }) => {
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
  }, []); // 意図的に空の依存配列（P31対策）

  const prevProviderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedProviderId && selectedProviderId !== prevProviderIdRef.current) {
      prevProviderIdRef.current = selectedProviderId;
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId]); // checkHealthは意図的に除外（P31対策）
  // ...
};
```

#### After（移行後の実装）

```typescript
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

export const LLMSelectorPanel: React.FC<Props> = ({ ... }) => {
  // 個別セレクタで必要な値/関数を取得
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

  // シンプルなuseEffect（useRefガード不要）
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]); // fetchProvidersの参照は安定

  // 前の値との比較は維持（selectedProviderId変更時のみ実行）
  const prevProviderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedProviderId && selectedProviderId !== prevProviderIdRef.current) {
      prevProviderIdRef.current = selectedProviderId;
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId, checkHealth]); // checkHealthを依存配列に含められる
  // ...
};
```

### 3.2 SkillSelector.tsx

#### Before（現在の実装）

```typescript
import { useSkillStore } from "../../store";

export const SkillSelector: React.FC<Props> = ({ ... }) => {
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

#### After（移行後の実装）

```typescript
import {
  useAvailableSkillsMetadata,
  useImportedSkills,
  useSelectedSkillName,
  useIsScanning,
  useSelectSkillByName,
  useRescanSkills,
} from "../../store";

export const SkillSelector: React.FC<Props> = ({ ... }) => {
  // 個別セレクタで必要な値/関数を取得
  const availableSkillsMetadata = useAvailableSkillsMetadata();
  const importedSkills = useImportedSkills();
  const selectedSkillName = useSelectedSkillName();
  const isScanning = useIsScanning();
  const selectSkillByName = useSelectSkillByName();
  const rescanSkills = useRescanSkills();

  // シンプルなuseCallback（P31対策コメント不要）
  const handleRescan = useCallback(() => {
    rescanSkills();
  }, [rescanSkills]); // 依存配列に追加可能
  // ...
};
```

### 3.3 SettingsView/index.tsx

#### Before（現在の実装）

```typescript
import { useAuthModeStore } from "../../store";

export const SettingsView: React.FC<Props> = ({ ... }) => {
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
  }, []); // 意図的に空の依存配列（P31対策）
  // ...
};
```

#### After（移行後の実装）

```typescript
import {
  useAuthMode,
  useAuthModeStatus,
  useAuthModeLoading,
  useSetAuthMode,
  useInitializeAuthMode,
} from "../../store";

export const SettingsView: React.FC<Props> = ({ ... }) => {
  // 個別セレクタで必要な値/関数を取得
  const authMode = useAuthMode();
  const authModeStatus = useAuthModeStatus();
  const authModeLoading = useAuthModeLoading();
  const setAuthMode = useSetAuthMode();
  const initializeAuthMode = useInitializeAuthMode();

  // シンプルなuseEffect（useRefガード不要）
  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]); // 依存配列に追加可能
  // ...
};
```

---

## 4. Zustandアクション関数の参照安定性

### 4.1 なぜ個別セレクタが安定するのか

Zustandでは、`set`関数を使用して定義されたアクション関数は、Store作成時に一度だけ生成され、その参照は変更されない。

```typescript
const useStore = create<MyState>((set, get) => ({
  count: 0,
  // この関数の参照はStore生成時に固定される
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 4.2 参照安定性の比較

| 取得方法                               | 参照安定性 | 理由                                           |
| -------------------------------------- | ---------- | ---------------------------------------------- |
| `const fn = useStore((s) => s.action)` | **安定**   | 同じセレクタは同じ関数参照を返す               |
| `const { action } = useStore()`        | **不安定** | 毎回新しいオブジェクトを生成し、分割代入される |

### 4.3 コード例

```typescript
// ❌ 問題: 合成Hookが毎回新しいオブジェクトを返す
const { fetchProviders } = useLLMStore();
useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 無限ループ！

// ✅ 解決: 個別セレクタは同じ関数参照を返す
const fetchProviders = useLLMFetchProviders();
useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 安定！初回のみ実行
```

---

## 5. 削除対象のuseRefガード

| コンポーネント   | 削除対象              | 行番号（目安） |
| ---------------- | --------------------- | -------------- |
| LLMSelectorPanel | `providersFetchedRef` | 48-55行        |
| LLMSelectorPanel | P31対策コメント       | 複数箇所       |
| SkillSelector    | 空依存配列コメント    | 290-293行      |
| SettingsView     | `authModeInitRef`     | 33-40行        |

---

## 6. テスト更新設計

### 6.1 既存テストのMock更新

**Before（合成Hook）:**

```typescript
vi.mock("@/renderer/store", () => ({
  useLLMStore: vi.fn(),
}));
```

**After（個別セレクタ）:**

```typescript
vi.mock("@/renderer/store", () => ({
  useLLMProviders: vi.fn(),
  useLLMSelectedProviderId: vi.fn(),
  useLLMIsLoading: vi.fn(),
  useLLMError: vi.fn(),
  useLLMHealthStatus: vi.fn(),
  useLLMFetchProviders: vi.fn(),
  useLLMSelectProvider: vi.fn(),
  useLLMSelectModel: vi.fn(),
  useLLMCheckHealth: vi.fn(),
  // 後方互換のため合成Hookも残す
  useLLMStore: vi.fn(),
}));
```

### 6.2 移行テストの追加

新規作成する移行テスト（\*.migration.test.tsx）:

- `LLMSelectorPanel.migration.test.tsx`
- `SkillSelector.migration.test.tsx`
- `SettingsView.migration.test.tsx`

---

## 7. 統合テスト連携

| 統合ポイント                 | 契約定義                                   |
| ---------------------------- | ------------------------------------------ |
| Store → 個別セレクタHook     | セレクタが正しい型の値を返す               |
| 個別セレクタHook → Component | コンポーネントが依存配列で安全に使用できる |
| 状態更新 → UI反映            | 状態変更が正しくUIに伝播する               |

---

## 8. 完了条件

- [x] アーキテクチャが定義されている
- [x] 個別セレクタHookの設計が完了している
- [x] Before/Afterコード例が作成されている
- [x] 要件との整合性が確認されている
- [x] 統合ポイント/契約が設計に反映されている
- [x] テスト更新設計が完了している
- [x] **本Phase内の全タスクを100%実行完了**

---

## 9. 次のPhase

Phase 3: 設計レビューゲート
