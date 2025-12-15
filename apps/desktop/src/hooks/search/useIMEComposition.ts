/**
 * useIMEComposition - IME入力状態管理フック
 *
 * 日本語などのIME入力中の状態を管理するフック
 * IME変換中はEnterキーでの検索実行を防ぐために使用
 */

import { useState, useCallback } from "react";

export interface UseIMECompositionReturn {
  /** IME変換中かどうか */
  isComposing: boolean;
  /** compositionstartイベントハンドラ */
  handleCompositionStart: () => void;
  /** compositionendイベントハンドラ */
  handleCompositionEnd: () => void;
  /** IME変換中でない場合のみ実行するラッパー関数 */
  executeIfNotComposing: <T>(callback: () => T) => T | undefined;
}

export function useIMEComposition(): UseIMECompositionReturn {
  const [isComposing, setIsComposing] = useState(false);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  const executeIfNotComposing = useCallback(
    <T>(callback: () => T): T | undefined => {
      if (!isComposing) {
        return callback();
      }
      return undefined;
    },
    [isComposing],
  );

  return {
    isComposing,
    handleCompositionStart,
    handleCompositionEnd,
    executeIfNotComposing,
  };
}
