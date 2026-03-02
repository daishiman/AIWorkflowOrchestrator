/**
 * CreateChainDialog コンポーネント
 *
 * 新規チェーンを作成するためのダイアログ。
 * チェーン名と説明を入力する。
 *
 * @module CreateChainDialog
 */

import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";
import { Button } from "../../../components/atoms/Button";
import { Icon } from "../../../components/atoms/Icon";

export interface CreateChainDialogProps {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** 作成ハンドラ */
  onCreate: (name: string, description: string) => void;
}

/** CreateChainDialog のスタイル定義 */
export const createChainDialogStyles = {
  overlay: clsx(
    "fixed inset-0 z-50",
    "bg-black/50 backdrop-blur-sm",
    "flex items-center justify-center",
  ),
  dialog: clsx(
    "w-full max-w-md mx-4 p-6 rounded-xl",
    "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
    "shadow-xl",
  ),
  header: "flex items-center justify-between mb-4",
  title: "text-lg font-semibold text-[var(--text-primary)]",
  closeButton: clsx(
    "p-1 rounded-lg",
    "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
    "hover:bg-[var(--bg-secondary)]",
  ),
  form: "space-y-4",
  label: "block text-sm font-medium text-[var(--text-secondary)] mb-1",
  input: clsx(
    "w-full px-3 py-2 rounded-lg text-sm",
    "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
    "text-[var(--text-primary)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
  ),
  textarea: clsx(
    "w-full px-3 py-2 rounded-lg text-sm resize-none",
    "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
    "text-[var(--text-primary)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)]",
  ),
  actions: "flex justify-end gap-2 mt-6",
} as const;

/**
 * CreateChainDialog コンポーネント
 */
export const CreateChainDialog: React.FC<CreateChainDialogProps> = memo(
  ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = useCallback(() => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      onCreate(trimmedName, description.trim());
      setName("");
      setDescription("");
      onClose();
    }, [name, description, onCreate, onClose]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      },
      [onClose],
    );

    if (!isOpen) return null;

    return (
      <div
        className={createChainDialogStyles.overlay}
        data-testid="create-chain-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="新しいチェーンを作成"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={createChainDialogStyles.dialog}
          onKeyDown={handleKeyDown}
        >
          <div className={createChainDialogStyles.header}>
            <h2 className={createChainDialogStyles.title}>
              新しいチェーンを作成
            </h2>
            <button
              type="button"
              className={createChainDialogStyles.closeButton}
              onClick={onClose}
              aria-label="閉じる"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className={createChainDialogStyles.form}>
            <div>
              <label
                className={createChainDialogStyles.label}
                htmlFor="chain-name"
              >
                チェーン名
              </label>
              <input
                id="chain-name"
                type="text"
                className={createChainDialogStyles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="チェーン名を入力"
                data-testid="chain-name-input"
                autoFocus
              />
            </div>

            <div>
              <label
                className={createChainDialogStyles.label}
                htmlFor="chain-description"
              >
                説明
              </label>
              <textarea
                id="chain-description"
                className={createChainDialogStyles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="チェーンの説明を入力（任意）"
                rows={3}
                data-testid="chain-description-input"
              />
            </div>
          </div>

          <div className={createChainDialogStyles.actions}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!name.trim()}
              data-testid="create-chain-submit"
            >
              作成
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

CreateChainDialog.displayName = "CreateChainDialog";
