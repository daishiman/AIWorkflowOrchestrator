/**
 * @vitest-environment node
 *
 * formatRelativeTime i18n Tests (TDD Red Phase)
 *
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 * ロケール対応のテストケース
 *
 * Note: これらのテストは実装前に作成されるため、すべて失敗する（Red状態）
 *
 * @module @repo/desktop/renderer/utils/__tests__/formatTime.i18n
 */

import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "../formatTime";

describe("formatRelativeTime - i18n (TDD Red Phase)", () => {
  const now = 1704067200000; // 2024-01-01 00:00:00 UTC

  // ============================================================
  // 日本語ロケールテスト
  // ============================================================
  describe("Japanese locale (ja)", () => {
    it("should return 'たった今' for future timestamps", () => {
      const futureTimestamp = now + 1000;
      expect(formatRelativeTime(futureTimestamp, "ja", now)).toBe("たった今");
    });

    it("should return '30秒前' for 30 seconds ago", () => {
      const timestamp = now - 30000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("30秒前");
    });

    it("should return '5分前' for 5 minutes ago", () => {
      const timestamp = now - 5 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("5分前");
    });

    it("should return '2時間前' for 2 hours ago", () => {
      const timestamp = now - 2 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("2時間前");
    });

    it("should return '3日前' for 3 days ago", () => {
      const timestamp = now - 3 * 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("3日前");
    });
  });

  // ============================================================
  // 英語ロケールテスト
  // ============================================================
  describe("English locale (en)", () => {
    it("should return 'Just now' for future timestamps", () => {
      const futureTimestamp = now + 1000;
      expect(formatRelativeTime(futureTimestamp, "en", now)).toBe("Just now");
    });

    it("should return '30 seconds ago' for 30 seconds ago", () => {
      const timestamp = now - 30000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("30 seconds ago");
    });

    it("should return '5 minutes ago' for 5 minutes ago", () => {
      const timestamp = now - 5 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("5 minutes ago");
    });

    it("should return '2 hours ago' for 2 hours ago", () => {
      const timestamp = now - 2 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("2 hours ago");
    });

    it("should return '3 days ago' for 3 days ago", () => {
      const timestamp = now - 3 * 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("3 days ago");
    });
  });

  // ============================================================
  // 単数形テスト（英語）
  // ============================================================
  describe("English locale - singular forms", () => {
    it("should return '1 second ago' for 1 second ago", () => {
      const timestamp = now - 1000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("1 second ago");
    });

    it("should return '1 minute ago' for 1 minute ago", () => {
      const timestamp = now - 60 * 1000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("1 minute ago");
    });

    it("should return '1 hour ago' for 1 hour ago", () => {
      const timestamp = now - 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("1 hour ago");
    });

    it("should return '1 day ago' for 1 day ago", () => {
      const timestamp = now - 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("1 day ago");
    });
  });

  // ============================================================
  // デフォルトロケールテスト
  // ============================================================
  describe("Default locale fallback", () => {
    it("should default to Japanese when locale is not specified", () => {
      const timestamp = now - 30000;
      // Note: 現在のシグネチャ formatRelativeTime(timestamp, now)
      // 変更後: formatRelativeTime(timestamp, locale, now)
      // デフォルトでlocale='ja'になることを期待
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("30秒前");
    });

    it("should fallback to Japanese for unsupported locale", () => {
      const timestamp = now - 30000;
      // 未対応ロケールの場合、日本語にフォールバック
      expect(formatRelativeTime(timestamp, "fr", now)).toBe("30秒前");
    });
  });

  // ============================================================
  // 境界値テスト
  // ============================================================
  describe("Boundary values", () => {
    it("should return seconds for 59 seconds ago", () => {
      const timestamp = now - 59 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("59秒前");
    });

    it("should return minutes for 60 seconds ago", () => {
      const timestamp = now - 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("1分前");
    });

    it("should return minutes for 59 minutes ago", () => {
      const timestamp = now - 59 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("59分前");
    });

    it("should return hours for 60 minutes ago", () => {
      const timestamp = now - 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("1時間前");
    });

    it("should return hours for 23 hours ago", () => {
      const timestamp = now - 23 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("23時間前");
    });

    it("should return days for 24 hours ago", () => {
      const timestamp = now - 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("1日前");
    });
  });

  // ============================================================
  // Phase 6: エッジケース追加テスト
  // ============================================================
  describe("Edge cases (Phase 6)", () => {
    it("should return '0秒前' for diff = 0", () => {
      // diff = 0のケース
      expect(formatRelativeTime(now, "ja", now)).toBe("0秒前");
    });

    it("should return '0 seconds ago' for diff = 0 in English", () => {
      expect(formatRelativeTime(now, "en", now)).toBe("0 seconds ago");
    });

    it("should handle very large timestamp (many days ago)", () => {
      // 1000日前
      const timestamp = now - 1000 * 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("1000日前");
    });

    it("should handle very large timestamp in English", () => {
      // 1000日前
      const timestamp = now - 1000 * 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(timestamp, "en", now)).toBe("1000 days ago");
    });

    it("should handle timestamp at exact minute boundary", () => {
      // 正確に1分 = 60秒
      const timestamp = now - 60000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("1分前");
    });

    it("should handle timestamp at exact hour boundary", () => {
      // 正確に1時間 = 60分 = 3600秒
      const timestamp = now - 3600000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("1時間前");
    });

    it("should handle timestamp at exact day boundary", () => {
      // 正確に1日 = 24時間
      const timestamp = now - 86400000;
      expect(formatRelativeTime(timestamp, "ja", now)).toBe("1日前");
    });

    it("should handle empty string locale (fallback to ja)", () => {
      const timestamp = now - 30000;
      expect(formatRelativeTime(timestamp, "", now)).toBe("30秒前");
    });
  });
});
