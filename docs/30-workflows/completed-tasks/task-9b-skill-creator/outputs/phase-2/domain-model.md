# Phase 2 成果物: ドメインモデル

## メタ情報

| 項目       | 内容           |
| ---------- | -------------- |
| タスクID   | TASK-9B        |
| Phase      | 2              |
| 成果物     | ドメインモデル |
| 作成日     | 2026-02-26     |
| ステータス | 完了           |

## エンティティ定義（TypeScript インターフェース）

### コアエンティティ

```typescript
// スキル生成仕様
interface SkillSpec {
  name: string;
  description: string;
  allowedTools: string[];
  agents: AgentSpec[];
  references: ReferenceSpec[];
  anchors: AnchorSpec[];
  triggers: string[];
}

// サブエージェント仕様
interface AgentSpec {
  filename: string;
  role: string;
  input: string;
  output: string;
  tools: string[];
}

// 参照資料仕様
interface ReferenceSpec {
  filename: string;
  content: string;
  purpose: string;
}

// Anchor仕様
interface AnchorSpec {
  name: string;
  application: string;
  purpose: string;
}
```

### タスク実行ドメイン

```typescript
// タスク仕様
interface TaskSpec {
  id: string;
  title: string;
  phase: number;
  dependsOn: string[];
  parallelWith: string[];
  blocks: string[];
  status: TaskStatus;
  priority: TaskPriority;
  estimatedComplexity: TaskComplexity;
  tags: string[];
  execution: ExecutionConfig;
  verification: VerificationConfig;
  artifacts: ArtifactConfig;
}

type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked"
  | "failed";
type TaskPriority = "low" | "medium" | "high" | "critical";
type TaskComplexity = "small" | "medium" | "large" | "xlarge";

interface ExecutionConfig {
  mode: "sequential" | "parallel";
  timeoutMinutes: number;
  retryCount: number;
  allowPartial: boolean;
}

interface VerificationConfig {
  autoVerify: boolean;
  requireTests: boolean;
  requireTypecheck: boolean;
}

interface ArtifactConfig {
  creates: string[];
  modifies: string[];
}
```

### 改善ドメイン

```typescript
interface ImprovementSuggestion {
  category: "prompt" | "error-handling" | "performance" | "documentation";
  description: string;
  severity: "low" | "medium" | "high";
  autoFixable: boolean;
  diff?: string;
}

// FR-3 improve コマンド用の入出力型
interface ImproveOptions {
  skillName: string;
  autoApply: boolean;
}

interface ImproveResult {
  suggestions: ImprovementSuggestion[];
  appliedCount?: number;
}
```

### 実行レポートドメイン

```typescript
interface ExecutionReport {
  mode: "dry-run" | "execution";
  tasks?: string[][];
  results?: TaskResult[];
  estimatedTime?: number;
  summary?: ExecutionSummary;
}

interface TaskResult {
  taskId: string;
  status: "completed" | "failed" | "skipped";
  duration: number;
  output?: string;
  error?: string;
}

interface ExecutionSummary {
  totalTasks: number;
  completed: number;
  failed: number;
  skipped: number;
  totalDuration: number;
}
```

### チェーンドメイン

```typescript
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
```

### フォークドメイン

```typescript
interface ForkOptions {
  copyAgents: boolean;
  copyReferences: boolean;
  copyScripts: boolean;
  modifyTools: boolean;
}
```

### 共有ドメイン

```typescript
type ExportFormat = "gist" | "github";
type ImportSource = "gist" | "github" | "url" | "local";
```

### スケジュールドメイン

```typescript
interface SkillScheduleConfig {
  skillName: string;
  scheduleType: "cron" | "interval" | "once" | "event";
  value: string;
  isEnabled: boolean;
  lastRun?: string;
  nextRun?: string;
}
```

### デバッグドメイン

```typescript
interface DebugOptions {
  skillName: string;
  breakpoint?: string;
  condition?: string;
}

interface DebugResult {
  steps: DebugStep[];
}

interface DebugStep {
  stepNumber: number;
  toolName: string;
  input: Record<string, unknown>;
  output: string;
  duration: number;
  hitBreakpoint: boolean;
}
```

### 統計ドメイン

```typescript
interface SkillUsageStats {
  skillName: string;
  period: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  topTools: Array<{ tool: string; count: number }>;
  hourlyDistribution: Record<number, number>;
  errorTrends: Array<{ date: string; count: number }>;
}
```

## エンティティ関係図

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
├── debugSkill() ──→ DebugResult
│
├── generateDocs() ──→ ドキュメントファイル
│
└── getStats() ──→ SkillUsageStats
```
