/**
 * Community Visualization 統合テスト
 * Phase 4: TDD Redフェーズ
 *
 * @description コンポーネント間・IPC通信の統合テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityVisualization } from "../components/community/templates/CommunityVisualization";
import type {
  Community,
  CommunityId,
  CommunitySummary,
  StoredEntity,
  EntityId,
} from "@repo/shared";

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

vi.stubGlobal("electronAPI", mockElectronAPI);

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
    size: 18,
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

const mockSummary: CommunitySummary = {
  communityId: "community-1" as CommunityId,
  level: 0,
  summary: "AIと機械学習に関連するエンティティのコミュニティ",
  keywords: ["AI", "機械学習", "深層学習"],
  mainEntities: ["GPT-4", "BERT"],
  mainRelations: ["使用", "関連"],
  sentiment: "positive",
  confidence: 0.85,
  tokenCount: 100,
  createdAt: new Date(),
};

const mockMembers: StoredEntity[] = [
  {
    id: "entity-1" as EntityId,
    name: "GPT-4",
    normalizedName: "gpt-4",
    type: "concept",
    description: "OpenAIの大規模言語モデル",
    aliases: [],
    embedding: null,
    chunkIds: [],
    mentionCount: 1,
    importance: 0.8,
    attributes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "entity-2" as EntityId,
    name: "BERT",
    normalizedName: "bert",
    type: "concept",
    description: "Googleの自然言語処理モデル",
    aliases: [],
    embedding: null,
    chunkIds: [],
    mentionCount: 1,
    importance: 0.7,
    attributes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("Community Visualization 統合テスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // デフォルトモック設定
    mockElectronAPI.community.getAll.mockResolvedValue({
      ok: true,
      value: mockCommunities,
    });
    mockElectronAPI.community.getById.mockResolvedValue({
      ok: true,
      value: mockCommunities[0],
    });
    mockElectronAPI.community.getSummary.mockResolvedValue({
      ok: true,
      value: mockSummary,
    });
    mockElectronAPI.community.getMembers.mockResolvedValue({
      ok: true,
      value: mockMembers,
    });
    mockElectronAPI.community.search.mockResolvedValue({
      ok: true,
      value: [mockCommunities[0]],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe("API接続テスト", () => {
    it("IPC経由でコミュニティ一覧が取得できる", async () => {
      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(mockElectronAPI.community.getAll).toHaveBeenCalled();
      });

      // グラフにコミュニティが表示される
      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("community-node-community-2"),
        ).toBeInTheDocument();
      });
    });

    it("IPC経由でコミュニティ詳細が取得できる", async () => {
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

      // 詳細取得APIが呼ばれる
      await waitFor(() => {
        expect(mockElectronAPI.community.getById).toHaveBeenCalledWith(
          "community-1",
        );
        expect(mockElectronAPI.community.getSummary).toHaveBeenCalledWith(
          "community-1",
        );
        expect(mockElectronAPI.community.getMembers).toHaveBeenCalledWith(
          "community-1",
        );
      });
    });

    it("IPC経由でレベル指定取得ができる", async () => {
      const level0Communities = mockCommunities.filter((c) => c.level === 0);
      mockElectronAPI.community.getByLevel.mockResolvedValue({
        ok: true,
        value: level0Communities,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByRole("combobox", { name: /レベルフィルター/i }),
        ).toBeInTheDocument();
      });

      // レベルを選択
      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      await user.selectOptions(levelSelect, "0");

      await waitFor(() => {
        expect(mockElectronAPI.community.getByLevel).toHaveBeenCalledWith(0);
      });
    });
  });

  describe("データフローテスト", () => {
    it("コミュニティ選択→詳細パネル表示のフローが動作する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      // グラフ表示を待つ
      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // ノードをクリック
      const node = screen.getByTestId("community-node-community-1");
      await user.click(node);

      // 詳細パネルが表示される
      await waitFor(() => {
        expect(
          screen.getByRole("complementary", { name: /コミュニティ詳細/i }),
        ).toBeInTheDocument();
        expect(screen.getByText("community-1")).toBeInTheDocument();
        expect(screen.getByText(/AIと機械学習/i)).toBeInTheDocument();
      });
    });

    it("フィルタ変更→グラフ更新のフローが動作する", async () => {
      const level1Communities = mockCommunities.filter((c) => c.level === 1);
      mockElectronAPI.community.getByLevel.mockResolvedValue({
        ok: true,
        value: level1Communities,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      // レベルフィルタを変更
      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      await user.selectOptions(levelSelect, "1");

      // グラフが更新される（Level 1のみ表示）
      await waitFor(() => {
        expect(
          screen.queryByTestId("community-node-community-1"),
        ).not.toBeInTheDocument();
        expect(
          screen.getByTestId("community-node-community-parent"),
        ).toBeInTheDocument();
      });
    });

    it("検索実行→結果ハイライトのフローが動作する", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(screen.getByRole("searchbox")).toBeInTheDocument();
      });

      // 検索入力
      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "AI");

      // デバウンス時間を進める
      await vi.advanceTimersByTimeAsync(300);

      // 検索APIが呼ばれる
      await waitFor(() => {
        expect(mockElectronAPI.community.search).toHaveBeenCalledWith("AI");
      });

      // 検索結果がハイライトされる
      await waitFor(() => {
        const highlightedNode = screen.getByTestId(
          "community-node-community-1",
        );
        expect(highlightedNode).toHaveClass("highlighted");
      });
    });

    it("選択解除でパネルが閉じる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      // ノードを選択
      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("community-node-community-1"));

      // 詳細パネル表示確認
      await waitFor(() => {
        expect(
          screen.getByRole("complementary", { name: /コミュニティ詳細/i }),
        ).toBeInTheDocument();
      });

      // Escapeキーで閉じる
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(
          screen.queryByRole("complementary", { name: /コミュニティ詳細/i }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("エラーハンドリング", () => {
    it("IPC障害時にエラー表示される", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: false,
        error: { code: "DB_ERROR", message: "データベース接続エラー" },
      });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(
          screen.getByText(/データの読み込みに失敗しました/i),
        ).toBeInTheDocument();
      });
    });

    it("リトライ機能が動作する", async () => {
      // 最初はエラー
      mockElectronAPI.community.getAll
        .mockResolvedValueOnce({
          ok: false,
          error: { code: "ERROR", message: "エラー" },
        })
        .mockResolvedValueOnce({
          ok: true,
          value: mockCommunities,
        });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      // エラー表示を待つ
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // リトライボタンをクリック
      const retryButton = screen.getByRole("button", { name: /再試行/i });
      await user.click(retryButton);

      // 成功後はグラフが表示される
      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });
    });

    it("詳細取得エラー時にパネルにエラー表示", async () => {
      mockElectronAPI.community.getSummary.mockResolvedValue({
        ok: false,
        error: { code: "NOT_FOUND", message: "要約が見つかりません" },
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("community-node-community-1"));

      await waitFor(() => {
        const panel = screen.getByRole("complementary", {
          name: /コミュニティ詳細/i,
        });
        expect(panel).toBeInTheDocument();
        // パネル内にエラーまたは要約未生成メッセージ
        expect(
          screen.getByText(/要約が生成されていません|エラー/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("状態同期テスト", () => {
    it("フィルタ状態が各コンポーネントで共有される", async () => {
      const level0Communities = mockCommunities.filter((c) => c.level === 0);
      mockElectronAPI.community.getByLevel.mockResolvedValue({
        ok: true,
        value: level0Communities,
      });

      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByRole("combobox", { name: /レベルフィルター/i }),
        ).toBeInTheDocument();
      });

      // フィルタを変更
      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      await user.selectOptions(levelSelect, "0");

      // グラフが更新される
      await waitFor(() => {
        // Level 0のみ表示
        expect(
          screen.getByTestId("community-node-community-1"),
        ).toBeInTheDocument();
        expect(
          screen.getByTestId("community-node-community-2"),
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId("community-node-community-parent"),
        ).not.toBeInTheDocument();
      });

      // フィルタのUI状態も更新される
      expect(levelSelect).toHaveValue("0");
    });

    it("選択状態がグラフと詳細パネルで同期される", async () => {
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
        // グラフでノードが選択状態
        expect(node).toHaveClass("selected");

        // 詳細パネルに同じコミュニティが表示
        expect(screen.getByText("community-1")).toBeInTheDocument();
      });

      // 別のノードを選択
      await waitFor(() => {
        expect(
          screen.getByTestId("community-node-community-2"),
        ).toBeInTheDocument();
      });

      const node2 = screen.getByTestId("community-node-community-2");
      await user.click(node2);

      await waitFor(() => {
        // 前のノードは選択解除
        expect(node).not.toHaveClass("selected");
        // 新しいノードが選択状態
        expect(node2).toHaveClass("selected");
      });
    });

    it("検索クエリがクリアされるとハイライトも解除される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(screen.getByRole("searchbox")).toBeInTheDocument();
      });

      // 検索実行
      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "AI");
      await vi.advanceTimersByTimeAsync(300);

      await waitFor(() => {
        const node = screen.getByTestId("community-node-community-1");
        expect(node).toHaveClass("highlighted");
      });

      // クリアボタンをクリック
      const clearButton = screen.getByRole("button", { name: /クリア/i });
      await user.click(clearButton);

      await waitFor(() => {
        const node = screen.getByTestId("community-node-community-1");
        expect(node).not.toHaveClass("highlighted");
      });
    });
  });

  describe("空状態", () => {
    it("コミュニティが0件の場合は空状態メッセージが表示される", async () => {
      mockElectronAPI.community.getAll.mockResolvedValue({
        ok: true,
        value: [],
      });

      render(<CommunityVisualization />);

      await waitFor(() => {
        expect(
          screen.getByText(/コミュニティが検出されていません/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("ローディング状態", () => {
    it("初期ロード中はスピナーが表示される", async () => {
      // 遅延させる
      mockElectronAPI.community.getAll.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  value: mockCommunities,
                }),
              100,
            ),
          ),
      );

      render(<CommunityVisualization />);

      // ローディング中
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(/読み込み中/i)).toBeInTheDocument();

      // ローディング完了
      await vi.advanceTimersByTimeAsync(100);

      await waitFor(() => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      });
    });
  });
});
