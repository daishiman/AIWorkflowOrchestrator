/**
 * @vitest-environment happy-dom
 *
 * useInterval Hook Tests
 *
 * TDD Red Phase: Tests for interval timer custom hook.
 * All tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/renderer/hooks/__tests__/useInterval
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInterval } from "../useInterval";

describe("useInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("指定した間隔でコールバックが呼び出される", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("delayがnullの場合はコールバックが呼び出されない", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, null));

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it("delayが変更されると新しい間隔で実行される", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 as number | null } },
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    rerender({ delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("delayがnullに変更されるとタイマーが停止する", () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ delay }) => useInterval(callback, delay),
      { initialProps: { delay: 1000 as number | null } },
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(callback).toHaveBeenCalledTimes(1);

    rerender({ delay: null });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).toHaveBeenCalledTimes(1); // 増えない
  });

  it("アンマウント時にインターバルがクリアされる", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));

    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it("コールバックの参照が更新されても最新が呼び出される", () => {
    let count = 0;
    const { rerender } = renderHook(({ cb }) => useInterval(cb, 1000), {
      initialProps: {
        cb: () => {
          count = 1;
        },
      },
    });

    rerender({
      cb: () => {
        count = 2;
      },
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(count).toBe(2);
  });
});

describe("useInterval - エッジケース", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("delayが0の場合も正常に動作する", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 0));

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalled();
  });

  it("非常に短い間隔でも動作する", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 10));

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(callback).toHaveBeenCalledTimes(10);
  });

  it("非常に長い間隔でも設定される", () => {
    const callback = vi.fn();
    renderHook(() => useInterval(callback, 60000 * 60)); // 1時間

    act(() => {
      vi.advanceTimersByTime(60000 * 60);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
