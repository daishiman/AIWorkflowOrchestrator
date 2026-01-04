# SWRフックテンプレート

## 基本データフェッチフック

```typescript
import useSWR from "swr";

// フェッチャー関数
const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }
  return res.json();
};

// 基本的なデータフェッチフック
export function useData<T>(key: string | null) {
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    key,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
```

## ユーザーデータフック

```typescript
import useSWR from "swr";

interface User {
  id: string;
  name: string;
  email: string;
}

export function useUser(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    userId ? `/api/users/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1分間の重複排除
    },
  );

  return {
    user: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
```

## リスト取得フック（ページネーション付き）

```typescript
import useSWR from "swr";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

interface UsePaginatedListOptions {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export function usePaginatedList<T>(
  endpoint: string,
  options: UsePaginatedListOptions = {},
) {
  const { page = 1, pageSize = 10, enabled = true } = options;

  const key = enabled ? `${endpoint}?page=${page}&pageSize=${pageSize}` : null;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<T>>(
    key,
    fetcher,
    {
      keepPreviousData: true, // ページ切り替え時にデータを保持
    },
  );

  return {
    items: data?.data ?? [],
    total: data?.total ?? 0,
    currentPage: data?.page ?? page,
    pageSize: data?.pageSize ?? pageSize,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
```

## 無限スクロールフック

```typescript
import useSWRInfinite from "swr/infinite";

interface InfiniteResponse<T> {
  data: T[];
  nextCursor: string | null;
}

export function useInfiniteList<T>(endpoint: string) {
  const getKey = (
    pageIndex: number,
    previousPageData: InfiniteResponse<T> | null,
  ) => {
    // 最初のページ
    if (pageIndex === 0) return endpoint;

    // 次のページがない場合
    if (previousPageData && !previousPageData.nextCursor) return null;

    // 次のページ
    return `${endpoint}?cursor=${previousPageData?.nextCursor}`;
  };

  const { data, error, size, setSize, isLoading, isValidating } =
    useSWRInfinite<InfiniteResponse<T>>(getKey, fetcher);

  const items = data?.flatMap((page) => page.data) ?? [];
  const hasMore = data?.[data.length - 1]?.nextCursor !== null;
  const isEmpty = data?.[0]?.data.length === 0;

  const loadMore = () => {
    if (!isValidating && hasMore) {
      setSize(size + 1);
    }
  };

  return {
    items,
    isLoading,
    isLoadingMore: isValidating && size > 1,
    isEmpty,
    hasMore,
    loadMore,
    error,
  };
}
```

## ミューテーションフック

```typescript
import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// 更新関数
async function updateTodoFn(
  url: string,
  { arg }: { arg: Partial<Todo> },
): Promise<Todo> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

export function useTodo(id: string) {
  const { mutate: globalMutate } = useSWRConfig();

  // データ取得
  const { data, error, isLoading } = useSWR<Todo>(`/api/todos/${id}`, fetcher);

  // 更新ミューテーション（楽観的更新付き）
  const { trigger: update, isMutating: isUpdating } = useSWRMutation(
    `/api/todos/${id}`,
    updateTodoFn,
    {
      // 楽観的更新
      optimisticData: (currentData, { arg }) => ({
        ...currentData!,
        ...arg,
      }),
      // 失敗時のロールバック
      rollbackOnError: true,
      // 成功後の再検証
      revalidate: true,
      // 関連リストの無効化
      onSuccess: () => {
        globalMutate("/api/todos");
      },
    },
  );

  return {
    todo: data,
    isLoading,
    isUpdating,
    error,
    update,
  };
}
```

## 作成フック

```typescript
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";

interface CreateTodoInput {
  title: string;
}

async function createTodoFn(
  url: string,
  { arg }: { arg: CreateTodoInput },
): Promise<Todo> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  });
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}

export function useCreateTodo() {
  const { mutate } = useSWRConfig();

  const { trigger, isMutating, error } = useSWRMutation(
    "/api/todos",
    createTodoFn,
    {
      onSuccess: () => {
        // リストを再検証
        mutate("/api/todos");
      },
    },
  );

  return {
    createTodo: trigger,
    isCreating: isMutating,
    error,
  };
}
```

## 削除フック

```typescript
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";

async function deleteTodoFn(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
}

export function useDeleteTodo() {
  const { mutate } = useSWRConfig();

  const deleteTodo = async (id: string) => {
    // 楽観的に削除
    mutate(
      "/api/todos",
      (todos: Todo[] | undefined) => todos?.filter((todo) => todo.id !== id),
      false, // revalidateをfalseにして即座更新
    );

    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
      // 成功時は再検証
      mutate("/api/todos");
    } catch (error) {
      // 失敗時はロールバック
      mutate("/api/todos");
      throw error;
    }
  };

  return { deleteTodo };
}
```

## 条件付きフェッチフック

```typescript
import useSWR from "swr";

interface UseConditionalFetchOptions<T> {
  enabled?: boolean;
  fallbackData?: T;
  refreshInterval?: number;
}

export function useConditionalFetch<T>(
  key: string,
  options: UseConditionalFetchOptions<T> = {},
) {
  const { enabled = true, fallbackData, refreshInterval } = options;

  const { data, error, isLoading, mutate } = useSWR<T>(
    enabled ? key : null,
    fetcher,
    {
      fallbackData,
      refreshInterval,
    },
  );

  return {
    data: data ?? fallbackData,
    isLoading: enabled && isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
```

## グローバル設定テンプレート

```typescript
import { SWRConfig } from 'swr';

// グローバルフェッチャー
const globalFetcher = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const error = new Error('API Error');
    error.status = res.status;
    throw error;
  }

  return res.json();
};

// グローバルエラーハンドラー
const onError = (error: Error, key: string) => {
  if (error.status === 401) {
    // 認証エラー処理
    redirectToLogin();
  } else if (error.status === 500) {
    // サーバーエラー通知
    toast.error('サーバーエラーが発生しました');
  }
};

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: globalFetcher,
        onError,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  );
}
```

## 使用例

```typescript
// コンポーネントでの使用
function TodoList() {
  const { items, isLoading, hasMore, loadMore } = useInfiniteList<Todo>('/api/todos');
  const { createTodo, isCreating } = useCreateTodo();
  const { deleteTodo } = useDeleteTodo();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <CreateTodoForm onSubmit={createTodo} disabled={isCreating} />
      <ul>
        {items.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </ul>
      {hasMore && <button onClick={loadMore}>さらに読み込む</button>}
    </div>
  );
}
```
