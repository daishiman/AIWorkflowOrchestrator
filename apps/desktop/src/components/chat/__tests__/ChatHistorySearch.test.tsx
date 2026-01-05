import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { ChatHistorySearch } from "../ChatHistorySearch";
import type { SearchFilters } from "../types";

expect.extend(toHaveNoViolations);

// モックフィルター
const createMockFilters = (overrides = {}): SearchFilters => ({
  query: "",
  dateFrom: null,
  dateTo: null,
  models: [],
  preset: null,
  ...overrides,
});

// モック利用可能モデル
const mockAvailableModels = [
  { provider: "openai", model: "gpt-4" },
  { provider: "openai", model: "gpt-3.5-turbo" },
  { provider: "anthropic", model: "claude-3-5-sonnet" },
  { provider: "anthropic", model: "claude-3-opus" },
  { provider: "google", model: "gemini-pro" },
];

describe("ChatHistorySearch", () => {
  const defaultProps = {
    filters: createMockFilters(),
    onFiltersChange: vi.fn(),
    onClearFilters: vi.fn(),
    onSearch: vi.fn(),
    availableModels: mockAvailableModels,
    debounceMs: 300,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // shouldAdvanceTime: true で userEvent と互換性を持たせる
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("レンダリング", () => {
    it("検索入力フィールドが表示される", () => {
      render(<ChatHistorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");
      expect(searchInput).toBeInTheDocument();
    });

    it("フィルターボタンが表示される", () => {
      render(<ChatHistorySearch {...defaultProps} />);

      const filterButton = screen.getByLabelText("フィルターを展開");
      expect(filterButton).toBeInTheDocument();
    });

    it("検索領域にsearchロールが設定されている", () => {
      render(<ChatHistorySearch {...defaultProps} />);

      const searchRegion = screen.getByRole("search");
      expect(searchRegion).toBeInTheDocument();
    });

    it("アクティブフィルターがない場合、バッジは表示されない", () => {
      render(<ChatHistorySearch {...defaultProps} />);

      expect(screen.queryByText("フィルター適用中")).not.toBeInTheDocument();
    });

    it("アクティブフィルターがある場合、バッジが表示される", () => {
      const filtersWithDate = createMockFilters({
        dateFrom: new Date("2024-01-01"),
      });
      render(<ChatHistorySearch {...defaultProps} filters={filtersWithDate} />);

      expect(screen.getByText("フィルター適用中")).toBeInTheDocument();
    });
  });

  describe("検索入力", () => {
    it("テキストを入力できる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ChatHistorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");
      await user.type(searchInput, "React");

      expect(searchInput).toHaveValue("React");
    });

    it("入力後デバウンスされてから検索が実行される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<ChatHistorySearch {...defaultProps} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");
      await user.type(searchInput, "React");

      // デバウンス前は検索が呼ばれない
      expect(onSearch).not.toHaveBeenCalled();

      // デバウンス時間経過後に検索が呼ばれる
      vi.advanceTimersByTime(300);
      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ query: "React" }),
      );
    });

    it("連続入力時はデバウンスによって最後の入力のみ検索される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<ChatHistorySearch {...defaultProps} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");

      // 連続入力
      await user.type(searchInput, "R");
      vi.advanceTimersByTime(100);
      await user.type(searchInput, "e");
      vi.advanceTimersByTime(100);
      await user.type(searchInput, "a");
      vi.advanceTimersByTime(100);
      await user.type(searchInput, "c");
      vi.advanceTimersByTime(100);
      await user.type(searchInput, "t");

      // まだ検索されていない
      expect(onSearch).not.toHaveBeenCalled();

      // 最後の入力から300ms後に検索
      vi.advanceTimersByTime(300);
      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ query: "React" }),
      );
    });

    it("検索入力クリアで空クエリで検索される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(
        <ChatHistorySearch
          {...defaultProps}
          filters={createMockFilters({ query: "existing" })}
          onSearch={onSearch}
        />,
      );

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");
      await user.clear(searchInput);

      vi.advanceTimersByTime(300);
      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ query: "" }),
      );
    });
  });

  describe("キーボードショートカット", () => {
    it("Cmd/Ctrl + K で検索入力にフォーカスする", async () => {
      render(<ChatHistorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");
      expect(document.activeElement).not.toBe(searchInput);

      // Cmd + K を押す
      fireEvent.keyDown(document, { key: "k", metaKey: true });

      expect(document.activeElement).toBe(searchInput);
    });

    it("Ctrl + K でも検索入力にフォーカスする", async () => {
      render(<ChatHistorySearch {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");

      fireEvent.keyDown(document, { key: "k", ctrlKey: true });

      expect(document.activeElement).toBe(searchInput);
    });
  });

  describe("フィルターパネル", () => {
    it("フィルターボタンをクリックするとパネルが展開される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ChatHistorySearch {...defaultProps} />);

      const filterButton = screen.getByLabelText("フィルターを展開");
      await user.click(filterButton);

      // フィルターパネルの内容が表示される
      expect(screen.getByText(/日付範囲|期間/)).toBeInTheDocument();
      expect(screen.getByText(/モデル/)).toBeInTheDocument();
    });

    it("フィルターパネル展開時、aria-expandedがtrueになる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ChatHistorySearch {...defaultProps} />);

      const filterButton = screen.getByLabelText("フィルターを展開");
      expect(filterButton).toHaveAttribute("aria-expanded", "false");

      await user.click(filterButton);

      expect(filterButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("日付プリセット", () => {
    it("「今日」プリセットをクリックすると今日の日付範囲が設定される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFiltersChange = vi.fn();
      render(
        <ChatHistorySearch
          {...defaultProps}
          onFiltersChange={onFiltersChange}
        />,
      );

      // フィルターパネルを開く
      await user.click(screen.getByLabelText("フィルターを展開"));

      // 今日プリセットをクリック
      await user.click(screen.getByRole("button", { name: "今日" }));

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          preset: "today",
          dateFrom: expect.any(Date),
          dateTo: expect.any(Date),
        }),
      );
    });

    it("「7日」プリセットをクリックすると過去7日の日付範囲が設定される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFiltersChange = vi.fn();
      render(
        <ChatHistorySearch
          {...defaultProps}
          onFiltersChange={onFiltersChange}
        />,
      );

      await user.click(screen.getByLabelText("フィルターを展開"));
      await user.click(screen.getByRole("button", { name: /7日|過去7日/ }));

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ preset: "7days" }),
      );
    });

    it("「30日」プリセットをクリックすると過去30日の日付範囲が設定される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFiltersChange = vi.fn();
      render(
        <ChatHistorySearch
          {...defaultProps}
          onFiltersChange={onFiltersChange}
        />,
      );

      await user.click(screen.getByLabelText("フィルターを展開"));
      await user.click(screen.getByRole("button", { name: /30日|過去30日/ }));

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ preset: "30days" }),
      );
    });

    it("選択中のプリセットがハイライトされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <ChatHistorySearch
          {...defaultProps}
          filters={createMockFilters({ preset: "7days" })}
        />,
      );

      await user.click(screen.getByLabelText("フィルターを展開"));

      const preset7DaysButton = screen.getByRole("button", {
        name: /7日|過去7日/,
      });
      expect(preset7DaysButton).toHaveClass(/active|selected|accent/i);
    });
  });

  describe("カスタム日付範囲", () => {
    it("カスタム日付を入力すると日付範囲が設定される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFiltersChange = vi.fn();
      render(
        <ChatHistorySearch
          {...defaultProps}
          onFiltersChange={onFiltersChange}
        />,
      );

      await user.click(screen.getByLabelText("フィルターを展開"));

      // 開始日を入力
      const startDateInput = screen.getByLabelText(/開始日|From/);
      await user.type(startDateInput, "2024-01-01");

      // 終了日を入力
      const endDateInput = screen.getByLabelText(/終了日|To/);
      await user.type(endDateInput, "2024-12-31");

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          preset: "custom",
        }),
      );
    });
  });

  describe("モデルフィルター", () => {
    it("モデル一覧が表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ChatHistorySearch {...defaultProps} />);

      await user.click(screen.getByLabelText("フィルターを展開"));

      // モデルが表示される
      expect(screen.getByText(/gpt-4/i)).toBeInTheDocument();
      expect(screen.getByText(/claude-3-5-sonnet/i)).toBeInTheDocument();
    });

    it("モデルをクリックするとフィルターに追加される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFiltersChange = vi.fn();
      render(
        <ChatHistorySearch
          {...defaultProps}
          onFiltersChange={onFiltersChange}
        />,
      );

      await user.click(screen.getByLabelText("フィルターを展開"));

      // GPT-4を選択
      const gpt4Checkbox = screen.getByRole("checkbox", { name: /gpt-4/i });
      await user.click(gpt4Checkbox);

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          models: expect.arrayContaining(["openai/gpt-4"]),
        }),
      );
    });

    it("選択中のモデルを再クリックするとフィルターから削除される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFiltersChange = vi.fn();
      render(
        <ChatHistorySearch
          {...defaultProps}
          filters={createMockFilters({ models: ["openai/gpt-4"] })}
          onFiltersChange={onFiltersChange}
        />,
      );

      await user.click(screen.getByLabelText("フィルターを展開"));

      const gpt4Checkbox = screen.getByRole("checkbox", { name: /gpt-4/i });
      expect(gpt4Checkbox).toBeChecked();

      await user.click(gpt4Checkbox);

      expect(onFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          models: [],
        }),
      );
    });

    it("複数のモデルを選択できる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onFiltersChange = vi.fn();
      const { rerender } = render(
        <ChatHistorySearch
          {...defaultProps}
          onFiltersChange={onFiltersChange}
        />,
      );

      await user.click(screen.getByLabelText("フィルターを展開"));

      // 最初のモデルを選択
      await user.click(screen.getByRole("checkbox", { name: /gpt-4/i }));
      expect(onFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          models: ["openai/gpt-4"],
        }),
      );

      // フィルター状態を更新して再レンダリング（制御コンポーネント）
      rerender(
        <ChatHistorySearch
          {...defaultProps}
          filters={createMockFilters({ models: ["openai/gpt-4"] })}
          onFiltersChange={onFiltersChange}
        />,
      );

      // 2つ目のモデルを選択
      await user.click(
        screen.getByRole("checkbox", { name: /claude-3-5-sonnet/i }),
      );
      expect(onFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          models: expect.arrayContaining([
            "openai/gpt-4",
            "anthropic/claude-3-5-sonnet",
          ]),
        }),
      );
    });
  });

  describe("フィルタークリア", () => {
    it("クリアボタンをクリックするとフィルターがリセットされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onClearFilters = vi.fn();
      render(
        <ChatHistorySearch
          {...defaultProps}
          filters={createMockFilters({
            query: "test",
            dateFrom: new Date(),
            models: ["openai/gpt-4"],
          })}
          onClearFilters={onClearFilters}
        />,
      );

      await user.click(screen.getByLabelText("フィルターを展開"));
      await user.click(screen.getByRole("button", { name: /クリア|リセット/ }));

      expect(onClearFilters).toHaveBeenCalled();
    });

    it("フィルターがない場合、クリアボタンは無効または非表示", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ChatHistorySearch {...defaultProps} />);

      await user.click(screen.getByLabelText("フィルターを展開"));

      const clearButton = screen.queryByRole("button", {
        name: /クリア|リセット/,
      });
      if (clearButton) {
        expect(clearButton).toBeDisabled();
      }
    });
  });

  describe("検索キャンセル", () => {
    it("新しい検索が開始されると前回の検索がキャンセルされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<ChatHistorySearch {...defaultProps} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");

      // 最初の検索
      await user.type(searchInput, "first");
      vi.advanceTimersByTime(200); // デバウンス途中

      // 入力を変更（これにより前回の検索がキャンセルされる）
      await user.clear(searchInput);
      await user.type(searchInput, "second");

      // デバウンス時間経過
      vi.advanceTimersByTime(300);

      // 最新の検索クエリのみが呼ばれる
      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ query: "second" }),
      );
    });
  });

  describe("アクセシビリティ", () => {
    it("axe-coreによるアクセシビリティ違反がない", async () => {
      const { container } = render(<ChatHistorySearch {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("検索入力にaria-labelが設定されている", () => {
      render(<ChatHistorySearch {...defaultProps} />);

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toHaveAttribute("aria-label");
    });

    it("スクリーンリーダー用のヒントが存在する", () => {
      render(<ChatHistorySearch {...defaultProps} />);

      // sr-onlyクラスのヒントテキスト
      expect(screen.getByText(/キーワードを入力して/)).toBeInTheDocument();
    });

    it("フィルターパネル展開時もアクセシビリティ違反がない", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container } = render(<ChatHistorySearch {...defaultProps} />);

      await user.click(screen.getByLabelText("フィルターを展開"));

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("パフォーマンス", () => {
    it("デバウンスによって不要なAPI呼び出しが防がれる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<ChatHistorySearch {...defaultProps} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");

      // 高速で入力
      for (let i = 0; i < 10; i++) {
        await user.type(searchInput, "a");
        vi.advanceTimersByTime(50); // 50ms間隔で入力
      }

      // まだ検索されていない
      expect(onSearch).not.toHaveBeenCalled();

      // 最後の入力から300ms後
      vi.advanceTimersByTime(300);

      // 1回だけ呼ばれる
      expect(onSearch).toHaveBeenCalledTimes(1);
    });
  });

  describe("エッジケース", () => {
    it("空のモデルリストでもエラーなくレンダリングされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<ChatHistorySearch {...defaultProps} availableModels={[]} />);

      await user.click(screen.getByLabelText("フィルターを展開"));

      // エラーなくレンダリング
      expect(screen.getByRole("search")).toBeInTheDocument();
    });

    it("特殊文字を含む検索クエリが正しく処理される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onSearch = vi.fn();
      render(<ChatHistorySearch {...defaultProps} onSearch={onSearch} />);

      const searchInput = screen.getByPlaceholderText("チャット履歴を検索...");
      await user.type(searchInput, "test & <script>");

      vi.advanceTimersByTime(300);

      expect(onSearch).toHaveBeenCalledWith(
        expect.objectContaining({ query: "test & <script>" }),
      );
    });
  });
});
