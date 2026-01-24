/**
 * Skill Import Store - スキルインポート情報永続化サービス
 *
 * electron-storeを使用してインポート済みスキルの情報を永続化するサービス。
 * スキーマバージョン管理とマイグレーション機能を含む。
 *
 * @module @repo/desktop/main/settings/skillImportStore
 */

import Store from "electron-store";

// --- 型定義 ---

export interface ImportedSkillData {
  name: string;
  importedAt: string; // ISO文字列
  status: "active" | "disabled";
  lastUsedAt?: string;
}

export interface SkillSettings {
  autoApproveReadOnly: boolean;
  rememberPermissions: boolean;
  rememberedPermissions: Record<string, "allow" | "deny">;
}

export interface SkillMetadata {
  name: string;
  description: string;
  path: string;
  updatedAt: Date;
  agents: unknown[];
  references: unknown[];
  scripts: unknown[];
  assets: unknown[];
  schemas: unknown[];
  indexes: unknown[];
  otherFiles: unknown[];
}

export interface SkillCacheEntry {
  metadata: SkillMetadata;
  cachedAt: string;
}

interface SkillStoreSchema {
  schemaVersion: number;
  importedSkills: Record<string, ImportedSkillData>;
  skillSettings: Record<string, SkillSettings>;
  lastScanAt?: string;
  skillCache?: Record<string, SkillCacheEntry>;
}

// --- 定数 ---

const CURRENT_SCHEMA_VERSION = 1;

const SKILL_NAME_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;

const DEFAULT_SKILL_SETTINGS: SkillSettings = {
  autoApproveReadOnly: true,
  rememberPermissions: false,
  rememberedPermissions: {},
};

// --- バリデーション ---

function validateSkillName(name: string): void {
  if (!name || !SKILL_NAME_PATTERN.test(name)) {
    // SEC-01対応: 入力値を最初の20文字に制限してログ出力
    const truncatedName =
      name.length > 20 ? name.slice(0, 20) + "..." : name || "(empty)";
    throw new Error(`Invalid skill name: ${truncatedName}`);
  }
}

// --- SkillImportStore クラス ---

/**
 * SkillImportStore クラス
 *
 * スキルインポート情報の永続化と管理を担当
 */
export class SkillImportStore {
  private _store: Store<SkillStoreSchema>;

  constructor() {
    this._store = new Store<SkillStoreSchema>({
      name: "skill-imports",
      defaults: {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        importedSkills: {},
        skillSettings: {},
      },
    });

    // マイグレーション実行（エラーは無視してデフォルト値で動作）
    this.runMigrations();
  }

  /**
   * マイグレーションを実行
   * エラーが発生した場合は無視して続行（デフォルト値が使用される）
   */
  private runMigrations(): void {
    try {
      const currentVersion = this._store.get("schemaVersion", 0);

      if (currentVersion < 1) {
        // Version 1 migration
        if (!this._store.has("importedSkills")) {
          this._store.set("importedSkills", {});
        }
        if (!this._store.has("skillSettings")) {
          this._store.set("skillSettings", {});
        }
        this._store.set("schemaVersion", 1);
      }
    } catch {
      // マイグレーションエラーは無視（デフォルト値で動作）
    }
  }

  // ===========================================================================
  // Import Management
  // ===========================================================================

  /**
   * インポート済みスキル一覧を取得
   */
  getImported(): ImportedSkillData[] {
    try {
      const importedSkills = this._store.get("importedSkills", {});
      return Object.values(importedSkills);
    } catch {
      // エラー時は空配列にフォールバック
      return [];
    }
  }

  /**
   * スキルをインポート
   */
  addImport(skillName: string): void {
    validateSkillName(skillName);

    const importedSkills = this._store.get("importedSkills", {});
    importedSkills[skillName] = {
      name: skillName,
      importedAt: new Date().toISOString(),
      status: "active",
    };
    this._store.set("importedSkills", importedSkills);

    // 新規追加時にデフォルト設定を作成
    const skillSettings = this._store.get("skillSettings", {});
    if (!skillSettings[skillName]) {
      skillSettings[skillName] = { ...DEFAULT_SKILL_SETTINGS };
      this._store.set("skillSettings", skillSettings);
    }
  }

  /**
   * スキルを削除
   */
  removeImport(skillName: string): void {
    // 冪等性: 存在しない場合は何もしない
    const importedSkills = this._store.get("importedSkills", {});
    if (!(skillName in importedSkills)) {
      return;
    }

    delete importedSkills[skillName];
    this._store.set("importedSkills", importedSkills);

    // 設定も削除
    const skillSettings = this._store.get("skillSettings", {});
    delete skillSettings[skillName];
    this._store.set("skillSettings", skillSettings);

    // キャッシュも削除
    this.invalidateCache(skillName);
  }

  /**
   * スキルが存在するか確認
   */
  exists(skillName: string): boolean {
    const importedSkills = this._store.get("importedSkills", {});
    return skillName in importedSkills;
  }

  /**
   * 最終使用日時を更新
   */
  updateLastUsed(skillName: string): void {
    const importedSkills = this._store.get("importedSkills", {});
    if (!(skillName in importedSkills)) {
      return;
    }

    importedSkills[skillName].lastUsedAt = new Date().toISOString();
    this._store.set("importedSkills", importedSkills);
  }

  // ===========================================================================
  // Settings Management
  // ===========================================================================

  /**
   * スキル設定を取得
   */
  getSettings(skillName: string): SkillSettings {
    const skillSettings = this._store.get("skillSettings", {});
    return skillSettings[skillName] ?? { ...DEFAULT_SKILL_SETTINGS };
  }

  /**
   * スキル設定を更新
   */
  updateSettings(skillName: string, settings: Partial<SkillSettings>): void {
    const skillSettings = this._store.get("skillSettings", {});
    const currentSettings = skillSettings[skillName] ?? {
      ...DEFAULT_SKILL_SETTINGS,
    };
    skillSettings[skillName] = {
      ...currentSettings,
      ...settings,
    };
    this._store.set("skillSettings", skillSettings);
  }

  // ===========================================================================
  // Permission Management
  // ===========================================================================

  /**
   * 権限を記憶
   */
  rememberPermission(
    skillName: string,
    toolName: string,
    decision: "allow" | "deny",
  ): void {
    const skillSettings = this._store.get("skillSettings", {});
    const currentSettings = skillSettings[skillName] ?? {
      ...DEFAULT_SKILL_SETTINGS,
    };
    currentSettings.rememberedPermissions[toolName] = decision;
    skillSettings[skillName] = currentSettings;
    this._store.set("skillSettings", skillSettings);
  }

  /**
   * 記憶された権限を取得
   */
  getRememberedPermission(
    skillName: string,
    toolName: string,
  ): "allow" | "deny" | undefined {
    const skillSettings = this._store.get("skillSettings", {});
    return skillSettings[skillName]?.rememberedPermissions[toolName];
  }

  // ===========================================================================
  // Cache Management
  // ===========================================================================

  /**
   * キャッシュを設定
   */
  setCache(skillName: string, metadata: SkillMetadata): void {
    const skillCache = this._store.get("skillCache") ?? {};
    skillCache[skillName] = {
      metadata,
      cachedAt: new Date().toISOString(),
    };
    this._store.set("skillCache", skillCache);
  }

  /**
   * キャッシュを取得
   */
  getCache(skillName: string): SkillCacheEntry | undefined {
    const skillCache = this._store.get("skillCache") ?? {};
    return skillCache[skillName];
  }

  /**
   * キャッシュを無効化
   */
  invalidateCache(skillName?: string): void {
    if (skillName) {
      const skillCache = this._store.get("skillCache") ?? {};
      delete skillCache[skillName];
      this._store.set("skillCache", skillCache);
    } else {
      this._store.set("skillCache", {});
    }
  }

  // ===========================================================================
  // Test Utilities
  // ===========================================================================

  /**
   * 全データをリセット
   */
  reset(): void {
    this._store.set("schemaVersion", CURRENT_SCHEMA_VERSION);
    this._store.set("importedSkills", {});
    this._store.set("skillSettings", {});
    this._store.set("skillCache", {});
  }

  /**
   * 内部ストアへのアクセス（テスト用）
   */
  get internalStore(): Store<SkillStoreSchema> {
    return this._store;
  }
}

// --- シングルトン ---

let skillImportStoreInstance: SkillImportStore | null = null;

/**
 * SkillImportStoreのシングルトンインスタンスを取得
 */
export function getSkillImportStore(): SkillImportStore {
  if (!skillImportStoreInstance) {
    skillImportStoreInstance = new SkillImportStore();
  }
  return skillImportStoreInstance;
}

/**
 * シングルトンをリセット（テスト用）
 */
export function resetSkillImportStore(): void {
  skillImportStoreInstance = null;
}
