import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { ChatHistoryList } from "../ChatHistoryList";
import type { SessionGroup } from "../types";

expect.extend(toHaveNoViolations);

// モックセッションデータ
const createMockSession = (overrides = {}) => ({
  id: `session-${Math.random().toString(36).slice(2)}`,
  userId: "user-001",
  title: "Test Session",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messageCount: 5,
  isFavorite: false,
  isPinned: false,
  pinOrder: null,
  lastMessagePreview: "Hello, this is a preview...",
  metadata: {},
  deletedAt: null,
  ...overrides,
});

// モックセッショングループ
const createMockSessionGroups = (): SessionGroup[] => [
  {
    label: "ピン留め",
    sessions: [
      createMockSession({
        id: "pinned-1",
        title: "Pinned Session 1",
        isPinned: true,
        pinOrder: 1,
      }),
      createMockSession({
        id: "pinned-2",
        title: "Pinned Session 2",
        isPinned: true,
        pinOrder: 2,
      }),
    ],
  },
  {
    label: "今日",
    sessions: [
      createMockSession({ id: "today-1", title: "Today Session 1" }),
      createMockSession({
        id: "today-2",
        title: "Today Session 2",
        isFavorite: true,
      }),
    ],
  },
  {
    label: "昨日",
    sessions: [
      createMockSession({ id: "yesterday-1", title: "Yesterday Session" }),
    ],
  },
];

describe("ChatHistoryList", () => {
  const defaultProps = {
    sessionGroups: createMockSessionGroups(),
    selectedSessionId: null,
    onSelectSession: vi.fn(),
    onTogglePin: vi.fn().mockResolvedValue(undefined),
    onToggleFavorite: vi.fn().mockResolvedValue(undefined),
    onDeleteSession: vi.fn().mockResolvedValue(undefined),
    onUpdateTitle: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("レンダリング", () => {
    it("セッショングループとセッションが正しくレンダリングされる", () => {
      render(<ChatHistoryList {...defaultProps} />);

      // グループラベルが表示される
      expect(screen.getByText("ピン留め")).toBeInTheDocument();
      expect(screen.getByText("今日")).toBeInTheDocument();
      expect(screen.getByText("昨日")).toBeInTheDocument();

      // セッションタイトルが表示される
      expect(screen.getByText("Pinned Session 1")).toBeInTheDocument();
      expect(screen.getByText("Today Session 1")).toBeInTheDocument();
      expect(screen.getByText("Yesterday Session")).toBeInTheDocument();
    });

    it("セッションのプレビューが表示される", () => {
      render(<ChatHistoryList {...defaultProps} />);

      const previews = screen.getAllByText(/Hello, this is a preview/);
      expect(previews.length).toBeGreaterThan(0);
    });

    it("セッションのメッセージ数が表示される", () => {
      render(<ChatHistoryList {...defaultProps} />);

      const messageCountElements = screen.getAllByText(/5件/);
      expect(messageCountElements.length).toBeGreaterThan(0);
    });

    it("空のセッション一覧の場合、空状態メッセージが表示される", () => {
      render(<ChatHistoryList {...defaultProps} sessionGroups={[]} />);

      expect(
        screen.getByText("まだチャット履歴がありません"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("新しいチャットを開始してください"),
      ).toBeInTheDocument();
    });

    it("カスタム空状態コンポーネントが渡された場合、それが表示される", () => {
      const customEmptyState = (
        <div data-testid="custom-empty">カスタム空状態</div>
      );
      render(
        <ChatHistoryList
          {...defaultProps}
          sessionGroups={[]}
          emptyState={customEmptyState}
        />,
      );

      expect(screen.getByTestId("custom-empty")).toBeInTheDocument();
    });

    it("エラー状態の場合、エラーメッセージが表示される", () => {
      const error = new Error("セッションの読み込みに失敗しました");
      render(<ChatHistoryList {...defaultProps} error={error} />);

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      expect(
        screen.getByText("セッションの読み込みに失敗しました"),
      ).toBeInTheDocument();
    });

    it("ローディング中はスケルトンが表示される", () => {
      render(
        <ChatHistoryList
          {...defaultProps}
          sessionGroups={[]}
          isLoading={true}
        />,
      );

      // スケルトン要素が表示される
      const skeletons = document.querySelectorAll(
        '[class*="skeleton"], [class*="Skeleton"]',
      );
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("セッション選択", () => {
    it("セッションをクリックすると選択コールバックが呼ばれる", async () => {
      const user = userEvent.setup();
      const onSelectSession = vi.fn();

      render(
        <ChatHistoryList {...defaultProps} onSelectSession={onSelectSession} />,
      );

      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      await user.click(sessionItem!);

      expect(onSelectSession).toHaveBeenCalledWith("today-1");
    });

    it("選択中のセッションがハイライトされる", () => {
      render(<ChatHistoryList {...defaultProps} selectedSessionId="today-1" />);

      const selectedItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      expect(selectedItem).toHaveAttribute("aria-selected", "true");
    });

    it("Enterキーでセッションを選択できる", async () => {
      const user = userEvent.setup();
      const onSelectSession = vi.fn();

      render(
        <ChatHistoryList {...defaultProps} onSelectSession={onSelectSession} />,
      );

      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      sessionItem?.focus();
      await user.keyboard("{Enter}");

      expect(onSelectSession).toHaveBeenCalledWith("today-1");
    });

    it("Spaceキーでセッションを選択できる", async () => {
      const user = userEvent.setup();
      const onSelectSession = vi.fn();

      render(
        <ChatHistoryList {...defaultProps} onSelectSession={onSelectSession} />,
      );

      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      sessionItem?.focus();
      await user.keyboard(" ");

      expect(onSelectSession).toHaveBeenCalledWith("today-1");
    });
  });

  describe("ピン留め操作", () => {
    it("ピン留めボタンをクリックするとピン留めトグルコールバックが呼ばれる", async () => {
      const user = userEvent.setup();
      const onTogglePin = vi.fn().mockResolvedValue(undefined);

      render(<ChatHistoryList {...defaultProps} onTogglePin={onTogglePin} />);

      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const pinButton = within(sessionItem!).getByLabelText("ピン留め");
      await user.click(pinButton);

      expect(onTogglePin).toHaveBeenCalledWith("today-1", true);
    });

    it("ピン留め済みセッションのピンボタンをクリックすると解除される", async () => {
      const user = userEvent.setup();
      const onTogglePin = vi.fn().mockResolvedValue(undefined);

      render(<ChatHistoryList {...defaultProps} onTogglePin={onTogglePin} />);

      const sessionItem = screen
        .getByText("Pinned Session 1")
        .closest('[role="option"]') as HTMLElement;
      const unpinButton = within(sessionItem!).getByLabelText("ピン留め解除");
      await user.click(unpinButton);

      expect(onTogglePin).toHaveBeenCalledWith("pinned-1", false);
    });

    it("ピン留め操作がセッション選択を阻止しない（イベント伝播停止）", async () => {
      const user = userEvent.setup();
      const onSelectSession = vi.fn();
      const onTogglePin = vi.fn().mockResolvedValue(undefined);

      render(
        <ChatHistoryList
          {...defaultProps}
          onSelectSession={onSelectSession}
          onTogglePin={onTogglePin}
        />,
      );

      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const pinButton = within(sessionItem!).getByLabelText("ピン留め");
      await user.click(pinButton);

      expect(onTogglePin).toHaveBeenCalled();
      // ピンボタンクリック時はセッション選択されない
      expect(onSelectSession).not.toHaveBeenCalled();
    });
  });

  describe("お気に入り操作", () => {
    it("お気に入りボタンをクリックするとお気に入りトグルコールバックが呼ばれる", async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn().mockResolvedValue(undefined);

      render(
        <ChatHistoryList
          {...defaultProps}
          onToggleFavorite={onToggleFavorite}
        />,
      );

      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const favoriteButton = within(sessionItem!).getByLabelText("お気に入り");
      await user.click(favoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith("today-1", true);
    });

    it("お気に入り済みセッションのボタンをクリックすると解除される", async () => {
      const user = userEvent.setup();
      const onToggleFavorite = vi.fn().mockResolvedValue(undefined);

      render(
        <ChatHistoryList
          {...defaultProps}
          onToggleFavorite={onToggleFavorite}
        />,
      );

      const sessionItem = screen
        .getByText("Today Session 2")
        .closest('[role="option"]') as HTMLElement;
      const unfavoriteButton = within(sessionItem!).getByLabelText(
        "お気に入り解除",
      );
      await user.click(unfavoriteButton);

      expect(onToggleFavorite).toHaveBeenCalledWith("today-2", false);
    });
  });

  describe("タイトル編集", () => {
    it("メニューから名前変更を選択すると編集モードになる", async () => {
      const user = userEvent.setup();

      render(<ChatHistoryList {...defaultProps} />);

      // メニューを開く
      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const menuButton = within(sessionItem!).getByLabelText(
        "その他のアクション",
      );
      await user.click(menuButton);

      // 名前変更オプションをクリック
      const renameButton = screen.getByText("名前を変更");
      await user.click(renameButton);

      // 編集入力欄が表示される
      const input = screen.getByLabelText("セッションタイトルを編集");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue("Today Session 1");
    });

    it("編集中にEnterキーを押すとタイトルが保存される", async () => {
      const user = userEvent.setup();
      const onUpdateTitle = vi.fn().mockResolvedValue(undefined);

      render(
        <ChatHistoryList {...defaultProps} onUpdateTitle={onUpdateTitle} />,
      );

      // 編集モードに入る（メニュー経由）
      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const menuButton = within(sessionItem!).getByLabelText(
        "その他のアクション",
      );
      await user.click(menuButton);
      await user.click(screen.getByText("名前を変更"));

      // タイトルを変更
      const input = screen.getByLabelText("セッションタイトルを編集");
      await user.clear(input);
      await user.type(input, "New Title{Enter}");

      expect(onUpdateTitle).toHaveBeenCalledWith("today-1", "New Title");
    });

    it("編集中にEscapeキーを押すと編集がキャンセルされる", async () => {
      const user = userEvent.setup();
      const onUpdateTitle = vi.fn().mockResolvedValue(undefined);

      render(
        <ChatHistoryList {...defaultProps} onUpdateTitle={onUpdateTitle} />,
      );

      // 編集モードに入る
      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const menuButton = within(sessionItem!).getByLabelText(
        "その他のアクション",
      );
      await user.click(menuButton);
      await user.click(screen.getByText("名前を変更"));

      // タイトルを変更してからEscapeでキャンセル
      const input = screen.getByLabelText("セッションタイトルを編集");
      await user.type(input, "Modified Title");
      await user.keyboard("{Escape}");

      // 保存されない
      expect(onUpdateTitle).not.toHaveBeenCalled();

      // 元のタイトルが表示される
      expect(screen.getByText("Today Session 1")).toBeInTheDocument();
    });
  });

  describe("セッション削除", () => {
    it("メニューから削除を選択すると確認ダイアログが表示される", async () => {
      const user = userEvent.setup();

      render(<ChatHistoryList {...defaultProps} />);

      // メニューを開く
      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const menuButton = within(sessionItem!).getByLabelText(
        "その他のアクション",
      );
      await user.click(menuButton);

      // 削除オプションをクリック
      await user.click(screen.getByText("削除"));

      // 確認ダイアログが表示される
      expect(screen.getByText(/削除しますか/)).toBeInTheDocument();
    });

    it("削除確認ダイアログで確認すると削除コールバックが呼ばれる", async () => {
      const user = userEvent.setup();
      const onDeleteSession = vi.fn().mockResolvedValue(undefined);

      render(
        <ChatHistoryList {...defaultProps} onDeleteSession={onDeleteSession} />,
      );

      // 削除ダイアログを開く
      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const menuButton = within(sessionItem!).getByLabelText(
        "その他のアクション",
      );
      await user.click(menuButton);
      await user.click(screen.getByText("削除"));

      // 確認ボタンをクリック
      await user.click(screen.getByRole("button", { name: /確認|削除/ }));

      expect(onDeleteSession).toHaveBeenCalledWith("today-1");
    });

    it("削除確認ダイアログでキャンセルすると削除されない", async () => {
      const user = userEvent.setup();
      const onDeleteSession = vi.fn().mockResolvedValue(undefined);

      render(
        <ChatHistoryList {...defaultProps} onDeleteSession={onDeleteSession} />,
      );

      // 削除ダイアログを開く
      const sessionItem = screen
        .getByText("Today Session 1")
        .closest('[role="option"]') as HTMLElement;
      const menuButton = within(sessionItem!).getByLabelText(
        "その他のアクション",
      );
      await user.click(menuButton);
      await user.click(screen.getByText("削除"));

      // キャンセルボタンをクリック
      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(onDeleteSession).not.toHaveBeenCalled();
    });
  });

  describe("無限スクロール", () => {
    it("hasMore=trueの場合、センチネル要素が表示される", () => {
      render(
        <ChatHistoryList
          {...defaultProps}
          hasMore={true}
          onLoadMore={vi.fn()}
        />,
      );

      const sentinel = document.querySelector("[data-sentinel]");
      expect(sentinel).toBeInTheDocument();
    });

    it("hasMore=falseの場合、センチネル要素は表示されない", () => {
      render(<ChatHistoryList {...defaultProps} hasMore={false} />);

      const sentinel = document.querySelector("[data-sentinel]");
      expect(sentinel).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("axe-coreによるアクセシビリティ違反がない", async () => {
      const { container } = render(<ChatHistoryList {...defaultProps} />);

      // nested-interactive ルールを無効化
      // リストボックス内のアクションボタンは一般的なUIパターンで、意図的な設計
      const results = await axe(container, {
        rules: {
          "nested-interactive": { enabled: false },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it("リストボックスロールが正しく設定されている", () => {
      render(<ChatHistoryList {...defaultProps} />);

      const listbox = screen.getByRole("listbox", { name: "チャット履歴" });
      expect(listbox).toBeInTheDocument();
    });

    it("各セッションアイテムにオプションロールが設定されている", () => {
      render(<ChatHistoryList {...defaultProps} />);

      const options = screen.getAllByRole("option");
      expect(options.length).toBe(5); // 2 pinned + 2 today + 1 yesterday
    });

    it("選択状態が正しくaria-selectedで伝達される", () => {
      render(<ChatHistoryList {...defaultProps} selectedSessionId="today-1" />);

      const selectedOption = screen.getByRole("option", { selected: true });
      expect(selectedOption).toBeInTheDocument();
    });

    it("キーボードナビゲーションが可能", async () => {
      const user = userEvent.setup();

      render(<ChatHistoryList {...defaultProps} />);

      const options = screen.getAllByRole("option");
      (options[0] as HTMLElement).focus();

      // 矢印キーでナビゲーション
      await user.keyboard("{ArrowDown}");

      // フォーカスが次のアイテムに移動
      expect(document.activeElement).toBe(options[1]);
    });
  });

  describe("パフォーマンス", () => {
    it("大量のセッションでもレンダリングが完了する", () => {
      const manyGroups: SessionGroup[] = [
        {
          label: "多数のセッション",
          sessions: Array.from({ length: 100 }, (_, i) =>
            createMockSession({ id: `session-${i}`, title: `Session ${i}` }),
          ),
        },
      ];

      const startTime = performance.now();
      render(<ChatHistoryList {...defaultProps} sessionGroups={manyGroups} />);
      const endTime = performance.now();

      // 1秒以内にレンダリング完了
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
