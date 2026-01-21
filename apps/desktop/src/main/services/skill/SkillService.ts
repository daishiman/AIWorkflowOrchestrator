/**
 * SkillService - スキル管理の統合サービス（Facade）
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import type {
  Skill,
  SkillScanResult,
  SkillScanError,
  ImportResult,
  RemoveResult,
  SkillRunResult,
} from "@repo/shared";
import { randomUUID } from "crypto";
import { SkillScanner } from "./SkillScanner";
import { SkillParser } from "./SkillParser";
import { SkillImportManager } from "./SkillImportManager";

export class SkillService {
  private cache: Map<string, Skill> = new Map();
  private lastScanTime: Date | null = null;

  constructor(
    private scanner: SkillScanner,
    private parser: SkillParser,
    private importManager: SkillImportManager,
  ) {}

  /**
   * 利用可能なスキルをスキャンする
   */
  async scanAvailableSkills(forceRefresh = false): Promise<SkillScanResult> {
    console.log(
      "[SkillService][DEBUG] scanAvailableSkills - START, forceRefresh:",
      forceRefresh,
    );
    if (!forceRefresh && this.cache.size > 0 && this.lastScanTime) {
      console.log(
        "[SkillService][DEBUG] Returning cached skills:",
        this.cache.size,
      );
      return {
        skills: Array.from(this.cache.values()),
        errors: [],
        scannedAt: this.lastScanTime,
      };
    }

    const skills: Skill[] = [];
    const errors: SkillScanError[] = [];

    console.log("[SkillService][DEBUG] Scanning directory...");
    const skillPaths = await this.scanner.scanDirectory();
    console.log("[SkillService][DEBUG] Found skill paths:", skillPaths.length);

    for (const skillPath of skillPaths) {
      try {
        const skill = await this.parser.parse(skillPath);
        skills.push(skill);
        this.cache.set(skill.id, skill);
      } catch (error) {
        console.error(
          "[SkillService][DEBUG] Parse error for:",
          skillPath,
          error,
        );
        errors.push({
          path: skillPath,
          error: (error as Error).message,
          code: "PARSE_ERROR",
        });
      }
    }

    this.lastScanTime = new Date();
    console.log(
      "[SkillService][DEBUG] scanAvailableSkills - DONE, skills:",
      skills.length,
      "errors:",
      errors.length,
    );

    return {
      skills,
      errors,
      scannedAt: this.lastScanTime,
    };
  }

  /**
   * インポート済みスキルを取得する
   */
  async getImportedSkills(): Promise<Skill[]> {
    console.log("[SkillService][DEBUG] getImportedSkills - START");
    const importedIds = this.importManager.getImportedSkillIds();
    console.log("[SkillService][DEBUG] importedIds:", importedIds);

    if (this.cache.size === 0) {
      console.log(
        "[SkillService][DEBUG] Cache is empty, calling scanAvailableSkills...",
      );
      await this.scanAvailableSkills();
      console.log(
        "[SkillService][DEBUG] scanAvailableSkills completed, cache size:",
        this.cache.size,
      );
    }

    const result = importedIds
      .map((id) => this.cache.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
    console.log(
      "[SkillService][DEBUG] getImportedSkills - DONE, returning",
      result.length,
      "skills",
    );
    return result;
  }

  /**
   * スキルをインポートする
   */
  async importSkills(skillIds: string[]): Promise<ImportResult> {
    return this.importManager.importSkills(skillIds);
  }

  /**
   * スキルを削除する
   */
  async removeSkill(skillId: string): Promise<RemoveResult> {
    return this.importManager.removeSkill(skillId);
  }

  /**
   * IDでスキルを取得する
   */
  async getSkillById(id: string): Promise<Skill | null> {
    if (this.cache.size === 0) {
      await this.scanAvailableSkills();
    }
    return this.cache.get(id) || null;
  }

  /**
   * キャッシュをクリアする
   */
  clearCache(): void {
    this.cache.clear();
    this.lastScanTime = null;
  }

  /**
   * スキルを実行する
   */
  async executeSkill(
    skillId: string,
    _params?: Record<string, unknown>,
  ): Promise<SkillRunResult> {
    const executionId = randomUUID();
    const startedAt = new Date();

    // スキルの存在確認
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error("スキルが見つかりません");
    }

    // インポート状態確認
    if (!this.importManager.isImported(skillId)) {
      throw new Error("スキルがインポートされていません");
    }

    try {
      // 初期実装: 成功結果を返す
      // 将来的にはスキルの実際の実行ロジックを実装
      const output = `Skill "${skill.name}" executed successfully`;

      return {
        executionId,
        status: "success",
        output,
        startedAt,
        completedAt: new Date(),
      };
    } catch (error) {
      return {
        executionId,
        status: "failed",
        error: error instanceof Error ? error.message : "実行に失敗しました",
        startedAt,
        completedAt: new Date(),
      };
    }
  }
}
