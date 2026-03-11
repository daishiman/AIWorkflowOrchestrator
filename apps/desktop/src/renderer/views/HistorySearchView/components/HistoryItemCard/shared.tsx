import clsx from "clsx";
import type { HistoryItem } from "@repo/shared/types";
import { Icon, type IconName } from "../../../../components/atoms/Icon";

const TIME_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return TIME_FORMATTER.format(date);
}

interface HistoryCardShellProps {
  item: HistoryItem;
  expanded: boolean;
  iconName: IconName;
  subtitle: string;
  onToggle: () => void;
  children: React.ReactNode;
}

export function HistoryCardShell({
  item,
  expanded,
  iconName,
  subtitle,
  onToggle,
  children,
}: HistoryCardShellProps) {
  const panelId = `history-item-panel-${item.id}`;

  return (
    <article
      className={clsx(
        "rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/90",
        "shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition",
        "hover:border-[var(--status-primary)]/30 hover:bg-[var(--bg-secondary)]",
      )}
      role="listitem"
      data-testid={`history-item-${item.id}`}
    >
      <button
        type="button"
        className={clsx(
          "flex min-h-16 w-full items-start gap-3 px-4 py-4 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)]",
        )}
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <div className="rounded-2xl bg-[var(--bg-primary)] p-2 text-[var(--status-primary)]">
          <Icon name={iconName} size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
              <span className="text-xs">{formatTime(item.timestamp)}</span>
              <Icon name={expanded ? "chevron-up" : "chevron-down"} size={16} />
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">
            {item.preview}
          </p>
        </div>
      </button>
      {expanded ? (
        <div
          id={panelId}
          className="border-t border-[var(--border-primary)] px-4 py-4"
        >
          {children}
        </div>
      ) : null}
    </article>
  );
}
