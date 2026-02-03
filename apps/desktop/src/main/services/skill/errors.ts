/**
 * Skill File Manager Error Classes
 *
 * スキルファイル操作に関するカスタムエラークラス
 */

/**
 * エラーコードの定数定義
 */
export const SkillFileErrorCode = {
  SKILL_NOT_FOUND: "SKILL_NOT_FOUND",
  READONLY_SKILL: "READONLY_SKILL",
  PATH_TRAVERSAL_DETECTED: "PATH_TRAVERSAL_DETECTED",
  FILE_ALREADY_EXISTS: "FILE_ALREADY_EXISTS",
  FILE_NOT_FOUND: "FILE_NOT_FOUND",
} as const;

export type SkillFileErrorCodeType =
  (typeof SkillFileErrorCode)[keyof typeof SkillFileErrorCode];

/**
 * スキルが見つからないエラー
 */
export class SkillNotFoundError extends Error {
  readonly code = SkillFileErrorCode.SKILL_NOT_FOUND;
  readonly skillName: string;

  constructor(skillName: string) {
    super(`Skill not found: ${skillName}`);
    this.name = "SkillNotFoundError";
    this.skillName = skillName;
    // Error クラスを継承する場合のプロトタイプチェーン修正
    Object.setPrototypeOf(this, SkillNotFoundError.prototype);
  }
}

/**
 * 読み取り専用スキルへの書き込みエラー
 */
export class ReadonlySkillError extends Error {
  readonly code = SkillFileErrorCode.READONLY_SKILL;
  readonly skillName: string;

  constructor(skillName: string) {
    super(`Cannot modify readonly skill: ${skillName}`);
    this.name = "ReadonlySkillError";
    this.skillName = skillName;
    Object.setPrototypeOf(this, ReadonlySkillError.prototype);
  }
}

/**
 * パストラバーサル検出エラー
 */
export class PathTraversalError extends Error {
  readonly code = SkillFileErrorCode.PATH_TRAVERSAL_DETECTED;
  readonly path: string;

  constructor(path: string) {
    super(`Path traversal detected: ${path}`);
    this.name = "PathTraversalError";
    this.path = path;
    Object.setPrototypeOf(this, PathTraversalError.prototype);
  }
}

/**
 * ファイルが既に存在するエラー（createFile時）
 */
export class FileExistsError extends Error {
  readonly code = SkillFileErrorCode.FILE_ALREADY_EXISTS;
  readonly path: string;

  constructor(path: string) {
    super(`File already exists: ${path}`);
    this.name = "FileExistsError";
    this.path = path;
    Object.setPrototypeOf(this, FileExistsError.prototype);
  }
}

/**
 * ファイルが見つからないエラー
 */
export class FileNotFoundError extends Error {
  readonly code = SkillFileErrorCode.FILE_NOT_FOUND;
  readonly path: string;

  constructor(path: string) {
    super(`File not found: ${path}`);
    this.name = "FileNotFoundError";
    this.path = path;
    Object.setPrototypeOf(this, FileNotFoundError.prototype);
  }
}
