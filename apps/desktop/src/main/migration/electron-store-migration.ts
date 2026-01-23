/**
 * Electron Store から TursoDB へのマイグレーション
 *
 * @see docs/30-workflows/system-prompt-db/outputs/phase-2/migration-design.md
 */

import * as fs from "fs/promises";
import * as path from "path";
import { app } from "electron";
import type {
  ISystemPromptRepository,
  CreatePromptTemplateInput,
} from "@repo/shared/repositories";

// === 型定義 ===

/**
 * マイグレーション結果
 */
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  errors: MigrationError[];
}

/**
 * マイグレーションエラー
 */
export interface MigrationError {
  templateId: string;
  message: string;
  code: MigrationErrorCode;
}

/**
 * マイグレーションエラーコード
 */
export type MigrationErrorCode =
  | "DUPLICATE_NAME"
  | "VALIDATION_ERROR"
  | "DB_ERROR"
  | "UNKNOWN";

/**
 * マイグレーションステータス
 */
export interface MigrationStatus {
  completed: boolean;
  lastMigratedAt: string | null;
  lastResult: MigrationResult | null;
}

/**
 * Electron Store のテンプレート形式
 */
export interface ElectronStoreTemplate {
  id: string;
  name: string;
  content: string;
  isPreset: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Electron Store インターフェース
 */
export interface IElectronStore {
  get<T>(key: string, defaultValue?: T): T;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
}

// === 定数 ===

const TEMPLATES_KEY = "systemPromptTemplates";
const MIGRATION_STATUS_KEY = "migrationStatus";
const SYSTEM_PROMPT_MIGRATION_KEY = "systemPromptTemplates";

// === 実装 ===

/**
 * Electron Store マイグレーションクラス
 */
export class ElectronStoreMigration {
  constructor(
    private repository: ISystemPromptRepository,
    private store?: IElectronStore,
  ) {}

  /**
   * マイグレーションが必要か判定
   */
  async needsMigration(): Promise<boolean> {
    if (!this.store) {
      return false;
    }

    // 完了フラグを確認
    const status = this.store.get<{
      [SYSTEM_PROMPT_MIGRATION_KEY]?: { completed: boolean };
    }>(MIGRATION_STATUS_KEY, {});

    if (status[SYSTEM_PROMPT_MIGRATION_KEY]?.completed) {
      return false;
    }

    // データがあるか確認
    const templates = this.store.get<ElectronStoreTemplate[]>(
      TEMPLATES_KEY,
      [],
    );
    const customTemplates = templates.filter((t) => !t.isPreset);

    return customTemplates.length > 0;
  }

  /**
   * マイグレーションステータスを取得
   */
  async getStatus(): Promise<MigrationStatus> {
    if (!this.store) {
      return {
        completed: false,
        lastMigratedAt: null,
        lastResult: null,
      };
    }

    const status = this.store.get<{
      [SYSTEM_PROMPT_MIGRATION_KEY]?: {
        completed: boolean;
        completedAt?: string;
        lastResult?: MigrationResult;
      };
    }>(MIGRATION_STATUS_KEY, {});

    const migrationStatus = status[SYSTEM_PROMPT_MIGRATION_KEY];

    return {
      completed: migrationStatus?.completed ?? false,
      lastMigratedAt: migrationStatus?.completedAt ?? null,
      lastResult: migrationStatus?.lastResult ?? null,
    };
  }

  /**
   * マイグレーションを実行
   */
  async migrate(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedCount: 0,
      skippedCount: 0,
      errors: [],
    };

    if (!this.store) {
      return result;
    }

    const templates = this.store.get<ElectronStoreTemplate[]>(
      TEMPLATES_KEY,
      [],
    );

    for (const template of templates) {
      // プリセットはスキップ（DBにはプリセットを事前に登録済み）
      if (template.isPreset) {
        result.skippedCount++;
        continue;
      }

      try {
        // 重複チェック
        const exists = await this.repository.existsByUserIdAndName(
          userId,
          template.name,
        );

        if (exists) {
          result.skippedCount++;
          continue;
        }

        // テンプレートを作成
        const input: CreatePromptTemplateInput = {
          name: template.name,
          content: template.content,
        };

        await this.repository.create(userId, input);
        result.migratedCount++;
      } catch (error) {
        result.success = false;
        result.errors.push({
          templateId: template.id,
          message:
            error instanceof Error ? error.message : "Unknown error occurred",
          code: this.categorizeError(error),
        });
      }
    }

    // ステータスを更新
    const currentStatus = this.store.get<Record<string, unknown>>(
      MIGRATION_STATUS_KEY,
      {},
    );
    this.store.set(MIGRATION_STATUS_KEY, {
      ...currentStatus,
      [SYSTEM_PROMPT_MIGRATION_KEY]: {
        completed: result.success && result.errors.length === 0,
        completedAt: new Date().toISOString(),
        lastResult: result,
      },
    });

    return result;
  }

  /**
   * バックアップを作成
   */
  async createBackup(): Promise<string> {
    if (!this.store) {
      throw new Error("Store not initialized");
    }

    const templates = this.store.get<ElectronStoreTemplate[]>(
      TEMPLATES_KEY,
      [],
    );

    const backupDir = this.getBackupDir();
    await fs.mkdir(backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(
      backupDir,
      `system-prompt-templates-${timestamp}.bak`,
    );

    await fs.writeFile(backupPath, JSON.stringify(templates, null, 2), "utf-8");

    return backupPath;
  }

  /**
   * バックアップから復元
   */
  async restoreFromBackup(backupPath: string): Promise<void> {
    if (!this.store) {
      throw new Error("Store not initialized");
    }

    const content = await fs.readFile(backupPath, "utf-8");
    const templates = JSON.parse(content) as ElectronStoreTemplate[];

    this.store.set(TEMPLATES_KEY, templates);
  }

  /**
   * マイグレーション完了をマーク
   */
  async markMigrationComplete(): Promise<void> {
    if (!this.store) {
      return;
    }

    const currentStatus = this.store.get<Record<string, unknown>>(
      MIGRATION_STATUS_KEY,
      {},
    );
    this.store.set(MIGRATION_STATUS_KEY, {
      ...currentStatus,
      [SYSTEM_PROMPT_MIGRATION_KEY]: {
        completed: true,
        completedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * マイグレーションステータスをリセット
   */
  async resetMigrationStatus(): Promise<void> {
    if (!this.store) {
      return;
    }

    const currentStatus = this.store.get<Record<string, unknown>>(
      MIGRATION_STATUS_KEY,
      {},
    );
    this.store.set(MIGRATION_STATUS_KEY, {
      ...currentStatus,
      [SYSTEM_PROMPT_MIGRATION_KEY]: {
        completed: false,
        completedAt: null,
        lastResult: null,
      },
    });
  }

  /**
   * エラーをカテゴライズ
   */
  private categorizeError(error: unknown): MigrationErrorCode {
    if (!(error instanceof Error)) {
      return "UNKNOWN";
    }

    const message = error.message.toLowerCase();

    if (message.includes("duplicate") || message.includes("同名")) {
      return "DUPLICATE_NAME";
    }

    if (
      message.includes("validation") ||
      message.includes("必須") ||
      message.includes("文字")
    ) {
      return "VALIDATION_ERROR";
    }

    if (message.includes("db") || message.includes("database")) {
      return "DB_ERROR";
    }

    return "UNKNOWN";
  }

  /**
   * バックアップディレクトリを取得
   */
  private getBackupDir(): string {
    // Electron環境ではapp.getPath('userData')を使用
    // テスト環境ではtmpディレクトリを使用
    try {
      return path.join(app.getPath("userData"), "backups");
    } catch {
      // Electronが初期化されていない場合（テスト環境など）
      return path.join(process.cwd(), "backups");
    }
  }
}
