/**
 * VariableEditor コンポーネント
 *
 * チェーンの変数定義を編集するUI。
 * キーと値のペアを追加・編集・削除できる。
 *
 * @module VariableEditor
 */

import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";
import { Button } from "../../../components/atoms/Button";

export interface VariableEditorProps {
  /** 変数オブジェクト */
  variables: Record<string, unknown>;
  /** 変数更新ハンドラ */
  onUpdate: (key: string, value: unknown) => void;
  /** 変数削除ハンドラ */
  onRemove: (key: string) => void;
}

/** VariableEditor のスタイル定義 */
export const variableEditorStyles = {
  container: "space-y-2",
  row: clsx(
    "flex items-center gap-2 p-2 rounded-lg",
    "bg-[var(--bg-secondary)]",
  ),
  keyInput: clsx(
    "flex-1 px-2 py-1 rounded text-sm",
    "bg-[var(--bg-tertiary)] border border-[var(--border-primary)]",
    "text-[var(--text-primary)]",
    "focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)]",
  ),
  valueInput: clsx(
    "flex-2 px-2 py-1 rounded text-sm",
    "bg-[var(--bg-tertiary)] border border-[var(--border-primary)]",
    "text-[var(--text-primary)]",
    "focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)]",
  ),
  deleteButton: clsx(
    "p-1 rounded",
    "text-[var(--text-muted)] hover:text-[var(--status-error)]",
    "transition-colors duration-[var(--duration-quick)]",
  ),
  addRow: "flex items-center gap-2 mt-2",
  emptyMessage: "text-sm text-[var(--text-muted)] py-4 text-center",
} as const;

/**
 * VariableEditor コンポーネント
 */
export const VariableEditor: React.FC<VariableEditorProps> = memo(
  ({ variables, onUpdate, onRemove }) => {
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");

    const entries = Object.entries(variables);

    const handleAdd = useCallback(() => {
      const trimmedKey = newKey.trim();
      if (trimmedKey) {
        onUpdate(trimmedKey, newValue);
        setNewKey("");
        setNewValue("");
      }
    }, [newKey, newValue, onUpdate]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          handleAdd();
        }
      },
      [handleAdd],
    );

    return (
      <div data-testid="variable-editor">
        <div className={variableEditorStyles.container}>
          {entries.length === 0 && (
            <p className={variableEditorStyles.emptyMessage}>
              変数が定義されていません
            </p>
          )}
          {entries.map(([key, value]) => (
            <div
              key={key}
              className={variableEditorStyles.row}
              data-testid={`variable-row-${key}`}
            >
              <span className="text-sm text-[var(--text-primary)] font-mono min-w-[80px]">
                {key}
              </span>
              <span className="text-[var(--text-muted)]">=</span>
              <input
                type="text"
                className={variableEditorStyles.valueInput}
                value={String(value ?? "")}
                onChange={(e) => onUpdate(key, e.target.value)}
                aria-label={`変数 ${key} の値`}
              />
              <button
                type="button"
                className={variableEditorStyles.deleteButton}
                onClick={() => onRemove(key)}
                aria-label={`変数 ${key} を削除`}
              >
                <Icon name="x" size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* 新規変数追加 */}
        <div className={variableEditorStyles.addRow}>
          <input
            type="text"
            className={variableEditorStyles.keyInput}
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="変数名"
            aria-label="新しい変数名"
            data-testid="new-variable-key"
          />
          <input
            type="text"
            className={variableEditorStyles.valueInput}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="値"
            aria-label="新しい変数の値"
            data-testid="new-variable-value"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAdd}
            leftIcon="plus"
            data-testid="add-variable-button"
          >
            追加
          </Button>
        </div>
      </div>
    );
  },
);

VariableEditor.displayName = "VariableEditor";
