/**
 * @file AnalyticsDashboardPanel.test.tsx
 * @description Analytics ダッシュボードパネル ユニットテスト
 * @task UT-W3-ANALYTICS-DASHBOARD-001
 *
 * T4-01: コンポーネントがレンダリングされること
 * T4-02: isOptedOut=true → 「オプトアウト中」ラベル表示
 * T4-03: isOptedOut=false → 「有効」ラベル表示
 * T4-04: queuedEventCount 表示
 * T4-05: NODE_ENV=development → event-log-viewer 表示
 * T4-06: NODE_ENV=production → event-log-viewer 非表示
 *
 * T6-01: キューが空（0件）
 * T6-02: キューが上限（500件）
 * T6-03: isOptedOut の変化が反映
 * T6-04: 開発モードで診断ブロック表示（回帰）
 * T6-05: production で診断ブロック非表示（回帰）
 * T6-06: AnalyticsDashboardPanel が SettingsView に含まれる（回帰ガード）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsDashboardPanel } from "../AnalyticsDashboardPanel";

// analyticsAdapter をモック（renderer-local direct read）
vi.mock("../../../utils/analyticsAdapter", () => ({
  getAnalyticsAdapter: vi.fn(),
}));

import { getAnalyticsAdapter } from "../../../utils/analyticsAdapter";

const mockGetAnalyticsAdapter = vi.mocked(getAnalyticsAdapter);

function setupAdapter(opts: { isOptedOut: boolean; queueSize: number }) {
  mockGetAnalyticsAdapter.mockReturnValue({
    isOptedOut: vi.fn(() => opts.isOptedOut),
    getQueueSize: vi.fn(() => opts.queueSize),
    send: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
  });
}

describe("AnalyticsDashboardPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAdapter({ isOptedOut: false, queueSize: 0 });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("T4-01: 基本レンダリング", () => {
    it("data-testid='analytics-dashboard-panel' が存在すること", () => {
      render(<AnalyticsDashboardPanel />);
      expect(
        screen.getByTestId("analytics-dashboard-panel"),
      ).toBeInTheDocument();
    });
  });

  describe("T4-02: オプトアウト状態（ON）", () => {
    it("isOptedOut=true のとき「オプトアウト中」ラベルが表示されること", () => {
      setupAdapter({ isOptedOut: true, queueSize: 0 });
      render(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("analytics-opt-out-status")).toHaveTextContent(
        "オプトアウト中",
      );
    });
  });

  describe("T4-03: オプトアウト状態（OFF）", () => {
    it("isOptedOut=false のとき「有効」ラベルが表示されること", () => {
      setupAdapter({ isOptedOut: false, queueSize: 0 });
      render(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("analytics-opt-out-status")).toHaveTextContent(
        "有効",
      );
    });
  });

  describe("T4-04: キューサイズ表示", () => {
    it("queueSize=5 のときキューサイズ数値がレンダリングされること", () => {
      setupAdapter({ isOptedOut: false, queueSize: 5 });
      render(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("analytics-queue-size")).toHaveTextContent("5");
    });
  });

  describe("T4-05: 開発モードの診断ブロック", () => {
    it("NODE_ENV=development のとき event-log-viewer が表示されること", () => {
      vi.stubEnv("NODE_ENV", "development");
      render(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("event-log-viewer")).toBeInTheDocument();
    });
  });

  describe("T4-06: 本番モードの診断ブロック非表示", () => {
    it("NODE_ENV=production のとき event-log-viewer が表示されないこと", () => {
      vi.stubEnv("NODE_ENV", "production");
      render(<AnalyticsDashboardPanel />);
      expect(screen.queryByTestId("event-log-viewer")).not.toBeInTheDocument();
    });
  });

  // ─── Phase 6: テスト拡充（T6-01〜T6-05） ────────────────────────

  describe("T6-01: エッジケース - キューが空（0件）", () => {
    it("queueSize=0 のときキューサイズ 0 が表示されること", () => {
      setupAdapter({ isOptedOut: false, queueSize: 0 });
      render(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("analytics-queue-size")).toHaveTextContent("0");
    });
  });

  describe("T6-02: エッジケース - キューが上限（500件）", () => {
    it("queueSize=500 のときキューサイズ 500 が表示されること", () => {
      setupAdapter({ isOptedOut: false, queueSize: 500 });
      render(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("analytics-queue-size")).toHaveTextContent(
        "500",
      );
    });
  });

  describe("T6-03: 状態変化 - isOptedOut の変化が反映されること", () => {
    it("オプトアウト OFF から ON に変化したとき最新値が表示されること", () => {
      setupAdapter({ isOptedOut: false, queueSize: 0 });
      const { rerender } = render(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("analytics-opt-out-status")).toHaveTextContent(
        "有効",
      );

      setupAdapter({ isOptedOut: true, queueSize: 0 });
      rerender(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("analytics-opt-out-status")).toHaveTextContent(
        "オプトアウト中",
      );
    });
  });

  describe("T6-04: dev-only 回帰 - 開発モードで診断ブロック表示", () => {
    it("NODE_ENV=development のとき event-log-viewer が存在すること", () => {
      vi.stubEnv("NODE_ENV", "development");
      render(<AnalyticsDashboardPanel />);
      expect(screen.getByTestId("event-log-viewer")).toBeInTheDocument();
    });
  });

  describe("T6-05: production 回帰 - production で診断ブロック非表示", () => {
    it("NODE_ENV=production のとき event-log-viewer が DOM に存在しないこと", () => {
      vi.stubEnv("NODE_ENV", "production");
      render(<AnalyticsDashboardPanel />);
      expect(screen.queryByTestId("event-log-viewer")).not.toBeInTheDocument();
    });
  });
});
