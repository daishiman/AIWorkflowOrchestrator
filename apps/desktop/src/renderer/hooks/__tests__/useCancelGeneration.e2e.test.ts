/**
 * @file useCancelGeneration.e2e.test.ts
 * @description useCancelGeneration E2E 統合テスト（IPC モック境界検証）
 * @task TASK-SW-CANCEL-004
 *
 * 既存 useCancelGeneration.test.ts との違い:
 * - window.skillCreatorAPI の cancelGeneration が実際に invoke されるかを確認
 * - startGeneration → cancelGeneration フロー全体を E2E として検証
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCancelGeneration } from "../useCancelGeneration";
import { useAppStore } from "../../store";

const mockCancelGeneration = vi.fn().mockResolvedValue({ success: true });

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.getState().resetStreamingProgress();

  Object.defineProperty(window, "skillCreatorAPI", {
    value: { cancelGeneration: mockCancelGeneration },
    writable: true,
    configurable: true,
  });
});

describe("useCancelGeneration E2E", () => {
  it("TC-E2E-01: cancelGeneration() 呼び出し時に window.skillCreatorAPI.cancelGeneration が invoke される", async () => {
    const { result } = renderHook(() => useCancelGeneration());

    await act(async () => {
      await result.current.cancelGeneration();
    });

    expect(mockCancelGeneration).toHaveBeenCalledTimes(1);
  });

  it("TC-E2E-02: startGeneration() → cancelGeneration() フローで signal.aborted が true", async () => {
    const { result } = renderHook(() => useCancelGeneration());

    let signal: AbortSignal;
    act(() => {
      signal = result.current.startGeneration();
    });

    expect(signal!.aborted).toBe(false);

    await act(async () => {
      await result.current.cancelGeneration();
    });

    expect(signal!.aborted).toBe(true);
    expect(mockCancelGeneration).toHaveBeenCalledTimes(1);
  });

  it("TC-E2E-03: cancelGeneration() 後に Store の streamingStage が cancelled", async () => {
    const { result } = renderHook(() => useCancelGeneration());

    act(() => {
      result.current.startGeneration();
    });

    await act(async () => {
      await result.current.cancelGeneration();
    });

    expect(useAppStore.getState().streamingStage).toBe("cancelled");
  });

  it("TC-E2E-04: skillCreatorAPI が undefined でも cancelGeneration() が例外なく完了する", async () => {
    Object.defineProperty(window, "skillCreatorAPI", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCancelGeneration());

    await expect(
      act(async () => {
        await result.current.cancelGeneration();
      }),
    ).resolves.not.toThrow();

    expect(useAppStore.getState().streamingStage).toBe("cancelled");
  });
});
