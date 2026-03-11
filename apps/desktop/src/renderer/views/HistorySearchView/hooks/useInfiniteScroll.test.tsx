import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useInfiniteScroll } from "./useInfiniteScroll";

let latestCallback: IntersectionObserverCallback | null = null;

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    latestCallback = callback;
  }
}

function HookHarness({
  hasMore,
  isLoading,
  onLoadMore,
}: {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}) {
  const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });
  return <div ref={sentinelRef} data-testid="sentinel" />;
}

describe("useInfiniteScroll", () => {
  beforeEach(() => {
    latestCallback = null;
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sentinel が交差したときに loadMore を呼ぶ", () => {
    const onLoadMore = vi.fn();

    render(<HookHarness hasMore isLoading={false} onLoadMore={onLoadMore} />);

    expect(screen.getByTestId("sentinel")).toBeInTheDocument();
    expect(latestCallback).not.toBeNull();

    latestCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  it("loading 中は observer を張らない", () => {
    const onLoadMore = vi.fn();

    render(<HookHarness hasMore isLoading onLoadMore={onLoadMore} />);

    expect(latestCallback).toBeNull();
  });
});
