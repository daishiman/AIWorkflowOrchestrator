/**
 * @file trackEvent.test.ts
 * @description trackEvent スタブ ユニットテスト（W3-seq-04 Phase 4）
 *
 * TC-07: trackEvent が例外を投げないこと
 * TC-08: 開発環境で console.info が呼ばれること
 * TC-09: production では console.info が抑制されること
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { trackEvent } from "../trackEvent";

describe("trackEvent スタブ", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("TC-07: trackEvent が呼ばれた場合にエラーをスローしないこと", () => {
    expect(() => {
      trackEvent("skill_wizard_started", {});
    }).not.toThrow();
  });

  it("TC-08: 開発環境では console.info が呼ばれること", () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    trackEvent("skill_wizard_started", {});
    expect(consoleSpy).toHaveBeenCalledWith(
      "[trackEvent]",
      "skill_wizard_started",
      {},
    );
  });

  it("TC-08b: skill_wizard_step1_completed のペイロードが console.info に渡ること", () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    trackEvent("skill_wizard_step1_completed", {
      method: "skip",
      skippedAtQuestion: 3,
    });
    expect(consoleSpy).toHaveBeenCalledWith(
      "[trackEvent]",
      "skill_wizard_step1_completed",
      { method: "skip", skippedAtQuestion: 3 },
    );
  });

  it("TC-09: production では console.info が呼ばれないこと", () => {
    vi.stubEnv("NODE_ENV", "production");
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    trackEvent("skill_wizard_started", {});
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
