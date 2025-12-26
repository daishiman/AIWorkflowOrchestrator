import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SaveTemplateDialog } from "./index";

describe("SaveTemplateDialog", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    previewContent: "テストプロンプト",
    existingNames: [],
  };

  describe("レンダリング", () => {
    it("閉じている時は表示しない", () => {
      render(<SaveTemplateDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("開いている時はダイアログを表示する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("タイトルを表示する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByText("テンプレートを保存")).toBeInTheDocument();
    });

    it("名前入力フィールドを表示する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByLabelText("テンプレート名")).toBeInTheDocument();
    });

    it("プレビューを表示する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByText("プレビュー")).toBeInTheDocument();
      expect(screen.getByText(/テストプロンプト/)).toBeInTheDocument();
    });

    it("文字数カウントを表示する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByText(/0 \/ 50 文字/)).toBeInTheDocument();
    });
  });

  describe("インタラクション", () => {
    it("名前入力時に文字数カウントを更新する", async () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      const input = screen.getByLabelText("テンプレート名");
      await userEvent.type(input, "テスト");
      expect(screen.getByText(/3 \/ 50 文字/)).toBeInTheDocument();
    });

    it("保存ボタンクリック時にonSaveを呼び出す", async () => {
      const handleSave = vi.fn();
      render(<SaveTemplateDialog {...defaultProps} onSave={handleSave} />);
      const input = screen.getByLabelText("テンプレート名");
      await userEvent.type(input, "マイテンプレート");
      fireEvent.click(screen.getByRole("button", { name: "保存" }));
      expect(handleSave).toHaveBeenCalledWith("マイテンプレート");
    });

    it("キャンセルボタンクリック時にonCloseを呼び出す", () => {
      const handleClose = vi.fn();
      render(<SaveTemplateDialog {...defaultProps} onClose={handleClose} />);
      fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("閉じるボタン(×)クリック時にonCloseを呼び出す", () => {
      const handleClose = vi.fn();
      render(<SaveTemplateDialog {...defaultProps} onClose={handleClose} />);
      fireEvent.click(screen.getByLabelText("閉じる"));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("Escapeキーでダイアログを閉じる", () => {
      const handleClose = vi.fn();
      render(<SaveTemplateDialog {...defaultProps} onClose={handleClose} />);
      fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it("背景オーバーレイクリック時にonCloseを呼び出す", () => {
      const handleClose = vi.fn();
      render(<SaveTemplateDialog {...defaultProps} onClose={handleClose} />);
      const overlay = screen.getByRole("dialog").parentElement;
      if (overlay) {
        fireEvent.click(overlay);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("バリデーション", () => {
    it("空の名前では保存ボタンを無効化する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });

    it("空白のみの名前では保存ボタンを無効化する", async () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      const input = screen.getByLabelText("テンプレート名");
      await userEvent.type(input, "   ");
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });

    it("50文字を超える名前ではエラーを表示する", async () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      const input = screen.getByLabelText("テンプレート名");
      const longName = "あ".repeat(51);
      await userEvent.type(input, longName);
      expect(
        screen.getByText("テンプレート名は50文字以内で入力してください"),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });

    it("重複する名前ではエラーを表示する", async () => {
      render(
        <SaveTemplateDialog
          {...defaultProps}
          existingNames={["既存テンプレート"]}
        />,
      );
      const input = screen.getByLabelText("テンプレート名");
      await userEvent.type(input, "既存テンプレート");
      expect(
        screen.getByText("同じ名前のテンプレートが既に存在します"),
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();
    });

    it("有効な名前では保存ボタンを有効化する", async () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      const input = screen.getByLabelText("テンプレート名");
      await userEvent.type(input, "新しいテンプレート");
      expect(screen.getByRole("button", { name: "保存" })).not.toBeDisabled();
    });
  });

  describe("プレビュー", () => {
    it("プレビュー内容を最初の100文字で切り詰める", () => {
      const longContent = "あ".repeat(200);
      render(
        <SaveTemplateDialog {...defaultProps} previewContent={longContent} />,
      );
      const preview = screen.getByText(/あ/);
      expect(preview.textContent?.length).toBeLessThanOrEqual(110); // 100文字 + "..."
    });

    it("短いプレビュー内容はそのまま表示する", () => {
      render(
        <SaveTemplateDialog {...defaultProps} previewContent="短いテキスト" />,
      );
      expect(screen.getByText("短いテキスト")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("role=dialogを設定する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("aria-modalを設定する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
    });

    it("aria-labelledbyを設定する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      expect(screen.getByRole("dialog")).toHaveAttribute(
        "aria-labelledby",
        "dialog-title",
      );
    });

    it("オープン時に名前入力フィールドにフォーカスする", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      const input = screen.getByLabelText("テンプレート名");
      expect(document.activeElement).toBe(input);
    });
  });

  describe("スタイリング", () => {
    it("背景オーバーレイを表示する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      const overlay = screen.getByRole("dialog").parentElement;
      expect(overlay).toHaveClass("bg-black/50");
    });

    it("ダイアログを中央に配置する", () => {
      render(<SaveTemplateDialog {...defaultProps} />);
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("mx-auto");
    });
  });
});
