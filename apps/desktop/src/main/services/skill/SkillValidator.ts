/**
 * SkillValidator - スキル構造とセキュリティの検証
 * TASK-9B Phase 5
 *
 * スキルディレクトリ構造の検証、セキュリティ攻撃パターンの検出、
 * スキーマバリデーション、パス安全性検証を提供する。
 */
import path from "path";
import fs from "fs/promises";
import yaml from "yaml";

/** パストラバーサル攻撃パターン */
const PATH_TRAVERSAL_PATTERNS = ["../", "..\\"];

/** コマンドインジェクションパターン */
const COMMAND_INJECTION_PATTERNS = [
  /\$\(.*\)/, // $(...)
  /`[^`]*`/, // `...`
  /;\s*\w+/, // ; command
  /\|\s*\w+/, // | command
];

/** バリデーション結果 */
interface ValidationResult {
  /** バリデーション成功フラグ */
  isValid: boolean;
  /** 検出されたエラーメッセージの配列 */
  errors: string[];
}

/** スキーマバリデーション結果 */
interface SchemaValidationResult {
  /** バリデーション成功フラグ */
  isValid: boolean;
  /** フィールドごとのエラー情報 */
  errors: Array<{
    /** フィールド名 */
    field: string;
    /** エラーメッセージ */
    message: string;
  }>;
}

/** スキーマフィールド定義 */
interface SchemaFieldSpec {
  /** 期待する型（typeof の戻り値） */
  type: string;
  /** 必須フィールドか */
  required?: boolean;
}

export class SkillValidator {
  /**
   * SKILL.md の妥当性を検証する
   * - YAML frontmatter の存在
   * - 必須フィールド（name, description）
   *
   * @param content - SKILL.md の内容
   * @returns バリデーション結果
   */
  validateSkillMd(content: string): ValidationResult {
    const errors: string[] = [];

    // P42: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    if (typeof content !== "string") {
      return {
        isValid: false,
        errors: ["SKILL.md content must be a string"],
      };
    }
    if (content === "") {
      return {
        isValid: false,
        errors: ["SKILL.md content must not be empty"],
      };
    }
    if (content.trim() === "") {
      return {
        isValid: false,
        errors: ["SKILL.md content must not be whitespace only"],
      };
    }

    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!frontmatterMatch) {
      return {
        isValid: false,
        errors: ["SKILL.md must include YAML frontmatter"],
      };
    }

    let frontmatter: Record<string, unknown> = {};
    try {
      frontmatter =
        (yaml.parse(frontmatterMatch[1]) as Record<string, unknown>) ?? {};
    } catch {
      return {
        isValid: false,
        errors: ["Invalid YAML frontmatter"],
      };
    }

    if (
      typeof frontmatter.name !== "string" ||
      frontmatter.name.trim() === ""
    ) {
      errors.push('Frontmatter "name" is required');
    }

    if (
      typeof frontmatter.description !== "string" ||
      frontmatter.description.trim() === ""
    ) {
      errors.push('Frontmatter "description" is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * スキルディレクトリ構造の検証
   * SKILL.md の存在を含む構造検証を実施する
   *
   * @param skillDir - スキルディレクトリパス
   * @returns 構造が有効な場合true
   */
  async validateStructure(skillDir: string): Promise<boolean> {
    if (!this.validatePath(skillDir).isValid) {
      return false;
    }

    try {
      const resolvedPath = path.resolve(skillDir);
      await fs.access(path.join(resolvedPath, "SKILL.md"));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * セキュリティ検証
   * パストラバーサル、コマンドインジェクション、NULLバイトを検出する
   *
   * @param input - 検証対象の入力文字列
   * @returns バリデーション結果
   */
  validateSecurity(input: string): ValidationResult {
    const errors: string[] = [];

    // NULLバイト検出
    if (input.includes("\0")) {
      errors.push("NULL byte detected in input");
    }

    // パストラバーサル検出
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (input.includes(pattern)) {
        errors.push(`Path traversal pattern detected: ${pattern}`);
      }
    }

    // コマンドインジェクション検出
    for (const pattern of COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        errors.push("Command injection pattern detected");
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * スキーマ検証
   * データオブジェクトがスキーマ定義に適合するか検証する
   *
   * @param data - 検証対象のデータ（unknown型で受け取りランタイム検証）
   * @param schema - フィールド名と型定義のマップ
   * @returns スキーマバリデーション結果
   */
  validateSchema(
    data: unknown,
    schema: Record<string, SchemaFieldSpec>,
  ): SchemaValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    if (typeof data !== "object" || data === null) {
      return {
        isValid: false,
        errors: [{ field: "root", message: "Data must be an object" }],
      };
    }

    const dataObj = data as Record<string, unknown>;

    for (const [field, spec] of Object.entries(schema)) {
      const value = dataObj[field];

      if (spec.required && (value === undefined || value === null)) {
        errors.push({ field, message: `Field "${field}" is required` });
        continue;
      }

      if (value !== undefined && typeof value !== spec.type) {
        errors.push({
          field,
          message: `Field "${field}" must be of type "${spec.type}", got "${typeof value}"`,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * パス安全性検証
   * NULLバイト、UNCパス、パストラバーサル、空パスを検出する
   *
   * @param inputPath - 検証対象のパス文字列
   * @returns バリデーション結果
   */
  validatePath(inputPath: string): ValidationResult {
    const errors: string[] = [];

    // P42: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    if (!inputPath || inputPath.trim() === "") {
      errors.push("Path must not be empty");
      return { isValid: false, errors };
    }

    // NULLバイト検出
    if (inputPath.includes("\0")) {
      errors.push("NULL byte detected in path");
    }

    // UNCパス検出
    if (inputPath.startsWith("\\\\")) {
      errors.push("UNC paths are not allowed");
    }

    // パストラバーサル検出
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (inputPath.includes(pattern)) {
        errors.push("Path traversal detected");
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
