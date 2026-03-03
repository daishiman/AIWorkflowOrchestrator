/**
 * @file ChatPanel Component
 * @description チャットパネル統合コンポーネント
 * @feature skill-import-agent-system
 * @task TASK-7D ChatPanel 統合
 * @see specification.md §4.1 既存チャット画面へのスキルセレクター統合
 */

import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { SkillMetadata } from "@repo/shared";
import { useAppStore } from "../../store";
import { SkillSelector } from "../skill/SkillSelector";
import { SkillImportDialog } from "../skill/SkillImportDialog";
import { PermissionDialog } from "../skill/PermissionDialog";
import { SkillStreamingView } from "../skill/SkillStreamingView";
import { SkillManagementPanel } from "../skill/SkillManagementPanel";

// ============================================
// Types
// ============================================

export interface ChatPanelProps {
  /** スキルインポート要求時のコールバック（テスト用にも使用可能） */
  onImportRequest?: (skill: SkillMetadata) => void;
}

/** ChatPanel の公開ハンドル（ref経由） */
export interface ChatPanelHandle {
  /** スキルインポートダイアログを開く */
  handleImportRequest: (skill: SkillMetadata) => void;
}

// ============================================
// Main Component
// ============================================

/**
 * ChatPanel - スキル統合チャットパネル
 *
 * 既存のチャット機能に SkillSelector、SkillStreamingView、
 * SkillImportDialog、PermissionDialog を統合する。
 *
 * @example
 * ```tsx
 * const ref = useRef<ChatPanelHandle>(null);
 * <ChatPanel ref={ref} />
 * // ref.current?.handleImportRequest(skill);
 * ```
 */
export const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>(
  ({ onImportRequest }, ref) => {
    // Store state
    const selectedSkillName = useAppStore((s) => s.selectedSkillName);
    const streamingMessages = useAppStore((s) => s.streamingMessages);
    const isExecuting = useAppStore((s) => s.isExecuting);
    const skillExecutionStatus = useAppStore((s) => s.skillExecutionStatus);
    const fetchSkills = useAppStore((s) => s.fetchSkills);

    // Local state
    const [importDialogSkill, setImportDialogSkill] =
      useState<SkillMetadata | null>(null);
    const [showSkillManagement, setShowSkillManagement] = useState(false);

    // Import request handler
    const handleImportRequest = (skill: SkillMetadata) => {
      setImportDialogSkill(skill);
      onImportRequest?.(skill);
    };

    // Expose handle to parent via ref
    useImperativeHandle(ref, () => ({
      handleImportRequest,
    }));

    // Initialize: fetch skills on mount
    useEffect(() => {
      fetchSkills();
    }, [fetchSkills]);

    return (
      <div className="flex flex-col h-full" data-testid="chat-panel">
        {/* Header */}
        <div
          className="flex items-center gap-4 px-4 py-2 border-b"
          role="toolbar"
          aria-label="チャット設定"
          data-testid="chat-header"
        >
          {/* ModelSelector placeholder - existing component */}
          <div data-testid="model-selector-slot" />

          {/* SkillSelector */}
          <SkillSelector />

          {/* スキル管理パネル切替 */}
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

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto" data-testid="message-area">
          {showSkillManagement ? (
            <SkillManagementPanel />
          ) : (
            <>
              {/* MessageList placeholder - existing component */}
              <div data-testid="message-list-slot" />

              {/* Skill Streaming View */}
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

        {/* Input Area */}
        <div data-testid="input-area">
          {/* ChatInput placeholder - existing component */}
          <div data-testid="chat-input-slot" />
        </div>

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
