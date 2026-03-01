/**
 * SkillForker - スキルフォーク・派生機能のサービス
 *
 * TASK-9E: 既存スキルをコピー+メタデータ方式でフォークする。
 * FS操作のみを担当し、IPC/BrowserWindowへの依存を持たない。
 *
 * @see docs/30-workflows/TASK-9E-skill-fork/phase-2-design.md
 */
import * as fs from "fs/promises";
import * as path from "path";
import type {
  SkillForkOptions,
  SkillForkResult,
  SkillForkMetadata,
} from "@repo/shared";

export class SkillForker {
  constructor(private skillsDir: string) {}

  /**
   * 既存スキルをフォークして新スキルを作成する
   *
   * 処理フロー:
   * 1. パストラバーサル検証
   * 2. ソース存在確認 / 重複チェック
   * 3. ディレクトリ作成
   * 4. SKILL.md コピー+更新
   * 5. サブディレクトリの選択的コピー
   * 6. フォークメタデータ書き込み
   *
   * @throws Error フォーク失敗時（ロールバック済み）
   */
  async fork(options: SkillForkOptions): Promise<SkillForkResult> {
    // 1. パストラバーサル検証
    this.validatePath(options.sourceSkill);
    this.validatePath(options.newName);

    const sourcePath = path.resolve(this.skillsDir, options.sourceSkill);
    const destPath = path.resolve(this.skillsDir, options.newName);

    // 2. ソーススキルの存在確認
    if (!(await this.exists(sourcePath))) {
      throw new Error(
        `フォーク元スキルが見つかりません: ${options.sourceSkill}`,
      );
    }

    // 3. 同名スキルの重複チェック
    if (await this.exists(destPath)) {
      throw new Error(`同名のスキルが既に存在します: ${options.newName}`);
    }

    // 4. 新スキルディレクトリ作成
    await fs.mkdir(destPath, { recursive: true });

    const copiedFiles: string[] = [];
    const warnings: string[] = [];

    try {
      // 5. SKILL.md をコピーして更新
      const skillMdPath = path.join(sourcePath, "SKILL.md");
      let originalDescription: string | undefined;

      try {
        const content = await fs.readFile(skillMdPath, "utf-8");
        const { frontmatter } = this.parseFrontmatter(content);

        // 元の説明文をメタデータ用に抽出
        if (frontmatter) {
          originalDescription =
            this.extractDescriptionFromFrontmatter(frontmatter);
        }

        const modified = this.modifySkillMd(content, options);
        await fs.writeFile(path.join(destPath, "SKILL.md"), modified, "utf-8");
        copiedFiles.push("SKILL.md");
      } catch (error) {
        warnings.push(
          `SKILL.md の処理に失敗しました: ${(error as Error).message}`,
        );
      }

      // 6. サブディレクトリの選択的コピー
      if (options.copyAgents) {
        const files = await this.copyDirectory(sourcePath, destPath, "agents");
        copiedFiles.push(...files);
      }
      if (options.copyReferences) {
        const files = await this.copyDirectory(
          sourcePath,
          destPath,
          "references",
        );
        copiedFiles.push(...files);
      }
      if (options.copyScripts) {
        const files = await this.copyDirectory(sourcePath, destPath, "scripts");
        copiedFiles.push(...files);
      }
      if (options.copyAssets) {
        const files = await this.copyDirectory(sourcePath, destPath, "assets");
        copiedFiles.push(...files);
      }

      // 7. フォークメタデータ書き込み
      await this.writeForkMetadata(destPath, {
        forkedFrom: options.sourceSkill,
        forkedAt: new Date().toISOString(),
        originalDescription,
      });
      copiedFiles.push("fork-metadata.json");
    } catch (error) {
      // ロールバック: 作成途中のディレクトリを削除
      await this.rollback(destPath);
      throw error;
    }

    return {
      success: true,
      newSkillPath: destPath,
      copiedFiles,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * SKILL.md の Frontmatter を更新する
   *
   * - name → options.newName
   * - description → options.description（指定時のみ）
   * - forked-from → options.sourceSkill
   * - allowed-tools → options.modifyAllowedTools（指定時のみ）
   */
  modifySkillMd(content: string, options: SkillForkOptions): string {
    const { frontmatter, body } = this.parseFrontmatter(content);

    if (!frontmatter) {
      // Frontmatter がない場合は最小限を作成
      const parts = [`name: ${options.newName}`];
      if (options.description) {
        parts.push(`description: ${options.description}`);
      }
      parts.push(`forked-from: ${options.sourceSkill}`);
      return `---\n${parts.join("\n")}\n---\n${content}`;
    }

    let modified = frontmatter;

    // 1. name を更新（常に）
    modified = this.replaceYamlField(
      modified,
      "name",
      `name: ${options.newName}`,
    );

    // 2. description を更新（指定時のみ）
    if (options.description !== undefined) {
      modified = this.replaceYamlField(
        modified,
        "description",
        `description: ${options.description}`,
      );
    }

    // 3. allowed-tools を更新（指定時のみ）
    if (options.modifyAllowedTools !== undefined) {
      const toolsList = options.modifyAllowedTools
        .map((t) => `  - ${t}`)
        .join("\n");
      modified = this.replaceYamlField(
        modified,
        "allowed-tools",
        `allowed-tools:\n${toolsList}`,
      );
    }

    // 4. forked-from を追加
    modified = this.replaceYamlField(
      modified,
      "forked-from",
      `forked-from: ${options.sourceSkill}`,
    );

    return this.serializeFrontmatter(modified, body);
  }

  /**
   * サブディレクトリを再帰的にコピーする
   * ソースにサブディレクトリが存在しない場合は空配列を返す
   *
   * @returns コピーされたファイルの相対パス一覧
   */
  async copyDirectory(
    src: string,
    dest: string,
    subDir: string,
  ): Promise<string[]> {
    const srcDir = path.join(src, subDir);
    const destDir = path.join(dest, subDir);

    if (!(await this.exists(srcDir))) {
      return [];
    }

    await fs.cp(srcDir, destDir, { recursive: true });

    return this.listFiles(destDir, subDir);
  }

  /**
   * フォークメタデータを JSON ファイルとして書き込む
   */
  async writeForkMetadata(
    destPath: string,
    metadata: SkillForkMetadata,
  ): Promise<void> {
    const metadataPath = path.join(destPath, "fork-metadata.json");
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8",
    );
  }

  /**
   * Frontmatter のパース（--- で囲まれた YAML 部分）
   */
  parseFrontmatter(content: string): { frontmatter: string; body: string } {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) {
      return { frontmatter: "", body: content };
    }
    return { frontmatter: match[1], body: match[2] };
  }

  /**
   * Frontmatter のシリアライズ
   */
  serializeFrontmatter(frontmatter: string, body: string): string {
    return `---\n${frontmatter}\n---\n${body}`;
  }

  /**
   * パストラバーサル検証
   * sourceSkill, newName がスキルディレクトリ外を参照していないことを検証
   */
  validatePath(name: string): void {
    if (name.trim() === "") {
      throw new Error("スキル名は空文字列を許可しません");
    }

    const baseDir = path.resolve(this.skillsDir);
    const resolved = path.resolve(baseDir, name);
    const relative = path.relative(baseDir, resolved);

    // prefix一致ではなく相対パスで境界判定する（/skills と /skills-evil の誤許可を防止）
    if (
      relative.startsWith("..") ||
      path.isAbsolute(relative) ||
      relative === ""
    ) {
      throw new Error(`不正なパスが検出されました: ${name}`);
    }
  }

  /**
   * パスの存在確認
   */
  private async exists(dirPath: string): Promise<boolean> {
    try {
      await fs.access(dirPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * YAML フロントマターのフィールドを置換する
   *
   * 行ベースのアプローチで、キーとその継続行（インデント行）を
   * まとめて置換する。キーが存在しない場合は末尾に追加する。
   */
  private replaceYamlField(
    frontmatter: string,
    key: string,
    newValue: string,
  ): string {
    const lines = frontmatter.split("\n");
    const result: string[] = [];
    let i = 0;
    let replaced = false;

    while (i < lines.length) {
      if (lines[i].startsWith(`${key}:`)) {
        // キーを発見: 新しい値で置換
        result.push(...newValue.split("\n"));
        replaced = true;
        i++;
        // 継続行（インデントされた行）をスキップ
        while (
          i < lines.length &&
          lines[i].length > 0 &&
          /^\s/.test(lines[i])
        ) {
          i++;
        }
      } else {
        result.push(lines[i]);
        i++;
      }
    }

    if (!replaced) {
      result.push(...newValue.split("\n"));
    }

    return result.join("\n");
  }

  /**
   * フロントマターから説明文を抽出する
   */
  private extractDescriptionFromFrontmatter(
    frontmatter: string,
  ): string | undefined {
    const lines = frontmatter.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("description:")) {
        const inlineValue = lines[i].slice("description:".length).trim();
        if (inlineValue && inlineValue !== "|") {
          return inlineValue;
        }
        // Multi-line description (| indicator)
        if (inlineValue === "|" && i + 1 < lines.length) {
          const descLines: string[] = [];
          let j = i + 1;
          while (j < lines.length && /^\s/.test(lines[j])) {
            descLines.push(lines[j].trim());
            j++;
          }
          return descLines.join(" ").trim() || undefined;
        }
        return undefined;
      }
    }
    return undefined;
  }

  /**
   * ディレクトリ内のファイルを再帰的にリストする
   */
  private async listFiles(dir: string, prefix: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = path.join(prefix, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.listFiles(
          path.join(dir, entry.name),
          relativePath,
        );
        files.push(...subFiles);
      } else {
        files.push(relativePath);
      }
    }
    return files;
  }

  /**
   * ロールバック処理
   * フォーク途中でエラーが発生した場合、作成途中のディレクトリを削除
   */
  private async rollback(destPath: string): Promise<void> {
    try {
      await fs.rm(destPath, { recursive: true, force: true });
    } catch {
      // ロールバック失敗は非致命的: ログのみ
    }
  }
}
