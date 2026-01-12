/**
 * SkillImportManager - スキルのインポート状態を管理する
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import type { ImportResult, RemoveResult } from "@repo/shared";
import type ElectronStore from "electron-store";

const STORE_KEY = "importedSkillIds";

export class SkillImportManager {
  private importedIds: Set<string>;
  private store: ElectronStore;

  constructor(store: ElectronStore) {
    this.store = store;
    const stored = this.store.get(STORE_KEY, []) as string[];
    this.importedIds = new Set(stored);
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
    this.store.set(STORE_KEY, Array.from(this.importedIds));
  }
}
