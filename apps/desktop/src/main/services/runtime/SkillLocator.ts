/**
 * SkillLocator - スキルディレクトリ動的発見ユーティリティ
 * TASK-SDK-SC-01: SDK Session Bridge
 *
 * `.claude/skills/` 配下を Glob スキャンし、SKILL.md の `name:` フィールドで
 * スキルを識別する。ディレクトリ名が変わっても `name` フィールドで追跡可能。
 *
 * キャッシュ戦略:
 * - static キャッシュ（スキル名 → {dir, mtime}）でO(1)解決を実現
 * - mtime ベースの確認で SKILL.md 更新時はキャッシュを無効化して再スキャン
 * - テスト時は SkillLocator.clearCache() でリセット可能
 */

import fs from "fs";
import path from "path";
import fg from "fast-glob";

interface CachedSkillEntry {
  dir: string;
  mtime: number;
}

export class SkillLocator {
  /** static キャッシュ: スキル名 → {dir, mtime} */
  private static cache = new Map<string, CachedSkillEntry>();

  /**
   * スキル名から SKILL.md の `name:` フィールドを照合して
   * スキルディレクトリのパスを返す。
   *
   * @param skillName - 検索するスキル名（SKILL.md の `name:` フィールドの値）
   * @param cwd - 検索の基点ディレクトリ（デフォルト: process.cwd()）
   * @returns スキルディレクトリの絶対パス
   * @throws スキルが見つからない場合
   */
  static resolveSkillDir(skillName: string, cwd = process.cwd()): string {
    const cached = SkillLocator.cache.get(skillName);
    if (cached) {
      try {
        const currentMtime = fs.statSync(
          path.join(cached.dir, "SKILL.md"),
        ).mtimeMs;
        if (currentMtime === cached.mtime) {
          return cached.dir;
        }
      } catch {
        // ファイルが削除・移動された場合はキャッシュを無効化
      }
      SkillLocator.cache.delete(skillName);
    }

    const pattern = path.join(cwd, ".claude/skills/**/SKILL.md");
    const candidates = fg.sync(pattern, { onlyFiles: true });

    for (const skillMdPath of candidates) {
      try {
        const content = fs.readFileSync(skillMdPath, "utf-8");
        const match = content.match(/^name:\s*(.+)$/m);
        if (match?.[1]?.trim() === skillName) {
          const dir = path.dirname(skillMdPath);
          const mtime = fs.statSync(skillMdPath).mtimeMs;
          SkillLocator.cache.set(skillName, { dir, mtime });
          return dir;
        }
      } catch {
        // 読み取り失敗は無視して次へ
      }
    }

    throw new Error(
      `[SkillLocator] Skill not found: ${skillName} (searched: ${pattern})`,
    );
  }

  /**
   * テスト用: キャッシュをクリアする
   */
  static clearCache(): void {
    SkillLocator.cache.clear();
  }
}
