/**
 * @vitest-environment node
 *
 * i18n Configuration Tests (TDD Red Phase)
 *
 * TASK-3-2-B: SkillStreamDisplay i18n対応
 * i18n設定の初期化と翻訳取得のテストケース
 *
 * Note: これらのテストは実装前に作成されるため、すべて失敗する（Red状態）
 *
 * @module @repo/desktop/renderer/i18n/config.test
 */

import { describe, it, expect } from "vitest";

// Note: config.tsが存在しないため、このテストは失敗する（Red状態）
// 以下のインポートは実装後に有効になる
// import i18n from "./config";

describe("i18n Configuration (TDD Red Phase)", () => {
  // ============================================================
  // 初期化テスト
  // ============================================================
  describe("Initialization", () => {
    it("should initialize i18n without errors", async () => {
      // このテストは config.ts が存在しないため失敗する
      const i18n = await import("./config");
      expect(i18n.default).toBeDefined();
      expect(i18n.default.isInitialized).toBe(true);
    });

    it("should have correct default language", async () => {
      const i18n = await import("./config");
      expect(i18n.default.language).toMatch(/^(ja|en)/);
    });

    it("should have fallback language set to Japanese", async () => {
      const i18n = await import("./config");
      expect(i18n.default.options.fallbackLng).toContain("ja");
    });

    it("should have default namespace set to skill-stream", async () => {
      const i18n = await import("./config");
      expect(i18n.default.options.defaultNS).toBe("skill-stream");
    });
  });

  // ============================================================
  // 翻訳キー取得テスト
  // ============================================================
  describe("Translation retrieval", () => {
    it("should return Japanese translation for status.running", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("ja");
      expect(i18n.default.t("status.running")).toBe("実行中");
    });

    it("should return English translation for status.running", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("en");
      expect(i18n.default.t("status.running")).toBe("Running");
    });

    it("should return Japanese translation for feedback.copied", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("ja");
      expect(i18n.default.t("feedback.copied")).toBe("コピーしました");
    });

    it("should return English translation for feedback.copied", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("en");
      expect(i18n.default.t("feedback.copied")).toBe("Copied");
    });
  });

  // ============================================================
  // 補間テスト
  // ============================================================
  describe("Interpolation", () => {
    it("should interpolate count in Japanese time format", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("ja");
      expect(i18n.default.t("time.secondsAgo", { count: 30 })).toBe("30秒前");
    });

    it("should interpolate count in English time format (plural)", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("en");
      expect(i18n.default.t("time.secondsAgo", { count: 30 })).toBe(
        "30 seconds ago",
      );
    });

    it("should handle singular form in English", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("en");
      expect(i18n.default.t("time.secondsAgo", { count: 1 })).toBe(
        "1 second ago",
      );
    });
  });

  // ============================================================
  // フォールバックテスト
  // ============================================================
  describe("Fallback behavior", () => {
    it("should fallback to Japanese for unsupported language", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("fr");
      // フランス語は未対応なので日本語にフォールバック
      expect(i18n.default.t("status.running")).toBe("実行中");
    });

    it("should return key for non-existent translation", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("ja");
      // 存在しないキーはキー名がそのまま返る
      expect(i18n.default.t("non.existent.key")).toBe("non.existent.key");
    });
  });

  // ============================================================
  // 名前空間テスト
  // ============================================================
  describe("Namespace", () => {
    it("should load skill-stream namespace", async () => {
      const i18n = await import("./config");
      expect(i18n.default.hasLoadedNamespace("skill-stream")).toBe(true);
    });

    it("should have resources for Japanese locale", async () => {
      const i18n = await import("./config");
      const jaResources = i18n.default.getResourceBundle("ja", "skill-stream");
      expect(jaResources).toBeDefined();
      expect(jaResources.status).toBeDefined();
    });

    it("should have resources for English locale", async () => {
      const i18n = await import("./config");
      const enResources = i18n.default.getResourceBundle("en", "skill-stream");
      expect(enResources).toBeDefined();
      expect(enResources.status).toBeDefined();
    });
  });

  // ============================================================
  // aria-labelテスト
  // ============================================================
  describe("Aria labels", () => {
    it("should return Japanese aria label for loading", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("ja");
      expect(i18n.default.t("aria.loading")).toBe("実行中");
    });

    it("should return English aria label for loading", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("en");
      expect(i18n.default.t("aria.loading")).toBe("Loading");
    });

    it("should return Japanese aria label for copy message", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("ja");
      expect(i18n.default.t("aria.copyMessage")).toBe("メッセージをコピー");
    });

    it("should return English aria label for copy message", async () => {
      const i18n = await import("./config");
      await i18n.default.changeLanguage("en");
      expect(i18n.default.t("aria.copyMessage")).toBe("Copy message");
    });
  });
});
