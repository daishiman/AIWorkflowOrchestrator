/**
 * SkillStreamDisplay - スキル実行ストリーム表示コンポーネント
 *
 * TASK-3-2: SkillExecutor IPC Integration
 *
 * @module @repo/desktop/renderer/components/AgentView/SkillStreamDisplay
 */

import React, { useEffect } from "react";
import { useSkillExecution } from "../../hooks/useSkillExecution";
import type {
  SkillStreamMessage,
  SkillExecutionError,
} from "@repo/shared/types/skill-execution";

/**
 * SkillStreamDisplay Props
 */
export interface SkillStreamDisplayProps {
  /** スキルID */
  skillId: string;
  /** 初期プロンプト */
  initialPrompt?: string;
  /** 自動実行フラグ */
  autoExecute?: boolean;
  /** 完了時コールバック */
  onComplete?: () => void;
  /** エラー時コールバック */
  onError?: (error: SkillExecutionError) => void;
  /** ステータス変更時コールバック */
  onStatusChange?: (status: string) => void;
  /** 高さ */
  height?: string | number;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * ステータス表示テキストを取得
 */
function getStatusText(status: string): string {
  switch (status) {
    case "idle":
      return "待機中";
    case "running":
      return "実行中";
    case "completed":
      return "完了";
    case "error":
      return "エラー";
    case "aborted":
      return "中断";
    default:
      return status;
  }
}

/**
 * メッセージアイテムコンポーネント
 * React.memo でパフォーマンス最適化
 */
const MessageItem = React.memo(function MessageItem({
  message,
}: {
  message: SkillStreamMessage;
}) {
  const getMessageClassName = (): string => {
    switch (message.type) {
      case "text":
        return "message-text";
      case "tool_use":
        return "message-tool-use";
      case "error":
        return "message-error text-red-500";
      default:
        return "";
    }
  };

  // complete タイプは表示しない
  if (message.type === "complete") {
    return null;
  }

  // tool_use の場合はツール名を抽出して表示
  if (message.type === "tool_use") {
    try {
      const parsed = JSON.parse(message.content);
      return (
        <div className={`message-item ${getMessageClassName()}`}>
          <span className="tool-name">{parsed.name}</span>
        </div>
      );
    } catch {
      return (
        <div className={`message-item ${getMessageClassName()}`}>
          <span>{message.content}</span>
        </div>
      );
    }
  }

  return (
    <div className={`message-item ${getMessageClassName()}`}>
      <span>{message.content}</span>
    </div>
  );
});

/**
 * スキル実行ストリーム表示コンポーネント
 *
 * @example
 * ```tsx
 * <SkillStreamDisplay
 *   skillId="my-skill"
 *   initialPrompt="Analyze this code"
 *   autoExecute={true}
 *   onComplete={() => console.log("Done!")}
 * />
 * ```
 */
export function SkillStreamDisplay({
  skillId,
  initialPrompt,
  autoExecute = false,
  onComplete,
  onError,
  onStatusChange,
  height = "auto",
  className,
}: SkillStreamDisplayProps) {
  const { messages, status, error, execute, abort, reset, isAborting } =
    useSkillExecution(skillId);

  // ステータス変更時のコールバック
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  // 完了時のコールバック
  useEffect(() => {
    if (status === "completed" && onComplete) {
      onComplete();
    }
  }, [status, onComplete]);

  // エラー時のコールバック
  useEffect(() => {
    if (status === "error" && error && onError) {
      onError(error);
    }
  }, [status, error, onError]);

  // 自動実行
  useEffect(() => {
    if (autoExecute && initialPrompt && status === "idle") {
      execute(initialPrompt);
    }
  }, [autoExecute, initialPrompt, status, execute]);

  const containerStyle: React.CSSProperties = {
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={`skill-stream-display ${className || ""}`}
      style={containerStyle}
    >
      {/* スクリーンリーダー用ステータス通知 */}
      <div className="sr-only" role="status" aria-live="polite">
        {getStatusText(status)}
      </div>

      {/* ヘッダー: 実行状態表示 */}
      <div className="stream-header flex items-center gap-2 p-2 border-b">
        <span
          className={`status-badge status-${status} px-2 py-1 rounded text-sm`}
        >
          {getStatusText(status)}
        </span>
        {status === "running" && (
          <button
            onClick={abort}
            disabled={isAborting}
            aria-label="スキル実行を中断"
            className="abort-button px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            中断
          </button>
        )}
        {(status === "completed" ||
          status === "error" ||
          status === "aborted") && (
          <button
            onClick={reset}
            aria-label="状態をリセット"
            className="reset-button px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            リセット
          </button>
        )}
      </div>

      {/* メッセージ一覧 */}
      <div
        className="stream-content p-2 overflow-y-auto"
        role="log"
        aria-live="polite"
      >
        {status === "idle" && messages.length === 0 && (
          <p className="text-gray-500">スキル実行を開始してください</p>
        )}
        {status === "running" && messages.length === 0 && (
          <p className="text-gray-500">実行中...</p>
        )}
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}

export default SkillStreamDisplay;
