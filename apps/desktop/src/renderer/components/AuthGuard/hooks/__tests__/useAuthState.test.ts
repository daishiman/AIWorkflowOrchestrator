/**
 * @file useAuthState.test.ts
 * @description useAuthState フックのユニットテスト
 *
 * P13準拠: vi.advanceTimersByTime を使用（vi.runAllTimers 禁止）
 * P31準拠: useAppStore は個別セレクタでモック
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthState, AUTH_TIMEOUT_MS } from "../useAuthState";

// store モック
let mockIsLoading = true;
let mockIsAuthenticated = false;

vi.mock("../../../../store", () => ({
  useAppStore: vi.fn(
    (
      selector: (state: {
        isAuthenticated: boolean;
        isLoading: boolean;
      }) => unknown,
    ) =>
      selector({
        isAuthenticated: mockIsAuthenticated,
        isLoading: mockIsLoading,
      }),
  ),
}));

describe("useAuthState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockIsLoading = true;
    mockIsAuthenticated = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("初期状態で isLoading=true の場合、'checking' を返す", () => {
    const { result } = renderHook(() => useAuthState());
    expect(result.current).toBe("checking");
  });

  it("10秒後にタイムアウトして 'timed-out' を返す", () => {
    const { result } = renderHook(() => useAuthState());
    expect(result.current).toBe("checking");

    act(() => {
      vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
    });

    expect(result.current).toBe("timed-out");
  });

  it("タイムアウト前に isLoading が false になると 'authenticated' を返す", async () => {
    const { result, rerender } = renderHook(() => useAuthState());
    expect(result.current).toBe("checking");

    // 5秒経過（タイムアウト前）
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current).toBe("checking");

    // isLoading を false に、isAuthenticated を true に変更
    mockIsLoading = false;
    mockIsAuthenticated = true;
    rerender();

    expect(result.current).toBe("authenticated");
  });

  it("タイムアウト後に isLoading が false になると自動遷移する", () => {
    const { result, rerender } = renderHook(() => useAuthState());

    // タイムアウト発生
    act(() => {
      vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
    });
    expect(result.current).toBe("timed-out");

    // isLoading が false になる（認証完了）
    mockIsLoading = false;
    mockIsAuthenticated = true;
    rerender();

    expect(result.current).toBe("authenticated");
  });

  it("isLoading が false の場合、タイマーが設定されない", () => {
    mockIsLoading = false;
    mockIsAuthenticated = true;

    const { result } = renderHook(() => useAuthState());
    expect(result.current).toBe("authenticated");

    // 10秒経過してもタイムアウトしない
    act(() => {
      vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
    });
    expect(result.current).toBe("authenticated");
  });

  it("isLoading が false -> true に変わると再度タイムアウトカウント開始", () => {
    mockIsLoading = false;
    mockIsAuthenticated = false;

    const { result, rerender } = renderHook(() => useAuthState());
    expect(result.current).toBe("unauthenticated");

    // isLoading を true に変更（再認証開始）
    mockIsLoading = true;
    mockIsAuthenticated = false;
    rerender();

    expect(result.current).toBe("checking");

    // 10秒経過でタイムアウト
    act(() => {
      vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
    });
    expect(result.current).toBe("timed-out");
  });

  // ============================================================
  // Phase 6: エッジケーステスト追加
  // ============================================================

  it("タイムアウト直前（9999ms）ではまだ 'checking' を返す", () => {
    const { result } = renderHook(() => useAuthState());
    expect(result.current).toBe("checking");

    // 9999ms 経過（タイムアウト1ms前）
    act(() => {
      vi.advanceTimersByTime(AUTH_TIMEOUT_MS - 1);
    });

    expect(result.current).toBe("checking");
  });

  it("コンポーネントアンマウント時にタイマーがクリアされる（メモリリーク防止）", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    const { unmount } = renderHook(() => useAuthState());

    // アンマウント前のclearTimeout呼び出し回数を記録
    const callCountBefore =
      clearTimeoutSpy.calls?.length ?? clearTimeoutSpy.mock.calls.length;

    unmount();

    // アンマウント後にclearTimeoutが呼ばれる（useEffectのcleanup）
    const callCountAfter = clearTimeoutSpy.mock.calls.length;
    expect(callCountAfter).toBeGreaterThan(callCountBefore);

    clearTimeoutSpy.mockRestore();
  });

  it("isLoading が高速に true/false 切り替わる場合、タイマーがリセットされる（競合状態テスト）", () => {
    const { result, rerender } = renderHook(() => useAuthState());
    expect(result.current).toBe("checking");

    // 5秒経過
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current).toBe("checking");

    // isLoading を false にする（タイマークリア + isTimedOut リセット）
    mockIsLoading = false;
    mockIsAuthenticated = false;
    rerender();
    expect(result.current).toBe("unauthenticated");

    // すぐに isLoading を true に戻す（新しいタイマー開始）
    mockIsLoading = true;
    mockIsAuthenticated = false;
    rerender();
    expect(result.current).toBe("checking");

    // 前回の5秒分はリセットされているので、5秒後はまだタイムアウトしない
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current).toBe("checking");

    // 新タイマーの10秒でタイムアウト（合計で10秒分経過）
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current).toBe("timed-out");
  });

  it("リトライ後（isLoading再度true）に再度タイムアウトした場合", () => {
    const { result, rerender } = renderHook(() => useAuthState());

    // 初回タイムアウト
    act(() => {
      vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
    });
    expect(result.current).toBe("timed-out");

    // リトライ: isLoading を一度 false にしてから true に戻す
    mockIsLoading = false;
    mockIsAuthenticated = false;
    rerender();
    expect(result.current).toBe("unauthenticated");

    mockIsLoading = true;
    mockIsAuthenticated = false;
    rerender();
    expect(result.current).toBe("checking");

    // 2回目のタイムアウト
    act(() => {
      vi.advanceTimersByTime(AUTH_TIMEOUT_MS);
    });
    expect(result.current).toBe("timed-out");
  });
});
