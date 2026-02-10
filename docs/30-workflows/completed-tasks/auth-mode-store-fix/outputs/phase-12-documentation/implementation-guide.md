# 実装ガイド: Zustand Store Hooks無限ループ修正

## メタ情報

| 項目        | 値                                   |
| ----------- | ------------------------------------ |
| タスクID    | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| 親タスク    | UT-AUTH-MODE-UI-001                  |
| 作成日      | 2026-02-10                           |
| 関連Pitfall | P31                                  |

---

## Part 1: 概念的説明（中学生レベル）

### 無限ループって何？

**日常生活での例え:**

お母さんに「部屋を片付けなさい」と言われたとします。あなたは素直に部屋を片付けます。でも、片付け終わった瞬間にまたお母さんが「部屋を片付けなさい」と言ってきます。

「え？今片付けたばかりなのに...」と思いながらまた片付けます。でもまた「片付けなさい」と言われます。これが永遠に続いたらどうなるでしょう？

1. 部屋を片付ける
2. お母さんに「片付けなさい」と言われる
3. また片付ける
4. また「片付けなさい」と言われる
5. 永遠に終わらない...

これが**無限ループ**です。同じことを永遠に繰り返してしまう状態のことです。

### 今回のアプリで何が起きた？

設定画面を開くと、アプリがこんな状態になっていました:

1. 設定画面を開く
2. アプリ「認証方式を確認しなさい！」
3. 確認する
4. アプリ「認証方式を確認しなさい！」（また同じ指示）
5. また確認する
6. 永遠にローディング表示...（ぐるぐる回り続ける）

ユーザーから見ると「設定画面がずっとローディング中で使えない！」という状態でした。

### なぜ同じ指示が繰り返されたの？

これは「**指示書**」の問題でした。

普通なら:

- 「認証方式を確認してね」という指示書が**1枚だけ**渡される
- 1回確認したら終わり

今回の問題:

- 「認証方式を確認してね」という指示書が**毎回新しく作られて**渡されていた
- 内容は同じでも「新しい紙」なので、アプリは「新しい指示が来た！」と判断
- また確認を始める
- また新しい指示書が来る
- 無限ループ

**イメージ:**

```
普通: 同じ紙を使い回す → 「もう読んだ」とわかる
問題: 毎回コピー機で新しい紙を印刷 → 「新しい指示だ！」と勘違い
```

### どうやって直した？

**メモ（useRef）を使う方法:**

「1回やったらメモに印をつける」という仕組みを追加しました:

1. 最初「まだやってない」とメモに書いてある
2. 指示が来る → メモを見る → 「まだやってない」→ 確認を実行
3. メモを「やった」に書き換える
4. また指示が来る → メモを見る → 「やった」→ 何もしない（スキップ）
5. 終わり！

**イメージ:**

```
Before: 指示書が来る → とにかく実行 → 無限ループ
After:  指示書が来る → メモを確認 → 初回だけ実行 → 2回目以降はスキップ
```

### まとめ（中学生向け）

| 用語           | 意味                                   |
| -------------- | -------------------------------------- |
| 無限ループ     | 同じことが永遠に繰り返される状態       |
| useRef（メモ） | 「1回やったかどうか」を記録するメモ帳  |
| 問題           | 毎回新しい指示書が来て、アプリが勘違い |
| 解決           | メモを見て、初回だけ実行するようにした |

---

## Part 2: 技術的詳細

### 問題の根本原因

#### Zustand Store Hooksのオブジェクト返却

Zustand Store Hooksがオブジェクトを返す際、毎回新しい参照を生成していました:

```typescript
// 問題のあるパターン（store/index.ts:318-338）
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    status: state.status,
    initializeAuthMode: state.initializeAuthMode,
    setAuthMode: state.setAuthMode,
    // ...
  }));
```

このHookを呼び出すたびに、**新しいオブジェクト**が生成されます。オブジェクトの中身（値）は同じでも、JavaScriptでは「参照が異なる = 別のオブジェクト」と判定されます。

#### useEffectの依存配列との相互作用

```typescript
// 問題のあるコンポーネントパターン
const { initializeAuthMode } = useAuthModeStore();

useEffect(() => {
  initializeAuthMode(); // 初期化を実行
}, [initializeAuthMode]); // ← 問題の依存配列
```

**無限ループの発生メカニズム:**

1. コンポーネントがレンダリングされる
2. `useAuthModeStore()` が新しいオブジェクトを返す
3. `initializeAuthMode` は新しい参照
4. Reactは「依存配列の値が変わった」と判断
5. `useEffect` が再実行される
6. `initializeAuthMode()` が呼ばれる
7. 状態が更新され、コンポーネントが再レンダリング
8. 手順2に戻る → **無限ループ**

### 修正パターン

#### useRefによる初期化ガード

```typescript
// 修正後のパターン
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true; // 一度だけ実行フラグを立てる
    initializeAuthMode();
  }
}, []); // 依存配列は空（マウント時のみ実行）
```

**なぜuseRefを使うのか:**

| 手法           | 問題点                                                           |
| -------------- | ---------------------------------------------------------------- |
| `useState`     | 状態変更で再レンダリングが発生し、別の無限ループを誘発する可能性 |
| グローバル変数 | コンポーネントインスタンス間で共有されてしまう                   |
| `useRef`       | 再レンダリングを起こさず、コンポーネントインスタンスごとに独立   |

#### ESLint警告への対処

空の依存配列を使用すると、ESLintの`react-hooks/exhaustive-deps`ルールが警告を出します:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps -- useRefで初期化を1回に制限しているため依存配列は空で正しい
useEffect(() => {
  // ...
}, []);
```

**重要**: `eslint-disable`を使用する場合は、必ず理由コメントを付けること。

### 影響を受けたコンポーネント

| コンポーネント   | ファイルパス                                                    | 修正内容                  |
| ---------------- | --------------------------------------------------------------- | ------------------------- |
| SettingsView     | `apps/desktop/src/renderer/views/SettingsView/index.tsx`        | useRefガード追加          |
| LLMSelectorPanel | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx` | useRefガード追加          |
| SkillSelector    | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`  | useCallback依存配列見直し |

#### SettingsViewの修正

```typescript
// Before
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);

// After
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

#### LLMSelectorPanelの修正

```typescript
// Before
useEffect(() => {
  fetchProviders();
  checkHealth();
}, [fetchProviders, checkHealth]);

// After
const fetchedRef = useRef(false);
useEffect(() => {
  if (!fetchedRef.current) {
    fetchedRef.current = true;
    fetchProviders();
    checkHealth();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

#### SkillSelectorの修正

```typescript
// Before
const loadSkills = useCallback(async () => {
  // ...
}, [selectSkillByName, rescanSkills]);

// After
const loadSkills = useCallback(async () => {
  // ...
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // 初期マウント時のみ実行
```

### 長期的な改善案（将来タスク）

現在の修正は**短期対策**です。根本的な解決には、Store Hooksを個別セレクタベースに再設計する必要があります:

#### 現在の問題あるパターン

```typescript
// 毎回新しいオブジェクトを生成
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    status: state.status,
    initializeAuthMode: state.initializeAuthMode,
    setAuthMode: state.setAuthMode,
  }));
```

#### 推奨される改善案

```typescript
// 個別セレクタとして定義（参照が安定）
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
export const useSetAuthMode = () => useAppStore((state) => state.setAuthMode);

// 使用側
const mode = useAuthMode();
const initializeAuthMode = useInitializeAuthMode();
// → initializeAuthModeは同じ参照が返るため、依存配列に含めても安全
```

**改善のメリット:**

- 各セレクタがプリミティブ値または関数の単一参照を返す
- 依存配列に安全に含められる
- useRefガードが不要になる
- コードがより宣言的になる

**関連未タスク**: UT-STORE-HOOKS-REFACTOR-001

### テストパターン

#### 初期化が1回だけ実行されることを検証

```typescript
describe('SettingsView', () => {
  it('initializeAuthModeが1回だけ呼ばれること', async () => {
    const mockInitializeAuthMode = vi.fn();
    // ... モック設定

    const { rerender } = render(<SettingsView />);
    rerender(<SettingsView />);
    rerender(<SettingsView />);

    // 複数回レンダリングしても1回だけ呼ばれる
    expect(mockInitializeAuthMode).toHaveBeenCalledTimes(1);
  });
});
```

### 関連ドキュメント

| ドキュメント      | パス                                   | 内容                |
| ----------------- | -------------------------------------- | ------------------- |
| 状態管理ルール    | `.claude/rules/03-state-management.md` | Zustand設計原則     |
| 既知の落とし穴    | `.claude/rules/06-known-pitfalls.md`   | P31: 本問題の記録   |
| React Hooksルール | ESLint react-hooks                     | exhaustive-deps警告 |

---

## まとめ

| 項目           | 内容                                          |
| -------------- | --------------------------------------------- |
| **問題**       | Store Hooksが毎回新しいオブジェクトを返す     |
| **症状**       | 設定画面が無限ローディング                    |
| **短期対策**   | useRefで初期化を1回に制限                     |
| **長期対策**   | 個別セレクタベースのStore Hooksに再設計       |
| **影響範囲**   | SettingsView, LLMSelectorPanel, SkillSelector |
| **Pitfall ID** | P31                                           |
