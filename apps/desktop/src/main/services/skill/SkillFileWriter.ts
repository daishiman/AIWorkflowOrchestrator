/**
 * SkillFileWriter - LLM 生成スキルコンテンツの永続化
 *
 * TASK-SC-04-OUTPUT-PERSISTENCE
 *
 * SkillFileManager（読取・インポート・削除）とは責務分離。
 * 本クラスは LLM 生成コンテンツの新規書き込みに特化する。
 */

import * as fs from "fs/promises";
import * as path from "path";
import type { SkillGeneratedContent } from "@repo/shared/types";

/** SkillFileWriter のエラーコード */
export type SkillFileWriterErrorCode =
  | "VALIDATION_ERROR"
  | "PATH_TRAVERSAL"
  | "SKILL_ALREADY_EXISTS"
  | "WRITE_ERROR";

/** SkillFileWriter のエラー */
export interface SkillFileWriterError {
  code: SkillFileWriterErrorCode;
  message: string;
}

/** persist() の戻り値 */
export interface PersistResult {
  skillPath: string;
  files: string[];
}

/** persist() のオプション */
export interface PersistOptions {
  overwrite?: boolean;
}

export class SkillFileWriter {
  static readonly SKILL_MD_FILENAME = "SKILL.md";
  static readonly AGENTS_DIR = "agents";
  static readonly SCRIPTS_DIR = "scripts";
  static readonly REFERENCES_DIR = "references";

  private readonly basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async persist(
    skillName: string,
    content: SkillGeneratedContent,
    options?: PersistOptions,
  ): Promise<PersistResult> {
    this.validateSkillName(skillName);

    if (typeof content.skillMd !== "string" || content.skillMd.trim() === "") {
      throw this.createError(
        "VALIDATION_ERROR",
        "skillMd must be a non-empty string",
      );
    }

    const skillPath = path.join(this.basePath, skillName);

    if (!options?.overwrite) {
      await this.checkExistingSkill(skillPath);
    }

    await this.ensureDirectory(skillPath);

    const files = await this.writeFiles(skillPath, content);

    return { skillPath, files };
  }

  private validateSkillName(skillName: string): void {
    if (typeof skillName !== "string") {
      throw this.createError("VALIDATION_ERROR", "skillName must be a string");
    }
    if (skillName === "") {
      throw this.createError("VALIDATION_ERROR", "skillName must not be empty");
    }
    if (skillName.trim() === "") {
      throw this.createError(
        "VALIDATION_ERROR",
        "skillName must not be whitespace only",
      );
    }

    if (
      skillName.includes("..") ||
      skillName.includes("/") ||
      skillName.includes("\\")
    ) {
      throw this.createError(
        "PATH_TRAVERSAL",
        "skillName contains invalid characters",
      );
    }

    const resolved = path.resolve(this.basePath, skillName);
    const normalizedBase = path.resolve(this.basePath);
    if (!resolved.startsWith(normalizedBase + path.sep)) {
      throw this.createError(
        "PATH_TRAVERSAL",
        "Resolved path escapes base directory",
      );
    }
  }

  validateFileName(name: string): void {
    if (typeof name !== "string" || name.trim() === "") {
      throw this.createError(
        "VALIDATION_ERROR",
        "File name must be a non-empty string",
      );
    }
    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
      throw this.createError(
        "PATH_TRAVERSAL",
        "File name contains invalid path characters",
      );
    }
  }

  private async checkExistingSkill(skillPath: string): Promise<void> {
    try {
      await fs.access(skillPath);
      throw this.createError(
        "SKILL_ALREADY_EXISTS",
        `Skill already exists at ${skillPath}`,
      );
    } catch (err: unknown) {
      if (this.isNodeError(err) && err.code === "ENOENT") {
        return;
      }
      if (
        this.isSkillFileWriterError(err) &&
        err.code === "SKILL_ALREADY_EXISTS"
      ) {
        throw err;
      }
      throw err;
    }
  }

  private async writeFiles(
    skillPath: string,
    content: SkillGeneratedContent,
  ): Promise<string[]> {
    const writtenFiles: string[] = [];

    try {
      const skillMdPath = path.join(
        skillPath,
        SkillFileWriter.SKILL_MD_FILENAME,
      );
      await this.writeFile(skillMdPath, content.skillMd);
      writtenFiles.push(skillMdPath);

      if (content.agents.length > 0) {
        const agentsDir = path.join(skillPath, SkillFileWriter.AGENTS_DIR);
        await this.ensureDirectory(agentsDir);
        for (const agent of content.agents) {
          this.validateFileName(agent.name);
          const filePath = path.join(agentsDir, `${agent.name}.md`);
          await this.writeFile(filePath, agent.content);
          writtenFiles.push(filePath);
        }
      }

      if (content.scripts.length > 0) {
        const scriptsDir = path.join(skillPath, SkillFileWriter.SCRIPTS_DIR);
        await this.ensureDirectory(scriptsDir);
        for (const script of content.scripts) {
          this.validateFileName(script.name);
          const filePath = path.join(scriptsDir, script.name);
          await this.writeFile(filePath, script.content);
          writtenFiles.push(filePath);
        }
      }

      if (content.references.length > 0) {
        const refsDir = path.join(skillPath, SkillFileWriter.REFERENCES_DIR);
        await this.ensureDirectory(refsDir);
        for (const ref of content.references) {
          this.validateFileName(ref.name);
          const filePath = path.join(refsDir, `${ref.name}.md`);
          await this.writeFile(filePath, ref.content);
          writtenFiles.push(filePath);
        }
      }

      return writtenFiles;
    } catch (err) {
      await this.rollback(writtenFiles, skillPath);
      throw err;
    }
  }

  private async rollback(
    writtenFiles: string[],
    skillPath: string,
  ): Promise<void> {
    for (const filePath of [...writtenFiles].reverse()) {
      try {
        await fs.unlink(filePath);
      } catch {
        // Rollback errors are best-effort
      }
    }

    const subDirs = [
      SkillFileWriter.AGENTS_DIR,
      SkillFileWriter.SCRIPTS_DIR,
      SkillFileWriter.REFERENCES_DIR,
    ];
    for (const dir of subDirs) {
      const dirPath = path.join(skillPath, dir);
      try {
        const entries = await fs.readdir(dirPath);
        if (entries.length === 0) {
          await fs.rmdir(dirPath);
        }
      } catch {
        // Directory may not exist
      }
    }

    try {
      const entries = await fs.readdir(skillPath);
      if (entries.length === 0) {
        await fs.rmdir(skillPath);
      }
    } catch {
      // Ignore
    }
  }

  private async ensureDirectory(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true });
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    await fs.writeFile(filePath, content, "utf-8");
  }

  private createError(
    code: SkillFileWriterErrorCode,
    message: string,
  ): SkillFileWriterError {
    return { code, message };
  }

  private isNodeError(err: unknown): err is NodeJS.ErrnoException {
    return err != null && typeof err === "object" && "code" in err;
  }

  private isSkillFileWriterError(err: unknown): err is SkillFileWriterError {
    return (
      err != null &&
      typeof err === "object" &&
      "code" in err &&
      "message" in err &&
      typeof (err as SkillFileWriterError).code === "string"
    );
  }
}
