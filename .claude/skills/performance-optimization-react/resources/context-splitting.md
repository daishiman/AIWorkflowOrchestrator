# Context 分割戦略

## Context分割の必要性

Contextの値が変更されると、そのContextを使用するすべてのコンポーネントが再レンダリングされます。
複数の値を含むContextで一部の値のみが頻繁に更新される場合、不要な再レンダリングが大量に発生します。

## Context分割の判断基準

### 分割すべき場合

- [ ] Contextに3つ以上の値が含まれている
- [ ] 一部の値のみが頻繁に更新される（他は静的）
- [ ] Context使用コンポーネントが10個以上ある
- [ ] React DevTools Profilerで不要な再レンダリングを確認

### 分割を避けるべき場合

- [ ] すべての値が同時に更新される
- [ ] Context使用コンポーネントが少ない（5個以下）
- [ ] パフォーマンス問題が測定で確認されていない

## 分割パターン

### パターン1: 読み取り専用と書き込み可能の分離

**概念**: 静的な設定と動的な状態を分離

**例: テーマ設定**

```typescript
// 分割前（非効率）
interface AppContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: User;
  setUser: (user: User) => void;
}

const AppContext = createContext<AppContextValue>(null);

const Component = () => {
  const { theme } = useContext(AppContext);
  // userが更新されてもthemeしか使っていないのに再レンダリング
  return <div style={{ color: theme.primaryColor }}>Content</div>;
};
```

**分割後（効率的）**

```typescript
// 読み取り専用Context（静的）
const ThemeContext = createContext<Theme>(defaultTheme);

// 書き込み可能Context（動的）
const ThemeDispatchContext = createContext<(theme: Theme) => void>(() => {});

// Providerコンポーネント
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(defaultTheme);

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeDispatchContext.Provider value={setTheme}>
        {children}
      </ThemeDispatchContext.Provider>
    </ThemeContext.Provider>
  );
};

// カスタムフック
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

const useThemeDispatch = () => {
  const context = useContext(ThemeDispatchContext);
  if (context === undefined) {
    throw new Error('useThemeDispatch must be used within ThemeProvider');
  }
  return context;
};

// 使用例
const Component = () => {
  const theme = useTheme();
  // themeが更新された時のみ再レンダリング
  return <div style={{ color: theme.primaryColor }}>Content</div>;
};

const ThemeToggle = () => {
  const setTheme = useThemeDispatch();
  // setThemeは変わらないため再レンダリングされない
  return <button onClick={() => setTheme(newTheme)}>Toggle Theme</button>;
};
```

### パターン2: 更新頻度による分離

**概念**: 頻繁に更新される値と静的な値を分離

**例: ショッピングカート**

```typescript
// 分割前（非効率）
interface CartContextValue {
  items: CartItem[];
  config: CartConfig;  // 静的な設定
  discount: number;    // 頻繁に更新される
}

const CartContext = createContext<CartContextValue>(null);

const CartSummary = () => {
  const { config } = useContext(CartContext);
  // itemsやdiscountが更新されても再レンダリング
  return <div>Currency: {config.currency}</div>;
};
```

**分割後（効率的）**

```typescript
// 頻繁に更新される状態
const CartItemsContext = createContext<CartItem[]>([]);

// 動的な割引
const CartDiscountContext = createContext<number>(0);

// 静的な設定
const CartConfigContext = createContext<CartConfig>(defaultConfig);

// Providerコンポーネント
const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [config] = useState(defaultConfig); // 静的

  return (
    <CartConfigContext.Provider value={config}>
      <CartItemsContext.Provider value={items}>
        <CartDiscountContext.Provider value={discount}>
          {children}
        </CartDiscountContext.Provider>
      </CartItemsContext.Provider>
    </CartConfigContext.Provider>
  );
};

// カスタムフック
const useCartConfig = () => useContext(CartConfigContext);
const useCartItems = () => useContext(CartItemsContext);
const useCartDiscount = () => useContext(CartDiscountContext);

// 使用例
const CartSummary = () => {
  const config = useCartConfig();
  // configは静的なため再レンダリングされない
  return <div>Currency: {config.currency}</div>;
};

const CartItemList = () => {
  const items = useCartItems();
  // itemsが更新された時のみ再レンダリング
  return <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
};
```

### パターン3: ドメインによる分離

**概念**: 異なるドメインの状態を別Contextに分離

**例: アプリケーション状態**

```typescript
// 分割前（非効率）
interface AppContextValue {
  user: User;
  auth: Auth;
  settings: Settings;
  notifications: Notification[];
}

const AppContext = createContext<AppContextValue>(null);

const UserProfile = () => {
  const { user } = useContext(AppContext);
  // auth、settings、notificationsが更新されても再レンダリング
  return <div>{user.name}</div>;
};
```

**分割後（効率的）**

```typescript
// ユーザー認証
const AuthContext = createContext<Auth>(null);

// ユーザー情報
const UserContext = createContext<User>(null);

// アプリケーション設定
const SettingsContext = createContext<Settings>(defaultSettings);

// 通知
const NotificationsContext = createContext<Notification[]>([]);

// Providerコンポーネント
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<Auth>(null);
  const [user, setUser] = useState<User>(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  return (
    <AuthContext.Provider value={auth}>
      <UserContext.Provider value={user}>
        <SettingsContext.Provider value={settings}>
          <NotificationsContext.Provider value={notifications}>
            {children}
          </NotificationsContext.Provider>
        </SettingsContext.Provider>
      </UserContext.Provider>
    </AuthContext.Provider>
  );
};

// カスタムフック
const useAuth = () => useContext(AuthContext);
const useUser = () => useContext(UserContext);
const useSettings = () => useContext(SettingsContext);
const useNotifications = () => useContext(NotificationsContext);

// 使用例
const UserProfile = () => {
  const user = useUser();
  // userが更新された時のみ再レンダリング
  return <div>{user.name}</div>;
};

const NotificationBadge = () => {
  const notifications = useNotifications();
  // notificationsが更新された時のみ再レンダリング
  return <span>{notifications.length}</span>;
};
```

## Context分割の実装手順

### ステップ1: 現在のContextを分析

1. **値の更新頻度を確認**
   - 頻繁に更新される値（動的）
   - めったに更新されない値（静的）

2. **使用箇所を確認**
   - どのコンポーネントがどの値を使用しているか
   - 不要な再レンダリングが発生している箇所

3. **ドメインを分析**
   - 認証、ユーザー情報、設定など
   - 各ドメインの関連性

### ステップ2: 分割戦略を決定

1. **分割パターンの選択**
   - 読み取り専用と書き込み可能の分離
   - 更新頻度による分離
   - ドメインによる分離

2. **分割粒度の決定**
   - 過度な分割を避ける（Providerネストが深くなりすぎる）
   - 適切なバランスを保つ

### ステップ3: 実装

1. **新しいContextを作成**

   ```typescript
   const Context1 = createContext<Type1>(defaultValue1);
   const Context2 = createContext<Type2>(defaultValue2);
   ```

2. **Providerコンポーネントを実装**

   ```typescript
   const CombinedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
     return (
       <Context1.Provider value={value1}>
         <Context2.Provider value={value2}>
           {children}
         </Context2.Provider>
       </Context1.Provider>
     );
   };
   ```

3. **カスタムフックを実装**
   ```typescript
   const useContext1 = () => {
     const context = useContext(Context1);
     if (context === undefined) {
       throw new Error("useContext1 must be used within Provider");
     }
     return context;
   };
   ```

### ステップ4: 効果を測定

1. **React DevTools Profilerで測定**
   - 分割前の測定
   - 分割後の測定

2. **再レンダリング回数の比較**
   - 不要な再レンダリングが減少したか

3. **レンダリング時間の比較**
   - パフォーマンスが改善したか

## 実践例

### 例1: 認証とユーザー情報の分離

**分割前**:

```typescript
const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: Credentials) => void;
  logout: () => void;
}>(null);

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  // login/logoutが更新されても再レンダリング
  return <div>{user?.name}</div>;
};
```

**分割後**:

```typescript
// 認証状態（動的）
const AuthContext = createContext<{
  isAuthenticated: boolean;
}>(null);

// ユーザー情報（動的）
const UserContext = createContext<User | null>(null);

// 認証アクション（静的）
const AuthActionsContext = createContext<{
  login: (credentials: Credentials) => void;
  logout: () => void;
}>(null);

const UserProfile = () => {
  const user = useContext(UserContext);
  // userが更新された時のみ再レンダリング
  return <div>{user?.name}</div>;
};

const LoginButton = () => {
  const { login } = useContext(AuthActionsContext);
  // login関数は変わらないため再レンダリングされない
  return <button onClick={() => login(credentials)}>Login</button>;
};
```

### 例2: フォーム状態の分離

**分割前**:

```typescript
const FormContext = createContext<{
  values: FormValues;
  errors: FormErrors;
  touched: FormTouched;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
}>(null);

const FieldComponent = ({ name }) => {
  const { values, setFieldValue } = useContext(FormContext);
  // errors、touchedが更新されても再レンダリング
  return <input value={values[name]} onChange={e => setFieldValue(name, e.target.value)} />;
};
```

**分割後**:

```typescript
// フォーム値（動的）
const FormValuesContext = createContext<FormValues>({});

// エラー（動的）
const FormErrorsContext = createContext<FormErrors>({});

// タッチ状態（動的）
const FormTouchedContext = createContext<FormTouched>({});

// フォームアクション（静的）
const FormActionsContext = createContext<{
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  setFieldTouched: (field: string, touched: boolean) => void;
}>(null);

const FieldComponent = ({ name }) => {
  const values = useContext(FormValuesContext);
  const { setFieldValue } = useContext(FormActionsContext);
  // valuesが更新された時のみ再レンダリング
  return <input value={values[name]} onChange={e => setFieldValue(name, e.target.value)} />;
};

const FieldError = ({ name }) => {
  const errors = useContext(FormErrorsContext);
  // errorsが更新された時のみ再レンダリング
  return <span>{errors[name]}</span>;
};
```

## トラブルシューティング

### 問題1: Providerネストが深すぎる

**症状**: Providerのネストが5階層以上になる

**解決策**: 複合Providerを作成

```typescript
const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <SettingsProvider>
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </SettingsProvider>
      </UserProvider>
    </AuthProvider>
  );
};
```

### 問題2: Context分割後も再レンダリングされる

**症状**: Context分割したがパフォーマンス改善がない

**原因と解決策**:

1. **Providerの値が毎回新しいオブジェクト**

   ```typescript
   // 悪い例
   <Context.Provider value={{ data, setData }}>

   // 良い例
   const value = useMemo(() => ({ data, setData }), [data, setData]);
   <Context.Provider value={value}>
   ```

2. **分割粒度が適切でない**
   - さらに細かく分割
   - または統合を検討

### 問題3: カスタムフックが複雑になる

**症状**: 各Contextごとにカスタムフックを作成すると管理が煩雑

**解決策**: 統合カスタムフックを作成

```typescript
const useForm = () => {
  const values = useContext(FormValuesContext);
  const errors = useContext(FormErrorsContext);
  const touched = useContext(FormTouchedContext);
  const actions = useContext(FormActionsContext);

  return {
    values,
    errors,
    touched,
    ...actions,
  };
};

// 使用例
const Component = () => {
  const { values, errors, setFieldValue } = useForm();
  // 必要な値のみ使用
};
```

## ベストプラクティス

### 分割の原則

1. **測定駆動**: 測定でパフォーマンス問題を確認してから分割
2. **適切な粒度**: 過度な分割を避ける
3. **明確な責務**: 各Contextの責務を明確に
4. **カスタムフック**: Context使用を簡易化

### 命名規則

- **Context名**: `[ドメイン]Context`（例: UserContext、AuthContext）
- **Provider名**: `[ドメイン]Provider`（例: UserProvider、AuthProvider）
- **カスタムフック名**: `use[ドメイン]`（例: useUser、useAuth）

### ドキュメンテーション

各Contextの以下を文書化:

- 目的と責務
- 含まれる値
- 更新頻度
- 使用例

## チェックリスト

- [ ] Context分割の必要性を測定で確認済み
- [ ] 分割パターンを選択済み（読み取り/書き込み、更新頻度、ドメイン）
- [ ] Providerコンポーネントを実装済み
- [ ] カスタムフックを実装済み
- [ ] 分割後のパフォーマンスを測定済み
- [ ] 再レンダリング回数が削減されたことを確認済み
- [ ] ドキュメンテーション完了
- [ ] コードレビュー完了
