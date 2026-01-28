/**
 * @vitest-environment happy-dom
 *
 * usePageVisibility Hook Tests
 *
 * TDD Red Phase: Tests for page visibility detection hook.
 * All tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/renderer/hooks/__tests__/usePageVisibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageVisibility } from "../usePageVisibility";

describe("usePageVisibility", () => {
  let originalHidden: boolean | undefined;

  beforeEach(() => {
    originalHidden = document.hidden;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: false,
    });
  });

  afterEach(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: originalHidden,
    });
    vi.restoreAllMocks();
  });

  it("初期状態でページが可視の場合trueを返す", () => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);
  });

  it("初期状態でページが非表示の場合falseを返す", () => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(false);
  });

  it("visibilitychangeイベントで状態が更新される（非表示）", () => {
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(true);

    act(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(false);
  });

  it("visibilitychangeイベントで状態が更新される（再表示）", () => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    const { result } = renderHook(() => usePageVisibility());
    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(result.current).toBe(true);
  });

  it("アンマウント時にイベントリスナーが削除される", () => {
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => usePageVisibility());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });
});
