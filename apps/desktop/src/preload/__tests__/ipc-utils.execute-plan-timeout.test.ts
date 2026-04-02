/**
 * CHANNEL_TIMEOUTS - skill-creator:execute-plan タイムアウト検証
 *
 * TASK-FIX-EXECUTE-PLAN-FF-001 Phase 4: TDD Red テスト
 * TC-T1-01: CHANNEL_TIMEOUTS に execute-plan が 1_800_000ms で登録されている
 * TC-T1-02: 1_800_000ms = 30分 であることを確認
 */

import { describe, it, expect } from "vitest";
import { CHANNEL_TIMEOUTS } from "../ipc-utils";

describe("CHANNEL_TIMEOUTS - skill-creator:execute-plan", () => {
  it("TC-T1-01: CHANNEL_TIMEOUTS に skill-creator:execute-plan が 1_800_000ms で登録されている", () => {
    expect(CHANNEL_TIMEOUTS["skill-creator:execute-plan"]).toBe(1_800_000);
  });

  it("TC-T1-02: 1_800_000ms は 30 分であることを確認", () => {
    const thirtyMinutesMs = 30 * 60 * 1000;
    expect(CHANNEL_TIMEOUTS["skill-creator:execute-plan"]).toBe(
      thirtyMinutesMs,
    );
  });
});
