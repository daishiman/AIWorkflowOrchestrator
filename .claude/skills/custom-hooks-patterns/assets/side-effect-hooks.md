# 副作用フック

## useDebounce

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

## useInterval

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

## useTimeout

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

## 使用例

```typescript
function SearchWithDebounce() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    if (debouncedQuery) {
      searchApi(debouncedQuery).then(setResults);
    }
  }, [debouncedQuery]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <ul>
        {results.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useInterval(
    () => setSeconds((s) => s + 1),
    isRunning ? 1000 : null
  );

  return (
    <div>
      <p>Time: {seconds}s</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useTimeout(onClose, 3000);

  return (
    <div className="toast">
      {message}
      <button onClick={onClose}>×</button>
    </div>
  );
}
```
