import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from "../index";

describe("SearchBar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("入力時にonChangeを即時呼び出す", () => {
    const handleChange = vi.fn();

    render(<SearchBar value="" onChange={handleChange} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "abc" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith("abc");
  });

  it("debounceMs経過後にonDebouncedChangeを呼び出す", () => {
    vi.useFakeTimers();
    const handleDebouncedChange = vi.fn();
    const props = {
      onChange: vi.fn(),
      onDebouncedChange: handleDebouncedChange,
      debounceMs: 300,
    };

    const { rerender } = render(<SearchBar value="" {...props} />);

    rerender(<SearchBar value="search-word" {...props} />);

    vi.advanceTimersByTime(299);
    expect(handleDebouncedChange).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(handleDebouncedChange).toHaveBeenCalledTimes(1);
    expect(handleDebouncedChange).toHaveBeenCalledWith("search-word");
  });

  it("連続入力時は最後の値のみonDebouncedChangeを呼び出す", () => {
    vi.useFakeTimers();
    const handleDebouncedChange = vi.fn();
    const props = {
      onChange: vi.fn(),
      onDebouncedChange: handleDebouncedChange,
      debounceMs: 300,
    };

    const { rerender } = render(<SearchBar value="" {...props} />);

    rerender(<SearchBar value="a" {...props} />);
    vi.advanceTimersByTime(120);
    rerender(<SearchBar value="ab" {...props} />);
    vi.advanceTimersByTime(120);
    rerender(<SearchBar value="abc" {...props} />);
    vi.advanceTimersByTime(300);

    expect(handleDebouncedChange).toHaveBeenCalledTimes(1);
    expect(handleDebouncedChange).toHaveBeenCalledWith("abc");
  });

  it("入力値が空のときはクリアボタンを表示しない", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(
      screen.queryByRole("button", { name: "クリア" }),
    ).not.toBeInTheDocument();
  });

  it("入力値があるときはクリアボタンを表示する", () => {
    render(<SearchBar value="filled" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "クリア" })).toBeInTheDocument();
  });

  it("クリアボタン押下で入力をリセットする", () => {
    const handleChange = vi.fn();

    render(<SearchBar value="filled" onChange={handleChange} />);

    fireEvent.click(screen.getByRole("button", { name: "クリア" }));

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("Escapeキーで入力をクリアする", () => {
    const handleChange = vi.fn();

    render(<SearchBar value="filled" onChange={handleChange} />);

    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Escape" });

    expect(handleChange).toHaveBeenCalledWith("");
  });

  it("EnterキーでonSubmitを呼び出す", () => {
    const handleSubmit = vi.fn();

    render(
      <SearchBar
        value="query-text"
        onChange={vi.fn()}
        onSubmit={handleSubmit}
      />,
    );

    fireEvent.keyDown(screen.getByRole("searchbox"), { key: "Enter" });

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(handleSubmit).toHaveBeenCalledWith("query-text");
  });

  it("role=searchboxを持つ", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);

    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("autoFocus=trueで入力にフォーカスする", () => {
    render(<SearchBar value="" onChange={vi.fn()} autoFocus />);

    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("入力が空のときのみshortcutHintを表示する", () => {
    const { rerender } = render(
      <SearchBar value="" onChange={vi.fn()} shortcutHint="⌘K" />,
    );
    expect(screen.getByText("⌘K")).toBeInTheDocument();

    rerender(<SearchBar value="abc" onChange={vi.fn()} shortcutHint="⌘K" />);
    expect(screen.queryByText("⌘K")).not.toBeInTheDocument();
  });

  describe.each(["kanagawa-dragon", "light", "dark"])("テーマ: %s", (theme) => {
    it("レンダリングできる", () => {
      document.documentElement.setAttribute("data-theme", theme);
      render(<SearchBar value="" onChange={vi.fn()} />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });
  });
});
