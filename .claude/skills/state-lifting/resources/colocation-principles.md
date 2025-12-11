# コロケーション原則

## 概要

コロケーション（Colocation）とは、関連するコードを物理的に近い場所に配置する原則です。
状態管理において、これは「状態を使用する場所の近くに配置する」ことを意味します。

## 核心原則

> "Place code as close to where it's relevant as possible"
> — Kent C. Dodds

### なぜコロケーションが重要か

1. **認知負荷の軽減**: 関連コードが近くにあると理解しやすい
2. **保守性の向上**: 変更が必要な箇所が限定される
3. **パフォーマンスの向上**: 不要な再レンダリングを防ぐ
4. **テスト容易性**: コンポーネントの独立性が高まる

## 状態コロケーションの原則

### 原則1: 最小スコープ

状態は、それを必要とする最小のスコープに配置する。

```typescript
// ❌ 悪い例: 不必要に高いスコープ
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Layout>
      <Header />
      <Main />
      <Footer>
        <ContactButton onModalOpen={() => setIsModalOpen(true)} />
        {isModalOpen && <ContactModal onClose={() => setIsModalOpen(false)} />}
      </Footer>
    </Layout>
  );
}

// ✅ 良い例: 必要な場所に配置
function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <footer>
      <ContactButton onClick={() => setIsModalOpen(true)} />
      {isModalOpen && <ContactModal onClose={() => setIsModalOpen(false)} />}
    </footer>
  );
}
```

### 原則2: 使用場所との近接性

状態と、それを使用するロジックは近くに配置する。

```typescript
// ❌ 悪い例: 状態とロジックが離れている
// store/todoStore.ts
export const useTodoStore = create((set) => ({
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}));

// components/Header.tsx (離れた場所)
function Header() {
  const { filter, setFilter } = useTodoStore();
  return <FilterButtons filter={filter} onChange={setFilter} />;
}

// ✅ 良い例: 状態とロジックが近い
function TodoList() {
  const [filter, setFilter] = useState('all');
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filter === 'all') return true;
      if (filter === 'completed') return todo.completed;
      return !todo.completed;
    });
  }, [todos, filter]);

  return (
    <>
      <FilterButtons filter={filter} onChange={setFilter} />
      <List items={filteredTodos} />
    </>
  );
}
```

### 原則3: 依存関係の局所化

状態の依存関係を局所化し、波及効果を最小限に。

```typescript
// ❌ 悪い例: グローバルな依存
function useGlobalForm() {
  const dispatch = useAppDispatch();
  const formState = useAppSelector(state => state.form);

  const handleSubmit = () => {
    dispatch(submitForm(formState));
  };

  return { formState, handleSubmit };
}

// ✅ 良い例: ローカルな依存
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitContactForm(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      />
      {/* ... */}
    </form>
  );
}
```

## 状態の移動パターン

### パターン1: 持ち上げ（Lifting Up）

共有が必要になったら持ち上げる。

```typescript
// Before: ローカル状態
function SearchInput() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

function SearchResults() {
  // queryにアクセスできない
  return <div>結果をここに表示</div>;
}

// After: 共通の親に持ち上げ
function SearchPage() {
  const [query, setQuery] = useState('');

  return (
    <>
      <SearchInput query={query} onQueryChange={setQuery} />
      <SearchResults query={query} />
    </>
  );
}
```

### パターン2: 押し下げ（Pushing Down）

共有が不要になったら押し下げる。

```typescript
// Before: 親で管理（過度）
function ProductPage() {
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');

  return (
    <>
      <ProductHeader sortOrder={sortOrder} onSortChange={setSortOrder} />
      <ProductList viewMode={viewMode} onViewModeChange={setViewMode} />
    </>
  );
}

// After: 各コンポーネントで管理
function ProductPage() {
  return (
    <>
      <ProductHeader />  {/* 内部でsortOrderを管理 */}
      <ProductList />    {/* 内部でviewModeを管理 */}
    </>
  );
}
```

### パターン3: 抽出（Extracting）

ロジックが複雑になったらカスタムフックに抽出。

```typescript
// Before: コンポーネント内にロジック
function UserProfile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchUser()
      .then(setUser)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  // ...
}

// After: カスタムフックに抽出（コロケーションを維持）
function useUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    fetchUser()
      .then(setUser)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return { user, isLoading, error };
}

function UserProfile() {
  const { user, isLoading, error } = useUser();
  // ...
}
```

## コロケーション vs グローバル状態

| 観点           | コロケーション   | グローバル状態 |
| -------------- | ---------------- | -------------- |
| スコープ       | 最小限           | アプリ全体     |
| 再レンダリング | 局所的           | 広範囲         |
| テスト         | 容易             | 複雑           |
| デバッグ       | 容易             | DevTools必要   |
| 適用ケース     | UI状態、フォーム | 認証、テーマ   |

## ベストプラクティス

1. **デフォルトはローカル**: まずローカル状態で始める
2. **必要に応じて持ち上げ**: 共有が必要になった時点で持ち上げる
3. **過度な持ち上げを避ける**: 必要最小限の高さに留める
4. **定期的なリファクタリング**: 不要になった持ち上げを押し下げる
5. **カスタムフックで整理**: 複雑なロジックは抽出しつつコロケーションを維持
