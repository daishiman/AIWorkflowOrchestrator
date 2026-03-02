/**
 * DebugToolbar - デバッグ操作ツールバー（Molecule）
 *
 * デバッグコマンド（続行・ステップオーバー・ステップイン・ステップアウト・一時停止・停止）を
 * ボタンとして表示する。セッション状態に応じてボタンの有効/無効を切り替える。
 *
 * @module DebugToolbar
 */

import React, { memo, useCallback } from "react";
import clsx from "clsx";
import type {
  DebugSessionStatus,
  DebugCommand,
} from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";
import { Badge } from "../../../components/atoms/Badge";

export interface DebugToolbarProps {
  /** セッション状態 */
  status: DebugSessionStatus;
  /** スキル名（表示用） */
  skillName: string;
  /** コマンド実行ハンドラ */
  onCommand: (command: DebugCommand) => void;
  /** 停止確認ハンドラ（確認ダイアログ表示用） */
  onStop: () => void;
}

/** 状態に応じたBadgeバリアント */
const statusBadgeVariant: Record<
  DebugSessionStatus,
  "default" | "primary" | "success" | "warning" | "error"
> = {
  idle: "default",
  running: "primary",
  paused: "warning",
  completed: "success",
  error: "error",
};

/** 状態に応じたラベル */
const statusLabel: Record<DebugSessionStatus, string> = {
  idle: "待機中",
  running: "実行中",
  paused: "一時停止",
  completed: "完了",
  error: "エラー",
};

export const DebugToolbar: React.FC<DebugToolbarProps> = memo(
  ({ status, skillName, onCommand, onStop }) => {
    const isPaused = status === "paused";
    const isRunning = status === "running";
    const isActive = isPaused || isRunning;

    const handleContinue = useCallback(
      () => onCommand("continue"),
      [onCommand],
    );
    const handleStepOver = useCallback(
      () => onCommand("stepOver"),
      [onCommand],
    );
    const handleStepInto = useCallback(
      () => onCommand("stepInto"),
      [onCommand],
    );
    const handleStepOut = useCallback(() => onCommand("stepOut"), [onCommand]);
    const handlePause = useCallback(() => onCommand("pause"), [onCommand]);

    return (
      <div
        className={clsx(
          "flex items-center gap-2 px-4 py-2",
          "bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]",
        )}
        role="toolbar"
        aria-label="デバッグ操作"
        data-testid="debug-toolbar"
      >
        {/* セッション情報 */}
        <span
          className="text-sm font-medium text-[var(--text-primary)] mr-2 truncate max-w-[200px]"
          title={skillName}
        >
          {skillName}
        </span>
        <Badge variant={statusBadgeVariant[status]} size="sm">
          {statusLabel[status]}
        </Badge>

        <div className="mx-2 h-4 w-px bg-[var(--border-primary)]" />

        {/* 続行ボタン */}
        <button
          onClick={handleContinue}
          disabled={!isPaused}
          className={clsx(
            "p-1.5 rounded-md transition-colors duration-[var(--duration-default)]",
            isPaused
              ? "text-[var(--status-success)] hover:bg-[var(--bg-tertiary)]"
              : "text-[var(--text-muted)] cursor-not-allowed",
          )}
          aria-label="続行"
          title="続行 (F5)"
          data-testid="debug-continue-btn"
        >
          <Icon name="play" size={16} />
        </button>

        {/* 一時停止ボタン */}
        <button
          onClick={handlePause}
          disabled={!isRunning}
          className={clsx(
            "p-1.5 rounded-md transition-colors duration-[var(--duration-default)]",
            isRunning
              ? "text-[var(--status-warning)] hover:bg-[var(--bg-tertiary)]"
              : "text-[var(--text-muted)] cursor-not-allowed",
          )}
          aria-label="一時停止"
          title="一時停止 (F6)"
          data-testid="debug-pause-btn"
        >
          <Icon name="pause" size={16} />
        </button>

        {/* ステップオーバーボタン */}
        <button
          onClick={handleStepOver}
          disabled={!isPaused}
          className={clsx(
            "p-1.5 rounded-md transition-colors duration-[var(--duration-default)]",
            isPaused
              ? "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              : "text-[var(--text-muted)] cursor-not-allowed",
          )}
          aria-label="ステップオーバー"
          title="ステップオーバー (F10)"
          data-testid="debug-step-over-btn"
        >
          <Icon name="chevron-right" size={16} />
        </button>

        {/* ステップインボタン */}
        <button
          onClick={handleStepInto}
          disabled={!isPaused}
          className={clsx(
            "p-1.5 rounded-md transition-colors duration-[var(--duration-default)]",
            isPaused
              ? "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              : "text-[var(--text-muted)] cursor-not-allowed",
          )}
          aria-label="ステップイン"
          title="ステップイン (F11)"
          data-testid="debug-step-into-btn"
        >
          <Icon name="chevron-down" size={16} />
        </button>

        {/* ステップアウトボタン */}
        <button
          onClick={handleStepOut}
          disabled={!isPaused}
          className={clsx(
            "p-1.5 rounded-md transition-colors duration-[var(--duration-default)]",
            isPaused
              ? "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              : "text-[var(--text-muted)] cursor-not-allowed",
          )}
          aria-label="ステップアウト"
          title="ステップアウト (Shift+F11)"
          data-testid="debug-step-out-btn"
        >
          <Icon name="chevron-up" size={16} />
        </button>

        <div className="mx-2 h-4 w-px bg-[var(--border-primary)]" />

        {/* 停止ボタン */}
        <button
          onClick={onStop}
          disabled={!isActive}
          className={clsx(
            "p-1.5 rounded-md transition-colors duration-[var(--duration-default)]",
            isActive
              ? "text-[var(--status-error)] hover:bg-[var(--bg-tertiary)]"
              : "text-[var(--text-muted)] cursor-not-allowed",
          )}
          aria-label="停止"
          title="停止 (Shift+F5)"
          data-testid="debug-stop-btn"
        >
          <Icon name="x-circle" size={16} />
        </button>
      </div>
    );
  },
);

DebugToolbar.displayName = "DebugToolbar";
