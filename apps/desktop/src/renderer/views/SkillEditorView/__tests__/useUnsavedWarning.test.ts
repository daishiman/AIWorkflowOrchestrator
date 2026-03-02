import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUnsavedWarning } from "../hooks/useUnsavedWarning";

describe("useUnsavedWarning", () => {
  const mockSave = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // UW-01
  it("未変更時は requestNavigation が true を返しダイアログを開かない", () => {
    const { result } = renderHook(() => useUnsavedWarning(false, mockSave));

    let canNavigate: boolean;
    act(() => {
      canNavigate = result.current.requestNavigation("other-file.md");
    });

    expect(canNavigate!).toBe(true);
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.pendingPath).toBeNull();
  });

  // UW-02
  it("変更ありの場合 requestNavigation が false を返しダイアログを開く", () => {
    const { result } = renderHook(() => useUnsavedWarning(true, mockSave));

    let canNavigate: boolean;
    act(() => {
      canNavigate = result.current.requestNavigation("other-file.md");
    });

    expect(canNavigate!).toBe(false);
    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.pendingPath).toBe("other-file.md");
  });

  // UW-03
  it("confirmSave で onSave を呼び出しダイアログを閉じる", async () => {
    const { result } = renderHook(() => useUnsavedWarning(true, mockSave));

    // ダイアログを開く
    act(() => {
      result.current.requestNavigation("other-file.md");
    });
    expect(result.current.isDialogOpen).toBe(true);

    // 保存して続行
    await act(async () => {
      await result.current.confirmSave();
    });

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.pendingPath).toBeNull();
  });

  // UW-04
  it("confirmDiscard でダイアログを閉じ pendingPath をクリアする", () => {
    const { result } = renderHook(() => useUnsavedWarning(true, mockSave));

    // ダイアログを開く
    act(() => {
      result.current.requestNavigation("other-file.md");
    });
    expect(result.current.isDialogOpen).toBe(true);

    // 破棄して続行
    act(() => {
      result.current.confirmDiscard();
    });

    expect(mockSave).not.toHaveBeenCalled();
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.pendingPath).toBeNull();
  });

  // UW-05
  it("cancelNavigation でダイアログを閉じ pendingPath をクリアする", () => {
    const { result } = renderHook(() => useUnsavedWarning(true, mockSave));

    // ダイアログを開く
    act(() => {
      result.current.requestNavigation("other-file.md");
    });

    // キャンセル
    act(() => {
      result.current.cancelNavigation();
    });

    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.pendingPath).toBeNull();
  });
});
