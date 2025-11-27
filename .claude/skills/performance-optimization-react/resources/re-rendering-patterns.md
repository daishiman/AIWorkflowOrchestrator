# 再レンダリングパターン

## 再レンダリングの4つの原因

### 1. 状態の更新

**発生条件**: useState、useReducerによる状態変更

```typescript
const [count, setCount] = useState(0);

// 状態更新により再レンダリング
setCount(count + 1);
```

**制御方法**: 状態更新の頻度を最小化、複数の状態更新をバッチ処理

### 2. 親の再レンダリング

**発生条件**: 親コンポーネントが再レンダリングされると子も再レンダリング

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Child /> {/* 親が再レンダリングされると子も再レンダリング */}
    </div>
  );
};
```

**制御方法**: React.memoで子コンポーネントをメモ化

```typescript
const Child = React.memo(() => {
  // Propsが変わらない限り再レンダリングしない
  return <div>Child</div>;
});
```

### 3. Contextの値変更

**発生条件**: useContextで使用しているContext値が変わる

```typescript
const MyComponent = () => {
  const { user, theme } = useContext(AppContext);

  // userまたはthemeが変わると再レンダリング
  return <div>{user.name}</div>;
};
```

**制御方法**: Context分割、必要な値のみを使用

```typescript
// Context分割
const UserContext = createContext(null);
const ThemeContext = createContext('light');

const MyComponent = () => {
  const user = useContext(UserContext); // userのみ監視
  return <div>{user.name}</div>;
};
```

### 4. Propsの変更

**発生条件**: コンポーネントに渡されるPropsが変わる

```typescript
<MyComponent data={data} onClick={handleClick} />
```

**制御方法**: useCallbackでコールバックをメモ化、useMemoでオブジェクトをメモ化

```typescript
const handleClick = useCallback(() => {
  // 処理
}, []);

const data = useMemo(() => ({ id: 1, name: 'Test' }), []);

<MyComponent data={data} onClick={handleClick} />
```

## 再レンダリング最適化の戦略

### 戦略1: React.memo

**使用場面**: 親の再レンダリングによる不要な子の再レンダリングを防止

**実装**:

```typescript
const MyComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

**注意点**:
- Propsが変わらない場合に効果的
- Propsに関数やオブジェクトが含まれる場合は注意
- 測定に基づいて適用

### 戦略2: useCallback

**使用場面**: コールバック関数を子コンポーネントに渡す際のメモ化

**実装**:

```typescript
const Parent = () => {
  const handleClick = useCallback(() => {
    // 処理
  }, [/* 依存配列 */]);

  return <Child onClick={handleClick} />;
};
```

**注意点**:
- 依存配列を正確に指定
- 子がReact.memoでメモ化されている場合に効果的

### 戦略3: useMemo

**使用場面**: 計算コストの高い値のメモ化

**実装**:

```typescript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);
```

**注意点**:
- 計算コストが高い場合のみ適用
- 依存配列を正確に指定
- 測定に基づいて効果を確認

### 戦略4: Context分割

**使用場面**: Context更新による不要な再レンダリングを防止

**実装**:

```typescript
// 頻繁に更新される値と静的な値を分離
const UserContext = createContext(null);
const SettingsContext = createContext(defaultSettings);

// 必要なContextのみを使用
const MyComponent = () => {
  const user = useContext(UserContext);
  // SettingsContextは使用しないため、Settings更新時に再レンダリングされない
  return <div>{user.name}</div>;
};
```

## 測定と検証

### React DevTools Profilerの使用

1. **記録開始**: Profilerタブで記録開始
2. **操作実行**: 最適化したい操作を実行
3. **記録停止**: 記録を停止
4. **分析**:
   - Flamegraph: 各コンポーネントのレンダリング時間
   - Ranked: レンダリング時間の長い順
   - Component: 特定コンポーネントの詳細

### 最適化の効果測定

**比較指標**:
- レンダリング時間の削減率
- 再レンダリング回数の削減
- コミット時間の改善

**目標**:
- レンダリング時間: 50%以上削減
- 再レンダリング回数: 70%以上削減
- 体感パフォーマンス: ユーザー体験の改善

## 実践例

### 例1: 親の再レンダリング最適化

**最適化前**:

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child /> {/* 親が再レンダリングされるたびに子も再レンダリング */}
    </div>
  );
};

const Child = () => {
  console.log('Child rendered');
  return <div>Child</div>;
};
```

**最適化後**:

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child /> {/* React.memoでメモ化 */}
    </div>
  );
};

const Child = React.memo(() => {
  console.log('Child rendered');
  return <div>Child</div>;
});
```

### 例2: コールバックProps最適化

**最適化前**:

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Clicked');
  };

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child onClick={handleClick} /> {/* 毎回新しい関数が渡される */}
    </div>
  );
};

const Child = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
```

**最適化後**:

```typescript
const Parent = () => {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('Clicked');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child onClick={handleClick} /> {/* メモ化されたコールバック */}
    </div>
  );
};

const Child = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
```

### 例3: Context最適化

**最適化前**:

```typescript
const AppContext = createContext({
  user: null,
  theme: 'light',
  cart: []
});

const UserProfile = () => {
  const { user } = useContext(AppContext);
  // カートやテーマが更新されてもUserProfileが再レンダリングされる
  return <div>{user.name}</div>;
};
```

**最適化後**:

```typescript
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const CartContext = createContext([]);

const UserProfile = () => {
  const user = useContext(UserContext);
  // UserContextの更新時のみ再レンダリング
  return <div>{user.name}</div>;
};
```

## チェックリスト

- [ ] 再レンダリングの原因を特定した
- [ ] React DevTools Profilerで測定した
- [ ] 最適化前後で比較データを取得した
- [ ] React.memoは測定に基づいて適用した
- [ ] useCallbackとuseMemoの依存配列は正確
- [ ] Context分割は適切な粒度
- [ ] 最適化の効果を確認した
