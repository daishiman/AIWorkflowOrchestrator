---
id: TASK-9B-G
tier: 2
title: SkillCreatorService 実装
phase: 9
depends_on: [TASK-9B-C, TASK-9B-D, TASK-9B-E, TASK-9B-F]
parallel_with: []
blocks: [TASK-10A]
status: pending
priority: critical
estimated_complexity: large
tags: [backend, main-process, service, sdk-integration]
---

# SkillCreatorService 実装

## 概要

skill-creator スキルのバックエンドサービスを実装する。
スキル生成、改善、タスク実行機能を含む。

## 入力

- TASK-9B-C, D, E, F: エージェント・参照資料

## 出力

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## 実装詳細

```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts

import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "fs/promises";
import path from "path";

interface CreateSkillOptions {
  name: string;
  description: string;
  generateTasks?: boolean;
}

interface ExecuteTasksOptions {
  tasksDir: string;
  parallel?: boolean;
  dryRun?: boolean;
}

export class SkillCreatorService {
  constructor(
    private skillsDir: string,
    private workflowsDir: string,
  ) {}

  // 新規スキル生成
  async createSkill(options: CreateSkillOptions): Promise<string> {
    const { name, description, generateTasks } = options;
    const skillDir = path.join(this.skillsDir, name);

    // 1. スキル構造を生成
    const skillStructure = await this.generateSkillStructure(name, description);

    // 2. ファイルを作成
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(path.join(skillDir, "SKILL.md"), skillStructure.skillMd);

    // 3. タスク仕様書を生成（オプション）
    if (generateTasks) {
      const tasksDir = path.join(this.workflowsDir, name, "tasks");
      await fs.mkdir(tasksDir, { recursive: true });
      const tasks = await this.generateTaskSpecs(name, description);
      for (const task of tasks) {
        await fs.writeFile(
          path.join(tasksDir, `${task.id.toLowerCase()}.md`),
          this.formatTaskSpec(task),
        );
      }
    }

    return skillDir;
  }

  // タスク実行
  async executeTasks(options: ExecuteTasksOptions): Promise<ExecutionReport> {
    const { tasksDir, parallel, dryRun } = options;

    // 1. タスク仕様書をスキャン
    const tasks = await this.scanTasks(tasksDir);

    // 2. 依存関係グラフを構築
    const graph = this.buildDependencyGraph(tasks);

    // 3. 循環依存チェック
    const cycles = this.detectCycles(graph);
    if (cycles.length > 0) {
      throw new Error(`Circular dependency: ${cycles.join(" -> ")}`);
    }

    // 4. 実行順序を決定
    const executionOrder = this.topologicalSort(graph);

    // 5. ドライランモード
    if (dryRun) {
      return {
        mode: "dry-run",
        tasks: executionOrder.map((g) => g.map((t) => t.id)),
        estimatedTime: this.estimateTime(executionOrder),
      };
    }

    // 6. タスク実行
    const results = [];
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

      if (results.some((r) => r.status === "failed")) break;
    }

    return {
      mode: "execution",
      results,
      summary: this.summarizeResults(results),
    };
  }

  // 単一タスク実行
  private async executeTask(task: TaskSpec): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      await this.updateTaskStatus(task, "in_progress");

      const result = await query({
        prompt: this.buildExecutionPrompt(task),
        options: {
          tools: task.allowedTools || ["Read", "Write", "Edit", "Bash"],
          maxTurns: 50,
        },
      });

      const validation = await this.validateTask(task);

      if (validation.passed) {
        await this.updateTaskStatus(task, "completed");
        return {
          taskId: task.id,
          status: "completed",
          duration: Date.now() - startTime,
        };
      } else {
        await this.updateTaskStatus(task, "failed");
        return {
          taskId: task.id,
          status: "failed",
          duration: Date.now() - startTime,
        };
      }
    } catch (error) {
      await this.updateTaskStatus(task, "failed");
      return {
        taskId: task.id,
        status: "failed",
        error: String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  // ヘルパーメソッド（実装省略）
  private async generateSkillStructure(name: string, description: string) {
    /* ... */
  }
  private async generateTaskSpecs(name: string, description: string) {
    /* ... */
  }
  private formatTaskSpec(task: TaskSpec): string {
    /* ... */
  }
  private async scanTasks(tasksDir: string): Promise<TaskSpec[]> {
    /* ... */
  }
  private buildDependencyGraph(tasks: TaskSpec[]): DependencyGraph {
    /* ... */
  }
  private detectCycles(graph: DependencyGraph): string[] {
    /* ... */
  }
  private topologicalSort(graph: DependencyGraph): TaskSpec[][] {
    /* ... */
  }
  private estimateTime(order: TaskSpec[][]): number {
    /* ... */
  }
  private buildExecutionPrompt(task: TaskSpec): string {
    /* ... */
  }
  private async validateTask(task: TaskSpec): Promise<ValidationResult> {
    /* ... */
  }
  private async updateTaskStatus(task: TaskSpec, status: string) {
    /* ... */
  }
  private summarizeResults(results: TaskResult[]): ExecutionSummary {
    /* ... */
  }
}
```

## ファイル

| 操作 | パス                                                          |
| ---- | ------------------------------------------------------------- |
| 作成 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` |

## 完了条件

- [ ] スキル生成機能が実装されている
- [ ] タスク実行機能が実装されている
- [ ] 依存関係解決が機能する
- [ ] 並列実行が機能する
- [ ] 循環依存検出が機能する

## テスト要件

```typescript
describe("SkillCreatorService", () => {
  it("should create skill directory structure");
  it("should generate task specs");
  it("should execute tasks in dependency order");
  it("should detect circular dependencies");
  it("should support parallel execution");
});
```
