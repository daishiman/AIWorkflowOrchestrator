/**
 * @file PermissionHistoryFilter - フィルタUIコンポーネント
 * @feature task-imp-permission-history-001
 */

import React from "react";
import type {
  PermissionHistoryFilter as FilterType,
  PermissionDecision,
} from "../../skill/permissionHistory";

// ==========================================================================
// コンポーネント
// ==========================================================================

interface PermissionHistoryFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  availableTools: string[];
}

export const PermissionHistoryFilter: React.FC<
  PermissionHistoryFilterProps
> = ({ filter, onFilterChange, availableTools }) => {
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

  return (
    <div
      className="permission-history-filter"
      style={{
        display: "flex",
        gap: "8px",
        padding: "8px 12px",
      }}
    >
      <select
        aria-label={"\u30C4\u30FC\u30EB"}
        value={filter.toolName ?? ""}
        onChange={handleToolChange}
        style={{
          flex: 1,
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid var(--border-color, #ccc)",
          fontSize: "12px",
          backgroundColor: "var(--bg-secondary, #f5f5f5)",
        }}
      >
        <option value="">{"\u5168\u3066\u306E\u30C4\u30FC\u30EB"}</option>
        {availableTools.map((tool) => (
          <option key={tool} value={tool}>
            {tool}
          </option>
        ))}
      </select>

      <select
        aria-label={"\u5224\u65AD\u7D50\u679C"}
        value={filter.decision ?? ""}
        onChange={handleDecisionChange}
        style={{
          flex: 1,
          padding: "4px 8px",
          borderRadius: "4px",
          border: "1px solid var(--border-color, #ccc)",
          fontSize: "12px",
          backgroundColor: "var(--bg-secondary, #f5f5f5)",
        }}
      >
        <option value="">{"\u5168\u3066\u306E\u7D50\u679C"}</option>
        <option value="approved">{"\u8A31\u53EF"}</option>
        <option value="denied">{"\u62D2\u5426"}</option>
        <option value="approved_once">{"1\u56DE\u8A31\u53EF"}</option>
      </select>
    </div>
  );
};
