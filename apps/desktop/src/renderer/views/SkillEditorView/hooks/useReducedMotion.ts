/**
 * useReducedMotion - prefers-reduced-motion 対応フック
 *
 * ユーザーのモーション設定を監視し、アニメーション制御に使用する。
 * WCAG 2.3.3 準拠: prefers-reduced-motion: reduce 設定時にアニメーションを無効化。
 *
 * @module SkillEditorView/hooks/useReducedMotion
 */

import { useState, useEffect } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useReducedMotion = (): boolean => {
  const [isReduced, setIsReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = (e: MediaQueryListEvent) => {
      setIsReduced(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isReduced;
};
