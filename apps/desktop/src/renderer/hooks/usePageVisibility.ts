/**
 * usePageVisibility - ページの可視状態を監視するカスタムフック
 *
 * TASK-3-2-C: SkillStreamDisplay タイムスタンプ自動更新
 *
 * @module @repo/desktop/renderer/hooks/usePageVisibility
 */

import { useState, useEffect } from "react";

/**
 * ページの可視状態を監視するカスタムフック
 *
 * @returns isVisible - ページが可視状態かどうか
 *
 * @example
 * const isVisible = usePageVisibility();
 * // タブが非表示になるとfalseになる
 */
export function usePageVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true,
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
}
