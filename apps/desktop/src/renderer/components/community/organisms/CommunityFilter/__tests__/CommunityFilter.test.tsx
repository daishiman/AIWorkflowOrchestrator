/**
 * CommunityFilter コンポーネントテスト
 * Phase 4: TDD Redフェーズ
 *
 * @description フィルターコントロールのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityFilter } from "../index";

describe("CommunityFilter", () => {
  const mockOnLevelChange = vi.fn();
  const mockOnSearch = vi.fn();

  const availableLevels = [0, 1, 2, 3];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe("レベルフィルター", () => {
    it("利用可能なレベルがドロップダウンに表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      // ドロップダウンを開く
      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      await user.click(levelSelect);

      // 全レベルオプションが表示される
      availableLevels.forEach((level) => {
        expect(
          screen.getByRole("option", { name: new RegExp(`Level ${level}`) }),
        ).toBeInTheDocument();
      });
    });

    it("レベル選択でonLevelChangeが呼ばれる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      await user.selectOptions(levelSelect, "1");

      expect(mockOnLevelChange).toHaveBeenCalledWith(1);
    });

    it("「全て」オプションで全レベルが表示される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <CommunityFilter
          selectedLevel={1}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });

      // 「全て」オプションを選択（空文字列は全てを意味する）
      await user.selectOptions(levelSelect, "");

      expect(mockOnLevelChange).toHaveBeenCalledWith(null);
    });

    it("選択中のレベルがハイライト表示される", () => {
      render(
        <CommunityFilter
          selectedLevel={2}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      expect(levelSelect).toHaveValue("2");
    });
  });

  describe("検索", () => {
    it("検索入力フィールドが表示される", () => {
      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      expect(screen.getByRole("searchbox")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/コミュニティを検索/i),
      ).toBeInTheDocument();
    });

    it("入力でonSearchが呼ばれる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const searchInput = screen.getByRole("searchbox");
      await user.type(searchInput, "AI");

      // デバウンス時間を進める
      await vi.advanceTimersByTimeAsync(300);

      expect(mockOnSearch).toHaveBeenCalledWith("AI");
    });

    it("デバウンス処理が適用される", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const searchInput = screen.getByRole("searchbox");

      // 連続入力
      await user.type(searchInput, "A");
      await vi.advanceTimersByTimeAsync(100);
      await user.type(searchInput, "I");
      await vi.advanceTimersByTimeAsync(100);
      await user.type(searchInput, " Machine");

      // デバウンス時間前は呼ばれない
      expect(mockOnSearch).not.toHaveBeenCalled();

      // デバウンス時間経過
      await vi.advanceTimersByTimeAsync(300);

      // 最終入力値で1回だけ呼ばれる
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith("AI Machine");
    });

    it("クリアボタンで入力がクリアされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery="AI"
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const clearButton = screen.getByRole("button", { name: /クリア/i });
      await user.click(clearButton);

      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("検索クエリが表示される", () => {
      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery="機械学習"
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toHaveValue("機械学習");
    });

    it("空クエリ時はクリアボタンが非表示", () => {
      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      expect(
        screen.queryByRole("button", { name: /クリア/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("キーボードでレベル選択が可能", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });

      // Tabでフォーカス
      await user.tab();
      expect(levelSelect).toHaveFocus();

      // selectOptionsでキーボード選択をシミュレート
      await user.selectOptions(levelSelect, "0");

      expect(mockOnLevelChange).toHaveBeenCalled();
    });

    it("検索入力にラベルが関連付けられている", () => {
      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const searchInput = screen.getByRole("searchbox");
      expect(searchInput).toHaveAccessibleName(/検索/i);
    });

    it("Escapeで検索がクリアされる", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery="テスト"
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const searchInput = screen.getByRole("searchbox");
      await user.click(searchInput);
      await user.keyboard("{Escape}");

      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("フィルターセクションにaria-labelが設定されている", () => {
      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      expect(screen.getByRole("search")).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/フィルター/i),
      );
    });

    it("レベル選択にaria-labelが設定されている", () => {
      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      const levelSelect = screen.getByRole("combobox", {
        name: /レベルフィルター/i,
      });
      expect(levelSelect).toHaveAttribute("aria-label");
    });
  });

  describe("レベル情報表示", () => {
    it("レベル数が表示される", () => {
      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={availableLevels}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      expect(screen.getByText(/4レベル/)).toBeInTheDocument();
    });

    it("利用可能レベルが0件の場合は適切なメッセージが表示される", () => {
      render(
        <CommunityFilter
          selectedLevel={null}
          searchQuery=""
          availableLevels={[]}
          onLevelChange={mockOnLevelChange}
          onSearch={mockOnSearch}
        />,
      );

      expect(screen.getByText(/レベルなし/i)).toBeInTheDocument();
    });
  });
});
