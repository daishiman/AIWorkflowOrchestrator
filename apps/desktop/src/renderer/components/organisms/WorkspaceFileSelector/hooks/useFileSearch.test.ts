/**
 * useFileSearch フックのテスト
 *
 * @see docs/30-workflows/file-selector-integration/step09-workspace-file-selector-design.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileSearch } from "./useFileSearch";
import type { FileNode } from "../../../../store/types";

describe("useFileSearch", () => {
  const mockFileTree: FileNode[] = [
    {
      id: "folder1",
      name: "src",
      type: "folder",
      path: "/project/src",
      children: [
        {
          id: "file1",
          name: "index.ts",
          type: "file",
          path: "/project/src/index.ts",
        },
        {
          id: "file2",
          name: "utils.ts",
          type: "file",
          path: "/project/src/utils.ts",
        },
        {
          id: "folder2",
          name: "components",
          type: "folder",
          path: "/project/src/components",
          children: [
            {
              id: "file3",
              name: "Button.tsx",
              type: "file",
              path: "/project/src/components/Button.tsx",
            },
          ],
        },
      ],
    },
    {
      id: "file4",
      name: "README.md",
      type: "file",
      path: "/project/README.md",
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("初期状態", () => {
    it("空のクエリで初期化される", () => {
      const { result } = renderHook(() => useFileSearch());

      expect(result.current.query).toBe("");
    });
  });

  describe("クエリ設定", () => {
    it("setQuery でクエリを設定できる", async () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      act(() => {
        result.current.setQuery("index");
      });

      expect(result.current.query).toBe("index");
    });

    it("clearQuery でクエリをクリアできる", () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      act(() => {
        result.current.setQuery("test");
      });

      act(() => {
        result.current.clearQuery();
      });

      expect(result.current.query).toBe("");
    });
  });

  describe("デバウンス", () => {
    it("デバウンス期間中はフィルタリングが遅延される", async () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 300 }));

      act(() => {
        result.current.setQuery("index");
      });

      // デバウンス前でもクエリは即座に反映される
      expect(result.current.query).toBe("index");

      // デバウンス完了を待つ
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // フィルタリング結果を確認
      const filteredResult = result.current.filterNodes(mockFileTree);
      expect(filteredResult.length).toBeGreaterThan(0);
    });
  });

  describe("フィルタリング", () => {
    it("空のクエリで全件返す", () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      const filtered = result.current.filterNodes(mockFileTree);

      expect(filtered).toEqual(mockFileTree);
    });

    it("ファイル名の部分一致でフィルタリングできる", () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      act(() => {
        result.current.setQuery("index");
      });

      const filtered = result.current.filterNodes(mockFileTree);

      // index.ts を含むノードのみ返される
      // 親フォルダも含まれる
      expect(filtered.length).toBeGreaterThan(0);

      // 深いノードを探索してindex.tsが含まれることを確認
      const hasIndexTs = JSON.stringify(filtered).includes("index.ts");
      expect(hasIndexTs).toBe(true);
    });

    it("大文字小文字を区別しない", () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      act(() => {
        result.current.setQuery("INDEX");
      });

      const filtered = result.current.filterNodes(mockFileTree);

      const hasIndexTs = JSON.stringify(filtered).includes("index.ts");
      expect(hasIndexTs).toBe(true);
    });

    it("マッチするファイルを含むフォルダは表示される", () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      act(() => {
        result.current.setQuery("Button");
      });

      const filtered = result.current.filterNodes(mockFileTree);

      // Button.tsx は src/components 内にあるので、
      // src フォルダと components フォルダも表示される
      expect(filtered.length).toBeGreaterThan(0);

      const hasSrc = JSON.stringify(filtered).includes("src");
      const hasComponents = JSON.stringify(filtered).includes("components");
      const hasButton = JSON.stringify(filtered).includes("Button.tsx");

      expect(hasSrc).toBe(true);
      expect(hasComponents).toBe(true);
      expect(hasButton).toBe(true);
    });

    it("マッチしないファイルはフィルタリングされる", () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      act(() => {
        result.current.setQuery("nonexistent");
      });

      const filtered = result.current.filterNodes(mockFileTree);

      // マッチしないので空配列
      expect(filtered).toEqual([]);
    });

    it("ルートレベルのファイルもフィルタリングできる", () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      act(() => {
        result.current.setQuery("README");
      });

      const filtered = result.current.filterNodes(mockFileTree);

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe("README.md");
    });
  });

  describe("拡張子フィルタリング", () => {
    it("拡張子でフィルタリングできる", () => {
      const { result } = renderHook(() => useFileSearch({ debounceMs: 0 }));

      act(() => {
        result.current.setQuery(".tsx");
      });

      const filtered = result.current.filterNodes(mockFileTree);

      const hasButton = JSON.stringify(filtered).includes("Button.tsx");
      expect(hasButton).toBe(true);

      // .ts ファイルは含まれない
      const hasIndexTs = filtered.some(
        (n) => n.type === "file" && n.name === "index.ts",
      );
      expect(hasIndexTs).toBe(false);
    });
  });
});
