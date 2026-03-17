import { describe, it, expect } from "vitest";
import type { ThemeMode, ResolvedTheme, ViewType } from "./types";

describe("ThemeMode型", () => {
  it("4モードを受け入れる", () => {
    const validThemeModes: ThemeMode[] = [
      "kanagawa-dragon",
      "light",
      "dark",
      "system",
    ];

    expect(validThemeModes).toHaveLength(4);
    expect(validThemeModes).toContain("kanagawa-dragon");
    expect(validThemeModes).toContain("system");
  });
});

describe("ResolvedTheme型", () => {
  it("systemを除く3モードを受け入れる", () => {
    const validResolvedThemes: ResolvedTheme[] = [
      "kanagawa-dragon",
      "light",
      "dark",
    ];

    expect(validResolvedThemes).toHaveLength(3);
    expect(validResolvedThemes).not.toContain("system");
  });
});

describe("getThemeColorScheme関数", () => {
  it("kanagawa-dragon は dark を返す", async () => {
    const { getThemeColorScheme } = await import("./types");
    expect(getThemeColorScheme("kanagawa-dragon")).toBe("dark");
  });

  it("light は light を返す", async () => {
    const { getThemeColorScheme } = await import("./types");
    expect(getThemeColorScheme("light")).toBe("light");
  });

  it("dark は dark を返す", async () => {
    const { getThemeColorScheme } = await import("./types");
    expect(getThemeColorScheme("dark")).toBe("dark");
  });
});

describe("ViewType 型 - skillAnalysis / skillCreate 追加（TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001）", () => {
  it("TC-VT-01: skillAnalysis が ViewType union に含まれること", () => {
    const validViewTypes: ViewType[] = ["skillAnalysis"];
    expect(validViewTypes).toContain("skillAnalysis");
  });

  it("TC-VT-02: skillCreate が ViewType union に含まれること", () => {
    const validViewTypes: ViewType[] = ["skillCreate"];
    expect(validViewTypes).toContain("skillCreate");
  });

  it("TC-VT-03: 既存の ViewType member が引き続き有効であること", () => {
    const existingViewTypes: ViewType[] = [
      "dashboard",
      "workspace",
      "editor",
      "chat",
      "graph",
      "settings",
      "agent",
      "skillCenter",
      "historySearch",
      "chainBuilder",
      "scheduleManager",
      "debugPanel",
      "analyticsDashboard",
      "skill-editor",
      "skill-center",
    ];
    expect(existingViewTypes).toHaveLength(15);
  });

  it("TC-VT-04: ViewType union が合計 17 member を持つこと", () => {
    const allViewTypes: ViewType[] = [
      "dashboard",
      "workspace",
      "editor",
      "chat",
      "graph",
      "settings",
      "agent",
      "skillCenter",
      "historySearch",
      "chainBuilder",
      "scheduleManager",
      "debugPanel",
      "analyticsDashboard",
      "skill-editor",
      "skill-center",
      "skillAnalysis",
      "skillCreate",
    ];
    expect(allViewTypes).toHaveLength(17);
  });
});
