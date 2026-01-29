/**
 * useCopyHistory Hook テスト
 *
 * TASK-3-2-D: コピー履歴機能
 * Phase 4: TDD Red状態
 *
 * @module @repo/desktop/renderer/hooks/__tests__/useCopyHistory.test
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { useCopyHistory } from "../useCopyHistory";
import { CopyHistoryProvider } from "../../contexts/CopyHistoryContext";

// モック設定
const mockWriteText = vi.fn().mockResolvedValue(undefined);
const mockClipboard = { writeText: mockWriteText };

beforeAll(() => {
  // happy-dom では navigator.clipboard が getter のみなので vi.stubGlobal を使用
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: mockClipboard,
  });
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  mockWriteText.mockClear();
  vi.spyOn(Date, "now").mockReturnValue(1706400000000);
});

// テストユーティリティ: Provider でラップ
function wrapper({ children }: { children: React.ReactNode }) {
  return <CopyHistoryProvider>{children}</CopyHistoryProvider>;
}

describe("useCopyHistory", () => {
  it("TC-411: Context 外で使用時にエラー", () => {
    // コンソールエラーを抑制
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useCopyHistory());
    }).toThrow("useCopyHistory must be used within CopyHistoryProvider");

    consoleSpy.mockRestore();
  });

  it("TC-412: history が正しく取得できる", async () => {
    const { result } = renderHook(() => useCopyHistory(), { wrapper });

    // 初期状態
    expect(result.current.history).toEqual([]);
    expect(result.current.historyCount).toBe(0);

    // 履歴追加
    await act(async () => {
      result.current.addToHistory("test content");
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.historyCount).toBe(1);
    expect(result.current.history[0].content).toBe("test content");
  });

  it("TC-413: addToHistory が正しく動作", async () => {
    const { result } = renderHook(() => useCopyHistory(), { wrapper });

    // 履歴追加（sourceMessageId あり）
    await act(async () => {
      result.current.addToHistory("content with source", "msg-123");
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].content).toBe("content with source");
    expect(result.current.history[0].sourceMessageId).toBe("msg-123");
    expect(result.current.history[0].timestamp).toBe(1706400000000);

    // 履歴追加（sourceMessageId なし）
    await act(async () => {
      result.current.addToHistory("content without source");
    });

    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].content).toBe("content without source");
    expect(result.current.history[0].sourceMessageId).toBeUndefined();
  });

  describe("追加機能", () => {
    it("selectedCount が正しく計算される", async () => {
      const { result } = renderHook(() => useCopyHistory(), { wrapper });

      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
      });

      expect(result.current.selectedCount).toBe(0);

      await act(async () => {
        result.current.toggleSelection(result.current.history[0].id);
      });

      expect(result.current.selectedCount).toBe(1);

      await act(async () => {
        result.current.toggleSelection(result.current.history[1].id);
      });

      expect(result.current.selectedCount).toBe(2);
    });

    it("removeFromHistory が正しく動作", async () => {
      const { result } = renderHook(() => useCopyHistory(), { wrapper });

      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
      });

      const idToRemove = result.current.history[0].id;

      await act(async () => {
        result.current.removeFromHistory(idToRemove);
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].content).toBe("content-1");
    });

    it("clearHistory が正しく動作", async () => {
      const { result } = renderHook(() => useCopyHistory(), { wrapper });

      // 履歴を追加
      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
      });

      // 選択状態を追加
      await act(async () => {
        result.current.toggleSelection(result.current.history[0].id);
      });

      expect(result.current.historyCount).toBe(2);
      expect(result.current.selectedCount).toBe(1);

      await act(async () => {
        result.current.clearHistory();
      });

      expect(result.current.historyCount).toBe(0);
      expect(result.current.selectedCount).toBe(0);
    });

    it("copyFromHistory が正しく動作", async () => {
      const { result } = renderHook(() => useCopyHistory(), { wrapper });

      await act(async () => {
        result.current.addToHistory("copy this");
      });

      await act(async () => {
        await result.current.copyFromHistory(result.current.history[0].id);
      });

      expect(mockWriteText).toHaveBeenCalledWith("copy this");
    });

    it("copySelectedItems が正しく動作", async () => {
      const { result } = renderHook(() => useCopyHistory(), { wrapper });

      await act(async () => {
        result.current.addToHistory("first");
        result.current.addToHistory("second");
      });

      await act(async () => {
        result.current.toggleSelection(result.current.history[0].id);
        result.current.toggleSelection(result.current.history[1].id);
      });

      await act(async () => {
        await result.current.copySelectedItems();
      });

      expect(mockWriteText).toHaveBeenCalledWith("second\nfirst");
      expect(result.current.selectedCount).toBe(0);
    });
  });
});
