/**
 * @file PermissionHistoryItem - 個別履歴エントリ表示コンポーネント
 * @feature task-imp-permission-history-001
 */

import React from "react";
import type { PermissionHistoryEntry } from "../../skill/permissionHistory";

// ==========================================================================
// ツールアイコンマッピング（PermissionDialogと共通）
// ==========================================================================

const TOOL_ICONS: Record<string, string> = {
  Bash: "\u{1F4BB}",
  Read: "\u{1F4D6}",
  Write: "\u{270F}\uFE0F",
  Edit: "\u{1F4DD}",
  Glob: "\u{1F50D}",
  Grep: "\u{1F50E}",
  WebSearch: "\u{1F310}",
  WebFetch: "\u{1F4E5}",
  Task: "\u{1F4CB}",
  NotebookEdit: "\u{1F4D3}",
  Skill: "\u{26A1}",
  AskUser: "\u{1F4AC}",
};

// ==========================================================================
// 判断結果バッジ設定
// ==========================================================================

const DECISION_CONFIG = {
  approved: { label: "\u8A31\u53EF", className: "badge-approved" },
  denied: { label: "\u62D2\u5426", className: "badge-denied" },
  approved_once: {
    label: "1\u56DE\u8A31\u53EF",
    className: "badge-approved-once",
  },
} as const;

// ==========================================================================
// ヘルパー関数
// ==========================================================================

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}\u79D2\u524D`;
  if (minutes < 60) return `${minutes}\u5206\u524D`;
  if (hours < 24) return `${hours}\u6642\u9593\u524D`;
  return `${days}\u65E5\u524D`;
}

// ==========================================================================
// コンポーネント
// ==========================================================================

interface PermissionHistoryItemProps {
  entry: PermissionHistoryEntry;
}

export const PermissionHistoryItem: React.FC<PermissionHistoryItemProps> = ({
  entry,
}) => {
  const icon = TOOL_ICONS[entry.toolName] || "\u{1F527}";
  const decisionConfig = DECISION_CONFIG[entry.decision];

  return (
    <div
      data-testid={`history-item-${entry.id}`}
      role="listitem"
      className="permission-history-item"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "8px 12px",
        borderBottom: "1px solid var(--border-color, #e0e0e0)",
      }}
    >
      <span className="tool-icon" style={{ fontSize: "18px" }}>
        {icon}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "2px",
          }}
        >
          <span
            style={{ fontWeight: 600, fontSize: "13px" }}
            className="tool-name"
          >
            {entry.toolName}
          </span>
          <span
            className={`decision-badge ${decisionConfig.className}`}
            style={{
              fontSize: "11px",
              padding: "1px 6px",
              borderRadius: "4px",
              fontWeight: 500,
              backgroundColor:
                entry.decision === "approved"
                  ? "rgba(34, 197, 94, 0.15)"
                  : entry.decision === "denied"
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(234, 179, 8, 0.15)",
              color:
                entry.decision === "approved"
                  ? "#16a34a"
                  : entry.decision === "denied"
                    ? "#dc2626"
                    : "#ca8a04",
            }}
          >
            {decisionConfig.label}
          </span>
        </div>

        <div
          className="args-snapshot"
          style={{
            fontSize: "12px",
            color: "var(--text-secondary, #666)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.argsSnapshot}
        </div>

        <div
          className="timestamp"
          title={entry.timestamp}
          style={{
            fontSize: "11px",
            color: "var(--text-tertiary, #999)",
            marginTop: "2px",
          }}
        >
          {formatRelativeTime(entry.timestamp)}
        </div>
      </div>
    </div>
  );
};
