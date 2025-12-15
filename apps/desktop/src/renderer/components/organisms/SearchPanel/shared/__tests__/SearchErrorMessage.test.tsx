/**
 * SearchErrorMessage コンポーネントのテスト
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchErrorMessage } from "../SearchErrorMessage";

describe("SearchErrorMessage", () => {
  describe("レンダリング", () => {
    it("messageがnullの場合、何も表示しない", () => {
      const { container } = render(<SearchErrorMessage message={null} />);

      expect(container.firstChild).toBeNull();
    });

    it("messageが空文字の場合、何も表示しない", () => {
      const { container } = render(<SearchErrorMessage message="" />);

      expect(container.firstChild).toBeNull();
    });

    it("messageがある場合、エラーメッセージを表示する", () => {
      render(<SearchErrorMessage message="エラーが発生しました" />);

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("alertロールを持つ", () => {
      render(<SearchErrorMessage message="エラー" />);

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("aria-liveがassertiveに設定されている", () => {
      render(<SearchErrorMessage message="エラー" />);

      expect(screen.getByRole("alert")).toHaveAttribute(
        "aria-live",
        "assertive",
      );
    });
  });

  describe("スタイリング", () => {
    it("エラー用のスタイルが適用される", () => {
      render(<SearchErrorMessage message="エラー" />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-red-900/50");
      expect(alert).toHaveClass("border-red-700");
      expect(alert).toHaveClass("text-red-400");
    });

    it("classNameプロパティが適用される", () => {
      render(<SearchErrorMessage message="エラー" className="custom-class" />);

      expect(screen.getByRole("alert")).toHaveClass("custom-class");
    });
  });

  describe("様々なエラーメッセージ", () => {
    it("長いエラーメッセージを表示できる", () => {
      const longMessage =
        "これは非常に長いエラーメッセージです。正規表現が無効な形式です。";
      render(<SearchErrorMessage message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("日本語と英語の混在メッセージを表示できる", () => {
      const mixedMessage = "Invalid regex: 無効な正規表現です";
      render(<SearchErrorMessage message={mixedMessage} />);

      expect(screen.getByText(mixedMessage)).toBeInTheDocument();
    });

    it("特殊文字を含むメッセージを表示できる", () => {
      const specialMessage = "Error: [test] & <invalid>";
      render(<SearchErrorMessage message={specialMessage} />);

      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });
});
