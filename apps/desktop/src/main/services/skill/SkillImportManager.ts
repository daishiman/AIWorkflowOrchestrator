/**
 * SkillImportManager - スキルのインポート状態を管理する
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import log from "electron-log";
import type { ImportResult, RemoveResult } from "@repo/shared";

const STORE_KEY = "importedSkillIds";

/**
 * electron-store互換のストアインターフェース
 *
 * TASK-FIX-4-2: get()の戻り値をunknownに変更し、型安全性を向上
 */
interface SkillStore {
  get(key: string, defaultValue: string[]): unknown;
  set(key: string, value: string[]): void;
  path?: string;
}

/**
 * ストアから取得した値をstring[]として検証・変換する
 *
 * TASK-FIX-4-2: 不正なデータ型に対するフォールバック処理を追加
 *
 * @param value ストアから取得した値（型不明）
 * @returns 検証済みのstring[]（不正な場合は空配列）
 */
function validateStoredSkillIds(value: unknown): string[] {
  // null/undefined チェック
  if (value == null) {
    return [];
  }

  // 配列チェック
  if (!Array.isArray(value)) {
    log.warn(
      "[SkillImportManager] Invalid stored data type, expected array:",
      typeof value,
    );
    return [];
  }

  // 配列内の各要素をフィルタリング（string以外を除外）
  const validIds = value.filter((item): item is string => {
    const isValid = typeof item === "string";
    if (!isValid) {
      log.warn(
        "[SkillImportManager] Filtered out non-string element:",
        typeof item,
      );
    }
    return isValid;
  });

  return validIds;
}

export class SkillImportManager {
  private importedIds: Set<string>;
  private store: SkillStore;
  private readonly debug: boolean;

  constructor(store: SkillStore, options?: { debug?: boolean }) {
    this.store = store;
    this.debug = options?.debug ?? process.env.NODE_ENV === "development";

    log.debug("[SkillImportManager] Store path:", store.path ?? "unknown");

    try {
      // TASK-FIX-4-2: 型バリデーション付きでストアから読み込み
      const rawValue = this.store.get(STORE_KEY, []);
      const stored = validateStoredSkillIds(rawValue);

      log.debug(
        "[SkillImportManager] Loaded imported IDs:",
        stored.length,
        "items",
      );

      this.importedIds = new Set(stored);
    } catch (error) {
      log.error("[SkillImportManager] Failed to load from store:", error);
      this.importedIds = new Set();
    }
  }

  /**
   * スキルをインポートする
   */
  async importSkills(skillIds: string[]): Promise<ImportResult> {
    log.debug("[SkillImportManager] importSkills called with:", skillIds);

    const errors: string[] = [];
    let importedCount = 0;

    for (const id of skillIds) {
      if (!this.importedIds.has(id)) {
        this.importedIds.add(id);
        importedCount++;
      }
    }

    if (importedCount > 0) {
      this.persist();
    }

    log.debug(
      "[SkillImportManager] importSkills result:",
      importedCount,
      "new imports",
    );

    return {
      success: errors.length === 0,
      importedCount,
      errors,
    };
  }

  /**
   * スキルを削除する
   */
  async removeSkill(skillName: string): Promise<RemoveResult> {
    log.debug("[SkillImportManager] removeSkill called with:", skillName);

    const removed = this.importedIds.has(skillName);

    if (removed) {
      this.importedIds.delete(skillName);
      this.persist();
    }

    log.debug("[SkillImportManager] removeSkill result:", removed);

    return {
      success: true,
      removed,
    };
  }

  /**
   * インポート済みスキルIDの一覧を取得する
   */
  getImportedSkillIds(): string[] {
    return Array.from(this.importedIds);
  }

  /**
   * スキルがインポート済みかどうかを確認する
   */
  isImported(skillId: string): boolean {
    return this.importedIds.has(skillId);
  }

  /**
   * インポート状態をストアに永続化する
   */
  private persist(): void {
    try {
      const data = Array.from(this.importedIds);

      log.debug("[SkillImportManager] Persisting:", data.length, "items");

      this.store.set(STORE_KEY, data);

      log.debug("[SkillImportManager] Persist successful");
    } catch (error) {
      log.error("[SkillImportManager] Failed to persist:", error);
    }
  }
}
