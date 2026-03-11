import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";

interface HistorySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function HistorySearchBar({
  value,
  onChange,
  onClear,
}: HistorySearchBarProps) {
  return (
    <div
      className={clsx(
        "sticky top-0 z-20 rounded-2xl border border-[var(--border-primary)]",
        "bg-[color-mix(in_srgb,var(--bg-secondary)_92%,transparent)] px-4 py-3 backdrop-blur",
        "shadow-[0_12px_32px_rgba(15,23,42,0.08)]",
      )}
    >
      <div className="flex items-center gap-3">
        <Icon
          name="search"
          size={18}
          className="text-[var(--text-secondary)]"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="やりとりを検索..."
          aria-label="やりとりを検索"
          className={clsx(
            "w-full bg-transparent text-sm text-[var(--text-primary)] outline-none",
            "placeholder:text-[var(--text-secondary)]",
          )}
          data-testid="history-search-input"
        />
        {value !== "" ? (
          <button
            type="button"
            onClick={onClear}
            className={clsx(
              "rounded-full p-1 text-[var(--text-secondary)] transition hover:bg-[var(--bg-primary)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)]",
            )}
            aria-label="検索をクリア"
          >
            <Icon name="x" size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
