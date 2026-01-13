/**
 * CommunityVisualization Template
 *
 * コミュニティ可視化の全体レイアウトを構成するテンプレートコンポーネント
 *
 * @module @repo/desktop/renderer/components/community/templates/CommunityVisualization
 */

import React, { useState, useCallback, useEffect } from "react";
import type {
  Community,
  CommunitySummary,
  StoredEntity,
  CommunityId,
  EntityId,
} from "@repo/shared";
import { CommunityGraph } from "../../organisms/CommunityGraph";
import { CommunityDetailPanel } from "../../organisms/CommunityDetailPanel";
import { CommunityFilter } from "../../organisms/CommunityFilter";
import { useCommunities } from "../../../../hooks/useCommunities";

/**
 * CommunityVisualization props
 */
export interface CommunityVisualizationProps {
  /** Custom class name */
  className?: string;
}

/**
 * CommunityVisualization Template Component
 */
export const CommunityVisualization: React.FC<CommunityVisualizationProps> = ({
  className = "",
}) => {
  // State
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIds, setHighlightedIds] = useState<CommunityId[]>([]);
  const [summary, setSummary] = useState<CommunitySummary | null>(null);
  const [members, setMembers] = useState<StoredEntity[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<Error | null>(null);

  // Fetch communities
  const { communities, isLoading, error, availableLevels } = useCommunities({
    level: selectedLevel ?? undefined,
  });

  // Fetch community details when selected
  useEffect(() => {
    if (!selectedCommunity) {
      setSummary(null);
      setMembers([]);
      return;
    }

    const fetchDetails = async () => {
      setDetailLoading(true);
      setDetailError(null);

      try {
        // Fetch summary
        const summaryResult = await window.electronAPI.community.getSummary(
          selectedCommunity.id,
        );
        if (summaryResult.ok && summaryResult.value) {
          setSummary(summaryResult.value);
        }

        // Fetch members
        const membersResult = await window.electronAPI.community.getMembers(
          selectedCommunity.id,
        );
        if (membersResult.ok && membersResult.value) {
          setMembers([...membersResult.value]);
        }
      } catch (err) {
        setDetailError(
          err instanceof Error ? err : new Error("Failed to load details"),
        );
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetails();
  }, [selectedCommunity]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setHighlightedIds([]);
      return;
    }

    const searchCommunities = async () => {
      try {
        const result = await window.electronAPI.community.search(searchQuery);
        if (result.ok && result.value) {
          setHighlightedIds(result.value.map((c) => c.id));
        }
      } catch {
        setHighlightedIds([]);
      }
    };

    searchCommunities();
  }, [searchQuery]);

  // Handlers
  const handleLevelChange = useCallback((level: number | null) => {
    setSelectedLevel(level);
    setSelectedCommunity(null);
  }, []);

  const handleCommunitySelect = useCallback(
    (communityId: CommunityId) => {
      const community = communities.find((c) => c.id === communityId);
      if (community) {
        setSelectedCommunity(community);
      }
    },
    [communities],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedCommunity(null);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleEntityClick = useCallback((_entityId: EntityId) => {
    // TODO: CONV-08-06 でエンティティ詳細画面への遷移を実装
    // この機能は別タスクで対応予定
  }, []);

  return (
    <div
      className={`flex flex-col h-full ${className}`}
      data-testid="community-visualization"
    >
      {/* Filter Bar */}
      <div className="flex-none p-4 border-b bg-white">
        <CommunityFilter
          availableLevels={availableLevels}
          selectedLevel={selectedLevel}
          onLevelChange={handleLevelChange}
          searchQuery={searchQuery}
          onSearch={handleSearch}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph Area */}
        <div className="flex-1 relative">
          <CommunityGraph
            communities={communities}
            selectedCommunityId={selectedCommunity?.id ?? null}
            highlightedIds={highlightedIds}
            onSelect={handleCommunitySelect}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {/* Detail Panel */}
        {selectedCommunity && (
          <div className="w-80 border-l bg-white overflow-hidden">
            <CommunityDetailPanel
              community={selectedCommunity}
              summary={summary}
              members={members}
              isLoading={detailLoading}
              error={detailError}
              onClose={handleCloseDetail}
              onEntityClick={handleEntityClick}
            />
          </div>
        )}
      </div>
    </div>
  );
};

CommunityVisualization.displayName = "CommunityVisualization";

export default CommunityVisualization;
