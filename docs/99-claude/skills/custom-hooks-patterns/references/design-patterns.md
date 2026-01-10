# カスタムフック設計パターン

## 概要

このドキュメントでは、よく使われるカスタムフックのパターンを
カテゴリ別に解説します。

## 状態管理パターン

### useToggle

```typescript
function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((prev) => !prev), []);
  return [value, toggle];
}

// 使用
const [isOpen, toggleOpen] = useToggle();
```

### useCounter

```typescript
interface UseCounterOptions {
  min?: number;
  max?: number;
  step?: number;
}

function useCounter(initialValue = 0, options: UseCounterOptions = {}) {
  const { min = -Infinity, max = Infinity, step = 1 } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => Math.min(prev + step, max));
  }, [step, max]);

  const decrement = useCallback(() => {
    setCount((prev) => Math.max(prev - step, min));
  }, [step, min]);

  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  const set = useCallback(
    (value: number) => {
      setCount(Math.max(min, Math.min(value, max)));
    },
    [min, max],
  );

  return { count, increment, decrement, reset, set };
}

// 使用
const { count, increment, decrement } = useCounter(0, { min: 0, max: 10 });
```

### usePrevious

```typescript
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// 使用
const previousCount = usePrevious(count);
```

### useHistory

```typescript
function useHistory<T>(initialValue: T, maxHistory = 10) {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [index, setIndex] = useState(0);

  const current = history[index];

  const set = useCallback(
    (value: T) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, index + 1);
        newHistory.push(value);
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setIndex((prev) => Math.min(prev + 1, maxHistory - 1));
    },
    [index, maxHistory],
  );

  const undo = useCallback(() => {
    setIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const redo = useCallback(() => {
    setIndex((prev) => Math.min(prev + 1, history.length - 1));
  }, [history.length]);

  const canUndo = index > 0;
  const canRedo = index < history.length - 1;

  return { current, set, undo, redo, canUndo, canRedo };
}
```

## 入力・フォームパターン

### useInput

```typescript
function useInput<T extends string>(initialValue: T = '' as T) {
  const [value, setValue] = useState<T>(initialValue);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value as T);
  }, []);

  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return {
    value,
    onChange,
    reset,
    bind: { value, onChange },
  };
}

// 使用
const name = useInput('');
return <input {...name.bind} />;
```

### useForm

```typescript
function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => void | Promise<void>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // エラーをクリア
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setFieldError,
  };
}
```

## 副作用パターン

### useDebounce

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 使用: 検索入力のデバウンス
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  // debouncedSearchが変わった時だけAPI呼び出し
  searchApi(debouncedSearch);
}, [debouncedSearch]);
```

### useThrottle

```typescript
function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(
        () => {
          lastUpdated.current = Date.now();
          setThrottledValue(value);
        },
        interval - (now - lastUpdated.current),
      );

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}
```

### useInterval

```typescript
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // 最新のコールバックを保存
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

// 使用
useInterval(
  () => {
    setCount((c) => c + 1);
  },
  isRunning ? 1000 : null,
); // nullで停止
```

### useTimeout

```typescript
function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}
```

## イベントパターン

### useEventListener

```typescript
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | null = window,
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
    return () => element.removeEventListener(eventName, eventListener, options);
  }, [eventName, element, options]);
}

// 使用
useEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});
```

### useClickOutside

```typescript
function useClickOutside<T extends HTMLElement>(
  callback: () => void
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

// 使用
const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
return <div ref={ref}>...</div>;
```

### useHover

```typescript
function useHover<T extends HTMLElement>(): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return [ref, isHovered];
}
```

## ブラウザAPIパターン

### useLocalStorage

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
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
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
```

### useMediaQuery

```typescript
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// 使用
const isMobile = useMediaQuery("(max-width: 768px)");
```

### useOnlineStatus

```typescript
function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
```

## ベストプラクティス

1. **命名規則**: `use`で始める
2. **戻り値**: オブジェクトか配列で一貫性を保つ
3. **メモ化**: 関数はuseCallback、計算値はuseMemoで
4. **型安全**: TypeScriptで適切に型付け
5. **クリーンアップ**: useEffect内で必ずクリーンアップ
