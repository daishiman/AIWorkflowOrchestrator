/**
 * RestoreDialog Component
 *
 * バージョン復元確認ダイアログ
 *
 * @module @repo/desktop/renderer/components/history/RestoreDialog
 */

import { useCallback, useEffect, useRef } from "react";
import type { VersionHistoryItem } from "./types";

export interface RestoreDialogProps {
  /** ダイアログ表示フラグ */
  isOpen: boolean;
  /** 復元対象バージョン */
  version: VersionHistoryItem;
  /** 復元確認時コールバック */
  onConfirm: () => void;
  /** キャンセル時コールバック */
  onCancel: () => void;
  /** 復元中フラグ */
  isLoading?: boolean;
  /** エラー情報 */
  error?: Error | null;
}

/**
 * 日時をフォーマット
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 復元確認ダイアログコンポーネント
 */
export function RestoreDialog({
  isOpen,
  version,
  onConfirm,
  onCancel,
  isLoading = false,
  error = null,
}: RestoreDialogProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escapeキー処理
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel();
      }
    },
    [onCancel, isLoading],
  );

  // キーボードイベントリスナー
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // フォーカストラップ
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const firstButton = dialogRef.current.querySelector("button");
      firstButton?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-dialog-title"
        aria-describedby="restore-dialog-description"
        className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
      >
        <h2
          id="restore-dialog-title"
          className="mb-4 text-lg font-semibold text-gray-900"
        >
          バージョン復元の確認
        </h2>

        <div id="restore-dialog-description" className="mb-6 space-y-3">
          <p className="text-gray-700">以下のバージョンに復元しますか？</p>

          <div className="rounded-md bg-gray-50 p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                v{version.version}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(version.createdAt)}
              </span>
            </div>
          </div>

          <p className="text-sm text-amber-600">
            ⚠️ 現在のバージョンは履歴として保存されます
          </p>

          {error && (
            <div
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-600"
            >
              エラー: {error.message}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            キャンセル
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "復元中..." : "復元する"}
          </button>
        </div>
      </div>
    </div>
  );
}
