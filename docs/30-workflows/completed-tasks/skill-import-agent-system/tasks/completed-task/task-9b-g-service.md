---
id: TASK-9B-G
tier: 2
title: SkillCreatorService 実装
phase: 9
depends_on: [TASK-9B-A]
parallel_with: []
blocks: [TASK-10A]
status: pending
priority: critical
estimated_complexity: large
tags: [backend, main-process, service, sdk-integration]
---

# TASK-9B-G: SkillCreatorService 実装

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-9B-G                                     |
| Phase      | 9                                             |
| 機能名     | skill-creator-service                         |
| 作成日     | 2026-02-03                                    |
| 依存       | TASK-9B-A（SKILL.md定義）                     |
| 層         | Main Process                                  |
| 対象スキル | `~/.aiworkflow/skills/skill-creator/`（104+） |

## 目的

skill-creator スキルのバックエンドサービスを実装し、`~/.aiworkflow/skills/skill-creator/` 配下の既存リソース（104+ファイル）を活用して、スキル生成・改善・タスク実行・オーケストレーション機能を提供する。

**解決する問題**: skill-creatorのTypeScript API化により、Electronアプリケーションからプログラマティックにスキル作成・管理を行えるようにする。

## 入力（既存リソース活用）

| カテゴリ    | 数  | パス                                             | 活用方法                       |
| ----------- | --- | ------------------------------------------------ | ------------------------------ |
| agents/     | 36+ | `~/.aiworkflow/skills/skill-creator/agents/`     | サブエージェントプロンプト呼出 |
| references/ | 40+ | `~/.aiworkflow/skills/skill-creator/references/` | 設計ガイド・パターン参照       |
| scripts/    | 28+ | `~/.aiworkflow/skills/skill-creator/scripts/`    | 決定論的処理の100%精度実行     |
| assets/     | 38+ | `~/.aiworkflow/skills/skill-creator/assets/`     | テンプレート・タイプ別雛形     |
| schemas/    | 38+ | `~/.aiworkflow/skills/skill-creator/schemas/`    | JSON Schema検証                |

### 主要スクリプト一覧（Script First）

| カテゴリ         | スクリプト                  | 責務                         |
| ---------------- | --------------------------- | ---------------------------- |
| **共通**         | `utils.js`                  | EXIT_CODES, parseFrontmatter |
| **モード判定**   | `detect_mode.js`            | モード自動判定               |
|                  | `detect_runtime.js`         | ランタイム判定               |
| **初期化**       | `init_skill.js`             | スキル初期化・package.json   |
| **生成系**       | `generate_skill_md.js`      | SKILL.md生成                 |
|                  | `generate_agent.js`         | エージェント生成             |
|                  | `generate_script.js`        | スクリプト生成               |
|                  | `generate_dynamic_code.js`  | 動的コード生成               |
| **検証系**       | `validate_all.js`           | 全体検証                     |
|                  | `validate_structure.js`     | 構造検証                     |
|                  | `validate_links.js`         | リンク検証                   |
|                  | `validate_schema.js`        | スキーマ検証                 |
|                  | `validate_workflow.js`      | ワークフロー検証             |
| **更新・分析**   | `analyze_prompt.js`         | プロンプト分析               |
|                  | `apply_updates.js`          | 更新適用                     |
| **自己改善**     | `log_usage.js`              | 使用ログ記録                 |
|                  | `collect_feedback.js`       | フィードバック収集           |
|                  | `apply_self_improvement.js` | 自己改善適用                 |
| **オーケストレ** | `execute_chain.js`          | スキルチェーン実行           |
|                  | `execute_parallel.js`       | 並列スキル実行               |
|                  | `validate_orchestration.js` | オーケストレーション検証     |

## 出力

| 成果物         | パス                                                                         | 説明                 |
| -------------- | ---------------------------------------------------------------------------- | -------------------- |
| メインサービス | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | サービス実装         |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                                  | 共有型定義           |
| ユーティリティ | `apps/desktop/src/main/services/skill/skillCreatorUtils.ts`                  | ヘルパー関数         |
| スクリプト実行 | `apps/desktop/src/main/services/skill/ScriptExecutor.ts`                     | Script First実行基盤 |
| ユニットテスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | テストコード         |

## 参照資料

| 資料名             | パス                                                                 | 説明                     |
| ------------------ | -------------------------------------------------------------------- | ------------------------ |
| SKILL.md定義       | `~/.aiworkflow/skills/skill-creator/SKILL.md`                        | スキル定義（依存成果物） |
| リソースマップ     | `~/.aiworkflow/skills/skill-creator/references/resource-map.md`      | 全リソース詳細           |
| 設計原則           | `~/.aiworkflow/skills/skill-creator/references/core-principles.md`   | Script First等原則       |
| スクリプトコマンド | `~/.aiworkflow/skills/skill-creator/references/script-commands.md`   | スクリプト実行詳細       |
| 品質基準           | `~/.aiworkflow/skills/skill-creator/references/quality-standards.md` | 検証基準                 |
| Agent SDK仕様      | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`             | SDK統合仕様              |
| IPC設計            | `aiworkflow-requirements: api-ipc-agent.md`                          | IPC通信仕様              |

## 設計原則（skill-creator準拠）

| 原則                       | 適用                                         | 実装ポイント                 |
| -------------------------- | -------------------------------------------- | ---------------------------- |
| **Script First**           | 決定論的処理はscripts/配下のスクリプトに委譲 | `ScriptExecutor`クラスで実装 |
| **Progressive Disclosure** | 必要な時にのみリソースを読み込み             | `ResourceLoader`クラスで実装 |
| **Collaborative First**    | AskUserQuestionでユーザー対話を重視          | モード別ワークフローで対応   |
| **Problem First**          | 機能の前に問題を特定                         | Phase 0-0から開始するフロー  |

## 実行手順

### ステップ1: 型定義作成

`packages/shared/src/types/skillCreator.ts` に型定義を作成する。

```typescript
// packages/shared/src/types/skillCreator.ts

/** スキル作成モード */
export type SkillCreatorMode =
  | "collaborative" // ユーザー対話型（推奨）
  | "orchestrate" // 実行エンジン選択
  | "create" // 新規作成
  | "update" // 既存更新
  | "improve-prompt"; // プロンプト改善

/** 実行エンジン（orchestrateモード） */
export type ExecutionEngine = "claude" | "codex" | "claude-to-codex";

/** スキル作成オプション */
export interface CreateSkillOptions {
  name: string;
  description: string;
  mode: SkillCreatorMode;
  executionEngine?: ExecutionEngine;
  generateTasks?: boolean;
  interviewResult?: InterviewResult;
  domainModel?: DomainModel;
}

/** インタビュー結果（collaborative モード） */
export interface InterviewResult {
  purpose: string;
  features: string[];
  inputs: string[];
  outputs: string[];
  externalApis?: ExternalApiConfig[];
  toolsNeeded: string[];
  abstractionLevel: "L1" | "L2" | "L3";
}

/** ドメインモデル */
export interface DomainModel {
  coreDomain: string;
  entities: Entity[];
  boundedContexts: BoundedContext[];
  ubiquitousLanguage: Record<string, string>;
}

/** タスク実行オプション */
export interface ExecuteTasksOptions {
  tasksDir: string;
  parallel?: boolean;
  dryRun?: boolean;
  maxTurns?: number;
}

/** 実行レポート */
export interface ExecutionReport {
  mode: "dry-run" | "execution";
  tasks?: string[][];
  results?: TaskResult[];
  summary?: ExecutionSummary;
  estimatedTime?: number;
}

/** タスク結果 */
export interface TaskResult {
  taskId: string;
  status: "completed" | "failed" | "skipped";
  duration: number;
  error?: string;
  artifacts?: string[];
}

/** 実行サマリー */
export interface ExecutionSummary {
  total: number;
  completed: number;
  failed: number;
  skipped: number;
}

// 補助型
export interface Entity {
  name: string;
  attributes: string[];
}

export interface BoundedContext {
  name: string;
  entities: string[];
}

export interface ExternalApiConfig {
  name: string;
  endpoint: string;
  authType?: "apiKey" | "oauth" | "none";
}
```

### ステップ2: ScriptExecutor実装

`apps/desktop/src/main/services/skill/ScriptExecutor.ts` にScript First実行基盤を実装する。

```typescript
// apps/desktop/src/main/services/skill/ScriptExecutor.ts

import { spawn } from "child_process";
import path from "path";

export interface ScriptResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class ScriptExecutor {
  private readonly scriptsDir: string;

  constructor(skillCreatorPath: string) {
    this.scriptsDir = path.join(skillCreatorPath, "scripts");
  }

  /**
   * スクリプトを実行（決定論的処理 = 100%精度）
   */
  async execute(scriptName: string, args: string[]): Promise<ScriptResult> {
    const scriptPath = path.join(this.scriptsDir, scriptName);

    return new Promise((resolve) => {
      const proc = spawn("node", [scriptPath, ...args]);
      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });
      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      proc.on("close", (exitCode) => {
        resolve({
          success: exitCode === 0,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: exitCode ?? 1,
        });
      });
    });
  }

  /**
   * JSON出力を期待するスクリプト実行
   */
  async executeJson<T>(scriptName: string, args: string[]): Promise<T> {
    const result = await this.execute(scriptName, args);
    if (!result.success) {
      throw new Error(`Script ${scriptName} failed: ${result.stderr}`);
    }
    return JSON.parse(result.stdout) as T;
  }
}
```

### ステップ3: ResourceLoader実装

`apps/desktop/src/main/services/skill/ResourceLoader.ts` にProgressive Disclosure基盤を実装する。

```typescript
// apps/desktop/src/main/services/skill/ResourceLoader.ts

import fs from "fs/promises";
import path from "path";

export class ResourceLoader {
  private readonly basePath: string;
  private cache: Map<string, string> = new Map();

  constructor(skillCreatorPath: string) {
    this.basePath = skillCreatorPath;
  }

  /**
   * リソースを必要な時にのみ読み込み（Progressive Disclosure）
   */
  async load(
    category: "agents" | "references" | "assets" | "schemas",
    name: string,
  ): Promise<string> {
    const key = `${category}/${name}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const resourcePath = path.join(this.basePath, category, name);
    const content = await fs.readFile(resourcePath, "utf-8");
    this.cache.set(key, content);
    return content;
  }

  async loadAgent(agentName: string): Promise<string> {
    return this.load("agents", `${agentName}.md`);
  }

  async loadSchema(schemaName: string): Promise<object> {
    const content = await this.load("schemas", `${schemaName}.json`);
    return JSON.parse(content);
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

### ステップ4: SkillCreatorService実装

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` にメインサービスを実装する。

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts

import path from "path";
import type {
  CreateSkillOptions,
  ExecuteTasksOptions,
  ExecutionReport,
  SkillCreatorMode,
  TaskResult,
  ExecutionSummary,
} from "@repo/shared/types/skillCreator";
import { ScriptExecutor } from "./ScriptExecutor";
import { ResourceLoader } from "./ResourceLoader";

interface TaskSpec {
  id: string;
  content: string;
  allowedTools?: string[];
  depends_on?: string[];
}

type DependencyGraph = Map<string, TaskSpec[]>;

export class SkillCreatorService {
  private readonly skillsDir: string;
  private readonly workflowsDir: string;
  private readonly skillCreatorPath: string;
  private readonly scriptExecutor: ScriptExecutor;
  private readonly resourceLoader: ResourceLoader;

  constructor(
    skillsDir: string = path.join(process.env.HOME!, ".aiworkflow/skills"),
    workflowsDir: string = "docs/30-workflows",
  ) {
    this.skillsDir = skillsDir;
    this.workflowsDir = workflowsDir;
    this.skillCreatorPath = path.join(skillsDir, "skill-creator");
    this.scriptExecutor = new ScriptExecutor(this.skillCreatorPath);
    this.resourceLoader = new ResourceLoader(this.skillCreatorPath);
  }

  // ================================================================
  // モード判定（Script First）
  // ================================================================

  async detectMode(request: string): Promise<SkillCreatorMode> {
    const result = await this.scriptExecutor.executeJson<{ mode: string }>(
      "detect_mode.js",
      ["--request", request],
    );
    return result.mode as SkillCreatorMode;
  }

  // ================================================================
  // スキル作成
  // ================================================================

  async createSkill(options: CreateSkillOptions): Promise<string> {
    const { name, description, mode, generateTasks } = options;
    const skillDir = path.join(this.skillsDir, name);

    // 1. モードに応じたワークフロー実行
    switch (mode) {
      case "collaborative":
        await this.runCollaborativeWorkflow(options);
        break;
      case "orchestrate":
        await this.runOrchestrateWorkflow(options);
        break;
      default:
        await this.runCreateWorkflow(options);
    }

    // 2. スキル構造生成（Script First）
    await this.scriptExecutor.execute("init_skill.js", [
      "--name",
      name,
      "--path",
      skillDir,
    ]);

    // 3. SKILL.md生成
    await this.scriptExecutor.execute("generate_skill_md.js", [
      "--name",
      name,
      "--description",
      description,
      "--output",
      path.join(skillDir, "SKILL.md"),
    ]);

    // 4. タスク仕様書生成（オプション）
    if (generateTasks) {
      await this.generateTaskSpecs(name, description);
    }

    // 5. 検証
    await this.validateSkill(skillDir);

    return skillDir;
  }

  // ================================================================
  // タスク実行
  // ================================================================

  async executeTasks(options: ExecuteTasksOptions): Promise<ExecutionReport> {
    const { tasksDir, parallel, dryRun } = options;

    // 1. タスクスキャン
    const tasks = await this.scanTasks(tasksDir);

    // 2. 依存関係グラフ構築
    const graph = this.buildDependencyGraph(tasks);

    // 3. 循環依存検出
    const cycles = this.detectCycles(graph);
    if (cycles.length > 0) {
      throw new Error(`Circular dependency: ${cycles.join(" -> ")}`);
    }

    // 4. トポロジカルソート
    const executionOrder = this.topologicalSort(graph);

    // 5. ドライラン
    if (dryRun) {
      return {
        mode: "dry-run",
        tasks: executionOrder.map((g) => g.map((t) => t.id)),
        estimatedTime: this.estimateTime(executionOrder),
      };
    }

    // 6. 実行
    const results: TaskResult[] = [];
    for (const group of executionOrder) {
      if (parallel && group.length > 1) {
        const groupResults = await Promise.all(
          group.map((task) => this.executeTask(task)),
        );
        results.push(...groupResults);
      } else {
        for (const task of group) {
          results.push(await this.executeTask(task));
        }
      }

      // 失敗時は中断
      if (results.some((r) => r.status === "failed")) break;
    }

    return {
      mode: "execution",
      results,
      summary: this.summarizeResults(results),
    };
  }

  // ================================================================
  // 検証（Script First）
  // ================================================================

  async validateSkill(skillDir: string): Promise<boolean> {
    const result = await this.scriptExecutor.execute("validate_all.js", [
      "--path",
      skillDir,
    ]);
    return result.success;
  }

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

  // ================================================================
  // プライベートメソッド
  // ================================================================

  private async runCollaborativeWorkflow(
    options: CreateSkillOptions,
  ): Promise<void> {
    // Phase 0-0: 問題発見
    const discoverProblemPrompt =
      await this.resourceLoader.loadAgent("discover-problem");
    // Phase 0.5: ドメインモデリング
    const modelDomainPrompt =
      await this.resourceLoader.loadAgent("model-domain");
    // Phase 0-1〜0-8: インタビュー
    const interviewPrompt =
      await this.resourceLoader.loadAgent("interview-user");
    // ... 各Phase実行ロジック
  }

  private async runOrchestrateWorkflow(
    options: CreateSkillOptions,
  ): Promise<void> {
    const executionModePrompt = await this.resourceLoader.loadAgent(
      "interview-execution-mode",
    );
    // ... orchestrate実行ロジック
  }

  private async runCreateWorkflow(options: CreateSkillOptions): Promise<void> {
    const analyzeRequestPrompt =
      await this.resourceLoader.loadAgent("analyze-request");
    // ... create実行ロジック
  }

  private async generateTaskSpecs(
    name: string,
    description: string,
  ): Promise<void> {
    // task-specification-creator スキルと連携
  }

  private async scanTasks(tasksDir: string): Promise<TaskSpec[]> {
    // タスク仕様書をスキャン
    return [];
  }

  private buildDependencyGraph(tasks: TaskSpec[]): DependencyGraph {
    // 依存関係グラフ構築
    return new Map();
  }

  private detectCycles(graph: DependencyGraph): string[] {
    // 循環依存検出アルゴリズム
    return [];
  }

  private topologicalSort(graph: DependencyGraph): TaskSpec[][] {
    // トポロジカルソート（Kahn's algorithm）
    return [];
  }

  private estimateTime(order: TaskSpec[][]): number {
    return order.flat().length * 5; // 5分/タスク概算
  }

  private async executeTask(task: TaskSpec): Promise<TaskResult> {
    const startTime = Date.now();
    try {
      // Claude Agent SDK query() で実行
      // const result = await query({...})
      return {
        taskId: task.id,
        status: "completed",
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        taskId: task.id,
        status: "failed",
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  private summarizeResults(results: TaskResult[]): ExecutionSummary {
    return {
      total: results.length,
      completed: results.filter((r) => r.status === "completed").length,
      failed: results.filter((r) => r.status === "failed").length,
      skipped: results.filter((r) => r.status === "skipped").length,
    };
  }
}
```

## 統合テスト連携【必須】

| テストカテゴリ   | 検証内容                                   | テストファイル        |
| ---------------- | ------------------------------------------ | --------------------- |
| スクリプト実行   | scripts/\*.js との連携・エラーハンドリング | `*.script.test.ts`    |
| リソース読み込み | Progressive Disclosure・ファイル存在確認   | `*.resource.test.ts`  |
| モード判定       | detect_mode.js との連携                    | `*.mode.test.ts`      |
| タスク実行       | 依存関係解決・並列実行・失敗時中断         | `*.execution.test.ts` |
| IPC通信          | Main-Renderer間のAPI呼び出し               | `*.ipc.test.ts`       |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                 | 仕様参照先                                   |
| ------------------ | ------------------------ | -------------------------------------------- |
| セキュリティ       | ファイルシステムアクセス | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | サービス層設計           | `aiworkflow-requirements: architecture-*.md` |
| API設計            | IPC API設計              | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | スクリプト失敗時の処理   | `aiworkflow-requirements: error-handling.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                   | 適用判断             | 仕様参照先                                          |
| -------------------- | -------------------- | --------------------------------------------------- |
| バックエンド（Main） | サービス実装の主対象 | `aiworkflow-requirements: architecture-*.md`        |
| IPC通信              | Renderer連携         | `aiworkflow-requirements: api-*.md`, `interfaces-*` |
| Preload              | セキュアAPI公開      | `aiworkflow-requirements: security-api-electron.md` |

## アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                   SkillCreatorService               │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │ createSkill()   │  │ executeTasks()  │          │
│  │ detectMode()    │  │ validateSkill() │          │
│  └────────┬────────┘  └────────┬────────┘          │
│           │                    │                    │
│  ┌────────▼────────────────────▼────────┐          │
│  │           ScriptExecutor             │          │
│  │  (scripts/*.js への委譲 = 100%精度)  │          │
│  └────────┬─────────────────────────────┘          │
│           │                                         │
│  ┌────────▼─────────────────────────────┐          │
│  │           ResourceLoader              │          │
│  │  (Progressive Disclosure)             │          │
│  └──────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  ~/.aiworkflow/skills/skill-creator/                │
│  ├── scripts/    (28+) → 決定論的実行              │
│  ├── agents/     (36+) → プロンプト読み込み        │
│  ├── references/ (40+) → ガイド参照                │
│  ├── assets/     (38+) → テンプレート適用          │
│  └── schemas/    (38+) → バリデーション            │
└─────────────────────────────────────────────────────┘
```

## テスト要件

### ユニットテスト

```typescript
describe("SkillCreatorService", () => {
  describe("detectMode", () => {
    it("should detect collaborative mode for ambiguous requests");
    it("should detect create mode for explicit skill creation");
    it("should detect update mode when skill path provided");
    it("should detect improve-prompt mode for prompt optimization");
  });

  describe("createSkill", () => {
    it("should create skill directory structure");
    it("should generate SKILL.md with correct format");
    it("should run collaborative workflow when mode is collaborative");
    it("should generate task specs when generateTasks is true");
    it("should validate created skill");
  });

  describe("executeTasks", () => {
    it("should execute tasks in dependency order");
    it("should detect circular dependencies");
    it("should support parallel execution for independent tasks");
    it("should stop on first failure");
    it("should return dry-run report without execution");
  });
});

describe("ScriptExecutor", () => {
  it("should execute script and return stdout");
  it("should throw on script failure");
  it("should handle script timeout");
  it("should parse JSON output correctly");
});

describe("ResourceLoader", () => {
  it("should load agent from agents/");
  it("should load reference from references/");
  it("should throw for non-existent resource");
  it("should cache loaded resources");
  it("should clear cache on demand");
});
```

### テストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（SKILL.md、resource-map.md）
2. 型定義作成（skillCreator.ts）
3. ScriptExecutor実装
4. ResourceLoader実装
5. SkillCreatorService実装
6. ユニットテスト作成
7. 統合テスト連携確認
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## 成果物

| 成果物         | パス                                                                         | 必須 | 説明             |
| -------------- | ---------------------------------------------------------------------------- | ---- | ---------------- |
| 型定義         | `packages/shared/src/types/skillCreator.ts`                                  | ✅   | 共有型定義       |
| ScriptExecutor | `apps/desktop/src/main/services/skill/ScriptExecutor.ts`                     | ✅   | Script First基盤 |
| ResourceLoader | `apps/desktop/src/main/services/skill/ResourceLoader.ts`                     | ✅   | 遅延読み込み基盤 |
| メインサービス | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | ✅   | サービス実装     |
| ユニットテスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | ✅   | テストコード     |
| 統合テスト     | `apps/desktop/src/main/services/skill/__tests__/*.integration.test.ts`       | 条件 | 統合テスト       |

## 完了条件

- [ ] skillCreator.ts が作成されている
- [ ] ScriptExecutor.ts が実装されている
- [ ] ResourceLoader.ts が実装されている
- [ ] SkillCreatorService.ts が実装されている
- [ ] detectMode() がスクリプト委譲で動作する
- [ ] createSkill() が collaborative/orchestrate/create モードに対応
- [ ] executeTasks() が依存関係解決・並列実行に対応
- [ ] validateSkill() が validate_all.js を呼び出す
- [ ] validateWithSchema() が validate_schema.js を呼び出す
- [ ] 循環依存検出が機能する
- [ ] ユニットテストカバレッジ 80%+ 達成
- [ ] 統合テストが全て成功
- [ ] **本タスク内の全実装を100%完了**

## フォールバック手順

| 状況                   | 代替手順                                               |
| ---------------------- | ------------------------------------------------------ |
| スクリプト未存在       | エラーハンドリングで適切なメッセージを返す             |
| スキーマ検証失敗       | 詳細なバリデーションエラーをログ出力                   |
| 依存関係解決失敗       | 部分実行モードで実行可能なタスクのみ処理               |
| Claude Agent SDK未導入 | 直接Anthropic SDK（@anthropic-ai/sdk）でフォールバック |

## 次のタスク

TASK-10A: ライフサイクル管理
