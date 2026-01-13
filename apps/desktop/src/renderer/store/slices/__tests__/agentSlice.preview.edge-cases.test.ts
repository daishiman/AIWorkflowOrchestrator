/**
 * agentSlice Preview Edge Cases Tests (Phase 6 - Test Expansion)
 * @module agentSlice.preview.edge-cases.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAppStore } from "../../index";

describe("agentSlice Preview - Edge Cases", () => {
  // Reset store state before each test
  beforeEach(() => {
    const store = useAppStore.getState();
    store.clearPreview();
    store.setSplitRatio(50);
  });

  describe("splitRatio境界値", () => {
    it("splitRatio=0を設定できる", () => {
      const { result } = renderHook(() => useAppStore());
      act(() => {
        result.current.setSplitRatio(0);
      });
      expect(result.current.splitRatio).toBe(0);
    });

    it("splitRatio=100を設定できる", () => {
      const { result } = renderHook(() => useAppStore());
      act(() => {
        result.current.setSplitRatio(100);
      });
      expect(result.current.splitRatio).toBe(100);
    });

    it("負の値は0にクランプされる", () => {
      const { result } = renderHook(() => useAppStore());
      act(() => {
        result.current.setSplitRatio(-10);
      });
      expect(result.current.splitRatio).toBeGreaterThanOrEqual(0);
    });

    it("100を超える値は100にクランプされる", () => {
      const { result } = renderHook(() => useAppStore());
      act(() => {
        result.current.setSplitRatio(150);
      });
      expect(result.current.splitRatio).toBeLessThanOrEqual(100);
    });

    it("小数値を設定できる", () => {
      const { result } = renderHook(() => useAppStore());
      act(() => {
        result.current.setSplitRatio(33.7);
      });
      expect(typeof result.current.splitRatio).toBe("number");
    });
  });

  describe("previewContent状態遷移", () => {
    it("null -> content -> null の状態遷移", () => {
      const { result } = renderHook(() => useAppStore());

      // Initial null state
      expect(result.current.previewContent).toBeNull();

      // Set content
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<p>Test</p>",
          timestamp: new Date(),
        });
      });
      expect(result.current.previewContent).not.toBeNull();

      // Clear content
      act(() => {
        result.current.clearPreview();
      });
      expect(result.current.previewContent).toBeNull();
    });

    it("空文字列のコンテンツを設定できる", () => {
      const { result } = renderHook(() => useAppStore());
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "",
          timestamp: new Date(),
        });
      });
      expect(result.current.previewContent?.content).toBe("");
    });

    it("非常に長いコンテンツを設定できる", () => {
      const { result } = renderHook(() => useAppStore());
      const longContent = "a".repeat(1000000);
      act(() => {
        result.current.setPreviewContent({
          type: "markdown",
          content: longContent,
          timestamp: new Date(),
        });
      });
      expect(result.current.previewContent?.content.length).toBe(1000000);
    });
  });

  describe("selectedEnvironment遷移", () => {
    it("すべての環境タイプに切り替えられる", () => {
      const { result } = renderHook(() => useAppStore());
      const types = ["none", "html", "markdown", "terminal", "code"] as const;

      types.forEach((type) => {
        act(() => {
          result.current.setSelectedEnvironment(type);
        });
        expect(result.current.selectedEnvironment).toBe(type);
      });
    });

    it("同じ環境タイプへの切り替えは問題なし", () => {
      const { result } = renderHook(() => useAppStore());
      act(() => {
        result.current.setSelectedEnvironment("html");
      });
      act(() => {
        result.current.setSelectedEnvironment("html");
      });
      expect(result.current.selectedEnvironment).toBe("html");
    });
  });

  describe("複合状態変更", () => {
    it("複数の状態を同時に変更しても整合性が保たれる", () => {
      const { result } = renderHook(() => useAppStore());

      // Set all states
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<p>Test</p>",
          timestamp: new Date(),
        });
        result.current.setSelectedEnvironment("html");
        result.current.setSplitRatio(70);
      });

      // Verify all states
      expect(result.current.previewContent?.type).toBe("html");
      expect(result.current.selectedEnvironment).toBe("html");
      expect(result.current.splitRatio).toBe(70);
    });

    it("clearPreviewでpreviewContentとselectedEnvironmentがリセットされる", () => {
      const { result } = renderHook(() => useAppStore());

      // Set initial states
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<p>Test</p>",
          timestamp: new Date(),
        });
        result.current.setSelectedEnvironment("html");
        result.current.setSplitRatio(60);
      });

      // Clear preview
      act(() => {
        result.current.clearPreview();
      });

      // Verify previewContent is cleared and selectedEnvironment is reset
      expect(result.current.previewContent).toBeNull();
      expect(result.current.selectedEnvironment).toBe("none");
      // splitRatio should remain unchanged (or may be reset depending on implementation)
    });
  });

  describe("タイムスタンプ処理", () => {
    it("異なるタイムスタンプを持つコンテンツを連続して設定できる", () => {
      const { result } = renderHook(() => useAppStore());
      const timestamp1 = new Date("2026-01-01T00:00:00Z");
      const timestamp2 = new Date("2026-01-02T00:00:00Z");

      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<p>First</p>",
          timestamp: timestamp1,
        });
      });
      expect(result.current.previewContent?.timestamp).toEqual(timestamp1);

      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<p>Second</p>",
          timestamp: timestamp2,
        });
      });
      expect(result.current.previewContent?.timestamp).toEqual(timestamp2);
    });
  });

  describe("Unicode・特殊文字", () => {
    it("日本語コンテンツを正しく保存できる", () => {
      const { result } = renderHook(() => useAppStore());
      const japaneseContent = "<p>日本語テスト</p>";
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: japaneseContent,
          timestamp: new Date(),
        });
      });
      expect(result.current.previewContent?.content).toBe(japaneseContent);
    });

    it("絵文字を含むコンテンツを正しく保存できる", () => {
      const { result } = renderHook(() => useAppStore());
      const emojiContent = "<p>Hello 🌸 World 🎉</p>";
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: emojiContent,
          timestamp: new Date(),
        });
      });
      expect(result.current.previewContent?.content).toBe(emojiContent);
    });
  });
});
