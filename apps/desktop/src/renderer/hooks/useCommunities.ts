/**
 * useCommunities Hook
 *
 * コミュニティデータを取得・管理するカスタムフック
 *
 * @module @repo/desktop/renderer/hooks/useCommunities
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Community } from "@repo/shared";

/**
 * Hook options
 */
export interface UseCommunitiesOptions {
  /** Filter by level */
  level?: number;
}

/**
 * Hook return type
 */
export interface UseCommunitiesReturn {
  /** Community data */
  communities: Community[];
  /** Loading state */
  isLoading: boolean;
  /** Error information */
  error: Error | null;
  /** Available hierarchy levels */
  availableLevels: number[];
  /** Refetch data */
  refetch: () => Promise<void>;
}

/**
 * Community data fetching hook
 *
 * @param options - Hook options
 * @returns Community data and control functions
 *
 * @example
 * ```tsx
 * const { communities, isLoading, error, availableLevels } = useCommunities();
 *
 * // Filter by level
 * const { communities } = useCommunities({ level: 0 });
 * ```
 */
export function useCommunities(
  options: UseCommunitiesOptions = {},
): UseCommunitiesReturn {
  const { level } = options;

  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCommunities = useCallback(async () => {
    if (!window.electronAPI?.community) {
      setError(new Error("Community API not available"));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result =
        level !== undefined
          ? await window.electronAPI.community.getByLevel(level)
          : await window.electronAPI.community.getAll();

      if (result.ok && result.value) {
        setCommunities([...result.value]);
      } else if (!result.ok && result.error) {
        setError(new Error(result.error.message));
        setCommunities([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "通信エラーが発生しました";
      setError(new Error(errorMessage));
      setCommunities([]);
    } finally {
      setIsLoading(false);
    }
  }, [level]);

  // Initial fetch
  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // Compute available levels from communities
  const availableLevels = useMemo(() => {
    const levels = new Set(communities.map((c) => c.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [communities]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchCommunities();
  }, [fetchCommunities]);

  return {
    communities,
    isLoading,
    error,
    availableLevels,
    refetch,
  };
}
