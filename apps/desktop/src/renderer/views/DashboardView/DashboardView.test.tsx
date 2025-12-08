import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardView } from "./index";

// Mock store state - flat structure matching actual store
const createMockState = (overrides = {}) => ({
  // DashboardSlice
  dashboardStats: {
    totalDocs: 150,
    ragIndexed: 120,
    pending: 30,
    storageUsed: 650,
    storageTotal: 1000,
  },
  activityFeed: [
    {
      id: "1",
      message: "ドキュメント作成",
      time: "10:00",
      type: "info" as const,
    },
    {
      id: "2",
      message: "インデックス完了",
      time: "09:30",
      type: "success" as const,
    },
  ],
  isLoading: false,
  setDashboardStats: vi.fn(),
  setActivityFeed: vi.fn(),
  addActivity: vi.fn(),
  setIsLoading: vi.fn(),
  ...overrides,
});

vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector(createMockState()),
  ),
}));

describe("DashboardView", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { useAppStore } = await import("../../store");
    vi.mocked(useAppStore).mockImplementation(((
      selector: (state: ReturnType<typeof createMockState>) => unknown,
    ) => selector(createMockState())) as never);
  });

  describe("レンダリング", () => {
    it("ダッシュボードビューをレンダリングする", () => {
      render(<DashboardView />);
      expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
    });

    it("ヘッダーを表示する", () => {
      render(<DashboardView />);
      expect(screen.getByText("ダッシュボード")).toBeInTheDocument();
      expect(
        screen.getByText("Knowledge Studioの概要と最新のアクティビティ"),
      ).toBeInTheDocument();
    });

    it("h1見出しを含む", () => {
      render(<DashboardView />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("ダッシュボード");
    });
  });

  describe("統計カード", () => {
    it("ドキュメント数を表示する", () => {
      render(<DashboardView />);
      expect(screen.getByText("ドキュメント")).toBeInTheDocument();
      expect(screen.getByText("150")).toBeInTheDocument();
    });

    it("インデックス済み数を表示する", () => {
      render(<DashboardView />);
      expect(screen.getByText("インデックス済み")).toBeInTheDocument();
      expect(screen.getByText("120")).toBeInTheDocument();
    });

    it("会話数を表示する", () => {
      render(<DashboardView />);
      expect(screen.getByText("会話数")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("ストレージ使用量を表示する", () => {
      render(<DashboardView />);
      expect(screen.getByText("ストレージ使用量")).toBeInTheDocument();
      expect(screen.getAllByText(/65%/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("アクティビティ", () => {
    it("最近のアクティビティセクションを表示する", () => {
      render(<DashboardView />);
      expect(screen.getByText("最近のアクティビティ")).toBeInTheDocument();
    });

    it("アクティビティアイテムを表示する", () => {
      render(<DashboardView />);
      expect(screen.getByText("ドキュメント作成")).toBeInTheDocument();
      expect(screen.getByText("インデックス完了")).toBeInTheDocument();
    });
  });

  describe("ローディング状態", () => {
    it("ローディング中は読み込み中と表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ isLoading: true }))) as never);

      render(<DashboardView />);
      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });
  });

  describe("空状態", () => {
    it("アクティビティがない場合はメッセージを表示する", async () => {
      const { useAppStore } = await import("../../store");
      vi.mocked(useAppStore).mockImplementation(((
        selector: (state: ReturnType<typeof createMockState>) => unknown,
      ) => selector(createMockState({ activityFeed: [] }))) as never);

      render(<DashboardView />);
      expect(
        screen.getByText("アクティビティはありません"),
      ).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("統計セクションにaria-labelledbyを持つ", () => {
      render(<DashboardView />);
      const section = screen.getByRole("region", { name: /統計情報/i });
      expect(section).toBeInTheDocument();
    });

    it("アクティビティセクションにaria-labelledbyを持つ", () => {
      render(<DashboardView />);
      const section = screen.getByRole("region", {
        name: /最近のアクティビティ/i,
      });
      expect(section).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<DashboardView className="custom-class" />);
      expect(screen.getByTestId("dashboard-view")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(DashboardView.displayName).toBe("DashboardView");
    });
  });
});
