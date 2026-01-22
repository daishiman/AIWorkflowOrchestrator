/**
 * SkillImportManager - スキルのインポート状態を管理する
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import type { ImportResult, RemoveResult } from "@repo/shared";

const STORE_KEY = "importedSkillIds";

/**
 * electron-store互換のストアインターフェース
 */
interface SkillStore {
  get(key: string, defaultValue: string[]): string[];
  set(key: string, value: string[]): void;
  path?: string;
}

export class SkillImportManager {
  private importedIds: Set<string>;
  private store: SkillStore;

  constructor(store: SkillStore) {
    this.store = store;

    // デバッグログ: ストアパスの出力（テスト環境以外）
    if (process.env.NODE_ENV !== "test") {
      console.log("[SkillImportManager] Store path:", store.path ?? "unknown");
    }

    try {
      const stored = this.store.get(STORE_KEY, []) as string[];
      console.log(
        "[SkillImportManager] Loaded imported IDs:",
        stored.length,
        "items",
      );
      this.importedIds = new Set(stored);
    } catch (error) {
      console.error("[SkillImportManager] Failed to load from store:", error);
      this.importedIds = new Set();
    }
  }

  /**
   * スキルをインポートする
   */
  async importSkills(skillIds: string[]): Promise<ImportResult> {
    console.log("[SkillImportManager] importSkills called with:", skillIds);
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

    console.log(
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
  async removeSkill(skillId: string): Promise<RemoveResult> {
    console.log("[SkillImportManager] removeSkill called with:", skillId);
    const removed = this.importedIds.has(skillId);

    if (removed) {
      this.importedIds.delete(skillId);
      this.persist();
    }

    console.log("[SkillImportManager] removeSkill result:", removed);
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
      console.log("[SkillImportManager] Persisting:", data.length, "items");
      this.store.set(STORE_KEY, data);
      console.log("[SkillImportManager] Persist successful");
    } catch (error) {
      console.error("[SkillImportManager] Failed to persist:", error);
    }
  }
}
