/**
 * SkillCreator定数定義
 * TASK-9B-G: skill-creator-service
 */

import fs from "fs";
import path from "path";
import os from "os";

/**
 * デフォルトのskill-creatorホーム配置パス
 */
const HOME_SKILL_CREATOR_PATH = path.join(
  os.homedir(),
  ".aiworkflow",
  "skills",
  "skill-creator",
);

/**
 * リポジトリ同梱のskill-creatorパス（CI向けフォールバック）
 */
const REPO_SKILL_CREATOR_PATH = path.resolve(
  process.cwd(),
  ".claude",
  "skills",
  "skill-creator",
);

/**
 * スキルクリエーターディレクトリに必須スクリプトが存在するか判定
 */
function hasSkillCreatorScripts(skillCreatorPath: string): boolean {
  return fs.existsSync(path.join(skillCreatorPath, "scripts", "init_skill.js"));
}

/**
 * 利用可能なskill-creatorパスを解決
 *
 * 優先順位:
 * 1. 環境変数 AIWORKFLOW_SKILL_CREATOR_PATH
 * 2. ユーザーホーム配下 (~/.aiworkflow/skills/skill-creator)
 * 3. リポジトリ同梱 (.claude/skills/skill-creator)
 */
function resolveSkillCreatorPath(): string {
  const envPath = process.env.AIWORKFLOW_SKILL_CREATOR_PATH;
  const candidates = [envPath, HOME_SKILL_CREATOR_PATH, REPO_SKILL_CREATOR_PATH]
    .filter((candidate): candidate is string => Boolean(candidate))
    .map((candidate) => candidate.trim())
    .filter((candidate) => candidate.length > 0);

  for (const candidate of candidates) {
    if (hasSkillCreatorScripts(candidate)) {
      return candidate;
    }
  }

  return HOME_SKILL_CREATOR_PATH;
}

/**
 * デフォルトのskill-creatorパス
 */
export const DEFAULT_SKILL_CREATOR_PATH = resolveSkillCreatorPath();

/**
 * デフォルトのスキル格納ディレクトリ
 */
export const DEFAULT_SKILLS_DIR = path.join(
  os.homedir(),
  ".aiworkflow",
  "skills",
);

/**
 * デフォルトのワークフロー格納ディレクトリ
 */
export const DEFAULT_WORKFLOWS_DIR = path.join(
  process.cwd(),
  "docs",
  "30-workflows",
);

/**
 * タスク実行時間見積もり（分/タスク）
 */
export const TASK_DURATION_MINUTES = 5;

/**
 * スキル名の最大文字数
 */
export const MAX_SKILL_NAME_LENGTH = 256;
