# 実行パターン

> **読み込み条件**: ワークフロー設計時、タスク構成決定時
> **相対パス**: `references/execution-patterns.md`

---

## 概要

スキル内のタスク実行パターン。直列、並列、条件分岐、ループなどのパターンと組み合わせ方。

---

## 1. 基本パターン

### 1.1 Sequential (直列)

```
Task A → Task B → Task C
```

**特徴**:
- 順番に実行
- 前のタスクの出力が次の入力
- 依存関係が明確

**使用場面**:
- データの段階的変換
- 検証→生成→出力の流れ

**JSON定義**:
```json
{
  "pattern": "sequential",
  "tasks": [
    { "name": "task-a", "dependsOn": [] },
    { "name": "task-b", "dependsOn": ["task-a"] },
    { "name": "task-c", "dependsOn": ["task-b"] }
  ]
}
```

### 1.2 Parallel (並列)

```
      ┌─ Task A ─┐
Start ├─ Task B ─┼─ Sync
      └─ Task C ─┘
```

**特徴**:
- 独立したタスクを同時実行
- 同期ポイントで結果を集約
- 実行時間短縮

**使用場面**:
- 複数の独立した分析
- 並列データ取得
- 独立した検証

**JSON定義**:
```json
{
  "pattern": "parallel",
  "parallelGroups": [
    {
      "name": "analysis-group",
      "tasks": ["task-a", "task-b", "task-c"],
      "syncPoint": "aggregate-task"
    }
  ]
}
```

### 1.3 Conditional (条件分岐)

```
         ┌─ Task B (条件A)
Task A ──┤
         └─ Task C (条件B)
```

**特徴**:
- 条件に基づいて分岐
- 排他的または並行可能
- 動的なワークフロー

**使用場面**:
- タイプ別処理
- エラーハンドリング
- モード別実行

**JSON定義**:
```json
{
  "pattern": "conditional",
  "tasks": [
    {
      "name": "task-b",
      "condition": "type === 'api-client'",
      "dependsOn": ["task-a"]
    },
    {
      "name": "task-c",
      "condition": "type === 'git-ops'",
      "dependsOn": ["task-a"]
    }
  ]
}
```

### 1.4 Loop (ループ)

```
         ┌───────┐
         ▼       │
Start → Task A ──┴─ (条件満たすまで) → End
```

**特徴**:
- 条件を満たすまで繰り返し
- イテレーション処理
- 収束型処理

**使用場面**:
- バッチ処理
- リトライ処理
- 品質改善ループ

**JSON定義**:
```json
{
  "pattern": "loop",
  "tasks": [
    {
      "name": "task-a",
      "executionPattern": "loop",
      "loopCondition": "quality < 0.9",
      "maxIterations": 5
    }
  ]
}
```

### 1.5 Aggregation (集約)

```
Task A ─┐
Task B ─┼─ Aggregate → Task D
Task C ─┘
```

**特徴**:
- 複数の結果を1つに集約
- データマージ
- 統合処理

**使用場面**:
- 並列結果の統合
- 複数ソースのマージ
- レポート生成

**JSON定義**:
```json
{
  "tasks": [
    {
      "name": "aggregate-task",
      "executionPattern": "agg",
      "dependsOn": ["task-a", "task-b", "task-c"],
      "aggregation": {
        "strategy": "merge",
        "conflictResolution": "latest"
      }
    }
  ]
}
```

---

## 2. 複合パターン

### 2.1 Phase-based (フェーズベース)

```
Phase 1 (分析)        Phase 2 (設計)        Phase 3 (生成)
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Task A (llm)│      │ Task C (llm)│      │ Task E (scr)│
│ Task B (llm)│  →   │ [validate]  │  →   │ Task F (scr)│
└─────────────┘      └─────────────┘      │ [validate]  │
                                          └─────────────┘
```

**特徴**:
- LLM Task と Script Task を明確に分離
- フェーズ単位で進行
- 検証ゲートを設置

**JSON定義**:
```json
{
  "pattern": "phase-based",
  "phases": [
    {
      "name": "Phase 1: 分析",
      "type": "llm",
      "tasks": ["analyze-request", "extract-purpose"]
    },
    {
      "name": "Phase 2: 設計",
      "type": "mixed",
      "tasks": ["design-workflow", "validate-workflow"]
    },
    {
      "name": "Phase 3: 生成",
      "type": "script",
      "tasks": ["generate-files", "validate-all"]
    }
  ]
}
```

### 2.2 Pipeline (パイプライン)

```
Input → Transform A → Transform B → Transform C → Output
         (script)      (script)      (script)
```

**特徴**:
- 決定論的な変換チェーン
- 中間出力を次に渡す
- Script Taskの連鎖

**使用場面**:
- データ変換パイプライン
- ビルドプロセス
- 検証チェーン

### 2.3 Fork-Join (分岐-合流)

```
        ┌─ Process A ─┐
        │             │
Input ──┼─ Process B ─┼─ Merge → Output
        │             │
        └─ Process C ─┘
```

**特徴**:
- 並列処理後に結果を統合
- 独立した処理の並列化
- 結果の一貫性確保

---

## 3. パターン選定ガイド

### 3.1 判断フローチャート

```
要件分析
    │
    ├─ タスク間に依存関係あり?
    │   ├─ Yes → Sequential または Phase-based
    │   └─ No  → Parallel 検討
    │
    ├─ 条件による分岐が必要?
    │   ├─ Yes → Conditional
    │   └─ No  → 次へ
    │
    ├─ 繰り返し処理が必要?
    │   ├─ Yes → Loop
    │   └─ No  → 次へ
    │
    ├─ 複数結果の統合が必要?
    │   ├─ Yes → Aggregation
    │   └─ No  → 次へ
    │
    └─ LLM/Script の分離が明確?
        ├─ Yes → Phase-based
        └─ No  → Sequential
```

### 3.2 パターン×ユースケース

| ユースケース | 推奨パターン |
|--------------|--------------|
| 新規スキル作成 | Phase-based |
| スキル更新 | Sequential + Conditional |
| バッチ処理 | Loop または Parallel |
| 検証チェーン | Pipeline |
| 複数API呼び出し | Parallel + Aggregation |
| エラーリカバリ | Conditional + Loop |

---

## 4. タスクタイプとの組み合わせ

### 4.1 LLM Task のパターン

| パターン | 適合度 | 理由 |
|----------|--------|------|
| Sequential | ◎ | 段階的な思考 |
| Parallel | ○ | 独立した分析 |
| Conditional | ○ | 判断による分岐 |
| Loop | △ | トークン消費大 |

### 4.2 Script Task のパターン

| パターン | 適合度 | 理由 |
|----------|--------|------|
| Sequential | ◎ | 依存関係明確 |
| Parallel | ◎ | 独立処理の並列化 |
| Loop | ◎ | バッチ処理に最適 |
| Pipeline | ◎ | 変換チェーン |

---

## 5. 実装例

### 5.1 Phase-based の実装

```json
{
  "skillName": "my-skill",
  "pattern": "phase-based",
  "phases": [
    {
      "name": "Phase 1: 要件分析",
      "type": "llm",
      "tasks": [
        {
          "name": "analyze-requirement",
          "type": "llm",
          "executionPattern": "seq",
          "agent": "agents/analyze-requirement.md"
        }
      ]
    },
    {
      "name": "Phase 2: 設計",
      "type": "mixed",
      "tasks": [
        {
          "name": "design-script",
          "type": "llm",
          "executionPattern": "seq",
          "agent": "agents/design-script.md"
        },
        {
          "name": "validate-design",
          "type": "script",
          "executionPattern": "seq",
          "script": "scripts/validate_schema.mjs"
        }
      ]
    },
    {
      "name": "Phase 3: 生成",
      "type": "script",
      "tasks": [
        {
          "name": "generate-code",
          "type": "script",
          "executionPattern": "seq",
          "script": "scripts/generate_dynamic_code.mjs"
        },
        {
          "name": "validate-output",
          "type": "script",
          "executionPattern": "seq",
          "script": "scripts/validate_all.mjs"
        }
      ]
    }
  ]
}
```

### 5.2 Parallel + Aggregation の実装

```json
{
  "parallelGroups": [
    {
      "name": "parallel-analysis",
      "tasks": [
        { "name": "analyze-structure", "type": "llm" },
        { "name": "analyze-dependencies", "type": "script" },
        { "name": "analyze-patterns", "type": "llm" }
      ],
      "syncPoint": "aggregate-analysis"
    }
  ],
  "tasks": [
    {
      "name": "aggregate-analysis",
      "type": "script",
      "executionPattern": "agg",
      "dependsOn": ["analyze-structure", "analyze-dependencies", "analyze-patterns"],
      "script": "scripts/aggregate_results.mjs"
    }
  ]
}
```

---

## 6. 必要最小限のリソース決定

### 6.1 パターン別必要リソース

| パターン | 必要エージェント | 必要スクリプト | 必要スキーマ |
|----------|------------------|----------------|--------------|
| Sequential (LLM) | 各タスク分 | 検証のみ | 出力検証用 |
| Sequential (Script) | 0 | 各タスク分 | 入出力用 |
| Parallel | 並列タスク分 | 集約用 | 各タスク用 |
| Conditional | 分岐パス分 | 条件判定用 | 各パス用 |
| Phase-based | LLMフェーズ分 | Scriptフェーズ分 | 各フェーズ用 |

### 6.2 最小構成の判断

```
目的分析
    │
    ├─ 単純な変換? → Script 1つ + スキーマ 1つ
    │
    ├─ 判断が必要? → Agent 1つ + 検証Script + スキーマ
    │
    ├─ 複数ステップ? → Phase-based構成
    │   ├─ LLMフェーズ数 → Agent数
    │   └─ Scriptフェーズ数 → Script数
    │
    └─ 複雑なワークフロー? → 完全構成
        ├─ agents/: LLMタスク分
        ├─ scripts/: Scriptタスク分 + 検証
        ├─ schemas/: 入出力定義分
        └─ references/: 必要に応じて
```

---

## 関連リソース

- **ワークフローパターン**: See [workflow-patterns.md](workflow-patterns.md)
- **タスク設計**: See [../agents/design-workflow.md](../agents/design-workflow.md)
