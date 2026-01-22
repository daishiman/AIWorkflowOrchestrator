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
}

export class SkillImportManager {
  private importedIds: Set<string>;
  private store: SkillStore;

  constructor(store: SkillStore) {
    this.store = store;
    try {
      const stored = this.store.get(STORE_KEY, []) as string[];
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
    const removed = this.importedIds.has(skillId);

    if (removed) {
      this.importedIds.delete(skillId);
      this.persist();
    }

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
      this.store.set(STORE_KEY, Array.from(this.importedIds));
    } catch (error) {
      console.error("[SkillImportManager] Failed to persist:", error);
    }
  }
}
