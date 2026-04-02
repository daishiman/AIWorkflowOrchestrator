import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import type { SkillCreatorGovernanceState } from "@repo/shared/types";
import { GlassPanel } from "../GlassPanel";

type GovernanceFetchResult = {
  success: boolean;
  data?: SkillCreatorGovernanceState;
  error?: string;
};

type SkillCreatorGovernanceApi = {
  getGovernanceState?: () => Promise<GovernanceFetchResult>;
};

type GovernanceStatus = "loading" | "ready" | "error";

function getGovernanceApi(): SkillCreatorGovernanceApi | undefined {
  return (
    window as Window & {
      electronAPI?: { skillCreator?: SkillCreatorGovernanceApi };
    }
  ).electronAPI?.skillCreator;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }
  return "Governance 状態の取得に失敗しました";
}

function GovernanceSkeleton(): React.ReactElement {
  return (
    <div
      data-testid="governance-loading"
      aria-busy="true"
      className="space-y-3 animate-pulse"
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 text-[var(--text-tertiary)]" />
        <div className="h-5 w-44 rounded-full bg-[var(--bg-tertiary)]" />
      </div>
      <div className="h-4 w-64 rounded-full bg-[var(--bg-tertiary)]" />
      <div className="grid gap-2">
        <div className="h-12 rounded-2xl bg-[var(--bg-tertiary)]" />
        <div className="h-12 rounded-2xl bg-[var(--bg-tertiary)]" />
      </div>
    </div>
  );
}

function GovernanceError({ message }: { message: string }): React.ReactElement {
  return (
    <div
      data-testid="governance-error"
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-[var(--status-error)]/20 bg-[var(--status-error)]/10 p-4"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--status-error)]" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          governance state を取得できません
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{message}</p>
      </div>
    </div>
  );
}

export const GovernanceSummaryPanel: React.FC = () => {
  const [status, setStatus] = useState<GovernanceStatus>("loading");
  const [state, setState] = useState<SkillCreatorGovernanceState | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const hasSnapshotRef = useRef(false);
  const mountedRef = useRef(true);
  const requestTokenRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    const loadGovernanceState = async () => {
      const requestToken = ++requestTokenRef.current;
      const api = getGovernanceApi();

      if (!api?.getGovernanceState) {
        if (!mountedRef.current || requestToken !== requestTokenRef.current) {
          return;
        }
        if (hasSnapshotRef.current) {
          setStatus("ready");
          setErrorMessage(
            "window.electronAPI.skillCreator.getGovernanceState が利用できません",
          );
          return;
        }

        setStatus("loading");
        setErrorMessage("");
        return;
      }

      if (!hasSnapshotRef.current) {
        setStatus("loading");
      }

      try {
        const response = await api.getGovernanceState();
        if (!mountedRef.current || requestToken !== requestTokenRef.current) {
          return;
        }
        if (!response.success || !response.data) {
          throw new Error(
            response.error || "Governance state の取得に失敗しました",
          );
        }

        hasSnapshotRef.current = true;
        setState(response.data);
        setStatus("ready");
        setErrorMessage("");
      } catch (error) {
        if (!mountedRef.current || requestToken !== requestTokenRef.current) {
          return;
        }

        const message = toErrorMessage(error);
        if (hasSnapshotRef.current) {
          setStatus("ready");
          setErrorMessage(message);
          return;
        }

        setStatus("error");
        setErrorMessage(message);
      }
    };

    void loadGovernanceState();
    const intervalId = window.setInterval(() => {
      void loadGovernanceState();
    }, 5000);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (status === "loading" && !state) {
    return (
      <GlassPanel className="p-4">
        <GovernanceSkeleton />
      </GlassPanel>
    );
  }

  if (status === "error" && !state) {
    return (
      <GlassPanel className="p-4">
        <GovernanceError message={errorMessage} />
      </GlassPanel>
    );
  }

  if (!state) {
    return (
      <GlassPanel className="p-4">
        <GovernanceSkeleton />
      </GlassPanel>
    );
  }

  const displayedDenials = state.recentDenials.slice(0, 5);
  const auditEventCount = state.recentAuditEvents.length;

  return (
    <GlassPanel className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--status-primary)]/10 text-[var(--status-primary)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Governance summary
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              phase / permission / recent denials
            </p>
          </div>
        </div>
        <div className="rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
          5件上限
        </div>
      </div>

      {errorMessage && (
        <div
          data-testid="governance-error"
          role="status"
          className="mt-4 rounded-2xl border border-[var(--status-warning)]/20 bg-[var(--status-warning)]/10 px-4 py-3 text-sm text-[var(--text-secondary)]"
        >
          {errorMessage}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Phase
          </p>
          <p
            data-testid="governance-phase"
            className="mt-1 text-base font-semibold text-[var(--text-primary)]"
          >
            {state.phase}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
            Permission
          </p>
          <p
            data-testid="governance-permission-mode"
            className="mt-1 text-base font-semibold text-[var(--text-primary)]"
          >
            {state.activePolicy.permissionMode}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3">
        <p
          data-testid="governance-session-summary"
          className="text-sm text-[var(--text-secondary)]"
        >
          監査イベント {auditEventCount} 件 / 直近の拒否{" "}
          {state.recentDenials.length}件
        </p>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
          Recent denials
        </div>
        {displayedDenials.length === 0 ? (
          <div
            data-testid="governance-no-denials"
            className="rounded-2xl border border-dashed border-[var(--border-primary)] px-4 py-3 text-sm text-[var(--text-secondary)]"
          >
            最近の拒否はありません
          </div>
        ) : (
          <ul className="space-y-2">
            {displayedDenials.map((denial, index) => (
              <li
                key={`${denial.toolName ?? "unknown"}-${index}`}
                data-testid={`governance-denial-${index}`}
                className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {denial.toolName ?? "unknown"}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    denied
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {denial.reason}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GlassPanel>
  );
};

GovernanceSummaryPanel.displayName = "GovernanceSummaryPanel";
