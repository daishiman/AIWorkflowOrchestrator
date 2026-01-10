# メモ化戦略

## 概要

Reactにおけるメモ化は、不要な再計算と再レンダリングを防ぐための最適化技術です。
ただし、**測定に基づいて最適化する**ことが重要です。

## 基本原則

### 測定優先の原則

「早すぎる最適化は諸悪の根源」- Donald Knuth

```
1. パフォーマンス問題を発見する（React DevTools Profiler）
2. ボトルネックを特定する
3. メモ化を適用する
4. 効果を測定する
```

## メモ化の種類

### 1. useCallback - 関数のメモ化

**目的**: 関数の参照同一性を保持

```typescript
// ❌ 毎回新しい関数が作られる
const handleClick = () => {
  doSomething(id);
};

// ✅ 同じ関数参照を維持
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

**適用基準**:

- コールバックを子コンポーネントに渡す
- 子コンポーネントがReact.memoでラップされている
- 子コンポーネントのレンダリングコストが高い

### 2. useMemo - 値のメモ化

**目的**: 計算結果をキャッシュ

```typescript
// ❌ 毎回フィルタリングが実行される
const filteredItems = items.filter((item) => item.active);

// ✅ itemsが変わった時だけ再計算
const filteredItems = useMemo(
  () => items.filter((item) => item.active),
  [items],
);
```

**適用基準**:

- 計算コストが高い（O(n)以上のループ、複雑な変換）
- 大きなデータ構造の処理
- 結果の参照同一性が重要

### 3. React.memo - コンポーネントのメモ化

**目的**: propsが変わらない限り再レンダリングをスキップ

```typescript
// 親が再レンダリングされても、propsが同じなら再レンダリングしない
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  return <ComplexVisualization data={data} />;
});
```

**適用基準**:

- 親の再レンダリングが頻繁
- コンポーネントのレンダリングコストが高い
- propsが頻繁に変わらない

## 効果的なメモ化パターン

### パターン1: コールバック + memo の組み合わせ

```typescript
// 親コンポーネント
function Parent() {
  const [count, setCount] = useState(0);

  // コールバックをメモ化
  const handleItemClick = useCallback((id: string) => {
    console.log('clicked:', id);
  }, []); // 依存なし = 常に同じ関数

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ItemList items={items} onItemClick={handleItemClick} />
    </>
  );
}

// 子コンポーネント - メモ化
const ItemList = React.memo(({ items, onItemClick }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
});
```

### パターン2: 高コスト計算のメモ化

```typescript
function DataProcessor({ rawData, filterCriteria }) {
  // 重い計算をメモ化
  const processedData = useMemo(() => {
    console.log('Processing data...'); // デバッグ用

    return rawData
      .filter(item => matchesCriteria(item, filterCriteria))
      .map(item => transform(item))
      .sort((a, b) => compare(a, b));
  }, [rawData, filterCriteria]);

  return <DataTable data={processedData} />;
}
```

### パターン3: 参照同一性の維持

```typescript
function SearchResults({ query }) {
  // オブジェクトの参照を安定させる
  const searchOptions = useMemo(
    () => ({
      query,
      limit: 20,
      includeMetadata: true,
    }),
    [query],
  );

  // searchOptionsの参照が安定するので、
  // useEffectは必要な時だけ実行される
  useEffect(() => {
    performSearch(searchOptions);
  }, [searchOptions]);
}
```

## アンチパターン

### 1. 不要なメモ化

```typescript
// ❌ 単純な計算にuseMemoは不要
const doubled = useMemo(() => count * 2, [count]);

// ✅ そのまま計算
const doubled = count * 2;
```

### 2. 依存配列の不完全さ

```typescript
// ❌ filterが漏れている
const filtered = useMemo(
  () => items.filter(filter),
  [items], // filterが依存から漏れている
);

// ✅ すべての依存を含む
const filtered = useMemo(() => items.filter(filter), [items, filter]);
```

### 3. メモ化のチェーン問題

```typescript
// ❌ 過度にチェーンされたメモ化
const a = useMemo(() => compute1(x), [x]);
const b = useMemo(() => compute2(a), [a]);
const c = useMemo(() => compute3(b), [b]);

// ✅ 一つにまとめる
const result = useMemo(() => {
  const a = compute1(x);
  const b = compute2(a);
  return compute3(b);
}, [x]);
```

## パフォーマンス測定

### React DevTools Profiler

1. React DevToolsを開く
2. Profilerタブを選択
3. 「Record」をクリック
4. アプリを操作
5. 「Stop」をクリック
6. 結果を分析

**確認ポイント**:

- Render duration（レンダリング時間）
- Why did this render?（再レンダリング理由）
- Ranked chart（最もコストの高いコンポーネント）

### コンソールでの計測

```typescript
const expensiveValue = useMemo(() => {
  console.time('expensiveCalculation');
  const result = /* 計算 */;
  console.timeEnd('expensiveCalculation');
  return result;
}, [deps]);
```

## 判断フローチャート

```
パフォーマンス問題がある？
├─ いいえ → メモ化不要
└─ はい → 問題の原因は？
    ├─ 高コスト計算 → useMemo
    ├─ 子への関数渡し → useCallback + React.memo
    └─ 親の頻繁な再レンダリング → React.memo
```

## ベストプラクティスまとめ

1. **測定してから最適化**: 問題を確認してからメモ化
2. **コスト判断**: メモ化のオーバーヘッドと効果を比較
3. **依存の正確性**: すべての依存を正しく指定
4. **組み合わせ**: useCallback + React.memoの併用
5. **シンプルさ優先**: 不要なメモ化は避ける
