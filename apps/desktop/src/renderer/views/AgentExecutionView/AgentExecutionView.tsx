/**
 * AgentExecutionView - エージェント実行ビュー
 * @module AgentExecutionView
 */
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@/renderer/store";
import { AgentChatInterface } from "@/renderer/components/organisms/AgentChatInterface";
import { AgentMessageInput } from "@/renderer/components/molecules/AgentMessageInput";
import { AgentExecutionControls } from "@/renderer/components/molecules/AgentExecutionControls";
import { PermissionDialog } from "@/renderer/components/organisms/PermissionDialog";
import { TerminalHandoffCard } from "@/renderer/components/organisms/TerminalHandoffCard";
import {
  startAgentExecution,
  stopAgentExecution,
  respondToAgentPermission,
} from "@/renderer/utils/agentApi";
import type { HandoffGuidance } from "@/renderer/features/workspace-chat-edit/types";

/**
 * エージェント実行ビューコンポーネント
 *
 * - スキル実行のメインインターフェース
 * - チャット形式のメッセージ表示
 * - 実行制御（キャンセル、クリア）
 * - 権限確認ダイアログ
 */
export const AgentExecutionView: React.FC = () => {
  const navigate = useNavigate();
  const { skillId } = useParams<{ skillId: string }>();
  const [inputValue, setInputValue] = useState("");
  const [handoffGuidance, setHandoffGuidance] =
    useState<HandoffGuidance | null>(null);

  // Store selectors
  const executionState = useStore((state) => state.executionState);
  const startExecution = useStore((state) => state.startExecution);
  const stopExecution = useStore((state) => state.stopExecution);
  const addUserMessage = useStore((state) => state.addUserMessage);
  const clearMessages = useStore((state) => state.clearMessages);
  const respondToPermission = useStore((state) => state.respondToPermission);
  const skills = useStore((state) => state.skills);

  // Get current skill
  const getSkillById = useCallback(
    (id: string) => skills.find((s) => s.id === id),
    [skills],
  );
  const currentSkill =
    executionState.currentSkill || (skillId ? getSkillById(skillId) : null);

  // IPC event handlers setup
  useEffect(() => {
    // Setup IPC listeners (will be implemented in Phase 5-9)
    // window.agentAPI?.onStream((data) => { ... });
    // window.agentAPI?.onStatus((data) => { ... });
    // window.agentAPI?.onPermission((data) => { ... });

    return () => {
      // Cleanup IPC listeners
    };
  }, []);

  /**
   * 戻るボタンハンドラ
   */
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * メッセージ送信ハンドラ
   */
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || !currentSkill) return;

    addUserMessage(inputValue);
    setInputValue("");
    setHandoffGuidance(null);

    // Start execution via IPC
    const executionId = `exec-${Date.now()}`;
    startExecution(currentSkill, executionId);

    // Call IPC using helper
    try {
      const result = await startAgentExecution({
        skillId: currentSkill.id,
        prompt: inputValue,
        executionId,
      });

      if (result?.handoff && result.guidance) {
        stopExecution();
        setHandoffGuidance(result.guidance);
        return;
      }

      if (result && result.success === false) {
        stopExecution();
        console.error(
          "Agent execution returned failure:",
          result.error ?? "Unknown error",
        );
      }
    } catch (error) {
      stopExecution();
      console.error("Failed to start agent execution:", error);
    }
  }, [addUserMessage, currentSkill, inputValue, startExecution, stopExecution]);

  /**
   * キャンセルハンドラ
   */
  const handleCancel = useCallback(() => {
    stopExecution();
    stopAgentExecution().catch((error) => {
      console.error("Failed to stop agent execution:", error);
    });
  }, [stopExecution]);

  /**
   * クリアハンドラ
   */
  const handleClear = useCallback(() => {
    clearMessages();
  }, [clearMessages]);

  /**
   * 権限応答ハンドラ（共通処理）
   */
  const handlePermissionResponse = useCallback(
    (approved: boolean, rememberChoice: boolean) => {
      if (!executionState.pendingPermission) return;

      const response = {
        requestId: executionState.pendingPermission.requestId,
        approved,
        rememberChoice,
      };

      respondToPermission(response);
      respondToAgentPermission(response).catch((error) => {
        console.error("Failed to respond to permission:", error);
      });
    },
    [executionState.pendingPermission, respondToPermission],
  );

  /**
   * 権限許可ハンドラ
   */
  const handleApprove = useCallback(
    (rememberChoice: boolean) => {
      handlePermissionResponse(true, rememberChoice);
    },
    [handlePermissionResponse],
  );

  /**
   * 権限拒否ハンドラ
   */
  const handleDeny = useCallback(
    (rememberChoice: boolean) => {
      handlePermissionResponse(false, rememberChoice);
    },
    [handlePermissionResponse],
  );

  const isExecuting =
    executionState.status === "executing" ||
    executionState.status === "streaming";
  const hasMessages = executionState.messages.length > 0;

  const handleCopyHandoffCommand = useCallback(async () => {
    if (!handoffGuidance) {
      return;
    }
    try {
      await navigator.clipboard.writeText(handoffGuidance.terminalCommand);
    } catch (error) {
      console.error("Failed to copy handoff command:", error);
    }
  }, [handoffGuidance]);

  return (
    <div className="flex h-full flex-col bg-gray-900">
      {/* ヘッダー */}
      <header className="flex items-center gap-4 border-b border-gray-700 px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="戻る"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-100">
          {currentSkill?.name || "エージェント実行"}
        </h1>
      </header>

      {/* チャットインターフェース */}
      {handoffGuidance && (
        <section className="px-4 pt-4">
          <TerminalHandoffCard
            guidance={handoffGuidance}
            onCopyCommand={() => {
              void handleCopyHandoffCommand();
            }}
            onDismiss={() => setHandoffGuidance(null)}
          />
        </section>
      )}

      <AgentChatInterface
        messages={executionState.messages}
        streamingContent={executionState.currentStreamingContent}
        isStreaming={executionState.status === "streaming"}
      />

      {/* 実行コントロール */}
      <section
        role="region"
        aria-label="実行コントロール"
        className="border-t border-gray-700"
      >
        <AgentExecutionControls
          isExecuting={isExecuting}
          hasMessages={hasMessages}
          onCancel={handleCancel}
          onClear={handleClear}
        />
      </section>

      {/* メッセージ入力 */}
      <AgentMessageInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSendMessage}
        disabled={isExecuting}
        placeholder="メッセージを入力..."
      />

      {/* 権限確認ダイアログ */}
      <PermissionDialog
        request={executionState.pendingPermission}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />
    </div>
  );
};
