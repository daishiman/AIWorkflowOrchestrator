import type { SelectedFile } from "@repo/shared/schemas";
import {
  createChatSessionTitle,
  type ChatContextAttachment,
  type ChatHandoffPayload,
  type ChatMode,
  type ChatReviveSnapshot,
} from "@repo/shared/types";
import type {
  LLMChatRequest,
  LLMChatRequestInput,
  LLMProviderId,
} from "@repo/shared/types/llm/schemas";

function normalizeRequest(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}

export function createWorkspaceContextAttachments(
  selectedFiles: SelectedFile[],
): ChatContextAttachment[] {
  return selectedFiles.map((selectedFile) => ({
    id: `file:${selectedFile.path}`,
    kind: "file",
    label: selectedFile.name,
    path: selectedFile.path,
    summary: `${selectedFile.extension} / ${selectedFile.size} bytes`,
    metadata: {
      extension: selectedFile.extension,
      size: selectedFile.size,
      mimeType: selectedFile.mimeType,
    },
  }));
}

export function summarizeChatAttachments(
  attachments: ChatContextAttachment[],
): string {
  if (attachments.length === 0) {
    return "追加コンテキストなし";
  }

  const labels = attachments.slice(0, 3).map((attachment) => attachment.label);
  const suffix =
    attachments.length > labels.length
      ? ` ほか${attachments.length - labels.length}件`
      : "";

  return `${labels.join(", ")}${suffix}`;
}

export function buildChatPlatformRequest(params: {
  mode: ChatMode;
  input: string;
  contextBlock?: string;
  systemPrompt?: string;
  selectedModelId: string | null;
  selectedProviderId: LLMProviderId | null;
  temperature?: number;
}): LLMChatRequest {
  const normalizedInput = normalizeRequest(params.input);
  const body =
    params.contextBlock && params.contextBlock.trim().length > 0
      ? `${params.contextBlock.trim()}\n\nユーザーの依頼:\n${normalizedInput}`
      : normalizedInput;

  return {
    modelId: params.selectedModelId ?? "gpt-4o",
    providerId: params.selectedProviderId ?? undefined,
    systemPrompt: params.systemPrompt?.trim() || undefined,
    temperature: params.temperature ?? (params.mode === "general" ? 0.4 : 0.2),
    stream: true,
    messages: [
      {
        role: "user",
        content: body,
      },
    ],
  } satisfies LLMChatRequestInput as LLMChatRequest;
}

export function createWorkspaceChatHandoff(params: {
  request: string;
  selectedFiles: SelectedFile[];
  selectedFilePath: string | null;
  metadata?: Record<string, unknown>;
}): ChatHandoffPayload {
  const attachments = createWorkspaceContextAttachments(params.selectedFiles);
  const normalizedRequest = normalizeRequest(params.request);

  return {
    mode: "workspace",
    sourceSurface: "workspace-view",
    targetSurface: "chat-view",
    request: normalizedRequest,
    title: createChatSessionTitle("workspace", normalizedRequest),
    summary: summarizeChatAttachments(attachments),
    attachments,
    metadata: {
      selectedFilePath: params.selectedFilePath,
      attachmentCount: attachments.length,
      ...params.metadata,
    },
    createdAt: new Date().toISOString(),
  };
}

export function createChatReviveSnapshot(params: {
  mode: ChatMode;
  conversationId: string | null;
  request: string;
  systemPrompt?: string;
  attachments?: ChatContextAttachment[];
  metadata?: Record<string, unknown>;
}): ChatReviveSnapshot {
  const normalizedRequest = normalizeRequest(params.request);
  const attachments = params.attachments ?? [];

  return {
    mode: params.mode,
    conversationId: params.conversationId,
    title: createChatSessionTitle(params.mode, normalizedRequest),
    draftInput: normalizedRequest,
    systemPrompt: params.systemPrompt ?? "",
    summary: summarizeChatAttachments(attachments),
    attachments,
    metadata: params.metadata ?? {},
  };
}
