/**
 * useDebounce - デバウンス処理フック
 *
 * 検索クエリなど、頻繁に変更される値をデバウンスするためのフック
 */

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 値をデバウンスする
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

/**
 * デバウンスされたコールバックを作成する
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
): { debouncedCallback: T; cancel: () => void; flush: () => void } {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const argsRef = useRef<unknown[]>([]);

  // 最新のコールバックを参照
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      callbackRef.current(...argsRef.current);
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: unknown[]) => {
      argsRef.current = args;
      cancel();
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [delay, cancel],
  ) as T;

  // クリーンアップ
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { debouncedCallback, cancel, flush };
}
