import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChatView } from "./index";
import {
  buildWorkspaceChatContext,
  createChatSessionContext,
} from "../../features/chat-platform/session";
import type { ChatSessionRecord } from "../../store/types";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockStreamingActions = {
  startStream: vi.fn().mockResolvedValue(undefined),
  cancelStream: vi.fn().mockResolvedValue(undefined),
  retryLastStream: vi.fn().mockResolvedValue(undefined),
};

const mockStreamingState = {
  isStreaming: false,
  content: "",
  error: null as { code: string; message: string; retryable: boolean } | null,
};

vi.mock("../../hooks/useStreamingChat", () => ({
  useStreamingChat: () => ({
    state: mockStreamingState,
    actions: mockStreamingActions,
  }),
}));

const createSession = (
  overrides: Partial<ChatSessionRecord> = {},
): ChatSessionRecord => ({
  id: "session-general",
  mode: "general",
  title: "通常会話 10:00",
  messages: [
    {
      id: "assistant-1",
      role: "assistant",
      content: "こんにちは。通常会話モードです。",
      timestamp: new Date("2026-03-11T10:00:00.000Z"),
      sessionId: "session-general",
      mode: "general",
    },
    {
      id: "user-1",
      role: "user",
      content: "現状を整理して",
      timestamp: new Date("2026-03-11T10:01:00.000Z"),
      sessionId: "session-general",
      mode: "general",
    },
  ],
  createdAt: new Date("2026-03-11T10:00:00.000Z"),
  updatedAt: new Date("2026-03-11T10:01:00.000Z"),
  context: createChatSessionContext({ entryPoint: "chat" }),
  lastUserMessage: "現状を整理して",
  lastError: null,
  ...overrides,
});

const mockStoreState = {
  chatMessages: createSession().messages,
  chatInput: "共通基盤へ統合したい",
  isSending: false,
  isSystemPromptPanelExpanded: false,
  systemPrompt: "",
  templates: [],
  selectedTemplateId: null as string | null,
  isSaveTemplateDialogOpen: false,
  setChatInput: vi.fn(),
  toggleSystemPromptPanel: vi.fn(),
  setSystemPrompt: vi.fn(),
  clearSystemPrompt: vi.fn(),
  openSaveTemplateDialog: vi.fn(),
  closeSaveTemplateDialog: vi.fn(),
  saveTemplate: vi.fn().mockResolvedValue(undefined),
  deleteTemplate: vi.fn(),
  initializeTemplates: vi.fn(),
};

const mockHookState = {
  activeChatMode: "general" as const,
  activeChatSession: createSession(),
  recentChatSessions: [
    createSession(),
    createSession({
      id: "session-workspace",
      mode: "workspace",
      title: "Workspace: project",
      context: buildWorkspaceChatContext(
        [{ path: "/workspace/app.ts", name: "app.ts" }],
        "/workspace",
      ),
    }),
  ],
  selectedFiles: [{ path: "/workspace/app.ts", name: "app.ts" }],
  workspace: {
    folders: [{ path: "/workspace" }],
  },
  activateChatMode: vi.fn(),
  updateActiveChatContext: vi.fn(),
  fetchProviders: vi.fn().mockResolvedValue(undefined),
  abortStreaming: vi.fn().mockResolvedValue(undefined),
  resumeChatSession: vi.fn(),
  selectedProviderId: "openai",
  selectedModelId: "gpt-4o",
};

vi.mock("../../store", () => ({
  useAppStore: vi.fn((selector: (state: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
  ),
  useAbortStreaming: () => mockHookState.abortStreaming,
  useActivateChatMode: () => mockHookState.activateChatMode,
  useActiveChatMode: () => mockHookState.activeChatMode,
  useActiveChatSession: () => mockHookState.activeChatSession,
  useFetchProviders: () => mockHookState.fetchProviders,
  useRecentChatSessions: () => mockHookState.recentChatSessions,
  useResumeChatSession: () => mockHookState.resumeChatSession,
  useSelectedFiles: () => mockHookState.selectedFiles,
  useSelectedModelId: () => mockHookState.selectedModelId,
  useSelectedProviderId: () => mockHookState.selectedProviderId,
  useUpdateActiveChatContext: () => mockHookState.updateActiveChatContext,
  useWorkspace: () => mockHookState.workspace,
}));

function renderChatView(): void {
  render(
    <MemoryRouter>
      <ChatView />
    </MemoryRouter>,
  );
}

describe("ChatView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockReset();
    mockStoreState.chatMessages = createSession().messages;
    mockStoreState.chatInput = "共通基盤へ統合したい";
    mockStoreState.isSending = false;
    mockHookState.activeChatMode = "general";
    mockHookState.activeChatSession = createSession();
    mockHookState.selectedModelId = "gpt-4o";
    mockStreamingState.isStreaming = false;
    mockStreamingState.error = null;
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("共通チャット基盤のヘッダーと mode 切替を表示する", () => {
    renderChatView();

    expect(screen.getByText("共通チャット基盤")).toBeInTheDocument();
    expect(screen.getByTestId("chat-mode-general")).toBeInTheDocument();
    expect(screen.getByTestId("chat-mode-workspace")).toBeInTheDocument();
    expect(screen.getByTestId("chat-mode-skill-lifecycle")).toBeInTheDocument();
    expect(screen.getByText("現状を整理して")).toBeInTheDocument();
  });

  it("Workspace mode に切り替えると handoff context を渡す", () => {
    renderChatView();

    fireEvent.click(screen.getByTestId("chat-mode-workspace"));

    expect(mockHookState.activateChatMode).toHaveBeenCalledWith(
      "workspace",
      buildWorkspaceChatContext(mockHookState.selectedFiles, "/workspace"),
    );
  });

  it("Workspace mode の active session では文脈更新を同期する", async () => {
    mockHookState.activeChatMode = "workspace";
    mockHookState.activeChatSession = createSession({
      id: "session-workspace",
      mode: "workspace",
      title: "Workspace: project",
      context: buildWorkspaceChatContext(
        mockHookState.selectedFiles,
        "/workspace",
      ),
    });

    renderChatView();

    await waitFor(() => {
      expect(mockHookState.updateActiveChatContext).toHaveBeenCalledWith(
        buildWorkspaceChatContext(mockHookState.selectedFiles, "/workspace"),
      );
    });
  });

  it("送信操作で共通ストリーミング hook を呼び出す", () => {
    renderChatView();

    fireEvent.click(screen.getByRole("button", { name: "送信" }));

    expect(mockStreamingActions.startStream).toHaveBeenCalledWith({
      content: "共通基盤へ統合したい",
      providerId: "openai",
      modelId: "gpt-4o",
    });
  });

  it("再試行エラー時に retry ボタンから再送できる", () => {
    mockStreamingState.error = {
      code: "STREAM_START_ERROR",
      message: "再試行可能です",
      retryable: true,
    };

    renderChatView();

    fireEvent.click(screen.getByTestId("chat-retry-button"));

    expect(mockStreamingActions.retryLastStream).toHaveBeenCalledWith({
      providerId: "openai",
      modelId: "gpt-4o",
    });
  });

  it("ストリーミング中は停止ボタンから abort できる", () => {
    mockStreamingState.isStreaming = true;

    renderChatView();

    fireEvent.click(screen.getByTestId("chat-stop-button"));

    expect(mockHookState.abortStreaming).toHaveBeenCalledTimes(1);
  });

  it("モデル未選択なら provider 取得を走らせて入力を無効化する", async () => {
    mockHookState.selectedModelId = null;

    renderChatView();

    await waitFor(() => {
      expect(mockHookState.fetchProviders).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
  });

  it("履歴ボタンからチャット履歴へ遷移する", () => {
    renderChatView();

    fireEvent.click(screen.getByRole("button", { name: "チャット履歴" }));

    expect(mockNavigate).toHaveBeenCalledWith("/chat/history");
  });
});
