/**
 * @file RiskPanel.tsx
 * @description リスク情報パネルコンポーネント
 *
 * スキル分析で検出されたリスクをカード形式で表示する。
 * リスクレベルに応じた色分け（critical=エラー色、high=警告色、
 * medium=情報色、low=ボーダー色）を適用し、影響範囲と対策を表示する。
 *
 * Apple HIG準拠: 8pxグリッド、角丸12px、CSS変数によるテーマ対応
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { Risk } from "@repo/shared/types/skill-improver";

// ============================================
// Types
// ============================================

export type RiskLevelVariant = "critical" | "high" | "medium" | "low";

export interface RiskPanelProps {
  risks: Risk[];
}

// ============================================
// Style Constants (P47準拠: テスト側からimportして検証)
// ============================================

export const riskLevelStyles: Record<RiskLevelVariant, string> = {
  critical:
    "border-l-4 border-l-[var(--status-error)] bg-[var(--status-error)]/5",
  high: "border-l-4 border-l-[var(--status-warning)] bg-[var(--status-warning)]/5",
  medium: "border-l-4 border-l-[var(--status-info)] bg-[var(--status-info)]/5",
  low: "border-l-4 border-l-[var(--border-primary)] bg-[var(--bg-secondary)]",
};

const categoryLabels: Record<Risk["category"], string> = {
  security: "セキュリティ",
  compatibility: "互換性",
  performance: "パフォーマンス",
  maintenance: "メンテナンス",
};

const levelLabels: Record<RiskLevelVariant, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const levelBadgeStyles: Record<RiskLevelVariant, string> = {
  critical: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  high: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  medium: "bg-[var(--status-info)] text-[var(--text-inverse)]",
  low: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
};

// ============================================
// Sub-components
// ============================================

const RiskCard = memo(({ risk }: { risk: Risk }) => {
  return (
    <li className={clsx("rounded-xl p-4", riskLevelStyles[risk.level])}>
      {/* Header: カテゴリ + レベルバッジ */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {categoryLabels[risk.category]}
        </span>
        <span
          className={clsx(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            levelBadgeStyles[risk.level],
          )}
        >
          {levelLabels[risk.level]}
        </span>
      </div>

      {/* Description */}
      <p className="mb-3 text-sm leading-relaxed text-[var(--text-primary)]">
        {risk.description}
      </p>

      {/* Impact */}
      <div className="mb-2">
        <span className="text-xs font-semibold text-[var(--text-secondary)]">
          影響
        </span>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
          {risk.impact}
        </p>
      </div>

      {/* Mitigation（存在する場合のみ表示） */}
      {risk.mitigation !== undefined && (
        <div>
          <span className="text-xs font-semibold text-[var(--text-secondary)]">
            対策
          </span>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            {risk.mitigation}
          </p>
        </div>
      )}
    </li>
  );
});

RiskCard.displayName = "RiskCard";

// ============================================
// Main Component
// ============================================

export const RiskPanel = memo(({ risks }: RiskPanelProps) => {
  if (risks.length === 0) {
    return (
      <div className="rounded-xl bg-[var(--bg-secondary)] p-8 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          リスクは検出されていません
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3" role="list" aria-label="リスク情報一覧">
      {risks.map((risk, index) => (
        <RiskCard key={`${risk.category}-${risk.level}-${index}`} risk={risk} />
      ))}
    </ul>
  );
});

RiskPanel.displayName = "RiskPanel";
