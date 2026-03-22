import React from "react";
import clsx from "clsx";
import { Button, Icon } from "../../components/atoms";
import type { MainlineExecutionAccessState } from "../../features/mainline-access/mainlineAccess";

export interface MainlineAccessMatrixSectionProps {
  access: MainlineExecutionAccessState;
  onAction?: (action: string) => void | Promise<void>;
}

const capabilityCopy: Record<
  MainlineExecutionAccessState["capability"],
  {
    title: string;
    description: string;
    icon: "zap" | "monitor" | "check-circle" | "alert-circle";
  }
> = {
  integratedRuntime: {
    title: "統合ランタイム利用可能",
    description: "アプリ内から AI 実行レーンへ直接進めます。",
    icon: "zap",
  },
  terminalSurface: {
    title: "ターミナル利用可能",
    description: "手元の terminal handoff で実行を継続できます。",
    icon: "monitor",
  },
  both: {
    title: "全機能利用可能",
    description: "アプリ内実行と terminal handoff の両方を選べます。",
    icon: "check-circle",
  },
  none: {
    title: "設定が必要",
    description: "認証情報を追加して実行レーンを有効化してください。",
    icon: "alert-circle",
  },
};

const healthCopy: Record<
  NonNullable<MainlineExecutionAccessState["healthStatus"]>,
  { label: string; dotClassName: string }
> = {
  connected: {
    label: "接続済み",
    dotClassName: "bg-[var(--status-success)]",
  },
  disconnected: {
    label: "未接続",
    dotClassName: "bg-[var(--text-tertiary)]",
  },
  error: {
    label: "エラー",
    dotClassName: "bg-[var(--status-error)]",
  },
};

function CapabilityCard({
  access,
  onAction,
}: MainlineAccessMatrixSectionProps): JSX.Element {
  const copy = capabilityCopy[access.capability];
  const shouldShowActions = access.isAuthenticated;

  return (
    <article
      className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5"
      data-testid="mainline-capability-card"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[var(--bg-tertiary)] p-2">
          <Icon
            name={copy.icon}
            size={18}
            className="text-[var(--text-primary)]"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
              Mainline Access
            </p>
            <h3
              className="text-base font-semibold text-[var(--text-primary)]"
              data-testid="mainline-capability-title"
            >
              {copy.title}
            </h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {copy.description}
          </p>
          {access.blockedInfo ? (
            <p className="text-sm text-[var(--status-warning)]">
              {access.blockedInfo.blockedReason}
            </p>
          ) : null}
          {!shouldShowActions ? (
            <p
              className="text-sm text-[var(--text-secondary)]"
              data-testid="mainline-guidance-only"
            >
              認証が必要です。設定確認までは続行できますが、実行系 CTA
              は表示しません。
            </p>
          ) : null}
        </div>
      </div>

      {access.isLoading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="h-10 animate-pulse rounded-lg bg-[var(--bg-tertiary)]" />
          <div className="h-10 animate-pulse rounded-lg bg-[var(--bg-tertiary)]" />
        </div>
      ) : shouldShowActions ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {access.ctaContract.primary ? (
            <Button
              onClick={() =>
                void onAction?.(access.ctaContract.primary!.action)
              }
              data-testid="mainline-primary-cta"
            >
              {access.ctaContract.primary.label}
            </Button>
          ) : null}
          <Button
            variant="secondary"
            onClick={() => void onAction?.(access.ctaContract.secondary.action)}
            data-testid="mainline-secondary-cta"
          >
            {access.ctaContract.secondary.label}
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function HealthStatusRow({
  access,
  onAction,
}: MainlineAccessMatrixSectionProps): JSX.Element {
  const health = access.healthStatus;
  const copy = health ? healthCopy[health] : null;
  const providerLabel = access.selectedProviderName ?? "未選択";

  return (
    <article
      className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4"
      data-testid="mainline-health-row"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={clsx(
              "h-3 w-3 rounded-full",
              copy?.dotClassName ?? "bg-[var(--border-primary)]",
            )}
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Provider Health
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              {providerLabel}
              {copy ? ` / ${copy.label}` : " / provider を選択してください"}
            </p>
          </div>
        </div>
        {health === "disconnected" ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void onAction?.("refreshHealth")}
          >
            再確認
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function ProviderSummaryCard({
  access,
}: MainlineAccessMatrixSectionProps): JSX.Element {
  const hasSelection =
    typeof access.selectedProviderName === "string" &&
    access.selectedProviderName.trim().length > 0;

  return (
    <article
      className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-4"
      data-testid="mainline-provider-summary"
    >
      <p className="text-sm font-medium text-[var(--text-primary)]">
        Selected Configuration
      </p>
      {hasSelection ? (
        <div className="mt-2 text-sm text-[var(--text-secondary)]">
          <p>{access.selectedProviderName}</p>
          <p>{access.selectedModelName ?? "モデル未選択"}</p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          provider / model はまだ未選択です。暗黙 fallback
          は行わず、明示的な選択を待ちます。
        </p>
      )}
    </article>
  );
}

export function MainlineAccessMatrixSection({
  access,
  onAction,
}: MainlineAccessMatrixSectionProps): JSX.Element {
  return (
    <div className="space-y-4" data-testid="mainline-access-matrix">
      <CapabilityCard access={access} onAction={onAction} />
      <div className="grid gap-4 lg:grid-cols-2">
        <HealthStatusRow access={access} onAction={onAction} />
        <ProviderSummaryCard access={access} onAction={onAction} />
      </div>
    </div>
  );
}
