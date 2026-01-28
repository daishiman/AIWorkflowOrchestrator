/**
 * useInterval - 動的な間隔で関数を実行するカスタムフック
 *
 * TASK-3-2-C: SkillStreamDisplay タイムスタンプ自動更新
 *
 * @module @repo/desktop/renderer/hooks/useInterval
 */

import { useEffect, useRef } from "react";

/**
 * 動的な間隔で関数を実行するカスタムフック
 *
 * @param callback - 実行する関数
 * @param delay - 実行間隔（ミリ秒）。nullの場合は停止
 *
 * @example
 * // 1秒ごとに実行
 * useInterval(() => console.log('tick'), 1000);
 *
 * // 動的に間隔を変更
 * useInterval(callback, isActive ? 1000 : null);
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>();

  // コールバックを保存（最新の参照を維持）
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // インターバルを設定
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
