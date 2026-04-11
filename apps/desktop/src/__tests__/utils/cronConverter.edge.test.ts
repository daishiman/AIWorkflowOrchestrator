/**
 * @file cronConverter.edge.test.ts
 * @description cronConverter エッジケース追加テスト（Phase 6）
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import { describe, it, expect } from "vitest";
import { visualConfigToCron } from "../../renderer/utils/cronConverter";

describe("visualConfigToCron エッジケース", () => {
  it("weekly weekdays が空配列のとき空の曜日フィールドになる", () => {
    const result = visualConfigToCron({
      frequency: "weekly",
      hour: 9,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
    });
    // weekdays が空なら曜日フィールドが空文字になる
    expect(result).toBe("0 9 * * ");
  });

  it("monthly dayOfMonth=1 のとき '0 9 1 * *'", () => {
    const result = visualConfigToCron({
      frequency: "monthly",
      hour: 9,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
    });
    expect(result).toBe("0 9 1 * *");
  });

  it("every-hour minute=0 のとき '0 * * * *'", () => {
    const result = visualConfigToCron({
      frequency: "every-hour",
      hour: 0,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
    });
    expect(result).toBe("0 * * * *");
  });

  it("custom rawCronExpression が空文字のとき空文字を返す", () => {
    const result = visualConfigToCron({
      frequency: "custom",
      hour: 0,
      minute: 0,
      weekdays: [],
      dayOfMonth: 1,
      rawCronExpression: "",
    });
    expect(result).toBe("");
  });
});
