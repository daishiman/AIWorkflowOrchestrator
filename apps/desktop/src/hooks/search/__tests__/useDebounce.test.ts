/**
 * useDebounce フックのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useDebouncedCallback } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("基本動作", () => {
    it("初期値をすぐに返す", () => {
      const { result } = renderHook(() => useDebounce("initial", 500));

      expect(result.current).toBe("initial");
    });

    it("指定時間後に新しい値を返す", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "initial", delay: 500 } },
      );

      rerender({ value: "updated", delay: 500 });

      // まだ更新されていない
      expect(result.current).toBe("initial");

      // 時間を進める
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe("updated");
    });

    it("遅延時間内に値が変更されると、タイマーがリセットされる", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "initial", delay: 500 } },
      );

      rerender({ value: "update1", delay: 500 });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      rerender({ value: "update2", delay: 500 });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // まだupdate2ではない
      expect(result.current).toBe("initial");

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // 合計500ms経過でupdate2になる
      expect(result.current).toBe("update2");
    });
  });

  describe("様々な型", () => {
    it("数値をデバウンスする", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 0, delay: 100 } },
      );

      rerender({ value: 42, delay: 100 });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toBe(42);
    });

    it("オブジェクトをデバウンスする", () => {
      const initial = { name: "test" };
      const updated = { name: "updated" };

      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: initial, delay: 100 } },
      );

      rerender({ value: updated, delay: 100 });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(result.current).toEqual(updated);
    });
  });

  describe("クリーンアップ", () => {
    it("アンマウント時にタイマーをクリアする", () => {
      const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

      const { unmount, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "initial", delay: 500 } },
      );

      rerender({ value: "updated", delay: 500 });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("基本動作", () => {
    it("指定時間後にコールバックを実行する", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current.debouncedCallback("arg1", "arg2");
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("遅延時間内の複数呼び出しは最後の1回だけ実行する", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current.debouncedCallback("call1");
        result.current.debouncedCallback("call2");
        result.current.debouncedCallback("call3");
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("call3");
    });
  });

  describe("cancelメソッド", () => {
    it("保留中のコールバックをキャンセルする", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current.debouncedCallback("test");
      });

      act(() => {
        result.current.cancel();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("flushメソッド", () => {
    it("保留中のコールバックを即座に実行する", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current.debouncedCallback("test");
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        result.current.flush();
      });

      expect(callback).toHaveBeenCalledWith("test");
    });

    it("保留中のコールバックがない場合、何もしない", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      act(() => {
        result.current.flush();
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("コールバックの更新", () => {
    it("最新のコールバックを使用する", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const { result, rerender } = renderHook(
        ({ callback }) => useDebouncedCallback(callback, 500),
        { initialProps: { callback: callback1 } },
      );

      act(() => {
        result.current.debouncedCallback("test");
      });

      rerender({ callback: callback2 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith("test");
    });
  });

  describe("クリーンアップ", () => {
    it("アンマウント時にタイマーをクリアする", () => {
      const callback = vi.fn();
      const { result, unmount } = renderHook(() =>
        useDebouncedCallback(callback, 500),
      );

      act(() => {
        result.current.debouncedCallback("test");
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
