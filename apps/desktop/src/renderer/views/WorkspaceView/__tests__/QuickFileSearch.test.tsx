import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuickFileSearch } from "../components/QuickFileSearch";

const baseResults = [
  {
    path: "/workspace/src/app.ts",
    fileName: "app.ts",
    relativePath: "workspace/src",
    score: 0.9,
  },
  {
    path: "/workspace/src/main.ts",
    fileName: "main.ts",
    relativePath: "workspace/src",
    score: 0.8,
  },
];

describe("QuickFileSearch", () => {
  it("ダイアログを表示し、入力変更を反映できる", () => {
    const onQueryChange = vi.fn();

    render(
      <QuickFileSearch
        isOpen
        query="app"
        results={baseResults}
        selectedIndex={0}
        onClose={vi.fn()}
        onQueryChange={onQueryChange}
        onHighlight={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "ファイルをすばやく探す" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("quick-file-search-input"), {
      target: { value: "main" },
    });

    expect(onQueryChange).toHaveBeenCalledWith("main");
  });

  it("overlay click で閉じる", () => {
    const onClose = vi.fn();

    render(
      <QuickFileSearch
        isOpen
        query=""
        results={[]}
        selectedIndex={0}
        onClose={onClose}
        onQueryChange={vi.fn()}
        onHighlight={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("quick-file-search-overlay"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mouse と click でハイライト・選択できる", () => {
    const onHighlight = vi.fn();
    const onSubmit = vi.fn();

    render(
      <QuickFileSearch
        isOpen
        query="a"
        results={baseResults}
        selectedIndex={0}
        onClose={vi.fn()}
        onQueryChange={vi.fn()}
        onHighlight={onHighlight}
        onSubmit={onSubmit}
        onKeyDown={vi.fn()}
      />,
    );

    fireEvent.mouseEnter(screen.getByTestId("quick-file-search-item-1"));
    fireEvent.click(screen.getByTestId("quick-file-search-item-1"));

    expect(onHighlight).toHaveBeenCalledWith(1);
    expect(onSubmit).toHaveBeenCalledWith(1);
  });

  it("keydown を親へ委譲する", () => {
    const onKeyDown = vi.fn();

    render(
      <QuickFileSearch
        isOpen
        query="a"
        results={baseResults}
        selectedIndex={0}
        onClose={vi.fn()}
        onQueryChange={vi.fn()}
        onHighlight={vi.fn()}
        onSubmit={vi.fn()}
        onKeyDown={onKeyDown}
      />,
    );

    fireEvent.keyDown(screen.getByTestId("quick-file-search-dialog"), {
      key: "ArrowDown",
    });

    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
