/**
 * useToast - Toast 通知の状態管理フック
 *
 * UT-UI-05A-004: 保存成功 Toast
 *
 * - success: 2500ms 後に自動消去
 * - error: 手動消去のみ（自動消去なし）
 * - 複数 Toast のスタック管理
 * - 連続呼び出し時のタイマーリセット
 *
 * @module SkillEditorView/hooks/useToast
 */

import { useState, useCallback, useRef, useEffect } from "react";

const TOAST_AUTO_CLOSE_MS = 2500;

export type ToastType = "success" | "error";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ShowToastOptions {
  type: ToastType;
  message: string;
}

interface UseToastResult {
  toasts: Toast[];
  showToast: (options: ShowToastOptions) => void;
  dismissToast: (id: string) => void;
}

export const useToast = (): UseToastResult => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (options: ShowToastOptions) => {
      const id = crypto.randomUUID();
      const newToast: Toast = { id, ...options };

      setToasts((prev) => [...prev, newToast]);

      // success Toast のみ自動消去タイマーを設定
      if (options.type === "success") {
        const timer = setTimeout(() => {
          dismissToast(id);
        }, TOAST_AUTO_CLOSE_MS);
        timersRef.current.set(id, timer);
      }
    },
    [dismissToast],
  );

  return { toasts, showToast, dismissToast };
};
