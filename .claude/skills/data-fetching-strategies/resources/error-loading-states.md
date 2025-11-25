# エラー・ローディング状態管理

## 概要

データフェッチにおいて、ローディング状態とエラー状態の適切な管理は
ユーザー体験に直結します。このドキュメントでは、各状態の管理パターンを解説します。

## 状態の種類

### 基本状態

```typescript
type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

interface FetchState<T> {
  status: FetchStatus;
  data: T | undefined;
  error: Error | null;
}
```

### SWRの状態

```typescript
const { data, error, isLoading, isValidating } = useSWR(key, fetcher);

// isLoading: 初回ロード中（dataがない状態）
// isValidating: 再検証中（dataがある状態でバックグラウンド更新中も含む）
```

### React Queryの状態

```typescript
const {
  data,
  error,
  isLoading,    // 初回ロード中
  isFetching,   // バックグラウンドフェッチ中
  isError,      // エラー状態
  isSuccess,    // 成功状態
  status,       // 'loading' | 'error' | 'success'
} = useQuery(options);
```

## ローディング状態パターン

### 1. 初回ローディング

データがない状態での最初のフェッチ

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return <Profile user={data} />;
}
```

### 2. バックグラウンド再検証

データがある状態でのバックグラウンド更新

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data, isFetching } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  return (
    <div>
      <Profile user={data} />
      {isFetching && <RefreshIndicator />}
    </div>
  );
}
```

### 3. スケルトンUI

```typescript
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-16 w-16 bg-gray-200 rounded-full" />
      <div className="h-4 w-32 bg-gray-200 mt-2" />
      <div className="h-4 w-48 bg-gray-200 mt-2" />
    </div>
  );
}

// 使用
if (isLoading) {
  return <ProfileSkeleton />;
}
```

### 4. プログレッシブローディング

```typescript
function DataTable() {
  const { data, isLoading, isFetching } = useQuery(/* ... */);

  return (
    <div className="relative">
      {/* メインコンテンツ */}
      <table>
        {data?.map(row => <Row key={row.id} data={row} />)}
      </table>

      {/* 初回ローディング */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <Spinner />
        </div>
      )}

      {/* バックグラウンド更新インジケータ */}
      {!isLoading && isFetching && (
        <div className="absolute top-0 right-0 p-2">
          <SmallSpinner />
        </div>
      )}
    </div>
  );
}
```

## エラー状態パターン

### 1. インラインエラー

```typescript
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, refetch } = useQuery(/* ... */);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-red-600 underline"
        >
          再試行
        </button>
      </div>
    );
  }

  return <Profile user={data} />;
}
```

### 2. トースト通知

```typescript
const { data } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  onError: (error) => {
    toast.error(`ユーザー情報の取得に失敗しました: ${error.message}`);
  },
});
```

### 3. フォールバックUI

```typescript
function DataDisplay({ data, error, fallbackData }) {
  if (error && !data) {
    // エラーでデータがない場合
    return <ErrorFallback error={error} />;
  }

  if (error && data) {
    // エラーだがキャッシュデータがある場合
    return (
      <>
        <DataView data={data} />
        <StaleDataWarning />
      </>
    );
  }

  return <DataView data={data} />;
}
```

### 4. リトライ戦略

```typescript
const { data, error, refetch, failureCount } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  retry: 3, // 最大3回リトライ
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

// エラー表示でリトライ回数も表示
if (error) {
  return (
    <div>
      <p>エラーが発生しました（{failureCount}回試行）</p>
      <button onClick={() => refetch()}>再試行</button>
    </div>
  );
}
```

## 空状態パターン

データが正常に取得されたが空の場合

```typescript
function TodoList() {
  const { data, isLoading, error } = useQuery(/* ... */);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <EmptyIcon />
        <p className="text-gray-500">タスクがありません</p>
        <button onClick={createTodo}>タスクを作成</button>
      </div>
    );
  }

  return <TodoItems todos={data} />;
}
```

## 複合パターン

### 状態の組み合わせ

```typescript
function DataContainer<T>({
  data,
  isLoading,
  isFetching,
  error,
  isEmpty,
  children,
}: {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isEmpty: (data: T) => boolean;
  children: (data: T) => React.ReactNode;
}) {
  // 初回ローディング
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // エラー状態
  if (error) {
    return <ErrorState error={error} />;
  }

  // データなし
  if (!data || isEmpty(data)) {
    return <EmptyState />;
  }

  // 正常状態 + バックグラウンド更新インジケータ
  return (
    <div className="relative">
      {children(data)}
      {isFetching && <RefreshIndicator />}
    </div>
  );
}

// 使用例
<DataContainer
  data={todos}
  isLoading={isLoading}
  isFetching={isFetching}
  error={error}
  isEmpty={(data) => data.length === 0}
>
  {(data) => <TodoList todos={data} />}
</DataContainer>
```

## グローバルエラーハンドリング

### QueryClientでの設定

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => {
        // グローバルエラーハンドリング
        if (error.response?.status === 401) {
          // 認証エラー
          router.push('/login');
        } else if (error.response?.status === 500) {
          // サーバーエラー
          toast.error('サーバーエラーが発生しました');
        }
      },
    },
  },
});
```

### SWRでの設定

```typescript
<SWRConfig
  value={{
    onError: (error, key) => {
      if (error.status === 401) {
        router.push('/login');
      }
    },
  }}
>
  <App />
</SWRConfig>
```

## ベストプラクティス

1. **ユーザーにフィードバック**: ローディング・エラーは必ず視覚的に表示
2. **リトライの提供**: エラー時は再試行オプションを提供
3. **スケルトンの活用**: コンテンツの形状を維持したローディング
4. **段階的開示**: バックグラウンド更新はさりげなく表示
5. **キャッシュの活用**: エラー時でも古いデータを表示できる場合は表示
