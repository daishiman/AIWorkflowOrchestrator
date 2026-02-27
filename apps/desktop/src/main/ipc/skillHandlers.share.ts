/**
 * Skill Share IPC Handlers
 *
 * スキル共有（インポート／エクスポート／ソース検証）の IPC ハンドラ。
 * チャネル名: skill:importFromSource, skill:export, skill:validateSource
 *
 * @see docs/30-workflows/skill-share/phase-5-implementation.md
 */
import { ipcMain } from "electron";
import type { BrowserWindow } from "electron";
import {
  validateIpcSender,
  toIPCValidationError,
} from "../infrastructure/security/ipc-validator.js";

/** SkillShareManager が満たすべきインターフェース */
interface SkillShareManagerInterface {
  importFromSource(source: unknown): Promise<unknown>;
  exportSkill(skillName: string, destination: unknown): Promise<unknown>;
  validateSource(source: unknown): Promise<unknown>;
}

/** スキル共有 IPC チャネル名（定数） */
const CHANNELS = {
  IMPORT_FROM_SOURCE: "skill:importFromSource",
  EXPORT: "skill:export",
  VALIDATE_SOURCE: "skill:validateSource",
} as const;

/** 許可されたインポートソース種別 */
const ALLOWED_SOURCE_TYPES = ["github", "gist", "url", "local"] as const;

/** 許可されたエクスポート先種別 */
const ALLOWED_DESTINATION_TYPES = ["gist", "local"] as const;

/** 文字列フィールドの最大長 */
const MAX_STRING_LENGTH = 10000;

/**
 * VALIDATION_ERROR レスポンスを生成する
 */
function validationError(message: string) {
  return {
    success: false,
    error: { code: "VALIDATION_ERROR", message },
  };
}

/**
 * 値がオブジェクト（非 null、非配列）かどうかを判定する
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * P42 準拠 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）
 * @returns エラーメッセージ。バリデーション通過時は null。
 */
function validateStringField(value: unknown, fieldName: string): string | null {
  if (typeof value !== "string") {
    return `${fieldName} must be a string`;
  }
  if (value === "") {
    return `${fieldName} must not be empty`;
  }
  if (value.trim() === "") {
    return `${fieldName} must not be whitespace only`;
  }
  return null;
}

/**
 * スキル共有 IPC ハンドラを登録する
 *
 * @param mainWindow メインウィンドウ
 * @param skillShareManager スキル共有マネージャー
 */
export function registerSkillShareHandlers(
  mainWindow: BrowserWindow,
  skillShareManager: SkillShareManagerInterface,
): void {
  // =========================================================================
  // skill:importFromSource
  // =========================================================================
  ipcMain.handle(
    CHANNELS.IMPORT_FROM_SOURCE,
    async (event, source: unknown) => {
      // Sender 検証
      const validation = validateIpcSender(event, CHANNELS.IMPORT_FROM_SOURCE, {
        getAllowedWindows: () => [mainWindow],
      });
      if (!validation.valid) {
        throw toIPCValidationError(validation);
      }

      // source がオブジェクトであることを検証
      if (!isPlainObject(source)) {
        return validationError("source must be a non-null object");
      }

      // source.type の P42 準拠 3 段バリデーション
      const typeError = validateStringField(source.type, "source.type");
      if (typeError !== null) {
        return validationError(typeError);
      }

      // source.type が許可値であることを検証
      const sourceType = (source.type as string).trim();
      if (
        !ALLOWED_SOURCE_TYPES.includes(
          sourceType as (typeof ALLOWED_SOURCE_TYPES)[number],
        )
      ) {
        return validationError(
          `source.type must be one of: ${ALLOWED_SOURCE_TYPES.join(", ")}`,
        );
      }

      // github の場合、repo の追加バリデーション
      if (sourceType === "github" && typeof source.repo === "string") {
        if (source.repo.length >= MAX_STRING_LENGTH) {
          return validationError(
            `source.repo must be less than ${MAX_STRING_LENGTH} characters`,
          );
        }
      }

      return skillShareManager.importFromSource(source);
    },
  );

  // =========================================================================
  // skill:export
  // =========================================================================
  ipcMain.handle(CHANNELS.EXPORT, async (event, args: unknown) => {
    // Sender 検証
    const validation = validateIpcSender(event, CHANNELS.EXPORT, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // args がオブジェクトであることを検証
    if (!isPlainObject(args)) {
      return validationError("args must be a non-null object");
    }

    // args.skillName の P42 準拠 3 段バリデーション
    const skillNameError = validateStringField(
      args.skillName,
      "args.skillName",
    );
    if (skillNameError !== null) {
      return validationError(skillNameError);
    }

    // args.destination がオブジェクトであることを検証
    if (!isPlainObject(args.destination)) {
      return validationError("args.destination must be a non-null object");
    }

    // args.destination.type が許可値であることを検証
    const destTypeError = validateStringField(
      args.destination.type,
      "args.destination.type",
    );
    if (destTypeError !== null) {
      return validationError(destTypeError);
    }

    const destType = (args.destination.type as string).trim();
    if (
      !ALLOWED_DESTINATION_TYPES.includes(
        destType as (typeof ALLOWED_DESTINATION_TYPES)[number],
      )
    ) {
      return validationError(
        `args.destination.type must be one of: ${ALLOWED_DESTINATION_TYPES.join(", ")}`,
      );
    }

    return skillShareManager.exportSkill(
      (args.skillName as string).trim(),
      args.destination,
    );
  });

  // =========================================================================
  // skill:validateSource
  // =========================================================================
  ipcMain.handle(CHANNELS.VALIDATE_SOURCE, async (event, source: unknown) => {
    // Sender 検証
    const validation = validateIpcSender(event, CHANNELS.VALIDATE_SOURCE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // source がオブジェクトであることを検証（配列を除外）
    if (!isPlainObject(source)) {
      return validationError("source must be a non-null object");
    }

    // source.type の P42 準拠 3 段バリデーション
    const typeError = validateStringField(source.type, "source.type");
    if (typeError !== null) {
      return validationError(typeError);
    }

    return skillShareManager.validateSource(source);
  });
}

/**
 * スキル共有 IPC ハンドラを解除する
 */
export function unregisterSkillShareHandlers(): void {
  ipcMain.removeHandler(CHANNELS.IMPORT_FROM_SOURCE);
  ipcMain.removeHandler(CHANNELS.EXPORT);
  ipcMain.removeHandler(CHANNELS.VALIDATE_SOURCE);
}
