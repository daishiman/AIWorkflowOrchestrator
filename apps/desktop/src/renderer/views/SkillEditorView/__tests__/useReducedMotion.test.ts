/**
 * useReducedMotion Hook テスト
 * UT-UI-05A-007: prefers-reduced-motion 対応フック
 *
 * テスト対象:
 * - prefers-reduced-motion: reduce が一致する場合の初期状態（true）
 * - prefers-reduced-motion: reduce が一致しない場合の初期状態（false）
 * - メディアクエリ変更イベントへの応答
 * - アンマウント時のイベントリスナー解除
 *
 * テスト方針:
 * - vi.fn() で matchMedia をモック化
 * - renderHook + act で Hook の状態遷移を検証
 * - happy-dom 環境では fireEvent のみ使用（P39 対策）
 *
 * @module SkillEditorView/__tests__/useReducedMotion.test
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useReducedMotion } from "../hooks/useReducedMotion";

/** matchMedia モックのイベントリスナーを保持する型 */
interface MockMediaQueryList {
  matches: boolean;
  media: string;
  onchange: null;
  addListener: ReturnType<typeof vi.fn>;
  removeListener: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
}

describe("useReducedMotion", () => {
  let mockMediaQueryList: MockMediaQueryList;
  let changeHandlers: Array<(e: { matches: boolean }) => void>;

  /**
   * matchMedia モックをセットアップする
   * @param initialMatches - 初期状態でのメディアクエリ一致結果
   */
  const setupMatchMedia = (initialMatches: boolean): void => {
    changeHandlers = [];

    mockMediaQueryList = {
      matches: initialMatches,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(
        (event: string, handler: (e: { matches: boolean }) => void) => {
          if (event === "change") {
            changeHandlers.push(handler);
          }
        },
      ),
      removeEventListener: vi.fn(
        (event: string, handler: (e: { matches: boolean }) => void) => {
          if (event === "change") {
            changeHandlers = changeHandlers.filter((h) => h !== handler);
          }
        },
      ),
      dispatchEvent: vi.fn(),
    };

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockReturnValue(mockMediaQueryList),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefers-reduced-motion: reduce が一致する場合、初期値が true である", () => {
    setupMatchMedia(true);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it("prefers-reduced-motion: reduce が一致しない場合、初期値が false である", () => {
    setupMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it("メディアクエリの変更イベントに応答して状態が更新される", () => {
    setupMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());

    // 初期状態は false
    expect(result.current).toBe(false);

    // change イベントを発火して reduce を有効にする
    act(() => {
      for (const handler of changeHandlers) {
        handler({ matches: true });
      }
    });

    expect(result.current).toBe(true);

    // change イベントを発火して reduce を無効にする
    act(() => {
      for (const handler of changeHandlers) {
        handler({ matches: false });
      }
    });

    expect(result.current).toBe(false);
  });

  it("addEventListener が 'change' イベントで登録される", () => {
    setupMatchMedia(false);

    renderHook(() => useReducedMotion());

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("アンマウント時に removeEventListener でリスナーが解除される", () => {
    setupMatchMedia(false);

    const { unmount } = renderHook(() => useReducedMotion());

    // addEventListener に渡されたハンドラを取得
    const registeredHandler =
      mockMediaQueryList.addEventListener.mock.calls[0]?.[1];

    unmount();

    // removeEventListener が同一ハンドラで呼ばれたことを確認
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      "change",
      registeredHandler,
    );
  });

  it("matchMedia に正しいクエリ文字列が渡される", () => {
    setupMatchMedia(false);

    renderHook(() => useReducedMotion());

    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
    );
  });
});
