import React, { memo, useEffect, useRef } from "react";
import clsx from "clsx";
import { Search, X } from "lucide-react";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  shortcutHint?: string;
  autoFocus?: boolean;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = "検索",
  shortcutHint,
  autoFocus = false,
}) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!onDebouncedChange) {
      return undefined;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!didMountRef.current) {
      didMountRef.current = true;
      return undefined;
    }

    timeoutRef.current = setTimeout(() => {
      onDebouncedChange(value);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onDebouncedChange, debounceMs]);

  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2",
        "bg-[var(--bg-tertiary)] border-[var(--border-subtle)]",
        "focus-within:border-[var(--status-primary)]",
        "transition-colors duration-[var(--duration-fast)]",
      )}
    >
      <Search
        size={16}
        className="text-[var(--text-secondary)]"
        aria-hidden="true"
      />
      <input
        role="searchbox"
        aria-label="検索"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={clsx(
          "w-full bg-transparent outline-none",
          "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
        )}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="検索をクリア"
          className={clsx(
            "inline-flex h-8 w-8 items-center justify-center rounded-full",
            "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]",
            "transition-colors duration-[var(--duration-fast)]",
          )}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
      {shortcutHint && (
        <kbd
          className={clsx(
            "rounded px-1.5 py-0.5 text-xs",
            "text-[var(--text-secondary)] bg-[var(--bg-secondary)]",
          )}
        >
          {shortcutHint}
        </kbd>
      )}
    </div>
  );
};

export const SearchBar = memo(SearchBarComponent);
SearchBar.displayName = "SearchBar";
