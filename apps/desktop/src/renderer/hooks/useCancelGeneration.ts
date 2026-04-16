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
    await window.skillCreatorAPI?.cancelGeneration?.();
  }, [setStage]);

  return { cancelGeneration, startGeneration };
}
