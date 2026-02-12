# Store Hooks コンポーネント移行 実装ガイド

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスク名 | Store Hooks コンポーネント移行         |
| Phase    | 12                                     |
| 作成日   | 2026-02-12                             |

---

# Part 1: 概念説明（中学生でもわかるレベル）

## この変更は何？

アプリの中で「データを取り出す方法」を改善しました。

### 例え話：学校の図書館

想像してみてください。学校の図書館で本を借りる場面です。

**改善前（合成Hook）:**

```
「図書館の全部の本の情報をください」
　→ 毎回、全部の本のリストが入った重いファイルをもらう
　→ あなたが欲しいのは1冊だけなのに、毎回重いファイルを持ち歩く
　→ 誰かが1冊でも本を追加すると、また全部のファイルをもらい直す
```

**改善後（個別セレクタ）:**

```
「『ハリー・ポッター』の貸出状況だけ教えてください」
　→ 欲しい情報だけをもらえる
　→ 軽くて速い
　→ 他の本が追加されても、あなたの情報は変わらない
```

### 何が良くなったの？

1. **速くなった**: 必要な情報だけ取り出すので、無駄がない
2. **安全になった**: 同じ情報を何度聞いても、同じ答えが返ってくる
3. **わかりやすくなった**: 何の情報を使っているか、コードを見ればすぐわかる

### P31問題って何だったの？

「無限ループ」という問題がありました。

**例え話：壊れた自動ドア**

```
自動ドアの前に立つ
　→ ドアが開く
　→ 「人がいる」とセンサーが反応
　→ ドアが閉じる
　→ 「人がいる」とセンサーが反応
　→ ドアが開く
　→ ...（永遠に繰り返し）
```

これがプログラムで起こっていました。
「データを取り出す」→「画面を更新」→「データを取り出す」→「画面を更新」→...

**解決方法:**
「同じ質問には同じ答えを返す」ようにしました。
センサーが「さっきと同じ人だ」と認識して、ドアが無駄に動かなくなりました。

---

# Part 2: 開発者向け実装詳細

## 技術的背景

### Zustand の参照安定性

Zustandでは、`create()` で定義されたアクション関数の参照は Store 生成時に固定されます。

```typescript
const useStore = create<MyState>((set, get) => ({
  count: 0,
  // この関数の参照は Store 生成時に固定される
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 問題: 合成 Hook のオブジェクト生成

合成 Hook（`useLLMStore()` 等）は毎回新しいオブジェクトを返します。

```typescript
// 毎回新しいオブジェクトが生成される
const { fetchProviders, selectProvider } = useLLMStore();

// useEffect の依存配列に含めると無限ループ
useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 毎レンダーで新しい参照 → 無限ループ！
```

### 解決: 個別セレクタによる参照安定性

```typescript
// 同じ関数参照が返される
const fetchProviders = useLLMFetchProviders();

// 依存配列に含めても安全
useEffect(() => {
  fetchProviders();
}, [fetchProviders]); // 参照が安定 → 1回のみ実行
```

---

## 実装された個別セレクタ Hook

### LLM 系（12個）

```typescript
// State セレクタ
export const useLLMProviders = () => useAppStore((state) => state.providers);
export const useLLMSelectedProviderId = () =>
  useAppStore((state) => state.selectedProviderId);
export const useLLMSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);
export const useLLMIsLoading = () => useAppStore((state) => state.llmIsLoading);
export const useLLMError = () => useAppStore((state) => state.llmError);
export const useLLMHealthStatus = () =>
  useAppStore((state) => state.healthStatus);

// Action セレクタ
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

### Skill 系（15個）

```typescript
// State セレクタ
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

// Action セレクタ
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

### AuthMode 追加（3個）

```typescript
// Action セレクタ（State セレクタは既存）
export const useSetAuthMode = () => useAppStore((state) => state.setMode);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
export const useFetchAuthMode = () => useAppStore((state) => state.fetchMode);
```

---

## 移行パターン

### Before（合成 Hook + useRef ガード）

```typescript
import { useLLMStore } from "@/renderer/store";

export const LLMSelectorPanel: React.FC = () => {
  const { providers, fetchProviders, selectProvider } = useLLMStore();

  // P31対策: useRef ガード
  const providersFetchedRef = useRef(false);
  useEffect(() => {
    if (!providersFetchedRef.current) {
      providersFetchedRef.current = true;
      fetchProviders();
    }
  }, []); // 意図的に空の依存配列（P31対策）

  // ...
};
```

### After（個別セレクタ）

```typescript
import {
  useLLMProviders,
  useLLMFetchProviders,
  useLLMSelectProvider,
} from "@/renderer/store";

export const LLMSelectorPanel: React.FC = () => {
  const providers = useLLMProviders();
  const fetchProviders = useLLMFetchProviders();
  const selectProvider = useLLMSelectProvider();

  // シンプルな useEffect（ガード不要）
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]); // 依存配列に追加可能

  // ...
};
```

---

## コードレビューチェックリスト

### 新規コンポーネント作成時

- [ ] 合成 Hook（`useLLMStore()` 等）ではなく個別セレクタを使用しているか
- [ ] useEffect の依存配列に関数を含める場合、個別セレクタから取得しているか
- [ ] useRef ガードは本当に必要か（個別セレクタで代替できないか）

### 既存コンポーネント修正時

- [ ] P31 対策コメント（`// 意図的に空の依存配列`）がある場合、個別セレクタへの移行を検討
- [ ] useRef ガードがある場合、削除可能か検討

---

## テスト方法

### 参照安定性テスト

```typescript
it("useLLMFetchProviders は安定した関数参照を返す", () => {
  const { result, rerender } = renderHook(() => useLLMFetchProviders());

  const firstRef = result.current;
  rerender();
  const secondRef = result.current;

  expect(firstRef).toBe(secondRef); // 同じ参照
});
```

### 無限ループ防止テスト

```typescript
it("useEffect 依存配列に含めても無限ループしない", () => {
  let renderCount = 0;
  const maxRenders = 10;

  const { rerender } = renderHook(() => {
    const fetchProviders = useLLMFetchProviders();
    renderCount++;
    if (renderCount > maxRenders) {
      throw new Error("Infinite loop detected!");
    }
    return fetchProviders;
  });

  rerender();
  rerender();
  rerender();

  expect(renderCount).toBeLessThanOrEqual(maxRenders);
});
```

---

## 関連ドキュメント

| ドキュメント         | パス                                          |
| -------------------- | --------------------------------------------- |
| P31 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md#P31`      |
| 状態管理ルール       | `.claude/rules/03-state-management.md`        |
| 設計書               | `outputs/phase-2/architecture-design.md`      |
| セレクタテスト       | `store/__tests__/selectors.test.ts`           |
| 無限ループ防止テスト | `__tests__/infinite-loop-prevention.test.tsx` |
