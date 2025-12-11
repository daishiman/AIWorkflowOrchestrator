import { describe, it, expect, beforeEach } from "vitest";
import { createGraphSlice, type GraphSlice } from "./graphSlice";
import type { GraphNode, GraphLink } from "../types";

// Test helper to create a mock store
const createMockStore = () => {
  let state: GraphSlice;

  const set = (
    partial: Partial<GraphSlice> | ((state: GraphSlice) => Partial<GraphSlice>),
  ) => {
    if (typeof partial === "function") {
      state = { ...state, ...partial(state) };
    } else {
      state = { ...state, ...partial };
    }
  };

  const get = () => state;

  // Initialize the slice
  state = createGraphSlice(set, get, {} as never);

  return {
    getState: () => state,
    setState: set,
  };
};

const mockNodes: GraphNode[] = [
  { id: "node-1", label: "Node 1", type: "main", x: 100, y: 100, size: 10 },
  { id: "node-2", label: "Node 2", type: "document", x: 200, y: 200, size: 8 },
];

const mockLinks: GraphLink[] = [{ source: "node-1", target: "node-2" }];

describe("graphSlice", () => {
  let store: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    store = createMockStore();
  });

  describe("初期状態", () => {
    it("初期状態が正しく設定される", () => {
      const state = store.getState();
      expect(state.graphNodes).toEqual([]);
      expect(state.graphLinks).toEqual([]);
      expect(state.isAnimating).toBe(true);
      expect(state.selectedNodeId).toBeNull();
    });
  });

  describe("setGraphData", () => {
    it("グラフデータを設定する", () => {
      store.getState().setGraphData(mockNodes, mockLinks);
      const state = store.getState();
      expect(state.graphNodes).toEqual(mockNodes);
      expect(state.graphLinks).toEqual(mockLinks);
    });

    it("空のデータを設定できる", () => {
      store.getState().setGraphData(mockNodes, mockLinks);
      store.getState().setGraphData([], []);
      const state = store.getState();
      expect(state.graphNodes).toEqual([]);
      expect(state.graphLinks).toEqual([]);
    });
  });

  describe("setIsAnimating", () => {
    it("アニメーション状態をtrueに設定する", () => {
      store.getState().setIsAnimating(false);
      store.getState().setIsAnimating(true);
      expect(store.getState().isAnimating).toBe(true);
    });

    it("アニメーション状態をfalseに設定する", () => {
      store.getState().setIsAnimating(false);
      expect(store.getState().isAnimating).toBe(false);
    });
  });

  describe("setSelectedNode", () => {
    it("選択ノードIDを設定する", () => {
      store.getState().setSelectedNode("node-1");
      expect(store.getState().selectedNodeId).toBe("node-1");
    });

    it("選択ノードをnullに設定する（選択解除）", () => {
      store.getState().setSelectedNode("node-1");
      store.getState().setSelectedNode(null);
      expect(store.getState().selectedNodeId).toBeNull();
    });
  });

  describe("updateNodePosition", () => {
    it("ノードの位置を更新する", () => {
      store.getState().setGraphData(mockNodes, mockLinks);
      store.getState().updateNodePosition("node-1", 300, 400);

      const state = store.getState();
      const updatedNode = state.graphNodes.find((n) => n.id === "node-1");
      expect(updatedNode?.x).toBe(300);
      expect(updatedNode?.y).toBe(400);
    });

    it("存在しないノードIDの場合は何も変更しない", () => {
      store.getState().setGraphData(mockNodes, mockLinks);
      const originalNodes = [...store.getState().graphNodes];
      store.getState().updateNodePosition("non-existent", 300, 400);

      const state = store.getState();
      // 既存ノードの位置は変わらない
      expect(state.graphNodes[0].x).toBe(originalNodes[0].x);
      expect(state.graphNodes[0].y).toBe(originalNodes[0].y);
    });

    it("他のノードに影響を与えない", () => {
      store.getState().setGraphData(mockNodes, mockLinks);
      store.getState().updateNodePosition("node-1", 300, 400);

      const state = store.getState();
      const node2 = state.graphNodes.find((n) => n.id === "node-2");
      expect(node2?.x).toBe(200);
      expect(node2?.y).toBe(200);
    });
  });

  describe("clearGraph", () => {
    it("グラフデータをクリアする", () => {
      store.getState().setGraphData(mockNodes, mockLinks);
      store.getState().setSelectedNode("node-1");
      store.getState().clearGraph();

      const state = store.getState();
      expect(state.graphNodes).toEqual([]);
      expect(state.graphLinks).toEqual([]);
      expect(state.selectedNodeId).toBeNull();
    });

    it("空のグラフでもclearGraphが動作する", () => {
      store.getState().clearGraph();
      const state = store.getState();
      expect(state.graphNodes).toEqual([]);
      expect(state.graphLinks).toEqual([]);
    });
  });
});
