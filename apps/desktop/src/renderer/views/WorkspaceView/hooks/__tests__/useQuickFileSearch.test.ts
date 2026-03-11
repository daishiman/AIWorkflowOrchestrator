import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { buildSearchResults, useQuickFileSearch } from "../useQuickFileSearch";

describe("useQuickFileSearch", () => {
  it("buildSearchResults は上位10件まで返す", () => {
    const filePaths = Array.from(
      { length: 20 },
      (_, index) => `/workspace/src/file-${index}.ts`,
    );

    const results = buildSearchResults(filePaths, "file", 10);

    expect(results).toHaveLength(10);
    expect(results[0].fileName).toBe("file-0.ts");
  });

  it("Cmd/Ctrl+P で開く", () => {
    const onSelectFile = vi.fn();

    const { result } = renderHook(() =>
      useQuickFileSearch({
        filePaths: ["/workspace/src/app.ts"],
        onSelectFile,
      }),
    );

    expect(result.current.isOpen).toBe(false);

    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "p",
          ctrlKey: true,
          bubbles: true,
        }),
      );
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("ArrowDown/Enter で候補を選択できる", () => {
    const onSelectFile = vi.fn();

    const { result } = renderHook(() =>
      useQuickFileSearch({
        filePaths: [
          "/workspace/src/app.ts",
          "/workspace/src/main.ts",
          "/workspace/src/utils.ts",
        ],
        onSelectFile,
      }),
    );

    act(() => {
      result.current.open();
      result.current.setQuery("ts");
    });

    act(() => {
      result.current.handleKeyDown(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
        }),
      );
      result.current.handleKeyDown(
        new KeyboardEvent("keydown", {
          key: "Enter",
        }),
      );
    });

    expect(onSelectFile).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);
  });

  it("Escape で閉じる", () => {
    const { result } = renderHook(() =>
      useQuickFileSearch({
        filePaths: ["/workspace/src/app.ts"],
        onSelectFile: vi.fn(),
      }),
    );

    act(() => {
      result.current.open();
      result.current.setQuery("app");
    });

    act(() => {
      result.current.handleKeyDown(
        new KeyboardEvent("keydown", {
          key: "Escape",
        }),
      );
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe("");
  });

  it("query が空なら結果は空", () => {
    const { result } = renderHook(() =>
      useQuickFileSearch({
        filePaths: ["/workspace/src/app.ts"],
        onSelectFile: vi.fn(),
      }),
    );

    expect(result.current.results).toEqual([]);
  });

  it("一致しない query では結果を返さない", () => {
    const results = buildSearchResults(
      ["/workspace/src/app.ts", "/workspace/docs/readme.md"],
      "zzz",
      10,
    );

    expect(results).toEqual([]);
  });

  it("同スコア時は path 順で安定ソートする", () => {
    const results = buildSearchResults(
      ["/workspace/b/index.ts", "/workspace/a/index.ts"],
      "index.ts",
      10,
    );

    expect(results.map((result) => result.path)).toEqual([
      "/workspace/a/index.ts",
      "/workspace/b/index.ts",
    ]);
  });
});
