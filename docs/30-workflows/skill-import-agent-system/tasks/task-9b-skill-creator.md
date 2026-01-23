---
id: TASK-9B
tier: 2
title: skill-creator スキル実装
phase: 9
depends_on: [TASK-7D, TASK-8C]
parallel_with: [TASK-9A, TASK-9C]
blocks: [TASK-10A]
status: pending
priority: critical
estimated_complexity: xlarge
tags: [backend, main, skill-management, meta-skill, claude-agent-sdk]

execution:
  mode: sequential
  timeout_minutes: 120
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - ~/.claude/skills/skill-creator/SKILL.md
    - ~/.claude/skills/skill-creator/agents/task-generator.md
    - ~/.claude/skills/skill-creator/agents/code-generator.md
    - ~/.claude/skills/skill-creator/agents/validator.md
    - ~/.claude/skills/skill-creator/references/task-template.md
    - ~/.claude/skills/skill-creator/references/skill-structure.md
    - apps/desktop/src/main/services/skill/SkillCreatorService.ts
  modifies:
    - apps/desktop/src/main/ipc/skillHandlers.ts
---

# skill-creator スキル実装

## 概要

他のスキルを自動生成するメタスキル「skill-creator」を実装する。
このスキルにより、ユーザーの要求から新しいスキルを自動生成し、
無限にスキルを量産できるようになる。

## 入力

- TASK-7D: ChatPanel統合済みのUI
- TASK-8C: 統合テスト完了
- \_skill-creator-integration.md: 統合仕様

## 出力

- skill-creator スキル一式
- スキル生成サービス
- タスク仕様書生成機能

## skill-creator の役割

```
┌──────────────────────────────────────────────────────────────────┐
│                    skill-creator の機能                          │
├──────────────────────────────────────────────────────────────────┤
│  1. 対話的スキル作成（会話形式）                                 │
│     - ユーザーとの対話でニーズをヒアリング                       │
│     - 段階的に要件を明確化                                       │
│     - API連携・コード実行の要件を確認                            │
│     - スキル構造を生成                                           │
│                                                                  │
│  2. 外部API連携スキル生成                                        │
│     - REST API呼び出しスキル生成                                 │
│     - Webhook連携スキル生成                                      │
│     - 認証情報の安全な管理                                       │
│                                                                  │
│  3. 既存スキル改善                                               │
│     - スキルの問題点を分析                                       │
│     - 改善提案を生成                                             │
│     - 自動修正を実行                                             │
│                                                                  │
│  4. タスク実行                                                   │
│     - タスク仕様書を解析                                         │
│     - 依存順序に従い実行                                         │
│     - 検証・修正を繰り返し                                       │
│                                                                  │
│  5. 即時使用（セッション内）                                     │
│     - 作成したスキルを即座にインポート                           │
│     - 同一セッションで実行可能に                                 │
│     - テスト実行による動作確認                                   │
└──────────────────────────────────────────────────────────────────┘
```

## 実行手順

### Step 1: SKILL.md 作成

**ツール**: Write

**操作**:

```markdown
## <!-- ~/.claude/skills/skill-creator/SKILL.md -->

allowed_tools:

- Read
- Write
- Edit
- Glob
- Grep
- Bash
- Task
- WebFetch # 外部API連携用
- AskUserQuestion # 対話的ヒアリング用

---

# skill-creator

スキルを対話的に作成・改善・実行するメタスキル。
会話形式でニーズをヒアリングし、API連携やコード実行を含むスキルを生成できる。

## 機能

### 1. 対話的スキル作成 (`/skill-creator` または `/skill-creator chat`)

**会話形式**でスキルを作成します。ユーザーのニーズをヒアリングしながら、
段階的にスキルを設計・生成します。

**対話フロー**:
```

ユーザー: 「新しいスキルを作りたい」
AI: 「どんな機能を持つスキルですか？」
ユーザー: 「天気APIからデータを取得して表示」
AI: 「使用するAPIは何ですか？（例：OpenWeatherMap、気象庁API）」
ユーザー: 「OpenWeatherMap」
AI: 「認証方式を確認します。APIキーが必要ですか？」
ユーザー: 「はい」
AI: 「以下のスキルを生成しました。テストしますか？」

```

**ヒアリング項目**:
- スキルの目的・機能
- 必要な外部連携（API、データベース、ファイル）
- 入力形式と出力形式
- セキュリティ要件（認証、機密情報の扱い）
- エラーハンドリング方針

### 2. 外部API連携スキル (`/skill-creator api`)

REST API/Webhook連携スキルを生成します。

**使用例**:
```

/skill-creator api "Slack通知スキル"

```

**対応API連携パターン**:
- REST API (GET/POST/PUT/DELETE)
- Webhook送受信
- OAuth認証フロー
- APIキー認証

**生成物**:
- スキル本体 + APIクライアントスクリプト
- 認証情報管理（環境変数/Keychain連携）
- リトライ・エラーハンドリング

### 3. 既存スキル改善 (`/skill-creator improve`)

既存スキルを分析し、改善を提案・実行します。

**使用例**:
```

/skill-creator improve "presentation-slide-generator" --auto

```

**改善対象**:
- プロンプトの最適化
- エラーハンドリングの強化
- パフォーマンス改善
- ドキュメントの充実

### 4. タスク実行 (`/skill-creator execute`)

タスク仕様書に従ってタスクを自動実行します。

**使用例**:
```

/skill-creator execute ./docs/30-workflows/skill-import-agent-system/tasks/

```

**実行フロー**:
1. タスク仕様書をスキャン
2. 依存関係グラフを構築
3. トポロジカルソートで実行順序を決定
4. 並列実行可能なタスクを同時実行
5. 各タスクの検証条件をチェック
6. 失敗時はリトライまたはロールバック

### 5. 即時使用 (`/skill-creator use`)

作成したスキルを即座に現在のセッションで使用します。

**使用例**:
```

/skill-creator use "weather-checker"

```

**フロー**:
1. スキルをホットリロードでインポート
2. 現在のセッションにスキルを登録
3. テスト実行（オプション）
4. スキルが即座に使用可能に

### 6. スキルチェーン作成 (`/skill-creator chain`)

複数のスキルをパイプラインとして連携させ、出力を次の入力として渡すチェーンを作成します。

**使用例**:
```

/skill-creator chain "データ収集→分析→レポート生成"

```

**対話フロー**:
1. チェーンの目的を確認
2. 使用するスキルを順番に選択
3. 各ステップの入出力マッピングを設定
4. エラーハンドリング方式を選択
5. チェーンを保存・テスト実行

**生成物**:
- スキルチェーン定義ファイル
- 各ステップの入出力マッピング設定
- エラーハンドリング設定

### 7. スキルフォーク (`/skill-creator fork`)

既存スキルをベースに新しいスキルを作成します。

**使用例**:
```

/skill-creator fork "presentation-slide-generator" --name "report-generator"

```

**オプション**:
- `--copy-agents`: エージェントをコピー（デフォルト: true）
- `--copy-references`: 参照資料をコピー（デフォルト: true）
- `--copy-scripts`: スクリプトをコピー（デフォルト: true）
- `--modify-tools`: 許可ツールを変更

**生成物**:
- フォーク元の構造を引き継いだ新スキル
- フォーク履歴メタデータ

### 8. スキル共有 (`/skill-creator share`)

作成したスキルをGist/GitHubで共有、またはインポートします。

**使用例**:
```

# Gistにエクスポート

/skill-creator share export "my-skill" --to gist

# GitHubからインポート

/skill-creator share import --from github "owner/repo/path"

# Gistからインポート

/skill-creator share import --from gist "abc123..."

```

**対応ソース**:
- GitHub リポジトリ
- GitHub Gist
- URL（SKILL.md直接指定）
- ローカルディレクトリ

### 9. スケジュール設定 (`/skill-creator schedule`)

スキルの定期実行スケジュールを設定します。

**使用例**:
```

# 平日9時に実行

/skill-creator schedule "daily-report" --cron "0 9 \* \* 1-5"

# 1時間ごとに実行

/skill-creator schedule "health-check" --interval 1h

# アプリ起動時に実行

/skill-creator schedule "init-setup" --event app_start

```

**スケジュールタイプ**:
- `--cron`: Cron形式（例: "0 9 * * 1-5"）
- `--interval`: インターバル（例: 1h, 30m）
- `--once`: 一回のみ（例: "2026-01-30T10:00"）
- `--event`: イベントトリガー（app_start, file_change, git_commit）

### 10. デバッグ実行 (`/skill-creator debug`)

スキルをデバッグモードで実行し、ステップバイステップで追跡します。

**使用例**:
```

/skill-creator debug "my-skill" --breakpoint "Bash"

```

**機能**:
- ツール呼び出し前に一時停止
- 変数・状態の確認
- ステップ実行（次のツール呼び出しまで進む）
- 条件付きブレークポイント

**ブレークポイントタイプ**:
- `--breakpoint <tool>`: 特定ツール呼び出し時に停止
- `--condition <expr>`: 条件式がtrueの時に停止

### 11. ドキュメント生成 (`/skill-creator docs`)

スキルのドキュメントを自動生成します。

**使用例**:
```

/skill-creator docs "my-skill" --format markdown --sections overview,usage,examples

```

**生成セクション**:
- overview: 概要説明
- usage: 使い方
- api: API仕様
- examples: 使用例
- troubleshooting: トラブルシューティング

**出力形式**:
- Markdown
- HTML
- PDF

### 12. 使用統計 (`/skill-creator stats`)

スキルの使用状況と分析を表示します。

**使用例**:
```

# 特定スキルの統計

/skill-creator stats "my-skill" --period month

# 全スキルのサマリー

/skill-creator stats --all

```

**表示項目**:
- 実行回数（成功/失敗）
- 平均実行時間
- よく使われるツール
- 時間帯別使用分布
- エラー傾向
- 使用トレンド

## サブエージェント

- `agents/hearing-facilitator.md` - 対話的ヒアリング
- `agents/task-generator.md` - タスク仕様書生成
- `agents/code-generator.md` - コード生成
- `agents/api-integrator.md` - API連携コード生成
- `agents/validator.md` - 検証・テスト

## 参照資料

- `references/task-template.md` - タスク仕様書テンプレート
- `references/skill-structure.md` - スキル構造ガイド
- `references/api-patterns.md` - API連携パターン集
- `references/security-guide.md` - 認証・機密情報管理ガイド
```

**期待結果**: skill-creator の SKILL.md が作成される

### Step 2: task-generator エージェント作成

**ツール**: Write

**操作**:

```markdown
<!-- ~/.claude/skills/skill-creator/agents/task-generator.md -->

# タスク仕様書生成エージェント

## 役割

ユーザーの要求から、実行可能なタスク仕様書を生成する。

## 入力

- ユーザー要求（自然言語）
- プロジェクト構造情報
- 既存コードパターン

## 出力

- タスク仕様書（Markdown + YAML Frontmatter）

## 生成プロセス

### 1. 要求分析
```

ユーザー要求を以下の観点で分析:

- 機能の目的
- 必要なコンポーネント（UI / Backend / 型定義 / テスト）
- 既存コードとの統合ポイント
- セキュリティ考慮事項

```

### 2. タスク分解

```

単一責務の原則に基づきタスクを分解:

- 1タスク = 1つの明確な成果物
- 依存関係を最小化
- 並列実行可能性を最大化

````

### 3. 仕様書生成

```yaml
---
id: TASK-{PHASE}-{ID}
title: "{タスクタイトル}"
phase: {number}
depends_on: [{依存タスク}]
parallel_with: [{並列タスク}]
blocks: [{ブロックタスク}]
status: pending
priority: {low|medium|high|critical}
estimated_complexity: {small|medium|large|xlarge}
tags: [{タグリスト}]

execution:
  mode: sequential
  timeout_minutes: 30
  retry_count: 2

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates: [{作成ファイル}]
  modifies: [{修正ファイル}]
---
````

### 4. 検証

生成したタスク仕様書が以下を満たすことを確認:

- 全ての必須フィールドが存在
- 依存関係に循環がない
- 実行手順が具体的で再現可能
- 検証条件が明確

## コード例

```typescript
interface TaskSpec {
  id: string;
  title: string;
  phase: number;
  depends_on: string[];
  parallel_with: string[];
  blocks: string[];
  status: "pending" | "in_progress" | "completed" | "blocked" | "failed";
  priority: "low" | "medium" | "high" | "critical";
  estimated_complexity: "small" | "medium" | "large" | "xlarge";
  tags: string[];
  execution: ExecutionConfig;
  verification: VerificationConfig;
  artifacts: ArtifactConfig;
}

function generateTaskSpec(
  requirement: string,
  projectContext: ProjectContext,
): TaskSpec[] {
  // 1. 要求を解析
  const analysis = analyzeRequirement(requirement);

  // 2. タスクに分解
  const tasks = decomposeIntoTasks(analysis, projectContext);

  // 3. 依存関係を解決
  const orderedTasks = resolveDependencies(tasks);

  // 4. 仕様書を生成
  return orderedTasks.map((task) => formatAsTaskSpec(task));
}
```

````

**期待結果**: タスク生成エージェントが作成される

### Step 3: code-generator エージェント作成

**ツール**: Write

**操作**:
```markdown
<!-- ~/.claude/skills/skill-creator/agents/code-generator.md -->

# コード生成エージェント

## 役割

タスク仕様書に基づいて、実際のコードを生成する。

## 入力

- タスク仕様書
- 実行手順（Step セクション）
- 既存コードパターン

## 出力

- 生成されたソースコード
- テストコード

## 生成ルール

### 1. 既存パターンの尊重

````

プロジェクト内の既存コードパターンを分析し、
一貫性のあるコードを生成する:

- 命名規則
- ディレクトリ構造
- インポートスタイル
- エラーハンドリングパターン

```

### 2. 型安全性

```

TypeScriptの型システムを最大限活用:

- any型の使用を避ける
- 厳密な型定義
- ジェネリクスの活用
- 型ガードの実装

```

### 3. テスタビリティ

```

テスト可能なコードを生成:

- 依存性注入
- 純粋関数の優先
- モック可能なインターフェース
- 副作用の分離

```

### 4. セキュリティ

```

セキュリティを考慮したコード:

- 入力検証
- エスケープ処理
- 権限チェック
- 機密情報の保護

```

## 生成フロー

```

タスク仕様書
│
▼
Step解析 → ツール特定 → 操作内容抽出
│
▼
既存コード分析 → パターン抽出
│
▼
コード生成 → 型チェック → リント
│
▼
テスト生成 → テスト実行
│
▼
成果物出力

````

## Claude Agent SDK 連携

```typescript
// Claude Agent SDK を使用したコード生成
import { query } from "@anthropic-ai/claude-agent-sdk";

async function generateCode(taskSpec: TaskSpec): Promise<GeneratedCode> {
  const result = await query({
    prompt: buildCodeGenerationPrompt(taskSpec),
    systemPrompt: CODE_GENERATOR_SYSTEM_PROMPT,
    tools: ["Read", "Write", "Edit", "Bash"],
    hooks: {
      preToolUse: validateToolUse,
      postToolUse: verifyResult,
    },
  });

  return parseGeneratedCode(result);
}
````

````

**期待結果**: コード生成エージェントが作成される

### Step 4: validator エージェント作成

**ツール**: Write

**操作**:
```markdown
<!-- ~/.claude/skills/skill-creator/agents/validator.md -->

# 検証エージェント

## 役割

生成されたコード・タスクの検証を行う。

## 検証項目

### 1. 静的検証

````

- TypeScript型チェック
- ESLintルール適合
- Prettierフォーマット
- インポート解決

```

### 2. 動的検証

```

- 単体テスト実行
- 統合テスト実行
- E2Eテスト（該当する場合）

```

### 3. セキュリティ検証

```

- 危険パターンの検出
- 機密情報の露出チェック
- 依存パッケージの脆弱性

```

### 4. 完了条件検証

```

タスク仕様書の検証条件をチェック:

- [ ] 条件1 → 検証コマンド実行 → 結果判定
- [ ] 条件2 → 検証コマンド実行 → 結果判定

````

## 検証フロー

```typescript
interface ValidationResult {
  passed: boolean;
  checks: CheckResult[];
  suggestions: string[];
}

async function validateTask(taskSpec: TaskSpec): Promise<ValidationResult> {
  const checks: CheckResult[] = [];

  // 1. 型チェック
  if (taskSpec.verification.require_typecheck) {
    checks.push(await runTypeCheck(taskSpec));
  }

  // 2. テスト
  if (taskSpec.verification.require_tests) {
    checks.push(await runTests(taskSpec));
  }

  // 3. カスタム検証コマンド
  for (const command of taskSpec.verificationCommands) {
    checks.push(await runCommand(command));
  }

  // 4. 完了条件チェック
  for (const condition of taskSpec.conditions) {
    checks.push(await verifyCondition(condition));
  }

  return {
    passed: checks.every(c => c.passed),
    checks,
    suggestions: generateSuggestions(checks),
  };
}
````

## 自動修正

検証失敗時、可能な場合は自動修正を試みる:

```typescript
async function autoFix(
  taskSpec: TaskSpec,
  validationResult: ValidationResult,
): Promise<boolean> {
  for (const failedCheck of validationResult.checks.filter((c) => !c.passed)) {
    switch (failedCheck.type) {
      case "lint":
        await runCommand("pnpm lint --fix");
        break;
      case "format":
        await runCommand("pnpm format");
        break;
      case "typecheck":
        // 型エラーは自動修正困難、提案を生成
        generateTypeSuggestions(failedCheck);
        break;
    }
  }

  // 再検証
  return (await validateTask(taskSpec)).passed;
}
```

````

**期待結果**: 検証エージェントが作成される

### Step 5: SkillCreatorService 実装

**ツール**: Write

**操作**:
```typescript
// apps/desktop/src/main/services/skill/SkillCreatorService.ts

import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "fs/promises";
import path from "path";
import yaml from "yaml";

interface CreateSkillOptions {
  name: string;
  description: string;
  generateTasks?: boolean;
}

interface ImproveSkillOptions {
  skillName: string;
  auto?: boolean;
}

interface ExecuteTasksOptions {
  tasksDir: string;
  parallel?: boolean;
  dryRun?: boolean;
}

export class SkillCreatorService {
  constructor(
    private skillsDir: string,
    private workflowsDir: string
  ) {}

  // 新規スキル生成
  async createSkill(options: CreateSkillOptions): Promise<string> {
    const { name, description, generateTasks } = options;
    const skillDir = path.join(this.skillsDir, name);

    // 1. スキル構造を生成
    const skillStructure = await this.generateSkillStructure(name, description);

    // 2. ファイルを作成
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(
      path.join(skillDir, "SKILL.md"),
      skillStructure.skillMd
    );

    for (const agent of skillStructure.agents) {
      const agentDir = path.join(skillDir, "agents");
      await fs.mkdir(agentDir, { recursive: true });
      await fs.writeFile(path.join(agentDir, agent.filename), agent.content);
    }

    for (const ref of skillStructure.references) {
      const refDir = path.join(skillDir, "references");
      await fs.mkdir(refDir, { recursive: true });
      await fs.writeFile(path.join(refDir, ref.filename), ref.content);
    }

    // 3. タスク仕様書を生成（オプション）
    if (generateTasks) {
      const tasksDir = path.join(this.workflowsDir, name, "tasks");
      await fs.mkdir(tasksDir, { recursive: true });

      const tasks = await this.generateTaskSpecs(name, description);
      for (const task of tasks) {
        await fs.writeFile(
          path.join(tasksDir, `${task.id.toLowerCase()}.md`),
          this.formatTaskSpec(task)
        );
      }
    }

    return skillDir;
  }

  // スキル改善
  async improveSkill(options: ImproveSkillOptions): Promise<string[]> {
    const { skillName, auto } = options;
    const skillDir = path.join(this.skillsDir, skillName);

    // 1. 現在のスキルを分析
    const analysis = await this.analyzeSkill(skillDir);

    // 2. 改善提案を生成
    const suggestions = await this.generateImprovements(analysis);

    // 3. 自動適用（オプション）
    if (auto) {
      for (const suggestion of suggestions) {
        await this.applyImprovement(skillDir, suggestion);
      }
    }

    return suggestions.map(s => s.description);
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
      throw new Error(`Circular dependency detected: ${cycles.join(" -> ")}`);
    }

    // 4. 実行順序を決定
    const executionOrder = this.topologicalSort(graph);

    // 5. ドライランモード
    if (dryRun) {
      return {
        mode: "dry-run",
        tasks: executionOrder.map(group => group.map(t => t.id)),
        estimatedTime: this.estimateTime(executionOrder),
      };
    }

    // 6. タスク実行
    const results: TaskResult[] = [];
    for (const group of executionOrder) {
      if (parallel && group.length > 1) {
        // 並列実行
        const groupResults = await Promise.all(
          group.map(task => this.executeTask(task))
        );
        results.push(...groupResults);
      } else {
        // 直列実行
        for (const task of group) {
          results.push(await this.executeTask(task));
        }
      }

      // 失敗したタスクがあれば中断
      if (results.some(r => r.status === "failed")) {
        break;
      }
    }

    return {
      mode: "execution",
      results,
      summary: this.summarizeResults(results),
    };
  }

  // タスク実行（単一）
  private async executeTask(task: TaskSpec): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      // ステータス更新
      await this.updateTaskStatus(task, "in_progress");

      // Claude Agent SDK でタスク実行
      const result = await query({
        prompt: this.buildExecutionPrompt(task),
        systemPrompt: TASK_EXECUTOR_SYSTEM_PROMPT,
        tools: task.allowedTools || ["Read", "Write", "Edit", "Bash"],
        maxTurns: 50,
      });

      // 検証
      const validation = await this.validateTask(task);

      if (validation.passed) {
        await this.updateTaskStatus(task, "completed");
        return {
          taskId: task.id,
          status: "completed",
          duration: Date.now() - startTime,
          output: result,
        };
      } else {
        // リトライ
        if (task.execution.retry_count > 0) {
          task.execution.retry_count--;
          return this.executeTask(task);
        }

        await this.updateTaskStatus(task, "failed");
        return {
          taskId: task.id,
          status: "failed",
          duration: Date.now() - startTime,
          error: validation.errors.join("\n"),
        };
      }
    } catch (error) {
      await this.updateTaskStatus(task, "failed");
      return {
        taskId: task.id,
        status: "failed",
        duration: Date.now() - startTime,
        error: String(error),
      };
    }
  }

  // ヘルパーメソッド（省略）
  private async generateSkillStructure(name: string, description: string) { /* ... */ }
  private async generateTaskSpecs(name: string, description: string) { /* ... */ }
  private formatTaskSpec(task: TaskSpec): string { /* ... */ }
  private async analyzeSkill(skillDir: string) { /* ... */ }
  private async generateImprovements(analysis: SkillAnalysis) { /* ... */ }
  private async applyImprovement(skillDir: string, suggestion: Improvement) { /* ... */ }
  private async scanTasks(tasksDir: string): Promise<TaskSpec[]> { /* ... */ }
  private buildDependencyGraph(tasks: TaskSpec[]): DependencyGraph { /* ... */ }
  private detectCycles(graph: DependencyGraph): string[] { /* ... */ }
  private topologicalSort(graph: DependencyGraph): TaskSpec[][] { /* ... */ }
  private estimateTime(order: TaskSpec[][]): number { /* ... */ }
  private buildExecutionPrompt(task: TaskSpec): string { /* ... */ }
  private async validateTask(task: TaskSpec): Promise<ValidationResult> { /* ... */ }
  private async updateTaskStatus(task: TaskSpec, status: string) { /* ... */ }
  private summarizeResults(results: TaskResult[]): ExecutionSummary { /* ... */ }
}
````

**期待結果**: SkillCreatorService が作成される

## 検証条件

### 必須条件

- [ ] skill-creator スキルが ~/.claude/skills/ に作成される
- [ ] `/skill-creator create` で新規スキルが生成できる
- [ ] `/skill-creator improve` で既存スキルが改善できる
- [ ] `/skill-creator execute` でタスク仕様書が実行できる
- [ ] 依存関係が正しく解決される
- [ ] 並列実行が動作する
- [ ] 検証・リトライが機能する

### 自動検証コマンド

```bash
# スキル存在確認
ls -la ~/.claude/skills/skill-creator/

# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop test -- --grep "SkillCreator"
```

## エラーハンドリング

### よくあるエラーと対処

| エラー       | 原因                     | 対処法                 |
| ------------ | ------------------------ | ---------------------- |
| 循環依存     | タスク依存関係の設計ミス | 依存グラフを見直し     |
| タイムアウト | タスクが複雑すぎる       | タスクを分割           |
| 検証失敗     | 生成コードの品質問題     | 自動修正またはリトライ |

### ロールバック手順

```bash
# 生成したスキルを削除
rm -rf ~/.claude/skills/{skill-name}

# 生成したタスク仕様書を削除
rm -rf docs/30-workflows/{skill-name}
```

## メモ

- skill-creator は他の全てのスキルの基盤となる重要なメタスキル
- Claude Agent SDK の query() API を最大限活用
- 将来的には skill-creator 自身も改善対象にできる（自己改善）
