/**
 * Skill Fork Types - スキルフォーク・派生機能の型定義
 *
 * TASK-9E: 既存スキルをコピー+メタデータ方式でフォークする機能の型定義。
 * 既存の ForkOptions（skillCreator.ts）との名前衝突を回避するため、
 * SkillFork プレフィックスを使用する。
 *
 * @see docs/30-workflows/TASK-9E-skill-fork/phase-2-design.md
 */

/**
 * スキルフォークオプション
 *
 * フォーク元スキルから新スキルを作成する際の設定。
 * 「コピー+メタデータ」方式を採用（technical-decisions.md §20.2）。
 */
export interface SkillForkOptions {
  /** フォーク元のスキル名（ディレクトリ名） */
  sourceSkill: string;

  /** 新スキル名（ディレクトリ名として使用される） */
  newName: string;

  /** 新スキルの説明文（省略時はフォーク元の説明を維持） */
  description?: string;

  /** agents/ ディレクトリをコピーするか */
  copyAgents: boolean;

  /** references/ ディレクトリをコピーするか */
  copyReferences: boolean;

  /** scripts/ ディレクトリをコピーするか */
  copyScripts: boolean;

  /** assets/ ディレクトリをコピーするか */
  copyAssets: boolean;

  /**
   * allowed-tools の上書き値
   * 省略時はフォーク元の設定を維持する
   */
  modifyAllowedTools?: string[];
}

/**
 * スキルフォーク結果
 */
export interface SkillForkResult {
  /** フォーク成功フラグ */
  success: boolean;

  /** 新スキルのディレクトリパス */
  newSkillPath: string;

  /** コピーされたファイルの相対パス一覧 */
  copiedFiles: string[];

  /** 警告メッセージ（非致命的な問題がある場合） */
  warnings?: string[];
}

/**
 * フォークメタデータ
 *
 * fork-metadata.json として新スキルディレクトリに保存される。
 * IPC境界ではISO 8601文字列として送受信する。
 */
export interface SkillForkMetadata {
  /** フォーク元スキル名 */
  forkedFrom: string;

  /**
   * フォーク日時
   * @format ISO 8601
   */
  forkedAt: string;

  /** フォーク元スキルの説明文（記録用） */
  originalDescription?: string;
}
