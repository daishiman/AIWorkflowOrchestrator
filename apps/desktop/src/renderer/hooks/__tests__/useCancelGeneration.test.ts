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

beforeEach(() => {
  vi.clearAllMocks();
  useAppStore.getState().resetStreamingProgress();

  Object.defineProperty(window, "skillCreatorAPI", {
    value: undefined,
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

  it("cancelGeneration が AbortSignal を abort する", async () => {
    const { result } = renderHook(() => useCancelGeneration());

    let signal: AbortSignal;
    act(() => {
      signal = result.current.startGeneration();
    });

    await act(async () => {
      await result.current.cancelGeneration();
    });

    expect(signal!.aborted).toBe(true);
  });

  it("cancelGeneration がストアを cancelled に更新する", async () => {
    const { result } = renderHook(() => useCancelGeneration());

    act(() => {
      result.current.startGeneration();
    });

    await act(async () => {
      await result.current.cancelGeneration();
    });

    expect(useAppStore.getState().streamingStage).toBe("cancelled");
  });

  it("startGeneration を呼ばずに cancelGeneration を呼んでもクラッシュしない", async () => {
    const { result } = renderHook(() => useCancelGeneration());

    await act(async () => {
      await result.current.cancelGeneration();
    });

    expect(useAppStore.getState().streamingStage).toBe("cancelled");
  });
});
