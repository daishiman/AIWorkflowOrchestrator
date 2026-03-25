/**
 * AdvancedConsolePanel - opt-in raw terminal パネル
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * Layer 3（Detail Surface）に属する opt-in コンポーネント。
 * - isOpen=false がデフォルト (FR-4b)
 * - 「高度な表示」toggle は secondary CTA (CTA-R2)
 * - running / done / aborted state で read-only モード (R-M3)
 * - copy command に API key を含まない (DENY-6)
 */

import React, { useCallback, useRef, useEffect } from "react";

export type SessionState =
  | "collapsed"
  | "ready"
  | "handoff"
  | "running"
  | "done"
  | "aborted"
  | "unavailable"
  | "guidance-only";

export interface AdvancedConsolePanelProps {
  /** パネル表示状態 */
  isOpen: boolean;
  /** toggle コールバック */
  onToggle: () => void;
  /** raw terminal ログ */
  terminalOutput: string[];
  /** copy command（API key 非含有保証済み） */
  copyCommand?: string;
  /** 現在の session state */
  sessionState: SessionState;
}

/** read-only になる state の集合 */
const READ_ONLY_STATES: ReadonlySet<SessionState> = new Set([
  "running",
  "done",
  "aborted",
]);

/** パネルを表示不可にする state の集合 */
const HIDDEN_STATES: ReadonlySet<SessionState> = new Set([
  "collapsed",
  "unavailable",
  "guidance-only",
]);

export const AdvancedConsolePanel: React.FC<AdvancedConsolePanelProps> = ({
  isOpen,
  onToggle,
  terminalOutput,
  copyCommand,
  sessionState,
}) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const isReadOnly = READ_ONLY_STATES.has(sessionState);

  // ログ追加時に自動スクロール
  useEffect(() => {
    if (isOpen && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalOutput.length, isOpen]);

  const handleCopyCommand = useCallback(() => {
    if (copyCommand) {
      navigator.clipboard.writeText(copyCommand);
    }
  }, [copyCommand]);

  // GATE: collapsed / unavailable / guidance-only では toggle CTA ごと非表示
  if (HIDDEN_STATES.has(sessionState)) {
    return null;
  }

  return (
    <div data-testid="advanced-console-container">
      {/* Toggle CTA — secondary 配置 (CTA-R2) */}
      <button
        type="button"
        onClick={onToggle}
        className="mt-2 rounded px-3 py-1 text-xs text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
        data-testid="advanced-console-toggle"
        aria-expanded={isOpen}
        aria-controls="advanced-console-panel"
      >
        {isOpen ? "高度な表示を閉じる" : "高度な表示"}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          id="advanced-console-panel"
          className="mt-2 rounded-md border border-[var(--border-secondary)] bg-[var(--bg-tertiary)]"
          data-testid="advanced-console-panel"
          role="region"
          aria-label="高度な表示パネル"
        >
          {/* Terminal output */}
          <div className="max-h-64 overflow-y-auto p-3 font-mono text-xs text-[var(--text-secondary)]">
            {terminalOutput.length === 0 ? (
              <p className="text-[var(--text-tertiary)]">ログなし</p>
            ) : (
              terminalOutput.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-all">
                  {line}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>

          {/* Copy command（Tertiary CTA — パネル内に閉じている: CTA-R5） */}
          {copyCommand && (
            <div className="border-t border-[var(--border-secondary)] px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <code className="flex-1 truncate text-xs text-[var(--text-secondary)]">
                  {copyCommand}
                </code>
                <button
                  type="button"
                  onClick={handleCopyCommand}
                  disabled={isReadOnly}
                  className="shrink-0 rounded px-2 py-1 text-xs text-[var(--text-link)] hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid="advanced-console-copy"
                  aria-label="コマンドをコピー"
                >
                  コピー
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
