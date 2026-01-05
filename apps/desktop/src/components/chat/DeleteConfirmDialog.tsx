/**
 * DeleteConfirmDialog - セッション削除確認ダイアログ
 *
 * セッション削除時の確認を行うモーダルダイアログ。
 */

/**
 * 削除確認ダイアログコンポーネント
 */
export function DeleteConfirmDialog({
  sessionTitle,
  onConfirm,
  onCancel,
}: {
  sessionTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="mx-4 max-w-md rounded-hig-lg bg-hig-bg-primary p-6 shadow-hig-lg">
        <h2
          id="delete-dialog-title"
          className="text-lg font-semibold text-hig-text-primary"
        >
          セッションを削除しますか？
        </h2>
        <p className="mt-2 text-sm text-hig-text-secondary">
          「{sessionTitle}」を削除します。この操作は取り消せません。
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-hig-sm px-4 py-2 text-sm text-hig-text-primary hover:bg-hig-bg-secondary transition-colors duration-hig-micro"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-hig-sm bg-hig-error px-4 py-2 text-sm text-white hover:opacity-90 transition-opacity duration-hig-micro"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
