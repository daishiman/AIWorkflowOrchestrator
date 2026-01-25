/**
 * LoadingState Component
 *
 * Reusable loading skeleton component with different variants.
 *
 * @module @repo/desktop/renderer/components/common/LoadingState
 */

import React from "react";

export type LoadingStateVariant = "list" | "detail" | "messages" | "inline";

export interface LoadingStateProps {
  variant?: LoadingStateVariant;
  itemCount?: number;
  className?: string;
}

function ListSkeleton({ itemCount = 3 }: { itemCount: number }) {
  return (
    <div data-testid="loading-skeleton" className="space-y-3 p-3">
      {Array.from({ length: itemCount }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="flex h-full flex-col">
      <div className="animate-pulse border-b border-gray-200 p-4">
        <div className="h-6 w-48 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-24 rounded bg-gray-200" />
      </div>
      <div className="flex-1 space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`animate-pulse ${i % 2 === 0 ? "ml-auto" : "mr-auto"} max-w-[70%]`}
          >
            <div
              className={`h-16 rounded-lg ${i % 2 === 0 ? "bg-blue-100" : "bg-gray-200"}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesSkeleton({ itemCount = 3 }: { itemCount: number }) {
  return (
    <div data-testid="message-loading-skeleton" className="space-y-4 p-4">
      {Array.from({ length: itemCount }, (_, i) => (
        <div
          key={i}
          className={`animate-pulse ${i % 2 === 0 ? "ml-auto" : "mr-auto"} max-w-[70%]`}
        >
          <div
            className={`h-16 rounded-lg ${i % 2 === 0 ? "bg-blue-100" : "bg-gray-200"}`}
          />
        </div>
      ))}
    </div>
  );
}

function InlineSkeleton() {
  return (
    <div data-testid="loading-skeleton" className="animate-pulse">
      <div className="h-4 w-full rounded bg-gray-200" />
    </div>
  );
}

export function LoadingState({
  variant = "list",
  itemCount = 3,
  className = "",
}: LoadingStateProps): React.ReactElement {
  const content = (() => {
    switch (variant) {
      case "list":
        return <ListSkeleton itemCount={itemCount} />;
      case "detail":
        return <DetailSkeleton />;
      case "messages":
        return <MessagesSkeleton itemCount={itemCount} />;
      case "inline":
        return <InlineSkeleton />;
      default:
        return <ListSkeleton itemCount={itemCount} />;
    }
  })();

  return <div className={className}>{content}</div>;
}
