import { describe, it, expect } from "vitest";
import { deriveSlideUIStatus } from "./types";
import type { SlideUIStatus } from "./types";
import type { SyncStatus } from "@repo/shared";

describe("deriveSlideUIStatus", () => {
  // synced 状態
  it("syncStatus=synced, no error, not executing, no handoff -> synced", () => {
    expect(deriveSlideUIStatus("synced", false, false, null)).toBe("synced");
  });

  it("syncStatus=out-of-sync, no error -> synced", () => {
    expect(deriveSlideUIStatus("out-of-sync", false, false, null)).toBe(
      "synced",
    );
  });

  // running 状態
  it("syncStatus=syncing -> running", () => {
    expect(deriveSlideUIStatus("syncing", false, false, null)).toBe("running");
  });

  it("isExecuting=true -> running", () => {
    expect(deriveSlideUIStatus("synced", true, false, null)).toBe("running");
  });

  // degraded 状態
  it("syncStatus=error -> degraded", () => {
    expect(deriveSlideUIStatus("error", false, false, null)).toBe("degraded");
  });

  it("error message present -> degraded", () => {
    expect(deriveSlideUIStatus("synced", false, false, "Some error")).toBe(
      "degraded",
    );
  });

  // guidance 状態
  it("hasHandoff=true -> guidance (highest priority)", () => {
    expect(deriveSlideUIStatus("synced", false, true, null)).toBe("guidance");
  });

  // 優先順位テスト
  it("hasHandoff=true overrides error -> guidance", () => {
    expect(deriveSlideUIStatus("error", true, true, "error")).toBe("guidance");
  });

  it("error overrides isExecuting -> degraded", () => {
    expect(deriveSlideUIStatus("synced", true, false, "error")).toBe(
      "degraded",
    );
  });

  it("syncStatus=error overrides isExecuting -> degraded", () => {
    expect(deriveSlideUIStatus("error", true, false, null)).toBe("degraded");
  });

  // 全 SyncStatus 値のカバレッジ
  it.each<[SyncStatus, boolean, boolean, string | null, SlideUIStatus]>([
    ["synced", false, false, null, "synced"],
    ["out-of-sync", false, false, null, "synced"],
    ["syncing", false, false, null, "running"],
    ["error", false, false, null, "degraded"],
    ["synced", true, false, null, "running"],
    ["synced", false, true, null, "guidance"],
    ["synced", false, false, "err", "degraded"],
  ])(
    "deriveSlideUIStatus(%s, %s, %s, %s) -> %s",
    (syncStatus, isExecuting, hasHandoff, error, expected) => {
      expect(
        deriveSlideUIStatus(syncStatus, isExecuting, hasHandoff, error),
      ).toBe(expected);
    },
  );
});
