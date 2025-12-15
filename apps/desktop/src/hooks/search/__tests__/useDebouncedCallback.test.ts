/**
 * useDebouncedCallback フックのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useDebouncedCallback,
  useDebouncedSearch,
} from "../useDebouncedCallback";

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

      const [debouncedCallback] = result.current;

      act(() => {
        debouncedCallback("arg1");
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledWith("arg1");
    });

    it("遅延時間内の複数呼び出しは最後の1回だけ実行する", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      const [debouncedCallback] = result.current;

      act(() => {
        debouncedCallback("call1");
        debouncedCallback("call2");
        debouncedCallback("call3");
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("call3");
    });

    it("デフォルトの遅延時間は300msである", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback));

      const [debouncedCallback] = result.current;

      act(() => {
        debouncedCallback();
      });

      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("キャンセル機能", () => {
    it("cancelで保留中のコールバックをキャンセルする", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      const [debouncedCallback, cancel] = result.current;

      act(() => {
        debouncedCallback("test");
      });

      act(() => {
        cancel();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).not.toHaveBeenCalled();
    });

    it("タイマーがない状態でcancelを呼んでもエラーにならない", () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 500));

      const [, cancel] = result.current;

      expect(() => {
        act(() => {
          cancel();
        });
      }).not.toThrow();
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

      const [debouncedCallback] = result.current;

      act(() => {
        debouncedCallback("test");
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

      const [debouncedCallback] = result.current;

      act(() => {
        debouncedCallback("test");
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("関数の安定性", () => {
    it("debouncedCallbackは再レンダリング間で安定している", () => {
      const callback = vi.fn();
      const { result, rerender } = renderHook(() =>
        useDebouncedCallback(callback, 500),
      );

      const firstRef = result.current[0];
      rerender();
      const secondRef = result.current[0];

      expect(firstRef).toBe(secondRef);
    });

    it("cancelは再レンダリング間で安定している", () => {
      const callback = vi.fn();
      const { result, rerender } = renderHook(() =>
        useDebouncedCallback(callback, 500),
      );

      const firstRef = result.current[1];
      rerender();
      const secondRef = result.current[1];

      expect(firstRef).toBe(secondRef);
    });
  });
});

describe("useDebouncedSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("検索コールバックをデバウンスする", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch(onSearch, 500));

    const [debouncedSearch] = result.current;

    act(() => {
      debouncedSearch("query");
    });

    expect(onSearch).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("デフォルトの遅延時間は300msである", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch(onSearch));

    const [debouncedSearch] = result.current;

    act(() => {
      debouncedSearch("query");
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onSearch).toHaveBeenCalledWith("query");
  });

  it("キャンセル関数を提供する", () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useDebouncedSearch(onSearch, 500));

    const [debouncedSearch, cancelSearch] = result.current;

    act(() => {
      debouncedSearch("query");
    });

    act(() => {
      cancelSearch();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onSearch).not.toHaveBeenCalled();
  });
});
