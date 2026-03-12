import { describe, expect, it } from "vitest";
import {
  LIGHT_THEME_AUDIT_TARGETS,
  LIGHT_THEME_SCREENSHOT_SCENARIOS,
  createLightThemeScreenshotPlan,
} from "./light-theme-contrast-guard.config.mjs";
import {
  auditConfiguredTargets,
  auditSource,
  summarizeAuditHits,
} from "./light-theme-contrast-guard.mjs";

describe("light-theme-contrast-guard", () => {
  it("スクリーンショット計画が 4 light surface + 1 dark baseline を持つ", () => {
    const plan = createLightThemeScreenshotPlan("http://127.0.0.1:4173");

    expect(plan.scenarios).toHaveLength(5);
    expect(
      plan.scenarios.filter((scenario) => scenario.theme === "light"),
    ).toHaveLength(4);
    expect(
      plan.scenarios.filter((scenario) => scenario.theme === "dark"),
    ).toHaveLength(1);
    expect(
      new Set(plan.scenarios.map((scenario) => scenario.selector)).size,
    ).toBe(4);
    expect(
      LIGHT_THEME_SCREENSHOT_SCENARIOS.map((scenario) => scenario.id),
    ).toEqual(["TC-11-01", "TC-11-02", "TC-11-03", "TC-11-04", "TC-11-05"]);
  });

  it("baseline/current の責務分離で synthetic drift を分類できる", () => {
    const baselineHits = auditSource(
      LIGHT_THEME_AUDIT_TARGETS[0].relativePath,
      'const value = "bg-white/5 text-white/60 border-white/10";',
    );
    const currentHits = auditSource(
      "apps/desktop/src/renderer/views/SettingsView/index.tsx",
      'const value = "bg-slate-900 text-slate-400";',
    );

    const summary = summarizeAuditHits([...baselineHits, ...currentHits]);

    expect(summary.baselineViolations).toBe(3);
    expect(summary.currentViolations).toBe(2);
  });

  it("excluded path は audit 対象から外す", () => {
    const hits = auditSource(
      "apps/desktop/src/renderer/styles/globals.css",
      ".text-white { color: white; }",
    );

    expect(hits).toEqual([]);
  });

  it("現行 repo の configured target では current violation を増やしていない", async () => {
    const report = await auditConfiguredTargets();

    expect(report.missingTargets).toEqual([]);
    expect(report.targets).toHaveLength(LIGHT_THEME_AUDIT_TARGETS.length);
    expect(report.summary.currentViolations).toBe(0);
    expect(report.summary.totalViolations).toBe(
      report.summary.currentViolations + report.summary.baselineViolations,
    );
  });
});
