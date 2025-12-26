import { describe, it, expect } from "vitest";
import {
  validateTemplateName,
  validateTemplateContent,
  validateTemplateData,
} from "./systemPromptValidation";
import { ERROR_MESSAGES } from "../constants/systemPrompt";

describe("systemPromptValidation", () => {
  describe("validateTemplateName", () => {
    it("正常な名前を返す", () => {
      const result = validateTemplateName("テスト用テンプレート");
      expect(result).toBe("テスト用テンプレート");
    });

    it("前後の空白をトリムする", () => {
      const result = validateTemplateName("  テンプレート  ");
      expect(result).toBe("テンプレート");
    });

    it("空文字列の場合はエラーをスローする", () => {
      expect(() => validateTemplateName("")).toThrow(
        ERROR_MESSAGES.TEMPLATE_NAME_REQUIRED,
      );
    });

    it("空白のみの場合はエラーをスローする", () => {
      expect(() => validateTemplateName("   ")).toThrow(
        ERROR_MESSAGES.TEMPLATE_NAME_REQUIRED,
      );
    });

    it("50文字を超える場合はエラーをスローする", () => {
      const longName = "あ".repeat(51);
      expect(() => validateTemplateName(longName)).toThrow(
        ERROR_MESSAGES.TEMPLATE_NAME_TOO_LONG,
      );
    });

    it("50文字ちょうどの場合は通過する", () => {
      const name50 = "あ".repeat(50);
      const result = validateTemplateName(name50);
      expect(result).toBe(name50);
    });

    it("49文字の場合は通過する", () => {
      const name49 = "あ".repeat(49);
      const result = validateTemplateName(name49);
      expect(result).toBe(name49);
    });
  });

  describe("validateTemplateContent", () => {
    it("正常なコンテンツの場合は何もスローしない", () => {
      expect(() => validateTemplateContent("テストコンテンツ")).not.toThrow();
    });

    it("空文字列の場合も通過する", () => {
      expect(() => validateTemplateContent("")).not.toThrow();
    });

    it("4000文字以内の場合は通過する", () => {
      const content = "あ".repeat(4000);
      expect(() => validateTemplateContent(content)).not.toThrow();
    });

    it("4000文字を超える場合はエラーをスローする", () => {
      const content = "あ".repeat(4001);
      expect(() => validateTemplateContent(content)).toThrow(
        ERROR_MESSAGES.CONTENT_TOO_LONG,
      );
    });

    it("3999文字の場合は通過する", () => {
      const content = "あ".repeat(3999);
      expect(() => validateTemplateContent(content)).not.toThrow();
    });
  });

  describe("validateTemplateData", () => {
    it("正常な名前とコンテンツの場合はトリム済み名前を返す", () => {
      const result = validateTemplateData("  テンプレート  ", "コンテンツ");
      expect(result.trimmedName).toBe("テンプレート");
    });

    it("名前が空の場合はエラーをスローする", () => {
      expect(() => validateTemplateData("", "コンテンツ")).toThrow(
        ERROR_MESSAGES.TEMPLATE_NAME_REQUIRED,
      );
    });

    it("名前が長すぎる場合はエラーをスローする", () => {
      const longName = "あ".repeat(51);
      expect(() => validateTemplateData(longName, "コンテンツ")).toThrow(
        ERROR_MESSAGES.TEMPLATE_NAME_TOO_LONG,
      );
    });

    it("コンテンツが長すぎる場合はエラーをスローする", () => {
      const longContent = "あ".repeat(4001);
      expect(() => validateTemplateData("名前", longContent)).toThrow(
        ERROR_MESSAGES.CONTENT_TOO_LONG,
      );
    });

    it("名前とコンテンツの両方が正常な場合は通過する", () => {
      const result = validateTemplateData("正常な名前", "正常なコンテンツ");
      expect(result.trimmedName).toBe("正常な名前");
    });

    it("境界値: 名前50文字、コンテンツ4000文字の場合は通過する", () => {
      const name50 = "あ".repeat(50);
      const content4000 = "い".repeat(4000);
      const result = validateTemplateData(name50, content4000);
      expect(result.trimmedName).toBe(name50);
    });
  });
});
