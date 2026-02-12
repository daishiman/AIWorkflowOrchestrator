# Phase 8: リファクタリングレポート

## タスクID

UT-STORE-HOOKS-REFACTOR-001

## 実行日時

2026-02-11

## 目的

useRefガードを使用しているコンポーネントを個別セレクタベースにリファクタリングし、コードの品質と保守性を向上させる。

---

## 1. useRefガード使用箇所の特定結果

### 検出されたファイル

| ファイルパス                                                                    | useRef変数名                               | 用途                              | リファクタリング対象         |
| ------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------- | ---------------------------- |
| `views/SettingsView/index.tsx`                                                  | `authModeInitRef`                          | P31対策: useAuthModeStore合成Hook | **対象**                     |
| `components/llm/LLMSelectorPanel.tsx`                                           | `providersFetchedRef`, `prevProviderIdRef` | P31対策: useLLMStore合成Hook      | **対象**                     |
| `hooks/useThemeInitializer.ts`                                                  | `initialized`                              | React StrictMode二重実行防止      | 対象外（個別セレクタ既使用） |
| `components/organisms/WorkspaceFileSelector/hooks/useWorkspaceFileSelection.ts` | `isInitializedRef`                         | コールバック初期化制御            | 対象外（Store Hookと無関係） |
| `store/slices/__tests__/llmSlice.selectors.test.ts`                             | `initRef`                                  | テスト用（P31無限ループテスト）   | 対象外（テストコード）       |

---

## 2. リファクタリング実施内容

### 2.1 SettingsView/index.tsx

#### Before（合成Hook + useRefガード）

```typescript
import { useAuthModeStore } from "../../store";

const {
  mode: authMode,
  status: authModeStatus,
  isLoading: authModeLoading,
  setMode: setAuthMode,
  initializeAuthMode,
} = useAuthModeStore();

const authModeInitRef = useRef(false);
useEffect(() => {
  if (!authModeInitRef.current) {
    authModeInitRef.current = true;
    initializeAuthMode();
  }
}, []); // 意図的に空の依存配列
```

#### After（個別セレクタ）

```typescript
import {
  useAuthMode,
  useAuthModeStatus,
  useAuthModeLoading,
  useSetAuthMode,
  useInitializeAuthMode,
} from "../../store";

const authMode = useAuthMode();
const authModeStatus = useAuthModeStatus();
const authModeLoading = useAuthModeLoading();
const setAuthMode = useSetAuthMode();
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 個別セレクタで参照が安定
```

#### 変更点

- `useRef`ガード削除
- 合成Hook `useAuthModeStore()` → 5つの個別セレクタに分解
- 依存配列に `initializeAuthMode` を追加（参照が安定しているため安全）

---

### 2.2 LLMSelectorPanel.tsx

#### Before（合成Hook + useRefガード）

```typescript
import { useLLMStore } from "@/renderer/store";

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

const providersFetchedRef = useRef(false);
useEffect(() => {
  if (!providersFetchedRef.current) {
    providersFetchedRef.current = true;
    fetchProviders();
  }
}, []); // 意図的に空の依存配列

const prevProviderIdRef = useRef<string | null>(null);
useEffect(() => {
  if (selectedProviderId && selectedProviderId !== prevProviderIdRef.current) {
    prevProviderIdRef.current = selectedProviderId;
    checkHealth(selectedProviderId);
  }
}, [selectedProviderId]); // checkHealthは意図的に除外
```

#### After（個別セレクタ）

```typescript
import {
  useLLMProviders,
  useSelectedProviderId,
  useSelectedModelId,
  useLLMIsLoading,
  useLLMError,
  useLLMHealthStatus,
  useFetchProviders,
  useSelectProvider,
  useSelectModel,
  useCheckLLMHealth,
} from "@/renderer/store";

const providers = useLLMProviders();
const selectedProviderId = useSelectedProviderId();
const selectedModelId = useSelectedModelId();
const isLoading = useLLMIsLoading();
const error = useLLMError();
const healthStatus = useLLMHealthStatus();
const fetchProviders = useFetchProviders();
const selectProvider = useSelectProvider();
const selectModel = useSelectModel();
const checkHealth = useCheckLLMHealth();

useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 個別セレクタで参照が安定

const prevProviderIdRef = useRef<string | null>(null);
useEffect(() => {
  if (selectedProviderId && selectedProviderId !== prevProviderIdRef.current) {
    prevProviderIdRef.current = selectedProviderId;
    checkHealth(selectedProviderId);
  }
}, [selectedProviderId, checkHealth]); // checkHealthも依存配列に追加可能
```

#### 変更点

- `providersFetchedRef` ガード削除
- 合成Hook `useLLMStore()` → 10個の個別セレクタに分解
- 依存配列に `fetchProviders`, `checkHealth` を追加（参照が安定しているため安全）
- `prevProviderIdRef` は残留（プロバイダー変更検出用として必要）

---

## 3. テストファイル更新

### 3.1 SettingsView.test.tsx

#### モック更新

```typescript
// Before
vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
  useAuthModeStore: vi.fn(() => createMockAuthModeStore()),
}));

// After
vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
  // 個別セレクタ（P31対策）
  useAuthMode: vi.fn(() => mockAuthModeValues.mode),
  useAuthModeStatus: vi.fn(() => mockAuthModeValues.status),
  useAuthModeLoading: vi.fn(() => mockAuthModeValues.isLoading),
  useSetAuthMode: vi.fn(() => mockAuthModeValues.setMode),
  useInitializeAuthMode: vi.fn(() => mockAuthModeValues.initializeAuthMode),
  // 非推奨の合成Hook（後方互換性）
  useAuthModeStore: vi.fn(() => mockAuthModeValues),
}));
```

### 3.2 LLMSelectorPanel.test.tsx

#### モック更新

- `useLLMStore` ベースのモック → 個別セレクタベースに変更
- `setMockValues` ヘルパー関数を追加してテスト内の状態更新を簡略化

---

## 4. 合成Hook @deprecatedタグ確認

### 確認対象

| 合成Hook           | ファイル                 | @deprecatedタグ |
| ------------------ | ------------------------ | --------------- |
| `useAuthModeStore` | `store/index.ts:544-564` | 確認済          |
| `useLLMStore`      | `store/index.ts:277-296` | 確認済          |
| `useSkillStore`    | `store/index.ts:413-442` | 確認済          |

### @deprecatedドキュメント例（useAuthModeStore）

```typescript
/**
 * @deprecated UT-STORE-HOOKS-REFACTOR-001: 無限ループ防止のため個別セレクタを使用してください。
 *
 * 推奨される個別セレクタ:
 * - 状態: useAuthMode, useAuthModeStatus, useAuthModeLoading, ...
 * - アクション: useSetAuthMode, useInitializeAuthMode, ...
 *
 * @see 06-known-pitfalls.md#P31
 */
```

---

## 5. ESLint exhaustive-deps警告確認

```bash
$ pnpm --filter @repo/desktop lint 2>&1 | grep -c "exhaustive-deps"
0
警告なし
```

個別セレクタ導入後、全ての依存配列が正しく設定され、ESLint警告は0件です。

---

## 6. テスト結果

### SettingsView.test.tsx

```
Test Files  1 passed (1)
     Tests  22 passed (22)
```

### LLMSelectorPanel.test.tsx

```
Test Files  1 passed (1)
     Tests  19 passed (19)
```

全テストがパスしました。

---

## 7. リファクタリング対象外の理由

### useThemeInitializer.ts

- **理由**: 既に個別セレクタ `useAppStore((state) => state.initializeTheme)` を使用
- **useRefの役割**: React StrictModeの二重実行防止（非同期処理の多重実行防止）
- **結論**: 個別セレクタを使用しており、P31問題は発生しない。useRefはStrictMode対策として適切

### useWorkspaceFileSelection.ts

- **理由**: Store Hookとは無関係のローカル状態管理
- **isInitializedRefの役割**: コールバックの初期化タイミング制御
- **結論**: P31問題とは無関係

---

## 8. 今後の推奨事項

1. **新規コンポーネント開発時**: 合成Hookではなく個別セレクタを使用
2. **既存コード**: 合成Hookを使用している箇所は順次個別セレクタに移行
3. **コードレビュー**: `useLLMStore`, `useAuthModeStore`, `useSkillStore` の使用を検出した場合は個別セレクタへの移行を推奨

---

## 9. 完了条件チェックリスト

- [x] useRefガード使用箇所の特定完了
- [x] SettingsView/index.tsx のリファクタリング完了
- [x] LLMSelectorPanel.tsx のリファクタリング完了
- [x] 関連テストファイルの更新完了
- [x] 合成Hookの@deprecatedタグ確認完了
- [x] ESLint exhaustive-deps警告 0件確認
- [x] 全テストパス確認
- [x] リファクタリングレポート出力完了
