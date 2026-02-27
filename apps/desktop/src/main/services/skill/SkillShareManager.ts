/**
 * SkillShareManager - スキルの共有（インポート・エクスポート）を管理する
 *
 * GitHub リポジトリ、Gist、ローカルディレクトリ、URL からのスキルインポートと
 * Gist・ローカルディレクトリへのスキルエクスポートを提供する。
 *
 * @see docs/30-workflows/skill-share/outputs/phase-2/architecture-design.md
 * @see docs/30-workflows/skill-share/outputs/phase-2/api-specification.md
 */
import log from "electron-log";
import path from "node:path";

import type {
  ShareTarget,
  ShareDestination,
  ShareImportResult,
  ShareExportResult,
  ShareValidateSourceResult,
  ShareError,
  ShareResult,
} from "@repo/shared";

// ============================================================================
// Dependency Interfaces (Constructor Injection)
// ============================================================================

interface GitHubClient {
  getRepoContents(
    repo: string,
    path: string,
    branch: string,
  ): Promise<ShareResult<{ name: string; content: string }[]>>;
  getGist(
    gistId: string,
  ): Promise<ShareResult<{ files: Record<string, { content: string }> }>>;
  createGist(
    files: Record<string, { content: string }>,
    description: string,
  ): Promise<ShareResult<{ url: string }>>;
}

interface FileSystemAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readdir(path: string): Promise<string[]>;
  stat(path: string): Promise<{ isDirectory(): boolean }>;
  mkdir(path: string): Promise<void>;
  cp(src: string, dest: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  resolveRealPath(path: string): Promise<string>;
}

interface SkillValidator {
  validateStructure(
    path: string,
  ): Promise<{ isValid: boolean; errors: string[] }>;
  validateSkillMd(content: string): { isValid: boolean; errors: string[] };
}

interface SkillServiceDep {
  scanAvailableSkills(): Promise<unknown>;
  getSkillByName(
    name: string,
  ): Promise<ShareResult<{ name: string; path: string }>>;
  importManager: { importSkills(names: string[]): Promise<unknown> };
}

// ============================================================================
// Error Definitions
// ============================================================================

const SHARE_ERRORS = {
  INVALID_FORMAT: {
    code: 1002,
    category: "validation" as const,
    isRetryable: false,
  },
  PATH_TRAVERSAL: {
    code: 1003,
    category: "validation" as const,
    isRetryable: false,
  },
  SKILL_NOT_FOUND: {
    code: 2003,
    category: "business" as const,
    isRetryable: false,
  },
  TOKEN_NOT_CONFIGURED: {
    code: 2005,
    category: "business" as const,
    isRetryable: false,
  },
  EXTERNAL_SERVICE: {
    code: 3001,
    category: "external" as const,
    isRetryable: false,
  },
  NETWORK_TIMEOUT: {
    code: 3002,
    category: "external" as const,
    isRetryable: true,
  },
  FILE_NOT_FOUND: {
    code: 4002,
    category: "infrastructure" as const,
    isRetryable: false,
  },
  PERMISSION_DENIED: {
    code: 4003,
    category: "infrastructure" as const,
    isRetryable: false,
  },
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

function createSuccess<T>(data: T): ShareResult<T> {
  return { success: true, data };
}

function createError<T>(error: ShareError): ShareResult<T> {
  return { success: false, error };
}

function makeShareError(
  template: {
    code: number;
    category: ShareError["category"];
    isRetryable: boolean;
  },
  message: string,
): ShareError {
  return {
    code: template.code,
    message,
    category: template.category,
    isRetryable: template.isRetryable,
  };
}

/** インポート時の一時ディレクトリベースパス */
const TEMP_SKILL_DIR = "/tmp/skill-share";

/**
 * パストラバーサルを検出する
 * パスに ".." が含まれる場合 true を返す
 */
function hasPathTraversal(path: string): boolean {
  return path.includes("..");
}

/**
 * GitHub リポジトリ文字列からスキル名をパースする
 * "owner/my-skill" -> "my-skill"
 */
function parseSkillNameFromRepo(repo: string): string {
  const segments = repo.split("/");
  return segments[segments.length - 1];
}

// ============================================================================
// SkillShareManager
// ============================================================================

export class SkillShareManager {
  constructor(
    private readonly gitHubClient: GitHubClient,
    private readonly fileSystem: FileSystemAdapter,
    private readonly skillValidator: SkillValidator,
    private readonly skillService: SkillServiceDep,
  ) {}

  // ==========================================================================
  // importFromSource
  // ==========================================================================

  async importFromSource(
    source: ShareTarget,
  ): Promise<ShareResult<ShareImportResult>> {
    switch (source.type) {
      case "github":
        return this.importFromGitHub(source);
      case "gist":
        return this.importFromGist(source);
      case "local":
        return this.importFromLocal(source);
      case "url":
        return this.importFromUrl(source);
      default:
        return createError(
          makeShareError(
            SHARE_ERRORS.INVALID_FORMAT,
            `Unsupported source type: ${source.type}`,
          ),
        );
    }
  }

  // ==========================================================================
  // exportSkill
  // ==========================================================================

  async exportSkill(
    skillName: string,
    destination: ShareDestination,
  ): Promise<ShareResult<ShareExportResult>> {
    // Step 1: スキル情報を取得
    const skillResult = await this.skillService.getSkillByName(skillName);
    if (!skillResult.success) {
      return createError(skillResult.error!);
    }

    const skill = skillResult.data!;
    const skillDir = await this.resolveSkillDirectory(skill.path);

    // Step 2: スキルファイル一覧を取得（再帰）
    const files = await this.collectExportFiles(skillDir);

    switch (destination.type) {
      case "gist":
        return this.exportToGist(
          { name: skill.name, path: skillDir },
          files,
          destination,
        );
      case "local":
        return this.exportToLocal(
          { name: skill.name, path: skillDir },
          files,
          destination,
        );
      default:
        return createError(
          makeShareError(
            SHARE_ERRORS.INVALID_FORMAT,
            `Unsupported destination type: ${destination.type}`,
          ),
        );
    }
  }

  // ==========================================================================
  // validateSource
  // ==========================================================================

  async validateSource(
    source: ShareTarget,
  ): Promise<ShareResult<ShareValidateSourceResult>> {
    const localPath = source.localPath;
    if (!localPath) {
      return createSuccess<ShareValidateSourceResult>({
        isReachable: false,
        hasSkillMd: false,
        errors: ["localPath is required for validation"],
      });
    }

    try {
      const resolvedPath = await this.fileSystem.resolveRealPath(localPath);
      await this.fileSystem.stat(resolvedPath);

      const entries = await this.fileSystem.readdir(resolvedPath);
      const hasSkillMd = entries.includes("SKILL.md");

      if (!hasSkillMd) {
        return createSuccess<ShareValidateSourceResult>({
          isReachable: true,
          hasSkillMd: false,
          errors: ["SKILL.md not found in directory"],
        });
      }

      // SKILL.md が存在する場合、内容を検証
      const skillMdPath = `${resolvedPath}/SKILL.md`;
      const content = await this.fileSystem.readFile(skillMdPath);

      // readFile が有効なコンテンツを返した場合のみバリデーション実行
      if (typeof content === "string") {
        const validation = this.skillValidator.validateSkillMd(content);

        if (!validation.isValid) {
          return createSuccess<ShareValidateSourceResult>({
            isReachable: true,
            hasSkillMd: true,
            errors: validation.errors,
          });
        }
      }

      return createSuccess<ShareValidateSourceResult>({
        isReachable: true,
        hasSkillMd: true,
        errors: [],
      });
    } catch (err) {
      log.error("[SkillShareManager] validateSource error:", err);
      return createSuccess<ShareValidateSourceResult>({
        isReachable: false,
        hasSkillMd: false,
        errors: [
          err instanceof Error
            ? err.message
            : "Unknown error during validation",
        ],
      });
    }
  }

  // ==========================================================================
  // Private: Import Strategies
  // ==========================================================================

  private async importFromGitHub(
    source: ShareTarget,
  ): Promise<ShareResult<ShareImportResult>> {
    const repo = source.repo!;
    const repoPath = source.path || "/";
    const branch = source.branch || "main";

    const result = await this.gitHubClient.getRepoContents(
      repo,
      repoPath,
      branch,
    );
    if (!result.success) {
      return createError(result.error!);
    }

    const files = result.data!;
    const hasSkillMd = files.some((f) => f.name === "SKILL.md");
    if (!hasSkillMd) {
      return createError(
        makeShareError(
          SHARE_ERRORS.SKILL_NOT_FOUND,
          "SKILL.md not found in repository",
        ),
      );
    }

    // スキル名をリポジトリ名からパース
    const skillName = parseSkillNameFromRepo(repo);
    const skillDir = `${TEMP_SKILL_DIR}/${skillName}`;

    await this.fileSystem.mkdir(skillDir);

    for (const file of files) {
      await this.fileSystem.writeFile(`${skillDir}/${file.name}`, file.content);
    }

    return createSuccess<ShareImportResult>({
      success: true,
      skillName,
      skillPath: skillDir,
      source,
      importedAt: new Date().toISOString(),
    });
  }

  private async importFromGist(
    source: ShareTarget,
  ): Promise<ShareResult<ShareImportResult>> {
    const gistId = source.gistId!;

    const result = await this.gitHubClient.getGist(gistId);
    if (!result.success) {
      return createError(result.error!);
    }

    const gistData = result.data!;
    const fileNames = Object.keys(gistData.files);
    const hasSkillMd = fileNames.includes("SKILL.md");

    if (!hasSkillMd) {
      return createError(
        makeShareError(
          SHARE_ERRORS.SKILL_NOT_FOUND,
          "SKILL.md not found in Gist",
        ),
      );
    }

    // Gist からスキル名を推測（SKILL.md の最初の # 行、またはフォールバックで gistId を使用）
    const skillName = `gist-${gistId}`;
    const skillDir = `${TEMP_SKILL_DIR}/${skillName}`;

    await this.fileSystem.mkdir(skillDir);

    for (const [fileName, fileData] of Object.entries(gistData.files)) {
      await this.fileSystem.writeFile(
        `${skillDir}/${fileName}`,
        fileData.content,
      );
    }

    return createSuccess<ShareImportResult>({
      success: true,
      skillName,
      skillPath: skillDir,
      source,
      importedAt: new Date().toISOString(),
    });
  }

  private async importFromLocal(
    source: ShareTarget,
  ): Promise<ShareResult<ShareImportResult>> {
    const localPath = source.localPath!;

    // パストラバーサル検出（P42 準拠: セキュリティチェック最優先）
    if (hasPathTraversal(localPath)) {
      return createError(
        makeShareError(
          SHARE_ERRORS.PATH_TRAVERSAL,
          "Path traversal detected in localPath",
        ),
      );
    }

    try {
      // シンボリックリンク解決
      const resolvedPath = await this.fileSystem.resolveRealPath(localPath);

      await this.fileSystem.stat(resolvedPath);

      const entries = await this.fileSystem.readdir(resolvedPath);
      const hasSkillMd = entries.includes("SKILL.md");

      if (!hasSkillMd) {
        return createError(
          makeShareError(
            SHARE_ERRORS.SKILL_NOT_FOUND,
            "SKILL.md not found in local directory",
          ),
        );
      }

      // スキル名をディレクトリ名から取得
      const skillName = path.basename(resolvedPath);
      const destDir = `${TEMP_SKILL_DIR}/${skillName}`;

      await this.fileSystem.cp(resolvedPath, destDir);

      return createSuccess<ShareImportResult>({
        success: true,
        skillName,
        skillPath: destDir,
        source,
        importedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "ENOENT") {
        return createError(
          makeShareError(
            SHARE_ERRORS.FILE_NOT_FOUND,
            `Directory not found: ${localPath}`,
          ),
        );
      }
      return createError(
        makeShareError(
          SHARE_ERRORS.FILE_NOT_FOUND,
          error.message || `Failed to access: ${localPath}`,
        ),
      );
    }
  }

  private async importFromUrl(
    source: ShareTarget,
  ): Promise<ShareResult<ShareImportResult>> {
    const url = source.url!;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        return createError(
          makeShareError(
            SHARE_ERRORS.EXTERNAL_SERVICE,
            `HTTP ${response.status}: ${response.statusText}`,
          ),
        );
      }

      const content = await response.text();

      // SKILL.md 形式の検証
      const validation = this.skillValidator.validateSkillMd(content);
      if (!validation.isValid) {
        return createError(
          makeShareError(
            SHARE_ERRORS.INVALID_FORMAT,
            `Invalid SKILL.md format: ${validation.errors.join(", ")}`,
          ),
        );
      }

      // URL からスキル名を推測
      const urlSegments = url.split("/").filter((segment) => segment !== "");
      const skillName =
        urlSegments[urlSegments.length - 2] || "url-imported-skill";
      const skillDir = `${TEMP_SKILL_DIR}/${skillName}`;

      await this.fileSystem.mkdir(skillDir);
      await this.fileSystem.writeFile(`${skillDir}/SKILL.md`, content);

      return createSuccess<ShareImportResult>({
        success: true,
        skillName,
        skillPath: skillDir,
        source,
        importedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      // ネットワークエラー（タイムアウト含む）
      return createError(
        makeShareError(
          SHARE_ERRORS.NETWORK_TIMEOUT,
          err instanceof Error ? err.message : "Network error",
        ),
      );
    }
  }

  // ==========================================================================
  // Private: Export Strategies
  // ==========================================================================

  private async resolveSkillDirectory(skillPath: string): Promise<string> {
    try {
      const stat = await this.fileSystem.stat(skillPath);
      if (stat.isDirectory()) {
        return skillPath;
      }
    } catch {
      // stat 失敗時は fallback を利用する
    }
    return path.dirname(skillPath);
  }

  /**
   * エクスポート対象のファイル一覧を再帰収集する。
   * readdir が「ディレクトリ配下のみ」を返すアダプタと
   * 「再帰済み相対パス」を返すアダプタの両方に対応する。
   */
  private async collectExportFiles(
    skillDir: string,
    relativeDir = "",
  ): Promise<string[]> {
    const currentDir =
      relativeDir === "" ? skillDir : path.join(skillDir, relativeDir);
    const entries = await this.fileSystem.readdir(currentDir);
    const files: string[] = [];

    for (const entry of entries) {
      const normalizedEntry = entry.replace(/\\/g, "/");

      // 既に再帰済み相対パスが返るアダプタ向け（例: "references/a.md"）
      if (normalizedEntry.includes("/")) {
        files.push(normalizedEntry);
        continue;
      }

      const relativePath =
        relativeDir === ""
          ? normalizedEntry
          : `${relativeDir}/${normalizedEntry}`;
      const fullPath = path.join(skillDir, relativePath);

      try {
        const stat = await this.fileSystem.stat(fullPath);
        if (stat.isDirectory()) {
          const nested = await this.collectExportFiles(skillDir, relativePath);
          files.push(...nested);
        } else {
          files.push(relativePath);
        }
      } catch {
        // stat不可の環境ではファイルとして扱う
        files.push(relativePath);
      }
    }

    return files;
  }

  private async exportToGist(
    skill: { name: string; path: string },
    files: string[],
    destination: ShareDestination,
  ): Promise<ShareResult<ShareExportResult>> {
    // ファイルの内容を読み取り
    const gistFiles: Record<string, { content: string }> = {};
    for (const fileName of files) {
      const filePath = path.join(skill.path, fileName);
      const content = await this.fileSystem.readFile(filePath);
      gistFiles[fileName] = { content };
    }

    // Gist 作成
    const gistResult = await this.gitHubClient.createGist(
      gistFiles,
      `Skill: ${skill.name}`,
    );

    if (!gistResult.success) {
      return createError(gistResult.error!);
    }

    return createSuccess<ShareExportResult>({
      success: true,
      destination,
      exportedFiles: files,
      shareUrl: gistResult.data!.url,
    });
  }

  private async exportToLocal(
    skill: { name: string; path: string },
    files: string[],
    destination: ShareDestination,
  ): Promise<ShareResult<ShareExportResult>> {
    const localPath = destination.localPath!;

    try {
      await this.fileSystem.mkdir(localPath);

      await this.fileSystem.cp(skill.path, localPath);

      return createSuccess<ShareExportResult>({
        success: true,
        destination,
        exportedFiles: files,
        shareUrl: undefined,
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "EACCES") {
        return createError(
          makeShareError(
            SHARE_ERRORS.PERMISSION_DENIED,
            `Permission denied: ${localPath}`,
          ),
        );
      }
      return createError(
        makeShareError(
          SHARE_ERRORS.FILE_NOT_FOUND,
          error.message || `Failed to export to: ${localPath}`,
        ),
      );
    }
  }
}
