/**
 * PermissionDialog - スキル実行時の権限確認ダイアログ
 *
 * TASK-7C: PermissionDialog コンポーネント
 *
 * スキル実行中にツール使用の権限確認を求めるモーダルダイアログ。
 * Store直結でpendingPermissionを監視し、3段階の応答（拒否/1回許可/許可）を提供する。
 *
 * @module @repo/desktop/renderer/components/skill/PermissionDialog
 */

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import { useAppStore } from "../../store";
import { getDescription } from "./permissionDescriptions";
import {
  getRiskLevel,
  getSecurityImpact,
  type RiskLevel,
} from "./toolMetadata";

/**
 * ツール名からEmojiアイコンへのマッピング
 * 元タスク仕様書（TASK-7C）で定義されたtoolIcons
 */
const TOOL_ICONS: Record<string, string> = {
  Bash: "💻",
  Read: "📖",
  Write: "✏️",
  Edit: "📝",
  Glob: "🔍",
  Grep: "🔎",
  LS: "📁",
  Task: "📋",
  WebSearch: "🌐",
  WebFetch: "🌐",
};

/** デフォルトアイコン（未定義ツール用） */
const DEFAULT_TOOL_ICON = "🔧";

/** リスクレベル別スタイルマッピング */
const RISK_LEVEL_STYLES: Record<
  RiskLevel,
  { bg: string; text: string; border: string }
> = {
  Low: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200",
  },
  Medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  High: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    border: "border-orange-200",
  },
  Critical: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200",
  },
};

/**
 * ツール名に対応するアイコンを返す
 * 未定義ツールの場合はデフォルトアイコン（🔧）を返す
 */
function getToolIcon(toolName: string): string {
  return TOOL_ICONS[toolName] ?? DEFAULT_TOOL_ICON;
}

/**
 * ツール引数を表示用にフォーマットする
 *
 * - Bashコマンド: args.command を直接返す
 * - ファイルパス: args.path を直接返す
 * - その他: JSON形式で返す
 */
function formatArgs(args: Record<string, unknown>): string {
  if (args.command && typeof args.command === "string") {
    return args.command;
  }
  if (args.path && typeof args.path === "string") {
    return args.path;
  }
  return JSON.stringify(args, null, 2);
}

export const PermissionDialog: React.FC = () => {
  const { pendingPermission, respondToSkillPermission } = useAppStore();
  const [rememberChoice, setRememberChoice] = useState(false);
  const [isDetailExpanded, setIsDetailExpanded] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);
  const approveButtonRef = useRef<HTMLButtonElement>(null);
  const uniqueId = useId();

  const handleApprove = useCallback(() => {
    respondToSkillPermission(true, rememberChoice);
    setRememberChoice(false);
  }, [respondToSkillPermission, rememberChoice]);

  const handleApproveOnce = useCallback(() => {
    respondToSkillPermission(true, false);
    setRememberChoice(false);
  }, [respondToSkillPermission]);

  const handleDeny = useCallback(() => {
    respondToSkillPermission(false, false);
    setRememberChoice(false);
  }, [respondToSkillPermission]);

  // Escapeキーハンドリング
  useEffect(() => {
    if (!pendingPermission) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        handleDeny();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [pendingPermission, handleDeny]);

  // ダイアログ表示時に許可ボタンへ初期フォーカス
  useEffect(() => {
    if (pendingPermission && approveButtonRef.current) {
      approveButtonRef.current.focus();
    }
  }, [pendingPermission]);

  // フォーカストラップ
  useEffect(() => {
    if (!pendingPermission) return;

    const handleTabKey = (event: KeyboardEvent): void => {
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'button, input[type="checkbox"], [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [pendingPermission]);

  if (!pendingPermission) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uniqueId}-title`}
        aria-describedby={`${uniqueId}-description`}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden"
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-yellow-50">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <h2
              id={`${uniqueId}-title`}
              className="text-lg font-semibold text-gray-900"
            >
              権限の確認
            </h2>
          </div>
          <button
            onClick={handleDeny}
            aria-label="閉じる"
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-4">
          <p
            id={`${uniqueId}-description`}
            className="text-sm text-gray-600 mb-4"
          >
            エージェントが以下の操作を実行しようとしています。許可しますか？
          </p>

          {/* ツール情報 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">ツール:</span>
              <span className="px-2 py-0.5 bg-gray-200 rounded text-sm font-mono font-medium inline-flex items-center gap-1">
                <span aria-hidden="true">
                  {getToolIcon(pendingPermission.toolName)}
                </span>
                {pendingPermission.toolName}
              </span>
              {(() => {
                const riskLevel = getRiskLevel(pendingPermission.toolName);
                const styles = RISK_LEVEL_STYLES[riskLevel];
                return (
                  <span
                    className={`${styles.bg} ${styles.text} ${styles.border} border px-1.5 py-0.5 rounded text-xs font-medium`}
                    aria-label={`リスクレベル: ${riskLevel}`}
                  >
                    {riskLevel}
                  </span>
                );
              })()}
            </div>

            {/* 人間可読説明文 */}
            <p className="text-sm text-gray-600 mt-2">
              {getDescription(
                pendingPermission.toolName,
                pendingPermission.args,
              )}
            </p>

            {/* セキュリティ影響テキスト */}
            <p className="text-xs text-gray-500 mt-1">
              {getSecurityImpact(pendingPermission.toolName)}
            </p>

            {/* 詳細展開ボタン */}
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-600 mt-2 flex items-center gap-1"
              onClick={() => setIsDetailExpanded(!isDetailExpanded)}
              aria-expanded={isDetailExpanded}
              aria-controls={`${uniqueId}-detail`}
            >
              {isDetailExpanded ? "詳細を隠す ▲" : "詳細を表示 ▼"}
            </button>

            {/* 技術的詳細（折りたたみ） */}
            {isDetailExpanded && (
              <div id={`${uniqueId}-detail`} role="region" className="mt-2">
                <pre className="p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                  {formatArgs(pendingPermission.args)}
                </pre>
              </div>
            )}
          </div>

          {/* 理由表示 */}
          {pendingPermission.reason && (
            <div className="mb-4">
              <span className="text-xs text-gray-500">理由:</span>
              <p className="text-sm text-gray-700 mt-1">
                {pendingPermission.reason}
              </p>
            </div>
          )}

          {/* チェックボックス */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
              className="rounded border-gray-300"
            />
            このセッション中は同様の操作を自動許可する
          </label>
        </div>

        {/* フッター */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleDeny}
            className="px-4 py-2 text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            拒否
          </button>
          <button
            onClick={handleApproveOnce}
            className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-100"
          >
            1回許可
          </button>
          <button
            ref={approveButtonRef}
            onClick={handleApprove}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            許可
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionDialog;
