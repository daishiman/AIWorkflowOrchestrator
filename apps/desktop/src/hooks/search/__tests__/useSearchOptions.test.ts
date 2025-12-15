/**
 * useSearchOptions フックのテスト
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearchOptions } from "../useSearchOptions";
import { DEFAULT_SEARCH_OPTIONS } from "../types";

describe("useSearchOptions", () => {
  describe("初期状態", () => {
    it("デフォルトオプションで初期化される", () => {
      const { result } = renderHook(() => useSearchOptions());

      expect(result.current.options).toEqual(DEFAULT_SEARCH_OPTIONS);
      expect(result.current.options.caseSensitive).toBe(false);
      expect(result.current.options.wholeWord).toBe(false);
      expect(result.current.options.useRegex).toBe(false);
    });

    it("カスタム初期オプションで初期化できる", () => {
      const { result } = renderHook(() =>
        useSearchOptions({ caseSensitive: true }),
      );

      expect(result.current.options.caseSensitive).toBe(true);
      expect(result.current.options.wholeWord).toBe(false);
      expect(result.current.options.useRegex).toBe(false);
    });

    it("すべてのオプションをカスタマイズできる", () => {
      const customOptions = {
        caseSensitive: true,
        wholeWord: true,
        useRegex: true,
      };

      const { result } = renderHook(() => useSearchOptions(customOptions));

      expect(result.current.options).toEqual(customOptions);
    });
  });

  describe("toggleCaseSensitive", () => {
    it("caseSensitiveをtrueに切り替える", () => {
      const { result } = renderHook(() => useSearchOptions());

      act(() => {
        result.current.toggleCaseSensitive();
      });

      expect(result.current.options.caseSensitive).toBe(true);
    });

    it("caseSensitiveをfalseに切り替える", () => {
      const { result } = renderHook(() =>
        useSearchOptions({ caseSensitive: true }),
      );

      act(() => {
        result.current.toggleCaseSensitive();
      });

      expect(result.current.options.caseSensitive).toBe(false);
    });

    it("他のオプションに影響しない", () => {
      const { result } = renderHook(() =>
        useSearchOptions({ wholeWord: true, useRegex: true }),
      );

      act(() => {
        result.current.toggleCaseSensitive();
      });

      expect(result.current.options.wholeWord).toBe(true);
      expect(result.current.options.useRegex).toBe(true);
    });
  });

  describe("toggleWholeWord", () => {
    it("wholeWordをtrueに切り替える", () => {
      const { result } = renderHook(() => useSearchOptions());

      act(() => {
        result.current.toggleWholeWord();
      });

      expect(result.current.options.wholeWord).toBe(true);
    });

    it("wholeWordをfalseに切り替える", () => {
      const { result } = renderHook(() =>
        useSearchOptions({ wholeWord: true }),
      );

      act(() => {
        result.current.toggleWholeWord();
      });

      expect(result.current.options.wholeWord).toBe(false);
    });

    it("他のオプションに影響しない", () => {
      const { result } = renderHook(() =>
        useSearchOptions({ caseSensitive: true, useRegex: true }),
      );

      act(() => {
        result.current.toggleWholeWord();
      });

      expect(result.current.options.caseSensitive).toBe(true);
      expect(result.current.options.useRegex).toBe(true);
    });
  });

  describe("toggleRegex", () => {
    it("useRegexをtrueに切り替える", () => {
      const { result } = renderHook(() => useSearchOptions());

      act(() => {
        result.current.toggleRegex();
      });

      expect(result.current.options.useRegex).toBe(true);
    });

    it("useRegexをfalseに切り替える", () => {
      const { result } = renderHook(() => useSearchOptions({ useRegex: true }));

      act(() => {
        result.current.toggleRegex();
      });

      expect(result.current.options.useRegex).toBe(false);
    });

    it("他のオプションに影響しない", () => {
      const { result } = renderHook(() =>
        useSearchOptions({ caseSensitive: true, wholeWord: true }),
      );

      act(() => {
        result.current.toggleRegex();
      });

      expect(result.current.options.caseSensitive).toBe(true);
      expect(result.current.options.wholeWord).toBe(true);
    });
  });

  describe("resetOptions", () => {
    it("オプションをデフォルト値にリセットする", () => {
      const { result } = renderHook(() => useSearchOptions());

      // オプションを変更
      act(() => {
        result.current.toggleCaseSensitive();
        result.current.toggleWholeWord();
        result.current.toggleRegex();
      });

      expect(result.current.options).toEqual({
        caseSensitive: true,
        wholeWord: true,
        useRegex: true,
      });

      // リセット
      act(() => {
        result.current.resetOptions();
      });

      expect(result.current.options).toEqual(DEFAULT_SEARCH_OPTIONS);
    });

    it("初期オプションを考慮してリセットする", () => {
      const { result } = renderHook(() =>
        useSearchOptions({ caseSensitive: true }),
      );

      // オプションを変更
      act(() => {
        result.current.toggleCaseSensitive();
        result.current.toggleWholeWord();
      });

      expect(result.current.options.caseSensitive).toBe(false);
      expect(result.current.options.wholeWord).toBe(true);

      // リセット - 初期オプションに戻る
      act(() => {
        result.current.resetOptions();
      });

      expect(result.current.options.caseSensitive).toBe(true);
      expect(result.current.options.wholeWord).toBe(false);
    });
  });

  describe("setOptions", () => {
    it("単一のオプションを設定できる", () => {
      const { result } = renderHook(() => useSearchOptions());

      act(() => {
        result.current.setOptions({ caseSensitive: true });
      });

      expect(result.current.options.caseSensitive).toBe(true);
      expect(result.current.options.wholeWord).toBe(false);
      expect(result.current.options.useRegex).toBe(false);
    });

    it("複数のオプションを同時に設定できる", () => {
      const { result } = renderHook(() => useSearchOptions());

      act(() => {
        result.current.setOptions({
          caseSensitive: true,
          useRegex: true,
        });
      });

      expect(result.current.options.caseSensitive).toBe(true);
      expect(result.current.options.wholeWord).toBe(false);
      expect(result.current.options.useRegex).toBe(true);
    });

    it("すべてのオプションを設定できる", () => {
      const { result } = renderHook(() => useSearchOptions());

      act(() => {
        result.current.setOptions({
          caseSensitive: true,
          wholeWord: true,
          useRegex: true,
        });
      });

      expect(result.current.options).toEqual({
        caseSensitive: true,
        wholeWord: true,
        useRegex: true,
      });
    });
  });

  describe("関数の安定性", () => {
    it("toggleCaseSensitiveは再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() => useSearchOptions());

      const firstRef = result.current.toggleCaseSensitive;
      rerender();
      const secondRef = result.current.toggleCaseSensitive;

      expect(firstRef).toBe(secondRef);
    });

    it("toggleWholeWordは再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() => useSearchOptions());

      const firstRef = result.current.toggleWholeWord;
      rerender();
      const secondRef = result.current.toggleWholeWord;

      expect(firstRef).toBe(secondRef);
    });

    it("toggleRegexは再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() => useSearchOptions());

      const firstRef = result.current.toggleRegex;
      rerender();
      const secondRef = result.current.toggleRegex;

      expect(firstRef).toBe(secondRef);
    });

    it("setOptionsは再レンダリング間で安定している", () => {
      const { result, rerender } = renderHook(() => useSearchOptions());

      const firstRef = result.current.setOptions;
      rerender();
      const secondRef = result.current.setOptions;

      expect(firstRef).toBe(secondRef);
    });
  });
});
