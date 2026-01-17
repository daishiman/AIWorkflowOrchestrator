# 基本カスタムフックテンプレート

## 概要

一般的なユースケースに対応する基本的なカスタムフックのテンプレート集。
各カテゴリの詳細実装は個別ファイルを参照。

## カテゴリ一覧

| カテゴリ       | ファイル                                     | 主なフック                           |
| -------------- | -------------------------------------------- | ------------------------------------ |
| 状態管理       | [basic-state-hooks.md](basic-state-hooks.md) | useToggle, useCounter, useInput      |
| 副作用         | [side-effect-hooks.md](side-effect-hooks.md) | useDebounce, useInterval, useTimeout |
| イベント       | [event-hooks.md](event-hooks.md)             | useEventListener, useClickOutside    |
| ブラウザAPI    | [browser-api-hooks.md](browser-api-hooks.md) | useLocalStorage, useMediaQuery       |
| ユーティリティ | [utility-hooks.md](utility-hooks.md)         | usePrevious, useMounted              |

## 状態管理フック

### useToggle

ブール値の切り替えを管理するフック。

```typescript
const [isOpen, toggle, setIsOpen] = useToggle(false);
```

詳細: [basic-state-hooks.md](basic-state-hooks.md)

### useCounter

カウンター状態を管理するフック。min/max/step対応。

```typescript
const { count, increment, decrement, reset, set } = useCounter(0, {
  min: 0,
  max: 10,
});
```

詳細: [basic-state-hooks.md](basic-state-hooks.md)

### useInput

入力フィールドの状態を管理するフック。

```typescript
const name = useInput('');
<input {...name.bind} />
```

詳細: [basic-state-hooks.md](basic-state-hooks.md)

## 副作用フック

### useDebounce

値のデバウンスを行うフック。検索入力に最適。

```typescript
const debouncedQuery = useDebounce(searchTerm, 300);
```

詳細: [side-effect-hooks.md](side-effect-hooks.md)

### useInterval

インターバルを管理するフック。nullで停止可能。

```typescript
useInterval(() => setCount((c) => c + 1), isRunning ? 1000 : null);
```

詳細: [side-effect-hooks.md](side-effect-hooks.md)

### useTimeout

タイムアウトを管理するフック。クリア関数を返す。

```typescript
const clear = useTimeout(() => setVisible(false), 3000);
```

詳細: [side-effect-hooks.md](side-effect-hooks.md)

## イベントフック

### useEventListener

イベントリスナーを管理するフック。クリーンアップ自動化。

```typescript
useEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
```

詳細: [event-hooks.md](event-hooks.md)

### useClickOutside

要素外クリックを検出するフック。ドロップダウンに最適。

```typescript
const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
```

詳細: [event-hooks.md](event-hooks.md)

## ブラウザAPIフック

### useLocalStorage

ローカルストレージと同期する状態を管理するフック。

```typescript
const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");
```

詳細: [browser-api-hooks.md](browser-api-hooks.md)

### useMediaQuery

メディアクエリの状態を監視するフック。

```typescript
const isMobile = useMediaQuery("(max-width: 768px)");
```

詳細: [browser-api-hooks.md](browser-api-hooks.md)

## ユーティリティフック

### usePrevious

前回の値を保持するフック。変化検出に便利。

```typescript
const previousCount = usePrevious(count);
```

詳細: [utility-hooks.md](utility-hooks.md)

### useMounted

コンポーネントのマウント状態を追跡するフック。

```typescript
const isMounted = useMounted();
if (isMounted()) setData(data);
```

詳細: [utility-hooks.md](utility-hooks.md)

## 選択ガイド

| ユースケース             | 推奨フック       |
| ------------------------ | ---------------- |
| モーダル開閉             | useToggle        |
| 数量選択                 | useCounter       |
| フォーム入力             | useInput         |
| 検索入力                 | useDebounce      |
| ポーリング               | useInterval      |
| 一時表示                 | useTimeout       |
| キーボードショートカット | useEventListener |
| ドロップダウン閉じる     | useClickOutside  |
| 設定の永続化             | useLocalStorage  |
| レスポンシブ対応         | useMediaQuery    |
| 変化検出                 | usePrevious      |
| 非同期安全               | useMounted       |
