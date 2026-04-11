/**
 * @file cronParser.edge.test.ts
 * @description cronParser エッジケース追加テスト（Phase 6）
 * @task TASK-UI-SCHEDULE-VISUAL-PICKER-001
 */

import { describe, it, expect } from "vitest";
import { cronToVisualConfig } from "../../renderer/utils/cronParser";

describe("cronToVisualConfig エッジケース", () => {
  it("先頭・末尾に空白がある場合も正常にパース", () => {
    const result = cronToVisualConfig("  0 9 * * *  ");
    expect(result?.frequency).toBe("daily");
  });

  it("複数スペース区切りもパースできる", () => {
    const result = cronToVisualConfig("0  9  *  *  *");
    expect(result?.frequency).toBe("daily");
  });

  it("weekdays 7 は日曜日として正規化される", () => {
    const result = cronToVisualConfig("0 9 * * 7");
    expect(result?.frequency).toBe("weekly");
    expect(result?.weekdays).toEqual([0]);
  });

  it("weekday range 1-5 は月〜金に展開される", () => {
    const result = cronToVisualConfig("0 9 * * 1-5");
    expect(result?.frequency).toBe("weekly");
    expect(result?.weekdays).toEqual([1, 2, 3, 4, 5]);
  });

  it("6フィールドはnullを返す", () => {
    expect(cronToVisualConfig("0 9 * * * *")).toBeNull();
  });

  it("0,7 は重複を除去して日曜に正規化される", () => {
    const result = cronToVisualConfig("0 9 * * 0,7");
    expect(result?.frequency).toBe("weekly");
    expect(result?.weekdays).toEqual([0]);
  });
});
