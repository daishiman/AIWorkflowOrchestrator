/**
 * SkillService - スキル管理の統合サービス（Facade）
 *
 * @see docs/30-workflows/agent-003-skill-management-backend/outputs/phase-2/class-design.md
 */
import type {
  Skill,
  SkillId,
  SkillName,
  SkillScanResult,
  SkillScanError,
  ImportResult,
  RemoveResult,
  ImportedSkill,
} from "@repo/shared";
import fs from "fs/promises";
import log from "electron-log";
import path from "path";
import { SkillScanner } from "./SkillScanner";
import { SkillParser } from "./SkillParser";
import { SkillImportManager } from "./SkillImportManager";
import { SkillCreatorService } from "./SkillCreatorService";
import type {
  SkillExecutor,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillMetadata,
} from "./SkillExecutor";

export class SkillService {
  private cache: Map<SkillId, Skill> = new Map();
  private lastScanTime: Date | null = null;
  private skillExecutor: SkillExecutor | null = null;
  private skillCreatorService: SkillCreatorService | null = null;

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
  async importSkills(skillNames: SkillName[]): Promise<ImportResult> {
    return this.importManager.importSkills(skillNames);
  }

  /**
   * スキルを削除する
   */
  async removeSkill(skillName: SkillName): Promise<RemoveResult> {
    return this.importManager.removeSkill(skillName);
  }

  /**
   * IDでスキルを取得する
   */
  async getSkillById(id: SkillId): Promise<Skill | null> {
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
  async getSkillByName(name: SkillName): Promise<ImportedSkill | null> {
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
    skillId: SkillId,
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

  /**
   * ウィザード経由でスキルを作成する (TASK-10A-C)
   *
   * @param description - スキルの自然言語説明
   * @param options - 生成オプション
   * @returns 作成結果（パスを含む）
   */
  async createSkillFromWizard(
    description: string,
    options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    },
  ): Promise<{ path: string }> {
    const baseName = this.toWizardSkillName(description);
    const uniqueName = await this.resolveUniqueSkillName(baseName);

    const skillPath = await this.getSkillCreatorService().createSkill({
      name: uniqueName,
      description,
      mode: "create",
      generateTasks: options.generateTasks,
    });

    if (options.addAgents) {
      await this.ensureOptionalDirectory(
        skillPath,
        "agents",
        "# Agents\n\nここにエージェント定義を追加します。\n",
      );
    }

    if (options.addReferences) {
      await this.ensureOptionalDirectory(
        skillPath,
        "references",
        "# References\n\nここに参照資料を追加します。\n",
      );
    }

    this.clearCache();
    try {
      await this.scanAvailableSkills(true);
    } catch (error) {
      log.warn("[SkillService] Rescan after create failed:", error);
    }

    return { path: skillPath };
  }

  private getSkillCreatorService(): SkillCreatorService {
    if (!this.skillCreatorService) {
      this.skillCreatorService = new SkillCreatorService(
        this.scanner.getBasePath(),
      );
    }
    return this.skillCreatorService;
  }

  private toWizardSkillName(description: string): string {
    const normalized = description
      .slice(0, 50)
      .trim()
      .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return normalized || "new-skill";
  }

  private async resolveUniqueSkillName(baseName: string): Promise<string> {
    const basePath = this.scanner.getBasePath();
    let index = 0;

    while (true) {
      const candidate =
        index === 0 ? baseName : `${baseName}-${String(index + 1)}`;
      const candidatePath = path.join(basePath, candidate);

      try {
        await fs.access(candidatePath);
        index += 1;
      } catch {
        return candidate;
      }
    }
  }

  private async ensureOptionalDirectory(
    skillPath: string,
    directoryName: "agents" | "references",
    readmeContent: string,
  ): Promise<void> {
    const directoryPath = path.join(skillPath, directoryName);
    await fs.mkdir(directoryPath, { recursive: true });

    const readmePath = path.join(directoryPath, "README.md");
    try {
      await fs.access(readmePath);
    } catch {
      await fs.writeFile(readmePath, readmeContent, "utf-8");
    }
  }
}
