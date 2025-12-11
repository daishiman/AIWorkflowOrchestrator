# カスタムフック合成パターン

## 概要

複数のフックを組み合わせて、より高度な機能を持つフックを作成するパターンです。
小さなフックを合成することで、再利用性とテスト容易性を維持しながら
複雑な機能を実現します。

## 合成の原則

### 原則1: 単一責務の維持

各フックは一つの責務に集中し、合成で機能を拡張する。

```typescript
// 各フックは単一責務
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue] as const;
}

function useLocalStorage<T>(key: string, initialValue: T) {
  // LocalStorage固有のロジック
}

function useMediaQuery(query: string) {
  // メディアクエリ固有のロジック
}

// 合成: ダークモードフック
function useDarkMode() {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [isDark, setIsDark] = useLocalStorage("dark-mode", prefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return [isDark, setIsDark] as const;
}
```

### 原則2: 層の分離

下位フック → 中位フック → 上位フックと階層化する。

```typescript
// 下位: 基本フック
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setData(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, isLoading, error };
}

// 中位: 認証付きフェッチ
function useAuthFetch<T>(url: string) {
  const { token } = useAuth();
  const fullUrl = token ? `${url}?token=${token}` : url;
  return useFetch<T>(fullUrl);
}

// 上位: ドメイン固有フック
function useUserProfile() {
  const { userId } = useAuth();
  return useAuthFetch<UserProfile>(`/api/users/${userId}`);
}
```

### 原則3: 依存関係の明示

フック間の依存関係を明確にし、循環を避ける。

```typescript
// ✅ 良い例: 明確な依存関係
function useUserData(userId: string) {
  // useAuthに依存
  const { token } = useAuth();

  // useFetchに依存
  const { data, isLoading, error } = useFetch<User>(`/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return { user: data, isLoading, error };
}
```

## 合成パターン

### パターン1: パイプライン合成

データが順次変換されるパターン。

```typescript
// 各ステップを担当するフック
function useSearchInput() {
  const [query, setQuery] = useState("");
  return { query, setQuery };
}

function useDebounce<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useSearchResults(query: string) {
  return useFetch<SearchResult[]>(
    query ? `/api/search?q=${encodeURIComponent(query)}` : null,
  );
}

// パイプライン合成
function useSearch() {
  // Step 1: 入力
  const { query, setQuery } = useSearchInput();

  // Step 2: デバウンス
  const debouncedQuery = useDebounce(query, 300);

  // Step 3: 検索実行
  const { data, isLoading, error } = useSearchResults(debouncedQuery);

  return {
    query,
    setQuery,
    results: data ?? [],
    isLoading,
    error,
  };
}
```

### パターン2: 機能拡張合成

基本フックに機能を追加するパターン。

```typescript
// 基本フック
function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!!url);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!url) return;
    setIsLoading(true);
    try {
      const res = await fetch(url);
      setData(await res.json());
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// 機能拡張: キャッシュ付き
function useCachedFetch<T>(url: string | null, cacheKey?: string) {
  const [cache, setCache] = useLocalStorage<Record<string, T>>(
    "fetch-cache",
    {},
  );
  const key = cacheKey ?? url ?? "";

  const { data, isLoading, error, refetch } = useFetch<T>(
    cache[key] ? null : url, // キャッシュがあればフェッチしない
  );

  // キャッシュからのデータまたはフェッチしたデータ
  const cachedData = cache[key] ?? data;

  // 新しいデータをキャッシュ
  useEffect(() => {
    if (data && key) {
      setCache((prev) => ({ ...prev, [key]: data }));
    }
  }, [data, key, setCache]);

  const invalidateCache = useCallback(() => {
    setCache((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    refetch();
  }, [key, refetch, setCache]);

  return {
    data: cachedData,
    isLoading: !cachedData && isLoading,
    error,
    refetch: invalidateCache,
  };
}

// 機能拡張: ポーリング付き
function usePollingFetch<T>(url: string, interval: number) {
  const result = useFetch<T>(url);

  useInterval(() => {
    result.refetch();
  }, interval);

  return result;
}
```

### パターン3: 状態同期合成

複数の状態を同期するパターン。

```typescript
// URLとステートを同期
function useQueryParams<T extends Record<string, string>>() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj as T;
  }, [searchParams]);

  const setParams = useCallback(
    (newParams: Partial<T>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([key, value]) => {
          if (value === undefined || value === "") {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        });
        return next;
      });
    },
    [setSearchParams],
  );

  return [params, setParams] as const;
}

// フィルター + URL同期
function useFilteredList<T>(
  items: T[],
  filterFn: (item: T, filters: Record<string, string>) => boolean,
) {
  const [filters, setFilters] = useQueryParams();

  const filteredItems = useMemo(
    () => items.filter((item) => filterFn(item, filters)),
    [items, filters, filterFn],
  );

  return { filteredItems, filters, setFilters };
}
```

### パターン4: コンテキスト合成

複数のContextを統合するパターン。

```typescript
// 個別フック
function useAuth() {
  return useContext(AuthContext);
}

function useTheme() {
  return useContext(ThemeContext);
}

function useNotifications() {
  return useContext(NotificationContext);
}

// 統合フック
function useApp() {
  const auth = useAuth();
  const theme = useTheme();
  const notifications = useNotifications();

  // 統合された便利メソッド
  const logout = useCallback(async () => {
    await auth.logout();
    notifications.show({ type: "info", message: "ログアウトしました" });
  }, [auth, notifications]);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    theme: theme.current,
    toggleTheme: theme.toggle,
    notify: notifications.show,
    logout,
  };
}
```

## 合成時の注意点

### 1. 過度なネストを避ける

```typescript
// ❌ 深すぎるネスト
function useDeepComposition() {
  const a = useA();
  const b = useB(a);
  const c = useC(b);
  const d = useD(c);
  const e = useE(d);
  // 追跡が困難
}

// ✅ フラットな構造
function useFlatComposition() {
  const a = useA();
  const b = useB();
  const c = useCombined(a, b);
  return { ...a, ...b, ...c };
}
```

### 2. 循環依存を避ける

```typescript
// ❌ 循環依存
function useA() {
  const b = useB(); // useB内でuseAを使用
}

// ✅ 共通の下位フックに抽出
function useShared() {
  /* 共通ロジック */
}
function useA() {
  const shared = useShared();
}
function useB() {
  const shared = useShared();
}
```

### 3. 再レンダリングの最適化

```typescript
// 戻り値をメモ化
function useOptimizedComposition() {
  const a = useA();
  const b = useB();

  // 必要な値だけを返す
  return useMemo(
    () => ({
      valueA: a.value,
      valueB: b.value,
      combined: a.value + b.value,
    }),
    [a.value, b.value],
  );
}
```

## ベストプラクティス

1. **小さなフックから始める**: まず単一責務のフックを作成
2. **テストしやすく**: 各フックを独立してテスト可能に
3. **ドキュメント**: 依存関係と使用方法を明記
4. **型安全**: TypeScriptで型を明確に
5. **命名規則**: 合成フックには機能を表す名前を
