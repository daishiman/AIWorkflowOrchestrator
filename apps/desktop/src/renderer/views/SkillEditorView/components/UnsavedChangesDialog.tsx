import React, { useEffect, useRef } from "react";

export interface UnsavedChangesDialogProps {
  isOpen: boolean;
  fileName: string;
  onSaveAndContinue: () => void;
  onDiscardAndContinue: () => void;
  onCancel: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  fileName,
  onSaveAndContinue,
  onDiscardAndContinue,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      data-testid="unsaved-dialog-overlay"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label="未保存の変更"
        tabIndex={-1}
        className="relative z-10 w-[400px] max-w-[90vw] rounded-xl bg-[var(--bg-primary)] shadow-lg border border-[var(--border-default)] p-6"
      >
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
          未保存の変更
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          「{fileName}」に未保存の変更があります。保存しますか？
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onDiscardAndContinue}
            className="px-4 py-2 text-sm rounded-lg text-[var(--status-error)] hover:bg-[var(--bg-tertiary)] transition-colors duration-200"
          >
            保存せず続行
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-200"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onSaveAndContinue}
            className="px-4 py-2 text-sm rounded-lg bg-[var(--status-primary)] text-white hover:opacity-90 transition-opacity duration-200"
          >
            保存して続行
          </button>
        </div>
      </div>
    </div>
  );
};

UnsavedChangesDialog.displayName = "UnsavedChangesDialog";
