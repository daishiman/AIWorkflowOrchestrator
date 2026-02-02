/**
 * @file PermissionHistoryFilter - フィルタUIコンポーネント
 * @feature task-imp-permission-history-001
 * @feature task-imp-permission-date-filter
 */

import React from "react";
import type {
  PermissionHistoryFilter as FilterType,
  PermissionDecision,
  DatePreset,
} from "../../skill/permissionHistory";

// ==========================================================================
// コンポーネント
// ==========================================================================

interface PermissionHistoryFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  availableTools: string[];
}

const selectStyle: React.CSSProperties = {
  flex: 1,
  padding: "4px 8px",
  borderRadius: "4px",
  border: "1px solid var(--border-color, #ccc)",
  fontSize: "12px",
  backgroundColor: "var(--bg-secondary, #f5f5f5)",
};

const dateInputStyle: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "4px",
  border: "1px solid var(--border-color, #ccc)",
  fontSize: "12px",
  backgroundColor: "var(--bg-secondary, #f5f5f5)",
};

export const PermissionHistoryFilter: React.FC<
  PermissionHistoryFilterProps
> = ({ filter, onFilterChange, availableTools }) => {
  const currentPreset: DatePreset = filter.dateRange?.preset ?? "all";

  const handleToolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filter,
      toolName: value === "" ? undefined : value,
    });
  };

  const handleDecisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filter,
      decision: value === "" ? undefined : (value as PermissionDecision),
    });
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = e.target.value as DatePreset;
    onFilterChange({
      ...filter,
      dateRange: {
        preset,
        ...(preset === "custom"
          ? { start: filter.dateRange?.start, end: filter.dateRange?.end }
          : {}),
      },
    });
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      dateRange: {
        ...filter.dateRange,
        preset: "custom",
        start: e.target.value || undefined,
      },
    });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      dateRange: {
        ...filter.dateRange,
        preset: "custom",
        end: e.target.value || undefined,
      },
    });
  };

  return (
    <div className="permission-history-filter">
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "8px 12px",
        }}
      >
        <select
          aria-label="ツール"
          value={filter.toolName ?? ""}
          onChange={handleToolChange}
          style={selectStyle}
        >
          <option value="">全てのツール</option>
          {availableTools.map((tool) => (
            <option key={tool} value={tool}>
              {tool}
            </option>
          ))}
        </select>

        <select
          aria-label="判断結果"
          value={filter.decision ?? ""}
          onChange={handleDecisionChange}
          style={selectStyle}
        >
          <option value="">全ての結果</option>
          <option value="approved">許可</option>
          <option value="denied">拒否</option>
          <option value="approved_once">1回許可</option>
        </select>

        <select
          aria-label="期間フィルタ"
          value={currentPreset}
          onChange={handlePresetChange}
          style={selectStyle}
        >
          <option value="all">全期間</option>
          <option value="today">今日</option>
          <option value="week">過去7日</option>
          <option value="month">過去30日</option>
          <option value="custom">カスタム範囲</option>
        </select>
      </div>

      {currentPreset === "custom" && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "4px 12px 8px",
            alignItems: "center",
          }}
        >
          <label>
            <span style={{ fontSize: "11px", marginRight: "4px" }}>開始日</span>
            <input
              type="date"
              aria-label="開始日"
              value={filter.dateRange?.start ?? ""}
              onChange={handleStartChange}
              style={dateInputStyle}
            />
          </label>
          <span
            style={{ fontSize: "12px", color: "var(--text-secondary, #666)" }}
          >
            〜
          </span>
          <label>
            <span style={{ fontSize: "11px", marginRight: "4px" }}>終了日</span>
            <input
              type="date"
              aria-label="終了日"
              value={filter.dateRange?.end ?? ""}
              onChange={handleEndChange}
              style={dateInputStyle}
            />
          </label>
        </div>
      )}
    </div>
  );
};
