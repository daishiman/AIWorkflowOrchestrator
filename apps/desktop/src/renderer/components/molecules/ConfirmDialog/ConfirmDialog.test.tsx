import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmDialog } from "./index";

describe("ConfirmDialog", () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "削除確認",
    description: "この操作は取り消せません",
  };

  it("isOpen=falseでは表示しない", () => {
    render(<ConfirmDialog {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("タイトル・説明・ボタンを表示する", () => {
    render(<ConfirmDialog {...baseProps} />);

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("削除確認")).toBeInTheDocument();
    expect(screen.getByText("この操作は取り消せません")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "キャンセル" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "確認" })).toBeInTheDocument();
  });

  it("キャンセルクリックでonCloseを呼ぶ", () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...baseProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "キャンセル" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("確認クリックでonConfirmを呼ぶ", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByRole("button", { name: "確認" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("EscapeでonCloseを呼ぶ", () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...baseProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("EnterでonConfirmを呼ぶ", () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByRole("button", { name: "確認" });
    confirmButton.focus();
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("isDestructive=trueで破壊的スタイルを適用する", () => {
    render(<ConfirmDialog {...baseProps} isDestructive={true} />);

    expect(screen.getByRole("button", { name: "確認" })).toHaveClass(
      "bg-[var(--status-error)]",
    );
  });

  it("isLoading=trueで確認ボタンをローディング状態にする", () => {
    render(<ConfirmDialog {...baseProps} isLoading={true} />);

    const confirmButton = screen.getByRole("button", { name: "確認" });
    expect(confirmButton).toBeDisabled();
    expect(screen.getByTestId("confirm-loading-icon")).toBeInTheDocument();
  });

  it("ARIA属性を設定する", () => {
    render(<ConfirmDialog {...baseProps} />);

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
  });
});
