/**
 * @file generationProgressSlice.ts
 * @description ストリーミング進捗状態管理スライス
 * @task TASK-SC-07-STREAMING-PROGRESS-UI
 *
 * P31 対策: 個別セレクタのみ（store/index.ts 側で定義）
 * P48 対策: 配列セレクタなし → useShallow 不要
 */

import { StateCreator } from "zustand";

// ---- 型定義 ----

export type StreamingGenerationStage =
  | "idle"
  | "planning"
  | "generating-skill"
  | "generating-agents"
  | "validating"
  | "done"
  | "error"
  | "cancelled";

export type StreamingGenerationErrorCode =
  | "API_KEY_NOT_SET"
  | "LLM_ERROR"
  | "NETWORK_ERROR";

export interface StreamingGenerationError {
  code: StreamingGenerationErrorCode;
  message: string;
}

// ---- Slice Interface ----

export interface GenerationProgressSlice {
  // State
  streamingStage: StreamingGenerationStage;
  streamingPercent: number;
  streamingMessage: string;
  streamingPreviewContent: string | null;
  genProgressError: StreamingGenerationError | null;

  // Actions
  setStreamingStage: (stage: StreamingGenerationStage) => void;
  setStreamingPercent: (percent: number) => void;
  setStreamingMessage: (message: string) => void;
  setStreamingPreviewContent: (content: string | null) => void;
  setGenProgressError: (error: StreamingGenerationError | null) => void;
  updateStreamingProgress: (progress: {
    stage: StreamingGenerationStage;
    percent: number;
    message: string;
    previewContent?: string | null;
  }) => void;
  resetStreamingProgress: () => void;
}

// ---- Initial State ----

const INITIAL_STATE = {
  streamingStage: "idle" as StreamingGenerationStage,
  streamingPercent: 0,
  streamingMessage: "",
  streamingPreviewContent: null as string | null,
  genProgressError: null as StreamingGenerationError | null,
};

// ---- Slice Creator ----

export const createGenerationProgressSlice: StateCreator<
  GenerationProgressSlice,
  [],
  [],
  GenerationProgressSlice
> = (set) => ({
  ...INITIAL_STATE,

  setStreamingStage: (stage) => set({ streamingStage: stage }),
  setStreamingPercent: (percent) => set({ streamingPercent: percent }),
  setStreamingMessage: (message) => set({ streamingMessage: message }),
  setStreamingPreviewContent: (content) =>
    set({ streamingPreviewContent: content }),
  setGenProgressError: (error) => set({ genProgressError: error }),

  updateStreamingProgress: (progress) =>
    set({
      streamingStage: progress.stage,
      streamingPercent: progress.percent,
      streamingMessage: progress.message,
      ...(progress.previewContent !== undefined
        ? { streamingPreviewContent: progress.previewContent }
        : {}),
    }),

  resetStreamingProgress: () => set({ ...INITIAL_STATE }),
});
