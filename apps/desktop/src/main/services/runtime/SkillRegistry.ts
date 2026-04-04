/**
 * SkillRegistry - 実行時スキル登録管理
 * TASK-SDK-SC-04: Skill Output Integration
 *
 * SDK セッションが生成したスキルをインメモリで管理し、
 * SKILL.md パスから動的にスキルを登録・更新・削除する。
 */

import * as fs from "node:fs/promises";

// ============================================================
// 型定義
// ============================================================

export interface RegistrySkillEntry {
  /** スキル名 */
  name: string;
  /** SKILL.md のフルパス */
  path: string;
  /** SKILL.md の内容 */
  content: string;
}

// ============================================================
// SkillRegistry クラス
// ============================================================

export class SkillRegistry {
  private readonly entries = new Map<string, RegistrySkillEntry>();

  /**
   * スキルエントリを直接登録する
   */
  register(entry: RegistrySkillEntry): void {
    this.entries.set(entry.name, entry);
  }

  /**
   * スキル名でエントリを削除する
   */
  unregister(name: string): void {
    this.entries.delete(name);
  }

  /**
   * スキル名でエントリを取得する
   */
  get(name: string): RegistrySkillEntry | undefined {
    return this.entries.get(name);
  }

  /**
   * 登録済み全スキルを返す
   */
  getAll(): RegistrySkillEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * SKILL.md のファイルパスからスキルを登録（または更新）する。
   * 既存スキルが存在する場合は上書きする。
   *
   * @param skillPath SKILL.md のフルパス
   */
  async registerFromPath(skillPath: string): Promise<void> {
    const content = await fs.readFile(skillPath, "utf-8");
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    if (!nameMatch) {
      throw new Error(
        `[SkillRegistry] SKILL.md に name フィールドが見つかりません: ${skillPath}`,
      );
    }
    const skillName = nameMatch[1].trim();
    // 既存エントリを削除して再登録（重複防止）
    this.unregister(skillName);
    this.register({ name: skillName, path: skillPath, content });
  }
}
