import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { KnowledgeGraph } from "../../components/organisms/KnowledgeGraph";
import { Button } from "../../components/atoms/Button";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { LoadingDisplay } from "../../components/atoms/LoadingDisplay";
import { EmptyState } from "../../components/atoms/EmptyState";
import { useAppStore } from "../../store";

export interface GraphViewProps {
  className?: string;
}

export const GraphView: React.FC<GraphViewProps> = ({ className }) => {
  // Use flat store structure
  const graphNodes = useAppStore((state) => state.graphNodes);
  const graphLinks = useAppStore((state) => state.graphLinks);
  const selectedNodeId = useAppStore((state) => state.selectedNodeId);
  const setSelectedNode = useAppStore((state) => state.setSelectedNode);

  // Local state
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);

  // Map to expected structure
  const nodes = graphNodes;
  const edges = graphLinks;
  const selectedNode = selectedNodeId
    ? graphNodes.find((n) => n.id === selectedNodeId) || null
    : null;

  const handleRefresh = useCallback(() => {
    // Refresh logic would go here
  }, []);

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      setSelectedNode(nodeId);
    },
    [setSelectedNode],
  );

  if (error) {
    return <ErrorDisplay message={error} className={className} />;
  }

  return (
    <div
      className={clsx("flex flex-col h-full", className)}
      data-testid="graph-view"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-white/10">
        <div>
          <h1 className="text-lg font-semibold text-white">ナレッジグラフ</h1>
          <p className="text-sm text-gray-400">
            ドキュメント間の関連性を可視化
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            leftIcon="refresh-cw"
            aria-label="グラフを更新"
          >
            更新
          </Button>
        </div>
      </header>

      {/* Graph Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Graph Canvas */}
        <div className="flex-1 relative">
          {isLoading ? (
            <LoadingDisplay message="グラフを読み込み中..." size="lg" />
          ) : nodes.length === 0 ? (
            <EmptyState
              title="まだドキュメントがインデックスされていません"
              description="エディターでドキュメントを追加してください"
            />
          ) : (
            <KnowledgeGraph
              nodes={nodes}
              links={edges}
              onNodeClick={(node) => handleNodeSelect(node.id)}
              className="w-full h-full"
            />
          )}
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <aside className="w-80 border-l border-white/10 p-4 overflow-auto">
            <GlassPanel className="p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                ノード詳細
              </h2>
              <div className="space-y-3">
                <div>
                  <dt className="text-xs text-gray-500">タイトル</dt>
                  <dd className="text-white font-medium">
                    {selectedNode.label}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">タイプ</dt>
                  <dd className="text-white">{selectedNode.type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">接続数</dt>
                  <dd className="text-white">
                    {
                      edges.filter(
                        (e) =>
                          e.source === selectedNode.id ||
                          e.target === selectedNode.id,
                      ).length
                    }
                  </dd>
                </div>
                {selectedNode.metadata && (
                  <div>
                    <dt className="text-xs text-gray-500">メタデータ</dt>
                    <dd className="text-white text-sm">
                      <pre className="bg-white/5 p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(selectedNode.metadata, null, 2)}
                      </pre>
                    </dd>
                  </div>
                )}
              </div>
            </GlassPanel>
          </aside>
        )}
      </main>
    </div>
  );
};

GraphView.displayName = "GraphView";
