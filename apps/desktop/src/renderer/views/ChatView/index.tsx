import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { History } from "lucide-react";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { ChatInput } from "../../components/organisms/ChatInput";
import { ChatMessage } from "../../components/molecules/ChatMessage";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { SystemPromptPanel } from "../../components/organisms/SystemPromptPanel";
import { SystemPromptToggleButton } from "../../components/atoms/SystemPromptToggleButton";
import { SaveTemplateDialog } from "../../components/organisms/SaveTemplateDialog";
import {
  useAbortStreaming,
  useActivateChatMode,
  useActiveChatMode,
  useActiveChatSession,
  useAppStore,
  useFetchProviders,
  useRecentChatSessions,
  useResumeChatSession,
  useSelectedFiles,
  useSelectedModelId,
  useSelectedProviderId,
  useUpdateActiveChatContext,
  useWorkspace,
} from "../../store";
import { useStreamingChat } from "../../hooks/useStreamingChat";
import {
  buildWorkspaceChatContext,
  getChatModeLabel,
  summarizeChatSession,
} from "../../features/chat-platform/session";
import type { ChatMode } from "../../store/types";

const EMPTY_STATE_MESSAGES = {
  primary: "メッセージを入力してAIと会話を始めましょう",
  hint: "通常 / Workspace / Skill Lifecycle の mode を切り替えても、会話は共通基盤で継続します。",
} as const;

const MODE_ORDER: ChatMode[] = ["general", "workspace", "skill-lifecycle"];

const MODE_EXPLANATIONS: Record<ChatMode, string> = {
  general: "通常会話",
  workspace: "Workspace 文脈付き会話",
  "skill-lifecycle": "Skill 作成 / 実行 / 改善向け会話",
};

export interface ChatViewProps {
  className?: string;
}

function ContextSummaryCard(): JSX.Element | null {
  const activeSession = useActiveChatSession();

  if (!activeSession) {
    return null;
  }

  const { context } = activeSession;

  if (
    activeSession.mode === "general" &&
    !context.selectedSkillName &&
    context.selectedFileNames.length === 0
  ) {
    return null;
  }

  return (
    <div
      className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)]"
      data-testid="chat-context-summary"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--bg-tertiary)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)]">
          {getChatModeLabel(activeSession.mode)}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {summarizeChatSession(activeSession)}
        </span>
      </div>

      {context.workspacePath && (
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          workspacePath: {context.workspacePath}
        </p>
      )}

      {context.selectedFileNames.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {context.selectedFileNames.map((fileName) => (
            <span
              key={fileName}
              className="rounded-full border border-[var(--border-primary)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
            >
              {fileName}
            </span>
          ))}
        </div>
      )}

      {context.handoffLabel && (
        <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
          handoff: {context.handoffLabel}
        </p>
      )}
    </div>
  );
}

function RecentSessionsRail(): JSX.Element | null {
  const recentSessions = useRecentChatSessions();
  const activeSession = useActiveChatSession();
  const resumeChatSession = useResumeChatSession();

  if (recentSessions.length <= 1) {
    return null;
  }

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      data-testid="chat-session-rail"
    >
      {recentSessions.map((session) => {
        const isActive = session.id === activeSession?.id;
        return (
          <button
            key={session.id}
            type="button"
            onClick={() => resumeChatSession(session.id)}
            className={clsx(
              "min-w-[180px] rounded-2xl border px-3 py-2 text-left transition-colors",
              isActive
                ? "border-[var(--status-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                : "border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]",
            )}
            data-testid={`chat-session-${session.id}`}
          >
            <div className="text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {getChatModeLabel(session.mode)}
            </div>
            <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">
              {session.title}
            </div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">
              {summarizeChatSession(session)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export const ChatView: React.FC<ChatViewProps> = ({ className }) => {
  const navigate = useNavigate();
  const activeChatMode = useActiveChatMode();
  const activeChatSession = useActiveChatSession();
  const selectedFiles = useSelectedFiles();
  const workspace = useWorkspace();
  const activateChatMode = useActivateChatMode();
  const updateActiveChatContext = useUpdateActiveChatContext();
  const selectedProviderId = useSelectedProviderId();
  const selectedModelId = useSelectedModelId();
  const fetchProviders = useFetchProviders();
  const abortStreaming = useAbortStreaming();
  const { state: streamingState, actions: streamingActions } =
    useStreamingChat();

  const chatMessages = useAppStore((state) => state.chatMessages);
  const chatInput = useAppStore((state) => state.chatInput);
  const isSending = useAppStore((state) => state.isSending);
  const isSystemPromptPanelExpanded = useAppStore(
    (state) => state.isSystemPromptPanelExpanded,
  );
  const systemPrompt = useAppStore((state) => state.systemPrompt || "");
  const templates = useAppStore((state) => state.templates || []);
  const selectedTemplateId = useAppStore((state) => state.selectedTemplateId);
  const isSaveTemplateDialogOpen = useAppStore(
    (state) => state.isSaveTemplateDialogOpen,
  );
  const setChatInput = useAppStore((state) => state.setChatInput);
  const toggleSystemPromptPanel = useAppStore(
    (state) => state.toggleSystemPromptPanel,
  );
  const setSystemPrompt = useAppStore((state) => state.setSystemPrompt);
  const clearSystemPrompt = useAppStore((state) => state.clearSystemPrompt);
  const openSaveTemplateDialog = useAppStore(
    (state) => state.openSaveTemplateDialog,
  );
  const closeSaveTemplateDialog = useAppStore(
    (state) => state.closeSaveTemplateDialog,
  );
  const saveTemplate = useAppStore((state) => state.saveTemplate);
  const deleteTemplate = useAppStore((state) => state.deleteTemplate);
  const initializeTemplates = useAppStore((state) => state.initializeTemplates);

  const [error] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeTemplates();
  }, [initializeTemplates]);

  useEffect(() => {
    if (!selectedModelId) {
      void fetchProviders();
    }
  }, [fetchProviders, selectedModelId]);

  useEffect(() => {
    if (activeChatMode !== "workspace") {
      return;
    }

    const workspacePath = workspace.folders[0]?.path ?? null;
    updateActiveChatContext(
      buildWorkspaceChatContext(selectedFiles, workspacePath),
    );
  }, [
    activeChatMode,
    selectedFiles,
    updateActiveChatContext,
    workspace.folders,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSelectTemplate = useCallback(
    (template: (typeof templates)[number]) => {
      setSystemPrompt(template.content);
    },
    [setSystemPrompt, templates],
  );

  const handleConfirmSaveTemplate = useCallback(
    async (name: string) => {
      await saveTemplate(name, systemPrompt);
      closeSaveTemplateDialog();
    },
    [closeSaveTemplateDialog, saveTemplate, systemPrompt],
  );

  const handleSend = useCallback(async () => {
    if (!chatInput.trim()) {
      return;
    }

    await streamingActions.startStream({
      content: chatInput,
      providerId: selectedProviderId,
      modelId: selectedModelId,
    });
  }, [chatInput, selectedModelId, selectedProviderId, streamingActions]);

  const handleInputChange = useCallback(
    (value: string) => {
      setChatInput(value);
    },
    [setChatInput],
  );

  const handleModeSwitch = useCallback(
    (mode: ChatMode) => {
      if (mode === "workspace") {
        const workspacePath = workspace.folders[0]?.path ?? null;
        activateChatMode(
          mode,
          buildWorkspaceChatContext(selectedFiles, workspacePath),
        );
        return;
      }

      activateChatMode(mode, { entryPoint: "chat" });
    },
    [activateChatMode, selectedFiles, workspace.folders],
  );

  const existingTemplateNames = templates.map((template) => template.name);
  const hasMessages = chatMessages.length > 0;

  if (error) {
    return <ErrorDisplay message={error} className={className} />;
  }

  return (
    <div
      className={clsx(
        "flex h-full flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]",
        className,
      )}
      data-testid="chat-view"
    >
      <header className="border-b border-[var(--border-subtle)] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              共通チャット基盤
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {MODE_EXPLANATIONS[activeChatMode]}
              {selectedModelId ? ` / ${selectedModelId}` : " / モデル未選択"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/chat/history")}
              aria-label="チャット履歴"
              className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <History className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className="mt-4 flex flex-wrap gap-2"
          data-testid="chat-mode-switcher"
        >
          {MODE_ORDER.map((mode) => {
            const isActive = mode === activeChatMode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeSwitch(mode)}
                className={clsx(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-[var(--status-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    : "border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]",
                )}
                data-testid={`chat-mode-${mode}`}
              >
                {getChatModeLabel(mode)}
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <RecentSessionsRail />
        </div>
      </header>

      <div className="space-y-3 border-b border-[var(--border-subtle)] px-4 py-3">
        <ContextSummaryCard />

        <div className="flex flex-wrap items-center gap-2">
          <SystemPromptToggleButton
            isExpanded={isSystemPromptPanelExpanded}
            onClick={toggleSystemPromptPanel}
            hasContent={systemPrompt.trim().length > 0}
            disabled={isSending}
          />

          {activeChatSession?.context.entryPoint && (
            <span className="rounded-full border border-[var(--border-primary)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
              entry: {activeChatSession.context.entryPoint}
            </span>
          )}

          {streamingState.error?.retryable && (
            <button
              type="button"
              onClick={() =>
                void streamingActions.retryLastStream({
                  providerId: selectedProviderId,
                  modelId: selectedModelId,
                })
              }
              className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs text-amber-700 transition-colors hover:bg-amber-100"
              data-testid="chat-retry-button"
            >
              直前の送信を再試行
            </button>
          )}

          {streamingState.isStreaming && (
            <button
              type="button"
              onClick={() => void abortStreaming()}
              className="rounded-full border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs text-rose-700 transition-colors hover:bg-rose-100"
              data-testid="chat-stop-button"
            >
              生成を停止
            </button>
          )}
        </div>

        {streamingState.error && (
          <div
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            data-testid="chat-stream-error"
          >
            {streamingState.error.message}
          </div>
        )}

        {isSystemPromptPanelExpanded && (
          <SystemPromptPanel
            isExpanded={isSystemPromptPanelExpanded}
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
            templates={templates}
            selectedTemplateId={selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            onSaveTemplate={openSaveTemplateDialog}
            onDeleteTemplate={deleteTemplate}
            onClear={clearSystemPrompt}
          />
        )}
      </div>

      <main className="flex-1 overflow-auto p-4">
        <div
          role="log"
          aria-label="チャット履歴"
          data-testid="message-list"
          className="h-full"
        >
          {hasMessages ? (
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  loading={message.isStreaming}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-6 py-8 text-center">
                <p className="mb-2 text-[var(--text-primary)]">
                  {EMPTY_STATE_MESSAGES.primary}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {EMPTY_STATE_MESSAGES.hint}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[var(--border-subtle)] p-4">
        <GlassPanel className="p-2">
          <ChatInput
            value={chatInput}
            onChange={handleInputChange}
            onSend={handleSend}
            sending={isSending}
            disabled={!selectedModelId}
          />
        </GlassPanel>
        {!selectedModelId && (
          <p className="mt-2 text-xs text-amber-700">
            LLM provider / model を読み込み中、または未設定です。
          </p>
        )}
      </footer>

      <SaveTemplateDialog
        isOpen={isSaveTemplateDialogOpen}
        onClose={closeSaveTemplateDialog}
        onSave={handleConfirmSaveTemplate}
        previewContent={systemPrompt}
        existingNames={existingTemplateNames}
      />
    </div>
  );
};

ChatView.displayName = "ChatView";
