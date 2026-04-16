import { describe, it, expect } from "vitest";
import { SKILL_CREATOR_RUNTIME_CHANNELS, IPC_CHANNELS } from "../channels";

describe("SKILL_CREATOR_CANCEL チャンネル定数", () => {
  // TC-01: チャンネル定数が存在すること
  it("SKILL_CREATOR_CANCEL チャンネル定数が存在する", () => {
    expect(SKILL_CREATOR_RUNTIME_CHANNELS).toHaveProperty(
      "SKILL_CREATOR_CANCEL",
    );
  });

  // TC-02: チャンネル値が正しいこと
  it("SKILL_CREATOR_CANCEL の値が 'skill-creator:cancel' である", () => {
    expect(
      (SKILL_CREATOR_RUNTIME_CHANNELS as Record<string, string>)
        .SKILL_CREATOR_CANCEL,
    ).toBe("skill-creator:cancel");
  });

  // TC-03: IPC_CHANNELS からも参照できること
  it("IPC_CHANNELS.SKILL_CREATOR_CANCEL として参照できる", () => {
    expect((IPC_CHANNELS as Record<string, string>).SKILL_CREATOR_CANCEL).toBe(
      "skill-creator:cancel",
    );
  });

  // TC-04: 既存チャンネルと値が重複していないこと
  it("SKILL_CREATOR_CANCEL の値が他のチャンネルと重複しない", () => {
    const allValues = Object.values(IPC_CHANNELS);
    const cancelValue = "skill-creator:cancel";
    const occurrences = allValues.filter((v) => v === cancelValue);
    expect(occurrences).toHaveLength(1);
  });
});
