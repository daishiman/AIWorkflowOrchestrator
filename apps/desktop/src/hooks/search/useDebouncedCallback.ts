/**
 * useDebouncedCallback - デバウンスコールバックフック
 *
 * 指定された遅延時間後にコールバックを実行
 */

import { useCallback, useRef, useEffect } from "react";

/**
 * デバウンスコールバックフック
 *
 * @param callback - デバウンスするコールバック関数
 * @param delay - デバウンス遅延時間（ミリ秒）
 * @returns デバウンスされたコールバック関数とキャンセル関数
 *
 * @example
 * ```tsx
 * const [debouncedSearch, cancelSearch] = useDebouncedCallback(
 *   (query: string) => {
 *     performSearch(query);
 *   },
 *   300
 * );
 *
 * // 入力変更時
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 *
 * // コンポーネントアンマウント時やリセット時
 * cancelSearch();
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 300,
): [T, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // コールバック参照を最新に保つ
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, cancel],
  ) as T;

  // クリーンアップ
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return [debouncedCallback, cancel];
}

/**
 * デバウンス検索専用フック
 *
 * @param onSearch - 検索コールバック
 * @param delay - デバウンス遅延時間（ミリ秒）
 * @returns デバウンスされた検索関数とキャンセル関数
 *
 * @example
 * ```tsx
 * const [debouncedSearch, cancelSearch] = useDebouncedSearch(
 *   (query) => {
 *     invoke('search:execute', { query });
 *   },
 *   300
 * );
 * ```
 */
export function useDebouncedSearch(
  onSearch: (query: string) => void,
  delay: number = 300,
): [(query: string) => void, () => void] {
  return useDebouncedCallback(onSearch, delay);
}
