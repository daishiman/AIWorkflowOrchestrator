/**
 * @file useCancelGeneration.test.ts
 * @description useCancelGeneration Hook ユニットテスト
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 *
 * P9 準拠: beforeEach でストアリセット
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

describe("useCancelGeneration", () => {
  it("startGeneration が AbortSignal を返す", () => {
    const { result } = renderHook(() => useCancelGeneration());

    let signal: AbortSignal;
    act(() => {
      signal = result.current.startGeneration();
    });

    expect(signal!).toBeInstanceOf(AbortSignal);
    expect(signal!.aborted).toBe(false);
  });

  it("cancelGeneration が AbortSignal を abort する", () => {
    const { result } = renderHook(() => useCancelGeneration());

    let signal: AbortSignal;
    act(() => {
      signal = result.current.startGeneration();
    });

    act(() => {
      result.current.cancelGeneration();
    });

    expect(signal!.aborted).toBe(true);
    expect(mockCancelGeneration).toHaveBeenCalledTimes(1);
  });

  it("cancelGeneration がストアを cancelled に更新する", () => {
    const { result } = renderHook(() => useCancelGeneration());

    act(() => {
      result.current.startGeneration();
    });

    act(() => {
      result.current.cancelGeneration();
    });

    expect(useAppStore.getState().streamingStage).toBe("cancelled");
  });

  it("startGeneration を呼ばずに cancelGeneration を呼んでもクラッシュしない", () => {
    const { result } = renderHook(() => useCancelGeneration());

    act(() => {
      result.current.cancelGeneration();
    });

    expect(useAppStore.getState().streamingStage).toBe("cancelled");
  });
});
