import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from "./index";
import { renderWithAllThemes } from "../../../tests/helpers/renderWithTheme";

describe("SearchBar", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("検索入力を表示する", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("入力変更時にonChangeを呼ぶ", () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "abc" },
    });

    expect(onChange).toHaveBeenCalledWith("abc");
  });

  it("入力値があるとクリアボタンを表示し、クリックで空文字を返す", () => {
    const onChange = vi.fn();
    render(<SearchBar value="keyword" onChange={onChange} />);

    const clearButton = screen.getByRole("button", { name: "検索をクリア" });
    fireEvent.click(clearButton);

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("onDebouncedChangeをデバウンス実行する", () => {
    vi.useFakeTimers();
    const onDebouncedChange = vi.fn();

    const { rerender } = render(
      <SearchBar
        value=""
        onChange={vi.fn()}
        onDebouncedChange={onDebouncedChange}
        debounceMs={300}
      />,
    );

    rerender(
      <SearchBar
        value="hello"
        onChange={vi.fn()}
        onDebouncedChange={onDebouncedChange}
        debounceMs={300}
      />,
    );

    vi.advanceTimersByTime(299);
    expect(onDebouncedChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onDebouncedChange).toHaveBeenCalledWith("hello");
  });

  it("ショートカットヒントを表示する", () => {
    render(<SearchBar value="" onChange={vi.fn()} shortcutHint="Cmd+K" />);

    expect(screen.getByText("Cmd+K")).toBeInTheDocument();
  });

  it("3テーマでレンダリングできる", () => {
    expect(() => {
      renderWithAllThemes(<SearchBar value="" onChange={vi.fn()} />);
    }).not.toThrow();
  });
});
