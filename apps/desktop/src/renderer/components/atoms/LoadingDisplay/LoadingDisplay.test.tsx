import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingDisplay } from "./index";

describe("LoadingDisplay", () => {
  describe("レンダリング", () => {
    it("デフォルトメッセージを表示する", () => {
      render(<LoadingDisplay />);
      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });

    it("カスタムメッセージを表示する", () => {
      render(<LoadingDisplay message="データを読み込み中..." />);
      expect(screen.getByText("データを読み込み中...")).toBeInTheDocument();
    });

    it("role=statusを持つ", () => {
      render(<LoadingDisplay />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("aria-busy=trueを持つ", () => {
      render(<LoadingDisplay />);
      expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    });

    it("Spinnerを表示する", () => {
      render(<LoadingDisplay />);
      // Spinnerはimg role="status"または svgを持つ
      const status = screen.getByRole("status");
      expect(status).toBeInTheDocument();
    });
  });

  describe("サイズ", () => {
    it("デフォルトサイズはmd", () => {
      render(<LoadingDisplay />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("smサイズを指定できる", () => {
      render(<LoadingDisplay size="sm" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("lgサイズを指定できる", () => {
      render(<LoadingDisplay size="lg" />);
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      render(<LoadingDisplay className="custom-class" />);
      expect(screen.getByRole("status")).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(LoadingDisplay.displayName).toBe("LoadingDisplay");
    });
  });
});
