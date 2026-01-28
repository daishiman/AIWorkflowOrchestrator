/**
 * SkillStreamDisplay - スキル実行ストリーム表示コンポーネント
 *
 * TASK-3-2: SkillExecutor IPC Integration
 * TASK-3-1-D: Renderer側権限ダイアログUI実装
 * TASK-3-2-A: SkillStreamDisplay UX改善
 *   - R1: ローディングスピナー
 *   - R2: タイムスタンプ表示
 *   - R3: クリップボードコピー
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 *   - 多言語化対応（日本語・英語）
 * TASK-3-2-C: タイムスタンプ自動更新
 *   - TimestampContextによるバッチ更新
 *
 * @module @repo/desktop/renderer/components/AgentView/SkillStreamDisplay
 */

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSkillExecution } from "../../hooks/useSkillExecution";
import { useSkillPermission } from "../../hooks/useSkillPermission";
import { PermissionDialog } from "../organisms/PermissionDialog/PermissionDialog";
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
 * R1: ローディングスピナーコンポーネント
 */
const LoadingSpinner = React.memo(function LoadingSpinner({
  ariaLabel,
}: {
  ariaLabel: string;
}) {
  return (
    <div
      data-testid="loading-spinner-container"
      role="status"
      aria-label={ariaLabel}
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
 */
const CopyButton = React.memo(function CopyButton({
  content,
  messageId,
  ariaLabel,
  feedbackText,
}: {
  content: string;
  messageId: string;
  ariaLabel: string;
  feedbackText: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        aria-label={ariaLabel}
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
          {feedbackText}
        </span>
      )}
    </div>
  );
});

/**
 * R2: タイムスタンプコンポーネント（自動更新対応）
 *
 * TASK-3-2-B: i18n対応（locale引数追加）
 * TASK-3-2-C: タイムスタンプ自動更新
 * TimestampContextから現在時刻を取得してバッチ更新
 */
const MessageTimestamp = React.memo(function MessageTimestamp({
  timestamp,
  messageId,
  locale,
}: {
  timestamp: number;
  messageId: string;
  locale: string;
}) {
  // TimestampContextから現在時刻を取得（バッチ更新用）
  const currentTime = useTimestampContext();

  return (
    <span
      data-testid={`message-timestamp-${messageId}`}
      className="text-xs text-gray-400 flex-shrink-0"
    >
      {formatRelativeTime(timestamp, locale, currentTime)}
    </span>
  );
});

/**
 * メッセージアイテムコンポーネント
 * React.memo でパフォーマンス最適化
 *
 * R2: タイムスタンプ表示
 * R3: クリップボードコピー機能
 */
const MessageItem = React.memo(function MessageItem({
  message,
  locale,
  copyAriaLabel,
  copyFeedbackText,
}: {
  message: SkillStreamMessage;
  locale: string;
  copyAriaLabel: string;
  copyFeedbackText: string;
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
              locale={locale}
            />
            <CopyButton
              content={parsed.name}
              messageId={message.id}
              ariaLabel={copyAriaLabel}
              feedbackText={copyFeedbackText}
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
              locale={locale}
            />
            <CopyButton
              content={message.content}
              messageId={message.id}
              ariaLabel={copyAriaLabel}
              feedbackText={copyFeedbackText}
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
          locale={locale}
        />
        <CopyButton
          content={message.content}
          messageId={message.id}
          ariaLabel={copyAriaLabel}
          feedbackText={copyFeedbackText}
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
  const { t, i18n } = useTranslation("skill-stream");
  const { messages, status, error, execute, abort, reset, isAborting } =
    useSkillExecution(skillId);

  // 権限ダイアログ用フック
  const { pendingPermission, handleApprove, handleDeny } = useSkillPermission();

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

  // 翻訳されたテキストを取得
  const statusText = t(`status.${status}`);
  const loadingAriaLabel = t("aria.loading");
  const copyAriaLabel = t("aria.copyMessage");
  const copyFeedbackText = t("feedback.copied");
  const abortAriaLabel = t("aria.abortExecution");
  const resetAriaLabel = t("aria.resetState");
  const abortButtonText = t("button.abort");
  const resetButtonText = t("button.reset");
  const startPromptMessage = t("message.startPrompt");
  const executingMessage = t("message.executing");

  return (
    <TimestampProvider>
      <div
        className={`skill-stream-display ${className || ""}`}
        style={containerStyle}
      >
        {/* スクリーンリーダー用ステータス通知 */}
        <div className="sr-only" role="status" aria-live="polite">
          {statusText}
        </div>

        {/* ヘッダー: 実行状態表示 */}
        <div className="stream-header flex items-center gap-2 p-2 border-b">
          <span
            className={`status-badge status-${status} px-2 py-1 rounded text-sm`}
          >
            {statusText}
          </span>
          {/* R1: ローディングスピナー */}
          {status === "running" && (
            <LoadingSpinner ariaLabel={loadingAriaLabel} />
          )}
          {status === "running" && (
            <button
              onClick={abort}
              disabled={isAborting}
              aria-label={abortAriaLabel}
              className="abort-button px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {abortButtonText}
            </button>
          )}
          {(status === "completed" ||
            status === "error" ||
            status === "aborted") && (
            <button
              onClick={reset}
              aria-label={resetAriaLabel}
              className="reset-button px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {resetButtonText}
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
            <p className="text-gray-500">{startPromptMessage}</p>
          )}
          {status === "running" && messages.length === 0 && (
            <p className="text-gray-500">{executingMessage}</p>
          )}
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              locale={i18n.language}
              copyAriaLabel={copyAriaLabel}
              copyFeedbackText={copyFeedbackText}
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
