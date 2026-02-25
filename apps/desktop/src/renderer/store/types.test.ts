import { describe, it, expect } from "vitest";
import type { ThemeMode, ResolvedTheme } from "./types";

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
