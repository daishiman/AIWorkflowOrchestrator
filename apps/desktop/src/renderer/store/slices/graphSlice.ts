import { StateCreator } from "zustand";
import type { GraphNode, GraphLink } from "../types";

export interface GraphSlice {
  // State
  graphNodes: GraphNode[];
  graphLinks: GraphLink[];
  isAnimating: boolean;
  selectedNodeId: string | null;

  // Actions
  setGraphData: (nodes: GraphNode[], links: GraphLink[]) => void;
  setIsAnimating: (animating: boolean) => void;
  setSelectedNode: (nodeId: string | null) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  clearGraph: () => void;
}

export const createGraphSlice: StateCreator<GraphSlice, [], [], GraphSlice> = (
  set,
) => ({
  // Initial state
  graphNodes: [],
  graphLinks: [],
  isAnimating: true,
  selectedNodeId: null,

  // Actions
  setGraphData: (nodes, links) => {
    set({ graphNodes: nodes, graphLinks: links });
  },

  setIsAnimating: (animating) => {
    set({ isAnimating: animating });
  },

  setSelectedNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  updateNodePosition: (nodeId, x, y) => {
    set((state) => ({
      graphNodes: state.graphNodes.map((node) =>
        node.id === nodeId ? { ...node, x, y } : node,
      ),
    }));
  },

  clearGraph: () => {
    set({ graphNodes: [], graphLinks: [], selectedNodeId: null });
  },
});
