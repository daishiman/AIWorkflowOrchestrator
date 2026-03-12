import { useStore } from "@/renderer/store";
import type { LLMProviderId } from "@repo/shared/types/llm/schemas";

export interface UseStreamingChatState {
  isStreaming: boolean;
  content: string;
  error: { code: string; message: string; retryable: boolean } | null;
}

export interface UseStreamingChatActions {
  startStream: (request: {
    content: string;
    providerId?: LLMProviderId | null;
    modelId?: string | null;
    temperature?: number;
    maxTokens?: number;
  }) => Promise<void>;
  cancelStream: () => Promise<void>;
  retryLastStream: (request?: {
    providerId?: LLMProviderId | null;
    modelId?: string | null;
    temperature?: number;
    maxTokens?: number;
  }) => Promise<void>;
}

export function useStreamingChat(): {
  state: UseStreamingChatState;
  actions: UseStreamingChatActions;
} {
  const isStreaming = useStore((state) => state.isStreaming);
  const streamingContent = useStore((state) => state.streamingContent);
  const streamingError = useStore((state) => state.streamingError);
  const sendMessage = useStore((state) => state.sendMessage);
  const abortStreaming = useStore((state) => state.abortStreaming);
  const retryLastMessage = useStore((state) => state.retryLastMessage);

  return {
    state: {
      isStreaming,
      content: streamingContent,
      error: streamingError,
    },
    actions: {
      startStream: async (request) => {
        await sendMessage(request.content, {
          providerId: request.providerId,
          modelId: request.modelId,
          temperature: request.temperature,
          maxTokens: request.maxTokens,
        });
      },
      cancelStream: abortStreaming,
      retryLastStream: retryLastMessage,
    },
  };
}

export default useStreamingChat;
