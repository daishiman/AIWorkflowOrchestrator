/**
 * channels.ts - SKILL_CREATOR_CANCEL チャンネル定義テスト
 * TASK-SW-CANCEL-002: チャンネル定数 + ホワイトリスト追加
 *
 * TC-05: SKILL_CREATOR_CANCEL が ALLOWED_INVOKE_CHANNELS に含まれること
 * TC-06: SKILL_CREATOR_CANCEL チャンネル値が "skill-creator:cancel" であること
 */

import { describe, it, expect } from "vitest";
import { IPC_CHANNELS, ALLOWED_INVOKE_CHANNELS } from "../channels";

describe("channels - SKILL_CREATOR_CANCEL (TASK-SW-CANCEL-002)", () => {
  it("TC-05: SKILL_CREATOR_CANCEL が ALLOWED_INVOKE_CHANNELS に含まれること", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain(
      IPC_CHANNELS.SKILL_CREATOR_CANCEL,
    );
  });

  it("TC-06: SKILL_CREATOR_CANCEL チャンネル値が 'skill-creator:cancel' であること", () => {
    expect(IPC_CHANNELS.SKILL_CREATOR_CANCEL).toBe("skill-creator:cancel");
  });
});
