# 基本カスタムフックテンプレート

## 状態管理フック

### useToggle

```typescript
import { useState, useCallback } from "react";

/**
 * ブール値の切り替えを管理するフック
 *
 * @param initialValue - 初期値（デフォルト: false）
 * @returns [value, toggle, setValue] - 現在値、切り替え関数、直接設定関数
 *
 * @example
 * const [isOpen, toggleOpen, setIsOpen] = useToggle();
 * <button onClick={toggleOpen}>Toggle</button>
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue] as const;
}
```

### useCounter

```typescript
import { useState, useCallback } from "react";

interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

/**
 * カウンター状態を管理するフック
 *
 * @param initialValue - 初期値
 * @param options - オプション（min, max, step）
 *
 * @example
 * const { count, increment, decrement, reset } = useCounter(0, { min: 0, max: 10 });
 */
export function useCounter(initialValue = 0, options: UseCounterOptions = {}) {
  const { min = -Infinity, max = Infinity, step = 1 } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => Math.min(prev + step, max));
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(prev - step, min));
  }, [step, min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const set = useCallback(
    (value: number) => {
      setCount(Math.max(min, Math.min(value, max)));
    },
    [min, max],
  );

  return { count, increment, decrement, reset, set };
}
```

### useInput

```typescript
import { useState, useCallback, ChangeEvent } from "react";

/**
 * 入力フィールドの状態を管理するフック
 *
 * @param initialValue - 初期値
 *
 * @example
 * const name = useInput('');
 * <input {...name.bind} />
 * // または
 * <input value={name.value} onChange={name.onChange} />
 */
export function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue(e.target.value);
    },
    [],
  );

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  const clear = useCallback(() => {
    setValue("");
  }, []);

  return {
    value,
    setValue,
    onChange,
    reset,
    clear,
    bind: { value, onChange },
  };
}
```

## 副作用フック

### useDebounce

```typescript
import { useState, useEffect } from "react";

/**
 * 値のデバウンスを行うフック
 *
 * @param value - デバウンスする値
 * @param delay - 遅延時間（ミリ秒）
 *
 * @example
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * useEffect(() => {
 *   searchApi(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### useInterval

```typescript
import { useEffect, useRef } from "react";

/**
 * インターバルを管理するフック
 *
 * @param callback - 実行するコールバック
 * @param delay - 間隔（ミリ秒）、nullで停止
 *
 * @example
 * useInterval(() => {
 *   setCount(c => c + 1);
 * }, isRunning ? 1000 : null);
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
}
```

### useTimeout

```typescript
import { useEffect, useRef, useCallback } from "react";

/**
 * タイムアウトを管理するフック
 *
 * @param callback - 実行するコールバック
 * @param delay - 遅延時間（ミリ秒）、nullで無効化
 *
 * @example
 * useTimeout(() => {
 *   setIsVisible(false);
 * }, 3000);
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (delay === null) return;

    timeoutRef.current = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return clear;
  }, [delay, clear]);

  return clear;
}
```

## イベントフック

### useEventListener

```typescript
import { useEffect, useRef } from "react";

/**
 * イベントリスナーを管理するフック
 *
 * @param eventName - イベント名
 * @param handler - イベントハンドラ
 * @param element - 対象要素（デフォルト: window）
 *
 * @example
 * useEventListener('keydown', (e) => {
 *   if (e.key === 'Escape') closeModal();
 * });
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = typeof window !== "undefined"
    ? window
    : null,
  options?: AddEventListenerOptions,
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    element.addEventListener(eventName, eventListener, options);

    return () => {
      element.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}
```

### useClickOutside

```typescript
import { useEffect, useRef, RefObject } from "react";

/**
 * 要素外クリックを検出するフック
 *
 * @param callback - 要素外クリック時のコールバック
 * @returns 対象要素に設定するref
 *
 * @example
 * const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
 * <div ref={ref}>...</div>
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [callback]);

  return ref;
}
```

## ブラウザAPIフック

### useLocalStorage

```typescript
import { useState, useCallback, useEffect } from "react";

/**
 * ローカルストレージと同期する状態を管理するフック
 *
 * @param key - ストレージキー
 * @param initialValue - 初期値
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
```

### useMediaQuery

```typescript
import { useState, useEffect } from "react";

/**
 * メディアクエリの状態を監視するフック
 *
 * @param query - メディアクエリ文字列
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // 初期値を設定
    setMatches(mediaQuery.matches);

    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
```

## ユーティリティフック

### usePrevious

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

### useMounted

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
function SearchPage() {
  // 入力管理
  const search = useInput('');

  // デバウンス
  const debouncedQuery = useDebounce(search.value, 300);

  // 検索結果（別のフックで実装想定）
  const { results, isLoading } = useSearch(debouncedQuery);

  // モバイル判定
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 設定の永続化
  const [settings, setSettings] = useLocalStorage('search-settings', {
    showAdvanced: false,
  });

  return (
    <div>
      <input {...search.bind} placeholder="検索..." />
      {isLoading && <Spinner />}
      <SearchResults results={results} compact={isMobile} />
    </div>
  );
}
```
