/**
 * AnalyticsDashboard メインビュー テスト
 *
 * サマリー表示・ローディング・エラー・空状態・期間切替・リフレッシュをテストする。
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import type {
  AnalyticsSummary,
  UsageTrend,
  SkillStatistics,
} from "@repo/shared/types/skill-analytics";
import { AnalyticsDashboard } from "../index";

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

const mockSummary: AnalyticsSummary = {
  totalSkills: 5,
  totalExecutions: 120,
  overallSuccessRate: 0.92,
  mostUsedSkills: [
    {
      skillName: "code-review",
      executionCount: 40,
      lastUsed: "2026-03-01T10:00:00Z",
    },
    {
      skillName: "test-gen",
      executionCount: 30,
      lastUsed: "2026-03-01T09:00:00Z",
    },
  ],
  recentActivity: [],
};

const mockTrend: UsageTrend = {
  period: {
    start: "2026-02-01T00:00:00Z",
    end: "2026-03-02T00:00:00Z",
    granularity: "day",
  },
  dataPoints: [
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
  ],
};

/** スキル名に応じた統計データを生成する */
function createMockSkillStats(skillName: string): SkillStatistics {
  return {
    skillName,
    totalExecutions: skillName === "code-review" ? 40 : 30,
    successRate: skillName === "code-review" ? 0.95 : 0.8,
    averageDuration: skillName === "code-review" ? 1200 : 2500,
    errorRate: skillName === "code-review" ? 0.05 : 0.2,
    totalTokens: skillName === "code-review" ? 50000 : 35000,
    lastUsed: "2026-03-01T10:00:00Z",
    mostUsedTools: [{ toolName: "Read", count: 30, percentage: 75 }],
  };
}

// --- IPC モック ---

const mockAnalyticsSummary = vi.fn();
const mockAnalyticsTrend = vi.fn();
const mockAnalyticsStatistics = vi.fn();
const mockAnalyticsExport = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockAnalyticsSummary.mockResolvedValue(mockSummary);
  mockAnalyticsTrend.mockResolvedValue(mockTrend);
  mockAnalyticsStatistics.mockImplementation((skillName: string) =>
    Promise.resolve(createMockSkillStats(skillName)),
  );
  mockAnalyticsExport.mockResolvedValue("/tmp/export.json");

  // window.electronAPI.skill モック
  const existingElectronAPI =
    (window as unknown as { electronAPI?: Record<string, unknown> })
      .electronAPI || {};
  const existingSkill =
    (existingElectronAPI.skill as Record<string, unknown>) || {};
  (window as unknown as { electronAPI: Record<string, unknown> }).electronAPI =
    {
      ...existingElectronAPI,
      skill: {
        ...existingSkill,
        analyticsSummary: mockAnalyticsSummary,
        analyticsTrend: mockAnalyticsTrend,
        analyticsStatistics: mockAnalyticsStatistics,
        analyticsExport: mockAnalyticsExport,
      },
    };
});

describe("AnalyticsDashboard", () => {
  it("サマリーデータを表示する", async () => {
    render(<AnalyticsDashboard />);

    // ローディングが完了するまで待機
    await waitFor(() => {
      expect(screen.getByText("分析ダッシュボード")).toBeInTheDocument();
    });

    // サマリーカードが表示される
    expect(screen.getByTestId("summary-card-grid")).toBeInTheDocument();
  });

  it("初回ローディング状態でスピナーを表示する", () => {
    // 永久に保留するPromise
    mockAnalyticsSummary.mockReturnValue(new Promise(() => {}));

    render(<AnalyticsDashboard />);

    const dashboard = screen.getByTestId("analytics-dashboard");
    expect(dashboard).toBeInTheDocument();

    // ローディング状態
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("エラー状態でエラーメッセージと再試行ボタンを表示する", async () => {
    mockAnalyticsSummary.mockRejectedValue(
      new Error("サーバー接続に失敗しました"),
    );

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("サーバー接続に失敗しました")).toBeInTheDocument();
    expect(screen.getByTestId("retry-button")).toBeInTheDocument();
  });

  it("再試行ボタンクリックでデータを再取得する", async () => {
    mockAnalyticsSummary.mockRejectedValueOnce(new Error("接続エラー"));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    });

    // 次の呼び出しでは成功する
    mockAnalyticsSummary.mockResolvedValue(mockSummary);

    await act(async () => {
      fireEvent.click(screen.getByTestId("retry-button"));
    });

    await waitFor(() => {
      expect(screen.getByText("分析ダッシュボード")).toBeInTheDocument();
    });
  });

  it("更新ボタンクリックでデータを再取得する", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("refresh-button")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("refresh-button"));
    });

    // analyticsSummaryが再呼び出しされる（初回 + 再取得）
    await waitFor(() => {
      expect(mockAnalyticsSummary.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("期間セレクタが表示される", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("period-selector")).toBeInTheDocument();
    });
  });

  it("期間切替でトレンドデータが再取得される", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("period-selector")).toBeInTheDocument();
    });

    // 7日間ボタンをクリック
    await act(async () => {
      fireEvent.click(screen.getByTestId("period-7d"));
    });

    // analyticsTrend が再呼び出しされる
    await waitFor(() => {
      expect(mockAnalyticsTrend.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  it("エクスポートボタンが表示される", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("export-button")).toBeInTheDocument();
    });
  });

  it("サマリーカードに総実行回数が表示される", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("120")).toBeInTheDocument();
    });

    expect(screen.getByText("総実行回数")).toBeInTheDocument();
  });

  it("使用状況チャートが表示される", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("usage-chart")).toBeInTheDocument();
    });
  });

  it("スキル別統計テーブルが表示される", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("skill-stats-table")).toBeInTheDocument();
    });
  });
});
