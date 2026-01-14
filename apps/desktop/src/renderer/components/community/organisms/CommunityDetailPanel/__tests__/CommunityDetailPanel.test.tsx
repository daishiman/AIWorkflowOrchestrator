/**
 * CommunityDetailPanel コンポーネントテスト
 * Phase 4: TDD Redフェーズ
 *
 * @description コミュニティ詳細を表示するパネルコンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityDetailPanel } from "../index";
import type {
  Community,
  CommunityId,
  CommunitySummary,
  StoredEntity,
  EntityId,
} from "@repo/shared";

// モックデータ
const mockCommunity: Community = {
  id: "community-1" as CommunityId,
  level: 1,
  size: 15,
  memberEntityIds: [
    "entity-1" as EntityId,
    "entity-2" as EntityId,
    "entity-3" as EntityId,
  ],
  childCommunityIds: [],
  parentCommunityId: undefined,
  internalEdges: 8,
  externalEdges: 3,
  modularity: 0.6,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSummary: CommunitySummary = {
  communityId: "community-1" as CommunityId,
  level: 1,
  summary: "このコミュニティは機械学習関連のエンティティを含んでいます。",
  keywords: ["AI", "機械学習", "深層学習", "NLP"],
  mainEntities: ["GPT-4", "BERT", "TensorFlow"],
  mainRelations: ["使用する", "関連する", "依存する"],
  sentiment: "positive",
  confidence: 0.87,
  tokenCount: 150,
  createdAt: new Date(),
};

const mockMembers: StoredEntity[] = [
  {
    id: "entity-1" as EntityId,
    name: "GPT-4",
    type: "AI",
    description: "OpenAIの大規模言語モデル",
  },
  {
    id: "entity-2" as EntityId,
    name: "BERT",
    type: "AI",
    description: "Googleの自然言語処理モデル",
  },
  {
    id: "entity-3" as EntityId,
    name: "TensorFlow",
    type: "Library",
    description: "機械学習フレームワーク",
  },
];

// 大量のメンバーを生成するヘルパー
const generateManyMembers = (count: number): StoredEntity[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `entity-${i}` as EntityId,
    name: `Entity ${i}`,
    type: i % 2 === 0 ? "AI" : "Library",
    description: `Description for entity ${i}`,
  }));
};

describe("CommunityDetailPanel", () => {
  const mockOnClose = vi.fn();
  const mockOnEntityClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("要約表示", () => {
    it("コミュニティ要約が表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(
        screen.getByText(/機械学習関連のエンティティを含んでいます/i),
      ).toBeInTheDocument();
    });

    it("キーワードリストが表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("AI")).toBeInTheDocument();
      expect(screen.getByText("機械学習")).toBeInTheDocument();
      expect(screen.getByText("深層学習")).toBeInTheDocument();
      expect(screen.getByText("NLP")).toBeInTheDocument();
    });

    it("主要エンティティが表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // 主要エンティティセクションの存在を確認（リストアイテムとして表示される）
      const mainEntitiesList = screen.getAllByRole("listitem");
      const mainEntityTexts = mainEntitiesList.map((li) => li.textContent);
      expect(mainEntityTexts.some((text) => text?.includes("GPT-4"))).toBe(
        true,
      );
      expect(mainEntityTexts.some((text) => text?.includes("BERT"))).toBe(true);
      expect(mainEntityTexts.some((text) => text?.includes("TensorFlow"))).toBe(
        true,
      );
    });

    it("センチメントが表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // positiveセンチメントが視覚的に表示されることを確認
      expect(screen.getByTestId("sentiment-indicator")).toHaveAttribute(
        "data-sentiment",
        "positive",
      );
    });

    it("信頼度が表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // 87%の信頼度が表示されることを確認
      expect(screen.getByText(/87%/)).toBeInTheDocument();
    });
  });

  describe("メンバー表示", () => {
    it("メンバーエンティティリストが表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // メンバー一覧セクションが存在
      const memberList = screen.getByRole("list", { name: /メンバー/i });
      expect(memberList).toBeInTheDocument();

      // メンバーリスト内で各メンバーが表示されている
      const memberListItems = within(memberList).getAllByRole("listitem");
      expect(memberListItems).toHaveLength(mockMembers.length);

      mockMembers.forEach((member) => {
        expect(within(memberList).getByText(member.name)).toBeInTheDocument();
      });
    });

    it("メンバーをクリックで詳細が表示される", async () => {
      const user = userEvent.setup();

      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
          onEntityClick={mockOnEntityClick}
        />,
      );

      // メンバーリスト内のGPT-4をクリック
      const memberList = screen.getByRole("list", { name: /メンバー/i });
      const memberItem = within(memberList).getByText("GPT-4");
      await user.click(memberItem);

      expect(mockOnEntityClick).toHaveBeenCalledWith("entity-1");
    });

    it("メンバーが多い場合はスクロール可能", () => {
      const manyMembers = generateManyMembers(20);

      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={manyMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const memberList = screen.getByRole("list", { name: /メンバー/i });
      expect(memberList).toHaveClass("overflow-y-auto");
    });

    it("メンバー件数が表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/3件/)).toBeInTheDocument();
    });
  });

  describe("状態", () => {
    it("未選択時は空状態メッセージが表示される", () => {
      render(
        <CommunityDetailPanel
          community={null}
          summary={null}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(
        screen.getByText(/コミュニティを選択してください/i),
      ).toBeInTheDocument();
    });

    it("ローディング中はスケルトンが表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={null}
          members={[]}
          isLoading={true}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByTestId("skeleton-summary")).toBeInTheDocument();
      expect(screen.getByTestId("skeleton-keywords")).toBeInTheDocument();
      expect(screen.getByTestId("skeleton-members")).toBeInTheDocument();
    });

    it("要約未生成時は適切なメッセージが表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={null}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/要約が生成されていません/i)).toBeInTheDocument();
    });

    it("エラー時はエラーメッセージが表示される", () => {
      const testError = new Error("データ取得エラー");

      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={null}
          members={[]}
          isLoading={false}
          error={testError}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/データ取得エラー/i)).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("閉じるボタンでonCloseが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const closeButton = screen.getByRole("button", { name: /閉じる/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("Escapeキーでパネルが閉じる", async () => {
      const user = userEvent.setup();

      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      await user.keyboard("{Escape}");

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("アクセシビリティ", () => {
    it("パネルにaria-labelが設定されている", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByRole("complementary")).toHaveAttribute(
        "aria-label",
        "コミュニティ詳細",
      );
    });

    it("見出しの階層が適切", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // h2: コミュニティ名
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();

      // h3: セクションタイトル（要約、キーワード、メンバー）
      const h3Elements = screen.getAllByRole("heading", { level: 3 });
      expect(h3Elements.length).toBeGreaterThanOrEqual(3);
    });

    it("フォーカス可能な要素にフォーカスが当たる", async () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // コンポーネントマウント時に閉じるボタンにフォーカスが当たる
      // (useEffectでfocusされるため、waitForで待機)
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /閉じる/i })).toHaveFocus();
      });
    });
  });

  describe("コミュニティ基本情報", () => {
    it("コミュニティ名（ID）が表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // h2ヘッダーにコミュニティIDが表示される
      const heading = screen.getByRole("heading", { level: 2 });
      expect(heading).toHaveTextContent("community-1");
    });

    it("階層レベルが表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/Level 1/)).toBeInTheDocument();
    });

    it("サイズ（メンバー数）が表示される", () => {
      render(
        <CommunityDetailPanel
          community={mockCommunity}
          summary={mockSummary}
          members={mockMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/15件/)).toBeInTheDocument();
    });
  });
});
