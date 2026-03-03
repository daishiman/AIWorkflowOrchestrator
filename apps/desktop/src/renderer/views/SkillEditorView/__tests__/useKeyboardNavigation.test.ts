/**
 * useKeyboardNavigation Hook テスト
 * UT-UI-05A-001: FileTree キーボードナビゲーション
 *
 * Phase 4 - TDD Red
 *
 * テスト方針:
 * - renderHook + act で Hook の状態遷移を検証する
 * - 境界値テスト: focusedIndex の上下限
 * - handleKeyDown でキーイベントを正しくディスパッチする
 *
 * Red 理由: useKeyboardNavigation Hook が未実装のため、
 * import エラーで全テストが失敗する。
 *
 * @module SkillEditorView/__tests__/useKeyboardNavigation.test
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { flattenTree, sampleFileTree } from "./test-utils";
import type { FlatNode } from "./test-utils";

describe("useKeyboardNavigation", () => {
  const flatNodes: FlatNode[] = flattenTree(sampleFileTree);

  const defaultOptions = {
    flatNodes,
    onSelect: vi.fn(),
    onToggleExpand: vi.fn(),
  };

  it("初期状態で focusedIndex が -1 である", () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));
    expect(result.current.focusedIndex).toBe(-1);
  });

  it("moveFocus('down') で focusedIndex が増加する", () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));
    act(() => {
      result.current.moveFocus("down");
    });
    expect(result.current.focusedIndex).toBe(0);
    act(() => {
      result.current.moveFocus("down");
    });
    expect(result.current.focusedIndex).toBe(1);
  });

  it("moveFocus('up') で focusedIndex が減少する", () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));
    // Move to index 2 first
    act(() => {
      result.current.moveFocus("down");
      result.current.moveFocus("down");
      result.current.moveFocus("down");
    });
    act(() => {
      result.current.moveFocus("up");
    });
    expect(result.current.focusedIndex).toBe(1);
  });

  it("下限境界: focusedIndex が 0 未満にならない", () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));
    act(() => {
      result.current.moveFocus("down"); // 0
      result.current.moveFocus("up"); // should stay at 0
    });
    expect(result.current.focusedIndex).toBe(0);
    act(() => {
      result.current.moveFocus("up"); // still 0
    });
    expect(result.current.focusedIndex).toBe(0);
  });

  it("上限境界: focusedIndex がノード数を超過しない", () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));
    // Move beyond the last node
    for (let i = 0; i <= flatNodes.length + 5; i++) {
      act(() => {
        result.current.moveFocus("down");
      });
    }
    expect(result.current.focusedIndex).toBe(flatNodes.length - 1);
  });

  it("handleKeyDown でキーイベントを正しく処理する", () => {
    const { result } = renderHook(() => useKeyboardNavigation(defaultOptions));
    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    act(() => {
      result.current.handleKeyDown(event);
    });
    expect(result.current.focusedIndex).toBe(0);
  });
});
