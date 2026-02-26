/**
 * SkillValidator ユニットテスト
 * Phase 6: テスト拡充 — 実クラスを使用
 * テストID: VL-001 ~ VL-007, VL-EX-001, VL-EX-002
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillValidator } from "../SkillValidator";
import fs from "fs/promises";

vi.mock("fs/promises");

describe("SkillValidator", () => {
  let validator: SkillValidator;

  beforeEach(() => {
    vi.clearAllMocks();
    validator = new SkillValidator();
  });

  describe("validateStructure()", () => {
    it("VL-001: SKILL.md が存在する有効なスキルディレクトリに対して true を返す", async () => {
      (fs.access as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      const result = await validator.validateStructure("/path/to/valid-skill");

      expect(result).toBe(true);
    });

    it("VL-002: SKILL.md が存在しない場合に false を返す", async () => {
      (fs.access as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("ENOENT"),
      );

      const result = await validator.validateStructure("/path/to/no-skill-md");

      expect(result).toBe(false);
    });
  });

  describe("validatePath()", () => {
    it("VL-003: パストラバーサルパターンを拒否する", () => {
      const result = validator.validatePath("../../../etc/passwd");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes("traversal"))).toBe(true);
    });

    it("VL-004: NULLバイトを含むパスを拒否する", () => {
      const result = validator.validatePath("test\0evil");

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("NULL byte"))).toBe(true);
    });

    it("VL-004b: 空パスを拒否する", () => {
      const result = validator.validatePath("");

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("empty"))).toBe(true);
    });

    it("VL-004c: スペースのみのパスを拒否する（P42 3段バリデーション）", () => {
      const result = validator.validatePath("   ");

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("empty"))).toBe(true);
    });

    it("VL-004d: UNCパスを拒否する", () => {
      const result = validator.validatePath("\\\\server\\share");

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("UNC"))).toBe(true);
    });

    it("VL-004e: 有効なパスを受け入れる", () => {
      const result = validator.validatePath("/path/to/valid-dir");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validateSecurity()", () => {
    it("VL-005: コマンドインジェクションパターンを検出する", () => {
      const result1 = validator.validateSecurity("$(rm -rf /)");
      expect(result1.isValid).toBe(false);
      expect(
        result1.errors.some(
          (e) => e.includes("injection") || e.includes("Command"),
        ),
      ).toBe(true);

      const result2 = validator.validateSecurity("`whoami`");
      expect(result2.isValid).toBe(false);
      expect(
        result2.errors.some(
          (e) => e.includes("injection") || e.includes("Command"),
        ),
      ).toBe(true);
    });

    it("VL-005b: NULLバイトを含む入力を拒否する", () => {
      const result = validator.validateSecurity("test\0injection");

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("NULL byte"))).toBe(true);
    });

    it("VL-005c: 安全な入力を受け入れる", () => {
      const result = validator.validateSecurity("safe-input-value");

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("VL-EX-001: パストラバーサルパターンを含む入力を拒否する", () => {
      const result = validator.validateSecurity("../../../etc/shadow");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("validateSchema()", () => {
    const skillSchema: Record<string, { type: string; required?: boolean }> = {
      name: { type: "string", required: true },
      description: { type: "string", required: true },
    };

    it("VL-006: スキーマ準拠のデータを受け入れる", () => {
      const validData = {
        name: "test-skill",
        description: "A valid skill",
      };

      const result = validator.validateSchema(validData, skillSchema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("VL-007: スキーマ非準拠のデータを拒否する", () => {
      const invalidData = {
        name: 123,
        description: null,
      };

      const result = validator.validateSchema(invalidData, skillSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("VL-007b: 必須フィールドが欠けているデータを拒否する", () => {
      const incompleteData = {
        name: "test-skill",
      };

      const schema: Record<string, { type: string; required?: boolean }> = {
        name: { type: "string", required: true },
        description: { type: "string", required: true },
      };

      const result = validator.validateSchema(incompleteData, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "description")).toBe(true);
    });

    it("VL-EX-002: data が null の場合にエラーを返す", () => {
      const result = validator.validateSchema(null, skillSchema);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe("root");
      expect(result.errors[0].message).toContain("object");
    });
  });
});
