import { describe, expect, expectTypeOf, it } from "vitest";

import {
  SKILL_INFO_VALIDATION_MESSAGES,
  type SkillInfoValidationInput,
  validatePurpose,
  validateSkillInfoForm,
  validateSkillName,
} from "../skillInfoFormValidation";
import { validateSkillInfoForm as validateSkillInfoFormFromBarrel } from "../index";

describe("validateSkillName", () => {
  it("TC-01: undefined → valid", () => {
    expect(validateSkillName(undefined)).toEqual({ valid: true });
  });

  it("TC-02: null → valid", () => {
    expect(validateSkillName(null)).toEqual({ valid: true });
  });

  it("TC-03: 空白のみ → invalid", () => {
    expect(validateSkillName("  ")).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.skillName.required,
    });
  });

  it("TC-04: 通常文字列 → valid", () => {
    expect(validateSkillName("テスト")).toEqual({ valid: true });
  });

  it("TC-05: 101文字の文字列 → invalid", () => {
    const input = "あ".repeat(101);
    expect(validateSkillName(input)).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.skillName.maxLength,
    });
  });

  it("TC-06: 100文字の文字列 → valid", () => {
    const input = "あ".repeat(100);
    expect(validateSkillName(input)).toEqual({ valid: true });
  });

  it("EC-01: 空文字列 → invalid", () => {
    expect(validateSkillName("")).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.skillName.required,
    });
  });

  it("EC-02: 前後空白あり文字列 → trim後 valid", () => {
    expect(validateSkillName(" テスト ")).toEqual({ valid: true });
  });

  it("EC-03: 前後空白あり + trim後101文字 → invalid", () => {
    const input = ` ${"あ".repeat(101)} `;
    expect(validateSkillName(input)).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.skillName.maxLength,
    });
  });
});

describe("validatePurpose", () => {
  it("TC-07: 10文字以上の文字列 → valid", () => {
    expect(validatePurpose("十文字以上の目的文字列")).toEqual({ valid: true });
  });

  it("TC-08: 9文字の文字列 → invalid", () => {
    expect(validatePurpose("123456789")).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.purpose.minLength,
    });
  });

  it("TC-09: 501文字の文字列 → invalid", () => {
    const input = "あ".repeat(501);
    expect(validatePurpose(input)).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.purpose.maxLength,
    });
  });

  it("TC-10: 500文字の文字列 → valid", () => {
    const input = "あ".repeat(500);
    expect(validatePurpose(input)).toEqual({ valid: true });
  });

  it("EC-04: 空文字列 → invalid（10文字未満）", () => {
    expect(validatePurpose("")).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.purpose.minLength,
    });
  });

  it("EC-05: 日本語10文字ちょうど → valid", () => {
    expect(validatePurpose("あいうえおかきくけこ")).toEqual({ valid: true });
  });

  it("EC-06: 日本語9文字 → invalid", () => {
    expect(validatePurpose("あいうえおかきくけ")).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.purpose.minLength,
    });
  });

  it("EC-07: 日本語500文字ちょうど → valid", () => {
    const input = "あ".repeat(500);
    expect(validatePurpose(input)).toEqual({ valid: true });
  });

  it("EC-08: 日本語501文字 → invalid", () => {
    const input = "あ".repeat(501);
    expect(validatePurpose(input)).toEqual({
      valid: false,
      error: SKILL_INFO_VALIDATION_MESSAGES.purpose.maxLength,
    });
  });
});

describe("validateSkillInfoForm", () => {
  it("TC-11: 全フィールド valid → isValid: true", () => {
    const result = validateSkillInfoForm({
      skillName: "テストスキル",
      purpose: "十文字以上の目的文字列",
    });
    expect(result).toEqual({
      isValid: true,
      skillName: undefined,
      purpose: undefined,
    });
  });

  it("TC-12: skillName空白 + purpose短い → isValid: false, 両エラーあり", () => {
    const result = validateSkillInfoForm({
      skillName: "  ",
      purpose: "短い",
    });
    expect(result).toEqual({
      isValid: false,
      skillName: SKILL_INFO_VALIDATION_MESSAGES.skillName.required,
      purpose: SKILL_INFO_VALIDATION_MESSAGES.purpose.minLength,
    });
  });

  it("EC-09: skillName undefined + purpose valid → isValid: true", () => {
    const result = validateSkillInfoForm({
      purpose: "十文字以上の目的文字列",
    });
    expect(result).toEqual({
      isValid: true,
      skillName: undefined,
      purpose: undefined,
    });
  });

  it("EC-10: skillName valid + purpose空文字列 → isValid: false", () => {
    const result = validateSkillInfoForm({
      skillName: "スキル",
      purpose: "",
    });
    expect(result).toEqual({
      isValid: false,
      skillName: undefined,
      purpose: SKILL_INFO_VALIDATION_MESSAGES.purpose.minLength,
    });
  });

  it("EC-11: categoryは入力対象外（runtime case）→ isValid: true", () => {
    const result = validateSkillInfoForm({
      skillName: "スキル",
      purpose: "十分な長さの目的文字列",
    });
    expect(result).toEqual({
      isValid: true,
      skillName: undefined,
      purpose: undefined,
    });
  });

  it("EC-12: public barrel からも validateSkillInfoForm を利用できる", () => {
    const result = validateSkillInfoFormFromBarrel({
      skillName: "スキル",
      purpose: "十分な長さの目的文字列",
    });
    expect(result).toEqual({
      isValid: true,
      skillName: undefined,
      purpose: undefined,
    });
  });

  it("EC-13: SkillInfoValidationInput は skillName/purpose のみを受け取る", () => {
    expectTypeOf<SkillInfoValidationInput>().toEqualTypeOf<{
      skillName?: string;
      purpose: string;
    }>();
  });
});
