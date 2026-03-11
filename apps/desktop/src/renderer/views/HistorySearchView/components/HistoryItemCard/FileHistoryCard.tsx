import type { HistoryItem } from "@repo/shared/types";
import { Button } from "../../../../components/atoms/Button";
import { HistoryCardShell } from "./shared";

interface FileHistoryCardProps {
  item: HistoryItem;
  expanded: boolean;
  onToggle: () => void;
  onOpenFile: (filePath: string) => void;
}

export function FileHistoryCard({
  item,
  expanded,
  onToggle,
  onOpenFile,
}: FileHistoryCardProps) {
  if (item.metadata.type !== "file") {
    return null;
  }

  const metadata = item.metadata;

  return (
    <HistoryCardShell
      item={item}
      expanded={expanded}
      iconName="file-text"
      subtitle={`${metadata.filePath} / +${metadata.additions} -${metadata.deletions}`}
      onToggle={onToggle}
    >
      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        <dl className="grid gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.14em]">Path</dt>
            <dd className="mt-1 break-all text-[var(--text-primary)]">
              {metadata.filePath}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em]">Additions</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              +{metadata.additions}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em]">Deletions</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              -{metadata.deletions}
            </dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          onClick={() => onOpenFile(metadata.filePath)}
        >
          エディタで開く
        </Button>
      </div>
    </HistoryCardShell>
  );
}
