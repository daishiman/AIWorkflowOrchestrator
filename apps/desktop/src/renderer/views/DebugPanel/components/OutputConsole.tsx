/**
 * OutputConsole - 出力コンソール（Organism）
 *
 * デバッグセッション中のログ出力をリアルタイムで表示する。
 * テキスト一行ずつを即時 append し、自動スクロールする。
 *
 * @module OutputConsole
 */

import React, { memo, useEffect, useRef, useCallback } from "react";
import clsx from "clsx";
import type { DebugStep } from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";

export interface OutputConsoleProps {
  /** ステップ実行履歴（新着ステップを変換してログ表示） */
  steps: DebugStep[];
  /** 追加のログメッセージ（デバッグイベントなど） */
  logs?: ConsoleLog[];
  /** クリアボタンが押された時のコールバック */
  onClear?: () => void;
}

/** コンソールログエントリ */
export interface ConsoleLog {
  /** ログID（一意） */
  id: string;
  /** タイムスタンプ（ISO 8601） */
  timestamp: string;
  /** ログレベル */
  level: "info" | "warn" | "error" | "debug";
  /** ログメッセージ */
  message: string;
}

/** ログレベルに応じたスタイル */
const logLevelStyle: Record<ConsoleLog["level"], string> = {
  info: "text-[var(--text-primary)]",
  warn: "text-[var(--status-warning)]",
  error: "text-[var(--status-error)]",
  debug: "text-[var(--text-muted)]",
};

/** ログレベルに応じたプレフィックス */
const logLevelPrefix: Record<ConsoleLog["level"], string> = {
  info: "[INFO]",
  warn: "[WARN]",
  error: "[ERROR]",
  debug: "[DEBUG]",
};

/** DebugStep をコンソールログに変換 */
function stepToLog(step: DebugStep): ConsoleLog {
  const messages: Record<string, string> = {
    tool_call: `ツール呼び出し: ${step.toolName ?? "unknown"}`,
    hook_execution: `フック実行: ${step.hookType ?? "unknown"}`,
    agent_response: "エージェント応答",
  };

  return {
    id: `step-${step.stepNumber}-${step.timestamp}`,
    timestamp: step.timestamp,
    level: "info",
    message: `[Step ${step.stepNumber}] ${messages[step.type] ?? step.type}`,
  };
}

/** タイムスタンプを短い形式にフォーマット */
function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    const ms = String(d.getMilliseconds()).padStart(3, "0");
    return `${hh}:${mm}:${ss}.${ms}`;
  } catch {
    return "--:--:--.---";
  }
}

export const OutputConsole: React.FC<OutputConsoleProps> = memo(
  ({ steps, logs = [], onClear }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ステップをログに変換
    const stepLogs: ConsoleLog[] = steps.map(stepToLog);

    // 全ログをマージしてタイムスタンプでソート
    const allLogs = [...stepLogs, ...logs].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );

    // 新しいログが追加されたら自動スクロール
    useEffect(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [allLogs.length]);

    const handleClear = useCallback(() => {
      onClear?.();
    }, [onClear]);

    return (
      <div
        className={clsx(
          "flex flex-col h-full",
          "bg-[var(--bg-primary)]",
          "border border-[var(--border-primary)] rounded-lg",
        )}
        data-testid="output-console"
      >
        {/* ヘッダー */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2 shrink-0",
            "border-b border-[var(--border-primary)]",
          )}
        >
          <Icon
            name="chevron-right"
            size={14}
            className="text-[var(--text-muted)]"
          />
          <span className="text-xs font-medium text-[var(--text-secondary)] flex-1">
            出力
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            ({allLogs.length})
          </span>
          {onClear && allLogs.length > 0 && (
            <button
              onClick={handleClear}
              className={clsx(
                "p-1 rounded transition-colors duration-[var(--duration-default)]",
                "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]",
              )}
              aria-label="出力をクリア"
              data-testid="output-clear-btn"
            >
              <Icon name="trash-2" size={12} />
            </button>
          )}
        </div>

        {/* ログ表示エリア */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-3 py-2 font-mono"
          role="log"
          aria-label="デバッグ出力"
          aria-live="polite"
          data-testid="output-log-area"
        >
          {allLogs.length === 0 ? (
            <div
              className="flex items-center justify-center py-8 text-xs text-[var(--text-muted)]"
              data-testid="output-empty-state"
            >
              出力がありません
            </div>
          ) : (
            allLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 text-xs py-0.5 leading-relaxed"
                data-testid="output-log-entry"
              >
                {/* タイムスタンプ */}
                <span className="text-[var(--text-muted)] shrink-0 select-none">
                  {formatTimestamp(log.timestamp)}
                </span>
                {/* レベル */}
                <span
                  className={clsx(
                    "shrink-0 select-none",
                    logLevelStyle[log.level],
                  )}
                >
                  {logLevelPrefix[log.level]}
                </span>
                {/* メッセージ */}
                <span className={clsx("break-all", logLevelStyle[log.level])}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          {/* 自動スクロール用アンカー */}
          <div ref={bottomRef} data-testid="output-scroll-anchor" />
        </div>
      </div>
    );
  },
);

OutputConsole.displayName = "OutputConsole";
