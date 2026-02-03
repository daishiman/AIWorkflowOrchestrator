# TASK-9B-G クラス設計書

## メタ情報

| 項目     | 値                    |
| -------- | --------------------- |
| タスクID | TASK-9B-G             |
| 機能名   | skill-creator-service |
| Phase    | 2                     |
| 作成日   | 2026-02-03            |

---

## 1. クラス一覧

| クラス名            | 配置先                                                        | 責務                   |
| ------------------- | ------------------------------------------------------------- | ---------------------- |
| ScriptExecutor      | `apps/desktop/src/main/services/skill/ScriptExecutor.ts`      | スクリプト実行         |
| ResourceLoader      | `apps/desktop/src/main/services/skill/ResourceLoader.ts`      | リソース遅延読み込み   |
| SkillCreatorService | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | スキル作成統合サービス |

---

## 2. ScriptExecutor

### 2.1 クラス図

```
┌─────────────────────────────────────┐
│         ScriptExecutor              │
├─────────────────────────────────────┤
│ - scriptsDir: string                │
├─────────────────────────────────────┤
│ + constructor(skillCreatorPath)     │
│ + execute(scriptName, args)         │
│ + executeJson<T>(scriptName, args)  │
└─────────────────────────────────────┘
```

### 2.2 プロパティ

| プロパティ | 型     | 可視性  | 説明                          |
| ---------- | ------ | ------- | ----------------------------- |
| scriptsDir | string | private | scriptsディレクトリの絶対パス |

### 2.3 メソッド

#### constructor

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| シグネチャ | `constructor(skillCreatorPath: string)`               |
| 説明       | ScriptExecutorを初期化                                |
| 処理       | `scriptsDir = path.join(skillCreatorPath, "scripts")` |

#### execute

| 項目       | 内容                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| シグネチャ | `async execute(scriptName: string, args: string[]): Promise<ScriptResult>` |
| 説明       | スクリプトを実行し、結果を返す                                             |
| 処理       | 1. `path.join(scriptsDir, scriptName)`でパス構築                           |
|            | 2. `child_process.spawn("node", [scriptPath, ...args])`                    |
|            | 3. stdout/stderr収集                                                       |
|            | 4. 終了時にScriptResult返却                                                |
| 戻り値     | `{ success, stdout, stderr, exitCode }`                                    |

#### executeJson

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| シグネチャ | `async executeJson<T>(scriptName: string, args: string[]): Promise<T>` |
| 説明       | JSON出力スクリプトを実行し、パース結果を返す                           |
| 処理       | 1. `execute()`を呼び出し                                               |
|            | 2. success=falseの場合はthrow                                          |
|            | 3. `JSON.parse(result.stdout)`                                         |
| 戻り値     | パースされたオブジェクト                                               |

### 2.4 実装コード

```typescript
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

  async execute(scriptName: string, args: string[]): Promise<ScriptResult> {
    const scriptPath = path.join(this.scriptsDir, scriptName);

    return new Promise((resolve, reject) => {
      const proc = spawn("node", [scriptPath, ...args]);
      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("error", (error) => {
        reject(
          new Error(`Failed to execute script ${scriptName}: ${error.message}`),
        );
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

  async executeJson<T>(scriptName: string, args: string[]): Promise<T> {
    const result = await this.execute(scriptName, args);
    if (!result.success) {
      throw new Error(`Script ${scriptName} failed: ${result.stderr}`);
    }
    return JSON.parse(result.stdout) as T;
  }
}
```

---

## 3. ResourceLoader

### 3.1 クラス図

```
┌─────────────────────────────────────┐
│         ResourceLoader              │
├─────────────────────────────────────┤
│ - basePath: string                  │
│ - cache: Map<string, string>        │
├─────────────────────────────────────┤
│ + constructor(skillCreatorPath)     │
│ + load(category, name)              │
│ + loadAgent(agentName)              │
│ + loadSchema(schemaName)            │
│ + clearCache()                      │
└─────────────────────────────────────┘
```

### 3.2 プロパティ

| プロパティ | 型                  | 可視性  | 説明                           |
| ---------- | ------------------- | ------- | ------------------------------ |
| basePath   | string              | private | skill-creatorの絶対パス        |
| cache      | Map<string, string> | private | 読み込み済みリソースキャッシュ |

### 3.3 メソッド

#### constructor

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| シグネチャ | `constructor(skillCreatorPath: string)`            |
| 説明       | ResourceLoaderを初期化                             |
| 処理       | `basePath = skillCreatorPath`, `cache = new Map()` |

#### load

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| シグネチャ | `async load(category: ResourceCategory, name: string): Promise<string>` |
| 説明       | リソースを読み込む（キャッシュ優先）                                    |
| 処理       | 1. キャッシュチェック                                                   |
|            | 2. なければ`fs.readFile()`                                              |
|            | 3. キャッシュ格納                                                       |
| 戻り値     | リソース内容（文字列）                                                  |

#### loadAgent

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| シグネチャ | `async loadAgent(agentName: string): Promise<string>` |
| 説明       | エージェントプロンプトを読み込む                      |
| 処理       | `load("agents", `${agentName}.md`)`                   |

#### loadSchema

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| シグネチャ | `async loadSchema(schemaName: string): Promise<object>` |
| 説明       | JSONスキーマを読み込んでパース                          |
| 処理       | `load("schemas", ...)` → `JSON.parse()`                 |

#### clearCache

| 項目       | 内容                 |
| ---------- | -------------------- |
| シグネチャ | `clearCache(): void` |
| 説明       | キャッシュをクリア   |
| 処理       | `cache.clear()`      |

### 3.4 実装コード

```typescript
import fs from "fs/promises";
import path from "path";

export type ResourceCategory = "agents" | "references" | "assets" | "schemas";

export class ResourceLoader {
  private readonly basePath: string;
  private cache: Map<string, string> = new Map();

  constructor(skillCreatorPath: string) {
    this.basePath = skillCreatorPath;
  }

  async load(category: ResourceCategory, name: string): Promise<string> {
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

---

## 4. SkillCreatorService

### 4.1 クラス図

```
┌─────────────────────────────────────────┐
│         SkillCreatorService             │
├─────────────────────────────────────────┤
│ - skillsDir: string                     │
│ - workflowsDir: string                  │
│ - skillCreatorPath: string              │
│ - scriptExecutor: ScriptExecutor        │
│ - resourceLoader: ResourceLoader        │
├─────────────────────────────────────────┤
│ + constructor(skillsDir?, workflowsDir?)│
│ + detectMode(request)                   │
│ + createSkill(options)                  │
│ + executeTasks(options)                 │
│ + validateSkill(skillDir)               │
│ + validateWithSchema(schemaName, data)  │
├─────────────────────────────────────────┤
│ - runCollaborativeWorkflow(options)     │
│ - runOrchestrateWorkflow(options)       │
│ - runCreateWorkflow(options)            │
│ - generateTaskSpecs(name, description)  │
│ - scanTasks(tasksDir)                   │
│ - buildDependencyGraph(tasks)           │
│ - detectCycles(graph)                   │
│ - topologicalSort(graph)                │
│ - estimateTime(order)                   │
│ - executeTask(task)                     │
│ - summarizeResults(results)             │
└─────────────────────────────────────────┘
```

### 4.2 プロパティ

| プロパティ       | 型             | 可視性  | 説明                         |
| ---------------- | -------------- | ------- | ---------------------------- |
| skillsDir        | string         | private | スキル格納ディレクトリ       |
| workflowsDir     | string         | private | ワークフロー格納ディレクトリ |
| skillCreatorPath | string         | private | skill-creatorのパス          |
| scriptExecutor   | ScriptExecutor | private | スクリプト実行器             |
| resourceLoader   | ResourceLoader | private | リソース読み込み器           |

### 4.3 公開メソッド

#### detectMode

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| シグネチャ | `async detectMode(request: string): Promise<SkillCreatorMode>`         |
| 説明       | リクエストから適切なモードを判定                                       |
| 処理       | `scriptExecutor.executeJson("detect_mode.js", ["--request", request])` |
| 戻り値     | SkillCreatorMode                                                       |

#### createSkill

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| シグネチャ | `async createSkill(options: CreateSkillOptions): Promise<string>` |
| 説明       | スキルを作成                                                      |
| 処理       | 1. モード別ワークフロー実行                                       |
|            | 2. init_skill.js実行                                              |
|            | 3. generate_skill_md.js実行                                       |
|            | 4. オプションでタスク仕様書生成                                   |
|            | 5. validateSkill()                                                |
| 戻り値     | スキルディレクトリパス                                            |

#### executeTasks

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| シグネチャ | `async executeTasks(options: ExecuteTasksOptions): Promise<ExecutionReport>` |
| 説明       | タスクを実行                                                                 |
| 処理       | 1. scanTasks()                                                               |
|            | 2. buildDependencyGraph()                                                    |
|            | 3. detectCycles() → エラー時throw                                            |
|            | 4. topologicalSort()                                                         |
|            | 5. dryRun時は計画のみ返却                                                    |
|            | 6. 実行ループ                                                                |
| 戻り値     | ExecutionReport                                                              |

#### validateSkill

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| シグネチャ | `async validateSkill(skillDir: string): Promise<boolean>`         |
| 説明       | スキルを検証                                                      |
| 処理       | `scriptExecutor.execute("validate_all.js", ["--path", skillDir])` |
| 戻り値     | 検証成功/失敗                                                     |

#### validateWithSchema

| 項目       | 内容                                                                            |
| ---------- | ------------------------------------------------------------------------------- |
| シグネチャ | `async validateWithSchema(schemaName: string, data: unknown): Promise<boolean>` |
| 説明       | データをスキーマで検証                                                          |
| 処理       | `scriptExecutor.execute("validate_schema.js", [...])`                           |
| 戻り値     | 検証成功/失敗                                                                   |

### 4.4 非公開メソッド

| メソッド                 | 説明                                  |
| ------------------------ | ------------------------------------- |
| runCollaborativeWorkflow | collaborativeモードのワークフロー実行 |
| runOrchestrateWorkflow   | orchestrateモードのワークフロー実行   |
| runCreateWorkflow        | createモードのワークフロー実行        |
| generateTaskSpecs        | タスク仕様書を生成                    |
| scanTasks                | タスク仕様書をスキャン                |
| buildDependencyGraph     | 依存関係グラフを構築                  |
| detectCycles             | 循環依存を検出                        |
| topologicalSort          | トポロジカルソート                    |
| estimateTime             | 実行時間を見積もり                    |
| executeTask              | 単一タスクを実行                      |
| summarizeResults         | 結果をサマリー                        |

---

## 5. 依存関係

```
SkillCreatorService
    │
    ├──uses──→ ScriptExecutor
    │              │
    │              └──uses──→ child_process.spawn
    │
    └──uses──→ ResourceLoader
                   │
                   └──uses──→ fs/promises
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-02-03 | 初版作成 |
