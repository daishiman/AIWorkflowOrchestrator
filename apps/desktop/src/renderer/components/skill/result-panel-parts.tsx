/**
 * @file result-panel-parts.tsx
 * @description PlanResultDetailPanel / ExecuteResultDetailPanel 共通 UI パーツ
 * TASK-RT-03: Phase 8 リファクタリング — 共通パターン抽出
 */

/** カード外枠の共通クラス */
export const PANEL_CARD_CLASSES =
  "rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-5";

/**
 * セクション区切り線 + ヘッダーテキスト
 */
export function SectionHeader({ title }: { title: string }): JSX.Element {
  return (
    <div className="mt-3 border-t border-[var(--border-primary)] pt-3">
      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h4>
    </div>
  );
}

/**
 * タグスタイルのリスト（triggers / anchors 共通）
 * - "accent": status-primary 系（例: triggers）
 * - "default": bg-primary / text-secondary 系（例: anchors）
 */
export function TagList({
  items,
  variant = "default",
}: {
  items: string[];
  variant?: "default" | "accent";
}): JSX.Element {
  const tagClass =
    variant === "accent"
      ? "inline-flex items-center rounded-full bg-[var(--status-primary)]/10 px-2 py-1 text-xs font-medium text-[var(--status-primary)]"
      : "inline-flex items-center rounded-full bg-[var(--bg-primary)] px-2 py-1 text-xs font-medium text-[var(--text-secondary)]";

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className={tagClass}>
          {item}
        </span>
      ))}
    </div>
  );
}

/**
 * ID フッター（Plan ID / Execute ID 共通）
 */
export function DetailFooter({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
  return (
    <p className="mt-3 border-t border-[var(--border-primary)] pt-3 text-xs text-[var(--text-secondary)]">
      {label}: {value}
    </p>
  );
}

/**
 * 成功/失敗/pending バッジ
 */
export function StatusBadge({
  status,
}: {
  status: "success" | "failure" | "pending";
}): JSX.Element {
  const config: Record<
    "success" | "failure" | "pending",
    { className: string; label: string }
  > = {
    success: {
      className: "bg-[var(--status-success)]/10 text-[var(--status-success)]",
      label: "成功",
    },
    failure: {
      className: "bg-[var(--status-error)]/10 text-[var(--status-error)]",
      label: "失敗",
    },
    pending: {
      className: "bg-[var(--status-primary)]/10 text-[var(--status-primary)]",
      label: "実行中",
    },
  };

  const { className, label } = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${className}`}
      aria-label={label}
    >
      {label}
    </span>
  );
}
