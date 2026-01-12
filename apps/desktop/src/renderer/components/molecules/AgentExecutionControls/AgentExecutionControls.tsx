/**
 * AgentExecutionControls - エージェント実行制御コンポーネント
 * @module AgentExecutionControls
 */
import { useState, useCallback } from "react";

/**
 * AgentExecutionControlsのプロパティ
 */
export interface AgentExecutionControlsProps {
  /** 実行中フラグ */
  isExecuting: boolean;
  /** メッセージ存在フラグ */
  hasMessages: boolean;
  /** キャンセルハンドラ */
  onCancel: () => void;
  /** クリアハンドラ */
  onClear: () => void;
}

/**
 * 実行制御コンポーネント
 *
 * - キャンセルボタン（実行中のみ表示）
 * - クリアボタン（確認ダイアログ付き）
 */
export const AgentExecutionControls: React.FC<AgentExecutionControlsProps> = ({
  isExecuting,
  hasMessages,
  onCancel,
  onClear,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  /**
   * クリアボタンクリックハンドラ
   */
  const handleClearClick = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  /**
   * 確認ダイアログ確認ハンドラ
   */
  const handleConfirm = useCallback(() => {
    setShowConfirmDialog(false);
    onClear();
  }, [onClear]);

  /**
   * 確認ダイアログキャンセルハンドラ
   */
  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  return (
    <div className="flex items-center gap-2 p-2">
      {/* キャンセルボタン */}
      {isExecuting && (
        <button
          type="button"
          onClick={onCancel}
          aria-label="キャンセル"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          キャンセル
        </button>
      )}

      {/* クリアボタン */}
      {hasMessages && (
        <button
          type="button"
          onClick={handleClearClick}
          aria-label="クリア"
          className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          クリア
        </button>
      )}

      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div
          role="alertdialog"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="rounded-lg bg-gray-800 p-6 shadow-xl">
            <h2
              id="confirm-dialog-title"
              className="mb-2 text-lg font-semibold text-gray-100"
            >
              確認
            </h2>
            <p
              id="confirm-dialog-description"
              className="mb-4 text-sm text-gray-300"
            >
              メッセージをクリアしますか？
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelConfirm}
                aria-label="キャンセル"
                className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                aria-label="確認"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
