/**
 * BreakpointEditor - ブレークポイント管理エディタ（Organism）
 *
 * ブレークポイントの追加・削除・有効/無効トグルを提供する。
 * `skill:debug:breakpoint:add` / `skill:debug:breakpoint:remove` IPC チャネルを使用。
 *
 * @module BreakpointEditor
 */

import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";
import type {
  Breakpoint,
  BreakpointType,
} from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";
import { BreakpointRow } from "./BreakpointRow";

export interface BreakpointEditorProps {
  /** セッションID（null時は操作無効） */
  sessionId: string | null;
  /** 現在のブレークポイント一覧 */
  breakpoints: Breakpoint[];
  /** ブレークポイント追加後のコールバック（追加されたブレークポイントを受け取る） */
  onBreakpointAdded: (breakpoint: Breakpoint) => void;
  /** ブレークポイント削除後のコールバック（削除されたIDを受け取る） */
  onBreakpointRemoved: (breakpointId: string) => void;
  /** ブレークポイントトグル後のコールバック（IDと新しい状態を受け取る） */
  onBreakpointToggled: (breakpointId: string, enabled: boolean) => void;
}

export const BreakpointEditor: React.FC<BreakpointEditorProps> = memo(
  ({
    sessionId,
    breakpoints,
    onBreakpointAdded,
    onBreakpointRemoved,
    onBreakpointToggled,
  }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newType, setNewType] = useState<BreakpointType>("tool");
    const [newTarget, setNewTarget] = useState("");
    const [newCondition, setNewCondition] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isDisabled = !sessionId;

    const handleShowAddForm = useCallback(() => {
      setIsAdding(true);
      setError(null);
    }, []);

    const handleCancelAdd = useCallback(() => {
      setIsAdding(false);
      setNewTarget("");
      setNewCondition("");
      setNewType("tool");
      setError(null);
    }, []);

    const handleTypeChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewType(e.target.value as BreakpointType);
        setNewTarget("");
      },
      [],
    );

    const handleTargetChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTarget(e.target.value);
      },
      [],
    );

    const handleConditionChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCondition(e.target.value);
      },
      [],
    );

    const handleAdd = useCallback(async () => {
      if (!sessionId || !newTarget.trim()) return;

      setIsSubmitting(true);
      setError(null);
      try {
        const breakpointData: Omit<Breakpoint, "id"> = {
          type: newType,
          enabled: true,
          ...(newCondition.trim() ? { condition: newCondition.trim() } : {}),
          ...(newType === "tool" ? { toolName: newTarget.trim() } : {}),
          ...(newType === "hook"
            ? {
                hookType: newTarget.trim() as "PreToolUse" | "PostToolUse",
              }
            : {}),
        };

        const added = await window.electronAPI.skill.debug.addBreakpoint({
          sessionId,
          breakpoint: breakpointData,
        });
        onBreakpointAdded(added);
        handleCancelAdd();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "ブレークポイントの追加に失敗しました",
        );
      } finally {
        setIsSubmitting(false);
      }
    }, [
      sessionId,
      newType,
      newTarget,
      newCondition,
      onBreakpointAdded,
      handleCancelAdd,
    ]);

    const handleRemove = useCallback(
      async (breakpointId: string) => {
        if (!sessionId) return;
        try {
          await window.electronAPI.skill.debug.removeBreakpoint({
            sessionId,
            breakpointId,
          });
          onBreakpointRemoved(breakpointId);
        } catch {
          // 削除失敗時はサイレント（UIを継続）
        }
      },
      [sessionId, onBreakpointRemoved],
    );

    const handleToggle = useCallback(
      (breakpointId: string, enabled: boolean) => {
        onBreakpointToggled(breakpointId, enabled);
      },
      [onBreakpointToggled],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleAdd();
        } else if (e.key === "Escape") {
          handleCancelAdd();
        }
      },
      [handleAdd, handleCancelAdd],
    );

    const targetPlaceholder =
      newType === "tool"
        ? "ツール名（例: Bash）"
        : newType === "hook"
          ? "フックタイプ（PreToolUse / PostToolUse）"
          : "ステップ条件";

    return (
      <div
        className={clsx(
          "flex flex-col",
          "bg-[var(--bg-primary)]",
          "border border-[var(--border-primary)] rounded-lg",
        )}
        data-testid="breakpoint-editor"
      >
        {/* ヘッダー */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2",
            "border-b border-[var(--border-primary)]",
          )}
        >
          <Icon
            name="map-pin"
            size={14}
            className="text-[var(--status-error)]"
          />
          <span className="text-xs font-medium text-[var(--text-secondary)] flex-1">
            ブレークポイント
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            ({breakpoints.length})
          </span>
          {/* 追加ボタン */}
          {!isAdding && (
            <button
              onClick={handleShowAddForm}
              disabled={isDisabled}
              className={clsx(
                "p-1 rounded transition-colors duration-[var(--duration-default)]",
                isDisabled
                  ? "text-[var(--text-muted)] cursor-not-allowed"
                  : "text-[var(--text-secondary)] hover:text-[var(--status-primary)] hover:bg-[var(--bg-tertiary)]",
              )}
              aria-label="ブレークポイントを追加"
              data-testid="breakpoint-add-btn"
            >
              <Icon name="plus" size={14} />
            </button>
          )}
        </div>

        {/* ブレークポイント一覧 */}
        <div
          className="flex-1 overflow-y-auto max-h-40"
          role="list"
          aria-label="ブレークポイント一覧"
        >
          {breakpoints.length === 0 && !isAdding ? (
            <div
              className="flex items-center justify-center py-4 text-xs text-[var(--text-muted)]"
              data-testid="breakpoint-empty-state"
            >
              ブレークポイントがありません
            </div>
          ) : (
            breakpoints.map((bp) => (
              <BreakpointRow
                key={bp.id}
                breakpoint={bp}
                onToggle={handleToggle}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>

        {/* 追加フォーム */}
        {isAdding && (
          <div
            className={clsx(
              "px-3 py-2 border-t border-[var(--border-primary)]",
              "bg-[var(--bg-secondary)]",
            )}
            data-testid="breakpoint-add-form"
          >
            {/* タイプ選択 */}
            <div className="flex items-center gap-2 mb-2">
              <label className="text-[10px] text-[var(--text-muted)] shrink-0">
                タイプ:
              </label>
              <select
                value={newType}
                onChange={handleTypeChange}
                className={clsx(
                  "flex-1 text-xs px-2 py-1 rounded",
                  "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
                  "text-[var(--text-primary)]",
                  "focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)]",
                )}
                aria-label="ブレークポイントタイプ"
                data-testid="breakpoint-type-select"
              >
                <option value="tool">ツール</option>
                <option value="hook">フック</option>
                <option value="step">ステップ</option>
              </select>
            </div>

            {/* ターゲット入力 */}
            <input
              type="text"
              value={newTarget}
              onChange={handleTargetChange}
              onKeyDown={handleKeyDown}
              placeholder={targetPlaceholder}
              className={clsx(
                "w-full text-xs px-2 py-1 rounded mb-2",
                "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
                "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                "focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)]",
              )}
              aria-label="ブレークポイントターゲット"
              data-testid="breakpoint-target-input"
              autoFocus
            />

            {/* 条件入力（任意） */}
            <input
              type="text"
              value={newCondition}
              onChange={handleConditionChange}
              onKeyDown={handleKeyDown}
              placeholder="条件式（任意、例: input.length > 10）"
              className={clsx(
                "w-full text-xs px-2 py-1 rounded mb-2",
                "bg-[var(--bg-primary)] border border-[var(--border-primary)]",
                "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
                "focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)]",
              )}
              aria-label="ブレークポイント条件式"
              data-testid="breakpoint-condition-input"
            />

            {/* エラー表示 */}
            {error && (
              <div
                className="text-xs text-[var(--status-error)] mb-2"
                role="alert"
                data-testid="breakpoint-error"
              >
                {error}
              </div>
            )}

            {/* ボタン群 */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelAdd}
                className={clsx(
                  "px-2 py-1 text-xs rounded",
                  "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
                  "transition-colors duration-[var(--duration-default)]",
                )}
                data-testid="breakpoint-cancel-btn"
              >
                キャンセル
              </button>
              <button
                onClick={handleAdd}
                disabled={isSubmitting || !newTarget.trim()}
                className={clsx(
                  "px-2 py-1 text-xs rounded",
                  "transition-colors duration-[var(--duration-default)]",
                  isSubmitting || !newTarget.trim()
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                    : "bg-[var(--status-primary)] text-white hover:opacity-90",
                )}
                data-testid="breakpoint-submit-btn"
              >
                {isSubmitting ? "追加中..." : "追加"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

BreakpointEditor.displayName = "BreakpointEditor";
