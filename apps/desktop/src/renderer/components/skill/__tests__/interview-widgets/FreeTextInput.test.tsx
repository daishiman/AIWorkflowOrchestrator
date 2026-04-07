import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FreeTextInput } from "../../interview-widgets/FreeTextInput";

describe("FreeTextInput", () => {
  it("renders textarea with placeholder", () => {
    render(
      <FreeTextInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        placeholder="テスト入力"
      />,
    );

    expect(screen.getByTestId("free-text-input")).toBeInTheDocument();
    const textarea = screen.getByTestId(
      "free-text-textarea",
    ) as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe("テスト入力");
  });

  // W-FT-01: value プロパティの値がテキストフィールドに表示される
  it("W-FT-01: reflects value prop in textarea", () => {
    render(
      <FreeTextInput
        value="初期値テスト"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const textarea = screen.getByTestId(
      "free-text-textarea",
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe("初期値テスト");
  });

  it("uses default placeholder when none provided", () => {
    render(<FreeTextInput value="" onChange={vi.fn()} onSubmit={vi.fn()} />);

    const textarea = screen.getByTestId(
      "free-text-textarea",
    ) as HTMLTextAreaElement;
    expect(textarea.placeholder).toBe("回答を入力してください...");
  });

  it("calls onChange when text is typed", () => {
    const onChange = vi.fn();
    render(<FreeTextInput value="" onChange={onChange} onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByTestId("free-text-textarea"), {
      target: { value: "hello" },
    });
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  // TC-22: Enter で送信
  it("calls onSubmit on Enter key (TC-22)", () => {
    const onSubmit = vi.fn();
    render(
      <FreeTextInput
        value="有効な入力"
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.keyDown(screen.getByTestId("free-text-textarea"), {
      key: "Enter",
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("allows newline with Shift+Enter", () => {
    const onSubmit = vi.fn();
    render(
      <FreeTextInput value="テスト" onChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.keyDown(screen.getByTestId("free-text-textarea"), {
      key: "Enter",
      shiftKey: true,
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // TC-E03: 空文字のまま Enter で送信しない
  it("does not submit when value is empty (TC-E03)", () => {
    const onSubmit = vi.fn();
    render(<FreeTextInput value="" onChange={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.keyDown(screen.getByTestId("free-text-textarea"), {
      key: "Enter",
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when value is only whitespace (TC-E03)", () => {
    const onSubmit = vi.fn();
    render(
      <FreeTextInput value="   " onChange={vi.fn()} onSubmit={onSubmit} />,
    );

    fireEvent.keyDown(screen.getByTestId("free-text-textarea"), {
      key: "Enter",
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // TC-B03: 非常に長いテキスト
  it("handles very long text input (TC-B03)", () => {
    const longText = "A".repeat(5000);
    render(
      <FreeTextInput value={longText} onChange={vi.fn()} onSubmit={vi.fn()} />,
    );

    const textarea = screen.getByTestId(
      "free-text-textarea",
    ) as HTMLTextAreaElement;
    expect(textarea.value).toBe(longText);
    expect(textarea.value.length).toBe(5000);
  });

  it("is disabled when disabled prop is set", () => {
    render(
      <FreeTextInput value="" onChange={vi.fn()} onSubmit={vi.fn()} disabled />,
    );

    expect(screen.getByTestId("free-text-textarea")).toBeDisabled();
  });

  it("shows hint text for Enter/Shift+Enter", () => {
    render(<FreeTextInput value="" onChange={vi.fn()} onSubmit={vi.fn()} />);

    expect(
      screen.getByText("Enter で送信 / Shift+Enter で改行"),
    ).toBeInTheDocument();
  });
});
