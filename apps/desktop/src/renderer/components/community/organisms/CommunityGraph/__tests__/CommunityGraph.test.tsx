/**
 * CommunityGraph コンポーネントテスト
 * Phase 4: TDD Redフェーズ
 *
 * @description コミュニティ構造をグラフ形式で表示するコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityGraph } from "../index";
import type { Community, CommunityId } from "@repo/shared";

// モックデータ
const mockCommunities: Community[] = [
  {
    id: "community-1" as CommunityId,
    level: 0,
    size: 10,
    memberEntityIds: [],
    childCommunityIds: [],
    parentCommunityId: undefined,
    internalEdges: 5,
    externalEdges: 2,
    modularity: 0.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "community-2" as CommunityId,
    level: 0,
    size: 5,
    memberEntityIds: [],
    childCommunityIds: [],
    parentCommunityId: "community-parent" as CommunityId,
    internalEdges: 3,
    externalEdges: 1,
    modularity: 0.3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "community-parent" as CommunityId,
    level: 1,
    size: 15,
    memberEntityIds: [],
    childCommunityIds: [
      "community-1" as CommunityId,
      "community-2" as CommunityId,
    ],
    parentCommunityId: undefined,
    internalEdges: 8,
    externalEdges: 3,
    modularity: 0.6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// 大量データモック生成
const generateLargeMockData = (count: number): Community[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `community-${i}` as CommunityId,
    level: i % 3,
    size: Math.floor(Math.random() * 20) + 1,
    memberEntityIds: [],
    childCommunityIds: [],
    parentCommunityId:
      i > 0 ? (`community-${Math.floor(i / 3)}` as CommunityId) : undefined,
    internalEdges: Math.floor(Math.random() * 10),
    externalEdges: Math.floor(Math.random() * 5),
    modularity: Math.random(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

describe("CommunityGraph", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("表示テスト", () => {
    it("コミュニティがノードとして表示される", () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // 各コミュニティがノードとして表示されることを確認
      expect(
        screen.getByTestId("community-node-community-1"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("community-node-community-2"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("community-node-community-parent"),
      ).toBeInTheDocument();
    });

    it("親子関係がエッジとして表示される", () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // 親子関係のエッジが表示されることを確認
      expect(
        screen.getByTestId("community-edge-community-parent-community-2"),
      ).toBeInTheDocument();
    });

    it("階層レベルに応じたレイアウトで表示される", () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // 上位レベルのノードが下位レベルより上に配置されることを確認
      const parentNode = screen.getByTestId("community-node-community-parent");
      const childNode = screen.getByTestId("community-node-community-2");

      // Y座標を比較（親が上にある）
      const parentStyle = window.getComputedStyle(parentNode);
      const childStyle = window.getComputedStyle(childNode);
      expect(parseFloat(parentStyle.top)).toBeLessThan(
        parseFloat(childStyle.top),
      );
    });

    it("コミュニティサイズに応じたノードサイズで表示される", () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // サイズが大きいコミュニティのノードがより大きく表示されることを確認
      const largeNode = screen.getByTestId("community-node-community-parent"); // size: 15
      const smallNode = screen.getByTestId("community-node-community-2"); // size: 5

      // SVG要素の場合、rect子要素のwidth属性をチェック
      const largeRect = largeNode.querySelector("rect");
      const smallRect = smallNode.querySelector("rect");

      const largeWidth = parseFloat(largeRect?.getAttribute("width") || "0");
      const smallWidth = parseFloat(smallRect?.getAttribute("width") || "0");
      expect(largeWidth).toBeGreaterThan(smallWidth);
    });
  });

  describe("インタラクションテスト", () => {
    it("ノードクリックでonSelectが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const node = screen.getByTestId("community-node-community-1");
      await user.click(node);

      expect(mockOnSelect).toHaveBeenCalledWith("community-1");
    });

    it("ズーム操作でビューが拡大/縮小する", async () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const graphContainer = screen.getByTestId("community-graph-container");

      // ズームイン
      const zoomInButton = screen.getByRole("button", { name: /ズームイン/i });
      fireEvent.click(zoomInButton);

      await waitFor(() => {
        expect(graphContainer).toHaveAttribute(
          "data-zoom",
          expect.stringMatching(/1\.[1-9]/),
        );
      });

      // ズームアウト
      const zoomOutButton = screen.getByRole("button", {
        name: /ズームアウト/i,
      });
      fireEvent.click(zoomOutButton);

      await waitFor(() => {
        expect(graphContainer).toHaveAttribute("data-zoom", "1");
      });
    });

    it("パン操作でビューが移動する", async () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const graphContainer = screen.getByTestId("community-graph-container");

      // ドラッグ操作をシミュレート
      fireEvent.mouseDown(graphContainer, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(graphContainer, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(graphContainer);

      await waitFor(() => {
        expect(graphContainer).toHaveAttribute(
          "data-pan-x",
          expect.any(String),
        );
        expect(graphContainer).toHaveAttribute(
          "data-pan-y",
          expect.any(String),
        );
      });
    });

    it("フィットボタンでビュー全体が表示される", async () => {
      const user = userEvent.setup();

      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const fitButton = screen.getByRole("button", { name: /フィット/i });
      await user.click(fitButton);

      const graphContainer = screen.getByTestId("community-graph-container");
      await waitFor(() => {
        expect(graphContainer).toHaveAttribute("data-fit", "true");
      });
    });
  });

  describe("エッジケース", () => {
    it("空データで適切なメッセージが表示される", () => {
      render(
        <CommunityGraph
          communities={[]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      expect(
        screen.getByText(/コミュニティが検出されていません/i),
      ).toBeInTheDocument();
    });

    it("大量データ（100+）でもレンダリングされる", async () => {
      const largeMockData = generateLargeMockData(150);

      render(
        <CommunityGraph
          communities={largeMockData}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // グラフコンテナが存在することを確認
      expect(
        screen.getByTestId("community-graph-container"),
      ).toBeInTheDocument();

      // 最初のノードが表示されることを確認
      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-0"),
        ).toBeInTheDocument();
      });
    });

    it("ローディング中はスピナーが表示される", () => {
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

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();
    });

    it("エラー時はエラーメッセージが表示される", () => {
      const testError = new Error("テストエラー");

      render(
        <CommunityGraph
          communities={[]}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={testError}
        />,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText(/データの読み込みに失敗しました/i),
      ).toBeInTheDocument();
    });
  });

  describe("選択状態", () => {
    it("選択中のノードがハイライト表示される", () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={"community-1" as CommunityId}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const selectedNode = screen.getByTestId("community-node-community-1");
      expect(selectedNode).toHaveClass("selected");
    });

    it("検索ハイライト対象がハイライト表示される", () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[
            "community-1" as CommunityId,
            "community-2" as CommunityId,
          ]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const highlightedNode1 = screen.getByTestId("community-node-community-1");
      const highlightedNode2 = screen.getByTestId("community-node-community-2");
      const nonHighlightedNode = screen.getByTestId(
        "community-node-community-parent",
      );

      expect(highlightedNode1).toHaveClass("highlighted");
      expect(highlightedNode2).toHaveClass("highlighted");
      expect(nonHighlightedNode).not.toHaveClass("highlighted");
    });
  });

  describe("アクセシビリティ", () => {
    it("グラフにaria-labelが設定されている", () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      expect(screen.getByRole("application")).toHaveAttribute(
        "aria-label",
        "コミュニティ構造グラフ",
      );
    });

    it("ノードがキーボードでフォーカス可能", async () => {
      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      // SVGノードがフォーカス可能であることを確認（tabIndex属性を持つ）
      const node = screen.getByTestId("community-node-community-1");
      expect(node).toHaveAttribute("tabindex", "0");

      // フォーカスを当てる
      node.focus();
      expect(document.activeElement).toBe(node);
    });

    it("Enterキーでノードを選択できる", async () => {
      const user = userEvent.setup();

      render(
        <CommunityGraph
          communities={mockCommunities}
          selectedCommunityId={null}
          highlightedIds={[]}
          onSelect={mockOnSelect}
          isLoading={false}
          error={null}
        />,
      );

      const node = screen.getByTestId("community-node-community-1");
      node.focus();
      await user.keyboard("{Enter}");

      expect(mockOnSelect).toHaveBeenCalledWith("community-1");
    });
  });
});
