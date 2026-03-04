import React, { memo, useMemo, useState } from "react";
import clsx from "clsx";
import { EmptyState } from "../../atoms/EmptyState";
import { FilterChip } from "../../atoms/FilterChip";
import { SearchBar } from "../../molecules/SearchBar";
import { CardGrid } from "../CardGrid";

export interface SearchFilterListProps<T> {
  items: T[];
  filters: Array<{
    id: string;
    label: string;
    icon?: string;
    predicate: (item: T) => boolean;
  }>;
  searchPredicate: (item: T, query: string) => boolean;
  renderItem?: (item: T, index: number) => React.ReactNode;
  renderCard?: (item: T, index: number) => React.ReactNode;
  viewMode?: "list" | "grid";
  searchPlaceholder?: string;
  emptyMessage?: string;
  sortFn?: (a: T, b: T) => number;
}

function SearchFilterListComponent<T>({
  items,
  filters,
  searchPredicate,
  renderItem,
  renderCard,
  viewMode = "list",
  searchPlaceholder = "検索",
  emptyMessage = "一致する結果がありません",
  sortFn,
}: SearchFilterListProps<T>): React.ReactElement {
  const [query, setQuery] = useState("");
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);

  const activeFilter = filters.find((filter) => filter.id === activeFilterId);

  const filteredItems = useMemo(() => {
    const matched = items.filter((item) => {
      const matchesQuery = searchPredicate(item, query);
      const matchesFilter = activeFilter ? activeFilter.predicate(item) : true;
      return matchesQuery && matchesFilter;
    });

    if (sortFn) {
      return [...matched].sort(sortFn);
    }

    return matched;
  }, [items, searchPredicate, query, activeFilter, sortFn]);

  return (
    <section className="flex h-full min-h-0 flex-col gap-3">
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder={searchPlaceholder}
        onDebouncedChange={() => undefined}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const count = items.filter((item) => filter.predicate(item)).length;
          const isSelected = activeFilterId === filter.id;
          return (
            <FilterChip
              key={filter.id}
              label={filter.label}
              icon={filter.icon}
              count={count}
              isSelected={isSelected}
              onClick={() => {
                setActiveFilterId((prev) =>
                  prev === filter.id ? null : filter.id,
                );
              }}
            />
          );
        })}
      </div>

      <p className="text-sm text-[var(--text-secondary)]">
        {filteredItems.length} 件
      </p>

      <div className="min-h-0 flex-1 overflow-auto">
        {filteredItems.length === 0 ? (
          <EmptyState
            title={emptyMessage}
            description="検索条件またはフィルター条件を見直してください"
            icon="search"
            compact={true}
          />
        ) : viewMode === "grid" && renderCard ? (
          <CardGrid items={filteredItems} renderCard={renderCard} />
        ) : (
          <ul className={clsx("space-y-2")}>
            {filteredItems.map((item, index) => (
              <li key={index}>
                {renderItem ? (
                  renderItem(item, index)
                ) : (
                  <span>{String(item)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

const SearchFilterListMemo = memo(
  SearchFilterListComponent,
) as typeof SearchFilterListComponent & {
  displayName?: string;
};
SearchFilterListMemo.displayName = "SearchFilterList";

export const SearchFilterList = SearchFilterListMemo;
