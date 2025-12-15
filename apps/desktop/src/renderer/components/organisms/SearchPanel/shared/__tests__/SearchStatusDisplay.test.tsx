/**
 * SearchStatusDisplay コンポーネントのテスト
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchStatusDisplay } from "../SearchStatusDisplay";

describe("SearchStatusDisplay", () => {
  const createProps = (overrides = {}) => ({
    isLoading: false,
    hasSearched: false,
    hasResults: false,
    totalCount: 0,
    ...overrides,
  });

  describe("ローディング状態", () => {
    it("isLoadingがtrueの場合、ローディングインジケータを表示する", () => {
      render(<SearchStatusDisplay {...createProps({ isLoading: true })} />);

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByLabelText("検索中")).toBeInTheDocument();
    });

    it("ローディング中はローディングアイコンを表示する", () => {
      const { container } = render(
        <SearchStatusDisplay {...createProps({ isLoading: true })} />,
      );

      // lucide-iconのsvgが存在することを確認
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("検索未実行状態", () => {
    it("hasSearchedがfalseの場合、空のステータスを表示する", () => {
      render(<SearchStatusDisplay {...createProps({ hasSearched: false })} />);

      const status = screen.getByRole("status");
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent("");
    });
  });

  describe("検索結果あり状態", () => {
    it("カウンター形式で結果を表示する（デフォルト）", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: true,
            totalCount: 10,
            currentIndex: 2,
          })}
        />,
      );

      expect(screen.getByText("3 / 10")).toBeInTheDocument();
    });

    it("件数形式で結果を表示する", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: true,
            totalCount: 10,
            displayFormat: "count",
          })}
        />,
      );

      expect(screen.getByText("10 件")).toBeInTheDocument();
    });

    it("currentIndexが0の場合、1番目として表示する", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: true,
            totalCount: 5,
            currentIndex: 0,
          })}
        />,
      );

      expect(screen.getByText("1 / 5")).toBeInTheDocument();
    });
  });

  describe("検索結果なし状態", () => {
    it("結果なしメッセージを表示する", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: false,
            totalCount: 0,
          })}
        />,
      );

      expect(screen.getByText("結果なし / 0件")).toBeInTheDocument();
    });

    it("結果なしの場合、薄い色のテキストを使用する", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: false,
            totalCount: 0,
          })}
        />,
      );

      expect(screen.getByRole("status")).toHaveClass("text-slate-500");
    });
  });

  describe("アクセシビリティ", () => {
    it("statusロールを持つ", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: true,
            totalCount: 5,
          })}
        />,
      );

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("aria-liveがpoliteに設定されている", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: true,
            totalCount: 5,
          })}
        />,
      );

      expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("スタイリング", () => {
    it("結果ありの場合、通常色のテキストを使用する", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: true,
            totalCount: 5,
          })}
        />,
      );

      expect(screen.getByRole("status")).toHaveClass("text-slate-400");
    });

    it("classNameプロパティが適用される", () => {
      render(
        <SearchStatusDisplay
          {...createProps({ hasSearched: true, className: "custom-class" })}
        />,
      );

      expect(screen.getByRole("status")).toHaveClass("custom-class");
    });

    it("tabular-numsクラスが適用される", () => {
      render(
        <SearchStatusDisplay
          {...createProps({
            hasSearched: true,
            hasResults: true,
            totalCount: 5,
          })}
        />,
      );

      expect(screen.getByRole("status")).toHaveClass("tabular-nums");
    });
  });
});
