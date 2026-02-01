/**
 * PermissionSettings - 許可済みツール設定コンポーネント
 *
 * TASK-3-1-E: rememberChoice機能永続化
 *
 * 許可済みツールの一覧表示、個別取り消し、全クリア機能を提供するUIコンポーネント。
 *
 * @module @repo/desktop/renderer/components/settings/PermissionSettings
 */

import React, { useCallback, useEffect, useState } from "react";
import type { AllowedToolEntry } from "@repo/shared";
import { PermissionHistoryPanel } from "./PermissionHistoryPanel";

/**
 * コンポーネントプロパティ
 */
export interface PermissionSettingsProps {
  /** カスタムクラス名 */
  className?: string;
}

/**
 * 日付フォーマット関数
 */
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString();
  } catch {
    return isoString;
  }
}

/**
 * PermissionSettings コンポーネント
 *
 * 許可済みツールの管理UI
 *
 * @example
 * ```tsx
 * <PermissionSettings className="mt-4" />
 * ```
 */
export function PermissionSettings({
  className = "",
}: PermissionSettingsProps): React.ReactElement {
  const [tools, setTools] = useState<AllowedToolEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [revokingTool, setRevokingTool] = useState<string | null>(null);

  /**
   * 許可済みツール一覧を取得
   */
  const loadTools = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await window.permissionAPI.getAllowedTools();
      setTools(result.tools);
    } catch (err) {
      console.error("[PermissionSettings] Failed to load tools:", err);
      setError("Failed to load permission settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 初回マウント時にデータを取得
   */
  useEffect(() => {
    loadTools();
  }, [loadTools]);

  /**
   * 個別ツールの許可を取り消し
   */
  const handleRevoke = useCallback(
    async (toolName: string) => {
      setRevokingTool(toolName);
      setError(null);
      try {
        const result = await window.permissionAPI.revokeTool(toolName);
        if (result.success) {
          await loadTools();
        } else {
          setError(`Failed to revoke permission for ${toolName}`);
        }
      } catch (err) {
        console.error("[PermissionSettings] Failed to revoke tool:", err);
        setError(`Failed to revoke permission for ${toolName}`);
      } finally {
        setRevokingTool(null);
      }
    },
    [loadTools],
  );

  /**
   * 全許可をクリア
   */
  const handleClearAll = useCallback(async () => {
    if (tools.length === 0) return;

    setIsClearing(true);
    setError(null);
    try {
      const result = await window.permissionAPI.clearAll();
      if (result.success) {
        await loadTools();
      } else {
        setError("Failed to clear all permissions");
      }
    } catch (err) {
      console.error("[PermissionSettings] Failed to clear all:", err);
      setError("Failed to clear all permissions");
    } finally {
      setIsClearing(false);
    }
  }, [tools.length, loadTools]);

  // ローディング状態
  if (isLoading) {
    return (
      <div
        className={`permission-settings ${className}`}
        data-testid="permission-settings"
        aria-busy="true"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`permission-settings ${className}`}
      data-testid="permission-settings"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Allowed Tools
        </h3>
        {tools.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            disabled={isClearing}
            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-busy={isClearing}
          >
            {isClearing ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Tools that have been allowed to execute without asking for permission.
        You can revoke individual permissions or clear all at once.
      </p>

      {error && (
        <div
          className="mb-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {tools.length === 0 ? (
        <div
          className="text-center py-8 text-gray-500 dark:text-gray-400"
          data-testid="empty-state"
        >
          <p>No tools have been allowed yet.</p>
          <p className="text-sm mt-1">
            When you allow a tool with &quot;Remember this choice&quot;, it will
            appear here.
          </p>
        </div>
      ) : (
        <ul
          className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-md"
          role="list"
          aria-label="Allowed tools"
        >
          {tools.map((tool) => (
            <li
              key={tool.toolName}
              className="flex items-center justify-between px-4 py-3"
              data-testid={`tool-item-${tool.toolName}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {tool.toolName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allowed: {formatDate(tool.allowedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRevoke(tool.toolName)}
                disabled={revokingTool === tool.toolName}
                className="ml-4 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Revoke permission for ${tool.toolName}`}
                aria-busy={revokingTool === tool.toolName}
              >
                {revokingTool === tool.toolName ? "Revoking..." : "Revoke"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        {tools.length} tool{tools.length !== 1 ? "s" : ""} allowed
      </div>

      {/* 権限要求履歴パネル */}
      <PermissionHistoryPanel />
    </div>
  );
}

export default PermissionSettings;
