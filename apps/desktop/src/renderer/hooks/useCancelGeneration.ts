/**
 * @file useCancelGeneration.ts
 * @description 生成キャンセル Hook
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 */

import { useCallback, useRef } from "react";
import { useSetStreamingStage } from "../store";

export interface UseCancelGenerationReturn {
  cancelGeneration: () => void;
  startGeneration: () => AbortSignal;
}

export function useCancelGeneration(): UseCancelGenerationReturn {
  const abortControllerRef = useRef<AbortController | null>(null);
  const setStage = useSetStreamingStage();

  const startGeneration = useCallback((): AbortSignal => {
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  }, []);

  const cancelGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStage("cancelled");

    // Main Process 側のキャンセルをIPCで通知
    (
      window as Window & {
        skillCreatorAPI?: { cancelGeneration: () => Promise<unknown> };
      }
    ).skillCreatorAPI
      ?.cancelGeneration()
      .catch(() => {});
  }, [setStage]);

  return { cancelGeneration, startGeneration };
}
