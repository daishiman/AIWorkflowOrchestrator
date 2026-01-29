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
import {
  formatRelativeTime,
  calculateUpdateInterval,
  calculateMinUpdateInterval,
} from "../formatTime";

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

/**
 * TASK-3-2-C: calculateUpdateInterval Tests
 *
 * TDD Red Phase: Tests for update interval calculation.
 * All tests should fail until implementation in Phase 5.
 */
describe("calculateUpdateInterval", () => {
  const now = Date.now();

  it("1分未満の場合は1秒（1000ms）を返す", () => {
    expect(calculateUpdateInterval(now - 30000, now)).toBe(1000); // 30秒前
    expect(calculateUpdateInterval(now - 59000, now)).toBe(1000); // 59秒前
  });

  it("ちょうど1分の境界で1分（60000ms）を返す", () => {
    expect(calculateUpdateInterval(now - 60000, now)).toBe(60000); // 60秒前
  });

  it("1分以上1時間未満の場合は1分（60000ms）を返す", () => {
    expect(calculateUpdateInterval(now - 120000, now)).toBe(60000); // 2分前
    expect(calculateUpdateInterval(now - 1800000, now)).toBe(60000); // 30分前
    expect(calculateUpdateInterval(now - 3599000, now)).toBe(60000); // 59分59秒前
  });

  it("ちょうど1時間の境界で1時間（3600000ms）を返す", () => {
    expect(calculateUpdateInterval(now - 3600000, now)).toBe(3600000); // 1時間前
  });

  it("1時間以上の場合は1時間（3600000ms）を返す", () => {
    expect(calculateUpdateInterval(now - 7200000, now)).toBe(3600000); // 2時間前
    expect(calculateUpdateInterval(now - 86400000, now)).toBe(3600000); // 24時間前
  });
});

describe("calculateMinUpdateInterval", () => {
  const now = Date.now();

  it("空配列の場合はデフォルト1分（60000ms）を返す", () => {
    expect(calculateMinUpdateInterval([], now)).toBe(60000);
  });

  it("単一要素の場合はその要素の更新間隔を返す", () => {
    expect(calculateMinUpdateInterval([now - 30000], now)).toBe(1000); // 30秒前
    expect(calculateMinUpdateInterval([now - 300000], now)).toBe(60000); // 5分前
  });

  it("複数要素の場合は最短の更新間隔を返す", () => {
    const timestamps = [
      now - 30000, // 30秒前 → 1秒間隔
      now - 300000, // 5分前 → 1分間隔
      now - 7200000, // 2時間前 → 1時間間隔
    ];
    expect(calculateMinUpdateInterval(timestamps, now)).toBe(1000);
  });

  it("全て1分以上の場合は1分を返す", () => {
    const timestamps = [
      now - 300000, // 5分前
      now - 600000, // 10分前
    ];
    expect(calculateMinUpdateInterval(timestamps, now)).toBe(60000);
  });

  it("全て1時間以上の場合は1時間を返す", () => {
    const timestamps = [
      now - 3600000, // 1時間前
      now - 7200000, // 2時間前
    ];
    expect(calculateMinUpdateInterval(timestamps, now)).toBe(3600000);
  });
});

describe("calculateUpdateInterval - エッジケース", () => {
  const now = Date.now();

  it("timestampが未来の場合は1秒を返す", () => {
    const future = now + 10000;
    expect(calculateUpdateInterval(future, now)).toBe(1000);
  });

  it("timestampとnowが同じ場合は1秒を返す", () => {
    expect(calculateUpdateInterval(now, now)).toBe(1000);
  });

  it("境界値: 59秒と60秒の間で間隔が変わる", () => {
    expect(calculateUpdateInterval(now - 59999, now)).toBe(1000); // 59.999秒
    expect(calculateUpdateInterval(now - 60000, now)).toBe(60000); // ちょうど60秒
  });

  it("境界値: 59分59秒と60分の間で間隔が変わる", () => {
    expect(calculateUpdateInterval(now - 3599999, now)).toBe(60000); // 59分59.999秒
    expect(calculateUpdateInterval(now - 3600000, now)).toBe(3600000); // ちょうど60分
  });
});
