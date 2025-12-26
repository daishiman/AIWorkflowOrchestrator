import { useState, useEffect, useRef, useMemo } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

const MAX_NAME_LENGTH = 50;
const MAX_PREVIEW_LENGTH = 100;

export interface SaveTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  previewContent: string;
  existingNames: string[];
}

/**
 * テンプレート保存ダイアログ
 * - テンプレート名入力
 * - プレビュー表示
 * - バリデーション対応
 */
export function SaveTemplateDialog({
  isOpen,
  onClose,
  onSave,
  previewContent,
  existingNames,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    // Reset name when dialog opens
    if (isOpen) {
      setName("");
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const trimmedName = name.trim();
  const isDuplicate = existingNames.some(
    (existingName) => existingName.toLowerCase() === trimmedName.toLowerCase(),
  );
  const isTooLong = name.length > MAX_NAME_LENGTH;
  const isEmpty = trimmedName.length === 0;

  const error = useMemo(() => {
    if (isTooLong) {
      return "テンプレート名は50文字以内で入力してください";
    }
    if (isDuplicate) {
      return "同じ名前のテンプレートが既に存在します";
    }
    return null;
  }, [isTooLong, isDuplicate]);

  const isValid = !isEmpty && !isTooLong && !isDuplicate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onSave(trimmedName);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const truncatedPreview =
    previewContent.length > MAX_PREVIEW_LENGTH
      ? previewContent.slice(0, MAX_PREVIEW_LENGTH) + "..."
      : previewContent;

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      data-testid="save-template-dialog-overlay"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        data-testid="save-template-dialog"
        className={clsx(
          "w-full max-w-md mx-auto",
          "bg-[var(--bg-glass,#1f1f28)] border border-white/10 rounded-lg",
          "shadow-2xl",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 id="dialog-title" className="text-lg font-medium text-white">
            テンプレートを保存
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white/80 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name input */}
          <div>
            <label
              htmlFor="template-name"
              className="block text-sm text-white/60 mb-1"
            >
              テンプレート名
            </label>
            <input
              ref={inputRef}
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={MAX_NAME_LENGTH + 10} // Allow typing beyond limit to show error
              data-testid="template-name-input"
              className={clsx(
                "w-full px-3 py-2",
                "bg-black/20 border rounded-md",
                "text-white placeholder:text-white/30",
                "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary,#7aa2f7)]/20",
                error
                  ? "border-red-400 focus:border-red-400"
                  : "border-white/10 focus:border-[var(--status-primary,#7aa2f7)]",
              )}
              placeholder="テンプレート名を入力"
              aria-invalid={!!error}
              aria-describedby={error ? "name-error" : "name-counter"}
            />
            {error ? (
              <p id="name-error" className="mt-1 text-xs text-red-400">
                {error}
              </p>
            ) : (
              <p id="name-counter" className="mt-1 text-xs text-white/40">
                {name.length} / {MAX_NAME_LENGTH} 文字
              </p>
            )}
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm text-white/60 mb-1">
              プレビュー
            </label>
            <div className="px-3 py-2 bg-black/20 border border-white/10 rounded-md text-sm text-white/60 min-h-[60px]">
              {truncatedPreview || (
                <span className="text-white/30">プレビューなし</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              data-testid="save-template-cancel-button"
              className={clsx(
                "px-4 py-2 rounded-md",
                "text-sm text-white/80",
                "hover:bg-white/10",
                "transition-colors",
              )}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!isValid}
              data-testid="save-template-confirm-button"
              className={clsx(
                "px-4 py-2 rounded-md",
                "text-sm",
                "bg-[var(--status-primary,#7aa2f7)] text-white",
                "hover:brightness-110",
                "transition-all",
                !isValid && "opacity-50 cursor-not-allowed",
              )}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaveTemplateDialog;
