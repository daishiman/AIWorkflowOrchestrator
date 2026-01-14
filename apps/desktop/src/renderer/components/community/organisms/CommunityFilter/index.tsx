/**
 * CommunityFilter Component
 *
 * コミュニティのフィルタリングと検索を行うコンポーネント
 *
 * @module @repo/desktop/renderer/components/community/organisms/CommunityFilter
 */

import React, { useState, useCallback, useEffect, useRef } from "react";

/**
 * CommunityFilter props
 */
export interface CommunityFilterProps {
  /** Available hierarchy levels */
  availableLevels: number[];
  /** Currently selected level (null = all) */
  selectedLevel: number | null;
  /** Callback when level changes */
  onLevelChange?: (level: number | null) => void;
  /** Search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearch?: (query: string) => void;
  /** Debounce delay for search (ms) */
  searchDebounceMs?: number;
  /** Custom class name */
  className?: string;
}

/**
 * CommunityFilter Component
 */
export const CommunityFilter: React.FC<CommunityFilterProps> = ({
  availableLevels,
  selectedLevel,
  onLevelChange,
  searchQuery,
  onSearch,
  searchDebounceMs = 300,
  className = "",
}) => {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local search query with prop
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onSearch && localSearchQuery !== searchQuery) {
        onSearch(localSearchQuery);
      }
    }, searchDebounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localSearchQuery, onSearch, searchQuery, searchDebounceMs]);

  // Handle level selection
  const handleLevelChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value;
      onLevelChange?.(value === "" ? null : parseInt(value, 10));
    },
    [onLevelChange],
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearchQuery(event.target.value);
    },
    [],
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery("");
    onSearch?.("");
    searchInputRef.current?.focus();
  }, [onSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape" && localSearchQuery) {
        handleClearSearch();
      }
    },
    [localSearchQuery, handleClearSearch],
  );

  return (
    <div
      className={`flex items-center gap-4 ${className}`}
      role="search"
      aria-label="コミュニティフィルター"
      data-testid="community-filter"
    >
      {/* Level Filter Select */}
      <select
        value={selectedLevel === null ? "" : String(selectedLevel)}
        onChange={handleLevelChange}
        className="px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="レベルフィルター"
      >
        <option value="">全て</option>
        {availableLevels.map((level) => (
          <option key={level} value={String(level)}>
            Level {level}
          </option>
        ))}
      </select>

      {/* Level Count Info */}
      <span className="text-sm text-gray-500">
        {availableLevels.length > 0
          ? `${availableLevels.length}レベル`
          : "レベルなし"}
      </span>

      {/* Search Input */}
      <div className="relative flex-1 max-w-xs" onKeyDown={handleKeyDown}>
        <input
          ref={searchInputRef}
          type="search"
          value={localSearchQuery}
          onChange={handleSearchChange}
          placeholder="コミュニティを検索..."
          className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="コミュニティ検索"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
        {localSearchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="クリア"
          >
            <svg
              className="w-4 h-4"
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
    </div>
  );
};

CommunityFilter.displayName = "CommunityFilter";

export default CommunityFilter;
