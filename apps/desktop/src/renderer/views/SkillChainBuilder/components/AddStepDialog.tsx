/**
 * AddStepDialog コンポーネント
 *
 * チェーンにステップを追加するためのダイアログ。
 * スキル名と基本的な入力マッピングを設定する。
 *
 * @module AddStepDialog
 */

import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";
import type { SkillChainStep } from "@repo/shared/types/skill-chain";
import { Button } from "../../../components/atoms/Button";
import { Icon } from "../../../components/atoms/Icon";

export interface AddStepDialogProps {
  /** ダイアログが開いているか */
  isOpen: boolean;
  /** 閉じるハンドラ */
  onClose: () => void;
  /** ステップ追加ハンドラ */
  onAdd: (step: SkillChainStep) => void;
}

/** AddStepDialog のスタイル定義 */
export const addStepDialogStyles = {
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
  actions: "flex justify-end gap-2 mt-6",
} as const;

/**
 * AddStepDialog コンポーネント
 */
export const AddStepDialog: React.FC<AddStepDialogProps> = memo(
  ({ isOpen, onClose, onAdd }) => {
    const [skillName, setSkillName] = useState("");
    const [timeout, setTimeout_] = useState("30000");

    const handleSubmit = useCallback(() => {
      const trimmedName = skillName.trim();
      if (!trimmedName) return;

      const step: SkillChainStep = {
        stepId: crypto.randomUUID(),
        skillName: trimmedName,
        inputMapping: {},
        timeout: parseInt(timeout, 10) || 30000,
      };

      onAdd(step);
      setSkillName("");
      setTimeout_("30000");
      onClose();
    }, [skillName, timeout, onAdd, onClose]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSubmit();
        }
        if (e.key === "Escape") {
          onClose();
        }
      },
      [handleSubmit, onClose],
    );

    if (!isOpen) return null;

    return (
      <div
        className={addStepDialogStyles.overlay}
        data-testid="add-step-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="ステップを追加"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className={addStepDialogStyles.dialog} onKeyDown={handleKeyDown}>
          <div className={addStepDialogStyles.header}>
            <h2 className={addStepDialogStyles.title}>ステップを追加</h2>
            <button
              type="button"
              className={addStepDialogStyles.closeButton}
              onClick={onClose}
              aria-label="閉じる"
            >
              <Icon name="x" size={20} />
            </button>
          </div>

          <div className={addStepDialogStyles.form}>
            <div>
              <label
                className={addStepDialogStyles.label}
                htmlFor="step-skill-name"
              >
                スキル名
              </label>
              <input
                id="step-skill-name"
                type="text"
                className={addStepDialogStyles.input}
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="実行するスキル名を入力"
                data-testid="step-skill-name-input"
                autoFocus
              />
            </div>

            <div>
              <label
                className={addStepDialogStyles.label}
                htmlFor="step-timeout"
              >
                タイムアウト (ms)
              </label>
              <input
                id="step-timeout"
                type="number"
                className={addStepDialogStyles.input}
                value={timeout}
                onChange={(e) => setTimeout_(e.target.value)}
                placeholder="30000"
                data-testid="step-timeout-input"
              />
            </div>
          </div>

          <div className={addStepDialogStyles.actions}>
            <Button variant="ghost" size="sm" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!skillName.trim()}
              data-testid="add-step-submit"
            >
              追加
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

AddStepDialog.displayName = "AddStepDialog";
