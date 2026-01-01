# Hooks選択ガイド

## 概要

このドキュメントは、React Hooksを適切に選択するための判断基準を提供します。

## Hooks比較マトリクス

### 状態管理Hooks

| Hook         | 用途       | 複雑さ | 選択基準                         |
| ------------ | ---------- | ------ | -------------------------------- |
| `useState`   | 単純な状態 | 低     | 単一値、独立した状態             |
| `useReducer` | 複雑な状態 | 中     | 関連する複数状態、複雑なロジック |

### 最適化Hooks

| Hook          | 用途                 | オーバーヘッド | 選択基準                         |
| ------------- | -------------------- | -------------- | -------------------------------- |
| `useCallback` | 関数メモ化           | 小             | 子コンポーネントへのコールバック |
| `useMemo`     | 値メモ化             | 小             | 計算コストの高い処理             |
| `React.memo`  | コンポーネントメモ化 | 中             | props変更が少ないコンポーネント  |

### 副作用Hooks

| Hook              | 実行タイミング | 用途                          |
| ----------------- | -------------- | ----------------------------- |
| `useEffect`       | レンダリング後 | データフェッチ、購読、DOM操作 |
| `useLayoutEffect` | DOM更新直後    | DOM測定、同期的な副作用       |

### 参照Hooks

| Hook                  | 用途           | 再レンダリング |
| --------------------- | -------------- | -------------- |
| `useRef`              | 可変参照保持   | 発生しない     |
| `useImperativeHandle` | 親への参照公開 | 発生しない     |

## useState vs useReducer 判断フロー

```
状態の形状は？
├─ 単一の値またはプリミティブ → useState
├─ 関連する複数の値
│   ├─ 更新ロジックがシンプル → useState × 複数
│   └─ 更新ロジックが複雑 → useReducer
└─ 状態遷移が複雑（FSM的）→ useReducer
```

### useStateが適切なケース

```typescript
// シンプルなトグル
const [isOpen, setIsOpen] = useState(false);

// 独立した複数の状態
const [name, setName] = useState("");
const [email, setEmail] = useState("");

// 単純なカウンター
const [count, setCount] = useState(0);
```

### useReducerが適切なケース

```typescript
// 関連する複数の状態
interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

// 複雑な状態遷移
type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: Data }
  | { status: "error"; error: Error };
```

## メモ化Hook選択基準

### useCallback適用判断

```
コールバック関数を子に渡す？
├─ いいえ → 不要
└─ はい
    ├─ 子はReact.memoを使用？
    │   ├─ いいえ → 効果薄い
    │   └─ はい → useCallback適用
    └─ 子のレンダリングコストは高い？
        ├─ いいえ → 不要かもしれない
        └─ はい → useCallback適用
```

### useMemo適用判断

```
計算処理がある？
├─ 単純な計算（O(1)） → 不要
├─ 中程度の計算（O(n)）
│   ├─ データサイズが小さい（<100） → 不要
│   └─ データサイズが大きい（>100） → useMemo検討
└─ 複雑な計算（O(n²)以上） → useMemo適用
```

## アンチパターン

### 1. 過剰なメモ化

```typescript
// ❌ 悪い例: 不要なメモ化
const doubled = useMemo(() => count * 2, [count]);

// ✅ 良い例: シンプルな計算はそのまま
const doubled = count * 2;
```

### 2. 依存配列の省略

```typescript
// ❌ 悪い例: 依存配列を省略
useEffect(() => {
  fetchData(userId);
}, []); // userIdが依存から漏れている

// ✅ 良い例: すべての依存を含める
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 3. 無限ループ

```typescript
// ❌ 悪い例: 毎回新しいオブジェクト
useEffect(() => {
  doSomething({ count });
}, [{ count }]); // 毎回新しいオブジェクト

// ✅ 良い例: プリミティブ値を依存に
useEffect(() => {
  doSomething({ count });
}, [count]);
```

## ベストプラクティス

1. **測定優先**: React DevTools Profilerで問題を確認してから最適化
2. **シンプル優先**: 複雑なHookより単純な解決策を優先
3. **ESLint信頼**: exhaustive-depsルールの警告に従う
4. **カスタムフック抽出**: ロジックが複雑になったらカスタムフックに分離
