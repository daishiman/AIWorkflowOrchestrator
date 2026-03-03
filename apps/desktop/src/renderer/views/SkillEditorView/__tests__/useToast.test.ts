/**
 * useToast Hook テスト
 * UT-UI-05A-004: 保存成功 Toast
 *
 * Phase 4 - TDD Red
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "../hooks/useToast";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("showToast で Toast が表示される", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ type: "success", message: "保存しました" });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      type: "success",
      message: "保存しました",
    });
  });

  it("success Toast は 2500ms 後に自動消去される", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ type: "success", message: "保存しました" });
    });
    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("dismissToast で手動消去される", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ type: "success", message: "保存しました" });
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("連続呼び出しでタイマーがリセットされる", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ type: "success", message: "1回目" });
    });

    // 1500ms 後に再度呼び出し
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    act(() => {
      result.current.showToast({ type: "success", message: "2回目" });
    });

    // 2回目から 2499ms 後: まだ消えていない
    act(() => {
      vi.advanceTimersByTime(2499);
    });
    expect(result.current.toasts.length).toBeGreaterThanOrEqual(1);

    // 2回目から 2500ms 後: 消える
    act(() => {
      vi.advanceTimersByTime(1);
    });
    // The second toast should be auto-dismissed
    const successToasts = result.current.toasts.filter(
      (t) => t.message === "2回目",
    );
    expect(successToasts).toHaveLength(0);
  });

  it("error Toast は自動消去されない", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({
        type: "error",
        message: "保存に失敗しました",
      });
    });

    // 5000ms 経過しても消えない
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe("error");
  });

  it("複数 Toast がスタックされる", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({ type: "success", message: "Toast 1" });
      result.current.showToast({ type: "error", message: "Toast 2" });
      result.current.showToast({ type: "success", message: "Toast 3" });
    });

    expect(result.current.toasts).toHaveLength(3);
  });
});
