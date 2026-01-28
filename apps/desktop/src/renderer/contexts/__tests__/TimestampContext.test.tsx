/**
 * @vitest-environment happy-dom
 *
 * TimestampContext Tests
 *
 * TDD Red Phase: Tests for timestamp auto-update context.
 * All tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/renderer/contexts/__tests__/TimestampContext
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { TimestampProvider, useTimestampContext } from "../TimestampContext";

// テスト用コンポーネント
function TestComponent() {
  const currentTime = useTimestampContext();
  return <div data-testid="current-time">{currentTime}</div>;
}

describe("TimestampContext", () => {
  let originalHidden: boolean | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-28T12:00:00Z"));
    originalHidden = document.hidden;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: originalHidden,
    });
  });

  it("初期値として現在時刻を提供する", () => {
    render(
      <TimestampProvider>
        <TestComponent />
      </TimestampProvider>,
    );

    expect(screen.getByTestId("current-time").textContent).toBe(
      String(new Date("2026-01-28T12:00:00Z").getTime()),
    );
  });

  it("ページが可視の時、currentTimeが定期的に更新される", () => {
    render(
      <TimestampProvider>
        <TestComponent />
      </TimestampProvider>,
    );

    const initialTime = screen.getByTestId("current-time").textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const updatedTime = screen.getByTestId("current-time").textContent;
    expect(Number(updatedTime)).toBeGreaterThan(Number(initialTime));
  });

  it("ページが非表示の時、更新が停止する", () => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });

    render(
      <TimestampProvider>
        <TestComponent />
      </TimestampProvider>,
    );

    const initialTime = screen.getByTestId("current-time").textContent;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const timeAfterDelay = screen.getByTestId("current-time").textContent;
    expect(timeAfterDelay).toBe(initialTime);
  });

  it("タブ再表示時に即座に現在時刻が更新される", () => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });

    render(
      <TimestampProvider>
        <TestComponent />
      </TimestampProvider>,
    );

    const initialTime = Number(screen.getByTestId("current-time").textContent);

    // 5秒経過（システム時刻も更新）
    act(() => {
      vi.advanceTimersByTime(5000);
      vi.setSystemTime(new Date("2026-01-28T12:00:05Z"));
    });

    // タブを再表示
    act(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // 次のタイマー tick を待つ（1秒後に更新される）
    act(() => {
      vi.advanceTimersByTime(1000);
      vi.setSystemTime(new Date("2026-01-28T12:00:06Z"));
    });

    const timeAfterVisible = Number(
      screen.getByTestId("current-time").textContent,
    );
    expect(timeAfterVisible).toBeGreaterThan(initialTime);
  });
});

describe("TimestampContext - エッジケース", () => {
  let originalHidden: boolean | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-28T12:00:00Z"));
    originalHidden = document.hidden;
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(document, "hidden", {
      configurable: true,
      writable: true,
      value: originalHidden,
    });
  });

  it("Providerなしでデフォルト値が使用される", () => {
    function TestWithoutProvider() {
      const currentTime = useTimestampContext();
      return <div data-testid="type">{typeof currentTime}</div>;
    }

    render(<TestWithoutProvider />);
    expect(screen.getByTestId("type").textContent).toBe("number");
  });

  it("カスタムupdateIntervalが反映される", () => {
    render(
      <TimestampProvider updateInterval={500}>
        <TestComponent />
      </TimestampProvider>,
    );

    const initialTime = screen.getByTestId("current-time").textContent;

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByTestId("current-time").textContent).not.toBe(
      initialTime,
    );
  });

  it("複数回の更新が正しく動作する", () => {
    render(
      <TimestampProvider>
        <TestComponent />
      </TimestampProvider>,
    );

    const times: string[] = [];
    times.push(screen.getByTestId("current-time").textContent || "");

    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      times.push(screen.getByTestId("current-time").textContent || "");
    }

    // 全ての時刻が異なる
    const uniqueTimes = new Set(times);
    expect(uniqueTimes.size).toBe(6);
  });
});
