# 状態配置判断ガイド

## 概要

状態をどこに配置するかは、Reactアプリケーションの設計において最も重要な決定の一つです。
適切な配置は、パフォーマンス、保守性、テスト容易性に直結します。

## 判断フローチャート

```
この状態は誰が使う？
    │
    ├── 1つのコンポーネントのみ
    │   └── ✅ ローカル状態（useState）
    │
    ├── 親子関係のコンポーネント
    │   └── ✅ 親に持ち上げ + props
    │
    ├── 兄弟コンポーネント
    │   └── ✅ 共通の親に持ち上げ + props
    │
    ├── 離れた複数コンポーネント（3階層以上）
    │   ├── データが頻繁に変更される？
    │   │   ├── いいえ → ✅ Context API
    │   │   └── はい → ✅ 状態管理ライブラリ
    │   │
    │   └── 「グローバル」なデータ（テーマ、認証）？
    │       └── ✅ Context API
    │
    └── サーバーからのデータ？
        └── ✅ SWR / React Query（サーバー状態）
```

## 配置レベル

### Level 1: ローカル状態

**使用条件**:

- 1つのコンポーネントでのみ使用
- UIの一時的な状態（開閉、ホバー、フォーカス）
- フォームの入力値（送信前）

```typescript
function SearchInput() {
  // ✅ このコンポーネント内でのみ使用
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}
```

### Level 2: 親コンポーネントへの持ち上げ

**使用条件**:

- 親子間でデータを共有
- 兄弟コンポーネント間でデータを同期
- 親がデータの「真実の源」となる

```typescript
// ❌ 悪い例: 各子が独立した状態を持つ
function Parent() {
  return (
    <>
      <TemperatureInput scale="c" />
      <TemperatureInput scale="f" />
    </>
  );
}

// ✅ 良い例: 親に持ち上げて同期
function Parent() {
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');

  const celsius = scale === 'f' ? tryConvert(temperature, toCelsius) : temperature;
  const fahrenheit = scale === 'c' ? tryConvert(temperature, toFahrenheit) : temperature;

  return (
    <>
      <TemperatureInput
        scale="c"
        temperature={celsius}
        onTemperatureChange={(temp) => {
          setScale('c');
          setTemperature(temp);
        }}
      />
      <TemperatureInput
        scale="f"
        temperature={fahrenheit}
        onTemperatureChange={(temp) => {
          setScale('f');
          setTemperature(temp);
        }}
      />
    </>
  );
}
```

### Level 3: Context API

**使用条件**:

- 多くのコンポーネントで共有（3階層以上）
- 「グローバル」的なデータ
- 更新頻度が低い〜中程度

```typescript
// テーマ、認証、言語設定などに適切
const ThemeContext = createContext<Theme>("light");
const AuthContext = createContext<AuthState | null>(null);
const LocaleContext = createContext<Locale>("ja");
```

### Level 4: 状態管理ライブラリ

**使用条件**:

- 複雑な状態ロジック
- 高頻度の更新
- 複数の状態間の依存関係
- DevToolsによるデバッグが必要

```typescript
// Zustand例
const useStore = create((set) => ({
  cart: [],
  addItem: (item) =>
    set((state) => ({
      cart: [...state.cart, item],
    })),
  removeItem: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),
}));
```

### Level 5: サーバー状態

**使用条件**:

- サーバーからフェッチするデータ
- キャッシュ、再検証が必要
- 楽観的更新が必要

```typescript
// SWR / React Query
const { data, error, isLoading } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUser(userId),
});
```

## 判断マトリックス

| 特性           | ローカル | 持ち上げ   | Context | ライブラリ | サーバー状態 |
| -------------- | -------- | ---------- | ------- | ---------- | ------------ |
| 使用範囲       | 単一     | 親子・兄弟 | 広範囲  | 広範囲     | 広範囲       |
| 更新頻度       | 任意     | 任意       | 低〜中  | 高         | 低〜中       |
| 複雑性         | 低       | 低         | 中      | 高         | 中           |
| パフォーマンス | ✅       | ✅         | ⚠️      | ✅         | ✅           |
| DevTools       | ❌       | ❌         | ❌      | ✅         | ✅           |

## アンチパターン

### 1. 過度な持ち上げ

```typescript
// ❌ 悪い例: すべてをルートに持ち上げ
function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  // ... 多数の状態

  return (
    <Layout>
      <Header />
      <Search query={searchQuery} onQueryChange={setSearchQuery} />
      <Sidebar filterOpen={filterOpen} onFilterToggle={() => setFilterOpen(!filterOpen)} />
      <ProductList sortOrder={sortOrder} onSortChange={setSortOrder} />
    </Layout>
  );
}

// ✅ 良い例: 必要な場所に分散
function App() {
  return (
    <Layout>
      <Header />
      <Search />        {/* 内部でsearchQuery管理 */}
      <Sidebar />       {/* 内部でfilterOpen管理 */}
      <ProductList />   {/* 内部でsortOrder管理 */}
    </Layout>
  );
}
```

### 2. 状態の重複

```typescript
// ❌ 悪い例: 同じ状態を複数箇所で管理
function Parent() {
  const [items, setItems] = useState([]);
  return (
    <>
      <List items={items} />
      <Summary items={items} />  {/* Summaryも内部でitemsを持っている */}
    </>
  );
}

// ✅ 良い例: 単一の真実の源
function Parent() {
  const [items, setItems] = useState([]);
  return (
    <>
      <List items={items} />
      <Summary items={items} />  {/* propsで受け取るだけ */}
    </>
  );
}
```

### 3. Contextの乱用

```typescript
// ❌ 悪い例: 高頻度更新データをContextに
const MousePositionContext = createContext({ x: 0, y: 0 });

// ✅ 良い例: 低頻度データのみContextに
const ThemeContext = createContext("light");
```

## ベストプラクティス

1. **デフォルトはローカル**: まずローカル状態で始め、必要に応じて持ち上げる
2. **最小の持ち上げ**: 必要な高さまでのみ持ち上げる
3. **派生状態を避ける**: 計算できる値は状態にしない
4. **状態の正規化**: 重複を避け、単一の真実の源を維持
5. **適切なツール選択**: 要件に合った状態管理手法を選ぶ
