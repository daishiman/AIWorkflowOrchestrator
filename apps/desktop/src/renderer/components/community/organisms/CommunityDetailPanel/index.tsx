/**
 * CommunityDetailPanel Component
 *
 * 選択されたコミュニティの詳細情報を表示するパネル
 *
 * @module @repo/desktop/renderer/components/community/organisms/CommunityDetailPanel
 */

import React, { useEffect, useCallback, useRef } from "react";
import type {
  Community,
  CommunitySummary,
  StoredEntity,
  EntityId,
} from "@repo/shared";

/**
 * CommunityDetailPanel props
 */
export interface CommunityDetailPanelProps {
  /** Selected community */
  community: Community | null;
  /** Community summary (may need to be fetched) */
  summary?: CommunitySummary | null;
  /** Community members */
  members?: StoredEntity[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Callback to close the panel */
  onClose?: () => void;
  /** Callback when a member entity is clicked */
  onEntityClick?: (entityId: EntityId) => void;
  /** Custom class name */
  className?: string;
}

/**
 * Skeleton component for loading states
 */
const Skeleton: React.FC<{
  className?: string;
  testId?: string;
}> = ({ className = "", testId }) => (
  <div
    className={`animate-pulse bg-gray-200 rounded ${className}`}
    data-testid={testId}
  />
);

/**
 * CommunityDetailPanel Component
 */
export const CommunityDetailPanel: React.FC<CommunityDetailPanelProps> = ({
  community,
  summary,
  members = [],
  isLoading = false,
  error = null,
  onClose,
  onEntityClick,
  className = "",
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to close panel
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Focus close button when panel opens with community
  useEffect(() => {
    if (community && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [community]);

  // Empty state (no community selected)
  if (!community) {
    return (
      <div
        className={`p-4 text-gray-500 ${className}`}
        role="complementary"
        aria-label="コミュニティ詳細"
      >
        <p>コミュニティを選択してください</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`p-4 ${className}`}
        role="complementary"
        aria-label="コミュニティ詳細"
        aria-busy="true"
      >
        <div className="space-y-4">
          <Skeleton className="h-6 w-3/4" testId="skeleton-summary" />
          <Skeleton className="h-4 w-1/2" testId="skeleton-keywords" />
          <Skeleton className="h-24 w-full" testId="skeleton-members" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`p-4 ${className}`}
        role="complementary"
        aria-label="コミュニティ詳細"
      >
        <div className="text-red-500" role="alert">
          <p>エラー: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={`flex flex-col h-full overflow-hidden bg-white ${className}`}
      role="complementary"
      aria-label="コミュニティ詳細"
      tabIndex={-1}
      data-testid="community-detail-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">{community.id}</h2>
        {onClose && (
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            aria-label="閉じる"
          >
            <svg
              className="w-5 h-5"
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Info */}
        <section>
          <h3 className="text-sm font-medium text-gray-500 mb-2">基本情報</h3>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-gray-500">ID</dt>
            <dd className="text-gray-900 font-mono text-xs truncate">
              {community.id}
            </dd>
            <dt className="text-gray-500">レベル</dt>
            <dd className="text-gray-900">Level {community.level}</dd>
            <dt className="text-gray-500">サイズ</dt>
            <dd className="text-gray-900">{community.size}件</dd>
            <dt className="text-gray-500">内部エッジ</dt>
            <dd className="text-gray-900">{community.internalEdges}</dd>
            <dt className="text-gray-500">外部エッジ</dt>
            <dd className="text-gray-900">{community.externalEdges}</dd>
            <dt className="text-gray-500">モジュラリティ</dt>
            <dd className="text-gray-900">{community.modularity.toFixed(3)}</dd>
          </dl>
        </section>

        {/* Summary Section */}
        {!summary ? (
          <section>
            <h3 className="text-sm font-medium text-gray-500 mb-2">要約</h3>
            <p className="text-sm text-gray-400 italic">
              要約が生成されていません
            </p>
          </section>
        ) : (
          <>
            <section>
              <h3 className="text-sm font-medium text-gray-500 mb-2">要約</h3>
              <p className="text-sm text-gray-700">{summary.summary}</p>
            </section>

            {/* Keywords */}
            {summary.keywords.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  キーワード
                </h3>
                <div className="flex flex-wrap gap-1">
                  {summary.keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Main Entities */}
            {summary.mainEntities.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  主要エンティティ
                </h3>
                <ul className="text-sm text-gray-700 list-disc list-inside">
                  {summary.mainEntities.map((entity: string, index: number) => (
                    <li key={index}>{entity}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Sentiment & Confidence */}
            <section>
              <h3 className="text-sm font-medium text-gray-500 mb-2">分析</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">センチメント:</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      summary.sentiment === "positive"
                        ? "bg-green-100 text-green-800"
                        : summary.sentiment === "negative"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                    data-testid="sentiment-indicator"
                    data-sentiment={summary.sentiment}
                  >
                    {summary.sentiment === "positive"
                      ? "Positive"
                      : summary.sentiment === "negative"
                        ? "Negative"
                        : "Neutral"}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 block mb-1">
                    信頼度:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          summary.confidence >= 0.8
                            ? "bg-green-500"
                            : summary.confidence >= 0.5
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.round(summary.confidence * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round(summary.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Members Section */}
        {members.length > 0 && (
          <section>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              メンバー ({members.length}件)
            </h3>
            <ul
              className="divide-y divide-gray-100 max-h-48 overflow-y-auto"
              role="list"
              aria-label="メンバー"
            >
              {members.map((member) => (
                <li key={member.id}>
                  <button
                    onClick={() => onEntityClick?.(member.id)}
                    className="w-full text-left px-2 py-2 hover:bg-gray-50 rounded transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {member.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({member.type})
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

CommunityDetailPanel.displayName = "CommunityDetailPanel";

export default CommunityDetailPanel;
