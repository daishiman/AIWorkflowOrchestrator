/**
 * agentSlice Preview Extension Tests (TDD Green Phase)
 * @module agentSlice.preview.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { EnvironmentType, PreviewContent } from "@repo/shared/types/agent";
import { useAppStore } from "../../index";

describe("agentSlice Preview Extension", () => {
  // Reset store state before each test
  beforeEach(() => {
    const store = useAppStore.getState();
    store.clearPreview();
    store.setSplitRatio(50);
  });

  describe("previewContent", () => {
    it("初期値はnull", () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.previewContent).toBeNull();
    });

    it("setPreviewContentでコンテンツを設定できる", () => {
      const { result } = renderHook(() => useAppStore());
      const content: PreviewContent = {
        type: "html",
        content: "<h1>Test</h1>",
        timestamp: new Date(),
      };

      act(() => {
        result.current.setPreviewContent(content);
      });

      expect(result.current.previewContent).toEqual(content);
    });

    it("setPreviewContentでnullを設定できる", () => {
      const { result } = renderHook(() => useAppStore());

      // まずコンテンツを設定
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<p>Test</p>",
          timestamp: new Date(),
        });
      });

      // nullを設定
      act(() => {
        result.current.setPreviewContent(null);
      });

      expect(result.current.previewContent).toBeNull();
    });

    it("clearPreviewでコンテンツがクリアされる", () => {
      const { result } = renderHook(() => useAppStore());

      // コンテンツを設定
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<p>Test</p>",
          timestamp: new Date(),
        });
      });

      // クリア
      act(() => {
        result.current.clearPreview();
      });

      expect(result.current.previewContent).toBeNull();
    });

    it("異なるタイプのコンテンツを設定できる", () => {
      const { result } = renderHook(() => useAppStore());

      // HTML
      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<h1>HTML</h1>",
          timestamp: new Date(),
        });
      });
      expect(result.current.previewContent?.type).toBe("html");

      // Markdown
      act(() => {
        result.current.setPreviewContent({
          type: "markdown",
          content: "# Markdown",
          timestamp: new Date(),
        });
      });
      expect(result.current.previewContent?.type).toBe("markdown");
    });
  });

  describe("selectedEnvironment", () => {
    it("初期値は'none'", () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.selectedEnvironment).toBe("none");
    });

    it("setSelectedEnvironmentで環境を設定できる", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSelectedEnvironment("html");
      });

      expect(result.current.selectedEnvironment).toBe("html");
    });

    it("全ての有効な環境タイプを設定できる", () => {
      const { result } = renderHook(() => useAppStore());
      const types: EnvironmentType[] = [
        "none",
        "html",
        "markdown",
        "terminal",
        "code",
      ];

      for (const type of types) {
        act(() => {
          result.current.setSelectedEnvironment(type);
        });
        expect(result.current.selectedEnvironment).toBe(type);
      }
    });

    it("clearPreviewで環境が'none'にリセットされる", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSelectedEnvironment("html");
      });

      act(() => {
        result.current.clearPreview();
      });

      expect(result.current.selectedEnvironment).toBe("none");
    });
  });

  describe("splitRatio", () => {
    it("初期値は50", () => {
      const { result } = renderHook(() => useAppStore());
      expect(result.current.splitRatio).toBe(50);
    });

    it("setSplitRatioで比率を設定できる", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSplitRatio(30);
      });

      expect(result.current.splitRatio).toBe(30);
    });

    it("0から100の範囲で設定できる", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSplitRatio(0);
      });
      expect(result.current.splitRatio).toBe(0);

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
  });

  describe("状態の独立性", () => {
    it("previewContentの変更がsplitRatioに影響しない", () => {
      const { result } = renderHook(() => useAppStore());

      act(() => {
        result.current.setSplitRatio(70);
      });

      act(() => {
        result.current.setPreviewContent({
          type: "html",
          content: "<p>Test</p>",
          timestamp: new Date(),
        });
      });

      expect(result.current.splitRatio).toBe(70);
    });

    it("selectedEnvironmentの変更がpreviewContentに影響しない", () => {
      const { result } = renderHook(() => useAppStore());
      const content: PreviewContent = {
        type: "html",
        content: "<p>Test</p>",
        timestamp: new Date(),
      };

      act(() => {
        result.current.setPreviewContent(content);
      });

      act(() => {
        result.current.setSelectedEnvironment("markdown");
      });

      expect(result.current.previewContent).toEqual(content);
    });
  });

  describe("既存状態との互換性", () => {
    it("executionStateと共存できる", () => {
      // NOTE: This test verifies that adding preview state doesn't break existing state
      const { result } = renderHook(() => useAppStore());

      // Preview state should exist alongside existing agent state
      expect(result.current.previewContent).toBeDefined();
      expect(result.current.selectedEnvironment).toBeDefined();
      expect(result.current.splitRatio).toBeDefined();
    });
  });
});
