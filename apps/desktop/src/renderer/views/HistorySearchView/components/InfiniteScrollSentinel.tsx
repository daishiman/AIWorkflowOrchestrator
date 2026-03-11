import type { RefObject } from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";

interface InfiniteScrollSentinelProps {
  hasMore: boolean;
  isLoading: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
}

export function InfiniteScrollSentinel({
  hasMore,
  isLoading,
  sentinelRef,
}: InfiniteScrollSentinelProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      {hasMore ? (
        <>
          <div ref={sentinelRef} data-testid="history-search-sentinel" />
          <div
            className={clsx(
              "flex items-center gap-2 text-xs text-[var(--text-secondary)]",
              !isLoading && "opacity-70",
            )}
          >
            {isLoading ? <Icon name="loader-2" size={14} spin /> : null}
            <span>
              {isLoading ? "さらに読み込み中" : "近づくと続きを読み込みます"}
            </span>
          </div>
        </>
      ) : (
        <p className="text-xs text-[var(--text-secondary)]">
          すべて表示しました
        </p>
      )}
    </div>
  );
}
