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
  ImportedSkill,
} from "@repo/shared";
import log from "electron-log";
import { SkillScanner } from "./SkillScanner";
import { SkillParser } from "./SkillParser";
import { SkillImportManager } from "./SkillImportManager";
import type {
  SkillExecutor,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillMetadata,
} from "./SkillExecutor";

export class SkillService {
  private cache: Map<string, Skill> = new Map();
  private lastScanTime: Date | null = null;
  private skillExecutor: SkillExecutor | null = null;

  constructor(
    private scanner: SkillScanner,
    private parser: SkillParser,
    public importManager: SkillImportManager,
  ) {}

  /**
   * SkillExecutorを設定する
   * @param executor SkillExecutorインスタンス
   */
  setSkillExecutor(executor: SkillExecutor): void {
    this.skillExecutor = executor;
  }

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
        log.warn("[SkillService] Parse error for:", skillPath, error);
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
  async removeSkill(skillName: string): Promise<RemoveResult> {
    return this.importManager.removeSkill(skillName);
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
   * 名前でスキルを取得する（TASK-9C）
   */
  async getSkillByName(name: string): Promise<ImportedSkill | null> {
    if (this.cache.size === 0) {
      await this.scanAvailableSkills();
    }
    for (const skill of this.cache.values()) {
      if (skill.name === name) {
        // Skillを ImportedSkillに変換
        return {
          ...skill,
          name: skill.name,
          description: skill.description,
          path: skill.path,
          allowedTools: skill.allowedTools,
          updatedAt: skill.lastModified,
          agents: [],
          references: [],
          scripts: [],
          assets: [],
          schemas: [],
          indexes: [],
          otherFiles: [],
          importedAt: new Date(),
          status: "active" as const,
        };
      }
    }
    return null;
  }

  /**
   * スキルディレクトリのパスを取得する（TASK-9C）
   */
  getSkillsDirectory(): string {
    return this.scanner.getBasePath();
  }

  /**
   * スキルを実行する
   *
   * TASK-FIX-7-1: SkillExecutorに委譲して実行
   *
   * @param skillId スキルID
   * @param params 実行パラメータ（prompt, timeout, sessionId, retryConfig等）
   * @returns SkillExecutionResponse
   */
  async executeSkill(
    skillId: string,
    params?: {
      prompt?: string;
      timeout?: number;
      sessionId?: string;
      retryConfig?: SkillExecutionRequest["retryConfig"];
    },
  ): Promise<SkillExecutionResponse> {
    // SkillExecutor初期化確認
    if (!this.skillExecutor) {
      throw new Error("SkillExecutor が初期化されていません");
    }

    // スキルの存在確認
    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error("スキルが見つかりません");
    }

    // インポート状態確認
    if (!this.importManager.isImported(skillId)) {
      throw new Error("スキルがインポートされていません");
    }

    // SkillExecutionRequestを構築
    const request: SkillExecutionRequest = {
      prompt: params?.prompt ?? "",
      skillId,
      timeout: params?.timeout,
      sessionId: params?.sessionId,
      retryConfig: params?.retryConfig,
    };

    // SkillをSkillMetadataに変換
    const metadata: SkillMetadata = {
      id: skill.id,
      name: skill.name,
      slug: skill.slug,
      description: skill.description,
      path: skill.path,
      triggers: skill.triggers,
      anchors: skill.anchors,
      allowedTools: skill.allowedTools,
      category: skill.category,
    };

    // SkillExecutorに委譲
    return this.skillExecutor.execute(request, metadata);
  }
}
