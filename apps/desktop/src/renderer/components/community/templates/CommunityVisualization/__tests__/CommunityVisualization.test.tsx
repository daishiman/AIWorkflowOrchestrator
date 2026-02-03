/**
 * CommunityVisualization 統合テスト
 * Phase 6: テスト拡充
 *
 * @description コミュニティ可視化テンプレートの統合テスト
 * Filter, Graph, DetailPanel の連携動作を検証
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityVisualization } from "../index";
import type {
  Community,
  CommunityId,
  CommunitySummary,
  StoredEntity,
  EntityId,
} from "@repo/shared";

// モックデータ
const mockCommunities: Community[] = [
  {
    id: "community-1" as CommunityId,
    level: 0,
    size: 10,
    memberEntityIds: ["entity-1" as EntityId, "entity-2" as EntityId],
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
    size: 8,
    memberEntityIds: ["entity-3" as EntityId],
    childCommunityIds: [],
    parentCommunityId: "community-parent" as CommunityId,
    internalEdges: 3,
    externalEdges: 1,
    modularity: 0.4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "community-parent" as CommunityId,
    level: 1,
    size: 20,
    memberEntityIds: [],
    childCommunityIds: ["community-2" as CommunityId],
    parentCommunityId: undefined,
    internalEdges: 8,
    externalEdges: 3,
    modularity: 0.6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockSummary: CommunitySummary = {
  communityId: "community-1" as CommunityId,
  level: 0,
  summary: "AIと機械学習に関連するコミュニティです。",
  keywords: ["AI", "機械学習", "データ分析"],
  mainEntities: ["TensorFlow", "PyTorch"],
  mainRelations: ["依存", "関連"],
  sentiment: "positive",
  confidence: 0.85,
  tokenCount: 120,
  createdAt: new Date(),
};

const mockMembers: StoredEntity[] = [
  {
    id: "entity-1" as EntityId,
    name: "TensorFlow",
    type: "Library",
    description: "機械学習フレームワーク",
  },
  {
    id: "entity-2" as EntityId,
    name: "PyTorch",
    type: "Library",
    description: "ディープラーニングフレームワーク",
  },
];

// ElectronAPI モック
const mockElectronAPI = {
  community: {
    getAll: vi.fn(),
    getByLevel: vi.fn(),
    getById: vi.fn(),
    getMembers: vi.fn(),
    getSummary: vi.fn(),
    search: vi.fn(),
  },
};

// グローバルwindow.electronAPIをモック
vi.stubGlobal("electronAPI", mockElectronAPI);

describe("CommunityVisualization Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // デフォルトのモック設定
    mockElectronAPI.community.getAll.mockResolvedValue({
      ok: true,
      value: mockCommunities,
    });
    mockElectronAPI.community.getByLevel.mockImplementation((level: number) => {
      return Promise.resolve({
        ok: true,
        value: mockCommunities.filter((c) => c.level === level),
      });
    });
    mockElectronAPI.community.getSummary.mockResolvedValue({
      ok: true,
      value: mockSummary,
    });
    mockElectronAPI.community.getMembers.mockResolvedValue({
      ok: true,
      value: mockMembers,
    });
    mockElectronAPI.community.search.mockImplementation((query: string) => {
      const results = mockCommunities.filter((c) =>
        c.id.toLowerCase().includes(query.toLowerCase()),
      );
      return Promise.resolve({ ok: true, value: results });
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe("初期レンダリング", () => {
    it("テンプレートが正常にレンダリングされる", async () => {
      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-visualization"),
        ).toBeInTheDocument();
      });
    });

    it("初期ロード時にコミュニティ一覧を取得する", async () => {
      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(mockElectronAPI.community.getAll).toHaveBeenCalled();
      });
    });

    it("フィルターバーが表示される", async () => {
      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByRole("combobox", { name: /レベルフィルター/i }),
        ).toBeInTheDocument();
        expect(screen.getByRole("searchbox")).toBeInTheDocument();
      });
    });

    it("グラフ領域が表示される", async () => {
      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-graph-container"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Filter → Graph 連携", () => {
    it("レベルフィルター選択でグラフが更新される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // レベル1を選択
      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      await user.selectOptions(levelSelect, "1");

      await waitFor(() => {
        expect(mockElectronAPI.community.getByLevel).toHaveBeenCalledWith(1);
      });
    });

    it("検索入力でグラフノードがハイライトされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      mockElectronAPI.community.search.mockResolvedValue({
        ok: true,
        value: [mockCommunities[0]],
      });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // 検索入力
      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "community-1");
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => {
        const node = screen.getByTestId("community-node-community-1");
        expect(node).toHaveClass("highlighted");
      });
    });

    it("検索クリアでハイライトが解除される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      mockElectronAPI.community.search.mockResolvedValue({
        ok: true,
        value: [mockCommunities[0]],
      });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // 検索して検索をクリア
      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "community-1");
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /クリア/i }),
        ).toBeInTheDocument();
      });

      const clearButton = screen.getByRole("button", { name: /クリア/i });
      await user.click(clearButton);

      // クリア後のReact状態更新を待機
      await vi.advanceTimersByTimeAsync(100);

      await waitFor(() => {
        const node = screen.getByTestId("community-node-community-1");
        expect(node).not.toHaveClass("highlighted");
      });
    });
  });

  describe("Graph → DetailPanel 連携", () => {
    it("ノードクリックで詳細パネルが表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // ノードをクリック
      const node = screen.getByTestId("community-node-community-1");
      await user.click(node);

      await waitFor(() => {
        expect(
          screen.getByRole("complementary", { name: "コミュニティ詳細" }),
        ).toBeInTheDocument();
      });
    });

    it("ノード選択で要約とメンバーが取得される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // ノードをクリック
      const node = screen.getByTestId("community-node-community-1");
      await user.click(node);

      await waitFor(() => {
        expect(mockElectronAPI.community.getSummary).toHaveBeenCalledWith(
          "community-1",
        );
        expect(mockElectronAPI.community.getMembers).toHaveBeenCalledWith(
          "community-1",
        );
      });
    });

    it("詳細パネルに選択したコミュニティ情報が表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // ノードをクリック
      const node = screen.getByTestId("community-node-community-1");
      await user.click(node);

      await waitFor(() => {
        // 要約が表示される
        expect(
          screen.getByText(/AIと機械学習に関連するコミュニティ/),
        ).toBeInTheDocument();
      });
    });

    it("詳細パネル閉じるで選択が解除される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // ノードをクリック
      const node = screen.getByTestId("community-node-community-1");
      await user.click(node);

      await waitFor(() => {
        expect(
          screen.getByRole("complementary", { name: "コミュニティ詳細" }),
        ).toBeInTheDocument();
      });

      // 閉じるボタンをクリック
      const closeButton = screen.getByRole("button", { name: /閉じる/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(node).not.toHaveClass("selected");
      });
    });
  });

  describe("Filter → Graph → DetailPanel 複合連携", () => {
    it("レベル変更で選択状態がリセットされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // ノードを選択
      const node = screen.getByTestId("community-node-community-1");
      await user.click(node);

      await waitFor(() => {
        expect(
          screen.getByRole("complementary", { name: "コミュニティ詳細" }),
        ).toBeInTheDocument();
      });

      // レベルを変更
      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      await user.selectOptions(levelSelect, "1");

      // 詳細パネルが閉じる（選択がリセットされる）
      await waitFor(() => {
        // 詳細パネル内の詳細情報が消えることを確認
        expect(
          screen.queryByText(/AIと機械学習に関連するコミュニティ/),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("エラー状態の統合", () => {
    it("API エラー時にグラフにエラー表示される", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: false,
        error: { code: "DB_ERROR", message: "データベースエラー" },
      });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("詳細取得エラー時にパネルにエラー表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      mockElectronAPI.community.getSummary.mockResolvedValue({
        ok: false,
        error: { code: "NOT_FOUND", message: "要約が見つかりません" },
      });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // ノードをクリック
      const node = screen.getByTestId("community-node-community-1");
      await user.click(node);

      await waitFor(() => {
        // 要約未生成メッセージが表示される
        expect(
          screen.getByText(/要約が生成されていません/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("パフォーマンス", () => {
    it("100+ コミュニティでもレンダリングが完了する", async () => {
      const largeCommunities: Community[] = Array.from(
        { length: 150 },
        (_, i) => ({
          id: `community-${i}` as CommunityId,
          level: i % 3,
          size: Math.floor(Math.random() * 20) + 1,
          memberEntityIds: [],
          childCommunityIds: [],
          parentCommunityId: undefined,
          internalEdges: 5,
          externalEdges: 2,
          modularity: 0.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: largeCommunities,
      });

      render(<CommunityVisualization />);

      await waitFor(
        () => {
          expect(
            screen.getByTestId("community-graph-container"),
          ).toBeInTheDocument();
          expect(
            screen.getByTestId("community-node-community-0"),
          ).toBeInTheDocument();
        },
        { timeout: 5000 },
      );
    });
  });

  describe("アクセシビリティ", () => {
    it("キーボードのみで全操作が可能", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // Tabでフィルターにフォーカス
      await user.tab();
      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      expect(levelSelect).toHaveFocus();

      // 次の要素へ
      await user.tab();
      expect(screen.getByRole("searchbox")).toHaveFocus();
    });

    it("すべての主要エリアにアクセシブルなラベルがある", async () => {
      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByRole("application", { name: "コミュニティ構造グラフ" }),
        ).toBeInTheDocument();
        expect(screen.getByRole("search")).toBeInTheDocument();
      });
    });
  });
});
