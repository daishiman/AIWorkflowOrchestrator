/**
 * 会話基盤統合で共有する mode / handoff / revive 契約。
 *
 * Task02 では general / workspace / skill-lifecycle を
 * mode 差分として表現し、streaming overlay は revive 対象から除外する。
 */

export const CHAT_MODES = ["general", "workspace", "skill-lifecycle"] as const;

export type ChatMode = (typeof CHAT_MODES)[number];

export const CHAT_ENTRY_SURFACES = [
  "chat-view",
  "workspace-view",
  "skill-center",
  "skill-creator",
  "task03",
] as const;

export type ChatEntrySurface = (typeof CHAT_ENTRY_SURFACES)[number];

export const CHAT_EXECUTION_SURFACE = "chat-view" as const;

export type ChatExecutionSurface = typeof CHAT_EXECUTION_SURFACE;

export const CHAT_MODE_LABELS: Record<ChatMode, string> = {
  general: "General Chat",
  workspace: "Workspace Chat",
  "skill-lifecycle": "Skill Lifecycle Chat",
};

export const DEFAULT_CHAT_SESSION_TITLES: Record<ChatMode, string> = {
  general: "新しい会話",
  workspace: "Workspace Chat",
  "skill-lifecycle": "Skill Lifecycle Chat",
};

export type ChatContextAttachmentKind =
  | "file"
  | "skill"
  | "conversation"
  | "note";

export interface ChatContextAttachment {
  id: string;
  kind: ChatContextAttachmentKind;
  label: string;
  path?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatHandoffPayload {
  mode: ChatMode;
  sourceSurface: ChatEntrySurface;
  targetSurface: ChatExecutionSurface;
  request: string;
  title: string;
  summary: string;
  attachments: ChatContextAttachment[];
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ChatStreamOverlayError {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ChatStreamOverlayState {
  isStreaming: boolean;
  streamingContent: string;
  currentStreamId: string | null;
  streamingMessageId: string | null;
  streamingError: ChatStreamOverlayError | null;
}

export const NON_PERSISTED_CHAT_OVERLAY_KEYS = [
  "isStreaming",
  "streamingContent",
  "currentStreamId",
  "streamingMessageId",
  "streamingError",
] as const;

export type NonPersistedChatOverlayKey =
  (typeof NON_PERSISTED_CHAT_OVERLAY_KEYS)[number];

export interface ChatReviveSnapshot {
  mode: ChatMode;
  conversationId: string | null;
  title: string;
  draftInput: string;
  systemPrompt: string;
  summary: string;
  attachments: ChatContextAttachment[];
  metadata: Record<string, unknown>;
}

export function createChatSessionTitle(
  mode: ChatMode,
  request: string,
  maxLength = 48,
): string {
  const normalized = request.trim().replace(/\s+/g, " ");
  if (normalized.length === 0) {
    return DEFAULT_CHAT_SESSION_TITLES[mode];
  }

  const prefix =
    mode === "general"
      ? ""
      : `${CHAT_MODE_LABELS[mode].replace(" Chat", "")}: `;
  const availableLength = Math.max(12, maxLength - prefix.length);

  return `${prefix}${normalized.slice(0, availableLength).trimEnd()}`;
}

export function createEmptyChatStreamOverlayState(
  overrides: Partial<ChatStreamOverlayState> = {},
): ChatStreamOverlayState {
  return {
    isStreaming: false,
    streamingContent: "",
    currentStreamId: null,
    streamingMessageId: null,
    streamingError: null,
    ...overrides,
  };
}

export function isNonPersistedChatOverlayKey(
  key: string,
): key is NonPersistedChatOverlayKey {
  return (NON_PERSISTED_CHAT_OVERLAY_KEYS as readonly string[]).includes(key);
}
