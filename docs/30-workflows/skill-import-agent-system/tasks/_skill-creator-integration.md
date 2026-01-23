# skill-creator 統合仕様

## 概要

このドキュメントは、skill-creator スキルがタスク仕様書を解析・実行するための統合仕様を定義する。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                      skill-creator スキル                        │
├─────────────────────────────────────────────────────────────────┤
│  1. タスク仕様書を読み込む                                       │
│  2. 依存関係グラフを構築                                         │
│  3. 実行順序を決定（トポロジカルソート）                         │
│  4. 並列実行可能グループを特定                                   │
│  5. 各タスクを順次/並列実行                                      │
│  6. 検証条件をチェック                                           │
│  7. 完了ステータスを更新                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      タスク仕様書 (*.md)                         │
├─────────────────────────────────────────────────────────────────┤
│  - YAML Frontmatter: メタデータ、依存関係、設定                  │
│  - 実行手順: Step-by-Step の操作手順                            │
│  - 実装コード: 生成すべきコードテンプレート                      │
│  - 検証条件: 完了判定条件                                        │
└─────────────────────────────────────────────────────────────────┘
```

## 無限スキル量産フロー

```
┌──────────────────┐
│  ユーザー要求     │
│  「〇〇機能作って」│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────────────────────────┐
│  skill-creator   │────▶│  新規スキルのタスク仕様書を生成       │
│  (メタスキル)    │     │  docs/30-workflows/{skill-name}/tasks/│
└────────┬─────────┘     └──────────────────────────────────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────────────────────────┐
│  task-executor   │────▶│  タスク仕様書を順次実行               │
│  (実行エンジン)  │     │  依存順序に従い自動実装               │
└────────┬─────────┘     └──────────────────────────────────────┘
         │
         ▼
┌──────────────────┐
│  完成したスキル   │
│  ~/.claude/skills/│
└────────┬─────────┘
         │
         ▼ (このスキルが次の要求を処理)
┌──────────────────┐
│  新たな要求...    │ ──▶ 無限ループ
└──────────────────┘
```

## Frontmatter スキーマ

```yaml
# 必須フィールド
id: string # 一意識別子 (TASK-{PHASE}-{ID})
title: string # タスクタイトル
phase: number # フェーズ番号（実行優先度）
depends_on: string[] # 依存タスクID
status: enum # pending | in_progress | completed | blocked | failed

# オプションフィールド
parallel_with: string[] # 並列実行可能タスク
blocks: string[] # このタスクを待っているタスク
priority: enum # low | medium | high | critical
estimated_complexity: enum # small | medium | large | xlarge
tags: string[] # タグリスト

# 実行設定（オプション）
execution:
  mode: enum # sequential | parallel | interactive
  timeout_minutes: number # タイムアウト（デフォルト: 30）
  retry_count: number # リトライ回数（デフォルト: 2）
  allow_partial: boolean # 部分完了許可（デフォルト: false）

# 検証設定（オプション）
verification:
  auto_verify: boolean # 自動検証（デフォルト: true）
  require_tests: boolean # テスト必須（デフォルト: true）
  require_typecheck: boolean # 型チェック必須（デフォルト: true）

# 成果物（オプション）
artifacts:
  creates: string[] # 新規作成ファイル
  modifies: string[] # 修正ファイル
  deletes: string[] # 削除ファイル
```

## 実行プロトコル

### 1. タスク発見

```typescript
interface TaskDiscovery {
  // タスクディレクトリをスキャン
  scanTasks(dir: string): Promise<TaskSpec[]>;

  // 単一タスクを読み込み
  loadTask(path: string): Promise<TaskSpec>;

  // Frontmatter を解析
  parseFrontmatter(content: string): TaskMetadata;
}
```

### 2. 依存関係解決

```typescript
interface DependencyResolver {
  // 依存グラフを構築
  buildGraph(tasks: TaskSpec[]): DependencyGraph;

  // トポロジカルソートで実行順序を決定
  getExecutionOrder(graph: DependencyGraph): TaskSpec[][];

  // 循環依存を検出
  detectCycles(graph: DependencyGraph): string[][] | null;
}
```

### 3. タスク実行

```typescript
interface TaskExecutor {
  // 単一タスクを実行
  executeTask(task: TaskSpec): Promise<TaskResult>;

  // 並列グループを実行
  executeParallel(tasks: TaskSpec[]): Promise<TaskResult[]>;

  // 実行を中断
  abort(taskId: string): void;
}
```

### 4. 検証

```typescript
interface TaskVerifier {
  // 検証条件をチェック
  verify(task: TaskSpec): Promise<VerificationResult>;

  // テストを実行
  runTests(task: TaskSpec): Promise<TestResult>;

  // 型チェックを実行
  runTypeCheck(task: TaskSpec): Promise<TypeCheckResult>;
}
```

## skill-creator コマンド例

```bash
# タスク仕様書ディレクトリを指定して実行
/skill-creator execute ./docs/30-workflows/skill-import-agent-system/tasks/

# 特定タスクのみ実行
/skill-creator execute --task TASK-2-A

# 並列実行グループを自動検出して実行
/skill-creator execute --parallel-auto

# ドライラン（実行せず計画のみ表示）
/skill-creator execute --dry-run

# 新規スキルのタスク仕様書を生成
/skill-creator generate "チャット履歴エクスポート機能"
```

## タスク仕様書の解析ルール

### Step セクションの解析

````markdown
### Step 1: ファイル作成

**ツール**: Write

**操作**:

```typescript
// packages/shared/src/types/skill.ts
export interface SkillMetadata { ... }
```
````

**期待結果**: `packages/shared/src/types/skill.ts` が作成される

````

↓ 解析結果

```json
{
  "step": 1,
  "name": "ファイル作成",
  "tool": "Write",
  "operation": {
    "file_path": "packages/shared/src/types/skill.ts",
    "content": "export interface SkillMetadata { ... }"
  },
  "expected": "packages/shared/src/types/skill.ts が作成される"
}
````

### 検証条件の解析

````markdown
## 検証条件

### 必須条件

- [ ] 型定義ファイルが存在する
- [x] TypeScript コンパイルが通る

### 自動検証コマンド

```bash
pnpm --filter @repo/shared typecheck
```
````

````

↓ 解析結果

```json
{
  "conditions": [
    { "text": "型定義ファイルが存在する", "completed": false },
    { "text": "TypeScript コンパイルが通る", "completed": true }
  ],
  "commands": [
    "pnpm --filter @repo/shared typecheck"
  ]
}
````

## ステータス管理

### ステータス遷移

```
pending ──▶ in_progress ──▶ completed
   │             │
   │             ▼
   │          failed ──▶ pending (リトライ)
   │
   ▼
blocked (依存タスク未完了)
```

### ステータス更新

タスク実行後、skill-creator は自動的に Frontmatter の `status` を更新する：

```yaml
# 実行前
status: pending

# 実行後（成功）
status: completed

# 実行後（失敗）
status: failed
```

## エラーハンドリング

### リトライ戦略

```typescript
interface RetryStrategy {
  maxRetries: number; // 最大リトライ回数
  backoffMs: number; // リトライ間隔（ミリ秒）
  exponentialBackoff: boolean; // 指数バックオフ
}
```

### ロールバック

タスク失敗時、`artifacts.creates` で指定されたファイルを自動削除：

```yaml
artifacts:
  creates:
    - packages/shared/src/types/skill.ts # 失敗時に削除
```

## 次のステップ

1. **skill-creator スキルの実装** - このドキュメントに基づいて skill-creator を実装
2. **task-executor の実装** - タスク実行エンジンを実装
3. **検証エンジンの実装** - 自動検証機能を実装
4. **GitHub Issue 連携** - タスク ⇔ Issue の双方向同期
