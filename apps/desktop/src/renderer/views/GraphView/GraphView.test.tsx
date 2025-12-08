import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GraphView } from "./index";

// Mock store state - flat structure matching actual store
const createMockState = (overrides = {}) => ({
  // GraphSlice
  graphNodes: [
    { id: "1", label: "Document A", type: "document", x: 0, y: 0, size: 10 },
    { id: "2", label: "Document B", type: "document", x: 50, y: 50, size: 10 },
    {
      id: "3",
      label: "Concept C",
      type: "concept",
      x: 100,
      y: 100,
      size: 10,
      metadata: { tags: ["AI"] },
    },
  ] as Array<{
    id: string;
    label: string;
    type: string;
    x: number;
    y: number;
    size: number;
    metadata?: { tags: string[] };
  }>,
  graphLinks: [
    { source: "1", target: "2" },
    { source: "1", target: "3" },
  ],
  selectedNodeId: null as string | null,
  isAnimating: true,
  setGraphData: vi.fn(),
  setIsAnimating: vi.fn(),
  setSelectedNode: vi.fn(),
  updateNodePosition: vi.fn(),
  clearGraph: vi.fn(),
  ...overrides,
});

vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));

// Mock KnowledgeGraph component
vi.mock("../../components/organisms/KnowledgeGraph", () => ({
  KnowledgeGraph: ({
    onNodeClick,
  }: {
    onNodeClick: (node: { id: string }) => void;
  }) => (
    <div data-testid="knowledge-graph">
      <button onClick={() => onNodeClick({ id: "1" })}>Select Node 1</button>
    </div>
  ),
}));

describe("GraphView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("レンダリング", () => {
    it("グラフビューをレンダリングする", () => {
      render(<GraphView />);
      expect(screen.getByTestId("graph-view")).toBeInTheDocument();
    });

    it("ヘッダーを表示する", () => {
      render(<GraphView />);
      expect(screen.getByText("ナレッジグラフ")).toBeInTheDocument();
      expect(
        screen.getByText("ドキュメント間の関連性を可視化"),
      ).toBeInTheDocument();
    });

    it("更新ボタンを表示する", () => {
      render(<GraphView />);
      expect(
        screen.getByRole("button", { name: "グラフを更新" }),
      ).toBeInTheDocument();
    });
  });

  describe("グラフ表示", () => {
    it("KnowledgeGraphコンポーネントを表示する", () => {
      render(<GraphView />);
      expect(screen.getByTestId("knowledge-graph")).toBeInTheDocument();
    });
  });

  describe("ノード選択", () => {
    it("ノードクリックでsetSelectedNodeを呼び出す", async () => {
      const mockSetSelectedNode = vi.fn();
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) =>
        selector(
          createMockState({ setSelectedNode: mockSetSelectedNode }),
        )) as never);

      render(<GraphView />);
      const selectButton = screen.getByText("Select Node 1");
      fireEvent.click(selectButton);
      expect(mockSetSelectedNode).toHaveBeenCalledWith("1");
    });

    it("選択されたノードの詳細を表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ selectedNodeId: "1" }))) as never);

      render(<GraphView />);
      expect(screen.getByText("ノード詳細")).toBeInTheDocument();
      expect(screen.getByText("Document A")).toBeInTheDocument();
      expect(screen.getByText("document")).toBeInTheDocument();
    });

    it("接続数を表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ selectedNodeId: "1" }))) as never);

      render(<GraphView />);
      expect(screen.getByText("接続数")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("空状態", () => {
    it("ノードがない場合はメッセージを表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ graphNodes: [] }))) as never);

      render(<GraphView />);
      expect(
        screen.getByText("まだドキュメントがインデックスされていません"),
      ).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<GraphView className="custom-class" />);
      expect(screen.getByTestId("graph-view")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(GraphView.displayName).toBe("GraphView");
    });
  });
});
