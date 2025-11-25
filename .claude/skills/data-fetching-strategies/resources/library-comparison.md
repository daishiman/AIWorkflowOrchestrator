# ライブラリ比較: SWR vs React Query

## 概要

SWRとReact Queryは、Reactにおけるサーバー状態管理の代表的なライブラリです。
どちらも優れたソリューションですが、特性が異なります。

## 比較表

### 基本情報

| 項目 | SWR | React Query (TanStack Query) |
|------|-----|------------------------------|
| 開発元 | Vercel | TanStack |
| バンドルサイズ | ~4KB (gzip) | ~13KB (gzip) |
| 最終更新 | 活発 | 活発 |
| TypeScript | フルサポート | フルサポート |

### 機能比較

| 機能 | SWR | React Query |
|------|-----|-------------|
| 基本的なフェッチ | ✅ | ✅ |
| キャッシュ | ✅ | ✅（より細かい制御） |
| 自動再検証 | ✅ | ✅ |
| ミューテーション | ✅（シンプル） | ✅（強力） |
| 楽観的更新 | ✅ | ✅（より簡単） |
| 無限スクロール | ✅ | ✅ |
| プリフェッチ | ✅ | ✅ |
| DevTools | 基本的 | 高機能 |
| オフラインサポート | 基本的 | 高度 |
| クエリ無効化 | シンプル | 詳細な制御 |
| Suspense対応 | ✅ | ✅ |

## SWR

### 特徴

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function Profile() {
  const { data, error, isLoading, mutate } = useSWR('/api/user', fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return <div>Hello {data.name}!</div>;
}
```

### 強み

1. **シンプルなAPI**: 学習曲線が緩やか
2. **小さなバンドル**: パフォーマンスに優しい
3. **Vercel統合**: Next.jsとの相性が良い
4. **stale-while-revalidate**: 名前の通りのキャッシュ戦略

### 適したケース

- シンプルなデータフェッチ
- Next.jsプロジェクト
- バンドルサイズを小さくしたい
- 学習コストを抑えたい

### 設定例

```typescript
import { SWRConfig } from 'swr';

function App() {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: (url) => fetch(url).then(res => res.json()),
        onError: (error) => console.error(error),
      }}
    >
      <Dashboard />
    </SWRConfig>
  );
}
```

## React Query

### 特徴

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function Todos() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetchTodos(),
  });

  const mutation = useMutation({
    mutationFn: (newTodo) => postTodo(newTodo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  // ...
}
```

### 強み

1. **強力なキャッシュ制御**: 細かいキャッシュ管理が可能
2. **高機能DevTools**: デバッグが容易
3. **強力なミューテーション**: 楽観的更新が簡単
4. **詳細なクエリ状態**: より多くの状態情報

### 適したケース

- 複雑なサーバー状態管理
- 複数のミューテーションが必要
- 詳細なキャッシュ制御が必要
- デバッグを重視

### 設定例

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      cacheTime: 1000 * 60 * 30, // 30分
      refetchOnWindowFocus: true,
      retry: 3,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## 選択ガイド

### SWRを選ぶ場合

```
✅ シンプルなデータフェッチがメイン
✅ Next.jsを使用している
✅ バンドルサイズを最小化したい
✅ 学習コストを抑えたい
✅ 基本的なキャッシュで十分
```

### React Queryを選ぶ場合

```
✅ 複雑なサーバー状態管理が必要
✅ 多数のミューテーションがある
✅ 詳細なキャッシュ制御が必要
✅ 高機能なDevToolsが欲しい
✅ オフライン対応を重視
```

## 移行ガイド

### SWRからReact Queryへ

```typescript
// SWR
const { data, error } = useSWR('/api/user', fetcher);

// React Query
const { data, error } = useQuery({
  queryKey: ['user'],
  queryFn: () => fetch('/api/user').then(res => res.json()),
});
```

### React QueryからSWRへ

```typescript
// React Query
const { data, isLoading } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
});

// SWR
const { data, isLoading } = useSWR('user', fetchUser);
```

## ベストプラクティス

### 共通のベストプラクティス

1. **エラーハンドリング**: グローバルとローカルの両方で処理
2. **ローディング状態**: スケルトンUIの活用
3. **キャッシュキー**: 一貫した命名規則
4. **再検証**: 適切なタイミングの設定

### SWR固有

- グローバル設定は`SWRConfig`で
- ミューテーション後は`mutate()`で再検証
- `useSWRImmutable`で不変データを扱う

### React Query固有

- `queryKey`は配列で階層的に
- ミューテーション後は`invalidateQueries`
- `useQueryClient`でキャッシュ操作
