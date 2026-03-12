import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useWorkspaceMentionQuery } from "./useWorkspaceMentionQuery";

const candidates = [
  { path: "/workspace/app.ts", name: "app.ts" },
  { path: "/workspace/README.md", name: "README.md" },
  { path: "/workspace/src/main.ts", name: "main.ts" },
];

describe("useWorkspaceMentionQuery", () => {
  it("@入力で候補を開く", () => {
    const { result } = renderHook(() =>
      useWorkspaceMentionQuery({
        input: "@app",
        cursorPosition: 4,
        candidates,
      }),
    );

    expect(result.current.isOpen).toBe(true);
    expect(result.current.options).toEqual([
      { path: "/workspace/app.ts", name: "app.ts" },
    ]);
  });

  it("矢印キー移動でハイライトを循環する", () => {
    const { result } = renderHook(() =>
      useWorkspaceMentionQuery({
        input: "@",
        cursorPosition: 1,
        candidates,
      }),
    );

    expect(result.current.highlightedIndex).toBe(0);

    act(() => {
      result.current.moveHighlight(1);
    });
    expect(result.current.highlightedIndex).toBe(1);

    act(() => {
      result.current.moveHighlight(-1);
      result.current.moveHighlight(-1);
    });
    expect(result.current.highlightedIndex).toBe(2);
  });

  it("文中の単語連結 @ は候補を開かない", () => {
    const { result } = renderHook(() =>
      useWorkspaceMentionQuery({
        input: "abc@app",
        cursorPosition: 7,
        candidates,
      }),
    );

    expect(result.current.isOpen).toBe(false);
    expect(result.current.options).toHaveLength(0);
  });
});
