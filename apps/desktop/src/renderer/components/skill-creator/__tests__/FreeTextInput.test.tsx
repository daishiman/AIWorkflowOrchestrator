import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FreeTextInput } from "../FreeTextInput";

describe("FreeTextInput", () => {
  // T-04-1: isVisible=false のとき非表示
  it("isVisible=false のとき非表示になる", () => {
    render(<FreeTextInput onSubmit={() => {}} isVisible={false} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // T-04-2: isVisible=true のとき表示
  it("isVisible=true のとき表示される", () => {
    render(<FreeTextInput onSubmit={() => {}} isVisible={true} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  // T-04-3: Enter キーで onSubmit が呼ばれる
  it("Enter キーで onSubmit が呼ばれる", () => {
    const onSubmit = vi.fn();
    render(<FreeTextInput onSubmit={onSubmit} isVisible={true} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "テスト入力" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).toHaveBeenCalledWith("テスト入力");
  });

  // T-04-4: Shift+Enter では onSubmit が呼ばれない
  it("Shift+Enter では onSubmit が呼ばれない（改行のみ）", () => {
    const onSubmit = vi.fn();
    render(<FreeTextInput onSubmit={onSubmit} isVisible={true} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "テスト入力" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // T-04-5: 空文字では onSubmit が呼ばれない
  it("空文字列のとき Enter を押しても onSubmit が呼ばれない", () => {
    const onSubmit = vi.fn();
    render(<FreeTextInput onSubmit={onSubmit} isVisible={true} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // T-04-6: isSecret=true のときパスワード入力フィールドになる
  it("isSecret=true のとき type='password' の入力フィールドが表示される", () => {
    render(
      <FreeTextInput onSubmit={() => {}} isVisible={true} isSecret={true} />,
    );
    // パスワードフィールドは role="textbox" ではなく type="password" で確認
    const input = document.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  // disabled=true のとき無効化
  it("disabled=true のとき FreeTextInput が無効化される", () => {
    render(
      <FreeTextInput onSubmit={() => {}} isVisible={true} disabled={true} />,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  // 送信後に入力値がクリアされる
  it("送信後に入力値がクリアされる", () => {
    const onSubmit = vi.fn();
    render(<FreeTextInput onSubmit={onSubmit} isVisible={true} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "テスト" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
    expect(onSubmit).toHaveBeenCalledWith("テスト");
    expect(textarea).toHaveValue("");
  });

  // isSecret=true のとき Enter で送信
  it("isSecret=true でも Enter キーで送信される", () => {
    const onSubmit = vi.fn();
    render(
      <FreeTextInput onSubmit={onSubmit} isVisible={true} isSecret={true} />,
    );
    const input = document.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "secret123" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });
    expect(onSubmit).toHaveBeenCalledWith("secret123");
  });
});
