import React from "react";
import { Save, X, Archive, Loader2, Lock } from "lucide-react";

export interface EditorToolBarProps {
  selectedFile: string;
  hasChanges: boolean;
  isSaving: boolean;
  isReadOnly: boolean;
  onSave: () => void;
  onClose: () => void;
  onOpenBackups: () => void;
}

export const EditorToolBar: React.FC<EditorToolBarProps> = ({
  selectedFile,
  hasChanges,
  isSaving,
  isReadOnly,
  onSave,
  onClose,
  onOpenBackups,
}) => {
  const isSaveDisabled = !hasChanges || isSaving || isReadOnly;

  return (
    <div
      role="toolbar"
      aria-label="エディターツールバー"
      className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--border-default)] bg-[var(--bg-secondary)]"
    >
      {/* 保存ボタン（読み取り専用時は非表示: UT-UI-05A-005） */}
      {!isReadOnly && (
        <button
          type="button"
          aria-label="保存"
          disabled={isSaveDisabled}
          onClick={onSave}
          className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {isSaving ? (
            <Loader2
              size={16}
              className="text-[var(--text-secondary)] animate-spin"
              data-testid="save-spinner"
            />
          ) : (
            <Save size={16} className="text-[var(--text-secondary)]" />
          )}
        </button>
      )}

      {/* バックアップボタン */}
      <button
        type="button"
        aria-label="バックアップ"
        onClick={onOpenBackups}
        className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
      >
        <Archive size={16} className="text-[var(--text-secondary)]" />
      </button>

      {/* 読み取り専用 Lock アイコン（UT-UI-05A-005） */}
      {isReadOnly && (
        <Lock
          size={16}
          className="text-[var(--text-secondary)] ml-1"
          data-testid="toolbar-lock-icon"
        />
      )}

      {/* ファイル名表示 */}
      {selectedFile && (
        <span className="ml-2 text-sm text-[var(--text-primary)] truncate">
          {selectedFile}
          {hasChanges && (
            <span className="text-[var(--status-primary)]"> ●</span>
          )}
        </span>
      )}

      {/* 右寄せスペーサー */}
      <div className="flex-1" />

      {/* 閉じるボタン */}
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
      >
        <X size={16} className="text-[var(--text-secondary)]" />
      </button>
    </div>
  );
};

EditorToolBar.displayName = "EditorToolBar";
