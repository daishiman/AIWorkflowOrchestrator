/**
 * useSearchStore テスト
 */

import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSearchStore } from "../stores/useSearchStore";

describe("useSearchStore", () => {
  beforeEach(() => {
    // ストアをリセット
    const { result } = renderHook(() => useSearchStore());
    act(() => {
      result.current.reset();
      result.current.closeSearchPanel();
      result.current.closeWorkspaceSearchPanel();
    });
  });

  describe("検索クエリ", () => {
    it("検索クエリを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setSearchQuery("test query");
      });

      expect(result.current.searchQuery).toBe("test query");
    });

    it("検索クエリ設定時にエラーがクリアされる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setError("some error");
      });
      expect(result.current.error).toBe("some error");

      act(() => {
        result.current.setSearchQuery("new query");
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("置換テキスト", () => {
    it("置換テキストを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setReplaceText("replacement");
      });

      expect(result.current.replaceText).toBe("replacement");
    });
  });

  describe("検索オプション", () => {
    it("caseSensitiveオプションを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.options.caseSensitive).toBe(false);

      act(() => {
        result.current.setOption("caseSensitive", true);
      });

      expect(result.current.options.caseSensitive).toBe(true);
    });

    it("regexオプションを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.options.regex).toBe(false);

      act(() => {
        result.current.setOption("regex", true);
      });

      expect(result.current.options.regex).toBe(true);
    });

    it("wholeWordオプションを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.options.wholeWord).toBe(false);

      act(() => {
        result.current.setOption("wholeWord", true);
      });

      expect(result.current.options.wholeWord).toBe(true);
    });
  });

  describe("パネル操作", () => {
    it("検索パネルを開くとワークスペース検索パネルが閉じる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.openWorkspaceSearchPanel();
      });
      expect(result.current.isWorkspaceSearchPanelOpen).toBe(true);

      act(() => {
        result.current.openSearchPanel();
      });

      expect(result.current.isSearchPanelOpen).toBe(true);
      expect(result.current.isWorkspaceSearchPanelOpen).toBe(false);
    });

    it("ワークスペース検索パネルを開くと検索パネルが閉じる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.openSearchPanel();
      });
      expect(result.current.isSearchPanelOpen).toBe(true);

      act(() => {
        result.current.openWorkspaceSearchPanel();
      });

      expect(result.current.isWorkspaceSearchPanelOpen).toBe(true);
      expect(result.current.isSearchPanelOpen).toBe(false);
    });

    it("検索パネルを閉じることができる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.openSearchPanel();
      });
      expect(result.current.isSearchPanelOpen).toBe(true);

      act(() => {
        result.current.closeSearchPanel();
      });

      expect(result.current.isSearchPanelOpen).toBe(false);
    });

    it("ワークスペース検索パネルを閉じることができる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.openWorkspaceSearchPanel();
      });
      expect(result.current.isWorkspaceSearchPanelOpen).toBe(true);

      act(() => {
        result.current.closeWorkspaceSearchPanel();
      });

      expect(result.current.isWorkspaceSearchPanelOpen).toBe(false);
    });

    it("置換モードをトグルできる", () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.showReplace).toBe(false);

      act(() => {
        result.current.toggleReplaceMode();
      });

      expect(result.current.showReplace).toBe(true);

      act(() => {
        result.current.toggleReplaceMode();
      });

      expect(result.current.showReplace).toBe(false);
    });
  });

  describe("検索結果操作", () => {
    it("検索結果を設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      const mockResults = [
        {
          line: 1,
          column: 5,
          length: 4,
          text: "test",
          lineText: "this is a test",
        },
        {
          line: 3,
          column: 10,
          length: 4,
          text: "test",
          lineText: "another test here",
        },
      ];

      act(() => {
        result.current.setFileResults(mockResults);
      });

      expect(result.current.fileResults).toEqual(mockResults);
      expect(result.current.currentFileResultIndex).toBe(0);
    });

    it("空の検索結果を設定するとインデックスが-1になる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setFileResults([]);
      });

      expect(result.current.fileResults).toEqual([]);
      expect(result.current.currentFileResultIndex).toBe(-1);
    });

    it("次の結果に移動できる", () => {
      const { result } = renderHook(() => useSearchStore());

      const mockResults = [
        { line: 1, column: 5, length: 4, text: "test", lineText: "line 1" },
        { line: 2, column: 5, length: 4, text: "test", lineText: "line 2" },
        { line: 3, column: 5, length: 4, text: "test", lineText: "line 3" },
      ];

      act(() => {
        result.current.setFileResults(mockResults);
      });

      expect(result.current.currentFileResultIndex).toBe(0);

      act(() => {
        result.current.goToNextResult();
      });

      expect(result.current.currentFileResultIndex).toBe(1);

      act(() => {
        result.current.goToNextResult();
      });

      expect(result.current.currentFileResultIndex).toBe(2);

      // ラップアラウンド
      act(() => {
        result.current.goToNextResult();
      });

      expect(result.current.currentFileResultIndex).toBe(0);
    });

    it("前の結果に移動できる", () => {
      const { result } = renderHook(() => useSearchStore());

      const mockResults = [
        { line: 1, column: 5, length: 4, text: "test", lineText: "line 1" },
        { line: 2, column: 5, length: 4, text: "test", lineText: "line 2" },
        { line: 3, column: 5, length: 4, text: "test", lineText: "line 3" },
      ];

      act(() => {
        result.current.setFileResults(mockResults);
      });

      // ラップアラウンド（0 -> 2）
      act(() => {
        result.current.goToPreviousResult();
      });

      expect(result.current.currentFileResultIndex).toBe(2);

      act(() => {
        result.current.goToPreviousResult();
      });

      expect(result.current.currentFileResultIndex).toBe(1);
    });

    it("結果が空の場合は移動しない", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setFileResults([]);
      });

      act(() => {
        result.current.goToNextResult();
      });

      expect(result.current.currentFileResultIndex).toBe(-1);

      act(() => {
        result.current.goToPreviousResult();
      });

      expect(result.current.currentFileResultIndex).toBe(-1);
    });
  });

  describe("状態操作", () => {
    it("検索中フラグを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.isSearching).toBe(false);

      act(() => {
        result.current.setIsSearching(true);
      });

      expect(result.current.isSearching).toBe(true);

      act(() => {
        result.current.setIsSearching(false);
      });

      expect(result.current.isSearching).toBe(false);
    });

    it("エラーを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      expect(result.current.error).toBeNull();

      act(() => {
        result.current.setError("An error occurred");
      });

      expect(result.current.error).toBe("An error occurred");

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("フィルター操作", () => {
    it("インクルードパターンを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setIncludePattern("*.ts");
      });

      expect(result.current.includePattern).toBe("*.ts");
    });

    it("エクスクルードパターンを設定できる", () => {
      const { result } = renderHook(() => useSearchStore());

      act(() => {
        result.current.setExcludePattern("node_modules");
      });

      expect(result.current.excludePattern).toBe("node_modules");
    });
  });

  describe("リセット", () => {
    it("状態をリセットできる", () => {
      const { result } = renderHook(() => useSearchStore());

      // 状態を変更
      act(() => {
        result.current.setSearchQuery("test");
        result.current.setReplaceText("replace");
        result.current.setFileResults([
          { line: 1, column: 1, length: 4, text: "test", lineText: "test" },
        ]);
        result.current.setIsSearching(true);
        result.current.setError("error");
      });

      // リセット
      act(() => {
        result.current.reset();
      });

      expect(result.current.searchQuery).toBe("");
      expect(result.current.replaceText).toBe("");
      expect(result.current.fileResults).toEqual([]);
      expect(result.current.currentFileResultIndex).toBe(0);
      expect(result.current.isSearching).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
