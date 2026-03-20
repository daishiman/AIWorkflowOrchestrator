/**
 * @file SkillStreamingView Component
 * @description スキル実行結果のストリーミング表示コンポーネント
 * @feature skill-import-agent-system
 * @task TASK-7D ChatPanel 統合
 * @see specification.md §4.4.1 実行中ストリーミング表示
 */

import React, { memo } from "react";
import type { SkillStreamMessage, SkillExecutionStatus } from "@repo/shared";
import { useAppStore } from "../../store";

// ============================================
// Types
// ============================================

export interface SkillStreamingViewProps {
  /** 実行中のスキル名 */
  skillName: string;
  /** ストリーミングメッセージ一覧 */
  messages: SkillStreamMessage[];
  /** 実行ステータス */
  status: SkillExecutionStatus | null;
}

// ============================================
// Constants
// ============================================

type DisplayableStatus = Exclude<SkillExecutionStatus, "idle">;

const STATUS_CONFIG: Record<
  DisplayableStatus,
  { color: string; label: string }
> = {
  running: { color: "bg-blue-500", label: "実行中..." },
  permission_pending: { color: "bg-yellow-500", label: "権限確認中" },
  completed: { color: "bg-green-500", label: "完了" },
  cancelled: { color: "bg-gray-500", label: "キャンセル" },
  error: { color: "bg-red-500", label: "エラー" },
  review: { color: "bg-purple-500", label: "レビュー中" },
  improve_ready: { color: "bg-orange-500", label: "改善準備完了" },
  reuse_ready: { color: "bg-teal-500", label: "再利用準備完了" },
};

// ============================================
// Sub-components
// ============================================

/**
 * StatusBadge - ステータスバッジ表示
 */
const StatusBadge: React.FC<{ status: SkillExecutionStatus | null }> = ({
  status,
}) => {
  if (!status || status === "idle") return null;

  const config = STATUS_CONFIG[status as DisplayableStatus];
  if (!config) return null;

  return (
    <span
      role="status"
      className={`${config.color} text-white text-xs px-2 py-0.5 rounded-full`}
      data-testid="status-badge"
    >
      {config.label}
    </span>
  );
};

/**
 * StreamMessageItem - メッセージアイテム表示
 */
const StreamMessageItem: React.FC<{ message: SkillStreamMessage }> = ({
  message,
}) => {
  switch (message.type) {
    case "assistant":
      return (
        <div
          className="whitespace-pre-wrap break-words"
          data-testid="assistant-message"
        >
          {message.content.text}
          {message.content.isPartial && (
            <span
              className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-current"
              data-testid="partial-cursor"
              aria-label="入力中"
            />
          )}
        </div>
      );

    case "tool_use":
      return (
        <div
          className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-sm"
          data-testid="tool-use-message"
        >
          {"🔧"} ツール使用: {message.content.toolName}
        </div>
      );

    case "tool_result":
      return message.content.success ? (
        <div
          className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-sm"
          data-testid="tool-result-success"
        >
          {"✅"} 完了
        </div>
      ) : (
        <div
          className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-sm"
          data-testid="tool-result-error"
        >
          {"❌"} エラー: {message.content.error}
        </div>
      );

    case "error":
      return (
        <div
          className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 rounded text-sm"
          data-testid="error-message"
        >
          {message.content.message}
        </div>
      );

    case "status":
      return null;

    default:
      // Exhaustive check: all SkillStreamMessage types handled above
      return null;
  }
};

/**
 * ToolExecutionHistory - ツール実行履歴の折りたたみ表示
 */
const ToolExecutionHistory: React.FC<{
  messages: SkillStreamMessage[];
}> = ({ messages }) => {
  const toolMessages = messages.filter(
    (m) => m.type === "tool_use" || m.type === "tool_result",
  );

  if (toolMessages.length === 0) return null;

  const toolCount = Math.floor(toolMessages.length / 2);

  return (
    <details className="mt-4" data-testid="tool-execution-history">
      <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
        ツール実行履歴（{toolCount}件）
      </summary>
      <div className="mt-2 space-y-1">
        {toolMessages.map((msg, index) => (
          <div
            key={`${msg.timestamp}-${index}`}
            className="text-xs text-gray-500"
          >
            {msg.type === "tool_use" && (
              <span>
                {"🔧"} {msg.content.toolName}
              </span>
            )}
            {msg.type === "tool_result" && (
              <span>
                {msg.content.success ? "✅" : "❌"}{" "}
                {msg.content.success ? "完了" : `エラー: ${msg.content.error}`}
              </span>
            )}
          </div>
        ))}
      </div>
    </details>
  );
};

// ============================================
// Main Component
// ============================================

/**
 * SkillStreamingView - スキル実行結果のストリーミング表示
 *
 * @example
 * ```tsx
 * <SkillStreamingView
 *   skillName="presentation-creator"
 *   messages={streamingMessages}
 *   status={skillExecutionStatus}
 * />
 * ```
 */
export const SkillStreamingView: React.FC<SkillStreamingViewProps> = memo(
  ({ skillName, messages, status }) => {
    const abortExecution = useAppStore((s) => s.abortExecution);

    return (
      <div
        className="border-t p-4 bg-gray-50 dark:bg-gray-900"
        data-testid="skill-streaming-view"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm" data-testid="skill-name">
              {skillName}
            </span>
            <StatusBadge status={status} />
          </div>
          {status === "running" && (
            <button
              type="button"
              onClick={abortExecution}
              aria-label="スキル実行を中止する"
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded px-2 py-1"
              data-testid="abort-button"
            >
              停止する
            </button>
          )}
        </div>

        {/* Message Display */}
        <div
          role="log"
          aria-live="polite"
          aria-label="スキル実行結果"
          className="space-y-3"
          data-testid="message-container"
        >
          {messages.map((msg, index) => (
            <StreamMessageItem
              key={`${msg.timestamp}-${index}`}
              message={msg}
            />
          ))}
        </div>

        {/* Tool Execution History */}
        <ToolExecutionHistory messages={messages} />
      </div>
    );
  },
);

SkillStreamingView.displayName = "SkillStreamingView";
