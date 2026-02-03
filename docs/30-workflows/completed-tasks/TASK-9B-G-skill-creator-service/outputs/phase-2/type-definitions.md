# TASK-9B-G 型定義設計書

## メタ情報

| 項目     | 値                                          |
| -------- | ------------------------------------------- |
| タスクID | TASK-9B-G                                   |
| 機能名   | skill-creator-service                       |
| Phase    | 2                                           |
| 作成日   | 2026-02-03                                  |
| 配置先   | `packages/shared/src/types/skillCreator.ts` |

---

## 1. 型定義一覧

### 1.1 モード・エンジン型

#### SkillCreatorMode

```typescript
/**
 * スキル作成モード
 * - collaborative: ユーザー対話型スキル共創（推奨）
 * - orchestrate: 実行エンジン選択モード
 * - create: 新規スキル作成
 * - update: 既存スキル更新
 * - improve-prompt: プロンプト改善
 */
export type SkillCreatorMode =
  | "collaborative"
  | "orchestrate"
  | "create"
  | "update"
  | "improve-prompt";
```

#### ExecutionEngine

```typescript
/**
 * 実行エンジン（orchestrateモード用）
 * - claude: Claude Codeで実行
 * - codex: OpenAI Codexで実行
 * - claude-to-codex: Claudeで設計→Codexで実行
 */
export type ExecutionEngine = "claude" | "codex" | "claude-to-codex";
```

---

### 1.2 スキル作成関連型

#### CreateSkillOptions

```typescript
/**
 * スキル作成オプション
 */
export interface CreateSkillOptions {
  /** スキル名（ディレクトリ名となる） */
  name: string;
  /** スキルの説明 */
  description: string;
  /** 作成モード */
  mode: SkillCreatorMode;
  /** 実行エンジン（orchestrateモード時） */
  executionEngine?: ExecutionEngine;
  /** タスク仕様書を生成するか */
  generateTasks?: boolean;
  /** インタビュー結果（collaborativeモード時） */
  interviewResult?: InterviewResult;
  /** ドメインモデル（collaborativeモード時） */
  domainModel?: DomainModel;
}
```

#### InterviewResult

```typescript
/**
 * インタビュー結果（collaborativeモード）
 * Phase 0-1〜0-8の結果を格納
 */
export interface InterviewResult {
  /** スキルの目的 */
  purpose: string;
  /** 提供する機能一覧 */
  features: string[];
  /** 入力データ定義 */
  inputs: string[];
  /** 出力データ定義 */
  outputs: string[];
  /** 外部API設定（オプション） */
  externalApis?: ExternalApiConfig[];
  /** 必要なツール一覧 */
  toolsNeeded: string[];
  /** 抽象度レベル（L1: 高, L2: 中, L3: 低） */
  abstractionLevel: "L1" | "L2" | "L3";
}
```

#### DomainModel

```typescript
/**
 * ドメインモデル（DDD設計用）
 * Phase 0.5で作成
 */
export interface DomainModel {
  /** コアドメイン定義 */
  coreDomain: string;
  /** エンティティ一覧 */
  entities: Entity[];
  /** 境界づけられたコンテキスト */
  boundedContexts: BoundedContext[];
  /** ユビキタス言語（用語辞書） */
  ubiquitousLanguage: Record<string, string>;
}
```

---

### 1.3 タスク実行関連型

#### ExecuteTasksOptions

```typescript
/**
 * タスク実行オプション
 */
export interface ExecuteTasksOptions {
  /** タスク仕様書のディレクトリパス */
  tasksDir: string;
  /** 並列実行を許可するか（デフォルト: false） */
  parallel?: boolean;
  /** ドライラン（実行せず計画のみ返す） */
  dryRun?: boolean;
  /** 最大実行ターン数 */
  maxTurns?: number;
}
```

#### ExecutionReport

```typescript
/**
 * 実行レポート
 */
export interface ExecutionReport {
  /** 実行モード */
  mode: "dry-run" | "execution";
  /** 実行順序（ドライラン時） */
  tasks?: string[][];
  /** 実行結果（実行時） */
  results?: TaskResult[];
  /** サマリー（実行時） */
  summary?: ExecutionSummary;
  /** 見積もり時間（分）（ドライラン時） */
  estimatedTime?: number;
}
```

#### TaskResult

```typescript
/**
 * タスク実行結果
 */
export interface TaskResult {
  /** タスクID */
  taskId: string;
  /** 実行ステータス */
  status: "completed" | "failed" | "skipped";
  /** 実行時間（ミリ秒） */
  duration: number;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 生成された成果物パス */
  artifacts?: string[];
}
```

#### ExecutionSummary

```typescript
/**
 * 実行サマリー
 */
export interface ExecutionSummary {
  /** 総タスク数 */
  total: number;
  /** 完了タスク数 */
  completed: number;
  /** 失敗タスク数 */
  failed: number;
  /** スキップタスク数 */
  skipped: number;
}
```

---

### 1.4 補助型

#### Entity

```typescript
/**
 * エンティティ定義（DDD）
 */
export interface Entity {
  /** エンティティ名 */
  name: string;
  /** 属性一覧 */
  attributes: string[];
}
```

#### BoundedContext

```typescript
/**
 * 境界づけられたコンテキスト（DDD）
 */
export interface BoundedContext {
  /** コンテキスト名 */
  name: string;
  /** 含まれるエンティティ名 */
  entities: string[];
}
```

#### ExternalApiConfig

```typescript
/**
 * 外部API設定
 */
export interface ExternalApiConfig {
  /** API名 */
  name: string;
  /** エンドポイントURL */
  endpoint: string;
  /** 認証タイプ */
  authType?: "apiKey" | "oauth" | "none";
}
```

---

### 1.5 内部型（サービス内部使用）

#### ScriptResult

```typescript
/**
 * スクリプト実行結果
 * ScriptExecutor.execute()の戻り値
 */
export interface ScriptResult {
  /** 実行成功フラグ（exitCode === 0） */
  success: boolean;
  /** 標準出力 */
  stdout: string;
  /** 標準エラー出力 */
  stderr: string;
  /** 終了コード */
  exitCode: number;
}
```

#### TaskSpec

```typescript
/**
 * タスク仕様（内部型）
 * タスク仕様書から抽出した情報
 */
export interface TaskSpec {
  /** タスクID */
  id: string;
  /** タスク内容 */
  content: string;
  /** 許可されたツール */
  allowedTools?: string[];
  /** 依存タスクID */
  depends_on?: string[];
}
```

#### DependencyGraph

```typescript
/**
 * 依存関係グラフ（内部型）
 * タスクIDをキーに、依存するタスク配列を値とするMap
 */
export type DependencyGraph = Map<string, TaskSpec[]>;
```

---

## 2. 型関係図

```
CreateSkillOptions
├── SkillCreatorMode
├── ExecutionEngine (optional)
├── InterviewResult (optional)
│   └── ExternalApiConfig[]
└── DomainModel (optional)
    ├── Entity[]
    └── BoundedContext[]

ExecuteTasksOptions
└── (primitives only)

ExecutionReport
├── TaskResult[]
└── ExecutionSummary

ScriptResult
└── (primitives only)

TaskSpec
└── (primitives only)

DependencyGraph = Map<string, TaskSpec[]>
```

---

## 3. エクスポート構成

```typescript
// packages/shared/src/types/skillCreator.ts

// モード・エンジン
export type { SkillCreatorMode, ExecutionEngine };

// スキル作成
export type { CreateSkillOptions, InterviewResult, DomainModel };

// タスク実行
export type {
  ExecuteTasksOptions,
  ExecutionReport,
  TaskResult,
  ExecutionSummary,
};

// 補助型
export type { Entity, BoundedContext, ExternalApiConfig };

// 内部型（サービス実装用）
export type { ScriptResult, TaskSpec, DependencyGraph };
```

---

## 4. 使用例

### 4.1 スキル作成

```typescript
import type {
  CreateSkillOptions,
  SkillCreatorMode,
} from "@repo/shared/types/skillCreator";

const options: CreateSkillOptions = {
  name: "my-skill",
  description: "A sample skill",
  mode: "collaborative" as SkillCreatorMode,
  generateTasks: true,
  interviewResult: {
    purpose: "Automate data processing",
    features: ["Data validation", "Data transformation"],
    inputs: ["CSV file"],
    outputs: ["JSON file"],
    toolsNeeded: ["Read", "Write", "Bash"],
    abstractionLevel: "L2",
  },
};
```

### 4.2 タスク実行

```typescript
import type {
  ExecuteTasksOptions,
  ExecutionReport,
} from "@repo/shared/types/skillCreator";

const options: ExecuteTasksOptions = {
  tasksDir: "docs/30-workflows/my-task",
  parallel: true,
  dryRun: false,
};

const report: ExecutionReport = await service.executeTasks(options);
// report.summary.completed, report.summary.failed 等で結果確認
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-02-03 | 初版作成 |
