/**
 * デバッグイベント購読Hook
 *
 * IPC経由でデバッグイベントを購読し、セッションIDでフィルタリングする。
 * StrictMode二重登録を防止するため、cleanup関数を適切に返す（P5対策）。
 *
 * @module useDebugEvents
 */

import { useEffect } from "react";
import type { DebugEvent } from "@repo/shared/types/skill-debug";

/**
 * デバッグイベント購読Hook
 *
 * @param sessionId - 購読対象のセッションID（nullの場合は購読しない）
 * @param onEvent - イベント受信時のコールバック
 *
 * 使用例:
 * ```tsx
 * useDebugEvents(session?.id ?? null, (event) => {
 *   if (event.type === "step") { ... }
 * });
 * ```
 */
export function useDebugEvents(
  sessionId: string | null,
  onEvent: (event: DebugEvent) => void,
): void {
  useEffect(() => {
    if (!sessionId) return;

    const cleanup = window.electronAPI.skill.debug.onDebugEvent(
      (event: DebugEvent) => {
        if (event.sessionId === sessionId) {
          onEvent(event);
        }
      },
    );

    return cleanup;
  }, [sessionId, onEvent]);
}
