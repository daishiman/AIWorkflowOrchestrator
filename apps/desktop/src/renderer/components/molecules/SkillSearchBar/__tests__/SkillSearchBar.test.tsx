import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SkillSearchBar } from "../index";

describe("SkillSearchBar", () => {
  describe("表示", () => {
    it("入力フィールドをレンダリングする", () => {
      render(<SkillSearchBar value="" onChange={vi.fn()} />);
      expect(
        screen.getByPlaceholderText("スキルを検索..."),
      ).toBeInTheDocument();
    });

    it("現在の値を表示する", () => {
      render(<SkillSearchBar value="tdd" onChange={vi.fn()} />);
      expect(screen.getByDisplayValue("tdd")).toBeInTheDocument();
    });

    it("検索アイコンを表示する", () => {
      render(<SkillSearchBar value="" onChange={vi.fn()} />);
      expect(screen.getByLabelText("検索")).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("デバウンス付きでonChangeを呼び出す", async () => {
      const handleChange = vi.fn();
      render(<SkillSearchBar value="" onChange={handleChange} />);

      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "test" },
      });

      // デバウンス 200ms
      await waitFor(
        () => {
          expect(handleChange).toHaveBeenCalledWith("test");
        },
        { timeout: 300 },
      );
    });

    it("連続入力でデバウンスされる", async () => {
      const handleChange = vi.fn();
      render(<SkillSearchBar value="" onChange={handleChange} />);

      const input = screen.getByRole("searchbox");
      fireEvent.change(input, { target: { value: "t" } });
      fireEvent.change(input, { target: { value: "te" } });
      fireEvent.change(input, { target: { value: "tes" } });
      fireEvent.change(input, { target: { value: "test" } });

      await waitFor(
        () => {
          expect(handleChange).toHaveBeenCalledTimes(1);
          expect(handleChange).toHaveBeenCalledWith("test");
        },
        { timeout: 300 },
      );
    });

    it("クリアボタンで値をクリアする", () => {
      const handleChange = vi.fn();
      render(<SkillSearchBar value="test" onChange={handleChange} />);

      fireEvent.click(screen.getByRole("button", { name: /クリア/i }));
      expect(handleChange).toHaveBeenCalledWith("");
    });

    it("Escapeキーで値をクリアする", () => {
      const handleChange = vi.fn();
      render(<SkillSearchBar value="test" onChange={handleChange} />);

      fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });
      expect(handleChange).toHaveBeenCalledWith("");
    });
  });

  describe("アクセシビリティ", () => {
    it("適切なaria-labelを持つ", () => {
      render(<SkillSearchBar value="" onChange={vi.fn()} />);
      const input = screen.getByRole("searchbox");
      expect(input).toHaveAttribute("aria-label", "スキルを検索");
    });

    it("searchbox roleを持つ", () => {
      render(<SkillSearchBar value="" onChange={vi.fn()} />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("値があるときクリアボタンが表示される", () => {
      render(<SkillSearchBar value="test" onChange={vi.fn()} />);
      expect(
        screen.getByRole("button", { name: /クリア/i }),
      ).toBeInTheDocument();
    });

    it("値がないときクリアボタンが非表示", () => {
      render(<SkillSearchBar value="" onChange={vi.fn()} />);
      expect(
        screen.queryByRole("button", { name: /クリア/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("スタイル", () => {
    it("フォーカス時にリングを表示する", () => {
      render(<SkillSearchBar value="" onChange={vi.fn()} />);
      const input = screen.getByRole("searchbox");
      expect(input).toHaveClass("focus:ring-2");
    });

    it("GlassPanelスタイルを適用する", () => {
      const { container } = render(
        <SkillSearchBar value="" onChange={vi.fn()} />,
      );
      expect(container.firstChild).toHaveClass("backdrop-blur-sm");
    });
  });
});
