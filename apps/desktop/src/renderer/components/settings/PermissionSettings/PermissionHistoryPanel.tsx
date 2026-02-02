/**
 * @file PermissionHistoryPanel - 権限要求履歴パネル
 * @description PermissionSettingsに統合される履歴表示パネル
 * @feature task-imp-permission-history-001
 */

import React, { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useAppStore } from "../../../store";
import { PermissionHistoryFilter } from "./PermissionHistoryFilter";
import { PermissionHistoryItem } from "./PermissionHistoryItem";
import { filterByDateRange } from "./dateFilterUtils";

// ==========================================================================
// コンポーネント
// ==========================================================================

interface PermissionHistoryPanelProps {
  className?: string;
}

export const PermissionHistoryPanel: React.FC<PermissionHistoryPanelProps> = ({
  className,
}) => {
  const permissionHistory = useAppStore((s) => s.permissionHistory);
  const historyFilter = useAppStore((s) => s.historyFilter);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const setHistoryFilter = useAppStore((s) => s.setHistoryFilter);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // フィルタ適用後のエントリ
  const filteredEntries = useMemo(() => {
    let entries = permissionHistory;

    if (historyFilter.toolName) {
      entries = entries.filter((e) => e.toolName === historyFilter.toolName);
    }

    if (historyFilter.decision) {
      entries = entries.filter((e) => e.decision === historyFilter.decision);
    }

    if (historyFilter.dateRange) {
      entries = filterByDateRange(entries, historyFilter.dateRange);
    }

    return entries;
  }, [permissionHistory, historyFilter]);

  // ユニークツール名一覧
  const availableTools = useMemo(() => {
    const tools = new Set(permissionHistory.map((e) => e.toolName));
    return Array.from(tools).sort();
  }, [permissionHistory]);

  // 仮想スクロール
  const virtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  const handleClear = () => {
    if (window.confirm("権限要求履歴をすべてクリアしますか？")) {
      clearHistory();
    }
  };

  return (
    <section
      role="region"
      aria-label="権限要求履歴"
      className={className}
      style={{ marginTop: "24px" }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 12px 8px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
          権限要求履歴
          <span
            style={{
              marginLeft: "8px",
              fontSize: "12px",
              fontWeight: 400,
              color: "var(--text-secondary, #666)",
            }}
          >
            {filteredEntries.length}件
            {filteredEntries.length !== permissionHistory.length &&
              ` / ${permissionHistory.length}件`}
          </span>
        </h3>

        <button
          onClick={handleClear}
          disabled={permissionHistory.length === 0}
          aria-label="履歴をクリア"
          style={{
            padding: "4px 12px",
            fontSize: "12px",
            borderRadius: "4px",
            border: "1px solid var(--border-color, #ccc)",
            backgroundColor: "transparent",
            cursor: permissionHistory.length === 0 ? "not-allowed" : "pointer",
            opacity: permissionHistory.length === 0 ? 0.5 : 1,
          }}
        >
          クリア
        </button>
      </div>

      {/* フィルタ */}
      <PermissionHistoryFilter
        filter={historyFilter}
        onFilterChange={setHistoryFilter}
        availableTools={availableTools}
      />

      {/* リスト */}
      {filteredEntries.length === 0 ? (
        <div
          style={{
            padding: "24px 12px",
            textAlign: "center",
            color: "var(--text-secondary, #666)",
            fontSize: "13px",
          }}
        >
          {permissionHistory.length === 0
            ? "権限要求の履歴はありません"
            : "フィルタ条件に一致する履歴はありません"}
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          role="list"
          aria-label="履歴リスト"
          style={{
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const entry = filteredEntries[virtualItem.index];
              return (
                <div
                  key={entry.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <PermissionHistoryItem entry={entry} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
