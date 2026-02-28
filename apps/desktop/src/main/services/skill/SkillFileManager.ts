/**
 * SkillFileManager - スキルファイルの読み書き・バックアップ・復元を管理
 *
 * @description
 * スキルファイルの CRUD 操作とバックアップ管理を提供するサービスクラス
 *
 * 機能:
 * - ファイル読み込み（readFile）
 * - ファイル書き込み（writeFile）- 自動バックアップ付き
 * - ファイル作成（createFile）- 重複チェック付き
 * - ファイル削除（deleteFile）- 自動バックアップ付き
 * - バックアップ一覧（listBackups）
 * - バックアップ復元（restoreBackup）
 *
 * セキュリティ:
 * - パストラバーサル防止
 * - 読み取り専用ディレクトリ保護（~/.claude/skills/）
 *
 * @see docs/30-workflows/task-9a-a-skill-file-manager/phase-02-design.md
 */
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import {
  SkillNotFoundError,
  ReadonlySkillError,
  PathTraversalError,
  FileExistsError,
  FileNotFoundError,
} from "./errors";

// =========================================================================
// Constants
// =========================================================================

/** デフォルトのaiworkflowスキルディレクトリ */
const DEFAULT_AIWORKFLOW_SKILLS_DIR = ".aiworkflow/skills";

/** デフォルトのclaudeスキルディレクトリ */
const DEFAULT_CLAUDE_SKILLS_DIR = ".claude/skills";

/** バックアップファイルのパターン */
const BACKUP_PATTERN = /\.(backup|deleted)\.(\d+)$/;

// =========================================================================
// Type Definitions
// =========================================================================

/**
 * コンストラクタオプション
 */
export interface SkillFileManagerOptions {
  /** ~/.aiworkflow/skills/ に相当するディレクトリパス */
  aiworkflowSkillsDir?: string;
  /** ~/.claude/skills/ に相当するディレクトリパス */
  claudeSkillsDir?: string;
}

/**
 * スキルディレクトリ情報
 */
export interface SkillDirInfo {
  /** スキルディレクトリの絶対パス */
  path: string;
  /** 読み取り専用フラグ */
  readonly: boolean;
}

/**
 * バックアップ情報
 */
export interface BackupInfo {
  /** バックアップファイル名 */
  filename: string;
  /** スキルディレクトリからの相対パス */
  relativePath: string;
  /** 元ファイルのパス（バックアップ接尾辞を除いた部分） */
  originalPath: string;
  /** バックアップ種別 */
  type: "backup" | "deleted";
  /** タイムスタンプ（ミリ秒） */
  timestamp: number;
  /** 作成日時 */
  createdAt: Date;
}

/**
 * バックアップタイプ
 */
export type BackupType = "backup" | "deleted";

// =========================================================================
// SkillFileManager Class
// =========================================================================

/**
 * SkillFileManager クラス
 *
 * スキルファイルの CRUD 操作とバックアップ管理を提供
 */
export class SkillFileManager {
  private readonly aiworkflowSkillsDir: string;
  private readonly claudeSkillsDir: string;

  /**
   * コンストラクタ
   * @param options - オプション設定
   */
  constructor(options?: SkillFileManagerOptions) {
    this.aiworkflowSkillsDir = path.resolve(
      options?.aiworkflowSkillsDir ??
        path.join(os.homedir(), DEFAULT_AIWORKFLOW_SKILLS_DIR),
    );
    this.claudeSkillsDir = path.resolve(
      options?.claudeSkillsDir ??
        path.join(os.homedir(), DEFAULT_CLAUDE_SKILLS_DIR),
    );
  }

  // =========================================================================
  // Public Methods
  // =========================================================================

  /**
   * ファイルを読み込む
   * @param skillName - スキル名
   * @param relativePath - スキルディレクトリからの相対パス
   * @returns ファイル内容
   * @throws {SkillNotFoundError} スキルが見つからない場合
   * @throws {FileNotFoundError} ファイルが見つからない場合
   * @throws {PathTraversalError} パストラバーサルが検出された場合
   */
  async readFile(skillName: string, relativePath: string): Promise<string> {
    const skillDir = await this.findSkillDir(skillName);
    const fullPath = path.join(skillDir.path, relativePath);

    this.validatePath(fullPath, skillDir.path);

    try {
      return await fs.readFile(fullPath, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new FileNotFoundError(relativePath);
      }
      throw error;
    }
  }

  /**
   * ファイルを書き込む（既存ファイルの場合は自動バックアップ）
   * @param skillName - スキル名
   * @param relativePath - スキルディレクトリからの相対パス
   * @param content - 書き込む内容
   * @throws {SkillNotFoundError} スキルが見つからない場合
   * @throws {ReadonlySkillError} 読み取り専用スキルの場合
   * @throws {PathTraversalError} パストラバーサルが検出された場合
   */
  async writeFile(
    skillName: string,
    relativePath: string,
    content: string,
  ): Promise<void> {
    const skillDir = await this.findSkillDir(skillName);

    if (skillDir.readonly) {
      throw new ReadonlySkillError(skillName);
    }

    const fullPath = path.join(skillDir.path, relativePath);
    this.validatePath(fullPath, skillDir.path);

    // 既存ファイルがあればバックアップ
    await this.createBackup(fullPath, "backup");

    // 親ディレクトリを作成
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // ファイル書き込み
    await fs.writeFile(fullPath, content, "utf-8");
  }

  /**
   * 新規ファイルを作成（既存ファイルがある場合はエラー）
   * @param skillName - スキル名
   * @param relativePath - スキルディレクトリからの相対パス
   * @param content - 書き込む内容
   * @throws {SkillNotFoundError} スキルが見つからない場合
   * @throws {ReadonlySkillError} 読み取り専用スキルの場合
   * @throws {FileExistsError} ファイルが既に存在する場合
   * @throws {PathTraversalError} パストラバーサルが検出された場合
   */
  async createFile(
    skillName: string,
    relativePath: string,
    content: string,
  ): Promise<void> {
    const skillDir = await this.findSkillDir(skillName);

    if (skillDir.readonly) {
      throw new ReadonlySkillError(skillName);
    }

    const fullPath = path.join(skillDir.path, relativePath);
    this.validatePath(fullPath, skillDir.path);

    // 既存ファイルチェック
    try {
      await fs.access(fullPath);
      throw new FileExistsError(relativePath);
    } catch (error) {
      if (error instanceof FileExistsError) {
        throw error;
      }
      // ENOENT は正常（ファイルが存在しない）
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    // 親ディレクトリを作成
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // ファイル書き込み
    await fs.writeFile(fullPath, content, "utf-8");
  }

  /**
   * ファイルを削除（自動バックアップ付き）
   * @param skillName - スキル名
   * @param relativePath - スキルディレクトリからの相対パス
   * @throws {SkillNotFoundError} スキルが見つからない場合
   * @throws {ReadonlySkillError} 読み取り専用スキルの場合
   * @throws {FileNotFoundError} ファイルが見つからない場合
   * @throws {PathTraversalError} パストラバーサルが検出された場合
   */
  async deleteFile(skillName: string, relativePath: string): Promise<void> {
    const skillDir = await this.findSkillDir(skillName);

    if (skillDir.readonly) {
      throw new ReadonlySkillError(skillName);
    }

    const fullPath = path.join(skillDir.path, relativePath);
    this.validatePath(fullPath, skillDir.path);

    // ファイル存在確認
    try {
      await fs.access(fullPath);
    } catch {
      throw new FileNotFoundError(relativePath);
    }

    // バックアップ作成
    await this.createBackup(fullPath, "deleted");

    // ファイル削除
    await fs.unlink(fullPath);
  }

  /**
   * バックアップ一覧を取得
   * @param skillName - スキル名
   * @returns バックアップ情報の配列
   * @throws {SkillNotFoundError} スキルが見つからない場合
   */
  async listBackups(skillName: string): Promise<BackupInfo[]> {
    const skillDir = await this.findSkillDir(skillName);

    const allFiles = await this.walkDir(skillDir.path);
    const backups: BackupInfo[] = [];

    for (const filePath of allFiles) {
      const match = path.basename(filePath).match(BACKUP_PATTERN);
      if (match) {
        const type = match[1] as BackupType;
        const timestamp = parseInt(match[2], 10);
        const relativePath = path.relative(skillDir.path, filePath);
        const originalPath = relativePath.replace(BACKUP_PATTERN, "");

        backups.push({
          filename: path.basename(filePath),
          relativePath,
          originalPath,
          type,
          timestamp,
          createdAt: new Date(timestamp),
        });
      }
    }

    // タイムスタンプ降順でソート
    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * スキル配下の通常ファイル一覧を取得
   * @param skillName - スキル名
   * @returns スキルディレクトリからの相対パス配列（ソート済み）
   * @throws {SkillNotFoundError} スキルが見つからない場合
   */
  async listSkillFiles(skillName: string): Promise<string[]> {
    const skillDir = await this.findSkillDir(skillName);
    const allFiles = await this.walkDir(skillDir.path);

    return allFiles
      .map((filePath) => path.relative(skillDir.path, filePath))
      .filter((relativePath) => !BACKUP_PATTERN.test(relativePath))
      .map((relativePath) => relativePath.split(path.sep).join("/"))
      .sort((a, b) => a.localeCompare(b));
  }

  /**
   * バックアップからファイルを復元
   * @param skillName - スキル名
   * @param backupPath - バックアップファイルの相対パス
   * @throws {SkillNotFoundError} スキルが見つからない場合
   * @throws {ReadonlySkillError} 読み取り専用スキルの場合
   * @throws {FileNotFoundError} バックアップが見つからない場合
   * @throws {PathTraversalError} パストラバーサルが検出された場合
   */
  async restoreBackup(skillName: string, backupPath: string): Promise<void> {
    const skillDir = await this.findSkillDir(skillName);

    if (skillDir.readonly) {
      throw new ReadonlySkillError(skillName);
    }

    const fullBackupPath = path.join(skillDir.path, backupPath);
    this.validatePath(fullBackupPath, skillDir.path);

    // バックアップファイルからオリジナルパスを算出
    const match = backupPath.match(BACKUP_PATTERN);
    if (!match) {
      throw new FileNotFoundError(backupPath);
    }

    const originalRelativePath = backupPath.replace(BACKUP_PATTERN, "");
    const originalFullPath = path.join(skillDir.path, originalRelativePath);

    // バックアップ内容を読み込み
    try {
      const content = await fs.readFile(fullBackupPath, "utf-8");

      // 親ディレクトリを作成
      await fs.mkdir(path.dirname(originalFullPath), { recursive: true });

      // 元ファイルパスに書き込み
      await fs.writeFile(originalFullPath, content, "utf-8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new FileNotFoundError(backupPath);
      }
      throw error;
    }
  }

  /**
   * スキルが読み取り専用かどうかを確認
   * @param skillName - スキル名
   * @returns 読み取り専用の場合は true
   * @throws {SkillNotFoundError} スキルが見つからない場合
   */
  async isReadonly(skillName: string): Promise<boolean> {
    const skillDir = await this.findSkillDir(skillName);
    return skillDir.readonly;
  }

  // =========================================================================
  // Private Methods
  // =========================================================================

  /**
   * スキルディレクトリを検索
   * @param skillName - スキル名
   * @returns スキルディレクトリ情報
   * @throws {SkillNotFoundError} スキルが見つからない場合
   */
  private async findSkillDir(skillName: string): Promise<SkillDirInfo> {
    // まず aiworkflow を検索
    const aiworkflowPath = path.join(this.aiworkflowSkillsDir, skillName);
    try {
      await fs.access(aiworkflowPath);
      return { path: aiworkflowPath, readonly: false };
    } catch {
      // 存在しない場合は claude を検索
    }

    // 次に claude を検索
    const claudePath = path.join(this.claudeSkillsDir, skillName);
    try {
      await fs.access(claudePath);
      return { path: claudePath, readonly: true };
    } catch {
      // 存在しない場合はエラー
    }

    throw new SkillNotFoundError(skillName);
  }

  /**
   * パストラバーサルを検証
   * @param targetPath - 検証対象のパス
   * @param basePath - ベースパス
   * @throws {PathTraversalError} パストラバーサルが検出された場合
   */
  private validatePath(targetPath: string, basePath: string): void {
    const resolved = path.resolve(targetPath);
    const resolvedBase = path.resolve(basePath);

    if (
      !resolved.startsWith(resolvedBase + path.sep) &&
      resolved !== resolvedBase
    ) {
      throw new PathTraversalError(targetPath);
    }
  }

  /**
   * バックアップを作成
   * @param fullPath - ファイルの絶対パス
   * @param type - バックアップタイプ
   * @returns バックアップパス（ファイルが存在しない場合は undefined）
   */
  private async createBackup(
    fullPath: string,
    type: BackupType,
  ): Promise<string | undefined> {
    try {
      const content = await fs.readFile(fullPath, "utf-8");
      const timestamp = Date.now();
      const backupPath = `${fullPath}.${type}.${timestamp}`;
      await fs.writeFile(backupPath, content, "utf-8");
      return backupPath;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // ファイルが存在しない場合はバックアップ不要
        return undefined;
      }
      throw error;
    }
  }

  /**
   * ディレクトリを再帰的に走査してファイル一覧を取得
   * @param dir - ディレクトリパス
   * @returns ファイルパスの配列
   */
  private async walkDir(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.walkDir(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch {
      // ディレクトリが存在しない場合は空配列
    }

    return files;
  }
}
