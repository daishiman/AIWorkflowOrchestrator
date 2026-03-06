import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useNavShortcuts } from "./useNavShortcuts";

describe("useNavShortcuts", () => {
  it("Cmd/Ctrl+数字でビュー切替を呼び出す", () => {
    const onViewChange = vi.fn();
    renderHook(() => useNavShortcuts({ onViewChange }));

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "2",
        metaKey: true,
        bubbles: true,
      }),
    );

    expect(onViewChange).toHaveBeenCalledWith("workspace");
  });

  it("編集可能要素ではショートカットを無効化する", () => {
    const onViewChange = vi.fn();
    renderHook(() => useNavShortcuts({ onViewChange }));

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "3",
        metaKey: true,
        bubbles: true,
      }),
    );

    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("Cmd+[ で戻る処理を呼び出す", () => {
    const onGoBack = vi.fn();
    renderHook(() =>
      useNavShortcuts({
        onViewChange: vi.fn(),
        onGoBack,
        canGoBack: true,
      }),
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "[",
        code: "BracketLeft",
        metaKey: true,
        bubbles: true,
      }),
    );

    expect(onGoBack).toHaveBeenCalledTimes(1);
  });
});
