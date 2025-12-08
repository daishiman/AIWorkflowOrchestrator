import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import type {
  GraphGetResponse,
  GraphRefreshResponse,
  GraphNode,
  GraphLink,
} from "../../preload/types";

// Generate mock graph data
function generateMockGraphData(): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [
    {
      id: "main",
      label: "Knowledge Base",
      type: "main",
      x: 400,
      y: 300,
      size: 30,
    },
    {
      id: "doc1",
      label: "設計ドキュメント",
      type: "document",
      x: 200,
      y: 200,
      size: 20,
    },
    {
      id: "doc2",
      label: "API仕様書",
      type: "document",
      x: 600,
      y: 200,
      size: 20,
    },
    {
      id: "doc3",
      label: "ユーザーガイド",
      type: "document",
      x: 200,
      y: 400,
      size: 20,
    },
    {
      id: "doc4",
      label: "開発メモ",
      type: "document",
      x: 600,
      y: 400,
      size: 20,
    },
    {
      id: "concept1",
      label: "アーキテクチャ",
      type: "concept",
      x: 100,
      y: 300,
      size: 15,
    },
    {
      id: "concept2",
      label: "認証",
      type: "concept",
      x: 700,
      y: 300,
      size: 15,
    },
    {
      id: "concept3",
      label: "データモデル",
      type: "concept",
      x: 400,
      y: 150,
      size: 15,
    },
    {
      id: "concept4",
      label: "UI/UX",
      type: "concept",
      x: 400,
      y: 450,
      size: 15,
    },
  ];

  const links: GraphLink[] = [
    { source: "main", target: "doc1" },
    { source: "main", target: "doc2" },
    { source: "main", target: "doc3" },
    { source: "main", target: "doc4" },
    { source: "doc1", target: "concept1" },
    { source: "doc1", target: "concept3" },
    { source: "doc2", target: "concept2" },
    { source: "doc2", target: "concept3" },
    { source: "doc3", target: "concept4" },
    { source: "doc4", target: "concept1" },
    { source: "doc4", target: "concept4" },
    { source: "concept1", target: "concept3" },
    { source: "concept2", target: "concept3" },
  ];

  return { nodes, links };
}

export function registerGraphHandlers(): void {
  // Get graph data
  ipcMain.handle(
    IPC_CHANNELS.GRAPH_GET,
    async (): Promise<GraphGetResponse> => {
      try {
        const data = generateMockGraphData();
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );

  // Refresh graph data
  ipcMain.handle(
    IPC_CHANNELS.GRAPH_REFRESH,
    async (): Promise<GraphRefreshResponse> => {
      try {
        const { nodes, links } = generateMockGraphData();

        // Add some randomization to positions for refresh effect
        const refreshedNodes = nodes.map((node) => ({
          ...node,
          x: node.x + (Math.random() - 0.5) * 50,
          y: node.y + (Math.random() - 0.5) * 50,
        }));

        return {
          success: true,
          data: {
            nodes: refreshedNodes,
            links,
            refreshedAt: new Date(),
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  );
}
