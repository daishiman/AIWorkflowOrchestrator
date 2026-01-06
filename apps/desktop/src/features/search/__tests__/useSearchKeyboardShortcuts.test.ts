/**
 * useSearchKeyboardShortcuts テスト
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSearchKeyboardShortcuts } from "../hooks/useSearchKeyboardShortcuts";
import { useSearchStore } from "../stores/useSearchStore";

describe("useSearchKeyboardShortcuts", () => {
  beforeEach(() => {
    // ストアをリセット
    const { result } = renderHook(() => useSearchStore());
    act(() => {
      result.current.reset();
      result.current.closeSearchPanel();
      result.current.closeWorkspaceSearchPanel();
      if (result.current.showReplace) {
        result.current.toggleReplaceMode();
      }
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createKeyboardEvent = (
    key: string,
    options: Partial<KeyboardEvent> = {},
  ): KeyboardEvent => {
    return new KeyboardEvent("keydown", {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });
  };

  describe("Cmd/Ctrl+F（ファイル内検索）", () => {
    it("Cmd+Fで検索パネルが開く（Mac）", () => {
      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.isSearchPanelOpen).toBe(false);

      const event = createKeyboardEvent("f", { metaKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.isSearchPanelOpen).toBe(true);
    });

    it("Ctrl+Fで検索パネルが開く（Windows/Linux）", () => {
      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.isSearchPanelOpen).toBe(false);

      const event = createKeyboardEvent("f", { ctrlKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.isSearchPanelOpen).toBe(true);
    });

    it("修飾キーなしのFキーでは何も起きない", () => {
      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.isSearchPanelOpen).toBe(false);

      const event = createKeyboardEvent("f");
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.isSearchPanelOpen).toBe(false);
    });
  });

  describe("Cmd/Ctrl+Shift+F（ワークスペース検索）", () => {
    it("Cmd+Shift+Fでワークスペース検索パネルが開く（Mac）", () => {
      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.isWorkspaceSearchPanelOpen).toBe(false);

      const event = createKeyboardEvent("f", { metaKey: true, shiftKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.isWorkspaceSearchPanelOpen).toBe(true);
    });

    it("Ctrl+Shift+Fでワークスペース検索パネルが開く（Windows/Linux）", () => {
      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.isWorkspaceSearchPanelOpen).toBe(false);

      const event = createKeyboardEvent("f", { ctrlKey: true, shiftKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.isWorkspaceSearchPanelOpen).toBe(true);
    });

    it("Shift+Fキーのみでは何も起きない", () => {
      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.isWorkspaceSearchPanelOpen).toBe(false);

      const event = createKeyboardEvent("f", { shiftKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.isWorkspaceSearchPanelOpen).toBe(false);
    });
  });

  describe("Cmd/Ctrl+H（置換モード）", () => {
    it("検索パネルが開いている時にCmd+Hで置換モードがトグルされる", () => {
      // まず検索パネルを開く
      act(() => {
        useSearchStore.getState().openSearchPanel();
      });

      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.showReplace).toBe(false);

      const event = createKeyboardEvent("h", { metaKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.showReplace).toBe(true);
    });

    it("WS検索パネルが開いている時にCtrl+Hで置換モードがトグルされる", () => {
      // まずWS検索パネルを開く
      act(() => {
        useSearchStore.getState().openWorkspaceSearchPanel();
      });

      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.showReplace).toBe(false);

      const event = createKeyboardEvent("h", { ctrlKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.showReplace).toBe(true);
    });

    it("パネルが閉じている時にCmd+Hで検索パネルを開いて置換モードを有効化", () => {
      renderHook(() => useSearchKeyboardShortcuts());
      const store = useSearchStore.getState();

      expect(store.isSearchPanelOpen).toBe(false);
      expect(store.showReplace).toBe(false);

      const event = createKeyboardEvent("h", { metaKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      // 検索パネルが開く
      let updatedStore = useSearchStore.getState();
      expect(updatedStore.isSearchPanelOpen).toBe(true);

      // タイマーを進めて置換モードをトグル
      act(() => {
        vi.runAllTimers();
      });

      updatedStore = useSearchStore.getState();
      expect(updatedStore.showReplace).toBe(true);
    });
  });

  describe("無効化オプション", () => {
    it("enabled=falseの場合はショートカットが動作しない", () => {
      renderHook(() => useSearchKeyboardShortcuts({ enabled: false }));
      const store = useSearchStore.getState();

      expect(store.isSearchPanelOpen).toBe(false);

      const event = createKeyboardEvent("f", { metaKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.isSearchPanelOpen).toBe(false);
    });

    it("enabled=trueの場合はショートカットが動作する", () => {
      renderHook(() => useSearchKeyboardShortcuts({ enabled: true }));
      const store = useSearchStore.getState();

      expect(store.isSearchPanelOpen).toBe(false);

      const event = createKeyboardEvent("f", { metaKey: true });
      act(() => {
        window.dispatchEvent(event);
      });

      const updatedStore = useSearchStore.getState();
      expect(updatedStore.isSearchPanelOpen).toBe(true);
    });
  });

  describe("戻り値", () => {
    it("パネルの開閉状態を返す", () => {
      const { result } = renderHook(() => useSearchKeyboardShortcuts());

      expect(result.current.isSearchPanelOpen).toBe(false);
      expect(result.current.isWorkspaceSearchPanelOpen).toBe(false);

      act(() => {
        useSearchStore.getState().openSearchPanel();
      });

      // Note: hookの戻り値は再レンダリング後に更新される
      const { result: newResult } = renderHook(() =>
        useSearchKeyboardShortcuts(),
      );
      expect(newResult.current.isSearchPanelOpen).toBe(true);
    });
  });

  describe("クリーンアップ", () => {
    it("アンマウント時にイベントリスナーが削除される", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useSearchKeyboardShortcuts());

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function),
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
