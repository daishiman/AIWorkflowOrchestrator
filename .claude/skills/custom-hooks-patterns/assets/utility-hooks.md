# ユーティリティフック

## usePrevious

```typescript
import { useEffect, useRef } from "react";

/**
 * 前回の値を保持するフック
 *
 * @param value - 現在の値
 *
 * @example
 * const previousCount = usePrevious(count);
 * if (count > previousCount) {
 *   console.log('増加');
 * }
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

## useMounted

```typescript
import { useEffect, useRef, useCallback } from "react";

/**
 * コンポーネントのマウント状態を追跡するフック
 *
 * @example
 * const isMounted = useMounted();
 *
 * useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted()) {
 *       setData(data);
 *     }
 *   });
 * }, []);
 */
export function useMounted() {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return useCallback(() => mounted.current, []);
}
```

## 使用例

```typescript
function CounterWithHistory() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  const direction = useMemo(() => {
    if (previousCount === undefined) return 'initial';
    if (count > previousCount) return 'up';
    if (count < previousCount) return 'down';
    return 'same';
  }, [count, previousCount]);

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {previousCount ?? 'N/A'}</p>
      <p>Direction: {direction}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}

function AsyncDataLoader({ userId }: { userId: string }) {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useMounted();

  useEffect(() => {
    setLoading(true);

    fetchUser(userId)
      .then((user) => {
        // コンポーネントがアンマウントされていたら状態更新をスキップ
        if (isMounted()) {
          setData(user);
        }
      })
      .finally(() => {
        if (isMounted()) {
          setLoading(false);
        }
      });
  }, [userId, isMounted]);

  if (loading) return <Spinner />;
  if (!data) return <p>User not found</p>;
  return <UserCard user={data} />;
}

function FormWithDirtyCheck() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const previousFormData = usePrevious(formData);

  const isDirty = useMemo(() => {
    if (!previousFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(previousFormData);
  }, [formData, previousFormData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
      />
      <input
        value={formData.email}
        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
      />
      {isDirty && <p>Unsaved changes</p>}
    </form>
  );
}
```
