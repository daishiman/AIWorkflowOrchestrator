/**
 * SkillScanner - SKILL.mdファイルを持つディレクトリをスキャンする
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import * as fs from "fs/promises";
import * as path from "path";

export class SkillScanner {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = path.resolve(basePath);
  }

  /**
   * ベースパス配下のディレクトリをスキャンし、SKILL.mdを持つパスを返す
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
