# React Queryフックテンプレート

## 基本データフェッチフック

```typescript
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

// フェッチャー関数
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
}

// 基本的なデータフェッチフック
export function useData<T>(key: string, enabled = true) {
  return useQuery<T>({
    queryKey: [key],
    queryFn: () => fetcher<T>(key),
    enabled,
    staleTime: 1000 * 60 * 5, // 5分
  });
}
```

## ユーザーデータフック

```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export function useUser(userId: string | null) {
  return useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => fetcher<User>(`/api/users/${userId}`),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5分間はstaleにならない
    gcTime: 1000 * 60 * 30, // 30分間キャッシュ保持
  });
}

// 複数ユーザーの取得
export function useUsers(userIds: string[]) {
  return useQuery<User[]>({
    queryKey: ['users', userIds],
    queryFn: async () => {
      const promises = userIds.map((id) => fetcher<User>(`/api/users/${id}`));
      return Promise.all(promises);
    },
    enabled: userIds.length > 0,
  });
}
```

## リスト取得フック（ページネーション付き）

```typescript
import { useQuery, keepPreviousData } from '@tanstack/react-query';

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface UsePaginatedListOptions {
  page: number;
  pageSize?: number;
  enabled?: boolean;
}

export function usePaginatedList<T>(
  endpoint: string,
  options: UsePaginatedListOptions
) {
  const { page, pageSize = 10, enabled = true } = options;

  return useQuery<PaginatedResponse<T>>({
    queryKey: [endpoint, { page, pageSize }],
    queryFn: () =>
      fetcher<PaginatedResponse<T>>(
        `${endpoint}?page=${page}&pageSize=${pageSize}`
      ),
    enabled,
    placeholderData: keepPreviousData, // ページ切り替え時にデータを保持
    staleTime: 1000 * 30, // 30秒
  });
}
```

## 無限スクロールフック

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

interface InfiniteResponse<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
}

export function useInfiniteList<T>(endpoint: string) {
  const query = useInfiniteQuery<InfiniteResponse<T>>({
    queryKey: [endpoint, 'infinite'],
    queryFn: ({ pageParam }) =>
      fetcher<InfiniteResponse<T>>(
        pageParam ? `${endpoint}?cursor=${pageParam}` : endpoint
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage) => firstPage.prevCursor,
  });

  const items = query.data?.pages.flatMap((page) => page.data) ?? [];

  return {
    ...query,
    items,
    isEmpty: query.data?.pages[0]?.data.length === 0,
  };
}
```

## 基本ミューテーションフック

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// 更新ミューテーション
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todo: Partial<Todo> & { id: string }) => {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json() as Promise<Todo>;
    },
    onSuccess: (data) => {
      // 特定のtodoを更新
      queryClient.setQueryData(['todo', data.id], data);
      // リストを無効化
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

## 楽観的更新付きミューテーション

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export function useOptimisticUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTodo: Todo) => {
      const res = await fetch(`/api/todos/${newTodo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json() as Promise<Todo>;
    },

    // 楽観的更新
    onMutate: async (newTodo) => {
      // 進行中のクエリをキャンセル
      await queryClient.cancelQueries({ queryKey: ['todos'] });

      // 現在の状態をスナップショット
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      // 楽観的に更新
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map((todo) => (todo.id === newTodo.id ? newTodo : todo))
      );

      // ロールバック用にコンテキストを返す
      return { previousTodos };
    },

    // エラー時のロールバック
    onError: (err, newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },

    // 成功・失敗にかかわらず再検証
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

## 作成ミューテーション（楽観的更新付き）

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateTodoInput {
  title: string;
}

export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTodoInput) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to create');
      return res.json() as Promise<Todo>;
    },

    onMutate: async (newTodoInput) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      // 仮のIDで楽観的に追加
      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`,
        title: newTodoInput.title,
        completed: false,
      };

      queryClient.setQueryData<Todo[]>(['todos'], (old) => [
        ...(old ?? []),
        optimisticTodo,
      ]);

      return { previousTodos, optimisticTodo };
    },

    onSuccess: (data, variables, context) => {
      // サーバーからの正式なデータで仮データを置き換え
      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.map((todo) =>
          todo.id === context?.optimisticTodo.id ? data : todo
        )
      );
    },

    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },
  });
}
```

## 削除ミューテーション

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: string) => {
      const res = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
    },

    onMutate: async (todoId) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos']);

      queryClient.setQueryData<Todo[]>(['todos'], (old) =>
        old?.filter((todo) => todo.id !== todoId)
      );

      return { previousTodos };
    },

    onError: (err, todoId, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

## 依存クエリフック

```typescript
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
}

interface Post {
  id: string;
  userId: string;
  title: string;
}

// ユーザーを取得してから、そのユーザーの投稿を取得
export function useUserPosts(userId: string | null) {
  // 1. ユーザー取得
  const userQuery = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: () => fetcher<User>(`/api/users/${userId}`),
    enabled: !!userId,
  });

  // 2. ユーザーの投稿取得（ユーザーが取得できてから）
  const postsQuery = useQuery<Post[]>({
    queryKey: ['posts', { userId: userQuery.data?.id }],
    queryFn: () =>
      fetcher<Post[]>(`/api/users/${userQuery.data!.id}/posts`),
    enabled: !!userQuery.data?.id,
  });

  return {
    user: userQuery.data,
    posts: postsQuery.data,
    isLoading: userQuery.isLoading || postsQuery.isLoading,
    error: userQuery.error || postsQuery.error,
  };
}
```

## プリフェッチフック

```typescript
import { useQueryClient } from '@tanstack/react-query';

export function usePrefetchUser() {
  const queryClient = useQueryClient();

  const prefetchUser = async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => fetcher<User>(`/api/users/${userId}`),
      staleTime: 1000 * 60 * 5, // 5分
    });
  };

  return { prefetchUser };
}

// 使用例: ホバー時にプリフェッチ
function UserLink({ userId, name }: { userId: string; name: string }) {
  const { prefetchUser } = usePrefetchUser();

  return (
    <Link
      to={`/users/${userId}`}
      onMouseEnter={() => prefetchUser(userId)}
    >
      {name}
    </Link>
  );
}
```

## グローバル設定テンプレート

```typescript
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// グローバルエラーハンドリング
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // グローバルエラーハンドリング
      if (error.status === 401) {
        redirectToLogin();
      } else if (error.status === 500) {
        toast.error('サーバーエラーが発生しました');
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`操作に失敗しました: ${error.message}`);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      gcTime: 1000 * 60 * 30, // 30分
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## カスタムクエリキーファクトリ

```typescript
// クエリキーの一元管理
export const queryKeys = {
  all: ['todos'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: TodoFilters) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// 使用例
useQuery({
  queryKey: queryKeys.detail(todoId),
  queryFn: () => fetchTodo(todoId),
});

// 関連クエリの無効化
queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
```

## 使用例

```typescript
function TodoApp() {
  const { data: todos, isLoading, error } = useQuery({
    queryKey: queryKeys.all,
    queryFn: fetchTodos,
  });

  const createMutation = useCreateTodo();
  const updateMutation = useOptimisticUpdateTodo();
  const deleteMutation = useDeleteTodo();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <CreateTodoForm
        onSubmit={(title) => createMutation.mutate({ title })}
        isLoading={createMutation.isPending}
      />
      <ul>
        {todos?.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() =>
              updateMutation.mutate({
                ...todo,
                completed: !todo.completed,
              })
            }
            onDelete={() => deleteMutation.mutate(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
}
```
