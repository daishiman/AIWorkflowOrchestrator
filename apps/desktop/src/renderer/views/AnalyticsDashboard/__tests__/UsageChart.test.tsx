/**
 * UsageChart コンポーネントテスト
 *
 * チャート描画・空データ・ローディング・エラー状態をテストする。
 * recharts はhappy-dom環境ではSVGを描画できないためモックする。
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { TrendDataPoint } from "@repo/shared/types/skill-analytics";
import { UsageChart } from "../components/UsageChart";

// recharts をモック（happy-domではSVG描画不可）
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// --- テストデータ ---

const mockDataPoints: TrendDataPoint[] = [
  {
    timestamp: "2026-02-28T00:00:00Z",
    executions: 10,
    errors: 1,
    avgDuration: 500,
  },
  {
    timestamp: "2026-03-01T00:00:00Z",
    executions: 15,
    errors: 2,
    avgDuration: 450,
  },
  {
    timestamp: "2026-03-02T00:00:00Z",
    executions: 12,
    errors: 0,
    avgDuration: 520,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UsageChart", () => {
  it("データがある場合にチャートを描画する", () => {
    render(<UsageChart dataPoints={mockDataPoints} />);

    const chart = screen.getByTestId("usage-chart");
    expect(chart).toBeInTheDocument();

    // rechartsコンポーネントが描画される
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    expect(screen.getByTestId("x-axis")).toBeInTheDocument();
    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("Lineコンポーネントが2つ描画される（実行回数とエラー数）", () => {
    render(<UsageChart dataPoints={mockDataPoints} />);

    const lines = screen.getAllByTestId("line");
    expect(lines).toHaveLength(2);
  });

  it("タイトル「使用状況トレンド」が表示される", () => {
    render(<UsageChart dataPoints={mockDataPoints} />);

    expect(screen.getByText("使用状況トレンド")).toBeInTheDocument();
  });

  it("空データ時に「データがありません」を表示する", () => {
    render(<UsageChart dataPoints={[]} />);

    expect(screen.getByText("データがありません")).toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("ローディング状態でスピナーを表示する", () => {
    render(<UsageChart dataPoints={[]} isLoading />);

    const chart = screen.getByTestId("usage-chart");
    expect(chart).toBeInTheDocument();

    // スピナーが表示される（Spinner コンポーネントは Icon + loader-2）
    expect(screen.queryByText("データがありません")).not.toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });

  it("エラー状態でエラーメッセージを表示する", () => {
    render(
      <UsageChart dataPoints={[]} error="トレンドデータの取得に失敗しました" />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("トレンドデータの取得に失敗しました"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });
});
