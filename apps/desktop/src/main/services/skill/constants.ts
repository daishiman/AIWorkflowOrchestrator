/**
 * SkillCreator定数定義
 * TASK-9B-G: skill-creator-service
 */

import path from "path";
import os from "os";

/**
 * デフォルトのskill-creatorパス
 */
export const DEFAULT_SKILL_CREATOR_PATH = path.join(
  os.homedir(),
  ".aiworkflow",
  "skills",
  "skill-creator",
);

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
