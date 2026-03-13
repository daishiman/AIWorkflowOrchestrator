import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardView } from "./index";
import { useAppStore } from "../../store";

function createLocalDate(hour: number, minute = 0): Date {
  return new Date(2026, 2, 11, hour, minute, 0, 0);
}

const fixedNow = createLocalDate(10, 15);
const mockSetCurrentView = vi.fn();

const baseState = {
  dashboardStats: {
    totalDocs: 150,
    ragIndexed: 120,
    pending: 0,
    storageUsed: 650,
    storageTotal: 1000,
  },
  activityFeed: [
    {
      id: "1",
      message: "ドキュメント作成",
      time: "2026-03-11T09:58:00+09:00",
      type: "info" as const,
    },
    {
      id: "2",
      message: "インデックス完了",
      time: "2026-03-11T09:15:00+09:00",
      type: "success" as const,
    },
  ],
  isLoading: false,
  profile: {
    name: "田中",
    email: "tanaka@example.com",
    avatar: "",
    plan: "free" as const,
    displayName: "田中",
  } as never,
  authUser: {
    displayName: "田中",
  } as never,
  setCurrentView: mockSetCurrentView as never,
};

vi.mock("../../components/atoms/RelativeTime", () => ({
  RelativeTime: ({ timestamp }: { timestamp: string }) =>
    timestamp === "invalid" ? (
      <time aria-label="—">—</time>
    ) : (
      <time>{timestamp}</time>
    ),
}));

function applyState(overrides: Partial<typeof baseState> = {}): void {
  useAppStore.setState({
    ...baseState,
    ...overrides,
  });
}

describe("DashboardView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    applyState();
  });

  afterEach(() => {
    cleanup();
  });

  describe("レンダリング", () => {
    it("ホームビューをレンダリングする", () => {
      render(<DashboardView now={fixedNow} />);
      expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
    });

    it("ホーム見出しと挨拶を表示する", () => {
      render(<DashboardView now={fixedNow} />);

      expect(screen.getByText("ホーム")).toBeInTheDocument();
      expect(screen.getByTestId("dashboard-greeting")).toHaveTextContent(
        "おはようございます、田中さん",
      );
      expect(
        screen.getByText(/朝の立ち上がりに必要な導線だけ/u),
      ).toBeInTheDocument();
    });

    it("h1見出しを含む", () => {
      render(<DashboardView now={fixedNow} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "ホーム",
      );
    });

    it("profile/authUser がなくても userProfile.name を表示名 fallback として使う", () => {
      applyState({
        profile: null as never,
        authUser: null as never,
        userProfile: {
          name: "山田",
          email: "yamada@example.com",
          avatar: "",
          plan: "free" as const,
        } as never,
      });

      render(<DashboardView now={fixedNow} />);

      expect(screen.getByTestId("dashboard-greeting")).toHaveTextContent(
        "おはようございます、山田さん",
      );
    });
  });

  describe("サジェスチョン", () => {
    it("おすすめカードを3件表示する", () => {
      render(<DashboardView now={fixedNow} />);

      expect(
        screen.getByTestId("dashboard-suggestion-list"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /作業スペースを見る/u }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ツールを探す/u }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /履歴を見直す/u }),
      ).toBeInTheDocument();
    });

    it("サジェスチョン操作で既存 ViewType に遷移する", async () => {
      const user = userEvent.setup();
      render(<DashboardView now={fixedNow} />);

      await user.click(screen.getByRole("button", { name: /ツールを探す/u }));

      expect(mockSetCurrentView).toHaveBeenCalledWith("skillCenter");
    });
  });

  describe("タイムライン", () => {
    it("最近の動きを表示し、RelativeTime に時刻を渡す", () => {
      render(<DashboardView now={fixedNow} />);

      expect(screen.getByText("最近の動き")).toBeInTheDocument();
      expect(screen.getByText("ドキュメント作成")).toBeInTheDocument();
      expect(screen.getByText("インデックス完了")).toBeInTheDocument();
      expect(screen.getByText("2026-03-11T09:58:00+09:00")).toBeInTheDocument();
      expect(screen.getByText("2026-03-11T09:15:00+09:00")).toBeInTheDocument();
    });

    it("6件以上あっても5件までに制限する", () => {
      applyState({
        activityFeed: Array.from({ length: 6 }, (_, index) => ({
          id: `${index + 1}`,
          message: `アクティビティ ${index + 1}`,
          time: `2026-03-11T09:0${index}:00+09:00`,
          type: "info" as const,
        })),
      });

      render(<DashboardView now={fixedNow} />);

      expect(screen.queryByText("アクティビティ 6")).not.toBeInTheDocument();
      expect(screen.getByText("アクティビティ 5")).toBeInTheDocument();
    });

    it("もっと見るで historySearch に遷移する", async () => {
      const user = userEvent.setup();
      render(<DashboardView now={fixedNow} />);

      await user.click(screen.getByRole("button", { name: "もっと見る" }));

      expect(mockSetCurrentView).toHaveBeenCalledWith("historySearch");
    });
  });

  describe("状態分岐", () => {
    it("ローディング中は読み込み状態を表示する", () => {
      applyState({ isLoading: true });

      render(<DashboardView now={fixedNow} />);

      expect(screen.getByTestId("dashboard-loading-state")).toHaveTextContent(
        "読み込み中...",
      );
    });

    it("履歴が空の場合は歓迎型 EmptyState を表示する", () => {
      applyState({ activityFeed: [] });

      render(<DashboardView now={fixedNow} />);

      expect(
        screen.getByText("最初のアクションを選びましょう"),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: /ツールを探す/u }),
      ).toHaveLength(2);
    });

    it("不正な時刻は RelativeTime のフォールバックを表示する", () => {
      applyState({
        activityFeed: [
          {
            id: "1",
            message: "時刻不正",
            time: "invalid",
            type: "error" as const,
          },
        ],
      });

      render(<DashboardView now={fixedNow} />);

      expect(screen.getByLabelText("—")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("サジェスチョンはキーボード操作できる", async () => {
      const user = userEvent.setup();
      render(<DashboardView now={fixedNow} />);

      await user.tab();
      await user.tab();

      const suggestionButton = screen.getByRole("button", {
        name: /ツールを探す/u,
      });
      expect(suggestionButton).toHaveFocus();

      await user.keyboard("{Enter}");
      expect(mockSetCurrentView).toHaveBeenCalledWith("skillCenter");
    });

    it("主要セクションが見出しで関連付けられている", () => {
      render(<DashboardView now={fixedNow} />);

      expect(
        screen.getByRole("heading", { name: "おすすめの次のステップ" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "最近の動き" }),
      ).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<DashboardView className="custom-class" now={fixedNow} />);
      expect(screen.getByTestId("dashboard-view")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(DashboardView.displayName).toBe("DashboardView");
    });
  });
});
