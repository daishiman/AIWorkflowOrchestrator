# Prop Drilling解決パターン

## 概要

Prop Drillingとは、データを必要とするコンポーネントに渡すために、
中間のコンポーネントを通じてpropsを「掘り下げる」ように渡すパターンです。
2-3階層までは許容されますが、それ以上は問題になります。

## Prop Drillingの問題

```typescript
// ❌ 典型的なProp Drilling（5階層）
function App() {
  const [user, setUser] = useState(currentUser);
  return <Layout user={user} />;
}

function Layout({ user }) {
  return <Sidebar user={user} />;
}

function Sidebar({ user }) {
  return <Navigation user={user} />;
}

function Navigation({ user }) {
  return <UserMenu user={user} />;
}

function UserMenu({ user }) {
  return <span>{user.name}</span>;  // ← 実際に使う場所
}
```

**問題点**:

- 中間コンポーネントがデータを使わないのに受け取る必要がある
- コンポーネントの結合度が高くなる
- 新しいpropsの追加が大変
- テストが複雑になる

## 解決パターン

### パターン1: コンポジション（Component Composition）

**適用条件**: 中間コンポーネントが単なるレイアウト役

```typescript
// ✅ コンポジションで解決
function App() {
  const [user, setUser] = useState(currentUser);

  return (
    <Layout>
      <Sidebar>
        <Navigation>
          <UserMenu user={user} />
        </Navigation>
      </Sidebar>
    </Layout>
  );
}

// 中間コンポーネントはchildrenを受け取るだけ
function Layout({ children }) {
  return <div className="layout">{children}</div>;
}

function Sidebar({ children }) {
  return <aside className="sidebar">{children}</aside>;
}

function Navigation({ children }) {
  return <nav className="nav">{children}</nav>;
}

function UserMenu({ user }) {
  return <span>{user.name}</span>;
}
```

### パターン2: Render Props

**適用条件**: 柔軟な描画制御が必要

```typescript
// データを持つコンポーネント
function UserDataProvider({ children }: { children: (user: User) => ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  if (!user) return <Loading />;
  return <>{children(user)}</>;
}

// 使用
function App() {
  return (
    <UserDataProvider>
      {(user) => (
        <Layout>
          <Header userName={user.name} />
          <Main userRole={user.role} />
        </Layout>
      )}
    </UserDataProvider>
  );
}
```

### パターン3: Context API

**適用条件**: 多くのコンポーネントでデータを共有

```typescript
// Context定義
const UserContext = createContext<User | null>(null);

function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser().then(setUser);
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

// 使用: 中間コンポーネントはuserを知らない
function App() {
  return (
    <UserProvider>
      <Layout />
    </UserProvider>
  );
}

function Layout() {
  return <Sidebar />;
}

function Sidebar() {
  return <Navigation />;
}

function Navigation() {
  return <UserMenu />;
}

function UserMenu() {
  const user = useUser();  // 必要な場所で直接アクセス
  return <span>{user?.name}</span>;
}
```

### パターン4: コンパウンドコンポーネント

**適用条件**: 関連するコンポーネント群を提供

```typescript
// コンパウンドコンポーネントパターン
const SelectContext = createContext<{
  value: string;
  onChange: (value: string) => void;
} | null>(null);

function Select({ value, onChange, children }: SelectProps) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

function Option({ value, children }: OptionProps) {
  const context = useContext(SelectContext);
  if (!context) throw new Error('Option must be used within Select');

  const isSelected = context.value === value;

  return (
    <div
      className={`option ${isSelected ? 'selected' : ''}`}
      onClick={() => context.onChange(value)}
    >
      {children}
    </div>
  );
}

// SelectにOptionを紐付け
Select.Option = Option;

// 使用
function App() {
  const [value, setValue] = useState('');

  return (
    <Select value={value} onChange={setValue}>
      <Select.Option value="a">Option A</Select.Option>
      <Select.Option value="b">Option B</Select.Option>
      <Select.Option value="c">Option C</Select.Option>
    </Select>
  );
}
```

### パターン5: カスタムフック + Context

**適用条件**: 複雑なロジックを持つ共有状態

```typescript
// フックでロジックをカプセル化
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (credentials: Credentials) => {
    const user = await authLogin(credentials);
    setUser(user);
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  return { user, isLoading, login, logout };
}

// Contextで共有
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```

## パターン選択ガイド

| パターン                 | 複雑性 | 適用ケース                         |
| ------------------------ | ------ | ---------------------------------- |
| コンポジション           | 低     | レイアウト構造、単純な入れ子       |
| Render Props             | 中     | 柔軟な描画制御、動的な子           |
| Context                  | 中     | グローバルデータ、深い階層         |
| コンパウンド             | 高     | UIライブラリ、関連コンポーネント群 |
| カスタムフック + Context | 高     | 複雑なロジック + 共有              |

## 判断フローチャート

```
Prop Drillingの階層は？
├── 2-3階層 → ✅ そのままでOK
│
├── 4階層以上 → 中間コンポーネントはデータを使う？
│   │
│   ├── いいえ（レイアウトのみ）→ ✅ コンポジション
│   │
│   └── はい → データは「グローバル」的？
│       │
│       ├── はい（認証、テーマ等）→ ✅ Context
│       │
│       └── いいえ → コンポーネント群として提供？
│           │
│           ├── はい → ✅ コンパウンドコンポーネント
│           │
│           └── いいえ → ✅ 状態の持ち上げ再検討
```

## ベストプラクティス

1. **まずコンポジションを検討**: 最もシンプルな解決策
2. **Contextは慎重に**: 過度な使用は避ける
3. **適切な粒度**: Contextは関連データごとに分割
4. **テスト可能性を考慮**: パターンがテストを複雑にしないか
5. **段階的に適用**: 必要になってから複雑なパターンを導入
