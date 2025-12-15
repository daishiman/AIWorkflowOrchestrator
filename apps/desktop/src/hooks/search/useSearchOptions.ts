/**
 * useSearchOptions - 検索オプション管理フック
 *
 * 検索オプション（大文字小文字区別、単語単位、正規表現）の状態管理を提供
 */

import { useState, useCallback } from "react";
import { SearchOptions, DEFAULT_SEARCH_OPTIONS } from "./types";

export interface UseSearchOptionsReturn {
  /** 現在の検索オプション */
  options: SearchOptions;
  /** 大文字小文字区別をトグル */
  toggleCaseSensitive: () => void;
  /** 単語単位検索をトグル */
  toggleWholeWord: () => void;
  /** 正規表現使用をトグル */
  toggleRegex: () => void;
  /** オプションをリセット */
  resetOptions: () => void;
  /** オプションを直接設定 */
  setOptions: (options: Partial<SearchOptions>) => void;
}

/**
 * 検索オプション管理フック
 *
 * @param initialOptions - 初期オプション値
 * @returns 検索オプションと操作関数
 *
 * @example
 * ```tsx
 * const { options, toggleCaseSensitive, toggleWholeWord, toggleRegex } = useSearchOptions();
 *
 * return (
 *   <div>
 *     <button onClick={toggleCaseSensitive} aria-pressed={options.caseSensitive}>
 *       Aa
 *     </button>
 *   </div>
 * );
 * ```
 */
export function useSearchOptions(
  initialOptions?: Partial<SearchOptions>,
): UseSearchOptionsReturn {
  const [options, setOptionsState] = useState<SearchOptions>({
    ...DEFAULT_SEARCH_OPTIONS,
    ...initialOptions,
  });

  const toggleCaseSensitive = useCallback(() => {
    setOptionsState((prev) => ({
      ...prev,
      caseSensitive: !prev.caseSensitive,
    }));
  }, []);

  const toggleWholeWord = useCallback(() => {
    setOptionsState((prev) => ({
      ...prev,
      wholeWord: !prev.wholeWord,
    }));
  }, []);

  const toggleRegex = useCallback(() => {
    setOptionsState((prev) => ({
      ...prev,
      useRegex: !prev.useRegex,
    }));
  }, []);

  const resetOptions = useCallback(() => {
    setOptionsState({
      ...DEFAULT_SEARCH_OPTIONS,
      ...initialOptions,
    });
  }, [initialOptions]);

  const setOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    setOptionsState((prev) => ({
      ...prev,
      ...newOptions,
    }));
  }, []);

  return {
    options,
    toggleCaseSensitive,
    toggleWholeWord,
    toggleRegex,
    resetOptions,
    setOptions,
  };
}
