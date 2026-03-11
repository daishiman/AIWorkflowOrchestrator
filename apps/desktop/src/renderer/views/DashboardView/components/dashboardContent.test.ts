import { describe, expect, it } from "vitest";
import {
  MAX_TIMELINE_ITEMS,
  getDashboardSuggestions,
  getGreetingContent,
  getTimelineEntries,
} from "./dashboardContent";

describe("dashboardContent", () => {
  describe("getGreetingContent", () => {
    it("表示名がある場合は名前付きの挨拶を返す", () => {
      const result = getGreetingContent(
        "山田",
        new Date("2026-03-11T08:00:00+09:00"),
        0,
        3,
      );

      expect(result.title).toBe("おはようございます、山田さん");
      expect(result.eyebrow).toBe("今日のホーム");
    });

    it("表示名が汎用値の場合は自然な挨拶だけを返す", () => {
      const result = getGreetingContent(
        "User",
        new Date("2026-03-11T19:00:00+09:00"),
        0,
        0,
      );

      expect(result.title).toBe("こんばんは");
      expect(result.description).toContain("最初の一歩");
    });

    it("pending がある場合は優先導線を説明する", () => {
      const result = getGreetingContent(
        "田中",
        new Date("2026-03-11T13:00:00+09:00"),
        4,
        7,
      );

      expect(result.description).toContain("4件の保留");
    });
  });

  describe("getDashboardSuggestions", () => {
    it("空状態では skillCenter から始まる3件を返す", () => {
      const suggestions = getDashboardSuggestions({
        activityCount: 0,
        pendingCount: 0,
      });

      expect(suggestions).toHaveLength(3);
      expect(suggestions.map((suggestion) => suggestion.view)).toEqual([
        "skillCenter",
        "workspace",
        "agent",
      ]);
    });

    it("pending がある場合は agent を最優先にする", () => {
      const suggestions = getDashboardSuggestions({
        activityCount: 5,
        pendingCount: 2,
      });

      expect(suggestions[0]?.view).toBe("agent");
      expect(suggestions[1]?.view).toBe("historySearch");
    });
  });

  describe("getTimelineEntries", () => {
    it("最新5件までに制限する", () => {
      const entries = getTimelineEntries(
        Array.from({ length: MAX_TIMELINE_ITEMS + 2 }, (_, index) => ({
          id: `activity-${index}`,
          message: `アクティビティ ${index}`,
          time: `2026-03-11T0${index}:00:00+09:00`,
          type: "info" as const,
        })),
      );

      expect(entries).toHaveLength(MAX_TIMELINE_ITEMS);
      expect(entries[0]?.title).toBe("アクティビティ 0");
    });

    it("type に応じて状態ラベルとアイコンを付与する", () => {
      const [entry] = getTimelineEntries([
        {
          id: "activity-error",
          message: "失敗した処理",
          time: "invalid",
          type: "error",
        },
      ]);

      expect(entry?.statusLabel).toBe("注意");
      expect(entry?.icon).toBe("alert-circle");
    });
  });
});
