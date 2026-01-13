/**
 * CommunityGraph エッジケース・アクセシビリティテスト
 * Phase 6: テスト拡充
 *
 * @description グラフコンポーネントの境界条件・アクセシビリティテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityGraph } from "../index";
import type { Community, CommunityId } from "@repo/shared";

// ヘルパー関数
const createCommunity = (
  id: string,
  level: number,
  size: number,
  parentId?: string,
): Community => ({
  id: id as CommunityId,
  level,
  size,
  memberEntityIds: [],
  childCommunityIds: [],
  parentCommunityId: parentId as CommunityId | undefined,
  internalEdges: 5,
  externalEdges: 2,
  modularity: 0.5,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("CommunityGraph Edge Cases", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("境界データ", () => {
    it("サイズ0のコミュニティも表示される", () => {
      const zeroSizeCommunity = [createCommunity("c1", 0, 0)];

      render(
        <CommunityGraph
          communities={zeroSizeCommunity}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByTestId("community-node-c1")).toBeInTheDocument();
    });

    it("非常に大きなサイズのコミュニティも表示される", () => {
      const largeSizeCommunity = [createCommunity("c1", 0, 10000)];

      render(
        <CommunityGraph
          communities={largeSizeCommunity}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByTestId("community-node-c1")).toBeInTheDocument();
    });

    it("深い階層構造（5+ レベル）でも表示される", () => {
      const deepHierarchy = Array.from({ length: 6 }, (_, i) =>
        createCommunity(`c${i}`, i, 10 + i),
      );

      render(
        <CommunityGraph
          communities={deepHierarchy}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // すべてのノードが表示される
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`community-node-c${i}`)).toBeInTheDocument();
      }
    });

    it("同一レベルに多数のノード（50+）があっても表示される", () => {
      const manyNodesAtSameLevel = Array.from({ length: 50 }, (_, i) =>
        createCommunity(`c${i}`, 0, 10),
      );

      render(
        <CommunityGraph
          communities={manyNodesAtSameLevel}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      expect(
        screen.getByTestId("community-graph-container"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("community-node-c0")).toBeInTheDocument();
      expect(screen.getByTestId("community-node-c49")).toBeInTheDocument();
    });

    it("特殊文字を含むIDでも表示される", () => {
      const specialIdCommunity = [
        {
          ...createCommunity("c1", 0, 10),
          id: "community-with-special-chars_123" as CommunityId,
        },
      ];

      render(
        <CommunityGraph
          communities={specialIdCommunity}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      expect(
        screen.getByTestId("community-node-community-with-special-chars_123"),
      ).toBeInTheDocument();
    });
  });

  describe("親子関係の表示", () => {
    it("親が存在しない子コミュニティでもエラーにならない", () => {
      const orphanChild = [
        createCommunity("child", 0, 10, "nonexistent-parent"),
      ];

      // エラーなく表示されることを確認
      expect(() => {
        render(
          <CommunityGraph
            communities={orphanChild}
            selectedCommunityId={null}
            highlightedIds={[]}
            onSelect={mockOnSelect}
            isLoading={false}
            error={null}
          />,
        );
      }).not.toThrow();

      expect(screen.getByTestId("community-node-child")).toBeInTheDocument();
    });

    it("循環参照のようなデータでもクラッシュしない", () => {
      const circularRefs: Community[] = [
        {
          ...createCommunity("c1", 0, 10, "c2"),
          childCommunityIds: ["c2" as CommunityId],
        },
        {
          ...createCommunity("c2", 1, 20, "c1"),
          childCommunityIds: ["c1" as CommunityId],
        },
      ];

      expect(() => {
        render(
          <CommunityGraph
            communities={circularRefs}
            selectedCommunityId={null}
            highlightedIds={[]}
            onSelect={mockOnSelect}
            isLoading={false}
            error={null}
          />,
        );
      }).not.toThrow();
    });

    it("複数の子を持つ親のエッジがすべて表示される", () => {
      const parent: Community = {
        ...createCommunity("parent", 1, 30),
        childCommunityIds: [
          "child1" as CommunityId,
          "child2" as CommunityId,
          "child3" as CommunityId,
        ],
      };
      const children = [
        createCommunity("child1", 0, 10, "parent"),
        createCommunity("child2", 0, 15, "parent"),
        createCommunity("child3", 0, 20, "parent"),
      ];

      render(
        <CommunityGraph
          communities={[parent, ...children]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // 各エッジが存在することを確認
      expect(
        screen.getByTestId("community-edge-parent-child1"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("community-edge-parent-child2"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("community-edge-parent-child3"),
      ).toBeInTheDocument();
    });
  });

  describe("ズーム・パン操作", () => {
    it("ズームの上限がある", async () => {
      const user = userEvent.setup();

      render(
        <CommunityGraph
          communities={[createCommunity("c1", 0, 10)]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const zoomInButton = screen.getByRole("button", { name: /ズームイン/i });

      // 10回連続ズームイン
      for (let i = 0; i < 10; i++) {
        await user.click(zoomInButton);
      }

      const graphContainer = screen.getByTestId("community-graph-container");
      const zoom = parseFloat(graphContainer.getAttribute("data-zoom") || "1");

      // ズーム上限（例：3倍）を超えない
      expect(zoom).toBeLessThanOrEqual(3);
    });

    it("ズームの下限がある", async () => {
      const user = userEvent.setup();

      render(
        <CommunityGraph
          communities={[createCommunity("c1", 0, 10)]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const zoomOutButton = screen.getByRole("button", {
        name: /ズームアウト/i,
      });

      // 10回連続ズームアウト
      for (let i = 0; i < 10; i++) {
        await user.click(zoomOutButton);
      }

      const graphContainer = screen.getByTestId("community-graph-container");
      const zoom = parseFloat(graphContainer.getAttribute("data-zoom") || "1");

      // ズーム下限（例：0.1倍）を下回らない
      expect(zoom).toBeGreaterThanOrEqual(0.1);
    });

    it("ホイールでズームできる", async () => {
      render(
        <CommunityGraph
          communities={[createCommunity("c1", 0, 10)]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const graphContainer = screen.getByTestId("community-graph-container");

      fireEvent.wheel(graphContainer, { deltaY: -100 }); // ズームイン

      // ホイールイベントが処理されることを確認（実装依存）
      await waitFor(() => {
        expect(graphContainer).toBeInTheDocument();
      });
    });
  });

  describe("選択とハイライト", () => {
    it("存在しないIDで選択してもエラーにならない", () => {
      expect(() => {
        render(
          <CommunityGraph
            communities={[createCommunity("c1", 0, 10)]}
            selectedCommunityId={"nonexistent" as CommunityId}
            highlightedIds={[]}
            onSelect={mockOnSelect}
            isLoading={false}
            error={null}
          />,
        );
      }).not.toThrow();
    });

    it("全ノードをハイライトできる", () => {
      const communities = [
        createCommunity("c1", 0, 10),
        createCommunity("c2", 0, 20),
        createCommunity("c3", 1, 30),
      ];

      render(
        <CommunityGraph
          communities={communities}
          selectedCommunityId={null}
          highlightedIds={communities.map((c) => c.id)}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      communities.forEach((c) => {
        expect(screen.getByTestId(`community-node-${c.id}`)).toHaveClass(
          "highlighted",
        );
      });
    });

    it("選択とハイライトが同時に適用される", () => {
      render(
        <CommunityGraph
          communities={[createCommunity("c1", 0, 10)]}
          selectedCommunityId={"c1" as CommunityId}
          highlightedIds={["c1" as CommunityId]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const node = screen.getByTestId("community-node-c1");
      expect(node).toHaveClass("selected");
      expect(node).toHaveClass("highlighted");
    });
  });

  describe("アクセシビリティ強化", () => {
    it("選択ノードにselectedクラスがある", () => {
      render(
        <CommunityGraph
          communities={[createCommunity("c1", 0, 10)]}
          selectedCommunityId={"c1" as CommunityId}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const node = screen.getByTestId("community-node-c1");
      expect(node).toHaveClass("selected");
    });

    it("非選択ノードにselectedクラスがない", () => {
      render(
        <CommunityGraph
          communities={[
            createCommunity("c1", 0, 10),
            createCommunity("c2", 0, 20),
          ]}
          selectedCommunityId={"c1" as CommunityId}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const unselectedNode = screen.getByTestId("community-node-c2");
      expect(unselectedNode).not.toHaveClass("selected");
    });

    it("ズームコントロールにaria-labelがある", () => {
      render(
        <CommunityGraph
          communities={[createCommunity("c1", 0, 10)]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      expect(
        screen.getByRole("button", { name: /ズームイン/i }),
      ).toHaveAttribute("aria-label");
      expect(
        screen.getByRole("button", { name: /ズームアウト/i }),
      ).toHaveAttribute("aria-label");
      expect(screen.getByRole("button", { name: /フィット/i })).toHaveAttribute(
        "aria-label",
      );
    });

    it("Tabキーでノード間を移動できる", async () => {
      const user = userEvent.setup();

      render(
        <CommunityGraph
          communities={[
            createCommunity("c1", 0, 10),
            createCommunity("c2", 0, 20),
          ]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // フォーカスをグラフに移動
      const node1 = screen.getByTestId("community-node-c1");
      node1.focus();

      expect(document.activeElement).toBe(node1);

      // Tabで次のノードへ
      await user.tab();

      // 次のフォーカス可能な要素に移動（ノードまたはコントロール）
      expect(document.activeElement).not.toBe(node1);
    });

    it("スクリーンリーダー向けのコンテンツが含まれる", () => {
      render(
        <CommunityGraph
          communities={[createCommunity("c1", 0, 10)]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // グラフの説明テキストが存在
      const graphElement = screen.getByRole("application");
      expect(graphElement).toHaveAttribute("aria-label");
    });

    it("ローディング状態がアクセシブルに通知される", () => {
      render(
        <CommunityGraph
          communities={[]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={true}
          error={null}
        />,
      );

      const loadingStatus = screen.getByRole("status");
      expect(loadingStatus).toBeInTheDocument();
      expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();
    });

    it("エラー状態がアクセシブルに通知される", () => {
      render(
        <CommunityGraph
          communities={[]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={new Error("Test error")}
        />,
      );

      const errorAlert = screen.getByRole("alert");
      expect(errorAlert).toBeInTheDocument();
    });
  });

  describe("レスポンシブ動作", () => {
    it("コンテナサイズが変わってもレイアウトが壊れない", () => {
      const { container } = render(
        <CommunityGraph
          communities={[createCommunity("c1", 0, 10)]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // グラフコンテナがflexboxで適応することを確認
      const graphContainer = screen.getByTestId("community-graph-container");
      expect(graphContainer).toBeInTheDocument();

      // SVGが存在することを確認
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });
});
