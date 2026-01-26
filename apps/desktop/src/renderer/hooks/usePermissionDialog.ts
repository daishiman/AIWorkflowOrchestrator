/**
 * usePermissionDialog - 権限確認ダイアログを管理する React Hook
 *
 * TASK-4-2: PermissionResolver IPC Handlers
 *
 * @module @repo/desktop/renderer/hooks/usePermissionDialog
 */

import { useState, useEffect, useCallback } from "react";
import type {
  SkillPermissionRequest,
  SkillPermissionResponse,
} from "@repo/shared";

/**
 * usePermissionDialog の戻り値
 */
export interface UsePermissionDialogReturn {
  /** 現在のリクエスト（表示中のもの） */
  currentRequest: SkillPermissionRequest | null;
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 応答処理中フラグ */
  isResponding: boolean;
  /** 待機中のリクエストキュー */
  requestQueue: SkillPermissionRequest[];
  /** 応答を送信 */
  respond: (approved: boolean, rememberChoice?: boolean) => Promise<void>;
  /** ダイアログを閉じる（拒否扱い） */
  close: () => Promise<void>;
}

/**
 * 権限確認ダイアログを管理するカスタムフック
 *
 * Main Process から IPC 経由で送られる権限確認リクエストを受け取り、
 * キューで管理し、ユーザーの応答を Main Process に送信する。
 *
 * @returns Hook の戻り値
 *
 * @example
 * ```typescript
 * const {
 *   currentRequest,
 *   isOpen,
 *   respond,
 *   close,
 * } = usePermissionDialog();
 *
 * // ユーザーが許可
 * await respond(true);
 *
 * // ユーザーが拒否
 * await respond(false);
 *
 * // ダイアログを閉じる（拒否として処理）
 * await close();
 * ```
 */
export function usePermissionDialog(): UsePermissionDialogReturn {
  const [requestQueue, setRequestQueue] = useState<SkillPermissionRequest[]>(
    [],
  );
  const [isResponding, setIsResponding] = useState(false);

  // 現在表示中のリクエスト（キューの先頭）
  const currentRequest = requestQueue.length > 0 ? requestQueue[0] : null;
  const isOpen = currentRequest !== null;

  // 権限確認リクエストの購読
  useEffect(() => {
    const unsubscribe = window.skillAPI.onPermissionRequest(
      (request: SkillPermissionRequest) => {
        setRequestQueue((prev) => [...prev, request]);
      },
    );

    return unsubscribe;
  }, []);

  /**
   * 応答を送信
   */
  const respond = useCallback(
    async (approved: boolean, rememberChoice?: boolean): Promise<void> => {
      if (!currentRequest) {
        return;
      }

      setIsResponding(true);

      try {
        const response: SkillPermissionResponse = {
          requestId: currentRequest.requestId,
          approved,
          rememberChoice,
        };

        await window.skillAPI.sendPermissionResponse(response);

        // キューから現在のリクエストを削除
        setRequestQueue((prev) => prev.slice(1));
      } finally {
        setIsResponding(false);
      }
    },
    [currentRequest],
  );

  /**
   * ダイアログを閉じる（拒否扱い）
   */
  const close = useCallback(async (): Promise<void> => {
    await respond(false);
  }, [respond]);

  return {
    currentRequest,
    isOpen,
    isResponding,
    requestQueue,
    respond,
    close,
  };
}
