/**
 * EvaluateConsole - 式評価コンソール（Organism）
 *
 * REPL風のコンソールで式を入力して結果を表示する。
 *
 * @module EvaluateConsole
 */

import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";
import type { DebugEvaluateResponse } from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";

export interface EvaluateConsoleProps {
  /** セッションID（null時は入力無効） */
  sessionId: string | null;
  /** 式評価ハンドラ */
  onEvaluate: (expression: string) => Promise<DebugEvaluateResponse | null>;
}

interface ConsoleEntry {
  expression: string;
  result?: unknown;
  type?: string;
  error?: string;
}

export const EvaluateConsole: React.FC<EvaluateConsoleProps> = memo(
  ({ sessionId, onEvaluate }) => {
    const [expression, setExpression] = useState("");
    const [history, setHistory] = useState<ConsoleEntry[]>([]);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpression(e.target.value);
      },
      [],
    );

    const handleEvaluate = useCallback(async () => {
      const trimmed = expression.trim();
      if (!trimmed || !sessionId) return;

      setIsEvaluating(true);
      try {
        const response = await onEvaluate(trimmed);
        setHistory((prev) => [
          ...prev,
          {
            expression: trimmed,
            result: response?.result,
            type: response?.type,
          },
        ]);
      } catch (err) {
        setHistory((prev) => [
          ...prev,
          {
            expression: trimmed,
            error: err instanceof Error ? err.message : "評価に失敗しました",
          },
        ]);
      } finally {
        setExpression("");
        setIsEvaluating(false);
      }
    }, [expression, sessionId, onEvaluate]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleEvaluate();
        }
      },
      [handleEvaluate],
    );

    const isDisabled = !sessionId;

    return (
      <div
        className={clsx(
          "flex flex-col",
          "bg-[var(--bg-primary)]",
          "border border-[var(--border-primary)] rounded-lg",
        )}
        data-testid="evaluate-console"
      >
        {/* ヘッダー */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2",
            "border-b border-[var(--border-primary)]",
          )}
        >
          <Icon
            name="chevron-right"
            size={14}
            className="text-[var(--text-muted)]"
          />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            式評価
          </span>
        </div>

        {/* 履歴表示 */}
        {history.length > 0 && (
          <div
            className="max-h-40 overflow-y-auto px-3 py-2 space-y-2"
            data-testid="evaluate-history"
          >
            {history.map((entry, index) => (
              <div key={index} className="text-xs font-mono">
                <div className="text-[var(--text-muted)]">
                  &gt; {entry.expression}
                </div>
                {entry.error ? (
                  <div className="text-[var(--status-error)] pl-2">
                    {entry.error}
                  </div>
                ) : (
                  <div className="text-[var(--text-primary)] pl-2">
                    {JSON.stringify(entry.result)}
                    {entry.type && (
                      <span className="text-[var(--text-muted)] ml-2">
                        ({entry.type})
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 入力エリア */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2",
            "border-t border-[var(--border-primary)]",
          )}
        >
          <span className="text-xs text-[var(--text-muted)] font-mono">
            &gt;
          </span>
          <input
            type="text"
            value={expression}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isDisabled ? "セッションがありません" : "式を入力..."}
            disabled={isDisabled || isEvaluating}
            className={clsx(
              "flex-1 bg-transparent text-xs font-mono",
              "text-[var(--text-primary)] placeholder-[var(--text-muted)]",
              "focus:outline-none",
              isDisabled && "opacity-50 cursor-not-allowed",
            )}
            aria-label="式評価入力"
            data-testid="evaluate-input"
          />
          <button
            onClick={handleEvaluate}
            disabled={isDisabled || isEvaluating || !expression.trim()}
            className={clsx(
              "p-1 rounded transition-colors duration-[var(--duration-default)]",
              isDisabled || isEvaluating || !expression.trim()
                ? "text-[var(--text-muted)] cursor-not-allowed"
                : "text-[var(--status-primary)] hover:bg-[var(--bg-tertiary)]",
            )}
            aria-label="式を評価"
            data-testid="evaluate-submit-btn"
          >
            <Icon name="play" size={12} />
          </button>
        </div>
      </div>
    );
  },
);

EvaluateConsole.displayName = "EvaluateConsole";
