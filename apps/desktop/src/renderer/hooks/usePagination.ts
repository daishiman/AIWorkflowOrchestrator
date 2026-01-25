/**
 * usePagination Hook
 *
 * Reusable hook for managing pagination state.
 *
 * @module @repo/desktop/renderer/hooks/usePagination
 */

import { useState, useCallback, useMemo } from "react";

export interface UsePaginationOptions {
  limit?: number;
  initialOffset?: number;
}

export interface UsePaginationReturn {
  offset: number;
  limit: number;
  hasMore: boolean;
  setHasMore: (value: boolean) => void;
  incrementOffset: (count: number) => void;
  reset: () => void;
  page: number;
}

export function usePagination(
  options: UsePaginationOptions = {},
): UsePaginationReturn {
  const { limit = 20, initialOffset = 0 } = options;

  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);

  const incrementOffset = useCallback(
    (count: number) => {
      setOffset((prev) => prev + count);
      // If we got fewer items than the limit, there are no more items
      if (count < limit) {
        setHasMore(false);
      }
    },
    [limit],
  );

  const reset = useCallback(() => {
    setOffset(initialOffset);
    setHasMore(true);
  }, [initialOffset]);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);

  return {
    offset,
    limit,
    hasMore,
    setHasMore,
    incrementOffset,
    reset,
    page,
  };
}
