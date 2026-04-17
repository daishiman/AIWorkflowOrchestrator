/**
 * @file useCancelGeneration.ts
 * @description 生成キャンセル Hook
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 */

import { useCallback, useRef } from "react";
import { useSetStreamingStage } from "../store";

export interface UseCancelGenerationReturn {
  cancelGeneration: () => Promise<void>;
  startGeneration: () => AbortSignal;
}

export function useCancelGeneration(): UseCancelGenerationReturn {
  const abortControllerRef = useRef<AbortController | null>(null);
  const setStage = useSetStreamingStage();

  const startGeneration = useCallback((): AbortSignal => {
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  const cancelGeneration = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStage("cancelled");
    // TASK-SW-CANCEL-004: IPC 経由でメインプロセスにキャンセルを通知
    try {
      await window.skillCreatorAPI?.cancelGeneration?.();
    } catch (error) {
      console.warn("[useCancelGeneration] cancelGeneration IPC failed", error);
    }
  }, [setStage]);

  return { cancelGeneration, startGeneration };
}
