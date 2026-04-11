/**
 * @file cronHumanizer.test.ts
 * @description cronHumanizer ユニットテスト（TDD Red フェーズ）
 * @phase Phase 4: テスト作成
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import { describe, it, expect } from "vitest";
import { cronToHumanReadable } from "../../renderer/utils/cronHumanizer";

describe("cronToHumanReadable", () => {
  it("CH-01: every-minute の日本語", () => {
    expect(cronToHumanReadable("* * * * *", "ja")).toBe("毎分");
  });

  it("CH-02: every-hour 30分の日本語", () => {
    expect(cronToHumanReadable("30 * * * *", "ja")).toBe("毎時 30分");
  });

  it("CH-03: daily 9:00 の日本語", () => {
    expect(cronToHumanReadable("0 9 * * *", "ja")).toBe("毎日 09:00");
  });

  it("CH-04: weekly 月・水・金 9:00 の日本語", () => {
    expect(cronToHumanReadable("0 9 * * 1,3,5", "ja")).toBe(
      "毎週 月・水・金 09:00",
    );
  });

  it("CH-04B: weekly 月〜金 9:00 の日本語", () => {
    expect(cronToHumanReadable("0 9 * * 1-5", "ja")).toBe("毎週 月〜金 09:00");
  });

  it("CH-05: monthly 1日 9:00 の日本語", () => {
    expect(cronToHumanReadable("0 9 1 * *", "ja")).toBe("毎月1日 09:00");
  });

  it("CH-06: daily 0:00 のゼロ埋め表示", () => {
    expect(cronToHumanReadable("0 0 * * *", "ja")).toBe("毎日 00:00");
  });

  it("CH-07: every-hour 0分の日本語", () => {
    expect(cronToHumanReadable("0 * * * *", "ja")).toBe("毎時 00分");
  });

  it("CH-08: weekly 日曜のみ", () => {
    expect(cronToHumanReadable("0 8 * * 0", "ja")).toBe("毎週 日 08:00");
  });

  it("CH-09: 無効な式はフォールバックメッセージを返す（空文字でない）", () => {
    const result = cronToHumanReadable("invalid", "ja");
    expect(result.length).toBeGreaterThan(0);
  });

  it("CH-10: every-minute の英語", () => {
    expect(cronToHumanReadable("* * * * *", "en")).toBe("Every minute");
  });

  it("every-hour の英語", () => {
    expect(cronToHumanReadable("30 * * * *", "en")).toBe("Every hour at :30");
  });

  it("daily の英語", () => {
    expect(cronToHumanReadable("0 9 * * *", "en")).toBe("Every day at 09:00");
  });

  it("weekly の英語", () => {
    expect(cronToHumanReadable("0 9 * * 1,3,5", "en")).toBe(
      "Every week on Mon, Wed, Fri at 09:00",
    );
  });

  it("weekly range の英語", () => {
    expect(cronToHumanReadable("0 9 * * 1-5", "en")).toBe(
      "Every week on Mon-Fri at 09:00",
    );
  });

  it("monthly の英語", () => {
    expect(cronToHumanReadable("0 9 1 * *", "en")).toBe(
      "Every month on day 1 at 09:00",
    );
  });

  it("無効な式の英語フォールバック", () => {
    expect(cronToHumanReadable("invalid", "en")).toBe("Custom schedule");
  });
});
