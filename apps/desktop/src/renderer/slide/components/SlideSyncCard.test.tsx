/**
 * SlideSyncCard コンポーネントテスト
 * @module renderer/slide/components/SlideSyncCard.test
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SlideSyncCard, variantStyles } from "./SlideSyncCard";

describe("SlideSyncCard", () => {
  const defaultProps = {
    projectPath: "/Users/user/projects/my-slide",
    uiStatus: "synced" as const,
    lastSyncedAt: null,
  };

  describe("4状態のBadge色・ラベル検証（P47: variantStyles import）", () => {
    it("synced状態: Badgeクラスとラベルが正しい", () => {
      render(<SlideSyncCard {...defaultProps} uiStatus="synced" />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain(variantStyles.synced.badge);
      expect(badge).toHaveTextContent(variantStyles.synced.label);
    });

    it("running状態: Badgeクラスとラベルが正しい", () => {
      render(<SlideSyncCard {...defaultProps} uiStatus="running" />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain(variantStyles.running.badge);
      expect(badge).toHaveTextContent(variantStyles.running.label);
    });

    it("degraded状態: Badgeクラスとラベルが正しい", () => {
      render(<SlideSyncCard {...defaultProps} uiStatus="degraded" />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain(variantStyles.degraded.badge);
      expect(badge).toHaveTextContent(variantStyles.degraded.label);
    });

    it("guidance状態: Badgeクラスとラベルが正しい", () => {
      render(<SlideSyncCard {...defaultProps} uiStatus="guidance" />);
      const badge = screen.getByRole("status");
      expect(badge.className).toContain(variantStyles.guidance.badge);
      expect(badge).toHaveTextContent(variantStyles.guidance.label);
    });
  });

  describe("variantStyles 定数の検証（P47）", () => {
    it("synced: badgeクラスに#34C759を含む", () => {
      expect(variantStyles.synced.badge).toContain("#34C759");
    });

    it("running: badgeクラスに#007AFFを含む", () => {
      expect(variantStyles.running.badge).toContain("#007AFF");
    });

    it("degraded: badgeクラスに#FF9500を含む", () => {
      expect(variantStyles.degraded.badge).toContain("#FF9500");
    });

    it("guidance: badgeクラスに#007AFFを含む", () => {
      expect(variantStyles.guidance.badge).toContain("#007AFF");
    });
  });

  describe("プロジェクトパス表示", () => {
    it("projectPathがテキストとして表示される", () => {
      render(
        <SlideSyncCard
          {...defaultProps}
          projectPath="/Users/user/projects/my-slide"
        />,
      );
      expect(
        screen.getByText("/Users/user/projects/my-slide"),
      ).toBeInTheDocument();
    });

    it("長いパスはtruncateクラスで省略される", () => {
      const longPath = "/very/long/path/to/a/deeply/nested/slide/project";
      render(<SlideSyncCard {...defaultProps} projectPath={longPath} />);
      const pathEl = screen.getByText(longPath);
      expect(pathEl.className).toContain("truncate");
    });
  });

  describe("degradedReason 表示・非表示", () => {
    it("degraded状態でdegradedReasonが表示される", () => {
      render(
        <SlideSyncCard
          {...defaultProps}
          uiStatus="degraded"
          degradedReason="ネットワークエラーが発生しました"
        />,
      );
      expect(
        screen.getByText("ネットワークエラーが発生しました"),
      ).toBeInTheDocument();
    });

    it("synced状態ではdegradedReasonが表示されない", () => {
      render(
        <SlideSyncCard
          {...defaultProps}
          uiStatus="synced"
          degradedReason="ネットワークエラーが発生しました"
        />,
      );
      expect(
        screen.queryByText("ネットワークエラーが発生しました"),
      ).not.toBeInTheDocument();
    });

    it("degraded状態でdegradedReasonが未指定なら表示されない", () => {
      const { container } = render(
        <SlideSyncCard {...defaultProps} uiStatus="degraded" />,
      );
      // テキストカラークラスで探す
      const errorTexts = container.querySelectorAll(".text-\\[\\#FF3B30\\]");
      expect(errorTexts).toHaveLength(0);
    });
  });

  describe("lastSyncedAt 表示", () => {
    it("lastSyncedAtがnullのとき最終同期テキストは表示されない", () => {
      render(<SlideSyncCard {...defaultProps} lastSyncedAt={null} />);
      expect(screen.queryByText(/最終同期/)).not.toBeInTheDocument();
    });

    it("lastSyncedAtがDateのとき最終同期テキストが表示される", () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5分前
      render(<SlideSyncCard {...defaultProps} lastSyncedAt={date} />);
      expect(screen.getByText(/最終同期/)).toBeInTheDocument();
    });

    it("たった今 (< 60秒前)", () => {
      const date = new Date(Date.now() - 10 * 1000); // 10秒前
      render(<SlideSyncCard {...defaultProps} lastSyncedAt={date} />);
      expect(screen.getByText(/たった今/)).toBeInTheDocument();
    });

    it("N時間前 (60分以上24時間未満)", () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3時間前
      render(<SlideSyncCard {...defaultProps} lastSyncedAt={date} />);
      expect(screen.getByText(/3時間前/)).toBeInTheDocument();
    });

    it("N日前 (24時間以上)", () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2日前
      render(<SlideSyncCard {...defaultProps} lastSyncedAt={date} />);
      expect(screen.getByText(/2日前/)).toBeInTheDocument();
    });
  });

  describe("ARIA ラベル", () => {
    it("aria-label='同期状態: 同期済み'が設定される（synced）", () => {
      render(<SlideSyncCard {...defaultProps} uiStatus="synced" />);
      const card = screen
        .getByText(variantStyles.synced.label)
        .closest("[aria-label]");
      expect(card).toHaveAttribute(
        "aria-label",
        `同期状態: ${variantStyles.synced.label}`,
      );
    });

    it("aria-label='同期状態: 同期失敗'が設定される（degraded）", () => {
      render(<SlideSyncCard {...defaultProps} uiStatus="degraded" />);
      const card = screen
        .getByText(variantStyles.degraded.label)
        .closest("[aria-label]");
      expect(card).toHaveAttribute(
        "aria-label",
        `同期状態: ${variantStyles.degraded.label}`,
      );
    });

    it("aria-label='同期状態: 設定が必要です'が設定される（guidance）", () => {
      render(<SlideSyncCard {...defaultProps} uiStatus="guidance" />);
      const card = screen
        .getByText(variantStyles.guidance.label)
        .closest("[aria-label]");
      expect(card).toHaveAttribute(
        "aria-label",
        `同期状態: ${variantStyles.guidance.label}`,
      );
    });
  });
});
