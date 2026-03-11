import type { HistoryItem } from "@repo/shared/types";
import { HistoryCardShell } from "./shared";

interface SkillHistoryCardProps {
  item: HistoryItem;
  expanded: boolean;
  onToggle: () => void;
}

export function SkillHistoryCard({
  item,
  expanded,
  onToggle,
}: SkillHistoryCardProps) {
  if (item.metadata.type !== "skill") {
    return null;
  }

  return (
    <HistoryCardShell
      item={item}
      expanded={expanded}
      iconName="sparkles"
      subtitle={`skill:${item.metadata.skillName} / ${item.metadata.status}`}
      onToggle={onToggle}
    >
      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em]">Result</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {item.metadata.status}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em]">Output</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {item.metadata.outputFile ?? "なし"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em]">Duration</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {typeof item.metadata.executionTimeMs === "number"
                ? `${item.metadata.executionTimeMs}ms`
                : "不明"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em]">Model</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {item.metadata.modelUsed ?? "不明"}
            </dd>
          </div>
        </dl>
      </div>
    </HistoryCardShell>
  );
}
