/**
 * PermissionDialog - ツール実行権限確認ダイアログ
 * @module PermissionDialog
 */
import { useState, useCallback, useEffect, useRef } from "react";
import type { PermissionRequest } from "@repo/shared/types/agent";

/**
 * PermissionDialogのプロパティ
 */
export interface PermissionDialogProps {
  /** 権限リクエスト（nullで非表示） */
  request: PermissionRequest | null;
  /** 許可ハンドラ */
  onApprove: (rememberChoice: boolean) => void;
  /** 拒否ハンドラ */
  onDeny: (rememberChoice: boolean) => void;
}

/**
 * 権限確認ダイアログコンポーネント
 *
 * - ツール名と引数を表示
 * - 許可/拒否ボタン
 * - 選択を記憶するチェックボックス
 * - アクセシビリティ対応（フォーカストラップ）
 */
export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  request,
  onApprove,
  onDeny,
}) => {
  const [rememberChoice, setRememberChoice] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "permission-dialog-title";

  // リクエスト変更時にチェックボックスをリセット
  useEffect(() => {
    setRememberChoice(false);
  }, [request?.requestId]);

  // フォーカストラップ
  useEffect(() => {
    if (!request || !dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [request]);

  /**
   * 許可ボタンクリックハンドラ
   */
  const handleApprove = useCallback(() => {
    onApprove(rememberChoice);
  }, [onApprove, rememberChoice]);

  /**
   * 拒否ボタンクリックハンドラ
   */
  const handleDeny = useCallback(() => {
    onDeny(rememberChoice);
  }, [onDeny, rememberChoice]);

  /**
   * チェックボックス変更ハンドラ
   */
  const handleRememberChange = useCallback(() => {
    setRememberChoice((prev) => !prev);
  }, []);

  if (!request) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl"
      >
        {/* タイトル */}
        <h2 id={titleId} className="mb-4 text-lg font-semibold text-gray-100">
          ツール実行の確認
        </h2>

        {/* ツール名 */}
        <div className="mb-4">
          <span className="text-sm text-gray-400">ツール名:</span>
          <span className="ml-2 font-mono text-blue-400">
            {request.toolName}
          </span>
        </div>

        {/* 引数 */}
        <div className="mb-4">
          <span className="text-sm text-gray-400">引数:</span>
          <pre className="mt-1 overflow-auto rounded bg-gray-900 p-2 text-xs text-gray-300">
            {JSON.stringify(request.args, null, 2)}
          </pre>
        </div>

        {/* 理由（存在する場合） */}
        {request.reason && (
          <div className="mb-4">
            <span className="text-sm text-gray-400">理由:</span>
            <p className="mt-1 text-sm text-gray-200">{request.reason}</p>
          </div>
        )}

        {/* 記憶チェックボックス */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={handleRememberChange}
              className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            この選択を記憶する
          </label>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleDeny}
            aria-label="拒否"
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            拒否
          </button>
          <button
            type="button"
            onClick={handleApprove}
            aria-label="許可"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            許可
          </button>
        </div>
      </div>
    </div>
  );
};
