# カスタムフック抽出の判断基準

## 概要

カスタムフックへの抽出は、コードの再利用性と保守性を高める強力な手法ですが、
すべてのロジックを抽出すべきではありません。このドキュメントでは、
抽出の判断基準を明確にします。

## 抽出判断フローチャート

```
このロジックは複数箇所で使われる？
├── はい → ✅ 抽出を強く推奨
│
└── いいえ → ロジックは複雑？
    │
    ├── はい → テストが必要？
    │   │
    │   ├── はい → ✅ 抽出を推奨（テスト容易性）
    │   │
    │   └── いいえ → コンポーネントが肥大化？
    │       │
    │       ├── はい → ✅ 抽出を検討（可読性）
    │       │
    │       └── いいえ → ❌ 抽出不要
    │
    └── いいえ → ❌ 抽出不要（過度な抽象化を避ける）
```

## 抽出すべきケース

### 1. 同じロジックが複数箇所で使用

```typescript
// ❌ Before: 同じロジックが散在
function ComponentA() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(prev => !prev);
  // ...
}

function ComponentB() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(prev => !prev);
  // ...
}

// ✅ After: カスタムフックに抽出
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(prev => !prev), []);
  return [value, toggle] as const;
}

function ComponentA() {
  const [isOpen, toggle] = useToggle();
  // ...
}
```

### 2. 複雑な状態と副作用の組み合わせ

```typescript
// ❌ Before: 複雑なロジックがコンポーネント内に
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [userId]);

  const updateUser = async (data) => {
    try {
      const updated = await updateUserApi(userId, data);
      setUser(updated);
    } catch (err) {
      setError(err);
    }
  };

  // ... render logic
}

// ✅ After: カスタムフックに抽出
function useUser(userId) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [userId]);

  const updateUser = useCallback(async (data) => {
    try {
      const updated = await updateUserApi(userId, data);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [userId]);

  return { user, isLoading, error, updateUser };
}

function UserProfile({ userId }) {
  const { user, isLoading, error, updateUser } = useUser(userId);
  // ... clean render logic
}
```

### 3. テストが必要な独立したロジック

```typescript
// 抽出することでテストが容易に
function useFormValidation(schema) {
  const [errors, setErrors] = useState({});

  const validate = useCallback((values) => {
    const result = schema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, [schema]);

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, clearErrors };
}

// テスト
describe('useFormValidation', () => {
  it('should return errors for invalid data', () => {
    const { result } = renderHook(() => useFormValidation(userSchema));

    act(() => {
      result.current.validate({ email: 'invalid' });
    });

    expect(result.current.errors.email).toBeDefined();
  });
});
```

### 4. ドメインロジックのカプセル化

```typescript
// ショッピングカートのロジック
function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return { items, addItem, removeItem, updateQuantity, total, itemCount };
}
```

## 抽出すべきでないケース

### 1. 単純すぎるロジック

```typescript
// ❌ 過度な抽象化
function useBoolean(initial) {
  return useState(initial);  // useStateをラップしただけ
}

// ✅ シンプルに使う
const [isEnabled, setIsEnabled] = useState(false);
```

### 2. 単一コンポーネント専用のUI状態

```typescript
// ❌ 不要な抽出
function useModalState() {
  const [isOpen, setIsOpen] = useState(false);
  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) };
}

// このコンポーネントでしか使わないなら、直接書く
function SettingsPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ...
}
```

### 3. UIと密結合したロジック

```typescript
// ❌ UIに依存したロジックは抽出しにくい
function useAnimatedList(items) {
  // DOM操作やCSS遷移と密結合
  // 抽出すると複雑になる
}
```

### 4. 抽出コストが利益を上回る場合

```typescript
// ❌ 一度しか使わない複雑なロジック
// 抽出の準備、テスト、ドキュメントのコストが利益を上回る
```

## 抽出の費用対効果

| 要素 | 利益 | コスト |
|------|------|--------|
| 再利用 | 重複削減 | 抽象化の複雑さ |
| テスト | 独立テスト可能 | テストコードの追加 |
| 可読性 | コンポーネントの簡素化 | 間接参照の増加 |
| 保守性 | 変更の局所化 | 認知負荷 |

## ベストプラクティス

1. **まずコンポーネント内で書く**: 早すぎる抽象化を避ける
2. **重複が発生してから抽出**: 実際のニーズに基づく
3. **明確な責務**: 一つのフックに一つの責務
4. **適切な名前**: 何をするフックかが名前でわかる
5. **ドキュメント**: 使い方と注意点を明記
