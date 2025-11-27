# React.memo 活用ガイド

## React.memoとは

React.memoは、コンポーネントのメモ化によって不要な再レンダリングを防ぐ高階コンポーネント（HOC）です。
Propsが変わらない限り、前回のレンダリング結果を再利用します。

## 基本的な使い方

### シンプルなメモ化

```typescript
const MyComponent = React.memo(({ name }) => {
  console.log('Rendering MyComponent');
  return <div>{name}</div>;
});
```

親が再レンダリングされても、`name` Propsが変わらない限り再レンダリングされません。

### カスタム比較関数

```typescript
const MyComponent = React.memo(
  ({ data }) => {
    return <div>{data.name}</div>;
  },
  (prevProps, nextProps) => {
    // trueを返すと再レンダリングをスキップ
    return prevProps.data.id === nextProps.data.id;
  }
);
```

## React.memoを使うべき場合

### ケース1: 親の頻繁な再レンダリング

**状況**: 親コンポーネントが頻繁に更新されるが、子のPropsは変わらない

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <ExpensiveChild /> {/* countが変わっても再レンダリング不要 */}
    </div>
  );
};

const ExpensiveChild = React.memo(() => {
  // 重い処理
  return <div>Expensive rendering</div>;
});
```

### ケース2: リスト内のアイテムコンポーネント

**状況**: リストの一部のみが更新される場合

```typescript
const ItemList = ({ items }) => {
  return (
    <ul>
      {items.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
    </ul>
  );
};

const ListItem = React.memo(({ item }) => {
  return <li>{item.name}</li>;
});
```

### ケース3: コンテキスト使用コンポーネントの分離

**状況**: Context使用コンポーネントと使用しないコンポーネントを分離

```typescript
const Parent = () => {
  return (
    <div>
      <ContextConsumer /> {/* Context更新で再レンダリング */}
      <PureChild />        {/* Context更新の影響を受けない */}
    </div>
  );
};

const PureChild = React.memo(() => {
  return <div>Static content</div>;
});
```

## React.memoを避けるべき場合

### ケース1: Propsが毎回変わる

**理由**: メモ化のオーバーヘッドが無駄

```typescript
// 悪い例: handleClickが毎回新しい関数
const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <Child
      count={count}
      onClick={() => console.log('Clicked')} // 毎回新しい関数
    />
  );
};

const Child = React.memo(({ count, onClick }) => {
  return <button onClick={onClick}>{count}</button>;
});
```

**解決策**: useCallbackでコールバックをメモ化

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return (
    <Child count={count} onClick={handleClick} />
  );
};
```

### ケース2: レンダリングコストが低い

**理由**: メモ化のオーバーヘッドが利益を上回る

```typescript
// 不要な最適化
const SimpleComponent = React.memo(({ text }) => {
  return <div>{text}</div>;
});
```

**判断基準**: React DevTools Profilerで測定し、レンダリング時間が10ms未満なら不要

### ケース3: 早すぎる最適化

**理由**: パフォーマンス問題がないのに最適化

```typescript
// 測定なしの早すぎる最適化
const MyComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

**正しいアプローチ**:
1. React DevTools Profilerで測定
2. パフォーマンス問題を確認
3. 最適化を実施
4. 効果を測定

## カスタム比較関数のパターン

### パターン1: IDによる比較

```typescript
const UserProfile = React.memo(
  ({ user }) => {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### パターン2: 複数プロパティの比較

```typescript
const ProductCard = React.memo(
  ({ product, discount }) => {
    return (
      <div>
        <h3>{product.name}</h3>
        <p>Price: {product.price * (1 - discount)}</p>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.discount === nextProps.discount
    );
  }
);
```

### パターン3: 深い比較（注意）

```typescript
import isEqual from 'lodash/isEqual';

const ComplexComponent = React.memo(
  ({ data }) => {
    return <div>{JSON.stringify(data)}</div>;
  },
  (prevProps, nextProps) => {
    // 注意: 深い比較はコストが高い
    return isEqual(prevProps.data, nextProps.data);
  }
);
```

## React.memoとその他の最適化の組み合わせ

### 組み合わせ1: React.memo + useCallback

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child onClick={handleClick} />
    </div>
  );
};

const Child = React.memo(({ onClick }) => {
  return <button onClick={onClick}>Click me</button>;
});
```

### 組み合わせ2: React.memo + useMemo

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  const data = useMemo(() => ({
    id: 1,
    name: 'Test'
  }), []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child data={data} />
    </div>
  );
};

const Child = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

### 組み合わせ3: React.memo + Context分離

```typescript
const UserContext = createContext(null);
const ThemeContext = createContext('light');

const Parent = () => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={theme}>
        <UserProfile />  {/* User更新時のみ再レンダリング */}
        <ThemeToggle />  {/* Theme更新時のみ再レンダリング */}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

const UserProfile = React.memo(() => {
  const user = useContext(UserContext);
  return <div>{user?.name}</div>;
});

const ThemeToggle = React.memo(() => {
  const theme = useContext(ThemeContext);
  return <button>{theme}</button>;
});
```

## トラブルシューティング

### 問題1: React.memoが効かない

**症状**: React.memoを適用しても再レンダリングされる

**原因と解決策**:

1. **Propsに関数が含まれている**
   ```typescript
   // 悪い例
   <Child onClick={() => console.log('Clicked')} />

   // 良い例
   const handleClick = useCallback(() => console.log('Clicked'), []);
   <Child onClick={handleClick} />
   ```

2. **Propsにオブジェクトが含まれている**
   ```typescript
   // 悪い例
   <Child data={{ id: 1, name: 'Test' }} />

   // 良い例
   const data = useMemo(() => ({ id: 1, name: 'Test' }), []);
   <Child data={data} />
   ```

3. **Propsに配列が含まれている**
   ```typescript
   // 悪い例
   <Child items={items.filter(item => item.active)} />

   // 良い例
   const activeItems = useMemo(
     () => items.filter(item => item.active),
     [items]
   );
   <Child items={activeItems} />
   ```

### 問題2: パフォーマンス改善がない

**症状**: React.memoを適用してもパフォーマンスが変わらない

**原因と解決策**:

1. **レンダリングコストが低い**
   - React DevTools Profilerで測定
   - 10ms未満ならReact.memoは不要

2. **Propsが頻繁に変わる**
   - Propsの変更頻度を確認
   - 必要なら状態設計を見直す

3. **メモ化のオーバーヘッド**
   - カスタム比較関数が重い
   - シンプルな比較に変更

## 測定と検証

### React DevTools Profilerでの確認

1. **記録開始**: Profilerタブで記録開始
2. **操作実行**: 最適化したい操作を実行
3. **記録停止**: 記録を停止
4. **分析**:
   - React.memo適用前後の比較
   - レンダリング回数の減少を確認
   - レンダリング時間の削減を確認

### 効果の目安

- **レンダリング回数**: 70%以上削減
- **レンダリング時間**: 50%以上削減
- **体感パフォーマンス**: ユーザー体験の改善

## チェックリスト

- [ ] React DevTools Profilerで測定済み
- [ ] パフォーマンス問題を確認済み
- [ ] Propsの変更頻度を確認済み
- [ ] 関数PropsはuseCallbackでメモ化
- [ ] オブジェクトPropsはuseMemoでメモ化
- [ ] カスタム比較関数は必要最小限
- [ ] 最適化後の効果を測定済み
- [ ] 副作用や新しい問題なし
