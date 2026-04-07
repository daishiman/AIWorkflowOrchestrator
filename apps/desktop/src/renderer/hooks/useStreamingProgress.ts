/**
 * @file useStreamingProgress.ts
 * @description IPC SKILL_CREATOR_PROGRESS リスナー管理 Hook
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 *
 * P5 対策: useEffect cleanup で safeOn の返却関数を呼び出しリスナー解除
 * P31 対策: 個別セレクタのみ使用
 */

import { useEffect } from "react";
import {
  useStreamingStage,
  useStreamingPercent,
  useStreamingMessage,
  useStreamingPreviewContent,
  useStreamingGenerationError,
  useUpdateStreamingProgress,
  useResetStreamingProgress,
  useSetStreamingStage,
  useSetStreamingError,
} from "../store";
import type {
  StreamingGenerationStage,
  StreamingGenerationErrorCode,
} from "../store/slices/generationProgressSlice";

// ---- IPC phase -> stage マッピング ----

const PHASE_TO_STAGE: Record<string, StreamingGenerationStage> = {
  planning: "planning",
  "generating-skill": "generating-skill",
  "generating-agents": "generating-agents",
  validating: "validating",
  done: "done",
};

function mapPhaseToStage(phase: string): StreamingGenerationStage {
  return PHASE_TO_STAGE[phase] ?? "planning";
}

// ---- Hook ----

export interface UseStreamingProgressReturn {
  stage: StreamingGenerationStage;
  percent: number;
  message: string;
  previewContent: string | null;
  error:
    | import("../store/slices/generationProgressSlice").StreamingGenerationError
    | null;
  isGenerating: boolean;
}

const ACTIVE_STAGES: StreamingGenerationStage[] = [
  "planning",
  "generating-skill",
  "generating-agents",
  "validating",
];

type StreamingProgressApi = {
  onProgress?: (
    callback: (progress: {
      phase: string;
      percentage: number;
      message: string;
    }) => void,
  ) => () => void;
};

function getSkillCreatorApi(): StreamingProgressApi | null {
  const runtimeWindow = window as Window & {
    skillCreatorAPI?: StreamingProgressApi;
    electronAPI?: { skillCreator?: StreamingProgressApi };
  };

  return (
    runtimeWindow.skillCreatorAPI ??
    runtimeWindow.electronAPI?.skillCreator ??
    null
  );
}

export function useStreamingProgress(): UseStreamingProgressReturn {
  const stage = useStreamingStage();
  const percent = useStreamingPercent();
  const message = useStreamingMessage();
  const previewContent = useStreamingPreviewContent();
  const error = useStreamingGenerationError();
  const updateProgress = useUpdateStreamingProgress();
  const setStage = useSetStreamingStage();
  const setError = useSetStreamingError();
  const resetProgress = useResetStreamingProgress();

  useEffect(() => {
    const api = getSkillCreatorApi();
    if (!api?.onProgress) return;

    // P5 対策: safeOn が返すクリーンアップ関数を保持
    const cleanup = api.onProgress((progress) => {
      // エラーチェック
      if (progress.phase === "error") {
        const errorCode = parseErrorCode(progress.message);
        setStage("error");
        setError({ code: errorCode, message: progress.message });
        return;
      }

      const mappedStage = mapPhaseToStage(progress.phase);
      updateProgress({
        stage: mappedStage,
        percent: progress.percentage,
        message: progress.message,
      });
    });

    return () => {
      cleanup();
      resetProgress();
    };
  }, [updateProgress, setStage, setError, resetProgress]);

  return {
    stage,
    percent,
    message,
    previewContent,
    error,
    isGenerating: ACTIVE_STAGES.includes(stage),
  };
}

// ---- Helper ----

function parseErrorCode(message: string): StreamingGenerationErrorCode {
  if (message.includes("API_KEY") || message.includes("api key")) {
    return "API_KEY_NOT_SET";
  }
  if (message.includes("NETWORK") || message.includes("network")) {
    return "NETWORK_ERROR";
  }
  return "LLM_ERROR";
}
