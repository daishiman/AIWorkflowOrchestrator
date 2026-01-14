/**
 * CommunityGraph Component
 *
 * コミュニティ構造を可視化するグラフコンポーネント
 *
 * @module @repo/desktop/renderer/components/community/organisms/CommunityGraph
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import type { Community, CommunityId } from "@repo/shared";

/**
 * CommunityGraph props
 */
export interface CommunityGraphProps {
  /** Community data to display */
  communities: Community[];
  /** Selected community ID */
  selectedCommunityId: CommunityId | null;
  /** Highlighted community IDs (for search results) */
  highlightedIds: CommunityId[];
  /** Callback when a community is selected */
  onSelect?: (communityId: CommunityId) => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Custom class name */
  className?: string;
}

// Layout constants
const BASE_NODE_WIDTH = 100;
const BASE_NODE_HEIGHT = 40;
const LEVEL_SEPARATION = 150;
const NODE_SEPARATION = 100;

interface NodePosition {
  x: number;
  y: number;
}

interface LayoutNode {
  id: CommunityId;
  community: Community;
  position: NodePosition;
  width: number;
  height: number;
}

interface LayoutEdge {
  id: string;
  source: CommunityId;
  target: CommunityId;
}

/**
 * Calculate node dimensions based on community size
 */
function calculateNodeDimensions(size: number): {
  width: number;
  height: number;
} {
  const scale = Math.min(2, Math.max(1, Math.log10(size + 1) + 0.5));
  return {
    width: BASE_NODE_WIDTH * scale,
    height: BASE_NODE_HEIGHT * scale,
  };
}

/**
 * Layout communities using hierarchical positioning
 */
function layoutCommunities(communities: Community[]): {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
} {
  if (communities.length === 0) {
    return { nodes: [], edges: [] };
  }

  // Group by level
  const levelGroups = new Map<number, Community[]>();
  communities.forEach((community) => {
    const level = community.level;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(community);
  });

  // Sort levels (higher levels at top)
  const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => b - a);

  // Position nodes
  const nodes: LayoutNode[] = [];
  sortedLevels.forEach((level, levelIndex) => {
    const levelCommunities = levelGroups.get(level)!;
    const levelY = levelIndex * LEVEL_SEPARATION;

    levelCommunities.forEach((community, nodeIndex) => {
      const { width, height } = calculateNodeDimensions(community.size);
      const totalWidth = levelCommunities.length * NODE_SEPARATION;
      const startX = -totalWidth / 2;
      const x = startX + nodeIndex * NODE_SEPARATION;

      nodes.push({
        id: community.id,
        community,
        position: { x, y: levelY },
        width,
        height,
      });
    });
  });

  // Create edges for parent-child relationships
  const edges: LayoutEdge[] = [];
  communities.forEach((community) => {
    if (community.parentCommunityId) {
      edges.push({
        id: `${community.parentCommunityId}-${community.id}`,
        source: community.parentCommunityId,
        target: community.id,
      });
    }
  });

  return { nodes, edges };
}

/**
 * CommunityGraph Component
 */
export const CommunityGraph: React.FC<CommunityGraphProps> = ({
  communities,
  selectedCommunityId,
  highlightedIds,
  onSelect,
  isLoading = false,
  error = null,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFitted, setIsFitted] = useState(false);

  // Layout calculation
  const { nodes, edges } = useMemo(
    () => layoutCommunities(communities),
    [communities],
  );

  // Node lookup map
  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Handle node click
  const handleNodeClick = useCallback(
    (communityId: CommunityId) => {
      onSelect?.(communityId);
    },
    [onSelect],
  );

  // Handle node keydown
  const handleNodeKeyDown = useCallback(
    (event: React.KeyboardEvent, communityId: CommunityId) => {
      if (event.key === "Enter") {
        onSelect?.(communityId);
      }
    },
    [onSelect],
  );

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 3));
    setIsFitted(false);
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.3));
    setIsFitted(false);
  }, []);

  const handleFit = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsFitted(true);
  }, []);

  // Pan handling
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === containerRef.current) {
        setIsDragging(true);
        setDragStart({ x: event.clientX - pan.x, y: event.clientY - pan.y });
      }
    },
    [pan],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: event.clientX - dragStart.x,
          y: event.clientY - dragStart.y,
        });
        setIsFitted(false);
      }
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center h-full ${className}`}
        role="status"
        aria-label="コミュニティグラフを読み込み中"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center h-full text-red-500 ${className}`}
        role="alert"
        aria-label="エラー"
      >
        <span>データの読み込みに失敗しました: {error.message}</span>
      </div>
    );
  }

  // Empty state
  if (communities.length === 0) {
    return (
      <div
        className={`flex items-center justify-center h-full text-gray-500 ${className}`}
        aria-label="コミュニティグラフ"
      >
        <span>コミュニティが検出されていません</span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full ${className}`}
      aria-label="コミュニティ構造グラフ"
      role="application"
      data-testid="community-graph"
    >
      {/* Controls */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        <button
          type="button"
          onClick={handleZoomIn}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          aria-label="ズームイン"
        >
          +
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          aria-label="ズームアウト"
        >
          -
        </button>
        <button
          type="button"
          onClick={handleFit}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          aria-label="フィット"
        >
          ⊞
        </button>
      </div>

      {/* Graph Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-gray-50 cursor-grab"
        data-testid="community-graph-container"
        data-zoom={zoom.toString()}
        data-pan-x={pan.x.toString()}
        data-pan-y={pan.y.toString()}
        data-fit={isFitted.toString()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {/* Center offset */}
          <g transform="translate(400, 100)">
            {/* Edges */}
            {edges.map((edge) => {
              const sourceNode = nodeMap.get(edge.source);
              const targetNode = nodeMap.get(edge.target);
              if (!sourceNode || !targetNode) return null;

              const sourceX = sourceNode.position.x + sourceNode.width / 2;
              const sourceY = sourceNode.position.y + sourceNode.height;
              const targetX = targetNode.position.x + targetNode.width / 2;
              const targetY = targetNode.position.y;

              return (
                <path
                  key={edge.id}
                  d={`M ${sourceX} ${sourceY} C ${sourceX} ${(sourceY + targetY) / 2}, ${targetX} ${(sourceY + targetY) / 2}, ${targetX} ${targetY}`}
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  data-testid={`community-edge-${edge.source}-${edge.target}`}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedCommunityId === node.id;
              const isHighlighted = highlightedIds.includes(node.id);

              const nodeClasses = [
                "cursor-pointer",
                "transition-all",
                isSelected ? "selected" : "",
                isHighlighted ? "highlighted" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.position.x}, ${node.position.y})`}
                  className={nodeClasses}
                  data-testid={`community-node-${node.id}`}
                  onClick={() => handleNodeClick(node.id)}
                  onKeyDown={(e) => handleNodeKeyDown(e, node.id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`コミュニティ ${node.id}, レベル ${node.community.level}, サイズ ${node.community.size}`}
                  style={{
                    top: `${node.position.y}px`,
                    left: `${node.position.x}px`,
                  }}
                >
                  <rect
                    width={node.width}
                    height={node.height}
                    rx={8}
                    fill={
                      isSelected
                        ? "#3b82f6"
                        : isHighlighted
                          ? "#fbbf24"
                          : "#f3f4f6"
                    }
                    stroke={
                      isHighlighted && !isSelected ? "#f59e0b" : "#d1d5db"
                    }
                    strokeWidth={isHighlighted && !isSelected ? 2 : 1}
                  />
                  <text
                    x={node.width / 2}
                    y={node.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isSelected ? "#ffffff" : "#1f2937"}
                    fontSize={12}
                  >
                    L{node.community.level} ({node.community.size})
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

CommunityGraph.displayName = "CommunityGraph";

export default CommunityGraph;
