import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LLMError } from "@repo/shared/types/llm/schemas";
import type { SelectedFile } from "@repo/shared/schemas";
import type { FileNode } from "@/preload/types";
import {
  useAddFiles,
  useAppStore,
  useFolderFileTrees,
  useRemoveFile,
  useSelectedFiles,
} from "@/renderer/store";
import {
  deriveModelSelectionBlockedReason,
  type ModelSelectionBlockedReason,
} from "@/renderer/guidance/modelSelectionGuidance";
import { createSelectedFile } from "../workspaceFileSelection";
import {
  useWorkspaceMentionQuery,
  type WorkspaceMentionCandidate,
} from "./useWorkspaceMentionQuery";
import { mapLLMErrorToStreamingError } from "./mapLLMErrorToStreamingError";
import type { StreamingErrorState } from "../types";

export interface WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface WorkspaceChatController {
  messages: WorkspaceChatMessage[];
  input: string;
  isSending: boolean;
  isStreaming: boolean;
  streamContent: string;
  errorMessage: string | null;
  selectedFiles: SelectedFile[];
  selectedFilePath: string | null;
  selectedModelId: string | null;
  blockedReason: ModelSelectionBlockedReason | null;
  mention: ReturnType<typeof useWorkspaceMentionQuery>;
  pendingCursorPosition: number | null;
  setInputValue: (nextValue: string, cursorPosition?: number) => void;
  clearPendingCursorPosition: () => void;
  applySuggestion: (text: string) => void;
  sendMessage: () => Promise<void>;
  cancelStream: () => Promise<void>;
  removeSelectedFile: (id: string) => void;
  attachSelectedFile: () => void;
  handleComposerKeyDown: (
    event: Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">,
  ) => Promise<void>;
  selectMentionAtIndex: (index?: number) => Promise<void>;
  openMentionPreviewAtIndex: (index?: number) => void;
  streamingError: StreamingErrorState | null;
  retryLastMessage: () => Promise<void>;
  dismissStreamingError: () => void;
}

const WORKSPACE_CHAT_USER_ID = "workspace-user";
const SUGGESTIONS = [
  "このファイルの責務を3行で要約して",
  "バグになりそうな箇所を優先度付きで指摘して",
  "最小変更でリファクタリング案を作って",
] as const;

function flattenFiles(nodes: FileNode[]): WorkspaceMentionCandidate[] {
  const result: WorkspaceMentionCandidate[] = [];

  for (const node of nodes) {
    if (node.type === "file") {
      result.push({
        path: node.path,
        name: node.name,
      });
      continue;
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      result.push(...flattenFiles(node.children));
    }
  }

  return result;
}

async function readSelectedFile(filePath: string): Promise<{
  size: number;
  lastModified: Date;
} | null> {
  const response = await window.electronAPI.file.read({ filePath });
  if (!response.success || !response.data) {
    return null;
  }

  return {
    size: response.data.metadata.size,
    lastModified: new Date(response.data.metadata.lastModified),
  };
}

async function buildFileContextBlock(
  selectedFiles: SelectedFile[],
): Promise<string> {
  if (selectedFiles.length === 0) {
    return "";
  }

  const blocks: string[] = [];
  for (const selectedFile of selectedFiles.slice(0, 3)) {
    const response = await window.electronAPI.file.read({
      filePath: selectedFile.path,
    });

    if (!response.success || !response.data) {
      throw new Error(`背景情報の読み込みに失敗しました: ${selectedFile.path}`);
    }

    blocks.push(
      [`### ${selectedFile.name}`, "```", response.data.content, "```"].join(
        "\n",
      ),
    );
  }

  if (blocks.length === 0) {
    return "";
  }

  return [
    "以下は現在のワークスペース背景情報です。回答時に参照してください。",
    ...blocks,
  ].join("\n\n");
}

function buildChatRequest(params: {
  input: string;
  contextBlock: string;
  selectedModelId: string;
  selectedProviderId: "openai" | "anthropic" | "google" | "xai" | null;
}) {
  const body =
    params.contextBlock.length > 0
      ? `${params.contextBlock}\n\nユーザーの依頼:\n${params.input}`
      : params.input;

  return {
    modelId: params.selectedModelId,
    providerId: params.selectedProviderId ?? undefined,
    temperature: 0.2,
    stream: true,
    messages: [
      {
        role: "user" as const,
        content: body,
      },
    ],
  };
}

export function useWorkspaceChatController(params: {
  selectedFilePath: string | null;
  onAttachSelectedFile: (
    filePath: string,
  ) => Promise<{ success: boolean; errorMessage?: string }>;
  onOpenPreviewFromMention: (filePath: string) => void;
}): WorkspaceChatController {
  const { selectedFilePath, onAttachSelectedFile, onOpenPreviewFromMention } =
    params;

  const selectedFiles = useSelectedFiles();
  const addFiles = useAddFiles();
  const removeFile = useRemoveFile();
  const folderFileTrees = useFolderFileTrees();

  const selectedProviderId = useAppStore((state) => state.selectedProviderId);
  const selectedModelId = useAppStore((state) => state.selectedModelId);
  const blockedReason = deriveModelSelectionBlockedReason({
    selectedProviderId,
    selectedModelId,
  });

  const [messages, setMessages] = useState<WorkspaceChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [pendingCursorPosition, setPendingCursorPosition] = useState<
    number | null
  >(null);
  const [isSending, setIsSending] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [streamingError, setStreamingError] =
    useState<StreamingErrorState | null>(null);

  const streamRequestIdRef = useRef<string | null>(null);
  const streamContentRef = useRef("");
  const isStreamingRef = useRef(false);
  const isSendingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  useEffect(() => {
    streamContentRef.current = streamContent;
  }, [streamContent]);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    isSendingRef.current = isSending;
  }, [isSending]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const mentionCandidates = useMemo(() => {
    const flattened = Array.from(folderFileTrees.values()).flatMap((nodes) =>
      flattenFiles(nodes),
    );

    const dedupedByPath = new Map<string, WorkspaceMentionCandidate>();
    for (const candidate of flattened) {
      if (!dedupedByPath.has(candidate.path)) {
        dedupedByPath.set(candidate.path, candidate);
      }
    }

    return Array.from(dedupedByPath.values());
  }, [folderFileTrees]);

  const mention = useWorkspaceMentionQuery({
    input,
    cursorPosition,
    candidates: mentionCandidates,
  });

  const applySuggestion = useCallback((text: string) => {
    setInput(text);
    setCursorPosition(text.length);
    setPendingCursorPosition(text.length);
  }, []);

  const setInputValue = useCallback(
    (nextValue: string, nextCursor?: number) => {
      setInput(nextValue);
      setCursorPosition(nextCursor ?? nextValue.length);
    },
    [],
  );

  const clearPendingCursorPosition = useCallback(() => {
    setPendingCursorPosition(null);
  }, []);

  const attachContextFile = useCallback(
    async (filePath: string): Promise<boolean> => {
      try {
        const metadata = await readSelectedFile(filePath);
        if (!metadata) {
          setErrorMessage(`背景情報の読み込みに失敗しました: ${filePath}`);
          return false;
        }

        addFiles([
          createSelectedFile({
            filePath,
            size: metadata.size,
            lastModified: metadata.lastModified,
          }),
        ]);
        setErrorMessage(null);

        return true;
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "背景情報の読み込みに失敗しました",
        );
        return false;
      }
    },
    [addFiles],
  );

  const insertMention = useCallback(
    async (candidate: WorkspaceMentionCandidate): Promise<void> => {
      if (mention.mentionStart < 0 || mention.mentionEnd < 0) {
        return;
      }

      const mentionText = `@${candidate.name} `;
      const nextInput =
        input.slice(0, mention.mentionStart) +
        mentionText +
        input.slice(mention.mentionEnd);

      const nextCursor = mention.mentionStart + mentionText.length;
      setInput(nextInput);
      setCursorPosition(nextCursor);
      setPendingCursorPosition(nextCursor);
      mention.reset();

      const attached = await attachContextFile(candidate.path);
      if (attached) {
        onOpenPreviewFromMention(candidate.path);
      }
    },
    [attachContextFile, input, mention, onOpenPreviewFromMention],
  );

  const selectMentionAtIndex = useCallback(
    async (index?: number) => {
      const targetIndex = index ?? mention.highlightedIndex;
      const candidate = mention.options[targetIndex];
      if (!candidate) {
        return;
      }
      await insertMention(candidate);
    },
    [insertMention, mention.highlightedIndex, mention.options],
  );

  const openMentionPreviewAtIndex = useCallback(
    (index?: number) => {
      const targetIndex = index ?? mention.highlightedIndex;
      const candidate = mention.options[targetIndex];
      if (!candidate) {
        return;
      }
      onOpenPreviewFromMention(candidate.path);
    },
    [mention.highlightedIndex, mention.options, onOpenPreviewFromMention],
  );

  const ensureConversation = useCallback(async (): Promise<string> => {
    if (conversationIdRef.current) {
      return conversationIdRef.current;
    }

    const title = input.trim().slice(0, 32) || "Workspace Chat";
    const response = await window.conversationAPI.create({
      userId: WORKSPACE_CHAT_USER_ID,
      title,
    });

    if (!response.success || !response.data) {
      const message = !response.success
        ? response.error.message
        : "会話作成に失敗しました";
      throw new Error(message);
    }

    conversationIdRef.current = response.data.id;
    setConversationId(response.data.id);
    return response.data.id;
  }, [input]);

  const sendMessageCore = useCallback(
    async (
      content: string,
      options: {
        addToMessages: boolean;
        persistUserMessage: boolean;
      },
    ) => {
      if (isSendingRef.current || isStreamingRef.current || !selectedModelId) {
        return;
      }

      setErrorMessage(null);
      setStreamingError(null);
      isSendingRef.current = true;
      setIsSending(true);

      lastUserMessageRef.current = content;

      if (options.addToMessages) {
        const userMessage: WorkspaceChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content,
          timestamp: new Date().toISOString(),
        };
        setMessages((previous) => [...previous, userMessage]);
      }

      try {
        const currentConversationId = await ensureConversation();

        if (options.persistUserMessage) {
          const addUserMessageResponse =
            await window.conversationAPI.addMessage({
              sessionId: currentConversationId,
              message: {
                role: "user",
                content,
              },
            });

          if (!addUserMessageResponse.success) {
            throw new Error(
              addUserMessageResponse.error?.message ??
                "ユーザーメッセージ保存に失敗しました",
            );
          }
        }

        const contextBlock = await buildFileContextBlock(selectedFiles);
        const request = buildChatRequest({
          input: content,
          contextBlock,
          selectedModelId,
          selectedProviderId,
        });

        streamContentRef.current = "";
        setStreamContent("");
        isStreamingRef.current = true;
        setIsStreaming(true);
        const streamResult = await window.electronAPI.llm.streamChat(request);
        streamRequestIdRef.current = streamResult.requestId;
      } catch (error) {
        isStreamingRef.current = false;
        setIsStreaming(false);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "メッセージ送信に失敗しました",
        );
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [ensureConversation, selectedFiles, selectedModelId, selectedProviderId],
  );

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setInput("");
    setCursorPosition(0);
    setPendingCursorPosition(0);

    await sendMessageCore(trimmed, {
      addToMessages: true,
      persistUserMessage: true,
    });
  }, [input, sendMessageCore]);

  const persistAssistantMessage = useCallback(
    async (content: string) => {
      const currentConversationId = conversationIdRef.current;
      if (!currentConversationId) {
        return;
      }

      const response = await window.conversationAPI.addMessage({
        sessionId: currentConversationId,
        message: {
          role: "assistant",
          content,
          llmProvider: selectedProviderId ?? undefined,
          llmModel: selectedModelId ?? undefined,
        },
      });

      if (!response.success) {
        throw new Error(
          response.error?.message ?? "assistant message 保存に失敗しました",
        );
      }
    },
    [selectedProviderId, selectedModelId],
  );

  const cancelStream = useCallback(async () => {
    const requestId = streamRequestIdRef.current;
    if (!requestId) {
      return;
    }

    await window.electronAPI.llm.cancelStream(requestId);
    streamRequestIdRef.current = null;
    isStreamingRef.current = false;
    setIsStreaming(false);
    streamContentRef.current = "";
    setStreamContent("");
    setErrorMessage(null);
  }, []);

  const handleComposerKeyDown = useCallback(
    async (
      event: Pick<KeyboardEvent, "key" | "shiftKey" | "preventDefault">,
    ) => {
      if (mention.isOpen && event.key === "ArrowDown") {
        event.preventDefault();
        mention.moveHighlight(1);
        return;
      }

      if (mention.isOpen && event.key === "ArrowUp") {
        event.preventDefault();
        mention.moveHighlight(-1);
        return;
      }

      if (mention.isOpen && (event.key === "Enter" || event.key === "Tab")) {
        event.preventDefault();
        await selectMentionAtIndex();
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        await sendMessage();
      }
    },
    [mention, selectMentionAtIndex, sendMessage],
  );

  useEffect(() => {
    if (!window.electronAPI?.llm) {
      return;
    }

    const disposeChunk = window.electronAPI.llm.onStreamChunk((chunk) => {
      if (!isStreamingRef.current) {
        return;
      }
      const delta = chunk.delta?.content;
      if (delta) {
        streamContentRef.current = streamContentRef.current + delta;
        setStreamContent((previous) => previous + delta);
      }
    });

    const disposeEnd = window.electronAPI.llm.onStreamEnd(() => {
      if (!isStreamingRef.current) {
        return;
      }

      const assistantText = streamContentRef.current.trim();
      streamRequestIdRef.current = null;
      isStreamingRef.current = false;
      setIsStreaming(false);
      streamContentRef.current = "";
      setStreamContent("");

      if (assistantText.length === 0) {
        return;
      }

      const assistantMessage: WorkspaceChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantText,
        timestamp: new Date().toISOString(),
      };

      setMessages((previous) => [...previous, assistantMessage]);

      void persistAssistantMessage(assistantText).catch((error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "assistant message 保存に失敗しました",
        );
      });
    });

    const disposeError = window.electronAPI.llm.onStreamError(
      (error: LLMError) => {
        if (!isStreamingRef.current) {
          return;
        }

        streamRequestIdRef.current = null;
        isStreamingRef.current = false;
        setIsStreaming(false);
        streamContentRef.current = "";
        setStreamContent("");

        const structured = mapLLMErrorToStreamingError(error);
        setStreamingError(structured);
        setErrorMessage(structured.message);
      },
    );

    return () => {
      disposeChunk();
      disposeEnd();
      disposeError();
    };
  }, [persistAssistantMessage]);

  useEffect(() => {
    return () => {
      const requestId = streamRequestIdRef.current;
      if (!requestId || !window.electronAPI?.llm) {
        return;
      }
      void window.electronAPI.llm.cancelStream(requestId);
    };
  }, []);

  const removeSelectedFile = useCallback(
    (id: string) => {
      removeFile(id);
    },
    [removeFile],
  );

  const attachSelectedFile = useCallback(() => {
    if (!selectedFilePath) {
      return;
    }

    void onAttachSelectedFile(selectedFilePath).then((result) => {
      if (result.success) {
        setErrorMessage(null);
        return;
      }
      setErrorMessage(
        result.errorMessage ?? "背景情報の読み込みに失敗しました",
      );
    });
  }, [onAttachSelectedFile, selectedFilePath]);

  const dismissStreamingError = useCallback(() => {
    setStreamingError(null);
    setErrorMessage(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (!streamingError?.retryable || !lastUserMessageRef.current) {
      return;
    }
    const messageToRetry = lastUserMessageRef.current;
    dismissStreamingError();
    await sendMessageCore(messageToRetry, {
      addToMessages: false,
      persistUserMessage: false,
    });
  }, [streamingError, dismissStreamingError, sendMessageCore]);

  return {
    messages,
    input,
    isSending,
    isStreaming,
    streamContent,
    errorMessage,
    selectedFiles,
    selectedFilePath,
    selectedModelId,
    blockedReason,
    mention,
    pendingCursorPosition,
    setInputValue,
    clearPendingCursorPosition,
    applySuggestion,
    sendMessage,
    cancelStream,
    removeSelectedFile,
    attachSelectedFile,
    handleComposerKeyDown,
    selectMentionAtIndex,
    openMentionPreviewAtIndex,
    streamingError,
    retryLastMessage,
    dismissStreamingError,
  };
}

export function getWorkspaceSuggestions(): readonly string[] {
  return SUGGESTIONS;
}
