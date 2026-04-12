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

  // ── Phase 4+6: 新規イベント型テスト ──────────────────────────────────────

  it("AC-1: skill_wizard_open を source:direct で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_open", { source: "direct" });
    }).not.toThrow();
  });

  it("AC-1: skill_wizard_open を source:lifecycle_panel で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_open", { source: "lifecycle_panel" });
    }).not.toThrow();
  });

  it("AC-2: skill_wizard_step_complete を step:0 で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_step_complete", {
        step: 0,
        stepName: "スキル情報入力",
      });
    }).not.toThrow();
  });

  it("AC-2: skill_wizard_step_complete を step:1 で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_step_complete", {
        step: 1,
        stepName: "詳細設定",
      });
    }).not.toThrow();
  });

  it("AC-2: skill_wizard_step_complete を step:2 で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_step_complete", { step: 2, stepName: "生成" });
    }).not.toThrow();
  });

  it("AC-3: skill_wizard_next_action を action:edit で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_next_action", { action: "edit" });
    }).not.toThrow();
  });

  it("AC-3: skill_wizard_next_action を action:execute で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_next_action", { action: "execute" });
    }).not.toThrow();
  });

  it("AC-3: skill_wizard_next_action を action:close で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_next_action", { action: "close" });
    }).not.toThrow();
  });

  it("AC-4: skill_wizard_abandon を lastStep:0 で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_abandon", { lastStep: 0 });
    }).not.toThrow();
  });

  it("AC-4: skill_wizard_abandon を lastStep:2 で呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_abandon", { lastStep: 2 });
    }).not.toThrow();
  });

  // ── Phase 6: 回帰ガード ────────────────────────────────────────────────

  it("回帰: skill_wizard_started が引き続き呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_started", {});
    }).not.toThrow();
  });

  it("回帰: skill_wizard_step1_completed が引き続き呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_step1_completed", {
        method: "complete",
        skippedAtQuestion: null,
      });
    }).not.toThrow();
    expect(() => {
      trackEvent("skill_wizard_step1_completed", {
        method: "skip",
        skippedAtQuestion: 3,
      });
    }).not.toThrow();
  });

  it("回帰: skill_wizard_generation_completed が引き続き呼べること", () => {
    expect(() => {
      trackEvent("skill_wizard_generation_completed", {
        method: "complete",
        category: "automation",
        hasExternalIntegration: false,
      });
    }).not.toThrow();
  });

  it("回帰: skill_skeleton_quality_feedback が引き続き呼べること", () => {
    expect(() => {
      trackEvent("skill_skeleton_quality_feedback", {
        satisfied: true,
        generationMethod: "complete",
      });
    }).not.toThrow();
  });

  it("NODE_ENV=development のとき console.info を呼び出す（新規イベント）", () => {
    vi.stubEnv("NODE_ENV", "development");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    trackEvent("skill_wizard_open", { source: "direct" });
    expect(spy).toHaveBeenCalledWith("[trackEvent]", "skill_wizard_open", {
      source: "direct",
    });
    spy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("NODE_ENV=production のとき console.info を呼び出さない（新規イベント）", () => {
    vi.stubEnv("NODE_ENV", "production");
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    trackEvent("skill_wizard_open", { source: "direct" });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
    vi.unstubAllEnvs();
  });
});
