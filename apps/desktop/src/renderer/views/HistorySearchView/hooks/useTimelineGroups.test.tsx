import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTimelineGroups } from "./useTimelineGroups";
import type { HistoryItem } from "@repo/shared/types";

function isoDate(offsetDays: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
}

function HookHarness({ items }: { items: HistoryItem[] }) {
  const groups = useTimelineGroups(items);
  return (
    <div>
      {groups.map((group) => (
        <div key={group.id} data-testid="timeline-group">
          {group.label}:{group.items.map((item) => item.id).join(",")}
        </div>
      ))}
    </div>
  );
}

describe("useTimelineGroups", () => {
  it("日付ラベルごとに降順でグルーピングする", () => {
    const items: HistoryItem[] = [
      {
        id: "skill-1",
        type: "skill",
        title: "skill",
        preview: "preview",
        timestamp: isoDate(-1),
        metadata: {
          type: "skill",
          skillName: "demo",
          executionId: "exec-1",
          status: "success",
        },
      },
      {
        id: "chat-1",
        type: "chat",
        title: "chat",
        preview: "preview",
        timestamp: isoDate(0),
        metadata: {
          type: "chat",
          sessionId: "session-1",
          messageCount: 1,
        },
      },
    ];

    render(<HookHarness items={items} />);

    const groups = screen.getAllByTestId("timeline-group");
    expect(groups[0]).toHaveTextContent("きょう:chat-1");
    expect(groups[1]).toHaveTextContent("きのう:skill-1");
  });

  it("不正な timestamp を日付不明へ退避する", () => {
    const items: HistoryItem[] = [
      {
        id: "invalid-1",
        type: "file",
        title: "file",
        preview: "preview",
        timestamp: "invalid-date",
        metadata: {
          type: "file",
          filePath: "src/a.ts",
          additions: 1,
          deletions: 0,
        },
      },
    ];

    render(<HookHarness items={items} />);

    expect(screen.getByText("日付不明:invalid-1")).toBeInTheDocument();
  });
});
