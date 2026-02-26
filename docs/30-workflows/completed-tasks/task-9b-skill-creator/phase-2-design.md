# Phase 2: 設計 — skill-creator メタスキル実装

## メタ情報

| 項目     | 値                    |
| -------- | --------------------- |
| Phase    | 2                     |
| タスクID | TASK-9B               |
| 機能名   | task-9b-skill-creator |
| 作成日   | 2026-02-26            |

## 目的

Phase 1で定義した12の機能要件（FR-1〜FR-12）と非機能要件（NFR-1〜NFR-5）を実現可能なアーキテクチャ構造に落とし込む。SkillCreatorServiceのFacadeパターン設計、サブコンポーネントの責務分離、IPCチャンネル設計、Claude Agent SDK統合設計を行う。

## 実行タスク

- Task 1: アーキテクチャ設計 — レイヤー構成・コンポーネント構成・設計パターンの選定
- Task 2: ドメインモデリング — スキル生成ドメインのエンティティと関係定義
- Task 3: IPC API設計 — 12チャンネルのリクエスト/レスポンス型定義
- Task 4: Claude Agent SDK統合設計 — query() API呼び出し、Hooks、Permission制御の設計

---

## 参照資料

| 資料名                | パス                                                                                        | 説明                   |
| --------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 1成果物         | `outputs/phase-1/requirements-definition.md`                                                | 要件定義               |
| Electronサービス設計  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Facadeパターン・DI     |
| アーキテクチャ全体像  | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー責務・依存方向 |
| アーキテクチャ原則    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`                | 機能追加パターン       |
| API一覧               | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | IPC/REST正本一覧       |
| Agent IPC仕様         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill関連IPC契約       |
| IPC セキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 3段バリデーション      |
| セキュリティ原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                  | セキュリティ設計原則   |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC/DI/テストパターン  |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44統合    |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill型定義・IPC契約   |
| 品質基準              | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 非機能要件と品質指標   |
| 教訓集                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の苦戦箇所と解決策 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                     |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------ |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー分類・リトライ戦略 |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Electronセキュリティ     |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustand設計原則          |

---

## 実行手順

### Task 1: アーキテクチャ設計

#### レイヤー構成

```
┌─────────────────────────────────────────────────────────────────┐
│                      Renderer Process (React)                    │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐  │
│  │ ChatPanel    │  │ SkillCreatorCommands（コマンドルーター） │  │
│  └──────────────┘  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Preload (contextBridge)                        │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │ skillCreatorAPI: safeInvoke(IPC_CHANNELS.SKILL_CREATE_*) │    │
│  └──────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                      Main Process (Node.js)                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                  IPC Handlers Layer                        │    │
│  │  registerSkillCreatorHandlers()                           │    │
│  │  unregisterSkillCreatorHandlers()                         │    │
│  └──────────┬───────────────────────────────────────────────┘    │
│             │                                                     │
│  ┌──────────▼───────────────────────────────────────────────┐    │
│  │            SkillCreatorService (Facade)                    │    │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐   │    │
│  │  │ HearingFacil.   │  │ TaskGenerator                │   │    │
│  │  └─────────────────┘  └──────────────────────────────┘   │    │
│  │  ┌─────────────────┐  ┌──────────────────────────────┐   │    │
│  │  │ CodeGenerator    │  │ ApiIntegrator                │   │    │
│  │  └─────────────────┘  └──────────────────────────────┘   │    │
│  │  ┌─────────────────┐                                     │    │
│  │  │ Validator        │                                     │    │
│  │  └─────────────────┘                                     │    │
│  └──────────────────────────────────────────────────────────┘    │
│             │                                                     │
│  ┌──────────▼───────────────────────────────────────────────┐    │
│  │  既存サービス連携                                          │    │
│  │  SkillService | SkillExecutor | SkillFileManager          │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────┐
              │  FileSystem / Claude SDK   │
              │  ~/.aiworkflow/skills/     │
              └───────────────────────────┘
```

#### コンポーネント構成

| コンポーネント      | 責務                                                 | 設計パターン            |
| ------------------- | ---------------------------------------------------- | ----------------------- |
| SkillCreatorService | 12コマンドの統合エントリポイント（Facade）           | Facade パターン         |
| HearingFacilitator  | 対話的ヒアリング、要件の段階的明確化                 | Strategy パターン       |
| TaskGenerator       | タスク仕様書の解析・依存関係解決・トポロジカルソート | Algorithm パターン      |
| CodeGenerator       | Claude Agent SDK経由でのコード生成                   | Template Method         |
| ApiIntegrator       | REST API / Webhook 連携コード生成                    | Builder パターン        |
| Validator           | 静的検証・動的検証・セキュリティ検証・完了条件検証   | Chain of Responsibility |

#### 設計パターン適用

| パターン                | 適用箇所                                 | 根拠                                  |
| ----------------------- | ---------------------------------------- | ------------------------------------- |
| Facade                  | SkillCreatorService                      | 12コマンドの統合窓口、複雑性隠蔽      |
| Setter Injection        | SkillCreatorService ← BrowserWindow      | P34対策: BrowserWindow遅延生成        |
| Strategy                | HearingFacilitator（ヒアリング戦略切替） | chat / api で異なる質問フロー         |
| Builder                 | ApiIntegrator（API連携スキル構築）       | 認証方式・エンドポイント段階組立      |
| Topological Sort        | TaskGenerator（依存関係解決）            | DAGベースのタスク実行順序決定         |
| Chain of Responsibility | Validator（検証チェーン）                | 静的→動的→セキュリティ→完了条件の順序 |

#### 既存サービスとの責務境界

| サービス         | 既存責務                       | skill-creator との関係                   |
| ---------------- | ------------------------------ | ---------------------------------------- |
| SkillService     | スキルの一覧・インポート・削除 | skill-creator が生成後にimportを委譲     |
| SkillExecutor    | スキルの実行・ストリーミング   | skill-creator の debug/use が内部で利用  |
| SkillFileManager | スキルファイルの読み書き       | skill-creator が生成したファイルの永続化 |

**原則**: SkillCreatorService は「スキル生成・改善」に特化し、「スキル管理・実行」は既存サービスに委譲する。

---

### Task 2: ドメインモデリング

#### エンティティ定義

```typescript
// スキル生成仕様
interface SkillSpec {
  name: string; // スキル名（ハイフンケース）
  description: string; // スキル説明
  allowedTools: string[]; // 許可ツール一覧
  agents: AgentSpec[]; // サブエージェント定義
  references: ReferenceSpec[]; // 参照資料定義
  anchors: AnchorSpec[]; // Anchor定義（書籍・フレームワーク参照）
  triggers: string[]; // トリガーキーワード
}

// サブエージェント仕様
interface AgentSpec {
  filename: string; // agents/内のファイル名
  role: string; // エージェントの役割
  input: string; // 入力仕様
  output: string; // 出力仕様
  tools: string[]; // 使用可能ツール
}

// 参照資料仕様
interface ReferenceSpec {
  filename: string; // references/内のファイル名
  content: string; // 資料内容
  purpose: string; // 用途
}

// Anchor仕様
interface AnchorSpec {
  name: string; // 書籍・フレームワーク名
  application: string; // 適用範囲
  purpose: string; // 目的
}

// タスク仕様
interface TaskSpec {
  id: string; // タスクID
  title: string; // タスクタイトル
  phase: number; // フェーズ番号
  dependsOn: string[]; // 依存タスクID
  parallelWith: string[]; // 並列実行可能タスクID
  blocks: string[]; // ブロック対象タスクID
  status: TaskStatus; // ステータス
  priority: TaskPriority; // 優先度
  estimatedComplexity: TaskComplexity; // 推定規模
  tags: string[]; // タグ
  execution: ExecutionConfig; // 実行設定
  verification: VerificationConfig; // 検証設定
  artifacts: ArtifactConfig; // 成果物設定
}

type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked"
  | "failed";
type TaskPriority = "low" | "medium" | "high" | "critical";
type TaskComplexity = "small" | "medium" | "large" | "xlarge";

// 実行設定
interface ExecutionConfig {
  mode: "sequential" | "parallel";
  timeoutMinutes: number;
  retryCount: number;
  allowPartial: boolean;
}

// 検証設定
interface VerificationConfig {
  autoVerify: boolean;
  requireTests: boolean;
  requireTypecheck: boolean;
}

// 成果物設定
interface ArtifactConfig {
  creates: string[];
  modifies: string[];
}

// スキル改善結果
interface ImprovementSuggestion {
  category: "prompt" | "error-handling" | "performance" | "documentation";
  description: string;
  severity: "low" | "medium" | "high";
  autoFixable: boolean;
  diff?: string; // 自動修正時の差分
}

// タスク実行レポート
interface ExecutionReport {
  mode: "dry-run" | "execution";
  tasks?: string[][]; // ドライラン時: 実行順序グループ
  results?: TaskResult[]; // 実行時: 各タスク結果
  estimatedTime?: number; // ドライラン時: 推定時間(ms)
  summary?: ExecutionSummary; // 実行時: サマリー
}

// タスク実行結果
interface TaskResult {
  taskId: string;
  status: "completed" | "failed" | "skipped";
  duration: number; // 実行時間(ms)
  output?: string; // 成功時出力
  error?: string; // 失敗時エラー
}

// 実行サマリー
interface ExecutionSummary {
  totalTasks: number;
  completed: number;
  failed: number;
  skipped: number;
  totalDuration: number;
}

// スキルチェーン定義
interface SkillChainDefinition {
  name: string;
  description: string;
  steps: ChainStep[];
  errorHandling: "stop" | "skip" | "retry";
}

interface ChainStep {
  skillName: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
}

// 使用統計
interface SkillUsageStats {
  skillName: string;
  period: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number; // ms
  topTools: Array<{ tool: string; count: number }>;
  hourlyDistribution: Record<number, number>;
  errorTrends: Array<{ date: string; count: number }>;
}

// スケジュール設定
interface SkillScheduleConfig {
  skillName: string;
  scheduleType: "cron" | "interval" | "once" | "event";
  value: string; // cron式、インターバル、ISO日時、イベント名
  isEnabled: boolean;
  lastRun?: string; // ISO日時
  nextRun?: string; // ISO日時
}
```

#### エンティティ関係図

```
SkillCreatorService
│
├── createSkill() ──→ SkillSpec ──→ AgentSpec[]
│                              ├──→ ReferenceSpec[]
│                              └──→ AnchorSpec[]
│
├── createApiSkill() ──→ SkillSpec + API連携設定
│
├── improveSkill() ──→ ImprovementSuggestion[]
│
├── executeTasks() ──→ TaskSpec[] ──→ DependencyGraph ──→ ExecutionReport
│                                                    └──→ TaskResult[]
│
├── useSkill() ──→ SkillService.importSkills()
│
├── createChain() ──→ SkillChainDefinition
│
├── forkSkill() ──→ SkillSpec (コピー + メタデータ)
│
├── shareSkill() ──→ Gist URL / Import結果
│
├── scheduleSkill() ──→ SkillScheduleConfig
│
├── debugSkill() ──→ StepByStep実行結果
│
├── generateDocs() ──→ ドキュメントファイル
│
└── getStats() ──→ SkillUsageStats
```

---

### Task 3: IPC API設計

#### チャンネル定義

| チャンネル名        | 方向          | 対応FR | 説明                  |
| ------------------- | ------------- | ------ | --------------------- |
| `skill:create:chat` | Renderer→Main | FR-1   | 対話的スキル作成      |
| `skill:create:api`  | Renderer→Main | FR-2   | 外部API連携スキル生成 |
| `skill:improve`     | Renderer→Main | FR-3   | 既存スキル改善        |
| `skill:execute`     | Renderer→Main | FR-4   | タスク実行            |
| `skill:use`         | Renderer→Main | FR-5   | 即時使用              |
| `skill:chain`       | Renderer→Main | FR-6   | スキルチェーン作成    |
| `skill:fork`        | Renderer→Main | FR-7   | スキルフォーク        |
| `skill:share`       | Renderer→Main | FR-8   | スキル共有            |
| `skill:schedule`    | Renderer→Main | FR-9   | スケジュール設定      |
| `skill:debug`       | Renderer→Main | FR-10  | デバッグ実行          |
| `skill:docs`        | Renderer→Main | FR-11  | ドキュメント生成      |
| `skill:stats`       | Renderer→Main | FR-12  | 使用統計              |

#### リクエスト/レスポンス型

```typescript
// IPC_CHANNELS への追加定数
const SKILL_CREATOR_CHANNELS = {
  SKILL_CREATE_CHAT: "skill:create:chat",
  SKILL_CREATE_API: "skill:create:api",
  SKILL_IMPROVE: "skill:improve",
  SKILL_EXECUTE: "skill:execute",
  SKILL_USE: "skill:use",
  SKILL_CHAIN: "skill:chain",
  SKILL_FORK: "skill:fork",
  SKILL_SHARE: "skill:share",
  SKILL_SCHEDULE: "skill:schedule",
  SKILL_DEBUG: "skill:debug",
  SKILL_DOCS: "skill:docs",
  SKILL_STATS: "skill:stats",
} as const;

// skill:create:chat
// 引数: skillName: string, description: string
// 戻値: { success: true, data: { skillDir: string } } | { success: false, error: string }

// skill:create:api
// 引数: skillName: string, apiSpec: string (JSON文字列)
// 戻値: { success: true, data: { skillDir: string } } | { success: false, error: string }

// skill:improve
// 引数: skillName: string, autoApply: boolean
// 戻値: { success: true, data: { suggestions: ImprovementSuggestion[] } } | { success: false, error: string }

// skill:execute
// 引数: tasksDir: string, options: string (JSON: { parallel?: boolean, dryRun?: boolean })
// 戻値: { success: true, data: ExecutionReport } | { success: false, error: string }

// skill:use
// 引数: skillName: string
// 戻値: { success: true } | { success: false, error: string }

// skill:chain
// 引数: chainDescription: string
// 戻値: { success: true, data: { chainPath: string } } | { success: false, error: string }

// skill:fork
// 引数: sourceSkillName: string, newSkillName: string, options: string (JSON: ForkOptions)
// 戻値: { success: true, data: { skillDir: string } } | { success: false, error: string }

// skill:share
// 引数: action: 'export' | 'import', target: string, source: string
// 戻値: { success: true, data: { url?: string, skillDir?: string } } | { success: false, error: string }

// skill:schedule
// 引数: skillName: string, scheduleConfig: string (JSON: SkillScheduleConfig)
// 戻値: { success: true } | { success: false, error: string }

// skill:debug
// 引数: skillName: string, breakpointConfig: string (JSON: { breakpoint?: string, condition?: string })
// 戻値: { success: true, data: { steps: DebugStep[] } } | { success: false, error: string }

// skill:docs
// 引数: skillName: string, format: 'markdown' | 'html' | 'pdf', sections: string (JSON: string[])
// 戻値: { success: true, data: { outputPath: string } } | { success: false, error: string }

// skill:stats
// 引数: skillName: string (空文字列の場合は全スキル), period: string
// 戻値: { success: true, data: SkillUsageStats | SkillUsageStats[] } | { success: false, error: string }
```

#### IPCハンドラーバリデーション設計

全12チャンネルに共通で適用するバリデーション:

```typescript
// 共通バリデーションパターン（P42準拠3段バリデーション）
function validateStringArg(value: unknown, argName: string): string {
  if (typeof value !== "string") {
    throw { code: "VALIDATION_ERROR", message: `${argName} must be a string` };
  }
  if (value === "") {
    throw { code: "VALIDATION_ERROR", message: `${argName} must not be empty` };
  }
  if (value.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: `${argName} must not be whitespace only`,
    };
  }
  return value.trim();
}

// 全ハンドラーの先頭で実行
// 1. validateIpcSender(event, { ... }) — NFR-1-1
// 2. validateStringArg(引数) — NFR-1-2 (P42)
// 3. validatePath(パス引数) — NFR-1-3（パス引数がある場合のみ）
```

#### Preload API設計

```typescript
// preload/skill-creator-api.ts への追加
interface SkillCreatorAPI {
  createChat: (
    skillName: string,
    description: string,
  ) => Promise<{ skillDir: string }>;
  createApi: (
    skillName: string,
    apiSpec: string,
  ) => Promise<{ skillDir: string }>;
  improve: (
    skillName: string,
    autoApply: boolean,
  ) => Promise<{ suggestions: ImprovementSuggestion[] }>;
  execute: (
    tasksDir: string,
    options: { parallel?: boolean; dryRun?: boolean },
  ) => Promise<ExecutionReport>;
  use: (skillName: string) => Promise<void>;
  chain: (chainDescription: string) => Promise<{ chainPath: string }>;
  fork: (
    sourceSkillName: string,
    newSkillName: string,
    options: ForkOptions,
  ) => Promise<{ skillDir: string }>;
  share: (
    action: "export" | "import",
    target: string,
    source: string,
  ) => Promise<{ url?: string; skillDir?: string }>;
  schedule: (skillName: string, config: SkillScheduleConfig) => Promise<void>;
  debug: (
    skillName: string,
    config: DebugConfig,
  ) => Promise<{ steps: DebugStep[] }>;
  docs: (
    skillName: string,
    format: string,
    sections: string[],
  ) => Promise<{ outputPath: string }>;
  stats: (
    skillName: string,
    period: string,
  ) => Promise<SkillUsageStats | SkillUsageStats[]>;
}
```

---

### Task 4: Claude Agent SDK統合設計

#### query() API呼び出し設計

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

// スキル生成時のquery()呼び出し
async function generateSkillWithSDK(spec: SkillSpec): Promise<GeneratedSkill> {
  const result = await query({
    prompt: buildSkillGenerationPrompt(spec),
    systemPrompt: SKILL_GENERATOR_SYSTEM_PROMPT,
    tools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
    maxTurns: 30,
    permissionMode: "bypassPermissions",
  });
  return parseGeneratedSkill(result);
}

// タスク実行時のquery()呼び出し
async function executeTaskWithSDK(task: TaskSpec): Promise<TaskResult> {
  const result = await query({
    prompt: buildTaskExecutionPrompt(task),
    systemPrompt: TASK_EXECUTOR_SYSTEM_PROMPT,
    tools: task.allowedTools || ["Read", "Write", "Edit", "Bash"],
    maxTurns: 50,
    permissionMode: "default",
    hooks: {
      preToolUse: (toolCall) => validateToolUse(toolCall, task),
      postToolUse: (toolCall, result) =>
        verifyToolResult(toolCall, result, task),
    },
  });
  return { taskId: task.id, status: "completed", duration: 0, output: result };
}
```

#### Hooks設計

```typescript
// preToolUse: ツール使用前の検証
function validateToolUse(
  toolCall: ToolCall,
  task: TaskSpec,
): "approve" | "deny" | "modify" {
  // 1. 許可ツール一覧に含まれるか確認
  if (!task.allowedTools?.includes(toolCall.tool)) {
    return "deny";
  }

  // 2. 危険なコマンドの検出（Bashツールの場合）
  if (toolCall.tool === "Bash") {
    const command = toolCall.params.command;
    if (isDangerousCommand(command)) {
      return "deny";
    }
  }

  // 3. ファイル操作のパス検証（Write/Editツールの場合）
  if (["Write", "Edit"].includes(toolCall.tool)) {
    const filePath = toolCall.params.file_path;
    if (!isWithinAllowedPaths(filePath, task)) {
      return "deny";
    }
  }

  return "approve";
}

// postToolUse: ツール使用後の検証
function verifyToolResult(
  toolCall: ToolCall,
  result: ToolResult,
  task: TaskSpec,
): void {
  // 1. 成果物の生成確認
  if (toolCall.tool === "Write") {
    recordArtifact(toolCall.params.file_path, task);
  }

  // 2. エラーの検出と記録
  if (result.error) {
    recordError(toolCall, result.error, task);
  }
}
```

#### Permission制御設計

| PermissionMode      | 使用場面                                 | 理由                                         |
| ------------------- | ---------------------------------------- | -------------------------------------------- |
| `bypassPermissions` | スキル生成（ファイル作成が主体）         | ユーザーが明示的に生成を指示しているため     |
| `default`           | タスク実行（既存コード修正の可能性あり） | 既存ファイル変更は確認が必要な場合があるため |
| `plan`              | デバッグ実行（ステップバイステップ）     | 各ステップでユーザー確認を挟むため           |
| `acceptEdits`       | 既存スキル改善（--auto フラグ付き）      | ファイル編集を自動許可するため               |

---

## アーキテクチャ層別設計テーブル

| 層               | 設計内容                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer Process | ChatPanel統合 — `/skill-creator` コマンドをコマンドルーターで分岐、対話的ヒアリングはチャットUI上で実施                                                          |
| Main Process     | SkillCreatorService（Facadeパターン）— 5つのサブコンポーネント（HearingFacilitator, TaskGenerator, CodeGenerator, ApiIntegrator, Validator）に委譲               |
| IPC通信          | 12チャンネル定義（`skill:create:chat` 〜 `skill:stats`）、全チャンネルに3段バリデーション＋sender検証                                                            |
| Preload          | `SkillCreatorAPI` インターフェースを `contextBridge` 経由で公開、`safeInvoke` パターン準拠                                                                       |
| データ層         | スキルファイル: `~/.aiworkflow/skills/<name>/`、統計データ: JSON形式で `~/.aiworkflow/stats/` に保存、スケジュール: JSON形式で `~/.aiworkflow/schedules/` に保存 |

---

## 統合テスト連携【必須】

| 統合ポイント           | 契約定義                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| Renderer → IPC         | 12チャンネルの `safeInvoke` 呼び出し → Main Process ハンドラー受信      |
| IPC → Service          | ハンドラーから SkillCreatorService の各メソッドへの委譲                 |
| Service → FileSystem   | `fs.mkdir` / `fs.writeFile` による `~/.aiworkflow/skills/` への書き込み |
| Service → SDK          | `query()` API 呼び出し → スキル生成結果のパース                         |
| Service → SkillService | `importSkills()` / `removeSkill()` への委譲（use/fork時）               |
| エラーフロー           | Service例外 → IPC層でsanitize → Renderer で `{ success: false }` 受信   |

---

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                                                              |
| -------------- | --------------------------------------------------------------------- |
| 要件網羅性     | 12のFRが全てアーキテクチャ設計に反映されているか                      |
| IPC契約整合性  | チャンネル名・引数型・戻値型がPreload APIと一致しているか             |
| セキュリティ   | 全チャンネルにP42/P44/P45対策が設計に含まれているか                   |
| 既存整合性     | SkillService/SkillExecutor/SkillFileManagerとの責務境界が明確か       |
| DI設計         | Setter Injection が BrowserWindow 遅延生成に対応しているか（P34対策） |
| テスタビリティ | 各コンポーネントがモック可能なインターフェースで定義されているか      |
| SDK統合        | query() API、Hooks、Permission設計がSDK仕様に準拠しているか           |

---

## 成果物

| 成果物             | パス                                     | 説明                   |
| ------------------ | ---------------------------------------- | ---------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | レイヤー構成・パターン |
| ドメインモデル     | `outputs/phase-2/domain-model.md`        | エンティティ・型定義   |
| API設計            | `outputs/phase-2/api-design.md`          | IPC API仕様            |

---

## 完了条件

- [ ] アーキテクチャ構成（レイヤー図・コンポーネント構成）が定義されている
- [ ] 設計パターン（Facade, Setter Injection, Strategy, Builder, Topological Sort, Chain of Responsibility）の適用箇所が明記されている
- [ ] ドメインモデル（全エンティティ・型定義）が TypeScript インターフェースで記述されている
- [ ] 12チャンネルの IPC API（チャンネル名・引数型・戻値型）が設計されている
- [ ] 全ハンドラーのバリデーション設計（P42準拠3段バリデーション）が記載されている
- [ ] Preload API（SkillCreatorAPI インターフェース）が設計されている
- [ ] Claude Agent SDK 統合設計（query() API, Hooks, Permission制御）が記載されている
- [ ] 既存サービス（SkillService, SkillExecutor, SkillFileManager）との責務境界が定義されている
- [ ] 統合テスト連携の統合ポイント・契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 1成果物、Electronサービス設計、IPC契約チェックリスト）
2. レイヤー構成・コンポーネント構成の設計
3. 設計パターンの選定と適用箇所の決定
4. 既存サービスとの責務境界の定義
5. ドメインモデリング（全エンティティのTypeScript型定義）
6. IPC API設計（12チャンネル、リクエスト/レスポンス型）
7. Preload API設計（SkillCreatorAPIインターフェース）
8. Claude Agent SDK統合設計（query(), Hooks, Permission）
9. 統合テスト連携の実施
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜Task 4）を100%実行完了
- [ ] 各タスクの成果物が `outputs/phase-2/` に生成されている
- [ ] artifacts.json の phase-2 ステータスが更新されている

## 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 2
```

---

## 次のPhase

Phase 3: 設計レビューゲート（`phase-3-design-review.md`）
