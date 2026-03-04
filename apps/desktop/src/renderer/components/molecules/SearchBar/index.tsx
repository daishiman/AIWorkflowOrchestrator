import React, { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";
import { Search, X } from "lucide-react";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
  shortcutHint?: string;
  autoFocus?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  onDebouncedChange,
  debounceMs = 300,
  placeholder = "検索...",
  shortcutHint,
  autoFocus = false,
  className,
}) => {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedRef = useRef(false);

  const ariaLabel = useMemo(() => placeholder || "検索", [placeholder]);

  useEffect(() => {
    if (!onDebouncedChange) {
      return;
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onDebouncedChange(value);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [value, onDebouncedChange, debounceMs]);

  const handleClear = () => {
    onChange("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && onSubmit) {
      event.preventDefault();
      onSubmit(value);
      return;
    }

    if (event.key === "Escape" && value.length > 0) {
      event.preventDefault();
      onChange("");
      event.currentTarget.blur();
    }
  };

  const rightPaddingClass =
    value.length > 0 ? "pr-10" : shortcutHint ? "pr-14" : "pr-3";

  return (
    <div
      className={clsx(
        "relative flex items-center min-h-[44px] rounded-[var(--radius-md)]",
        "border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)]",
        "transition-colors focus-within:border-[var(--status-primary)]",
        className,
      )}
    >
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 text-[var(--text-secondary)]"
      />
      <input
        type="search"
        role="searchbox"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={clsx(
          "w-full bg-transparent py-2 pl-10 text-sm text-[var(--text-primary)]",
          "placeholder:text-[var(--text-muted)]",
          "focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--status-primary)] focus-visible:outline-offset-2",
          rightPaddingClass,
        )}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="クリア"
          className={clsx(
            "absolute right-2 inline-flex h-7 w-7 items-center justify-center rounded-md",
            "text-[var(--text-secondary)] transition-colors",
            "hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
            "focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--status-primary)]",
          )}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
      {value.length === 0 && shortcutHint && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 text-xs text-[var(--text-muted)]"
        >
          {shortcutHint}
        </span>
      )}
    </div>
  );
};

SearchBar.displayName = "SearchBar";
