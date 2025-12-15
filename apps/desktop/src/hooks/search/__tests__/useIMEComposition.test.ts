/**
 * useIMEComposition フックのテスト
 */

import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIMEComposition } from "../useIMEComposition";

describe("useIMEComposition", () => {
  describe("初期状態", () => {
    it("isComposingがfalseで初期化される", () => {
      const { result } = renderHook(() => useIMEComposition());

      expect(result.current.isComposing).toBe(false);
    });

    it("handleCompositionStartが関数である", () => {
      const { result } = renderHook(() => useIMEComposition());

      expect(typeof result.current.handleCompositionStart).toBe("function");
    });

    it("handleCompositionEndが関数である", () => {
      const { result } = renderHook(() => useIMEComposition());

      expect(typeof result.current.handleCompositionEnd).toBe("function");
    });

    it("executeIfNotComposingが関数である", () => {
      const { result } = renderHook(() => useIMEComposition());

      expect(typeof result.current.executeIfNotComposing).toBe("function");
    });
  });

  describe("composition状態の管理", () => {
    it("handleCompositionStartでisComposingがtrueになる", () => {
      const { result } = renderHook(() => useIMEComposition());

      act(() => {
        result.current.handleCompositionStart();
      });

      expect(result.current.isComposing).toBe(true);
    });

    it("handleCompositionEndでisComposingがfalseになる", () => {
      const { result } = renderHook(() => useIMEComposition());

      act(() => {
        result.current.handleCompositionStart();
      });

      expect(result.current.isComposing).toBe(true);

      act(() => {
        result.current.handleCompositionEnd();
      });

      expect(result.current.isComposing).toBe(false);
    });

    it("連続したcomposition開始/終了を正しく処理する", () => {
      const { result } = renderHook(() => useIMEComposition());

      // 1回目の変換
      act(() => {
        result.current.handleCompositionStart();
      });
      expect(result.current.isComposing).toBe(true);

      act(() => {
        result.current.handleCompositionEnd();
      });
      expect(result.current.isComposing).toBe(false);

      // 2回目の変換
      act(() => {
        result.current.handleCompositionStart();
      });
      expect(result.current.isComposing).toBe(true);

      act(() => {
        result.current.handleCompositionEnd();
      });
      expect(result.current.isComposing).toBe(false);
    });
  });

  describe("executeIfNotComposing", () => {
    it("変換中でない場合、コールバックを実行する", () => {
      const { result } = renderHook(() => useIMEComposition());
      const callback = vi.fn().mockReturnValue("result");

      let returnValue: string | undefined;
      act(() => {
        returnValue = result.current.executeIfNotComposing(callback);
      });

      expect(callback).toHaveBeenCalled();
      expect(returnValue).toBe("result");
    });

    it("変換中の場合、コールバックを実行しない", () => {
      const { result } = renderHook(() => useIMEComposition());
      const callback = vi.fn().mockReturnValue("result");

      act(() => {
        result.current.handleCompositionStart();
      });

      let returnValue: string | undefined;
      act(() => {
        returnValue = result.current.executeIfNotComposing(callback);
      });

      expect(callback).not.toHaveBeenCalled();
      expect(returnValue).toBeUndefined();
    });

    it("変換終了後はコールバックを実行する", () => {
      const { result } = renderHook(() => useIMEComposition());
      const callback = vi.fn().mockReturnValue("result");

      // 変換開始
      act(() => {
        result.current.handleCompositionStart();
      });

      // 変換中はコールバック実行しない
      act(() => {
        result.current.executeIfNotComposing(callback);
      });
      expect(callback).not.toHaveBeenCalled();

      // 変換終了
      act(() => {
        result.current.handleCompositionEnd();
      });

      // 変換終了後はコールバック実行する
      let returnValue: string | undefined;
      act(() => {
        returnValue = result.current.executeIfNotComposing(callback);
      });

      expect(callback).toHaveBeenCalled();
      expect(returnValue).toBe("result");
    });

    it("引数なしのコールバックも正しく処理する", () => {
      const { result } = renderHook(() => useIMEComposition());
      const callback = vi.fn();

      act(() => {
        result.current.executeIfNotComposing(callback);
      });

      expect(callback).toHaveBeenCalled();
    });

    it("戻り値のないコールバックも正しく処理する", () => {
      const { result } = renderHook(() => useIMEComposition());
      const callback = vi.fn();

      let returnValue: undefined;
      act(() => {
        returnValue = result.current.executeIfNotComposing(callback);
      });

      expect(callback).toHaveBeenCalled();
      expect(returnValue).toBeUndefined();
    });
  });

  describe("関数の安定性", () => {
    it("handleCompositionStartは再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() => useIMEComposition());

      const firstRef = result.current.handleCompositionStart;
      rerender();
      const secondRef = result.current.handleCompositionStart;

      expect(firstRef).toBe(secondRef);
    });

    it("handleCompositionEndは再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() => useIMEComposition());

      const firstRef = result.current.handleCompositionEnd;
      rerender();
      const secondRef = result.current.handleCompositionEnd;

      expect(firstRef).toBe(secondRef);
    });
  });
});
