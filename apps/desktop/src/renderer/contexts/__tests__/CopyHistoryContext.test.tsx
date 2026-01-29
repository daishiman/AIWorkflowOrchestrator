/**
 * CopyHistoryContext テスト
 *
 * TASK-3-2-D: コピー履歴機能
 * Phase 4: TDD Red状態
 *
 * @module @repo/desktop/renderer/contexts/__tests__/CopyHistoryContext.test
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import React from "react";
import {
  CopyHistoryProvider,
  useCopyHistoryContext,
} from "../CopyHistoryContext";

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

// テストユーティリティ: Providerでラップしたレンダリング
function _renderWithProvider(ui: React.ReactElement) {
  return render(<CopyHistoryProvider>{ui}</CopyHistoryProvider>);
}

// テストユーティリティ: Hook テスト用ラッパー
function renderUseCopyHistoryContext() {
  return renderHook(() => useCopyHistoryContext(), {
    wrapper: ({ children }) => (
      <CopyHistoryProvider>{children}</CopyHistoryProvider>
    ),
  });
}

// テスト用コンポーネント
function _TestConsumer() {
  const { history, historyCount, selectedIds, addToHistory, clearHistory } =
    useCopyHistoryContext();
  return (
    <div>
      <span data-testid="history-count">{historyCount}</span>
      <span data-testid="selected-count">{selectedIds.size}</span>
      <button
        data-testid="add-button"
        onClick={() => addToHistory("test content")}
      >
        Add
      </button>
      <button data-testid="clear-button" onClick={clearHistory}>
        Clear
      </button>
      <ul data-testid="history-list">
        {history.map((item) => (
          <li key={item.id} data-testid={`history-item-${item.id}`}>
            {item.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

describe("CopyHistoryContext", () => {
  describe("CopyHistoryProvider", () => {
    it("TC-401: コピー時に履歴に追加される", async () => {
      const { result } = renderUseCopyHistoryContext();

      expect(result.current.history).toHaveLength(0);
      expect(result.current.historyCount).toBe(0);

      await act(async () => {
        result.current.addToHistory("test content", "msg-1");
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].content).toBe("test content");
      expect(result.current.history[0].sourceMessageId).toBe("msg-1");
      expect(result.current.history[0].id).toBeDefined();
      expect(result.current.history[0].timestamp).toBe(1706400000000);
    });

    it("TC-402: 51件目のコピーで最古の履歴が削除される", async () => {
      const { result } = renderUseCopyHistoryContext();

      // 50件追加
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          result.current.addToHistory(`content-${i}`);
        });
      }

      expect(result.current.history).toHaveLength(50);
      // 最古は content-0
      const oldestId = result.current.history[49].id;

      // 51件目追加
      await act(async () => {
        result.current.addToHistory("content-50");
      });

      expect(result.current.history).toHaveLength(50);
      expect(result.current.history[0].content).toBe("content-50");
      // 最古の項目が削除されている
      expect(
        result.current.history.find((item) => item.id === oldestId),
      ).toBeUndefined();
    });

    it("TC-403: removeFromHistory で指定項目が削除される", async () => {
      const { result } = renderUseCopyHistoryContext();

      // 3件追加
      await act(async () => {
        result.current.addToHistory("content-1");
      });
      await act(async () => {
        result.current.addToHistory("content-2");
      });
      await act(async () => {
        result.current.addToHistory("content-3");
      });

      expect(result.current.history).toHaveLength(3);
      const idToRemove = result.current.history[1].id; // 中間の項目

      await act(async () => {
        result.current.removeFromHistory(idToRemove);
      });

      expect(result.current.history).toHaveLength(2);
      expect(
        result.current.history.find((item) => item.id === idToRemove),
      ).toBeUndefined();
    });

    it("TC-404: clearHistory で全履歴が削除される", async () => {
      const { result } = renderUseCopyHistoryContext();

      // 3件追加
      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
        result.current.addToHistory("content-3");
      });

      // 選択状態を追加
      await act(async () => {
        result.current.toggleSelection(result.current.history[0].id);
      });

      expect(result.current.history).toHaveLength(3);
      expect(result.current.selectedIds.size).toBe(1);

      await act(async () => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
      expect(result.current.selectedIds.size).toBe(0);
    });

    it("TC-405: toggleSelection で選択状態がトグル", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("content-1");
      });

      const itemId = result.current.history[0].id;

      // 初期状態: 未選択
      expect(result.current.selectedIds.has(itemId)).toBe(false);

      // 1回目: 選択
      await act(async () => {
        result.current.toggleSelection(itemId);
      });
      expect(result.current.selectedIds.has(itemId)).toBe(true);

      // 2回目: 選択解除
      await act(async () => {
        result.current.toggleSelection(itemId);
      });
      expect(result.current.selectedIds.has(itemId)).toBe(false);
    });

    it("TC-406: clearSelection で全選択解除", async () => {
      const { result } = renderUseCopyHistoryContext();

      // 3件追加
      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
        result.current.addToHistory("content-3");
      });

      // 2件選択
      await act(async () => {
        result.current.toggleSelection(result.current.history[0].id);
        result.current.toggleSelection(result.current.history[1].id);
      });

      expect(result.current.selectedIds.size).toBe(2);

      await act(async () => {
        result.current.clearSelection();
      });

      expect(result.current.selectedIds.size).toBe(0);
      // 履歴自体は影響を受けない
      expect(result.current.history).toHaveLength(3);
    });
  });

  describe("copyFromHistory", () => {
    it("指定した履歴項目をクリップボードにコピーする", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("copy this content");
      });

      const itemId = result.current.history[0].id;

      await act(async () => {
        await result.current.copyFromHistory(itemId);
      });

      expect(mockWriteText).toHaveBeenCalledWith("copy this content");
    });
  });

  describe("copySelectedItems", () => {
    it("選択した項目を改行区切りで結合してコピーする", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
        result.current.addToHistory("content-3");
      });

      // content-3とcontent-1を選択（新しい順で追加されるので）
      await act(async () => {
        result.current.toggleSelection(result.current.history[0].id); // content-3
        result.current.toggleSelection(result.current.history[2].id); // content-1
      });

      await act(async () => {
        await result.current.copySelectedItems();
      });

      // 履歴の順序で結合される
      expect(mockWriteText).toHaveBeenCalledWith("content-3\ncontent-1");
      // 選択状態がクリアされる
      expect(result.current.selectedIds.size).toBe(0);
    });
  });

  describe("selectAll", () => {
    it("全項目を選択する", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
        result.current.addToHistory("content-3");
      });

      expect(result.current.selectedIds.size).toBe(0);

      await act(async () => {
        result.current.selectAll();
      });

      expect(result.current.selectedIds.size).toBe(3);
    });
  });

  // Phase 6: テスト拡充
  describe("境界値テスト", () => {
    it("TC-601: 50件ちょうどの状態で動作", async () => {
      const { result } = renderUseCopyHistoryContext();

      // 50件追加
      for (let i = 0; i < 50; i++) {
        await act(async () => {
          result.current.addToHistory(`content-${i}`);
        });
      }

      expect(result.current.historyCount).toBe(50);
      expect(result.current.history[0].content).toBe("content-49");
      expect(result.current.history[49].content).toBe("content-0");
    });

    it("TC-602: 空の履歴からクリア実行", async () => {
      const { result } = renderUseCopyHistoryContext();

      expect(result.current.historyCount).toBe(0);

      // エラーなく空のまま
      await act(async () => {
        result.current.clearHistory();
      });

      expect(result.current.historyCount).toBe(0);
    });

    it("TC-603: 同じ内容を連続コピー", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("same content");
        result.current.addToHistory("same content");
        result.current.addToHistory("same content");
      });

      // 別エントリとして追加される
      expect(result.current.historyCount).toBe(3);
      expect(result.current.history[0].id).not.toBe(
        result.current.history[1].id,
      );
      expect(result.current.history[1].id).not.toBe(
        result.current.history[2].id,
      );
    });
  });

  describe("エラーハンドリングテスト", () => {
    it("TC-611: Clipboard API 失敗時", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockWriteText.mockRejectedValueOnce(new Error("Clipboard error"));

      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("test content");
      });

      await act(async () => {
        await result.current.copyFromHistory(result.current.history[0].id);
      });

      // console.error が出力され、UIは継続
      expect(consoleSpy).toHaveBeenCalled();
      expect(result.current.historyCount).toBe(1);

      consoleSpy.mockRestore();
    });

    it("TC-612: 存在しないID指定で削除", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("test content");
      });

      // 存在しないIDで削除を試みる
      await act(async () => {
        result.current.removeFromHistory("non-existent-id");
      });

      // エラーなく無視され、履歴はそのまま
      expect(result.current.historyCount).toBe(1);
    });
  });

  describe("複数選択テスト", () => {
    it("TC-621: 全項目を選択して一括コピー", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
        result.current.addToHistory("content-3");
      });

      await act(async () => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(3);

      await act(async () => {
        await result.current.copySelectedItems();
      });

      expect(mockWriteText).toHaveBeenCalledWith(
        "content-3\ncontent-2\ncontent-1",
      );
    });

    it("TC-622: 選択状態で新規コピー追加", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
      });

      await act(async () => {
        result.current.toggleSelection(result.current.history[0].id);
      });

      expect(result.current.selectedCount).toBe(1);
      const selectedId = Array.from(result.current.selectedIds)[0];

      // 新規コピー追加
      await act(async () => {
        result.current.addToHistory("content-3");
      });

      // 選択状態は維持される
      expect(result.current.selectedCount).toBe(1);
      expect(result.current.selectedIds.has(selectedId)).toBe(true);
    });

    it("TC-623: 選択中の項目を個別削除", async () => {
      const { result } = renderUseCopyHistoryContext();

      await act(async () => {
        result.current.addToHistory("content-1");
        result.current.addToHistory("content-2");
      });

      await act(async () => {
        result.current.toggleSelection(result.current.history[0].id);
      });

      const selectedId = result.current.history[0].id;
      expect(result.current.selectedIds.has(selectedId)).toBe(true);

      // 選択中の項目を削除
      await act(async () => {
        result.current.removeFromHistory(selectedId);
      });

      // 選択状態も解除される
      expect(result.current.selectedIds.has(selectedId)).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });
  });

  describe("アクセシビリティテスト", () => {
    it("TC-631: useCopyHistoryContext は Provider 外でエラーを投げる", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useCopyHistoryContext());
      }).toThrow(
        "useCopyHistoryContext must be used within CopyHistoryProvider",
      );

      consoleSpy.mockRestore();
    });
  });
});
