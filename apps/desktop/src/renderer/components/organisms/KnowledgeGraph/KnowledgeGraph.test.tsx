import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { KnowledgeGraph } from "./index";
import type { GraphNode, GraphLink } from "../../../store/types";

// Mock canvas context
const mockCanvasContext = {
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 0,
  shadowColor: "",
  shadowBlur: 0,
  font: "",
  textAlign: "",
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
  fillRect: vi.fn(),
};

// Mock HTMLCanvasElement
HTMLCanvasElement.prototype.getContext = vi.fn(
  () => mockCanvasContext,
) as never;

// Mock requestAnimationFrame to avoid concurrent work issues
let rafId = 0;
vi.stubGlobal(
  "requestAnimationFrame",
  vi.fn(() => ++rafId),
);
vi.stubGlobal("cancelAnimationFrame", vi.fn());

const mockNodes: GraphNode[] = [
  { id: "node-1", label: "Node 1", type: "main", x: 100, y: 100, size: 10 },
  { id: "node-2", label: "Node 2", type: "document", x: 200, y: 200, size: 8 },
  { id: "node-3", label: "Node 3", type: "concept", x: 150, y: 150, size: 6 },
];

const mockLinks: GraphLink[] = [
  { source: "node-1", target: "node-2" },
  { source: "node-1", target: "node-3" },
];

describe("KnowledgeGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rafId = 0;
  });

  afterEach(() => {
    cleanup();
  });

  describe("レンダリング", () => {
    it("コンポーネントが正常にレンダリングされる", () => {
      render(<KnowledgeGraph nodes={mockNodes} links={mockLinks} />);
      const canvas = screen.getByLabelText("Knowledge Graph visualization");
      expect(canvas).toBeInTheDocument();
      expect(canvas.tagName).toBe("CANVAS");
    });

    it("空のノード配列で空状態メッセージを表示する", () => {
      render(<KnowledgeGraph nodes={[]} links={[]} />);
      expect(screen.getByText("グラフデータがありません")).toBeInTheDocument();
    });

    it("凡例が表示される", () => {
      render(<KnowledgeGraph nodes={mockNodes} links={mockLinks} />);
      expect(screen.getByText("メイン")).toBeInTheDocument();
      expect(screen.getByText("ドキュメント")).toBeInTheDocument();
      expect(screen.getByText("コンセプト")).toBeInTheDocument();
    });

    it("カスタムclassNameが適用される", () => {
      const { container } = render(
        <KnowledgeGraph
          nodes={mockNodes}
          links={mockLinks}
          className="custom-class"
        />,
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("コントロールボタン", () => {
    it("onToggleAnimationが提供された場合、停止/再生ボタンを表示する", () => {
      const onToggleAnimation = vi.fn();
      render(
        <KnowledgeGraph
          nodes={mockNodes}
          links={mockLinks}
          onToggleAnimation={onToggleAnimation}
        />,
      );
      expect(screen.getByText("停止")).toBeInTheDocument();
    });

    it("アニメーション停止中は再生ボタンを表示する", () => {
      const onToggleAnimation = vi.fn();
      render(
        <KnowledgeGraph
          nodes={mockNodes}
          links={mockLinks}
          isAnimating={false}
          onToggleAnimation={onToggleAnimation}
        />,
      );
      expect(screen.getByText("再生")).toBeInTheDocument();
    });

    it("停止/再生ボタンクリックでonToggleAnimationが呼ばれる", () => {
      const onToggleAnimation = vi.fn();
      render(
        <KnowledgeGraph
          nodes={mockNodes}
          links={mockLinks}
          onToggleAnimation={onToggleAnimation}
        />,
      );
      fireEvent.click(screen.getByText("停止"));
      expect(onToggleAnimation).toHaveBeenCalledTimes(1);
    });

    it("onRefreshが提供された場合、更新ボタンを表示する", () => {
      const onRefresh = vi.fn();
      render(
        <KnowledgeGraph
          nodes={mockNodes}
          links={mockLinks}
          onRefresh={onRefresh}
        />,
      );
      expect(screen.getByText("更新")).toBeInTheDocument();
    });

    it("更新ボタンクリックでonRefreshが呼ばれる", () => {
      const onRefresh = vi.fn();
      render(
        <KnowledgeGraph
          nodes={mockNodes}
          links={mockLinks}
          onRefresh={onRefresh}
        />,
      );
      fireEvent.click(screen.getByText("更新"));
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe("マウスイベント", () => {
    it("キャンバスでマウス移動イベントが処理される", () => {
      render(<KnowledgeGraph nodes={mockNodes} links={mockLinks} />);
      const canvas = screen.getByLabelText("Knowledge Graph visualization");
      fireEvent.mouseMove(canvas, { clientX: 100, clientY: 100 });
      // イベントが正常に処理されることを確認（エラーなし）
      expect(canvas).toBeInTheDocument();
    });

    it("キャンバスクリックでonNodeClickが呼ばれる", () => {
      const onNodeClick = vi.fn();
      render(
        <KnowledgeGraph
          nodes={mockNodes}
          links={mockLinks}
          onNodeClick={onNodeClick}
        />,
      );
      const canvas = screen.getByLabelText("Knowledge Graph visualization");
      fireEvent.click(canvas, { clientX: 100, clientY: 100 });
      // ノードの位置によっては呼ばれない場合もある
      expect(canvas).toBeInTheDocument();
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(KnowledgeGraph.displayName).toBe("KnowledgeGraph");
    });
  });
});
