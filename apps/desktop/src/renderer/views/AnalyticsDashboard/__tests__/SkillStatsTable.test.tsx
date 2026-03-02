/**
 * SkillStatsTable コンポーネントテスト
 *
 * テーブル表示・ソート・フィルタ・空状態・ローディング・エラーをテストする。
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { SkillStatistics } from "@repo/shared/types/skill-analytics";
import { SkillStatsTable } from "../components/SkillStatsTable";

// --- テストデータ ---

const mockStats: SkillStatistics[] = [
  {
    skillName: "code-review",
    totalExecutions: 40,
    successRate: 0.95,
    averageDuration: 1200,
    errorRate: 0.05,
    totalTokens: 50000,
    lastUsed: "2026-03-01T10:00:00Z",
    mostUsedTools: [{ toolName: "Read", count: 30, percentage: 75 }],
  },
  {
    skillName: "test-gen",
    totalExecutions: 30,
    successRate: 0.8,
    averageDuration: 2500,
    errorRate: 0.2,
    totalTokens: 35000,
    lastUsed: "2026-03-01T09:00:00Z",
    mostUsedTools: [{ toolName: "Write", count: 25, percentage: 83 }],
  },
  {
    skillName: "doc-gen",
    totalExecutions: 10,
    successRate: 0.6,
    averageDuration: 800,
    errorRate: 0.4,
    totalTokens: 12000,
    lastUsed: "2026-02-28T08:00:00Z",
    mostUsedTools: [{ toolName: "Edit", count: 8, percentage: 80 }],
  },
];

const defaultProps = {
  stats: mockStats,
  sortKey: "totalExecutions" as const,
  sortDirection: "desc" as const,
  filterKeyword: "",
  onSortChange: vi.fn(),
  onFilterChange: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SkillStatsTable", () => {
  it("統計データをテーブルに表示する", () => {
    render(<SkillStatsTable {...defaultProps} />);

    expect(screen.getByText("code-review")).toBeInTheDocument();
    expect(screen.getByText("test-gen")).toBeInTheDocument();
    expect(screen.getByText("doc-gen")).toBeInTheDocument();
  });

  it("テーブルヘッダーのラベルが表示される", () => {
    render(<SkillStatsTable {...defaultProps} />);

    expect(screen.getByText("スキル名")).toBeInTheDocument();
    expect(screen.getByText("実行回数")).toBeInTheDocument();
    expect(screen.getByText("成功率")).toBeInTheDocument();
    expect(screen.getByText("平均時間")).toBeInTheDocument();
    expect(screen.getByText("トークン数")).toBeInTheDocument();
  });

  it("ヘッダークリックでソート変更が呼ばれる", () => {
    const onSortChange = vi.fn();
    render(<SkillStatsTable {...defaultProps} onSortChange={onSortChange} />);

    const skillNameHeader = screen.getByTestId("sort-skillName");
    fireEvent.click(skillNameHeader);

    expect(onSortChange).toHaveBeenCalledWith("skillName");
  });

  it("成功率ヘッダーでソート変更が呼ばれる", () => {
    const onSortChange = vi.fn();
    render(<SkillStatsTable {...defaultProps} onSortChange={onSortChange} />);

    const successRateHeader = screen.getByTestId("sort-successRate");
    fireEvent.click(successRateHeader);

    expect(onSortChange).toHaveBeenCalledWith("successRate");
  });

  it("フィルタ入力で変更ハンドラが呼ばれる", () => {
    const onFilterChange = vi.fn();
    render(
      <SkillStatsTable {...defaultProps} onFilterChange={onFilterChange} />,
    );

    const input = screen.getByTestId("stats-filter-input");
    fireEvent.change(input, { target: { value: "code" } });

    expect(onFilterChange).toHaveBeenCalledWith("code");
  });

  it("空のstatsで「統計データがありません」を表示する", () => {
    render(<SkillStatsTable {...defaultProps} stats={[]} />);

    expect(screen.getByText("統計データがありません")).toBeInTheDocument();
  });

  it("フィルタ中で空のstatsで「該当するスキルが見つかりません」を表示する", () => {
    render(
      <SkillStatsTable
        {...defaultProps}
        stats={[]}
        filterKeyword="nonexistent"
      />,
    );

    expect(
      screen.getByText("該当するスキルが見つかりません"),
    ).toBeInTheDocument();
  });

  it("ローディング状態でスピナーを表示する", () => {
    render(<SkillStatsTable {...defaultProps} isLoading />);

    // テーブル行は表示されない
    expect(screen.queryByText("code-review")).not.toBeInTheDocument();
  });

  it("エラー状態でエラーメッセージを表示する", () => {
    render(
      <SkillStatsTable
        {...defaultProps}
        error="統計データの取得に失敗しました"
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("統計データの取得に失敗しました"),
    ).toBeInTheDocument();
  });

  it("各行が正しい統計値を表示する", () => {
    render(<SkillStatsTable {...defaultProps} />);

    // code-review: 40回, 95.0%, 1.2s, 50,000
    const rows = screen.getAllByTestId("skill-stats-row");
    expect(rows).toHaveLength(3);

    // 実行回数が表示される
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("ソート方向のインジケータが現在のソートキーに表示される", () => {
    render(
      <SkillStatsTable
        {...defaultProps}
        sortKey="totalExecutions"
        sortDirection="desc"
      />,
    );

    const header = screen.getByTestId("sort-totalExecutions");
    expect(header).toHaveAttribute("aria-sort", "descending");
  });

  it("ソートされていないヘッダーのaria-sortがnoneである", () => {
    render(
      <SkillStatsTable
        {...defaultProps}
        sortKey="totalExecutions"
        sortDirection="desc"
      />,
    );

    const skillNameHeader = screen.getByTestId("sort-skillName");
    expect(skillNameHeader).toHaveAttribute("aria-sort", "none");
  });
});
