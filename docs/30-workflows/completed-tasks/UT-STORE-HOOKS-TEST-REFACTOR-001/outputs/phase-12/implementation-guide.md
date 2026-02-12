# 実装ガイド: Store HooksテストrenderHookパターン移行

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001                          |
| 対象       | agentSlice.selectors.test.ts                              |
| 作成日     | 2026-02-12                                                |
| 依存タスク | UT-STORE-HOOKS-REFACTOR-001（個別セレクタ設計、完了済み） |

---

## Part 1: 概念的説明（中学生レベル）

### この変更は「テストの方法」を改善したもの

まず最初に大事なことを説明します。
このタスクは、プログラムの「テスト（確認作業）」の**やり方**を変えたものです。
プログラムの動き自体は変わりません。テストのやり方がもっと正確になりました。

---

### renderHookとは ―「お店の試食コーナー」のようなもの

お店（ショッピングモール）で新しいお菓子を試食したいとします。

**以前のやり方（getState()パターン）は、「倉庫の在庫リストを直接見る」ようなもの**でした。

- 倉庫の棚にある商品リストを見て「あ、チョコレートが5個あるな」と確認する
- これは正確だけど、実際にお客さん（React）が「お店の棚」から商品を手に取る動作とは違う
- 倉庫では在庫がちゃんとあっても、お店の棚に並んでいなかったり、値札が違っていたりする問題を見つけられない

**新しいやり方（renderHookパターン）は、「試食コーナーで実際に味見する」こと**です。

- お店に設置された試食コーナー（renderHook）で、実際に商品を食べてみる
- お客さんと同じ体験をしながら「味はどうか」「パッケージから出せるか」を確認する
- 実際にお店で起きる問題（包装が開けにくい、味が変わったなど）を事前に見つけられる

renderHookという仕組みは、お客さんが実際にお店で商品を手に取る場面を再現して、テストしてくれるツールです。

---

### 参照安定性とは ―「同じ担当者が常に対応する」こと

銀行の窓口で手続きするとき、何度来ても**同じ担当者**が対応してくれたら安心ですよね。

- 担当者が毎回変わると、「前回の話、覚えてますか？」と最初から説明し直す必要がある
- これはコンピューターの世界でも同じで、「関数」という作業員が毎回別の人に入れ替わると、プログラムが「あれ？前と違う人が来た。もう1回確認しなきゃ」と余計な作業（再レンダリング）をしてしまう
- 最悪の場合、「確認 → 新しい人 → また確認 → また新しい人 → ...」と永遠に繰り返してしまう（無限ループ）

参照安定性テストは、「何度来ても同じ担当者ですよ」ということを確認するテストです。

---

### なぜこの改善が必要だったのか

倉庫のリストを見るだけ（getState()）のテストでは、以下のことが確認できませんでした。

1. **お客さんの視点での動作確認** - Reactが実際にデータを取得するのと同じ仕組みで確認する
2. **担当者が毎回同じかどうか** - 関数の参照が安定しているかを実際の動作で確認する
3. **無限ループが起きないか** - 実際のReactの動作環境で無限ループしないことを確認する

改善後は、114個のテストが全て合格し、お客さんの視点での品質保証ができるようになりました。

---

## Part 2: 技術的詳細（開発者レベル）

### renderHookとgetState()の根本的な違い

#### getState()パターンの特徴

`getState()` は Zustand Storeの内部状態を直接取得する。Reactのレンダリングパイプラインを経由しないため、以下の検証ができない。

- セレクタの再レンダー最適化（`Object.is()` 比較による不要な再レンダリングの抑制）
- `useEffect` 依存配列に含めた場合の動作（P31無限ループ問題）
- コンポーネントのライフサイクル内での参照安定性

```typescript
// Before: getState()パターン（CAT-01相当）
it("初期値テスト", () => {
  const state = useAppStore.getState();
  expect(state.availableSkillsMetadata).toEqual([]);
});
```

#### renderHookパターンの特徴

`renderHook` は React Testing Libraryが提供するユーティリティで、Hookを仮想的なReactコンポーネント内で実行する。Reactのレンダリングパイプラインを完全に再現するため、以下が検証可能になる。

- セレクタの参照安定性（`rerender()` を呼んでも `===` で比較して同一オブジェクトであること）
- `useEffect` + 依存配列の動作（無限ループ発生の有無）
- `act()` による状態更新のバッチング

```typescript
// After: renderHookパターン（CAT-01相当）
it("初期値テスト", () => {
  const { result } = renderHook(() =>
    useAppStore((state) => state.availableSkillsMetadata),
  );
  expect(result.current).toEqual([]);
});
```

---

### 移行パターン一覧（Before/After）

#### CAT-01: 状態セレクタ初期値テスト

```typescript
// Before
const state = useAppStore.getState();
expect(state.selectedSkillName).toBeNull();

// After
const { result } = renderHook(() =>
  useAppStore((state) => state.selectedSkillName),
);
expect(result.current).toBeNull();
```

#### CAT-03: アクションセレクタ存在テスト

```typescript
// Before
const state = useAppStore.getState();
expect(typeof state.fetchSkills).toBe("function");

// After
const { result } = renderHook(() => useAppStore((state) => state.fetchSkills));
expect(typeof result.current).toBe("function");
```

#### CAT-05: 参照安定性テスト

```typescript
// Before: getState()ではこのテストは実施不可能
// （getState()は毎回新しいオブジェクトを返すため、参照比較に意味がない）

// After: rerender + toBe（参照比較）
const { result, rerender } = renderHook(() =>
  useAppStore((state) => state.fetchSkills),
);
const firstRef = result.current;
rerender();
expect(result.current).toBe(firstRef); // ===比較で同一参照を確認
```

#### CAT-07: 無限ループ防止テスト

```typescript
// Before: getState()では無限ループの検証自体ができない

// After: useEffect + useRef + renderHook
const renderCount = { current: 0 };

renderHook(() => {
  renderCount.current++;
  const fetchSkills = useAppStore((state) => state.fetchSkills);
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
    }
  }, [fetchSkills]); // 依存配列にアクションを含める

  return { renderCount: renderCount.current };
});

await act(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});

expect(renderCount.current).toBeLessThan(10); // 10回未満なら無限ループなし
```

#### CAT-08: 非同期アクションテスト

```typescript
// Before
const state = useAppStore.getState();
await state.fetchSkills();
expect(useAppStore.getState().availableSkillsMetadata).toEqual(expected);

// After: act + async/await
const { result } = renderHook(() => useAppStore((state) => state.fetchSkills));

await act(async () => {
  await result.current();
});

expect(useAppStore.getState().availableSkillsMetadata).toEqual(expected);
```

---

### ヘルパー関数の設計

本タスクでは3つのテストヘルパー関数を導入し、テストの冗長性を排除した。

#### assertNoInfiniteLoop

アクションセレクタを `useEffect` 依存配列に含めても無限ループが発生しないことを検証する。

```typescript
async function assertNoInfiniteLoop(
  selector: (state: AppStore) => unknown,
  maxRenders = 10,
) {
  const renderCount = { current: 0 };

  renderHook(() => {
    renderCount.current++;
    const action = useAppStore(selector);
    const initRef = useRef(false);

    useEffect(() => {
      if (!initRef.current) {
        initRef.current = true;
      }
    }, [action]);

    return { renderCount: renderCount.current };
  });

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  expect(renderCount.current).toBeLessThan(maxRenders);
}

// 使用例
await assertNoInfiniteLoop((state) => state.rescanSkills);
```

#### assertNoUnrelatedRerender

無関係な状態フィールドの変更で、対象セレクタのレンダリングが発生しないことを検証する。

```typescript
function assertNoUnrelatedRerender(
  selector: (state: AppStore) => unknown,
  stateUpdate: Partial<AppStore>,
) {
  let renderCount = 0;

  renderHook(() => {
    renderCount++;
    return useAppStore(selector);
  });

  const initialCount = renderCount;

  act(() => {
    useAppStore.setState(stateUpdate);
  });

  expect(renderCount).toBe(initialCount);
}

// 使用例: isExecutingの変更でselectedSkillNameセレクタが再レンダーされないことを確認
assertNoUnrelatedRerender((state) => state.selectedSkillName, {
  isExecuting: true,
});
```

#### assertStableReference

アクション関数の参照が再レンダリング間で安定していること（`===` で同一であること）を検証する。

```typescript
function assertStableReference(selector: (state: AppStore) => unknown) {
  const { result, rerender } = renderHook(() => useAppStore(selector));
  const firstRef = result.current;

  rerender();

  expect(result.current).toBe(firstRef);
}

// 使用例
assertStableReference((state) => state.fetchSkills);
```

---

### テストユーティリティ

#### resetStore

各テストの `beforeEach` で呼ばれるストアリセット関数。テスト間の状態汚染を防ぐ（P9対策）。

```typescript
function resetStore() {
  useAppStore.setState({
    availableSkillsMetadata: [],
    importedSkills: [],
    selectedSkillName: null,
    isExecuting: false,
    executionId: null,
    skillExecutionStatus: null,
    streamingMessages: [],
    pendingPermission: null,
    skillError: null,
    isLoadingSkills: false,
    isScanning: false,
    isImporting: false,
    importingSkillName: null,
  });
}
```

#### createMockElectronAPI

Electron IPC APIのモックを作成する関数。全てのメソッドが `vi.fn()` で定義されており、テストケースごとに挙動をカスタマイズできる。

```typescript
function createMockElectronAPI() {
  return {
    authMode: {
      get: vi
        .fn()
        .mockResolvedValue({ success: true, data: { mode: "subscription" } }),
      set: vi.fn().mockResolvedValue({ success: true }),
      // ...
    },
    llm: {
      getProviders: vi.fn().mockResolvedValue([]),
      // ...
    },
    skill: {
      list: vi.fn().mockResolvedValue(mockAvailableSkills),
      getImported: vi.fn().mockResolvedValue(mockImportedSkills),
      // ...
    },
  };
}
```

---

### テストカテゴリ構成

| カテゴリ | テスト数 | テストID範囲    | 内容                                     |
| -------- | -------- | --------------- | ---------------------------------------- |
| CAT-01   | 13       | TS-STORE-01〜13 | 状態セレクタ初期値テスト                 |
| CAT-02   | 7        | TS-STORE-14〜20 | 状態セレクタ値取得テスト                 |
| CAT-03   | 10       | TS-STORE-21〜30 | アクションセレクタ存在テスト             |
| CAT-04   | 3        | TS-STORE-31〜33 | アクション実行テスト                     |
| CAT-05   | 4        | TS-STORE-34〜37 | 関数参照安定性テスト                     |
| CAT-06   | 2        | TS-STORE-38〜39 | セレクタ再レンダー最適化テスト           |
| CAT-07   | 3        | TS-STORE-40〜42 | 無限ループ防止テスト（P31対策）          |
| CAT-08   | 4        | TS-STORE-43〜46 | 非同期アクションテスト                   |
| CAT-09   | 2        | TS-STORE-47〜48 | エラーハンドリングテスト                 |
| CAT-10   | 10       | TS-STORE-49〜58 | 個別アクション参照安定性テスト           |
| CAT-11   | 7        | TS-STORE-59〜65 | セレクタ再レンダリング隔離テスト         |
| CAT-12   | 3        | TS-STORE-66〜68 | 複数状態同時変更テスト                   |
| CAT-13   | 9        | TS-STORE-69〜77 | エッジケーステスト                       |
| CAT-14   | 3        | TS-STORE-78〜80 | resetStore()スコープ検証テスト           |
| CAT-15   | 4        | TS-STORE-81〜84 | 追加の非同期アクションエラーハンドリング |
| CAT-16   | 7        | TS-STORE-85〜91 | 追加の無限ループ防止テスト               |
| export   | 23       | -               | 個別セレクタexportテスト                 |
| **合計** | **114**  | TS-STORE-01〜91 | （+ export 23件 = 合計137テスト関数）    |

---

### 参照ファイル

| ファイル                                                                        | 役割                          |
| ------------------------------------------------------------------------------- | ----------------------------- |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts` | 本タスクの対象テストファイル  |
| `.claude/rules/06-known-pitfalls.md#P31`                                        | Zustand Store Hooks無限ループ |
| `.claude/rules/03-state-management.md`                                          | 状態管理ルール                |
| `docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/`                                | 親タスク仕様書                |
