/**
 * ConversationSearch Component
 *
 * Molecule component for searching conversations with debounce support.
 *
 * @module @repo/desktop/renderer/components/conversation/ConversationSearch
 */

import React, { useState, useCallback, useEffect, useRef } from "react";

export interface ConversationSearchProps {
  onSearch: (query: string) => void;
  onClear?: () => void;
  value?: string;
  placeholder?: string;
  debounceMs?: number;
  isSearching?: boolean;
  resultCount?: number;
  disabled?: boolean;
}

export function ConversationSearch({
  onSearch,
  onClear,
  value: controlledValue,
  placeholder = "検索",
  debounceMs = 300,
  isSearching = false,
  resultCount,
  disabled = false,
}: ConversationSearchProps): React.ReactElement {
  const [internalValue, setInternalValue] = useState(controlledValue ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  const triggerSearch = useCallback(
    (query: string) => {
      if (!disabled) {
        onSearch(query.trim());
      }
    },
    [onSearch, disabled],
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        triggerSearch(newValue);
      }, debounceMs);
    },
    [debounceMs, triggerSearch],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        triggerSearch(internalValue);
      } else if (event.key === "Escape" && onClear) {
        onClear();
        onSearch("");
      }
    },
    [internalValue, triggerSearch, onClear, onSearch],
  );

  const handleClear = useCallback(() => {
    setInternalValue("");
    if (onClear) {
      onClear();
    }
    onSearch("");
  }, [onClear, onSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const showClearButton = internalValue.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <span
          data-testid="search-icon"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="search"
          role="searchbox"
          value={internalValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={placeholder}
          className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-10 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
        {isSearching && (
          <span
            data-testid="search-loading"
            className="absolute right-10 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </span>
        )}
        {showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="クリア"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {resultCount !== undefined && (
        <div role="status" className="sr-only" aria-live="polite">
          {resultCount}件の結果
        </div>
      )}
    </div>
  );
}
