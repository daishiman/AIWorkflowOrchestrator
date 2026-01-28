/**
 * SkillStreamDisplay - スキル実行ストリーム表示コンポーネント
 *
 * TASK-3-2: SkillExecutor IPC Integration
 * TASK-3-1-D: Renderer側権限ダイアログUI実装
 * TASK-3-2-A: SkillStreamDisplay UX改善
 *   - R1: ローディングスピナー
 *   - R2: タイムスタンプ表示
 *   - R3: クリップボードコピー
 * TASK-3-2-D: コピー履歴機能
 *   - R4: コピー履歴パネル
 *
 * @module @repo/desktop/renderer/components/AgentView/SkillStreamDisplay
 */

import React, { useEffect, useState } from "react";
import { useSkillExecution } from "../../hooks/useSkillExecution";
import { useSkillPermission } from "../../hooks/useSkillPermission";
import { useCopyHistory } from "../../hooks/useCopyHistory";
import { PermissionDialog } from "../organisms/PermissionDialog/PermissionDialog";
import { CopyHistoryPanel, CopyHistoryToggle } from "./CopyHistoryPanel";
import { formatRelativeTime } from "../../utils/formatTime";
import {
  useTimestampContext,
  TimestampProvider,
} from "../../contexts/TimestampContext";
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
 * R1: ローディングスピナーコンポーネント
 */
const LoadingSpinner = React.memo(function LoadingSpinner() {
  return (
    <div
      data-testid="loading-spinner-container"
      role="status"
      aria-label="実行中"
      className="flex items-center"
    >
      <div
        data-testid="loading-spinner"
        className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"
      />
    </div>
  );
});

/**
 * R3: コピーボタンコンポーネント
 * R4: コピー履歴連携
 */
const CopyButton = React.memo(function CopyButton({
  content,
  messageId,
  onCopySuccess,
}: {
  content: string;
  messageId: string;
  onCopySuccess?: (content: string, messageId: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      // コピー成功時に履歴に追加
      if (onCopySuccess) {
        onCopySuccess(content, messageId);
      }
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Clipboard API非対応時は非表示
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      <button
        data-testid={`copy-button-${messageId}`}
        onClick={handleCopy}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCopy();
          }
        }}
        className="copy-button opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="メッセージをコピー"
        tabIndex={0}
      >
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>
      {copied && (
        <span
          className="copy-feedback text-xs text-green-500"
          role="status"
          aria-live="polite"
        >
          コピーしました
        </span>
      )}
    </div>
  );
});

/**
 * R2: タイムスタンプコンポーネント（自動更新対応）
 *
 * TASK-3-2-C: タイムスタンプ自動更新
 * TimestampContextから現在時刻を取得してバッチ更新
 */
const MessageTimestamp = React.memo(function MessageTimestamp({
  timestamp,
  messageId,
}: {
  timestamp: number;
  messageId: string;
}) {
  // TimestampContextから現在時刻を取得（バッチ更新用）
  const currentTime = useTimestampContext();

  return (
    <span
      data-testid={`message-timestamp-${messageId}`}
      className="text-xs text-gray-400 flex-shrink-0"
    >
      {formatRelativeTime(timestamp, currentTime)}
    </span>
  );
});

/**
 * メッセージアイテムコンポーネント
 * React.memo でパフォーマンス最適化
 *
 * R2: タイムスタンプ表示
 * R3: クリップボードコピー機能
 * R4: コピー履歴連携
 */
const MessageItem = React.memo(function MessageItem({
  message,
  onCopySuccess,
}: {
  message: SkillStreamMessage;
  onCopySuccess?: (content: string, messageId: string) => void;
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
        <div
          className={`message-item ${getMessageClassName()} group flex justify-between items-start gap-2`}
        >
          <span className="tool-name flex-1">{parsed.name}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <MessageTimestamp
              timestamp={message.timestamp}
              messageId={message.id}
            />
            <CopyButton
              content={parsed.name}
              messageId={message.id}
              onCopySuccess={onCopySuccess}
            />
          </div>
        </div>
      );
    } catch {
      return (
        <div
          className={`message-item ${getMessageClassName()} group flex justify-between items-start gap-2`}
        >
          <span className="flex-1">{message.content}</span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <MessageTimestamp
              timestamp={message.timestamp}
              messageId={message.id}
            />
            <CopyButton
              content={message.content}
              messageId={message.id}
              onCopySuccess={onCopySuccess}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div
      className={`message-item ${getMessageClassName()} group flex justify-between items-start gap-2`}
    >
      <span className="flex-1">{message.content}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <MessageTimestamp
          timestamp={message.timestamp}
          messageId={message.id}
        />
        <CopyButton
          content={message.content}
          messageId={message.id}
          onCopySuccess={onCopySuccess}
        />
      </div>
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

  // 権限ダイアログ用フック
  const { pendingPermission, handleApprove, handleDeny } = useSkillPermission();

  // R4: コピー履歴フック
  const { addToHistory, historyCount } = useCopyHistory();

  // R4: 履歴パネル開閉状態
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  // R4: コピー成功時のハンドラ
  const handleCopySuccess = (content: string, messageId: string) => {
    addToHistory(content, messageId);
  };

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
    <TimestampProvider>
      <div
        className={`skill-stream-display ${className || ""}`}
        style={containerStyle}
      >
        {/* スクリーンリーダー用ステータス通知 */}
        <div className="sr-only" role="status" aria-live="polite">
          {getStatusText(status)}
        </div>

        {/* ヘッダー: 実行状態表示 */}
        <div className="stream-header flex items-center justify-between gap-2 p-2 border-b">
          <div className="flex items-center gap-2">
            <span
              className={`status-badge status-${status} px-2 py-1 rounded text-sm`}
            >
              {getStatusText(status)}
            </span>
            {/* R1: ローディングスピナー */}
            {status === "running" && <LoadingSpinner />}
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
          {/* R4: コピー履歴トグル */}
          <div className="relative">
            <CopyHistoryToggle
              isOpen={isHistoryPanelOpen}
              onToggle={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
              historyCount={historyCount}
            />
            <CopyHistoryPanel
              isOpen={isHistoryPanelOpen}
              onClose={() => setIsHistoryPanelOpen(false)}
            />
          </div>
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
            <MessageItem
              key={message.id}
              message={message}
              onCopySuccess={handleCopySuccess}
            />
          ))}
        </div>

        {/* 権限確認ダイアログ */}
        <PermissionDialog
          request={pendingPermission}
          onApprove={handleApprove}
          onDeny={handleDeny}
        />
      </div>
    </TimestampProvider>
  );
}

export default SkillStreamDisplay;
