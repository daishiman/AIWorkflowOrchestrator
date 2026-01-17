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

## 実装事例（2026-01-06追加）

### EditorView検索機能統合パターン

search-replace-ui-implementationで、検索パネルとエディタ間のデータ共有設計を行った事例。

#### 背景と課題

EditorViewから検索パネル（SearchPanel、WorkspaceSearchPanel）へ以下のデータを渡す必要があった：

- エディタインスタンス参照（検索結果のハイライト、置換操作に必要）
- ワークスペース検索プロバイダー（IPC経由の検索実行に必要）
- 検索状態（検索モード、置換モード表示フラグ）

#### 検討したパターン

**パターン1: Props経由の直接渡し**

- EditorView → SearchPanel にpropsで直接渡す
- シンプルで追跡しやすい
- 階層が深くなるとProp Drilling問題が発生

**パターン2: Context API**

- SearchContextを作成し、どの階層からもアクセス可能に
- 深い階層での利用に適する
- 過度に使うと依存関係が不明瞭に

**パターン3: カスタムフック + Props組み合わせ**

- フックでロジックをカプセル化し、結果のみをpropsで渡す
- ロジックとデータの分離が明確
- テスト時にフックのモック差し替えが容易

#### 採用した設計

パターン3（カスタムフック + Props組み合わせ）を採用した。

**理由**:

- 検索パネルはEditorViewの直接の子コンポーネントであり、階層は2層のみ
- Contextを導入するほどの深さではなく、過剰な抽象化を避けた
- フックでIPC通信やエディタ操作のロジックをカプセル化することで、EditorView自体はシンプルに保てる

**具体的な実装方針**:

1. useWorkspaceSearchフックがIPC通信の詳細を隠蔽
   - EditorViewはフックを呼び出すだけで検索プロバイダーを取得
   - 検索プロバイダーはAsyncGeneratorを返し、ストリーミング検索が可能

2. useEditorInstanceフックがエディタ操作を抽象化
   - EditorViewはフックからeditorInstanceRefを取得
   - 検索パネルはこの参照を通じて置換操作やスクロールを実行

3. 検索状態はEditorViewのローカルステートで管理
   - isSearchPanelOpen、searchMode、showReplaceをuseStateで保持
   - 検索パネルの表示制御に使用

#### 判断基準

- **階層が2-3層**: Props経由で十分、Contextは過剰
- **階層が4層以上**: Context導入を検討
- **複数の無関係なコンポーネントで同じデータを使用**: Context推奨
- **ロジックが複雑**: フックでカプセル化してからProps/Contextで共有

#### 将来の拡張性

検索パネルが他のビュー（例: SettingsView）でも使われるようになった場合は、SearchContextを導入してグローバルな検索状態管理に移行することを検討する。現時点では過剰な抽象化を避け、シンプルな設計を維持している。
