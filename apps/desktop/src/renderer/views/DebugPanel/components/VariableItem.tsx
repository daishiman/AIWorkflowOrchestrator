/**
 * VariableItem - 変数表示項目（Molecule）
 *
 * 単一の変数をキー・値・型で表示する。
 * オブジェクト/配列の場合は展開可能なツリー表示を提供する。
 *
 * @module VariableItem
 */

import React, { memo, useState, useCallback } from "react";
import clsx from "clsx";
import { Icon } from "../../../components/atoms/Icon";

export interface VariableItemProps {
  /** 変数名 */
  name: string;
  /** 変数の値 */
  value: unknown;
  /** ネストの深さ（インデント用） */
  depth?: number;
}

/** 値の型を文字列で取得する */
function getValueType(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

/** 値の表示文字列を取得する */
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>);
    return `Object {${keys.length}}`;
  }
  return String(value);
}

/** 値が展開可能かどうかを判定する */
function isExpandable(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  return typeof value === "object";
}

/** 型に応じたテキスト色 */
function getValueColor(value: unknown): string {
  if (value === null || value === undefined) return "text-[var(--text-muted)]";
  if (typeof value === "string") return "text-[var(--status-success)]";
  if (typeof value === "number") return "text-[var(--status-primary)]";
  if (typeof value === "boolean") return "text-[var(--status-warning)]";
  return "text-[var(--text-secondary)]";
}

export const VariableItem: React.FC<VariableItemProps> = memo(
  ({ name, value, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const canExpand = isExpandable(value);
    const valueType = getValueType(value);

    const toggleExpand = useCallback(() => {
      setIsExpanded((prev) => !prev);
    }, []);

    const childEntries: [string, unknown][] =
      canExpand && isExpanded
        ? Array.isArray(value)
          ? value.map((v, i) => [String(i), v])
          : Object.entries(value as Record<string, unknown>)
        : [];

    return (
      <div data-testid={`variable-item-${name}`}>
        <div
          className={clsx(
            "flex items-center gap-1 py-0.5 px-2 rounded-md",
            "hover:bg-[var(--bg-tertiary)] cursor-default",
            "text-sm",
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          role="treeitem"
          aria-expanded={canExpand ? isExpanded : undefined}
          aria-label={`${name}: ${formatValue(value)}`}
        >
          {/* 展開/折りたたみアイコン */}
          {canExpand ? (
            <button
              onClick={toggleExpand}
              className="p-0.5 rounded hover:bg-[var(--bg-secondary)]"
              aria-label={isExpanded ? "折りたたむ" : "展開"}
              data-testid={`variable-toggle-${name}`}
            >
              <Icon
                name={isExpanded ? "chevron-down" : "chevron-right"}
                size={12}
              />
            </button>
          ) : (
            <span className="w-4" />
          )}

          {/* 変数名 */}
          <span className="text-[var(--text-primary)] font-medium">{name}</span>
          <span className="text-[var(--text-muted)]">:</span>

          {/* 値 */}
          <span className={clsx("truncate", getValueColor(value))}>
            {formatValue(value)}
          </span>

          {/* 型バッジ */}
          <span className="ml-auto text-xs text-[var(--text-muted)] opacity-60">
            {valueType}
          </span>
        </div>

        {/* 子要素（展開時） */}
        {isExpanded && childEntries.length > 0 && (
          <div role="group">
            {childEntries.map(([childName, childValue]) => (
              <VariableItem
                key={childName}
                name={childName}
                value={childValue}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

VariableItem.displayName = "VariableItem";
