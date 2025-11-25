# カスタムフックテスト戦略

## 概要

カスタムフックのテストは、コンポーネントのテストとは異なるアプローチが必要です。
このドキュメントでは、@testing-library/react を使用したテスト戦略を解説します。

## 基本セットアップ

```typescript
// test-utils.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// React Queryを使うフック用のラッパー
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

export function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}
```

## 基本的なテストパターン

### 単純な状態フックのテスト

```typescript
// useCounter.ts
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  return { count, increment, decrement, reset };
}

// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

### 非同期フックのテスト

```typescript
// useFetch.ts
function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setData(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  return { data, isLoading, error };
}

// useFetch.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

// fetchのモック
global.fetch = jest.fn();

describe('useFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useFetch('/api/test'));

    // 初期状態
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);

    // データ取得完了を待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should refetch when url changes', async () => {
    const mockData1 = { id: 1 };
    const mockData2 = { id: 2 };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => mockData1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockData2 });

    const { result, rerender } = renderHook(
      ({ url }) => useFetch(url),
      { initialProps: { url: '/api/1' } }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    // URL変更
    rerender({ url: '/api/2' });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
```

### 副作用フックのテスト

```typescript
// useDebounce.ts
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// useDebounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // 値を変更
    rerender({ value: 'updated', delay: 500 });

    // まだ変更されていない
    expect(result.current).toBe('initial');

    // 時間を進める
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // 更新された
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => { jest.advanceTimersByTime(200); });

    rerender({ value: 'c' });
    act(() => { jest.advanceTimersByTime(200); });

    rerender({ value: 'd' });
    act(() => { jest.advanceTimersByTime(200); });

    // まだ 'a' のまま
    expect(result.current).toBe('a');

    // 残りの時間を進める
    act(() => { jest.advanceTimersByTime(300); });

    // 最後の値 'd' になる
    expect(result.current).toBe('d');
  });
});
```

### Context依存フックのテスト

```typescript
// useAuth.ts
const AuthContext = createContext<AuthContextType | null>(null);

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// useAuth.test.ts
import { renderHook } from '@testing-library/react';
import { useAuth, AuthProvider } from './useAuth';

describe('useAuth', () => {
  it('should throw error when used outside provider', () => {
    // エラーをキャッチ
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');

    consoleError.mockRestore();
  });

  it('should return auth context when used within provider', () => {
    const mockAuth = {
      user: { id: '1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockAuth}>
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual({ id: '1', name: 'Test User' });
  });
});
```

### LocalStorageフックのテスト

```typescript
// useLocalStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() =>
      useLocalStorage('key', 'initial')
    );

    expect(result.current[0]).toBe('initial');
  });

  it('should return stored value when localStorage has data', () => {
    localStorage.setItem('key', JSON.stringify('stored'));

    const { result } = renderHook(() =>
      useLocalStorage('key', 'initial')
    );

    expect(result.current[0]).toBe('stored');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() =>
      useLocalStorage('key', 'initial')
    );

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('key')).toBe(JSON.stringify('updated'));
  });

  it('should handle objects', () => {
    const { result } = renderHook(() =>
      useLocalStorage('key', { a: 1 })
    );

    act(() => {
      result.current[1]({ a: 2, b: 3 });
    });

    expect(result.current[0]).toEqual({ a: 2, b: 3 });
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() =>
      useLocalStorage('count', 0)
    );

    act(() => {
      result.current[1](prev => prev + 1);
    });

    expect(result.current[0]).toBe(1);
  });
});
```

## テストのベストプラクティス

### 1. 振る舞いをテストする

```typescript
// ❌ 実装の詳細をテスト
expect(result.current.state.internalFlag).toBe(true);

// ✅ 振る舞いをテスト
expect(result.current.isLoading).toBe(false);
expect(result.current.data).toEqual(expectedData);
```

### 2. act()で状態更新をラップ

```typescript
// 状態を更新する操作はact()でラップ
act(() => {
  result.current.increment();
});
```

### 3. 非同期操作はwaitForを使用

```typescript
await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});
```

### 4. モックを適切にクリア

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

### 5. エッジケースをテスト

```typescript
describe('edge cases', () => {
  it('should handle empty input', () => { /* ... */ });
  it('should handle null values', () => { /* ... */ });
  it('should handle rapid updates', () => { /* ... */ });
  it('should cleanup on unmount', () => { /* ... */ });
});
```

## テストカバレッジのチェックリスト

- [ ] 初期状態のテスト
- [ ] 正常系の動作
- [ ] 異常系の動作（エラーハンドリング）
- [ ] 引数変更時の動作
- [ ] クリーンアップの確認
- [ ] エッジケース（null、undefined、空配列等）
- [ ] メモリリークの確認（unmount時）
