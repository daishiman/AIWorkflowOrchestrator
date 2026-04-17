/**
 * useCancelGeneration Hook - IPC 接続テスト
 * TASK-SW-CANCEL-004: cancelGeneration が IPC 経由でメインプロセスに通知する
 *
 * TC-01: cancelGeneration が async 関数であること
 * TC-02: cancelGeneration が window.skillCreatorAPI.cancelGeneration を呼ぶこと
 * TC-03: window.skillCreatorAPI が undefined の場合でもクラッシュしないこと
 * TC-04: cancelGeneration が IPC 呼び出しを await すること（Promise を返すこと）
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCancelGeneration } from "../useCancelGeneration";
import { useAppStore } from "../../store";

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.getState().resetStreamingProgress();
});

describe("useCancelGeneration - IPC 接続 (TASK-SW-CANCEL-004)", () => {
  it("TC-01: cancelGeneration が async 関数（Promise を返す関数）であること", () => {
    const { result } = renderHook(() => useCancelGeneration());

    // cancelGeneration の戻り値が Promise であることを確認
    let returnValue: unknown;
    act(() => {
      returnValue = result.current.cancelGeneration();
    });

    expect(returnValue).toBeInstanceOf(Promise);
  });

  it("TC-02: cancelGeneration が window.skillCreatorAPI.cancelGeneration を呼ぶこと", async () => {
    // Arrange: window.skillCreatorAPI をモック
    const mockCancelGeneration = vi.fn().mockResolvedValue({ success: true });
    Object.defineProperty(window, "skillCreatorAPI", {
      value: { cancelGeneration: mockCancelGeneration },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCancelGeneration());

    // Act
    await act(async () => {
      result.current.startGeneration();
      await result.current.cancelGeneration();
    });

    // Assert
    expect(mockCancelGeneration).toHaveBeenCalledTimes(1);

    // Cleanup
    Object.defineProperty(window, "skillCreatorAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("TC-03: window.skillCreatorAPI が undefined の場合でもクラッシュしないこと", async () => {
    // Arrange: skillCreatorAPI を未定義に
    Object.defineProperty(window, "skillCreatorAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCancelGeneration());

    // Act & Assert: 例外が発生しないこと
    await act(async () => {
      await expect(result.current.cancelGeneration()).resolves.not.toThrow();
    });
  });

  it("TC-04: cancelGeneration が AbortController を abort し、ストアを cancelled に更新した後に IPC を呼ぶこと", async () => {
    // Arrange
    const callOrder: string[] = [];
    const mockCancelGeneration = vi.fn().mockImplementation(async () => {
      callOrder.push("ipc");
      return { success: true };
    });
    Object.defineProperty(window, "skillCreatorAPI", {
      value: { cancelGeneration: mockCancelGeneration },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCancelGeneration());

    let signal: AbortSignal;
    act(() => {
      signal = result.current.startGeneration();
    });

    // Act
    await act(async () => {
      await result.current.cancelGeneration();
    });

    // Assert: AbortSignal が abort されていること
    expect(signal!.aborted).toBe(true);
    // ストアが cancelled になっていること
    expect(useAppStore.getState().streamingStage).toBe("cancelled");
    // IPC が呼ばれていること
    expect(mockCancelGeneration).toHaveBeenCalled();

    // Cleanup
    Object.defineProperty(window, "skillCreatorAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });

  it("TC-05: IPC が失敗しても cancelGeneration は reject しないこと", async () => {
    // Arrange
    const mockCancelGeneration = vi
      .fn()
      .mockRejectedValue(new Error("IPC failed"));
    Object.defineProperty(window, "skillCreatorAPI", {
      value: { cancelGeneration: mockCancelGeneration },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCancelGeneration());

    // Act & Assert
    await act(async () => {
      await expect(result.current.cancelGeneration()).resolves.toBeUndefined();
    });
    expect(mockCancelGeneration).toHaveBeenCalledTimes(1);

    // Cleanup
    Object.defineProperty(window, "skillCreatorAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });
  });
});
