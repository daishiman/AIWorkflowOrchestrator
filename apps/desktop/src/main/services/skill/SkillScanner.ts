/**
 * SkillScanner - SKILL.mdファイルを持つディレクトリをスキャンする
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 * @see docs/30-workflows/TASK-2A/outputs/phase-02/class-design.md
 */
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { parse as parseYaml } from "yaml";
import type {
  SkillMetadata,
  SkillSubResource,
  SkillOtherFile,
} from "@repo/shared";

// =========================================================================
// Constants
// =========================================================================

/** サポートされるサブディレクトリ名 */
const SUB_DIRECTORIES = [
  "agents",
  "references",
  "scripts",
  "assets",
  "schemas",
  "indexes",
] as const;

/** サブディレクトリ名の型（ドキュメント用） */
type _SubDirectoryType = (typeof SUB_DIRECTORIES)[number];

/** その他の既知ファイル定義 */
const OTHER_FILES: ReadonlyArray<{
  filename: string;
  type: SkillOtherFile["type"];
}> = [
  { filename: "EVALS.json", type: "evals" },
  { filename: "LOGS.md", type: "logs" },
  { filename: "package.json", type: "package" },
] as const;

/** デフォルトのaiworkflowスキルディレクトリ */
const DEFAULT_AIWORKFLOW_SKILLS_DIR = ".aiworkflow/skills";

/** デフォルトのclaudeスキルディレクトリ */
const DEFAULT_CLAUDE_SKILLS_DIR = ".claude/skills";

// =========================================================================
// Type Definitions
// =========================================================================

/**
 * YAML Frontmatter の型定義
 */
interface SkillFrontmatter {
  name?: string;
  description?: string;
  "allowed-tools"?: string[];
  [key: string]: unknown;
}

/**
 * サブリソースの集合
 */
interface SubResources {
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
}

/**
 * スキャンされたスキルメタデータ（readonly フラグ付き）
 */
export interface ScannedSkillMetadata extends SkillMetadata {
  /** 読み取り専用フラグ（~/.claude/skills/ からのスキルは true） */
  readonly: boolean;
}

/**
 * SkillScanner コンストラクタオプション
 */
export interface SkillScannerOptions {
  /** ~/.aiworkflow/skills/ に相当するディレクトリパス */
  aiworkflowSkillsDir?: string;
  /** ~/.claude/skills/ に相当するディレクトリパス */
  claudeSkillsDir?: string;
}

/**
 * SkillScanner - スキルディレクトリをスキャンしてメタデータを取得
 *
 * 2つのディレクトリをサポート:
 * - ~/.aiworkflow/skills/ (編集可能)
 * - ~/.claude/skills/ (読み取り専用)
 */
export class SkillScanner {
  private basePath: string;
  private aiworkflowSkillsDir: string;
  private claudeSkillsDir: string;

  /**
   * コンストラクタ
   * @param optionsOrBasePath - オプションオブジェクトまたは単一のベースパス（後方互換性）
   */
  constructor(optionsOrBasePath?: SkillScannerOptions | string) {
    if (typeof optionsOrBasePath === "string") {
      // 後方互換性: 単一のベースパスが渡された場合
      this.basePath = path.resolve(optionsOrBasePath);
      this.aiworkflowSkillsDir = this.basePath;
      this.claudeSkillsDir = path.join(os.homedir(), DEFAULT_CLAUDE_SKILLS_DIR);
    } else {
      // 新しいAPI: オプションオブジェクト
      this.aiworkflowSkillsDir =
        optionsOrBasePath?.aiworkflowSkillsDir ??
        path.join(os.homedir(), DEFAULT_AIWORKFLOW_SKILLS_DIR);
      this.claudeSkillsDir =
        optionsOrBasePath?.claudeSkillsDir ??
        path.join(os.homedir(), DEFAULT_CLAUDE_SKILLS_DIR);
      this.basePath = this.aiworkflowSkillsDir;
    }
  }

  // =========================================================================
  // New API (TASK-2A)
  // =========================================================================

  /**
   * 全スキルをスキャン
   * @returns スキャンされたスキルメタデータの配列
   */
  async scanAll(): Promise<ScannedSkillMetadata[]> {
    await this.ensureAiworkflowDir();

    const [aiworkflowSkills, claudeSkills] = await Promise.all([
      this.scanSkillDirectory(this.aiworkflowSkillsDir, false),
      this.scanSkillDirectory(this.claudeSkillsDir, true),
    ]);

    return [...aiworkflowSkills, ...claudeSkills];
  }

  /**
   * ~/.aiworkflow/skills/ ディレクトリを確保
   */
  private async ensureAiworkflowDir(): Promise<void> {
    try {
      await fs.mkdir(this.aiworkflowSkillsDir, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        console.error(
          `[SkillScanner] Failed to create directory: ${this.aiworkflowSkillsDir}`,
          error,
        );
        throw error;
      }
    }
  }

  /**
   * 指定ディレクトリのスキルをスキャン
   */
  private async scanSkillDirectory(
    dir: string,
    readonly: boolean,
  ): Promise<ScannedSkillMetadata[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const skills: ScannedSkillMetadata[] = [];

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        // 隠しディレクトリをスキップ
        if (entry.name.startsWith(".")) continue;

        // パストラバーサル攻撃の検証
        if (entry.name.includes("..") || entry.name.includes("/")) {
          console.warn(
            `[SkillScanner] Skipping invalid skill name: ${entry.name}`,
          );
          continue;
        }

        const skillPath = path.join(dir, entry.name);
        const skillMdPath = path.join(skillPath, "SKILL.md");

        const skill = await this.parseSkill(skillPath, skillMdPath, readonly);
        if (skill) {
          skills.push(skill);
        }
      }

      return skills;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      console.warn(
        `[SkillScanner] Error reading directory ${dir}: ${(error as Error).message}`,
      );
      return [];
    }
  }

  /**
   * 単一スキルをパース
   */
  private async parseSkill(
    skillPath: string,
    skillMdPath: string,
    readonly: boolean,
  ): Promise<ScannedSkillMetadata | null> {
    try {
      const content = await fs.readFile(skillMdPath, "utf-8");
      const { frontmatter } = this.parseFrontmatter(content);

      // name フィールドが必須
      if (!frontmatter.name) {
        this.logWarning(`Skipping skill without name: ${skillPath}`);
        return null;
      }

      const [stat, subResources, otherFiles] = await Promise.all([
        fs.stat(skillMdPath),
        this.scanAllSubDirectories(skillPath),
        this.scanOtherFiles(skillPath),
      ]);

      return this.buildSkillMetadata(
        skillPath,
        readonly,
        frontmatter,
        stat.mtime,
        subResources,
        otherFiles,
      );
    } catch (error) {
      // SKILL.md が存在しない or パースエラーの場合はスキップ
      this.logWarning(
        `Skipping skill at ${skillPath}: ${(error as Error).message}`,
      );
      return null;
    }
  }

  /**
   * 全サブディレクトリをスキャン
   */
  private async scanAllSubDirectories(
    skillPath: string,
  ): Promise<SubResources> {
    const results = await Promise.all(
      SUB_DIRECTORIES.map((dir) => this.scanSubDirectory(skillPath, dir)),
    );

    return {
      agents: results[0],
      references: results[1],
      scripts: results[2],
      assets: results[3],
      schemas: results[4],
      indexes: results[5],
    };
  }

  /**
   * スキルメタデータを構築
   */
  private buildSkillMetadata(
    skillPath: string,
    readonly: boolean,
    frontmatter: SkillFrontmatter,
    updatedAt: Date,
    subResources: SubResources,
    otherFiles: SkillOtherFile[],
  ): ScannedSkillMetadata {
    return {
      name: frontmatter.name!,
      description: frontmatter.description ?? "",
      allowedTools: frontmatter["allowed-tools"],
      path: skillPath,
      updatedAt,
      readonly,
      ...subResources,
      otherFiles,
    };
  }

  /**
   * 警告ログを出力
   */
  private logWarning(message: string): void {
    console.warn(`[SkillScanner] ${message}`);
  }

  /**
   * YAML Frontmatter をパース
   */
  private parseFrontmatter(content: string): {
    frontmatter: SkillFrontmatter;
    body: string;
  } {
    const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, body: content };
    }

    try {
      const frontmatter = parseYaml(match[1]) as SkillFrontmatter;
      const body = match[2];
      return { frontmatter, body };
    } catch (error) {
      this.logWarning(
        `Failed to parse YAML frontmatter: ${(error as Error).message}`,
      );
      throw error; // パースエラーは呼び出し元で処理
    }
  }

  /**
   * サブディレクトリをスキャン
   */
  private async scanSubDirectory(
    skillPath: string,
    subDir: string,
  ): Promise<SkillSubResource[]> {
    const dirPath = path.join(skillPath, subDir);

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const resources: SkillSubResource[] = [];

      for (const entry of entries) {
        if (!entry.isFile()) continue;

        const filePath = path.join(dirPath, entry.name);
        const stat = await fs.stat(filePath);

        let description: string | undefined;
        if (entry.name.endsWith(".md")) {
          description = await this.extractDescription(filePath);
        }

        resources.push({
          filename: entry.name,
          relativePath: path.join(subDir, entry.name),
          description,
          size: stat.size,
        });
      }

      return resources;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  /**
   * Markdown ファイルから説明を抽出
   */
  private async extractDescription(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, "utf-8");

      // 最初の見出しを探す
      const headingMatch = content.match(/^#\s+(.+)$/m);
      if (headingMatch) {
        return headingMatch[1].trim();
      }

      // 見出しがなければ最初の段落を探す
      const paragraphMatch = content.match(/^(?!#)(.+)$/m);
      if (paragraphMatch) {
        return paragraphMatch[1].trim().substring(0, 100);
      }

      return "";
    } catch {
      return "";
    }
  }

  /**
   * その他のファイルをスキャン
   */
  private async scanOtherFiles(skillPath: string): Promise<SkillOtherFile[]> {
    const otherFiles: SkillOtherFile[] = [];

    for (const { filename, type } of OTHER_FILES) {
      const filePath = path.join(skillPath, filename);
      try {
        const stat = await fs.stat(filePath);
        otherFiles.push({ filename, type, size: stat.size });
      } catch {
        // ファイルが存在しない場合はスキップ
      }
    }

    return otherFiles;
  }

  // =========================================================================
  // Legacy API (backward compatibility)
  // =========================================================================

  /**
   * ベースパス配下のディレクトリをスキャンし、SKILL.mdを持つパスを返す
   * @deprecated Use scanAll() instead
   */
  async scanDirectory(): Promise<string[]> {
    const skillPaths: string[] = [];

    try {
      const entries = await fs.readdir(this.basePath, { withFileTypes: true });

      for (const entry of entries) {
        // ディレクトリのみ対象
        if (!entry.isDirectory()) continue;
        // 隠しディレクトリをスキップ（.git, .hidden など）
        // ただし .. や ../ はパス検証で処理するためスキップしない
        if (entry.name.startsWith(".") && !entry.name.startsWith("..")) {
          continue;
        }

        const dirPath = path.join(this.basePath, entry.name);
        const skillMdPath = path.join(dirPath, "SKILL.md");

        // パストラバーサル攻撃の検証
        this.validatePath(skillMdPath);

        // シンボリックリンク攻撃の検証（realpath で実際のパスを取得）
        await this.validateSymlink(dirPath);

        try {
          await fs.access(skillMdPath);
          skillPaths.push(skillMdPath);
        } catch {
          // SKILL.mdが存在しない場合はスキップ
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // ベースパスが存在しない場合は自動作成して空の配列を返す
        console.log(
          `[SkillScanner] Base path does not exist: ${this.basePath}. Creating directory...`,
        );
        try {
          await fs.mkdir(this.basePath, { recursive: true });
          console.log(
            `[SkillScanner] Created skills directory: ${this.basePath}`,
          );
        } catch (mkdirError) {
          console.error(
            `[SkillScanner] Failed to create skills directory: ${this.basePath}`,
            mkdirError,
          );
        }
        return [];
      }
      throw error;
    }

    return skillPaths;
  }

  /**
   * ベースパスを設定する
   */
  setBasePath(basePath: string): void {
    this.basePath = path.resolve(basePath);
  }

  /**
   * 現在のベースパスを取得する
   */
  getBasePath(): string {
    return this.basePath;
  }

  /**
   * パスがベースパス配下にあることを検証する（パストラバーサル防止）
   */
  private validatePath(targetPath: string): void {
    const resolved = path.resolve(targetPath);
    if (!resolved.startsWith(this.basePath)) {
      throw new Error(`Path traversal detected: ${targetPath}`);
    }
  }

  /**
   * シンボリックリンクがベースパス外を指していないか検証する
   * Note: macOSでは /tmp が /private/var/... へのシンボリックリンクのため、
   *       basePathも実パスに解決して比較する必要がある
   */
  private async validateSymlink(dirPath: string): Promise<void> {
    try {
      const realDirPath = await fs.realpath(dirPath);

      // First check: compare against original basePath
      // This catches obvious malicious symlinks (e.g., /etc/passwd)
      if (!realDirPath.startsWith(this.basePath)) {
        // Second check: try resolving basePath for macOS /tmp -> /private/var case
        let realBasePath: string;
        try {
          realBasePath = await fs.realpath(this.basePath);
        } catch {
          // If basePath resolution fails, use original basePath (already failed first check)
          throw new Error(`Path traversal detected: ${dirPath}`);
        }

        // If realDirPath doesn't start with realBasePath either, it's a traversal
        if (!realDirPath.startsWith(realBasePath)) {
          throw new Error(`Path traversal detected: ${dirPath}`);
        }

        // Safety check: realDirPath should extend realBasePath, not be equal
        // (a child directory can't resolve to the same path as its parent)
        if (realDirPath === realBasePath) {
          throw new Error(`Path traversal detected: ${dirPath}`);
        }
      }
    } catch (error) {
      // realpath のエラーでパストラバーサルメッセージの場合は再スロー
      if ((error as Error).message.includes("Path traversal")) {
        throw error;
      }
      // その他のエラー（ファイルが存在しないなど）は無視して続行
    }
  }
}
