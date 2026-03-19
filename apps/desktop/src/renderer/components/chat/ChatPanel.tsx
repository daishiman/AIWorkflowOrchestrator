/**
 * @file ChatPanel Component
 * @description チャットパネル統合コンポーネント - 実 AI チャット配線
 * @feature chatpanel-real-chat-wiring
 * @task TASK-IMP-CHATPANEL-REAL-AI-CHAT-001
 *
 * 3 つの placeholder（model-selector-slot, message-list-slot, chat-input-slot）を
 * 実コンポーネントに置換し、useStreamingChat 経由で LLM ストリーミングチャットを提供する。
 *
 * 状態機械: idle → ready → streaming → completed/cancelled/error
 *   blocked: provider/model 未選択 or API key 未設定
 *   handoff: terminal surface のみ利用可能
 */

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef,
} from "react";
import type { SkillMetadata } from "@repo/shared";
import { useAppStore, useIsSkillExecuting } from "../../store";
import { useStreamingChat } from "../../hooks/useStreamingChat";
import { SkillSelector } from "../skill/SkillSelector";
import { SkillImportDialog } from "../skill/SkillImportDialog";
import { PermissionDialog } from "../skill/PermissionDialog";
import { SkillStreamingView } from "../skill/SkillStreamingView";
import { SkillManagementPanel } from "../skill/SkillManagementPanel";
import { RuntimeBanner } from "./RuntimeBanner";
import { ChatMessageList } from "./ChatMessageList";
import { ErrorGuidance } from "./ErrorGuidance";
import { HandoffBlock } from "./HandoffBlock";
import { ComposerArea } from "./ComposerArea";
import { LLMSelectorPanel } from "./LLMSelectorPanel";

// ============================================
// Types
// ============================================

export interface ChatPanelProps {
  onImportRequest?: (skill: SkillMetadata) => void;
}

export interface ChatPanelHandle {
  handleImportRequest: (skill: SkillMetadata) => void;
}

// ============================================
// Main Component
// ============================================

export const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>(
  ({ onImportRequest }, ref) => {
    // === Existing Store state (skill integration) ===
    const selectedSkillName = useAppStore((s) => s.selectedSkillName);
    const streamingMessages = useAppStore((s) => s.streamingMessages);
    const isExecuting = useIsSkillExecuting();
    const skillExecutionStatus = useAppStore((s) => s.skillExecutionStatus);
    const fetchSkills = useAppStore((s) => s.fetchSkills);

    // === ChatPanel Status & Config (P31: individual selectors) ===
    const chatPanelStatus = useAppStore((s) => s.chatPanelStatus);
    const resolvedCapability = useAppStore((s) => s.resolvedCapability);
    const chatMessages = useAppStore((s) => s.chatMessages);
    const chatInput = useAppStore((s) => s.chatInput);
    const setChatInput = useAppStore((s) => s.setChatInput);
    const selectedProviderId = useAppStore((s) => s.selectedProviderId);
    const selectedModelId = useAppStore((s) => s.selectedModelId);
    const providers = useAppStore((s) => s.providers);
    const handoffGuidance = useAppStore((s) => s.handoffGuidance);

    // === Streaming (useStreamingChat hook) ===
    const { state: streamingState, actions: streamingActions } =
      useStreamingChat();

    // === Local state ===
    const [importDialogSkill, setImportDialogSkill] =
      useState<SkillMetadata | null>(null);
    const [showSkillManagement, setShowSkillManagement] = useState(false);

    // === Refs for stable cleanup ===
    const isStreamingRef = useRef(streamingState.isStreaming);
    isStreamingRef.current = streamingState.isStreaming;
    const cancelStreamRef = useRef(streamingActions.cancelStream);
    cancelStreamRef.current = streamingActions.cancelStream;

    // === Computed ===
    const isBlocked = chatPanelStatus === "blocked";
    const isHandoff = chatPanelStatus === "handoff";
    const isStreaming = streamingState.isStreaming;
    const canSubmit =
      !isBlocked &&
      !isHandoff &&
      !isStreaming &&
      Boolean(selectedProviderId) &&
      Boolean(selectedModelId);
    const showComposer = !isBlocked && !isHandoff;

    // === Blocked error derivation (P62: no DEFAULT_CONFIG fallback) ===
    const blockedErrorCode = !selectedProviderId
      ? "API_KEY_MISSING"
      : "CONFIG_MISSING";
    const blockedErrorMessage = !selectedProviderId
      ? "APIキーが設定されていません。設定画面でAPIキーを入力してください"
      : "プロバイダーとモデルを選択してください";

    // === Handlers ===
    const handleImportRequest = (skill: SkillMetadata) => {
      setImportDialogSkill(skill);
      onImportRequest?.(skill);
    };

    const handleSendMessage = useCallback(
      (message: string) => {
        if (!message.trim()) return;
        streamingActions.startStream({
          providerId: selectedProviderId ?? undefined,
          modelId: selectedModelId ?? "",
          messages: [{ role: "user" as const, content: message.trim() }],
          stream: true,
        });
      },
      [selectedProviderId, selectedModelId, streamingActions],
    );

    const handleNavigateToSettings = useCallback(() => {
      const state = useAppStore.getState();
      if (state.setCurrentView) {
        state.setCurrentView("settings");
      }
    }, []);

    // === Ref handle ===
    useImperativeHandle(ref, () => ({ handleImportRequest }));

    // === Effects ===
    useEffect(() => {
      fetchSkills();
    }, [fetchSkills]);

    // Escape key: cancel stream (document level for B-06)
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && isStreamingRef.current) {
          cancelStreamRef.current();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Cleanup on unmount (B-07)
    useEffect(() => {
      return () => {
        if (isStreamingRef.current) {
          cancelStreamRef.current();
        }
      };
    }, []);

    // === Render ===
    return (
      <div className="flex flex-col h-full" data-testid="chat-panel">
        {/* Header: RuntimeBanner replaces model-selector-slot */}
        <div
          className="flex items-center gap-4 px-4 py-2 border-b"
          role="toolbar"
          aria-label="チャット設定"
          data-testid="chat-header"
        >
          <RuntimeBanner
            capability={resolvedCapability}
            onTerminalSwitch={() => {}}
          />

          <LLMSelectorPanel
            providers={providers ?? []}
            selectedProviderId={selectedProviderId}
            selectedModelId={selectedModelId}
            onSelectProvider={() => {}}
            onSelectModel={() => {}}
          />

          <SkillSelector />

          <button
            onClick={() => setShowSkillManagement((prev) => !prev)}
            aria-label={
              showSkillManagement
                ? "スキル管理パネルを閉じる"
                : "スキル管理パネルを開く"
            }
            aria-expanded={showSkillManagement}
            disabled={isExecuting}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="skill-management-toggle"
          >
            スキル管理
          </button>
        </div>

        {/* Message Area: replaces message-list-slot */}
        <div className="flex-1 overflow-y-auto" data-testid="message-area">
          {showSkillManagement ? (
            <SkillManagementPanel />
          ) : (
            <>
              {/* Blocked: ErrorGuidance with settings CTA */}
              {isBlocked && (
                <ErrorGuidance
                  code={blockedErrorCode}
                  message={blockedErrorMessage}
                  retryable={false}
                  onNavigateToSettings={handleNavigateToSettings}
                />
              )}

              {/* Handoff: HandoffBlock + PersistentTerminalLauncher */}
              {isHandoff && handoffGuidance && (
                <HandoffBlock
                  guidance={handoffGuidance}
                  onOpenTerminal={() => {}}
                />
              )}

              {/* Normal/Streaming/Error/Completed/Cancelled: ChatMessageList */}
              {!isBlocked && !isHandoff && (
                <ChatMessageList
                  messages={chatMessages ?? []}
                  isStreaming={isStreaming}
                  streamingContent={streamingState.content}
                  onCancelStream={streamingActions.cancelStream}
                  error={streamingState.error}
                />
              )}

              {/* Skill Streaming View (existing, maintained) */}
              {isExecuting && selectedSkillName && (
                <SkillStreamingView
                  skillName={selectedSkillName}
                  messages={streamingMessages}
                  status={skillExecutionStatus}
                />
              )}
            </>
          )}
        </div>

        {/* Input Area: replaces chat-input-slot */}
        {showComposer && (
          <div data-testid="input-area">
            <ComposerArea
              value={chatInput}
              onChange={setChatInput}
              onSubmit={handleSendMessage}
              canSubmit={canSubmit}
              isStreaming={isStreaming}
              onCancel={streamingActions.cancelStream}
              disabled={!canSubmit && !isStreaming}
              placeholder="メッセージを入力"
            />
          </div>
        )}

        {/* Dialogs */}
        {importDialogSkill && (
          <SkillImportDialog
            skill={importDialogSkill}
            isOpen={true}
            onClose={() => setImportDialogSkill(null)}
          />
        )}
        <PermissionDialog />
      </div>
    );
  },
);

ChatPanel.displayName = "ChatPanel";

export default ChatPanel;
