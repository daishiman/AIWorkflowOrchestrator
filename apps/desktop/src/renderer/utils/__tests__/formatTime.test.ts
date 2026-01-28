/**
 * @vitest-environment happy-dom
 *
 * formatRelativeTime Function Tests
 *
 * TDD Red Phase: Tests for relative time formatting utility.
 * All tests should fail until implementation in Phase 5.
 *
 * @module @repo/desktop/renderer/utils/__tests__/formatTime
 */

import { describe, it, expect } from "vitest";
import { formatRelativeTime } from "../formatTime";

describe("formatRelativeTime", () => {
  const NOW = 1706400000000; // 固定の基準時刻（テスト用）

  // TC-R2-1: 60秒未満の場合は「X秒前」
  describe("seconds formatting", () => {
    it("should return seconds ago for less than 60 seconds", () => {
      const timestamp = NOW - 30 * 1000; // 30秒前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("30秒前");
    });

    it("should return 0秒前 for current timestamp", () => {
      expect(formatRelativeTime(NOW, "ja", NOW)).toBe("0秒前");
    });

    it("should return 59秒前 at boundary", () => {
      const timestamp = NOW - 59 * 1000; // 59秒前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("59秒前");
    });
  });

  // TC-R2-2: 60分未満の場合は「X分前」
  describe("minutes formatting", () => {
    it("should return minutes ago for less than 60 minutes", () => {
      const timestamp = NOW - 5 * 60 * 1000; // 5分前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("5分前");
    });

    it("should return 1分前 at 60 seconds boundary", () => {
      const timestamp = NOW - 60 * 1000; // 60秒前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("1分前");
    });

    it("should return 59分前 at boundary", () => {
      const timestamp = NOW - 59 * 60 * 1000; // 59分前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("59分前");
    });
  });

  // TC-R2-3: 24時間未満の場合は「X時間前」
  describe("hours formatting", () => {
    it("should return hours ago for less than 24 hours", () => {
      const timestamp = NOW - 2 * 60 * 60 * 1000; // 2時間前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("2時間前");
    });

    it("should return 1時間前 at 60 minutes boundary", () => {
      const timestamp = NOW - 60 * 60 * 1000; // 60分前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("1時間前");
    });

    it("should return 23時間前 at boundary", () => {
      const timestamp = NOW - 23 * 60 * 60 * 1000; // 23時間前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("23時間前");
    });
  });

  // TC-R2-4: 24時間以上の場合は「X日前」
  describe("days formatting", () => {
    it("should return days ago for 24 hours or more", () => {
      const timestamp = NOW - 3 * 24 * 60 * 60 * 1000; // 3日前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("3日前");
    });

    it("should return 1日前 at 24 hours boundary", () => {
      const timestamp = NOW - 24 * 60 * 60 * 1000; // 24時間前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("1日前");
    });

    it("should handle large number of days", () => {
      const timestamp = NOW - 365 * 24 * 60 * 60 * 1000; // 365日前
      expect(formatRelativeTime(timestamp, "ja", NOW)).toBe("365日前");
    });
  });

  // エッジケース
  describe("edge cases", () => {
    it("should handle future timestamp gracefully", () => {
      const futureTimestamp = NOW + 1000; // 1秒後
      const result = formatRelativeTime(futureTimestamp, "ja", NOW);
      // 未来のタイムスタンプは「たった今」
      expect(result).toBe("たった今");
    });

    it("should use Date.now() when now parameter is not provided", () => {
      const recentTimestamp = Date.now() - 5000; // 5秒前
      const result = formatRelativeTime(recentTimestamp, "ja");
      expect(result).toMatch(/\d+秒前/);
    });
  });
});
