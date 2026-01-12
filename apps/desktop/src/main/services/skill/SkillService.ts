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
} from "@repo/shared";
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
    if (!forceRefresh && this.cache.size > 0 && this.lastScanTime) {
      return {
        skills: Array.from(this.cache.values()),
        errors: [],
        scannedAt: this.lastScanTime,
      };
    }

    const skills: Skill[] = [];
    const errors: SkillScanError[] = [];

    const skillPaths = await this.scanner.scanDirectory();

    for (const skillPath of skillPaths) {
      try {
        const skill = await this.parser.parse(skillPath);
        skills.push(skill);
        this.cache.set(skill.id, skill);
      } catch (error) {
        errors.push({
          path: skillPath,
          error: (error as Error).message,
          code: "PARSE_ERROR",
        });
      }
    }

    this.lastScanTime = new Date();

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
    const importedIds = this.importManager.getImportedSkillIds();

    if (this.cache.size === 0) {
      await this.scanAvailableSkills();
    }

    return importedIds
      .map((id) => this.cache.get(id))
      .filter((skill): skill is Skill => skill !== undefined);
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
}
