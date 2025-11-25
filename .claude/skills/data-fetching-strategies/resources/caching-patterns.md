# キャッシュパターン

## 概要

効果的なキャッシュ戦略は、パフォーマンスとユーザー体験の両方を向上させます。
このドキュメントでは、SWRとReact Queryにおける主要なキャッシュパターンを解説します。

## stale-while-revalidate戦略

### 基本概念

```
1. キャッシュがある場合、即座にキャッシュデータを返す（stale）
2. バックグラウンドでサーバーから最新データを取得（revalidate）
3. 新しいデータで画面を更新
```

### フロー図

```
ユーザー操作
    │
    ▼
キャッシュ確認
    │
    ├── キャッシュあり ──► 即座にデータ表示 ──► バックグラウンド再検証
    │                                              │
    │                                              ▼
    │                                        新データで更新
    │
    └── キャッシュなし ──► ローディング表示 ──► データ表示
```

### 実装例

```typescript
// SWR
const { data } = useSWR('/api/user', fetcher, {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
});

// React Query
const { data } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  staleTime: 1000 * 60 * 5, // 5分間はstaleにならない
});
```

## 再検証トリガー

### 1. フォーカス時再検証

ユーザーがタブを切り替えて戻った時に再検証

```typescript
// SWR
useSWR(key, fetcher, { revalidateOnFocus: true });

// React Query
useQuery({
  queryKey: [key],
  queryFn: fetcher,
  refetchOnWindowFocus: true,
});
```

### 2. ネットワーク復帰時再検証

オフラインからオンラインに復帰した時に再検証

```typescript
// SWR
useSWR(key, fetcher, { revalidateOnReconnect: true });

// React Query
useQuery({
  queryKey: [key],
  queryFn: fetcher,
  refetchOnReconnect: true,
});
```

### 3. 定期的なポーリング

一定間隔で自動的に再検証

```typescript
// SWR
useSWR(key, fetcher, { refreshInterval: 5000 }); // 5秒ごと

// React Query
useQuery({
  queryKey: [key],
  queryFn: fetcher,
  refetchInterval: 5000, // 5秒ごと
});
```

### 4. 手動再検証

プログラムから明示的に再検証

```typescript
// SWR
const { mutate } = useSWR(key, fetcher);
mutate(); // 再検証

// React Query
const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: [key] });
```

## キャッシュキー設計

### パターン1: 階層的キー

```typescript
// ユーザー一覧
['users']

// 特定のユーザー
['users', userId]

// ユーザーの投稿一覧
['users', userId, 'posts']

// 特定の投稿
['users', userId, 'posts', postId]
```

### パターン2: フィルター付きキー

```typescript
// フィルター条件をキーに含める
['todos', { status: 'completed' }]
['todos', { status: 'pending', page: 1 }]
```

### パターン3: 動的キー

```typescript
// クエリパラメータを含む
const { data } = useQuery({
  queryKey: ['search', { query: searchQuery, page }],
  queryFn: () => search(searchQuery, page),
  enabled: !!searchQuery, // 検索クエリがある時のみ実行
});
```

## キャッシュ無効化パターン

### パターン1: 関連データの無効化

```typescript
// React Query
const queryClient = useQueryClient();

// 特定のキーを無効化
queryClient.invalidateQueries({ queryKey: ['todos'] });

// 部分一致で無効化
queryClient.invalidateQueries({ queryKey: ['todos'] }); // ['todos', 1]も含む

// 完全一致で無効化
queryClient.invalidateQueries({ queryKey: ['todos'], exact: true });
```

### パターン2: ミューテーション後の無効化

```typescript
// React Query
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => {
    // 関連するクエリを無効化
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});

// SWR
const { mutate } = useSWRConfig();
await createTodo(newTodo);
mutate('/api/todos'); // キャッシュを無効化
```

### パターン3: 条件付き無効化

```typescript
queryClient.invalidateQueries({
  queryKey: ['todos'],
  predicate: (query) => {
    // 特定の条件のクエリのみ無効化
    return query.state.data?.length > 10;
  },
});
```

## キャッシュ設定ガイドライン

### データタイプ別の推奨設定

| データタイプ | staleTime | cacheTime | 再検証 |
|------------|-----------|-----------|--------|
| 静的データ（設定等） | 長い（30分+） | 長い | フォーカス時のみ |
| ユーザーデータ | 中（5分） | 中（15分） | フォーカス時 + 定期 |
| リアルタイムデータ | 短い（30秒） | 短い（1分） | 頻繁なポーリング |
| 検索結果 | 短い（1分） | 中（5分） | フォーカス時 |

### 設定例

```typescript
// 静的データ
useQuery({
  queryKey: ['config'],
  queryFn: fetchConfig,
  staleTime: 1000 * 60 * 30, // 30分
  cacheTime: 1000 * 60 * 60, // 1時間
  refetchOnWindowFocus: false,
});

// ユーザーデータ
useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 1000 * 60 * 5, // 5分
  cacheTime: 1000 * 60 * 15, // 15分
});

// リアルタイムデータ
useQuery({
  queryKey: ['notifications'],
  queryFn: fetchNotifications,
  staleTime: 1000 * 30, // 30秒
  refetchInterval: 1000 * 30, // 30秒ごとにポーリング
});
```

## ベストプラクティス

1. **キャッシュキーの一貫性**: プロジェクト全体で統一した命名規則
2. **適切なstaleTime**: データの性質に応じた設定
3. **無効化の粒度**: 必要最小限のデータのみ無効化
4. **デバッグ**: DevToolsでキャッシュ状態を確認
5. **テスト**: キャッシュ動作のテストを含める
