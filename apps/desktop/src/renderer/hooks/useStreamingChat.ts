/**
 * @file useStreamingChat Hook
 * @description LLMストリーミングチャット用カスタムフック
 * @feature llm-streaming-response
 */

import { useCallback, useEffect, useRef } from "react";
import { useStore } from "@/renderer/store";
import type { LLMStreamChunk } from "@/preload/types";
import type {
  LLMError,
  LLMChatRequestInput,
} from "@repo/shared/types/llm/schemas";
import { LLMChatRequestSchema } from "@repo/shared/types/llm/schemas";

/**
 * ストリーミングチャットの状態
 */
export interface UseStreamingChatState {
  /** ストリーミング中かどうか */
  isStreaming: boolean;
  /** 現在のストリーミングコンテンツ */
  content: string;
  /** ストリーミングエラー */
  error: { code: string; message: string; retryable: boolean } | null;
}

/**
 * ストリーミングチャットのアクション
 */
export interface UseStreamingChatActions {
  /** ストリーミングチャットを開始 */
  startStream: (request: LLMChatRequestInput) => Promise<void>;
  /** ストリーミングをキャンセル */
  cancelStream: () => Promise<void>;
}

/**
 * useStreamingChat フック
 *
 * LLMストリーミングチャット機能を提供するカスタムフック。
 * IPC通信とストア状態管理を抽象化します。
 *
 * @example
 * ```tsx
 * const { state, actions } = useStreamingChat();
 *
 * const handleSend = async () => {
 *   await actions.startStream({
 *     providerId: 'openai',
 *     modelId: 'gpt-4o',
 *     messages: [{ role: 'user', content: 'Hello' }],
 *     stream: true,
 *   });
 * };
 * ```
 */
export function useStreamingChat(): {
  state: UseStreamingChatState;
  actions: UseStreamingChatActions;
} {
  const {
    isStreaming,
    streamingContent,
    currentStreamId,
    streamingError,
    startStreaming,
    appendStreamChunk,
    endStreaming,
    cancelStreaming,
    setStreamingError,
  } = useStore();

  // Store cleanup functions
  const cleanupFunctionsRef = useRef<Array<() => void>>([]);

  /**
   * IPC イベントリスナーをセットアップ
   */
  useEffect(() => {
    if (typeof window === "undefined" || !window.electronAPI?.llm) {
      return;
    }

    const llmApi = window.electronAPI.llm;

    // チャンクイベントハンドラー
    const cleanupChunk = llmApi.onStreamChunk((chunk: LLMStreamChunk) => {
      if (chunk.delta?.content) {
        appendStreamChunk(chunk.delta.content);
      }
    });

    // 完了イベントハンドラー
    const cleanupEnd = llmApi.onStreamEnd(() => {
      endStreaming();
    });

    // エラーイベントハンドラー
    const cleanupError = llmApi.onStreamError((error: LLMError) => {
      setStreamingError({
        code: error.code,
        message: error.message,
        retryable: error.retryable,
      });
    });

    cleanupFunctionsRef.current = [cleanupChunk, cleanupEnd, cleanupError];

    return () => {
      cleanupFunctionsRef.current.forEach((cleanup) => cleanup());
      cleanupFunctionsRef.current = [];
    };
  }, [appendStreamChunk, endStreaming, setStreamingError]);

  /**
   * ストリーミングチャットを開始
   */
  const startStream = useCallback(
    async (request: LLMChatRequestInput) => {
      if (typeof window === "undefined" || !window.electronAPI?.llm) {
        setStreamingError({
          code: "NO_IPC",
          message: "IPC通信が利用できません",
          retryable: false,
        });
        return;
      }

      try {
        // Apply defaults using schema
        const parsedRequest = LLMChatRequestSchema.parse(request);
        const { requestId } =
          await window.electronAPI.llm.streamChat(parsedRequest);
        startStreaming(requestId);
      } catch (error) {
        setStreamingError({
          code: "STREAM_START_ERROR",
          message:
            error instanceof Error ? error.message : "ストリーム開始エラー",
          retryable: true,
        });
      }
    },
    [startStreaming, setStreamingError],
  );

  /**
   * ストリーミングをキャンセル
   */
  const cancelStreamAction = useCallback(async () => {
    if (typeof window === "undefined" || !window.electronAPI?.llm) {
      return;
    }

    if (currentStreamId) {
      try {
        await window.electronAPI.llm.cancelStream(currentStreamId);
        cancelStreaming();
      } catch (error) {
        console.error("Failed to cancel stream:", error);
      }
    }
  }, [currentStreamId, cancelStreaming]);

  return {
    state: {
      isStreaming,
      content: streamingContent,
      error: streamingError,
    },
    actions: {
      startStream,
      cancelStream: cancelStreamAction,
    },
  };
}

export default useStreamingChat;
