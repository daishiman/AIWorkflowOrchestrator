# Phase 2: 設計

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 2                                      |
| 機能名   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスクID | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスク名 | Store Hooks コンポーネント移行         |
| 作成日   | 2026-02-12                             |

## 目的

要件を実現可能な構造に落とし込む。個別セレクタHookの設計とコンポーネント移行パターンを定義する。

## 実行タスク

- アーキテクチャ設計: 個別セレクタHookの構造設計
- Before/Afterコード設計: 移行パターンの定義
- インターフェース設計: 個別セレクタHookのAPI設計

## 参照資料

| 資料名           | パス                                                                         | 説明            |
| ---------------- | ---------------------------------------------------------------------------- | --------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                                 | Phase 1成果物   |
| 状態管理パターン | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand設計原則 |

## 移行アーキテクチャ設計

### 全体構造

```
apps/desktop/src/renderer/store/
├── index.ts                    # メインStore定義（変更なし）
├── slices/
│   ├── llmSlice.ts            # LLMSlice定義
│   ├── agentSlice.ts          # AgentSlice定義（スキル含む）
│   └── authModeSlice.ts       # AuthModeSlice定義（新規作成 or 既存統合）
└── hooks/
    ├── useLLMSelectors.ts     # LLM個別セレクタHook（新規）
    ├── useSkillSelectors.ts   # Skill個別セレクタHook（新規）
    └── useAuthModeSelectors.ts # AuthMode個別セレクタHook（新規）
```

### 設計原則

| 原則         | 説明                                                        |
| ------------ | ----------------------------------------------------------- |
| 参照安定性   | 個別セレクタHookは安定した参照を返す（shallow比較で最適化） |
| 単一責務     | 各セレクタは単一の値/関数のみを返す                         |
| 後方互換性   | 合成Hookは引き続き使用可能（内部で個別セレクタを使用）      |
| 最小限の変更 | 既存Store構造は維持、セレクタ層のみ追加                     |

## 個別セレクタHook設計

### 1. useLLMSelectors.ts

```typescript
// apps/desktop/src/renderer/store/hooks/useLLMSelectors.ts
import { useStore } from "../index";
import { shallow } from "zustand/shallow";

// === 状態セレクタ（値を返す） ===
export const useProviders = () => useStore((state) => state.providers);

export const useSelectedProviderId = () =>
  useStore((state) => state.selectedProviderId);

export const useSelectedModelId = () =>
  useStore((state) => state.selectedModelId);

export const useIsLLMLoading = () => useStore((state) => state.isLoading);

export const useLLMError = () => useStore((state) => state.error);

export const useHealthStatus = () => useStore((state) => state.healthStatus);

// === アクションセレクタ（関数を返す） ===
// NOTE: アクション関数はStoreで安定した参照を持つため、個別セレクタで取得しても参照が変わらない
export const useFetchProviders = () =>
  useStore((state) => state.fetchProviders);

export const useSelectProvider = () =>
  useStore((state) => state.selectProvider);

export const useSelectModel = () => useStore((state) => state.selectModel);

export const useCheckHealth = () => useStore((state) => state.checkHealth);

// === 後方互換用: 合成Hook（既存コードとの互換性維持） ===
export const useLLMStore = () =>
  useStore(
    (state) => ({
      providers: state.providers,
      selectedProviderId: state.selectedProviderId,
      selectedModelId: state.selectedModelId,
      isLoading: state.isLoading,
      error: state.error,
      healthStatus: state.healthStatus,
      fetchProviders: state.fetchProviders,
      selectProvider: state.selectProvider,
      selectModel: state.selectModel,
      checkHealth: state.checkHealth,
    }),
    shallow,
  );
```

### 2. useSkillSelectors.ts

```typescript
// apps/desktop/src/renderer/store/hooks/useSkillSelectors.ts
import { useStore } from "../index";
import { shallow } from "zustand/shallow";

// === 状態セレクタ（値を返す） ===
export const useAvailableSkillsMetadata = () =>
  useStore((state) => state.availableSkillsMetadata);

export const useImportedSkills = () =>
  useStore((state) => state.importedSkills);

export const useSelectedSkillName = () =>
  useStore((state) => state.selectedSkillName);

export const useIsScanning = () => useStore((state) => state.isScanning);

export const useIsExecuting = () => useStore((state) => state.isExecuting);

export const useExecutionStatus = () =>
  useStore((state) => state.executionStatus);

export const useStreamingMessages = () =>
  useStore((state) => state.streamingMessages);

export const usePendingPermission = () =>
  useStore((state) => state.pendingPermission);

export const useSkillError = () => useStore((state) => state.skillError);

// === アクションセレクタ（関数を返す） ===
export const useSelectSkillByName = () =>
  useStore((state) => state.selectSkillByName);

export const useRescanSkills = () => useStore((state) => state.rescanSkills);

export const useFetchSkills = () => useStore((state) => state.fetchSkills);

export const useImportSkill = () => useStore((state) => state.importSkill);

export const useRemoveSkill = () => useStore((state) => state.removeSkill);

export const useExecuteSkill = () => useStore((state) => state.executeSkill);

export const useAbortExecution = () =>
  useStore((state) => state.abortExecution);

// === 後方互換用: 合成Hook（既存コードとの互換性維持） ===
export const useSkillStore = () =>
  useStore(
    (state) => ({
      availableSkillsMetadata: state.availableSkillsMetadata,
      importedSkills: state.importedSkills,
      selectedSkillName: state.selectedSkillName,
      isScanning: state.isScanning,
      selectSkillByName: state.selectSkillByName,
      rescanSkills: state.rescanSkills,
    }),
    shallow,
  );
```

### 3. useAuthModeSelectors.ts

```typescript
// apps/desktop/src/renderer/store/hooks/useAuthModeSelectors.ts
import { useStore } from "../index";
import { shallow } from "zustand/shallow";

// === 状態セレクタ（値を返す） ===
export const useAuthMode = () => useStore((state) => state.mode);

export const useAuthModeStatus = () => useStore((state) => state.status);

export const useIsAuthModeLoading = () => useStore((state) => state.isLoading);

// === アクションセレクタ（関数を返す） ===
export const useSetAuthMode = () => useStore((state) => state.setMode);

export const useInitializeAuthMode = () =>
  useStore((state) => state.initializeAuthMode);

// === 後方互換用: 合成Hook（既存コードとの互換性維持） ===
export const useAuthModeStore = () =>
  useStore(
    (state) => ({
      mode: state.mode,
      status: state.status,
      isLoading: state.isLoading,
      setMode: state.setMode,
      initializeAuthMode: state.initializeAuthMode,
    }),
    shallow,
  );
```

## Before/Afterコード例

### LLMSelectorPanel.tsx

**Before（useRefガードパターン）**:

```typescript
import { useLLMStore } from "@/renderer/store";

export const LLMSelectorPanel: React.FC<Props> = () => {
  const { providers, selectedProviderId, fetchProviders, checkHealth } =
    useLLMStore();

  // P31対策: useRefガードパターン
  const providersFetchedRef = useRef(false);
  useEffect(() => {
    if (!providersFetchedRef.current) {
      providersFetchedRef.current = true;
      fetchProviders();
    }
  }, []); // 意図的に空の依存配列（P31対策）

  // P31対策: checkHealthは依存配列から除外
  const prevProviderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      selectedProviderId &&
      selectedProviderId !== prevProviderIdRef.current
    ) {
      prevProviderIdRef.current = selectedProviderId;
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId]); // checkHealthは意図的に除外（P31対策）

  // ...
};
```

**After（個別セレクタパターン）**:

```typescript
import {
  useProviders,
  useSelectedProviderId,
  useFetchProviders,
  useCheckHealth,
} from "@/renderer/store/hooks/useLLMSelectors";

export const LLMSelectorPanel: React.FC<Props> = () => {
  // 個別セレクタで必要な値/関数を取得
  const providers = useProviders();
  const selectedProviderId = useSelectedProviderId();
  const fetchProviders = useFetchProviders();
  const checkHealth = useCheckHealth();

  // シンプルなuseEffect（useRefガード不要）
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]); // 安定した参照のため無限ループしない

  useEffect(() => {
    if (selectedProviderId) {
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId, checkHealth]); // 安定した参照のため無限ループしない

  // ...
};
```

### SkillSelector.tsx

**Before（useRefガードパターン）**:

```typescript
import { useSkillStore } from "../../store";

export const SkillSelector: React.FC<Props> = () => {
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

**After（個別セレクタパターン）**:

```typescript
import {
  useAvailableSkillsMetadata,
  useImportedSkills,
  useSelectedSkillName,
  useIsScanning,
  useSelectSkillByName,
  useRescanSkills,
} from "../../store/hooks/useSkillSelectors";

export const SkillSelector: React.FC<Props> = () => {
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
  }, [rescanSkills]); // 安定した参照のため問題なし

  // ...
};
```

### SettingsView/index.tsx

**Before（useRefガードパターン）**:

```typescript
import { useAuthModeStore } from "../../store";

export const SettingsView: React.FC<Props> = () => {
  const {
    mode: authMode,
    status: authModeStatus,
    isLoading: authModeLoading,
    setMode: setAuthMode,
    initializeAuthMode,
  } = useAuthModeStore();

  // P31対策: useRefガードパターン
  const authModeInitRef = useRef(false);
  useEffect(() => {
    if (!authModeInitRef.current) {
      authModeInitRef.current = true;
      initializeAuthMode();
    }
  }, []); // 意図的に空の依存配列: initializeAuthModeは1回だけ実行（P31対策）

  // ...
};
```

**After（個別セレクタパターン）**:

```typescript
import {
  useAuthMode,
  useAuthModeStatus,
  useIsAuthModeLoading,
  useSetAuthMode,
  useInitializeAuthMode,
} from "../../store/hooks/useAuthModeSelectors";

export const SettingsView: React.FC<Props> = () => {
  // 個別セレクタで必要な値/関数を取得
  const authMode = useAuthMode();
  const authModeStatus = useAuthModeStatus();
  const authModeLoading = useIsAuthModeLoading();
  const setAuthMode = useSetAuthMode();
  const initializeAuthMode = useInitializeAuthMode();

  // シンプルなuseEffect（useRefガード不要）
  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]); // 安定した参照のため1回だけ実行される

  // ...
};
```

## Zustandアクション関数の参照安定性

### 背景

Zustandでは、`set`関数を使用して定義されたアクション関数は、Store作成時に一度だけ生成され、その参照は変更されない。

```typescript
const useStore = create<MyState>((set) => ({
  count: 0,
  // この関数の参照はStore生成時に固定される
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 参照安定性の検証

| 取得方法                               | 参照安定性 | 理由                                           |
| -------------------------------------- | ---------- | ---------------------------------------------- |
| `const fn = useStore((s) => s.action)` | **安定**   | 同じセレクタは同じ関数参照を返す               |
| `const { action } = useStore()`        | **不安定** | 毎回新しいオブジェクトを生成し、分割代入される |

### 個別セレクタが安定する理由

```typescript
// 個別セレクタ: セレクタ関数自体が安定しているため、返される値/関数も安定
export const useFetchProviders = () =>
  useStore((state) => state.fetchProviders);
// ^ このセレクタは同じ関数を返し続ける

// 合成Hook: 毎回新しいオブジェクトを生成
export const useLLMStore = () =>
  useStore((state) => ({
    providers: state.providers,
    fetchProviders: state.fetchProviders,
  }));
// ^ このオブジェクトは毎回新しい参照
```

## 統合テスト連携

| 統合ポイント                 | 契約定義                                   |
| ---------------------------- | ------------------------------------------ |
| Store → 個別セレクタHook     | セレクタが正しい型の値を返す               |
| 個別セレクタHook → Component | コンポーネントが依存配列で安全に使用できる |
| 状態更新 → UI反映            | 状態変更が正しくUIに伝播する               |

## アーキテクチャ層別設計

| 層                         | 設計観点                                     | 仕様参照先                 |
| -------------------------- | -------------------------------------------- | -------------------------- |
| フロントエンド（Renderer） | コンポーネント移行パターン、useRefガード除去 | `ui-ux-*.md`               |
| 状態管理（Zustand）        | 個別セレクタHookの提供、shallow比較最適化    | `arch-state-management.md` |

## 成果物

| 成果物       | パス                                     | 説明                   |
| ------------ | ---------------------------------------- | ---------------------- |
| 設計書       | `outputs/phase-2/architecture-design.md` | 本ドキュメント         |
| コード設計例 | `outputs/phase-2/code-examples.md`       | Before/After（本文内） |

## 完了条件

- [x] アーキテクチャが定義されている
- [x] 個別セレクタHookの設計が完了している
- [x] Before/Afterコード例が作成されている
- [x] 要件との整合性が確認されている
- [x] 統合ポイント/契約が設計に反映されている
- [x] アーキテクチャ層別の設計が完了している
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
