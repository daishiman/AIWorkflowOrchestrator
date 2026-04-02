/**
 * GovernanceSummaryPanel - Governance 状態表示コンポーネント
 * UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001
 *
 * IPC ポーリングで SkillCreatorGovernanceState を取得し、
 * denial reason / recent denials / session summary を renderer に表示する。
 * Props なし（自己完結型）。
 */
import React, { useState, useEffect } from "react";
import type { SkillCreatorGovernanceState } from "@repo/shared/types";

const POLL_INTERVAL_MS = 5_000;
const GOVERNANCE_FALLBACK_ERROR =
  "Governance API が利用できません。preload 連携を確認してください。";

export const GovernanceSummaryPanel: React.FC = () => {
  const [state, setState] = useState<SkillCreatorGovernanceState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchState = async () => {
      const getGovernanceState =
        window.electronAPI?.skillCreator?.getGovernanceState;
      if (typeof getGovernanceState !== "function") {
        setError(GOVERNANCE_FALLBACK_ERROR);
        return;
      }

      try {
        const result = await getGovernanceState();
        if (result.success && result.data) {
          setState(result.data);
          setError(null);
        } else {
          setError(result.error ?? "取得失敗");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "取得失敗");
      }
    };

    fetchState();
    const id = setInterval(fetchState, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  if (error) {
    return (
      <div data-testid="governance-panel" className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-[var(--text-secondary)]">
          Governance 状態
        </h4>
        <div
          data-testid="governance-error"
          className="rounded-xl border border-[var(--status-error)]/20 bg-[var(--status-error)]/10 p-3 text-xs text-[var(--status-error)]"
        >
          取得エラー: {error}
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div data-testid="governance-panel" className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-[var(--text-secondary)]">
          Governance 状態
        </h4>
        <div
          data-testid="governance-loading"
          className="animate-pulse rounded-xl bg-[var(--bg-tertiary)] p-3 text-xs text-[var(--text-secondary)]"
        >
          読み込み中...
        </div>
      </div>
    );
  }

  const denials = state.recentDenials.slice(0, 5);

  return (
    <div data-testid="governance-panel" className="mt-6 space-y-3">
      <h4 className="text-sm font-medium text-[var(--text-secondary)]">
        Governance 状態
      </h4>

      <div className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-tertiary)] p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)]">フェーズ</span>
          <span
            data-testid="governance-phase"
            className="font-mono text-[var(--text-primary)] font-medium"
          >
            {state.phase}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)]">許可モード</span>
          <span
            data-testid="governance-permission-mode"
            className="font-mono text-[var(--text-primary)]"
          >
            {state.activePolicy.permissionMode}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)]">
            セッションイベント
          </span>
          <span
            data-testid="governance-session-summary"
            className="text-[var(--text-primary)]"
          >
            {state.recentAuditEvents.length} 件
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-xs text-[var(--text-secondary)]">最近の拒否</span>
        {denials.length === 0 ? (
          <div
            data-testid="governance-no-denials"
            className="text-xs text-[var(--text-secondary)] italic"
          >
            No recent denials
          </div>
        ) : (
          <ul data-testid="governance-denials" className="space-y-1">
            {denials.map((denial, idx) => (
              <li
                key={`${denial.toolName ?? "unknown"}:${denial.reason ?? "no-reason"}:${idx}`}
                className="rounded border border-[var(--status-error)]/20 bg-[var(--status-error)]/5 px-2 py-1 text-xs text-[var(--status-error)]"
              >
                <span className="font-mono font-medium">
                  {denial.toolName ?? "unknown"}
                </span>
                {denial.reason && (
                  <span className="ml-1 text-[var(--text-secondary)]">
                    — {denial.reason}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

GovernanceSummaryPanel.displayName = "GovernanceSummaryPanel";
