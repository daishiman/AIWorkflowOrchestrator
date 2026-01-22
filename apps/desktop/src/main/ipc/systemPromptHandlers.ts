/**
 * システムプロンプトテンプレート IPC ハンドラー
 *
 * Main Process でシステムプロンプトテンプレート関連のIPC通信を処理する
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/ipc-handler-design.md
 */

import { ipcMain } from "electron";
import type {
  ISystemPromptRepository,
  PromptTemplate,
  CreatePromptTemplateInput,
  UpdatePromptTemplateInput,
  FindTemplatesOptions,
} from "@repo/shared/repositories";

// === 型定義 ===

/**
 * 成功レスポンス
 */
interface SuccessResult<T> {
  success: true;
  data: T;
}

/**
 * エラーレスポンス
 */
interface ErrorResult {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * IPC レスポンス型
 */
type Result<T> = SuccessResult<T> | ErrorResult;

/**
 * マイグレーション結果
 */
export interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  failedCount: number;
  errors: Array<{ name: string; reason: string }>;
}

/**
 * マイグレーションサービスインターフェース
 */
export interface MigrationService {
  needsMigration(): Promise<boolean>;
  migrate(): Promise<MigrationResult>;
}

// === IPCチャンネル定義 ===

export const SYSTEM_PROMPT_CHANNELS = {
  LIST: "system-prompt:list",
  GET: "system-prompt:get",
  CREATE: "system-prompt:create",
  UPDATE: "system-prompt:update",
  DELETE: "system-prompt:delete",
  MIGRATE: "system-prompt:migrate",
  GET_PRESETS: "system-prompt:get-presets",
} as const;

// === エラーコード ===

export const SYSTEM_PROMPT_ERROR_CODES = {
  LIST_FAILED: "system-prompt/list-failed",
  GET_FAILED: "system-prompt/get-failed",
  CREATE_FAILED: "system-prompt/create-failed",
  UPDATE_FAILED: "system-prompt/update-failed",
  DELETE_FAILED: "system-prompt/delete-failed",
  MIGRATE_FAILED: "system-prompt/migrate-failed",
  NOT_FOUND: "system-prompt/not-found",
  VALIDATION_FAILED: "system-prompt/validation-failed",
  PRESET_PROTECTION: "system-prompt/preset-protection",
  UNAUTHORIZED: "system-prompt/unauthorized",
} as const;

// === グローバル状態 ===

let currentRepository: ISystemPromptRepository | null = null;
let currentMigrationService: MigrationService | null = null;

// === ハンドラー登録 ===

/**
 * システムプロンプトテンプレート関連IPCハンドラーを登録
 */
export function registerSystemPromptHandlers(
  repository: ISystemPromptRepository,
  migrationService?: MigrationService,
): void {
  currentRepository = repository;
  currentMigrationService = migrationService ?? null;

  // system-prompt:list - テンプレート一覧取得
  ipcMain.handle(
    SYSTEM_PROMPT_CHANNELS.LIST,
    async (
      _event,
      { userId, options }: { userId: string; options?: FindTemplatesOptions },
    ): Promise<Result<PromptTemplate[]>> => {
      try {
        if (!currentRepository) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.LIST_FAILED,
              message: "Repository not initialized",
            },
          };
        }

        if (!userId || userId.trim() === "") {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.VALIDATION_FAILED,
              message: "userId is required",
            },
          };
        }

        const templates = await currentRepository.findAllByUserId(
          userId,
          options,
        );
        return { success: true, data: templates };
      } catch (error) {
        return {
          success: false,
          error: {
            code: SYSTEM_PROMPT_ERROR_CODES.LIST_FAILED,
            message:
              error instanceof Error
                ? error.message
                : "Failed to list templates",
          },
        };
      }
    },
  );

  // system-prompt:get - テンプレート取得
  ipcMain.handle(
    SYSTEM_PROMPT_CHANNELS.GET,
    async (_event, { id }: { id: string }): Promise<Result<PromptTemplate>> => {
      try {
        if (!currentRepository) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.GET_FAILED,
              message: "Repository not initialized",
            },
          };
        }

        const template = await currentRepository.findById(id);
        if (!template) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.NOT_FOUND,
              message: "Template not found",
            },
          };
        }

        return { success: true, data: template };
      } catch (error) {
        return {
          success: false,
          error: {
            code: SYSTEM_PROMPT_ERROR_CODES.GET_FAILED,
            message:
              error instanceof Error ? error.message : "Failed to get template",
          },
        };
      }
    },
  );

  // system-prompt:create - テンプレート作成
  ipcMain.handle(
    SYSTEM_PROMPT_CHANNELS.CREATE,
    async (
      _event,
      { userId, data }: { userId: string; data: CreatePromptTemplateInput },
    ): Promise<Result<PromptTemplate>> => {
      try {
        if (!currentRepository) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.CREATE_FAILED,
              message: "Repository not initialized",
            },
          };
        }

        const template = await currentRepository.create(userId, data);
        return { success: true, data: template };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to create template";
        return {
          success: false,
          error: {
            code:
              message.includes("重複") || message.includes("同名")
                ? SYSTEM_PROMPT_ERROR_CODES.VALIDATION_FAILED
                : SYSTEM_PROMPT_ERROR_CODES.CREATE_FAILED,
            message,
          },
        };
      }
    },
  );

  // system-prompt:update - テンプレート更新
  ipcMain.handle(
    SYSTEM_PROMPT_CHANNELS.UPDATE,
    async (
      _event,
      {
        id,
        userId,
        data,
      }: { id: string; userId: string; data: UpdatePromptTemplateInput },
    ): Promise<Result<PromptTemplate>> => {
      try {
        if (!currentRepository) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.UPDATE_FAILED,
              message: "Repository not initialized",
            },
          };
        }

        // 存在チェックと認可チェック
        const existing = await currentRepository.findById(id);
        if (!existing) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.NOT_FOUND,
              message: "Template not found",
            },
          };
        }

        // プリセット保護
        if (existing.isPreset) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.PRESET_PROTECTION,
              message: "Preset templates cannot be modified",
            },
          };
        }

        // 所有者チェック
        if (existing.userId !== userId) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.UNAUTHORIZED,
              message: "Not authorized to update this template",
            },
          };
        }

        const template = await currentRepository.update(id, data);
        return { success: true, data: template };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update template";
        return {
          success: false,
          error: {
            code: message.includes("プリセット")
              ? SYSTEM_PROMPT_ERROR_CODES.PRESET_PROTECTION
              : SYSTEM_PROMPT_ERROR_CODES.UPDATE_FAILED,
            message,
          },
        };
      }
    },
  );

  // system-prompt:delete - テンプレート削除
  ipcMain.handle(
    SYSTEM_PROMPT_CHANNELS.DELETE,
    async (
      _event,
      { id, userId }: { id: string; userId: string },
    ): Promise<Result<void>> => {
      try {
        if (!currentRepository) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.DELETE_FAILED,
              message: "Repository not initialized",
            },
          };
        }

        // 存在チェックと認可チェック
        const existing = await currentRepository.findById(id);
        if (!existing) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.NOT_FOUND,
              message: "Template not found",
            },
          };
        }

        // プリセット保護
        if (existing.isPreset) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.PRESET_PROTECTION,
              message: "Preset templates cannot be deleted",
            },
          };
        }

        // 所有者チェック
        if (existing.userId !== userId) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.UNAUTHORIZED,
              message: "Not authorized to delete this template",
            },
          };
        }

        await currentRepository.delete(id);
        return { success: true, data: undefined };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete template";
        return {
          success: false,
          error: {
            code: message.includes("プリセット")
              ? SYSTEM_PROMPT_ERROR_CODES.PRESET_PROTECTION
              : SYSTEM_PROMPT_ERROR_CODES.DELETE_FAILED,
            message,
          },
        };
      }
    },
  );

  // system-prompt:migrate - マイグレーション実行
  ipcMain.handle(
    SYSTEM_PROMPT_CHANNELS.MIGRATE,
    async (): Promise<Result<MigrationResult>> => {
      try {
        if (!currentMigrationService) {
          return {
            success: true,
            data: {
              migratedCount: 0,
              skippedCount: 0,
              failedCount: 0,
              errors: [],
            },
          };
        }

        const needsMigration = await currentMigrationService.needsMigration();
        if (!needsMigration) {
          return {
            success: true,
            data: {
              migratedCount: 0,
              skippedCount: 0,
              failedCount: 0,
              errors: [],
            },
          };
        }

        const result = await currentMigrationService.migrate();
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: {
            code: SYSTEM_PROMPT_ERROR_CODES.MIGRATE_FAILED,
            message:
              error instanceof Error ? error.message : "Failed to migrate",
          },
        };
      }
    },
  );

  // system-prompt:get-presets - プリセット一覧取得
  ipcMain.handle(
    SYSTEM_PROMPT_CHANNELS.GET_PRESETS,
    async (): Promise<Result<PromptTemplate[]>> => {
      try {
        if (!currentRepository) {
          return {
            success: false,
            error: {
              code: SYSTEM_PROMPT_ERROR_CODES.LIST_FAILED,
              message: "Repository not initialized",
            },
          };
        }

        const presets = await currentRepository.findAllPresets();
        return { success: true, data: presets };
      } catch (error) {
        return {
          success: false,
          error: {
            code: SYSTEM_PROMPT_ERROR_CODES.LIST_FAILED,
            message:
              error instanceof Error ? error.message : "Failed to list presets",
          },
        };
      }
    },
  );
}

/**
 * システムプロンプトテンプレート関連IPCハンドラーを解除
 */
export function unregisterSystemPromptHandlers(): void {
  ipcMain.removeHandler(SYSTEM_PROMPT_CHANNELS.LIST);
  ipcMain.removeHandler(SYSTEM_PROMPT_CHANNELS.GET);
  ipcMain.removeHandler(SYSTEM_PROMPT_CHANNELS.CREATE);
  ipcMain.removeHandler(SYSTEM_PROMPT_CHANNELS.UPDATE);
  ipcMain.removeHandler(SYSTEM_PROMPT_CHANNELS.DELETE);
  ipcMain.removeHandler(SYSTEM_PROMPT_CHANNELS.MIGRATE);
  ipcMain.removeHandler(SYSTEM_PROMPT_CHANNELS.GET_PRESETS);

  currentRepository = null;
  currentMigrationService = null;
}
