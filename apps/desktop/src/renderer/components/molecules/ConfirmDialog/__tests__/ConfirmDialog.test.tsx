import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmDialog } from "../index";

describe("ConfirmDialog", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "削除確認",
    description: "対象を削除してもよろしいですか？",
  };

  it("isOpen=trueでダイアログを表示する", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("削除確認")).toBeInTheDocument();
  });

  it("isOpen=falseでダイアログを表示しない", () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("確認ボタン押下でonConfirmを呼び出す", () => {
    const handleConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={handleConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "確認" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタン押下でonCloseを呼び出す", () => {
    const handleClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={handleClose} />);

    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("EscapeキーでonCloseを呼び出す", () => {
    const handleClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={handleClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("isDestructive=trueで警告アイコンと危険色ボタンを表示する", () => {
    render(<ConfirmDialog {...defaultProps} isDestructive />);

    expect(screen.getByTestId("confirm-destructive-icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "確認" })).toHaveClass(
      "bg-[var(--status-error)]",
    );
  });

  it("isLoading=trueでボタンを無効化しスピナーを表示する", () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);

    expect(screen.getByRole("button", { name: "キャンセル" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "確認" })).toBeDisabled();
    expect(screen.getByTestId("confirm-loading-icon")).toBeInTheDocument();
  });

  it("isLoading=trueではEscapeで閉じない", () => {
    const handleClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={handleClose} isLoading />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(handleClose).not.toHaveBeenCalled();
  });

  it("オーバーレイクリックでonCloseを呼び出す", () => {
    const handleClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={handleClose} />);

    fireEvent.click(screen.getByTestId("confirm-dialog-overlay"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("初期フォーカスはキャンセルボタン", () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "キャンセル" })).toHaveFocus();
  });

  it("フォーカストラップが機能する", () => {
    render(<ConfirmDialog {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    const confirmButton = screen.getByRole("button", { name: "確認" });

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(confirmButton).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab" });
    expect(cancelButton).toHaveFocus();
  });

  it("閉じたあとにフォーカスを復元する", () => {
    const { rerender } = render(
      <>
        <button type="button">trigger</button>
        <ConfirmDialog {...defaultProps} isOpen={false} />
      </>,
    );

    const triggerButton = screen.getByRole("button", { name: "trigger" });
    triggerButton.focus();

    rerender(
      <>
        <button type="button">trigger</button>
        <ConfirmDialog {...defaultProps} isOpen />
      </>,
    );

    rerender(
      <>
        <button type="button">trigger</button>
        <ConfirmDialog {...defaultProps} isOpen={false} />
      </>,
    );

    expect(triggerButton).toHaveFocus();
  });

  it("Enterキーはフォーカス対象に応じてConfirm/Closeを実行する", () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        {...defaultProps}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    const confirmButton = screen.getByRole("button", { name: "確認" });

    cancelButton.focus();
    fireEvent.keyDown(document, { key: "Enter" });

    confirmButton.focus();
    fireEvent.keyDown(document, { key: "Enter" });

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("ARIA属性を設定する", () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });

  describe.each(["kanagawa-dragon", "light", "dark"])("テーマ: %s", (theme) => {
    it("レンダリングできる", () => {
      document.documentElement.setAttribute("data-theme", theme);
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });
});
