import type { HistoryItem } from "@repo/shared/types";
import { Link } from "react-router-dom";
import { HistoryCardShell } from "./shared";

interface ChatHistoryCardProps {
  item: HistoryItem;
  expanded: boolean;
  onToggle: () => void;
}

export function ChatHistoryCard({
  item,
  expanded,
  onToggle,
}: ChatHistoryCardProps) {
  if (item.metadata.type !== "chat") {
    return null;
  }

  return (
    <HistoryCardShell
      item={item}
      expanded={expanded}
      iconName="message-circle"
      subtitle={`セッション ${item.metadata.sessionId} / ${item.metadata.messageCount}件`}
      onToggle={onToggle}
    >
      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        <p>やりとりの流れをここから振り返れます。</p>
        <dl className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em]">Session</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {item.metadata.sessionId}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em]">Messages</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {item.metadata.messageCount}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.14em]">Model</dt>
            <dd className="mt-1 text-[var(--text-primary)]">
              {item.metadata.lastModel ?? "不明"}
            </dd>
          </div>
        </dl>
        <Link
          to={`/chat/history/${item.metadata.sessionId}`}
          className="inline-flex text-sm font-medium text-[var(--status-primary)] underline-offset-4 hover:underline"
        >
          やりとりを見る
        </Link>
      </div>
    </HistoryCardShell>
  );
}
