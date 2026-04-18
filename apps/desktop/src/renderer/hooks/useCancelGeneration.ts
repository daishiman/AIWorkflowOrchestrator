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

  const cancelGeneration = useCallback(async (): Promise<void> => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStage("cancelled");

    // Main Process 側のキャンセルをIPCで通知
    const skillCreatorAPI = (
      window as Window & {
        skillCreatorAPI?: { cancelGeneration?: () => Promise<unknown> };
      }
    ).skillCreatorAPI;

    try {
      await skillCreatorAPI?.cancelGeneration?.();
    } catch {
      // local abort を優先し、IPC 側失敗は握りつぶす
    }
  }, [setStage]);

  return { cancelGeneration, startGeneration };
}
