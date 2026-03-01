import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AddButton,
  addButtonStyles,
  addedStyle,
} from "../components/AddButton";

describe("AddButton", () => {
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("idle状態で「追加する」テキストが表示される", () => {
    render(<AddButton status="idle" isAdded={false} onAdd={mockOnAdd} />);

    expect(screen.getByText("追加する")).toBeInTheDocument();
  });

  it("idle状態でaddButtonStyles.idleのスタイルが適用される", () => {
    render(<AddButton status="idle" isAdded={false} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    // P47対策: addButtonStyles定数をインポートして期待値を生成
    expect(button.className).toContain(addButtonStyles.idle);
  });

  it("processing状態でスピナーが表示される", () => {
    render(<AddButton status="processing" isAdded={false} onAdd={mockOnAdd} />);

    // スピナー要素が存在する（role="status" または aria-label="処理中"）
    const spinner =
      screen.queryByRole("status") ??
      screen.queryByLabelText("処理中") ??
      screen.queryByTestId("spinner");
    expect(spinner).not.toBeNull();
  });

  it("processing状態でaria-busy='true'が設定される", () => {
    render(<AddButton status="processing" isAdded={false} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("success状態で「追加済み!」テキストが表示される", () => {
    render(<AddButton status="success" isAdded={true} onAdd={mockOnAdd} />);

    expect(screen.getByText(/追加済み/)).toBeInTheDocument();
  });

  it("success状態でaddButtonStyles.successのスタイルが適用される", () => {
    render(<AddButton status="success" isAdded={true} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    // P47対策: addButtonStyles定数をインポートして期待値を生成
    expect(button.className).toContain(addButtonStyles.success);
  });

  it("クリックでonAddが呼ばれる", () => {
    render(<AddButton status="idle" isAdded={false} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnAdd).toHaveBeenCalledTimes(1);
  });

  it("isAdded=trueで無効化される", () => {
    render(<AddButton status="success" isAdded={true} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    // クリックしてもonAddは呼ばれない
    fireEvent.click(button);
    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it("featured サイズでクラスが変わる", () => {
    const { rerender } = render(
      <AddButton
        status="idle"
        isAdded={false}
        onAdd={mockOnAdd}
        size="default"
      />,
    );

    const defaultButton = screen.getByRole("button");
    const defaultClassName = defaultButton.className;

    rerender(
      <AddButton
        status="idle"
        isAdded={false}
        onAdd={mockOnAdd}
        size="featured"
      />,
    );

    const featuredButton = screen.getByRole("button");
    const featuredClassName = featuredButton.className;

    // featured サイズはデフォルトとは異なるクラスが適用される
    expect(featuredClassName).not.toBe(defaultClassName);
  });

  it("isAdded=true + status!='success' で「追加済み」（チェックアイコン+テキスト）が表示される", () => {
    render(<AddButton status="idle" isAdded={true} onAdd={mockOnAdd} />);

    // 「追加済み」テキスト（「追加済み!」ではない）
    expect(screen.getByText("追加済み")).toBeInTheDocument();
    // addedStyle が適用される
    const button = screen.getByRole("button");
    expect(button.className).toContain(addedStyle);
  });

  it("status='success' + isAdded=false で「追加済み!」が表示される", () => {
    render(<AddButton status="success" isAdded={false} onAdd={mockOnAdd} />);

    expect(screen.getByText("追加済み!")).toBeInTheDocument();
    // success スタイルが適用される
    const button = screen.getByRole("button");
    expect(button.className).toContain(addButtonStyles.success);
  });

  it("aria-label が idle 状態で「ツールを追加する」に設定される", () => {
    render(<AddButton status="idle" isAdded={false} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "ツールを追加する");
  });

  it("aria-label が processing 状態で「ツール追加中」に設定される", () => {
    render(<AddButton status="processing" isAdded={false} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "ツール追加中");
  });

  it("aria-label が isAdded=true で「追加済みツール」に設定される", () => {
    render(<AddButton status="success" isAdded={true} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "追加済みツール");
  });

  it("data-state 属性が isAdded=true で 'added' に設定される", () => {
    render(<AddButton status="idle" isAdded={true} onAdd={mockOnAdd} />);

    const button = screen.getByTestId("add-button");
    expect(button).toHaveAttribute("data-state", "added");
  });

  it("data-state 属性が isAdded=false で status に設定される", () => {
    render(<AddButton status="processing" isAdded={false} onAdd={mockOnAdd} />);

    const button = screen.getByTestId("add-button");
    expect(button).toHaveAttribute("data-state", "processing");
  });

  it("processing状態でボタンが無効化される", () => {
    render(<AddButton status="processing" isAdded={false} onAdd={mockOnAdd} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });
});
