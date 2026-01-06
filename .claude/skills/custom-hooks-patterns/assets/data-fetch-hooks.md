# データフェッチフック

## useFetch

```typescript
import { useState, useEffect, useCallback, useRef } from "react";

interface UseFetchOptions<T> {
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetchResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * データフェッチを管理するフック
 *
 * @param url - フェッチURL（nullで無効化）
 * @param options - オプション設定
 */
export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions<T> = {},
): UseFetchResult<T> {
  const { enabled = true, initialData, onSuccess, onError } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!!url && enabled);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [url, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
```

## useAsync

```typescript
import { useState, useCallback, useRef } from "react";

type AsyncFunction<T, Args extends unknown[]> = (...args: Args) => Promise<T>;

interface UseAsyncResult<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | undefined>;
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * 非同期関数を管理するフック
 *
 * @param asyncFunction - 実行する非同期関数
 *
 * @example
 * const { execute, data, isLoading, error } = useAsync(updateUser);
 * <button onClick={() => execute(userId, userData)}>Update</button>
 */
export function useAsync<T, Args extends unknown[]>(
  asyncFunction: AsyncFunction<T, Args>,
): UseAsyncResult<T, Args> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef(true);

  const execute = useCallback(
    async (...args: Args) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        if (isMountedRef.current) {
          setData(result);
          return result;
        }
      } catch (err) {
        if (isMountedRef.current) {
          const error = err instanceof Error ? err : new Error("Unknown error");
          setError(error);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [asyncFunction],
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return { execute, data, isLoading, error, reset };
}
```

## 使用例

```typescript
// useFetch例
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error, refetch } = useFetch<User>(
    `/api/users/${userId}`,
    {
      onSuccess: (user) => console.log('Loaded:', user.name),
      onError: (err) => console.error('Failed:', err),
    }
  );

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <UserCard user={user} onRefresh={refetch} />;
}

// useAsync例
function UpdateButton({ userId, data }: Props) {
  const { execute, isLoading } = useAsync(updateUserApi);

  return (
    <button
      onClick={() => execute(userId, data)}
      disabled={isLoading}
    >
      {isLoading ? 'Updating...' : 'Update'}
    </button>
  );
}
```
