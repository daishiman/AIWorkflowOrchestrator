import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SecretInput } from "../../interview-widgets/SecretInput";

describe("SecretInput", () => {
  it("renders password input by default (TC-20)", () => {
    render(<SecretInput value="" onChange={vi.fn()} onSubmit={vi.fn()} />);

    expect(screen.getByTestId("secret-input")).toBeInTheDocument();
    const input = screen.getByTestId("secret-input-field") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("uses default placeholder when none provided", () => {
    render(<SecretInput value="" onChange={vi.fn()} onSubmit={vi.fn()} />);

    const input = screen.getByTestId("secret-input-field") as HTMLInputElement;
    expect(input.placeholder).toBe("秘密の値を入力...");
  });

  it("uses custom placeholder", () => {
    render(
      <SecretInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        placeholder="sk-..."
      />,
    );

    const input = screen.getByTestId("secret-input-field") as HTMLInputElement;
    expect(input.placeholder).toBe("sk-...");
  });

  // TC-21: 表示/非表示トグル
  it("toggles visibility on toggle click (TC-21)", () => {
    render(
      <SecretInput value="my-secret" onChange={vi.fn()} onSubmit={vi.fn()} />,
    );

    const input = screen.getByTestId("secret-input-field") as HTMLInputElement;
    expect(input.type).toBe("password");

    fireEvent.click(screen.getByTestId("secret-toggle"));
    expect(input.type).toBe("text");

    fireEvent.click(screen.getByTestId("secret-toggle"));
    expect(input.type).toBe("password");
  });

  it("updates aria-label on toggle", () => {
    render(<SecretInput value="" onChange={vi.fn()} onSubmit={vi.fn()} />);

    const toggle = screen.getByTestId("secret-toggle");
    expect(toggle).toHaveAttribute("aria-label", "入力を表示");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-label", "入力を隠す");
  });

  it("calls onChange when text is typed", () => {
    const onChange = vi.fn();
    render(<SecretInput value="" onChange={onChange} onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByTestId("secret-input-field"), {
      target: { value: "secret123" },
    });
    expect(onChange).toHaveBeenCalledWith("secret123");
  });

  it("calls onSubmit on Enter key", () => {
    const onSubmit = vi.fn();
    render(
      <SecretInput
        value="valid-secret"
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.keyDown(screen.getByTestId("secret-input-field"), {
      key: "Enter",
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // TC-E04: 空文字のまま Enter で送信しない
  it("does not submit when value is empty (TC-E04)", () => {
    const onSubmit = vi.fn();
    render(<SecretInput value="" onChange={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.keyDown(screen.getByTestId("secret-input-field"), {
      key: "Enter",
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("does not submit when value is only whitespace (TC-E04)", () => {
    const onSubmit = vi.fn();
    render(<SecretInput value="   " onChange={vi.fn()} onSubmit={onSubmit} />);

    fireEvent.keyDown(screen.getByTestId("secret-input-field"), {
      key: "Enter",
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("is disabled when disabled prop is set", () => {
    render(
      <SecretInput value="" onChange={vi.fn()} onSubmit={vi.fn()} disabled />,
    );

    expect(screen.getByTestId("secret-input-field")).toBeDisabled();
  });
});
