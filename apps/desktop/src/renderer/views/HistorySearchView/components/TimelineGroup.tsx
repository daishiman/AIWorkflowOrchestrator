import type { HistoryItem } from "@repo/shared/types";
import type { TimelineGroupData } from "../types";
import { TimelineGroupHeader } from "./TimelineGroupHeader";
import { ChatHistoryCard } from "./HistoryItemCard/ChatHistoryCard";
import { FileHistoryCard } from "./HistoryItemCard/FileHistoryCard";
import { SkillHistoryCard } from "./HistoryItemCard/SkillHistoryCard";

interface TimelineGroupProps {
  group: TimelineGroupData;
  expandedItemId: string | null;
  onToggleItem: (itemId: string) => void;
  onOpenFile: (filePath: string) => void;
}

function renderCard(
  item: HistoryItem,
  expanded: boolean,
  onToggleItem: (itemId: string) => void,
  onOpenFile: (filePath: string) => void,
) {
  const onToggle = () => onToggleItem(item.id);

  switch (item.type) {
    case "chat":
      return (
        <ChatHistoryCard
          key={item.id}
          item={item}
          expanded={expanded}
          onToggle={onToggle}
        />
      );
    case "file":
      return (
        <FileHistoryCard
          key={item.id}
          item={item}
          expanded={expanded}
          onToggle={onToggle}
          onOpenFile={onOpenFile}
        />
      );
    case "skill":
      return (
        <SkillHistoryCard
          key={item.id}
          item={item}
          expanded={expanded}
          onToggle={onToggle}
        />
      );
    default:
      return null;
  }
}

export function TimelineGroup({
  group,
  expandedItemId,
  onToggleItem,
  onOpenFile,
}: TimelineGroupProps) {
  return (
    <section aria-label={group.label}>
      <TimelineGroupHeader label={group.label} />
      <div role="list" className="space-y-3">
        {group.items.map((item) =>
          renderCard(
            item,
            expandedItemId === item.id,
            onToggleItem,
            onOpenFile,
          ),
        )}
      </div>
    </section>
  );
}
