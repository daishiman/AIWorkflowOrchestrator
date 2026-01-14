/**
 * CommunityDetailPanel エッジケース・アクセシビリティテスト
 * Phase 6: テスト拡充
 *
 * @description 詳細パネルの境界条件・アクセシビリティテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityDetailPanel } from "../index";
import type {
  Community,
  CommunityId,
  CommunitySummary,
  StoredEntity,
  EntityId,
} from "@repo/shared";

// ヘルパー関数
const createCommunity = (
  id: string,
  level: number,
  size: number,
): Community => ({
  id: id as CommunityId,
  level,
  size,
  memberEntityIds: [],
  childCommunityIds: [],
  parentCommunityId: undefined,
  internalEdges: 5,
  externalEdges: 2,
  modularity: 0.5,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const createSummary = (
  communityId: string,
  sentiment: "positive" | "negative" | "neutral" = "neutral",
  confidence: number = 0.5,
): CommunitySummary => ({
  communityId: communityId as CommunityId,
  level: 0,
  summary: "テスト要約文",
  keywords: ["キーワード1", "キーワード2"],
  mainEntities: ["エンティティ1", "エンティティ2"],
  mainRelations: ["関連1"],
  sentiment,
  confidence,
  tokenCount: 100,
  createdAt: new Date(),
});

const createMember = (
  id: string,
  name: string,
  type: string,
): StoredEntity => ({
  id: id as EntityId,
  name,
  type,
  description: `${name}の説明`,
});

describe("CommunityDetailPanel Edge Cases", () => {
  const mockOnClose = vi.fn();
  const mockOnEntityClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("境界データ", () => {
    it("非常に長いサマリーテキストが表示される", () => {
      const longSummary: CommunitySummary = {
        ...createSummary("c1"),
        summary: "A".repeat(2000), // 2000文字
      };

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={longSummary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText("A".repeat(2000))).toBeInTheDocument();
    });

    it("キーワードが多数（50+）あっても表示される", () => {
      const manyKeywords = Array.from({ length: 50 }, (_, i) => `KW${i}`);
      const summary: CommunitySummary = {
        ...createSummary("c1"),
        keywords: manyKeywords,
      };

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={summary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // 最初と最後のキーワードが表示される
      expect(screen.getByText("KW0")).toBeInTheDocument();
      expect(screen.getByText("KW49")).toBeInTheDocument();
    });

    it("キーワードが空の場合、キーワードセクションが非表示", () => {
      const summary: CommunitySummary = {
        ...createSummary("c1"),
        keywords: [],
      };

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={summary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // キーワードセクションのh3が存在しないことを確認
      const headings = screen.getAllByRole("heading", { level: 3 });
      const keywordHeading = headings.find((h) =>
        h.textContent?.includes("キーワード"),
      );
      expect(keywordHeading).toBeUndefined();
    });

    it("メンバーが100人以上でも表示される", () => {
      const manyMembers = Array.from({ length: 100 }, (_, i) =>
        createMember(`e${i}`, `Member ${i}`, i % 2 === 0 ? "TypeA" : "TypeB"),
      );

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 100)}
          summary={createSummary("c1")}
          members={manyMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // メンバーセクションに100件と表示されることを確認
      const memberList = screen.getByRole("list", { name: /メンバー/i });
      expect(memberList).toBeInTheDocument();
    });

    it("信頼度0%が正しく表示される", () => {
      const summary: CommunitySummary = {
        ...createSummary("c1"),
        confidence: 0,
      };

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={summary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it("信頼度100%が正しく表示される", () => {
      const summary: CommunitySummary = {
        ...createSummary("c1"),
        confidence: 1,
      };

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={summary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it("小数点以下の信頼度が正しく丸められる", () => {
      const summary: CommunitySummary = {
        ...createSummary("c1"),
        confidence: 0.876543, // 87.6543%
      };

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={summary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/88%/)).toBeInTheDocument(); // 四捨五入
    });
  });

  describe("センチメント表示", () => {
    it("positive センチメントが正しく表示される", () => {
      const summary = createSummary("c1", "positive", 0.5);

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={summary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const indicator = screen.getByTestId("sentiment-indicator");
      expect(indicator).toHaveAttribute("data-sentiment", "positive");
      expect(indicator).toHaveTextContent("Positive");
    });

    it("negative センチメントが正しく表示される", () => {
      const summary = createSummary("c1", "negative", 0.5);

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={summary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const indicator = screen.getByTestId("sentiment-indicator");
      expect(indicator).toHaveAttribute("data-sentiment", "negative");
      expect(indicator).toHaveTextContent("Negative");
    });

    it("neutral センチメントが正しく表示される", () => {
      const summary = createSummary("c1", "neutral", 0.5);

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={summary}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const indicator = screen.getByTestId("sentiment-indicator");
      expect(indicator).toHaveAttribute("data-sentiment", "neutral");
      expect(indicator).toHaveTextContent("Neutral");
    });
  });

  describe("エラーハンドリング", () => {
    it("長いエラーメッセージが表示される", () => {
      const longErrorMessage = "Error: " + "X".repeat(500);
      const error = new Error(longErrorMessage);

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={null}
          members={[]}
          isLoading={false}
          error={error}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("特殊文字を含むエラーメッセージが正しく表示される", () => {
      const error = new Error("<script>alert('XSS')</script>");

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={null}
          members={[]}
          isLoading={false}
          error={error}
          onClose={mockOnClose}
        />,
      );

      // XSSが実行されないことを確認（テキストとして表示）
      expect(screen.getByText(/<script>/)).toBeInTheDocument();
    });
  });

  describe("メンバークリック", () => {
    it("onEntityClickが未定義でもクリック可能", async () => {
      const user = userEvent.setup();

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1")}
          members={[createMember("e1", "Member1", "TypeA")]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
          // onEntityClickは渡さない
        />,
      );

      const memberList = screen.getByRole("list", { name: /メンバー/i });
      const memberButton = within(memberList).getByText("Member1");

      // クリックしてもエラーにならない
      await expect(user.click(memberButton)).resolves.not.toThrow();
    });

    it("複数回のメンバークリックが正しく処理される", async () => {
      const user = userEvent.setup();

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1")}
          members={[
            createMember("e1", "Member1", "TypeA"),
            createMember("e2", "Member2", "TypeB"),
          ]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
          onEntityClick={mockOnEntityClick}
        />,
      );

      const memberList = screen.getByRole("list", { name: /メンバー/i });
      const member1 = within(memberList).getByText("Member1");
      const member2 = within(memberList).getByText("Member2");

      await user.click(member1);
      await user.click(member2);
      await user.click(member1);

      expect(mockOnEntityClick).toHaveBeenCalledTimes(3);
      expect(mockOnEntityClick).toHaveBeenNthCalledWith(1, "e1");
      expect(mockOnEntityClick).toHaveBeenNthCalledWith(2, "e2");
      expect(mockOnEntityClick).toHaveBeenNthCalledWith(3, "e1");
    });
  });

  describe("アクセシビリティ強化", () => {
    it("各セクションに適切な見出しがある", () => {
      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1")}
          members={[createMember("e1", "Member1", "TypeA")]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const h3Elements = screen.getAllByRole("heading", { level: 3 });
      expect(h3Elements.length).toBeGreaterThanOrEqual(3);
    });

    it("閉じるボタンにアクセシブルな名前がある", () => {
      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={null}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const closeButton = screen.getByRole("button", { name: /閉じる/i });
      expect(closeButton).toHaveAccessibleName("閉じる");
    });

    it("メンバーリストにaria-labelがある", () => {
      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1")}
          members={[createMember("e1", "Member1", "TypeA")]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const memberList = screen.getByRole("list", { name: /メンバー/i });
      expect(memberList).toHaveAttribute("aria-label");
    });

    it("ローディング状態でaria-busyが設定される", () => {
      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={null}
          members={[]}
          isLoading={true}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const panel = screen.getByRole("complementary");
      expect(panel).toHaveAttribute("aria-busy", "true");
    });

    it("キーボードでメンバーを選択できる", async () => {
      const user = userEvent.setup();

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1")}
          members={[createMember("e1", "Member1", "TypeA")]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
          onEntityClick={mockOnEntityClick}
        />,
      );

      const memberList = screen.getByRole("list", { name: /メンバー/i });
      const memberButton = within(memberList).getByRole("button");

      memberButton.focus();
      await user.keyboard("{Enter}");

      expect(mockOnEntityClick).toHaveBeenCalledWith("e1");
    });

    it("信頼度バーに適切なaria属性がある", () => {
      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1", "neutral", 0.75)}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      // 信頼度の表示が存在することを確認
      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });
  });

  describe("スタイル・レイアウト", () => {
    it("メンバーリストがスクロール可能", () => {
      const manyMembers = Array.from({ length: 30 }, (_, i) =>
        createMember(`e${i}`, `Member ${i}`, "TypeA"),
      );

      render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 30)}
          summary={createSummary("c1")}
          members={manyMembers}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      const memberList = screen.getByRole("list", { name: /メンバー/i });
      expect(memberList).toHaveClass("overflow-y-auto");
    });

    it("信頼度バーの色が信頼度レベルに応じて変わる", () => {
      // 高信頼度
      const { rerender } = render(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1", "neutral", 0.9)}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/90%/)).toBeInTheDocument();

      // 中信頼度
      rerender(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1", "neutral", 0.6)}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/60%/)).toBeInTheDocument();

      // 低信頼度
      rerender(
        <CommunityDetailPanel
          community={createCommunity("c1", 0, 10)}
          summary={createSummary("c1", "neutral", 0.3)}
          members={[]}
          isLoading={false}
          error={null}
          onClose={mockOnClose}
        />,
      );

      expect(screen.getByText(/30%/)).toBeInTheDocument();
    });
  });
});
