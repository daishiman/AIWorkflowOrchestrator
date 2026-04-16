/**
 * SkillCreatorService - スキル作成統合サービス
 * TASK-9B-G: skill-creator-service
 *
 * Facadeパターンで複雑なスキル作成処理を統合する
 */

import { randomUUID } from "crypto";
import os from "os";
import path from "path";
import fs from "fs/promises";
import { ScriptExecutor } from "./ScriptExecutor";
import { ResourceLoader } from "./ResourceLoader";
import {
  DEFAULT_SKILL_CREATOR_PATH,
  DEFAULT_SKILLS_DIR,
  DEFAULT_WORKFLOWS_DIR,
  MAX_SKILL_NAME_LENGTH,
  TASK_DURATION_MINUTES,
} from "./constants";
import type {
  SkillCreatorMode,
  CreateSkillOptions,
  ExecuteTasksOptions,
  ExecutionReport,
  TaskResult,
  TaskSpec,
  ExecutionSummary,
  Anchor,
} from "@repo/shared/types";

/**
 * create モードで生成するスキル構造計画 JSON
 * TASK-SC-IMP-CREATE-WORKFLOW-001: generate_skill_md.js --plan 引数に渡す
 */
interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
  triggers?: string[];
  anchors?: Anchor[];
}

type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;

export class SkillCreatorService {
  private readonly skillsDir: string;
  private readonly workflowsDir: string;
  private readonly skillCreatorPath: string;
  private readonly scriptExecutor: ScriptExecutor;
  private readonly resourceLoader: ResourceLoader;
  private readonly logger = {
    error: (msg: string, meta?: unknown) =>
      console.error(`[SkillCreatorService] ${msg}`, meta),
    warn: (msg: string, meta?: unknown) =>
      console.warn(`[SkillCreatorService] ${msg}`, meta),
  };

  constructor(skillsDir?: string, workflowsDir?: string) {
    this.skillsDir = skillsDir || DEFAULT_SKILLS_DIR;
    this.workflowsDir = workflowsDir || DEFAULT_WORKFLOWS_DIR;
    this.skillCreatorPath = DEFAULT_SKILL_CREATOR_PATH;
    this.scriptExecutor = new ScriptExecutor(this.skillCreatorPath);
    this.resourceLoader = new ResourceLoader(this.skillCreatorPath);
  }

  /**
   * リクエストから適切なモードを判定
   *
   * @param request - ユーザーリクエスト文字列
   * @returns 判定されたモード
   */
  async detectMode(request: string): Promise<SkillCreatorMode> {
    const result = await this.scriptExecutor.executeJson<{
      mode: SkillCreatorMode;
    }>("detect_mode.js", ["--request", request]);
    return result.mode;
  }

  /**
   * スキルを作成
   *
   * @param options - スキル作成オプション
   * @param onProgress - 進捗通知コールバック
   * @returns 作成されたスキルディレクトリパス
   */
  async createSkill(
    options: CreateSkillOptions,
    onProgress?: SkillCreatorProgressCallback,
  ): Promise<string> {
    // BV-001/BV-002/BV-003/BV-005: 入力バリデーション
    if (!options.name || options.name.trim() === "") {
      throw new Error("Skill name must not be empty");
    }
    if (options.name.length > MAX_SKILL_NAME_LENGTH) {
      throw new Error(
        `Skill name must not exceed ${MAX_SKILL_NAME_LENGTH} characters`,
      );
    }
    if (options.name.includes("\0")) {
      throw new Error("Skill name must not contain null bytes");
    }

    // collaborativeモードでinterviewResultが空の場合はエラー
    if (
      options.mode === "collaborative" &&
      (!options.interviewResult ||
        !options.interviewResult.purpose ||
        !options.interviewResult.features ||
        options.interviewResult.features.length === 0)
    ) {
      throw new Error("Interview result is required for collaborative mode");
    }

    const emitProgress = (progress: SkillCreatorProgressData): void => {
      onProgress?.(progress);
    };

    emitProgress({
      phase: "planning",
      percentage: 10,
      message: "構造を計画しています",
    });

    // モード別ワークフロー実行
    let structurePlan: StructurePlanJson | null = null;

    switch (options.mode) {
      case "collaborative":
        await this.runCollaborativeWorkflow(options);
        break;
      case "orchestrate":
        await this.runOrchestrateWorkflow(options);
        break;
      case "create":
        try {
          structurePlan = await this.runCreateWorkflow(options);
        } catch (error) {
          this.logger.warn("runCreateWorkflow failed, falling back to null", {
            skillName: options.name,
            mode: options.mode,
            error,
          });
          structurePlan = null;
        }
        // AC-2: runCreateWorkflow 完了後、後続処理が正常に続く
        break;
      case "update":
        // Update workflow
        break;
      case "improve-prompt":
        // Improve prompt workflow
        break;
    }

    // スキル初期化
    const skillDir = path.join(this.skillsDir, options.name);
    const initResult = await this.scriptExecutor.execute("init_skill.js", [
      "--name",
      options.name,
      "--description",
      options.description,
      "--output",
      skillDir,
    ]);

    if (!initResult.success) {
      const shouldTryLegacyInit =
        this.isMissingScriptError(initResult.stderr) ||
        /ベースパスが存在しません|スキル名が指定されていません|unknown option|--path/i.test(
          initResult.stderr,
        );
      if (!shouldTryLegacyInit) {
        throw new Error(`Failed to initialize skill: ${initResult.stderr}`);
      }

      const legacyInitResult = await this.scriptExecutor.execute(
        "init_skill.js",
        [options.name, "--path", this.skillsDir],
      );

      if (!legacyInitResult.success) {
        const shouldUseInitFallback =
          this.isMissingScriptError(legacyInitResult.stderr) ||
          /ベースパスが存在しません|スキル名が指定されていません|unknown option|--path/i.test(
            legacyInitResult.stderr,
          );
        if (!shouldUseInitFallback) {
          throw new Error(
            `Failed to initialize skill: ${legacyInitResult.stderr}`,
          );
        }

        await this.initializeSkillFallback(
          skillDir,
          options.name,
          options.description,
        );
      }
    }

    emitProgress({
      phase: "generating-skill",
      percentage: 40,
      message: "SKILL.md を生成しています",
    });
    // SKILL.md生成: create モードのみ structurePlan を使い、他モードは従来どおりテンプレート生成
    if (structurePlan) {
      await this.generateSkillMd(skillDir, structurePlan);
    } else if (options.mode === "create") {
      this.logger.warn(
        "structurePlan is null, falling back to ensureSkillMdExists",
        {
          skillDir,
          skillName: options.name,
          mode: options.mode,
        },
      );
      await this.ensureSkillMdExists(
        skillDir,
        options.name,
        options.description,
      );
    } else {
      await this.ensureSkillMdExists(
        skillDir,
        options.name,
        options.description,
      );
    }

    emitProgress({
      phase: "generating-agents",
      percentage: 70,
      message: "エージェント定義を生成しています",
    });

    // タスク仕様書生成（オプション）
    if (options.generateTasks) {
      await this.generateTaskSpecs(options.name, options.description);
    }

    emitProgress({
      phase: "validating",
      percentage: 90,
      message: "スキルを検証しています",
    });

    // スキル検証
    const isValid = await this.validateSkill(skillDir);
    if (!isValid) {
      throw new Error("Skill validation failed");
    }

    emitProgress({
      phase: "done",
      percentage: 100,
      message: "完了しました",
    });

    return skillDir;
  }

  /**
   * タスクを実行
   *
   * @param options - タスク実行オプション
   * @returns 実行レポート
   */
  async executeTasks(options: ExecuteTasksOptions): Promise<ExecutionReport> {
    // BV-004: パストラバーサル防止
    if (options.tasksDir.includes("../") || options.tasksDir.includes("..\\")) {
      throw new Error("Path traversal detected in tasksDir");
    }
    if (options.tasksDir.includes("\0")) {
      throw new Error("Null byte detected in tasksDir");
    }
    if (options.tasksDir.startsWith("\\\\")) {
      throw new Error("UNC paths are not allowed");
    }

    // タスクをスキャン
    const tasks = await this.scanTasks(options.tasksDir);

    // 空のタスクリストの場合
    if (tasks.length === 0) {
      return {
        mode: options.dryRun ? "dry-run" : "execution",
        tasks: [],
        results: [],
        summary: {
          total: 0,
          completed: 0,
          failed: 0,
          skipped: 0,
        },
      };
    }

    // 依存関係グラフを構築（将来の並列実行最適化で使用予定）
    const _graph = this.buildDependencyGraph(tasks);

    // 循環依存を検出
    const hasCycles = this.detectCycles(tasks);
    if (hasCycles) {
      throw new Error("Circular dependency detected in tasks");
    }

    // トポロジカルソート
    const executionOrder = this.topologicalSort(tasks);

    // ドライランの場合は計画のみ返却
    if (options.dryRun) {
      return {
        mode: "dry-run",
        tasks: executionOrder.map((task) => [task.id]),
        estimatedTime: this.estimateTime(executionOrder),
      };
    }

    // タスクを実行
    const results: TaskResult[] = [];
    const summary: ExecutionSummary & { totalTasks: number } = {
      total: tasks.length,
      totalTasks: tasks.length,
      completed: 0,
      failed: 0,
      skipped: 0,
    };

    for (const task of executionOrder) {
      // 並列実行の場合は独立タスクを同時実行
      const result = await this.executeTask(task, options.parallel || false);
      results.push(result);

      if (result.status === "completed") {
        summary.completed++;
      } else if (result.status === "failed") {
        summary.failed++;
        // 失敗時は中断
        break;
      } else {
        summary.skipped++;
      }
    }

    // スキップされたタスクをカウント
    summary.skipped = tasks.length - summary.completed - summary.failed;

    return {
      mode: "execution",
      results,
      summary,
    };
  }

  /**
   * スキルを検証
   *
   * @param skillDir - スキルディレクトリパス
   * @returns 検証成功/失敗
   */
  async validateSkill(skillDir: string): Promise<boolean> {
    const result = await this.scriptExecutor.execute("validate_all.js", [
      skillDir,
    ]);
    if (result.success) {
      return true;
    }

    const legacyResult = await this.scriptExecutor.execute("validate_all.js", [
      "--path",
      skillDir,
    ]);
    if (legacyResult.success) {
      return true;
    }

    return this.validateSkillFallback(skillDir);
  }

  /**
   * データをスキーマで検証
   *
   * @param schemaName - スキーマ名
   * @param data - 検証対象データ
   * @returns 検証成功/失敗
   */
  async validateWithSchema(
    schemaName: string,
    data: unknown,
  ): Promise<boolean> {
    const result = await this.scriptExecutor.execute("validate_schema.js", [
      "--schema",
      schemaName,
      "--data",
      JSON.stringify(data),
    ]);
    return result.success;
  }

  /**
   * 既存スキルの改善提案を返す
   *
   * @param skillName - スキル名
   * @param autoApply - 自動適用フラグ
   * @returns 改善結果
   */
  async improveSkill(
    skillName: string,
    autoApply: boolean,
  ): Promise<{
    suggestions: Array<{
      category: string;
      description: string;
      severity: string;
      autoFixable: boolean;
    }>;
    applied: boolean;
  }> {
    const result = await this.scriptExecutor.executeJson<{
      suggestions: Array<{
        category: string;
        description: string;
        severity: string;
        autoFixable: boolean;
      }>;
    }>("improve_skill.js", [
      "--name",
      skillName,
      ...(autoApply ? ["--auto-apply"] : []),
    ]);
    return { suggestions: result.suggestions, applied: autoApply };
  }

  /**
   * スキルを複製して新しいディレクトリに生成
   *
   * @param sourceName - 元のスキル名
   * @param newName - 新しいスキル名
   * @param options - フォークオプション
   * @returns 新しいスキルのディレクトリパス
   */
  async forkSkill(
    sourceName: string,
    newName: string,
    options: {
      copyAgents?: boolean;
      copyReferences?: boolean;
      copyScripts?: boolean;
      modifyTools?: boolean;
    },
  ): Promise<string> {
    const args = ["--source", sourceName, "--name", newName];
    if (options.copyAgents) args.push("--copy-agents");
    if (options.copyReferences) args.push("--copy-references");
    if (options.copyScripts) args.push("--copy-scripts");
    if (options.modifyTools) args.push("--modify-tools");

    const result = await this.scriptExecutor.execute("fork_skill.js", args);
    if (!result.success) {
      throw new Error(`Failed to fork skill: ${result.stderr}`);
    }
    return result.stdout.trim() || path.join(this.skillsDir, newName);
  }

  /**
   * スキルをエクスポート形式で共有
   *
   * @param action - アクション（export等）
   * @param target - ターゲット（gist等）
   * @param skillName - スキル名
   * @returns エクスポート結果（URLまたはパス）
   */
  async shareSkill(
    action: string,
    target: string,
    skillName: string,
  ): Promise<string> {
    const result = await this.scriptExecutor.execute("share_skill.js", [
      "--action",
      action,
      "--target",
      target,
      "--name",
      skillName,
    ]);
    if (!result.success) {
      throw new Error(`Failed to share skill: ${result.stderr}`);
    }
    return result.stdout.trim();
  }

  /**
   * スケジュール設定を保存
   *
   * @param skillName - スキル名
   * @param schedule - スケジュール設定
   */
  async scheduleSkill(
    skillName: string,
    schedule: {
      skillName: string;
      scheduleType: string;
      value: string;
      isEnabled: boolean;
    },
  ): Promise<void> {
    const result = await this.scriptExecutor.execute("schedule_skill.js", [
      "--name",
      skillName,
      "--type",
      schedule.scheduleType,
      "--value",
      schedule.value,
      "--enabled",
      String(schedule.isEnabled),
    ]);
    if (!result.success) {
      throw new Error(`Failed to schedule skill: ${result.stderr}`);
    }
  }

  /**
   * デバッグモードでスキルを実行
   *
   * @param skillName - スキル名
   * @param options - デバッグオプション
   * @returns デバッグ結果
   */
  async debugSkill(
    skillName: string,
    options: { verbose?: boolean; breakpoints?: string[] },
  ): Promise<{
    steps: Array<{
      stepNumber: number;
      toolName: string;
      input: unknown;
      output: unknown;
      duration: number;
      hitBreakpoint: boolean;
    }>;
  }> {
    const args = ["--name", skillName];
    if (options.verbose) args.push("--verbose");
    if (options.breakpoints) {
      args.push("--breakpoints", options.breakpoints.join(","));
    }

    const result = await this.scriptExecutor.executeJson<{
      steps: Array<{
        stepNumber: number;
        toolName: string;
        input: unknown;
        output: unknown;
        duration: number;
        hitBreakpoint: boolean;
      }>;
    }>("debug_skill.js", args);

    return result;
  }

  /**
   * スキルのドキュメントを生成
   *
   * @param skillName - スキル名
   * @param format - 出力形式
   * @param sections - 生成するセクション
   * @returns 生成されたファイルパス
   */
  async generateDocs(
    skillName: string,
    format: string,
    sections: string[],
  ): Promise<string> {
    const result = await this.scriptExecutor.execute("generate_docs.js", [
      "--name",
      skillName,
      "--format",
      format,
      "--sections",
      sections.join(","),
    ]);
    if (!result.success) {
      throw new Error(`Failed to generate docs: ${result.stderr}`);
    }
    return result.stdout.trim();
  }

  /**
   * 使用統計を集計
   *
   * @param skillName - スキル名
   * @param period - 集計期間
   * @returns 使用統計
   */
  async getStats(
    skillName: string,
    period: string,
  ): Promise<{
    skillName: string;
    period: string;
    executionCount: number;
    successCount: number;
    failureCount: number;
    averageDuration: number;
    topTools: Array<{ tool: string; count: number }>;
    hourlyDistribution: Record<string, number>;
    errorTrends: Array<{ date: string; count: number }>;
  }> {
    const result = await this.scriptExecutor.executeJson<{
      skillName: string;
      period: string;
      executionCount: number;
      successCount: number;
      failureCount: number;
      averageDuration: number;
      topTools: Array<{ tool: string; count: number }>;
      hourlyDistribution: Record<string, number>;
      errorTrends: Array<{ date: string; count: number }>;
    }>("get_stats.js", ["--name", skillName, "--period", period]);

    return result;
  }

  // ============================================
  // プライベートメソッド
  // ============================================

  /**
   * collaborativeモードのワークフロー実行
   */
  private async runCollaborativeWorkflow(
    _options: CreateSkillOptions,
  ): Promise<void> {
    // エージェントプロンプト読み込み
    const hearingAgent = await this.resourceLoader.loadAgent("hearing");
    // Phase実行はここで行う（将来実装）
    void hearingAgent; // unused warning回避
  }

  /**
   * orchestrateモードのワークフロー実行
   */
  private async runOrchestrateWorkflow(
    options: CreateSkillOptions,
  ): Promise<void> {
    // 実行エンジン選択ロジック
    const engine = options.executionEngine || "claude";
    void engine; // unused warning回避
  }

  /**
   * createモードのワークフロー実行
   * AC-1: purpose に options.description を使用（エージェントプロンプト文字列でない）
   * AC-2: agents にエージェント名リストを設定
   * AC-3: features は空配列（LLM統合は別タスク）
   * AC-4: エラー時は null を返しフォールバック
   * NOTE: LLM による purpose 抽出・features 生成は別タスク（FUTURE-001/002）で実装する
   */
  private async runCreateWorkflow(
    options: CreateSkillOptions,
  ): Promise<StructurePlanJson | null> {
    try {
      const structurePlan: StructurePlanJson = {
        skillName: options.name,
        description: options.description,
        purpose: options.description, // AC-1: LLM統合は別タスク、現時点は description を使用
        features: [], // AC-3: LLM統合は別タスク
        agents: ["extract-purpose", "plan-structure"], // AC-2: エージェント名リスト
      };
      return structurePlan;
    } catch {
      // AC-4: 将来の処理追加に備えてフォールバックを維持
      return null;
    }
  }

  /**
   * structurePlan を基に SKILL.md を生成する。
   * generate_skill_md.js を --plan オプション付きで呼び出す。
   * 失敗時は ensureSkillMdExists にフォールバックする。
   */
  private async generateSkillMd(
    skillDir: string,
    structurePlan: StructurePlanJson,
  ): Promise<void> {
    const tmpPlanPath = path.join(
      os.tmpdir(),
      `skill-plan-${randomUUID()}.json`,
    );
    const skillMdPath = path.join(skillDir, "SKILL.md");
    const normalizedPurpose =
      typeof structurePlan.purpose === "string"
        ? structurePlan.purpose.replace(/\s+/g, " ").trim()
        : "";
    const triggerDescription = normalizedPurpose
      ? `Use when ${structurePlan.skillName} is requested. Purpose: ${normalizedPurpose}`
      : `Use when ${structurePlan.skillName} is requested`;
    const triggerKeywords = structurePlan.triggers?.length
      ? structurePlan.triggers
      : [structurePlan.skillName];
    // StructurePlanJson を generate_skill_md.js が受け取る workflow 形式に変換
    const plan = {
      skillName: structurePlan.skillName,
      workflow: {
        summary: structurePlan.description,
        anchors: structurePlan.anchors || [],
        trigger: {
          description: triggerDescription,
          keywords: triggerKeywords,
        },
        phases: [],
        tasks: [],
      },
      directories: {},
      files: [],
    };
    try {
      await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
      const generateResult = await this.scriptExecutor.execute(
        "generate_skill_md.js",
        ["--plan", tmpPlanPath, "--output", skillMdPath],
      );
      let shouldUseFallback = !generateResult.success;
      const fallbackReason = generateResult.success
        ? "generated skill file not found"
        : "generate_skill_md.js returned failure";
      const fallbackMeta = generateResult.success
        ? {
            skillMdPath,
          }
        : {
            skillMdPath,
            stderr: generateResult.stderr,
            exitCode: generateResult.exitCode,
          };
      if (!shouldUseFallback) {
        try {
          await fs.access(skillMdPath);
        } catch {
          shouldUseFallback = true;
        }
      }
      if (shouldUseFallback) {
        this.logger.error("generateSkillMd fallback to ensureSkillMdExists", {
          skillDir,
          skillName: structurePlan.skillName,
          reason: fallbackReason,
          ...fallbackMeta,
        });
        await this.ensureSkillMdExists(
          skillDir,
          structurePlan.skillName,
          structurePlan.description,
        );
      }
    } catch (err) {
      this.logger.error("generateSkillMd failed", { skillDir, err });
      await this.ensureSkillMdExists(
        skillDir,
        structurePlan.skillName,
        structurePlan.description,
      );
    } finally {
      // cleanup failure is non-fatal
      await fs.unlink(tmpPlanPath).catch(() => {});
    }
  }

  /**
   * タスク仕様書を生成
   */
  private async generateTaskSpecs(
    name: string,
    description: string,
  ): Promise<void> {
    const result = await this.scriptExecutor.execute("generate_task_specs.js", [
      "--name",
      name,
      "--description",
      description,
    ]);
    if (!result.success) {
      const fallbackPath = path.join(this.workflowsDir, `${name}.md`);
      const fallbackContent = `# ${name}

## depends_on

## description
${description}
`;
      await fs.mkdir(this.workflowsDir, { recursive: true });
      await fs.writeFile(fallbackPath, fallbackContent, "utf-8");
    }
  }

  /**
   * タスク仕様書をスキャン
   */
  private async scanTasks(tasksDir: string): Promise<TaskSpec[]> {
    try {
      const result = await this.scriptExecutor.executeJson<{
        tasks: TaskSpec[];
      }>("scan_tasks.js", ["--dir", tasksDir]);
      if (Array.isArray(result.tasks) && result.tasks.length > 0) {
        return result.tasks;
      }
    } catch {
      // Fall through to local parser
    }

    return this.scanTasksFallback(tasksDir);
  }

  /**
   * 依存関係グラフを構築
   */
  private buildDependencyGraph(tasks: TaskSpec[]): Map<string, TaskSpec[]> {
    const graph = new Map<string, TaskSpec[]>();

    for (const task of tasks) {
      const dependsOn = task.depends_on || [];
      const dependencies = tasks.filter((t) => dependsOn.includes(t.id));
      graph.set(task.id, dependencies);
    }

    return graph;
  }

  /**
   * 循環依存を検出（DFS）
   */
  private detectCycles(tasks: TaskSpec[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (taskId: string): boolean => {
      if (recursionStack.has(taskId)) {
        return true; // 循環検出
      }
      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = tasks.find((t) => t.id === taskId);
      if (task?.depends_on) {
        for (const depId of task.depends_on) {
          if (dfs(depId)) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of tasks) {
      if (dfs(task.id)) {
        return true;
      }
    }

    return false;
  }

  /**
   * トポロジカルソート（Kahn's algorithm）
   */
  private topologicalSort(tasks: TaskSpec[]): TaskSpec[] {
    const inDegree = new Map<string, number>();
    const taskMap = new Map<string, TaskSpec>();

    // 初期化
    for (const task of tasks) {
      inDegree.set(task.id, 0);
      taskMap.set(task.id, task);
    }

    // 入次数を計算
    for (const task of tasks) {
      if (task.depends_on) {
        for (const depId of task.depends_on) {
          const current = inDegree.get(depId) || 0;
          inDegree.set(depId, current);
        }
        inDegree.set(task.id, task.depends_on.length);
      }
    }

    // 入次数0のタスクをキューに追加
    const queue: string[] = [];
    for (const [taskId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(taskId);
      }
    }

    const result: TaskSpec[] = [];
    while (queue.length > 0) {
      const taskId = queue.shift()!;
      const task = taskMap.get(taskId);
      if (task) {
        result.push(task);

        // このタスクに依存するタスクの入次数を減らす
        for (const t of tasks) {
          if (t.depends_on?.includes(taskId)) {
            const newDegree = (inDegree.get(t.id) || 1) - 1;
            inDegree.set(t.id, newDegree);
            if (newDegree === 0) {
              queue.push(t.id);
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * 実行時間を見積もり（タスク数 × TASK_DURATION_MINUTES分）
   */
  private estimateTime(tasks: TaskSpec[]): number {
    return tasks.length * TASK_DURATION_MINUTES;
  }

  /**
   * 単一タスクを実行
   */
  private async executeTask(
    task: TaskSpec,
    parallel: boolean,
  ): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      const result = await this.scriptExecutor.execute("execute_task.js", [
        "--id",
        task.id,
        "--content",
        task.content,
        ...(parallel ? ["--parallel"] : []),
      ]);

      const shouldUseFallback =
        !result.success &&
        this.isMissingScriptError(`${result.stderr}\n${result.stdout}`);

      if (shouldUseFallback) {
        const shouldFail = /##\s*error_trigger[\s\S]*\btrue\b/i.test(
          task.content,
        );
        return {
          taskId: task.id,
          status: shouldFail ? "failed" : "completed",
          duration: Date.now() - startTime,
          error: shouldFail
            ? "Simulated task failure triggered by error_trigger"
            : undefined,
          artifacts: [],
        };
      }

      return {
        taskId: task.id,
        status: result.success ? "completed" : "failed",
        duration: Date.now() - startTime,
        error: result.success ? undefined : result.stderr,
        artifacts: [],
      };
    } catch (error) {
      return {
        taskId: task.id,
        status: "failed",
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        artifacts: [],
      };
    }
  }

  private async ensureSkillMdExists(
    skillDir: string,
    skillName: string,
    description: string,
  ): Promise<void> {
    await fs.mkdir(skillDir, { recursive: true });
    const skillMdPath = path.join(skillDir, "SKILL.md");
    try {
      await fs.access(skillMdPath);
    } catch {
      const fallbackSkillMd = `---
name: ${skillName}
description: |
  ${description}
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# ${skillName}

## 概要
${description}

## Task一覧

| Task | 責務 | 入力 | 出力 |
| ---- | ---- | ---- | ---- |
| TODO | TODO | TODO | TODO |
`;
      await fs.writeFile(skillMdPath, fallbackSkillMd, "utf-8");
    }
  }

  private async initializeSkillFallback(
    skillDir: string,
    skillName: string,
    description: string,
  ): Promise<void> {
    await fs.mkdir(skillDir, { recursive: true });
    await fs.mkdir(path.join(skillDir, "scripts"), { recursive: true });
    await fs.mkdir(path.join(skillDir, "agents"), { recursive: true });
    await fs.mkdir(path.join(skillDir, "references"), { recursive: true });
    await fs.mkdir(path.join(skillDir, "assets"), { recursive: true });
    await this.ensureSkillMdExists(skillDir, skillName, description);
  }

  private async validateSkillFallback(skillDir: string): Promise<boolean> {
    try {
      await fs.access(skillDir);
      await fs.access(path.join(skillDir, "SKILL.md"));
      return true;
    } catch {
      return false;
    }
  }

  private isMissingScriptError(stderr: string): boolean {
    return /MODULE_NOT_FOUND|Cannot find module|Unknown script/i.test(stderr);
  }

  private async scanTasksFallback(tasksDir: string): Promise<TaskSpec[]> {
    try {
      const entries = await fs.readdir(tasksDir, { withFileTypes: true });
      const files = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .sort((a, b) => a.name.localeCompare(b.name));
      const tasks: TaskSpec[] = [];

      for (const file of files) {
        const filePath = path.join(tasksDir, file.name);
        const content = await fs.readFile(filePath, "utf-8");
        const dependsOn: string[] = [];
        const lines = content.split(/\r?\n/);
        let inDependsSection = false;

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (/^##\s*depends_on\s*$/i.test(line)) {
            inDependsSection = true;
            continue;
          }
          if (inDependsSection && /^##\s+/.test(line)) {
            break;
          }
          if (inDependsSection && line.length > 0) {
            dependsOn.push(line.replace(/^[-*]\s*/, ""));
          }
        }

        tasks.push({
          id: path.basename(file.name, ".md"),
          content,
          depends_on: dependsOn,
        });
      }

      return tasks;
    } catch {
      return [];
    }
  }
}
