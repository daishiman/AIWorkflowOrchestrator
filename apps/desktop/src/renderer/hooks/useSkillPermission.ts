/**
 * useSkillPermission - スキル実行時の権限確認フック
 *
 * TASK-3-1-D: Renderer側権限ダイアログUI実装
 *
 * @module @repo/desktop/renderer/hooks/useSkillPermission
 */

import { useState, useCallback, useEffect } from "react";
import type { SkillPermissionRequest } from "@repo/shared";

/**
 * useSkillPermission の戻り値
 */
export interface UseSkillPermissionReturn {
  /** 保留中の権限リクエスト（なければ null） */
  pendingPermission: SkillPermissionRequest | null;
  /** 許可ハンドラ */
  handleApprove: (rememberChoice: boolean) => void;
  /** 拒否ハンドラ */
  handleDeny: (rememberChoice: boolean) => void;
}

/**
 * スキル実行時の権限確認を管理するフック
 *
 * Main Process から送信される権限リクエストをリッスンし、
 * ユーザーの許可/拒否を Main Process に返す。
 *
 * @returns 権限リクエスト状態と応答ハンドラ
 *
 * @example
 * ```tsx
 * const { pendingPermission, handleApprove, handleDeny } = useSkillPermission();
 *
 * return (
 *   <PermissionDialog
 *     request={pendingPermission}
 *     onApprove={handleApprove}
 *     onDeny={handleDeny}
 *   />
 * );
 * ```
 */
export function useSkillPermission(): UseSkillPermissionReturn {
  const [pendingPermission, setPendingPermission] =
    useState<SkillPermissionRequest | null>(null);

  // 権限リクエストをリッスン
  useEffect(() => {
    // skillAPI が利用可能か確認
    if (
      typeof window === "undefined" ||
      !window.skillAPI?.onPermissionRequest
    ) {
      return;
    }

    const cleanup = window.skillAPI.onPermissionRequest(
      (request: SkillPermissionRequest) => {
        setPendingPermission(request);
      },
    );

    return cleanup;
  }, []);

  /**
   * 許可ハンドラ
   */
  const handleApprove = useCallback(
    (rememberChoice: boolean) => {
      if (!pendingPermission) return;

      window.skillAPI
        ?.sendPermissionResponse({
          requestId: pendingPermission.requestId,
          approved: true,
          rememberChoice,
        })
        .catch((error: unknown) => {
          console.error("[useSkillPermission] Failed to respond:", error);
        });

      setPendingPermission(null);
    },
    [pendingPermission],
  );

  /**
   * 拒否ハンドラ
   */
  const handleDeny = useCallback(
    (rememberChoice: boolean) => {
      if (!pendingPermission) return;

      window.skillAPI
        ?.sendPermissionResponse({
          requestId: pendingPermission.requestId,
          approved: false,
          rememberChoice,
        })
        .catch((error: unknown) => {
          console.error("[useSkillPermission] Failed to respond:", error);
        });

      setPendingPermission(null);
    },
    [pendingPermission],
  );

  return {
    pendingPermission,
    handleApprove,
    handleDeny,
  };
}

export default useSkillPermission;
