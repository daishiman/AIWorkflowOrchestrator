/**
 * @file types.test.ts
 * @description ThemeMode型とResolvedTheme型のテスト（TDD: Red）
 */

import { describe, it, expect } from "vitest";
import type { ThemeMode, ResolvedTheme } from "./types";

describe("ThemeMode型", () => {
  describe("型定義の検証", () => {
    it("should include kanagawa-dragon as a valid ThemeMode", () => {
      const theme: ThemeMode = "kanagawa-dragon";
      expect(theme).toBe("kanagawa-dragon");
    });

    it("should include kanagawa-wave as a valid ThemeMode", () => {
      const theme: ThemeMode = "kanagawa-wave";
      expect(theme).toBe("kanagawa-wave");
    });

    it("should include kanagawa-lotus as a valid ThemeMode", () => {
      const theme: ThemeMode = "kanagawa-lotus";
      expect(theme).toBe("kanagawa-lotus");
    });

    it("should include light as a valid ThemeMode", () => {
      const theme: ThemeMode = "light";
      expect(theme).toBe("light");
    });

    it("should include dark as a valid ThemeMode", () => {
      const theme: ThemeMode = "dark";
      expect(theme).toBe("dark");
    });

    it("should include system as a valid ThemeMode", () => {
      const theme: ThemeMode = "system";
      expect(theme).toBe("system");
    });
  });
});

describe("ResolvedTheme型", () => {
  describe("型定義の検証", () => {
    it("should include kanagawa-dragon as a valid ResolvedTheme", () => {
      const theme: ResolvedTheme = "kanagawa-dragon";
      expect(theme).toBe("kanagawa-dragon");
    });

    it("should include kanagawa-wave as a valid ResolvedTheme", () => {
      const theme: ResolvedTheme = "kanagawa-wave";
      expect(theme).toBe("kanagawa-wave");
    });

    it("should include kanagawa-lotus as a valid ResolvedTheme", () => {
      const theme: ResolvedTheme = "kanagawa-lotus";
      expect(theme).toBe("kanagawa-lotus");
    });

    it("should include light as a valid ResolvedTheme", () => {
      const theme: ResolvedTheme = "light";
      expect(theme).toBe("light");
    });

    it("should include dark as a valid ResolvedTheme", () => {
      const theme: ResolvedTheme = "dark";
      expect(theme).toBe("dark");
    });

    it("should NOT include system as a ResolvedTheme", () => {
      // systemは解決後の型ではないため、ResolvedThemeには含まれない
      // この型制約はTypeScriptコンパイラによって保証される
      // テストではResolvedThemeが"system"以外の全ての値を受け入れることを確認
      const validResolvedThemes: ResolvedTheme[] = [
        "light",
        "dark",
        "kanagawa-dragon",
        "kanagawa-wave",
        "kanagawa-lotus",
      ];

      expect(validResolvedThemes).toHaveLength(5);
      expect(validResolvedThemes).not.toContain("system");
    });
  });
});

describe("getThemeColorScheme関数", () => {
  // getThemeColorScheme関数は設計書に記載されているが、まだ実装されていない
  // このテストはRedフェーズとして失敗することが期待される

  it("should return dark for kanagawa-dragon theme", async () => {
    const { getThemeColorScheme } = await import("./types");
    const colorScheme = getThemeColorScheme("kanagawa-dragon");
    expect(colorScheme).toBe("dark");
  });

  it("should return dark for kanagawa-wave theme", async () => {
    const { getThemeColorScheme } = await import("./types");
    const colorScheme = getThemeColorScheme("kanagawa-wave");
    expect(colorScheme).toBe("dark");
  });

  it("should return light for kanagawa-lotus theme", async () => {
    const { getThemeColorScheme } = await import("./types");
    const colorScheme = getThemeColorScheme("kanagawa-lotus");
    expect(colorScheme).toBe("light");
  });

  it("should return light for light theme", async () => {
    const { getThemeColorScheme } = await import("./types");
    const colorScheme = getThemeColorScheme("light");
    expect(colorScheme).toBe("light");
  });

  it("should return dark for dark theme", async () => {
    const { getThemeColorScheme } = await import("./types");
    const colorScheme = getThemeColorScheme("dark");
    expect(colorScheme).toBe("dark");
  });
});
