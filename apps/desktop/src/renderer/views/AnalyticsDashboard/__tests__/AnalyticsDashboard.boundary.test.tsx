/**
 * AnalyticsDashboard 境界値・エラー・a11y テスト
 *
 * Phase 6 テスト拡充: 境界値テスト、IPCエラー、a11yテスト
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import type {
  AnalyticsSummary,
  UsageTrend,
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
const createMockSummary = (
  overrides: Partial<AnalyticsSummary> = {},
): AnalyticsSummary => ({
  totalSkills: 5,
  totalExecutions: 120,
  overallSuccessRate: 0.92,
  mostUsedSkills: [
    {
      skillName: "code-review",
      executionCount: 40,
      lastUsed: "2026-03-01T10:00:00Z",
    },
  ],
  recentActivity: [],
  ...overrides,
});

const createMockTrend = (overrides: Partial<UsageTrend> = {}): UsageTrend => ({
  period: {
    start: "2026-02-01T00:00:00Z",
    end: "2026-03-02T00:00:00Z",
    granularity: "day",
  },
  dataPoints: [
    {
      timestamp: "2026-03-01T00:00:00Z",
      executions: 15,
      errors: 2,
      avgDuration: 450,
    },
  ],
  ...overrides,
});

// --- IPC モック ---
const mockAnalyticsSummary = vi.fn();
const mockAnalyticsTrend = vi.fn();
const mockAnalyticsStatistics = vi.fn();
const mockAnalyticsExport = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockAnalyticsSummary.mockResolvedValue(createMockSummary());
  mockAnalyticsTrend.mockResolvedValue(createMockTrend());
  mockAnalyticsStatistics.mockImplementation((skillName: string) =>
    Promise.resolve({
      skillName,
      totalExecutions: 40,
      successRate: 0.95,
      averageDuration: 1200,
      errorRate: 0.05,
      totalTokens: 50000,
      lastUsed: "2026-03-01T10:00:00Z",
      mostUsedTools: [{ toolName: "Read", count: 30, percentage: 75 }],
    }),
  );
  mockAnalyticsExport.mockResolvedValue("/tmp/export.json");

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

describe("AnalyticsDashboard - 境界値テスト", () => {
  it("totalExecutionsが0の場合にサマリーが表示される", async () => {
    mockAnalyticsSummary.mockResolvedValue(
      createMockSummary({
        totalExecutions: 0,
        totalSkills: 0,
        mostUsedSkills: [],
      }),
    );

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("分析ダッシュボード")).toBeInTheDocument();
    });

    // totalExecutions=0, totalSkills=0 のため「0」が複数表示される
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("summary-card-grid")).toBeInTheDocument();
  });

  it("空のdataPointsでチャートに「データがありません」が表示される", async () => {
    mockAnalyticsTrend.mockResolvedValue(createMockTrend({ dataPoints: [] }));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("分析ダッシュボード")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("データがありません")).toBeInTheDocument();
    });
  });

  it("100件以上のdataPointsでチャートが正常に表示される", async () => {
    const dataPoints = Array.from({ length: 120 }, (_, i) => ({
      timestamp: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
      executions: Math.floor(Math.random() * 100),
      errors: Math.floor(Math.random() * 10),
      avgDuration: Math.floor(Math.random() * 2000),
    }));
    mockAnalyticsTrend.mockResolvedValue(createMockTrend({ dataPoints }));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("usage-chart")).toBeInTheDocument();
    });
  });

  it("長いスキル名のmostUsedSkillsが表示される", async () => {
    const longName = "skill-" + "x".repeat(200);
    mockAnalyticsSummary.mockResolvedValue(
      createMockSummary({
        mostUsedSkills: [
          {
            skillName: longName,
            executionCount: 10,
            lastUsed: "2026-03-01T10:00:00Z",
          },
        ],
      }),
    );

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("分析ダッシュボード")).toBeInTheDocument();
    });

    expect(screen.getByTestId("summary-card-grid")).toBeInTheDocument();
  });
});

describe("AnalyticsDashboard - エラー系テスト", () => {
  it("サマリー取得失敗でエラーが表示される", async () => {
    mockAnalyticsSummary.mockRejectedValue(new Error("サマリー取得失敗"));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByText("サマリー取得失敗")).toBeInTheDocument();
  });

  it("ネットワークタイムアウトエラーが表示される", async () => {
    mockAnalyticsSummary.mockRejectedValue(
      new Error("ネットワークタイムアウト: 30秒経過"),
    );

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("ネットワークタイムアウト: 30秒経過"),
      ).toBeInTheDocument();
    });
  });

  it("非Errorオブジェクトの例外でもエラーが表示される", async () => {
    mockAnalyticsSummary.mockRejectedValue("文字列エラー");

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("トレンド取得失敗でもサマリーは表示される", async () => {
    mockAnalyticsTrend.mockRejectedValue(new Error("トレンド取得失敗"));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText("分析ダッシュボード")).toBeInTheDocument();
    });

    // サマリーは表示される
    expect(screen.getByTestId("summary-card-grid")).toBeInTheDocument();
  });
});

describe("AnalyticsDashboard - a11y テスト", () => {
  it("メインコンテナのdata-testid='analytics-dashboard'が設定されている", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("analytics-dashboard")).toBeInTheDocument();
    });
  });

  it("ローディング状態でrole='status'が設定されている", () => {
    mockAnalyticsSummary.mockReturnValue(new Promise(() => {}));

    render(<AnalyticsDashboard />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("エラー状態でrole='alert'が設定されている", async () => {
    mockAnalyticsSummary.mockRejectedValue(new Error("エラー"));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("更新ボタンにaria-label='データを更新'が設定されている", async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByLabelText("データを更新")).toBeInTheDocument();
    });
  });

  it("再試行ボタンのdata-testidが設定されている", async () => {
    mockAnalyticsSummary.mockRejectedValue(new Error("エラー"));

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("retry-button")).toBeInTheDocument();
    });
  });
});
