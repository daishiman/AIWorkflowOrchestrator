# マルチエージェントシステム - 実装パターン

## 概要

マルチエージェントシステムにおける設計パターンと実装戦略。
協調パターンの詳細は `collaboration-patterns.md` を参照。

## エージェント定義パターン

### 基本構造

```yaml
---
name: data-processor
description: |
  データ処理を担当するエージェント。

  🔴 入力:
  - raw-data.json: 生データファイル

  🔴 出力:
  - processed-data.json: 処理済みデータ
  - processing-report.md: 処理レポート

tools:
  - Read
  - Write
  - Bash
---
```

### 専門性の明確化

```yaml
description: |
  セキュリティ分析を担当するエージェント。

  🔴 専門領域:
  - 脆弱性スキャン
  - 依存関係の安全性検証
  - OWASP Top 10 チェック

  🔴 使用しない領域:
  - パフォーマンス分析
  - スタイルチェック
```

## ハンドオフ実装パターン

### 標準ハンドオフ

```json
{
  "handoff": {
    "from_agent": "analyzer",
    "to_agent": "implementer",
    "timestamp": "2025-01-02T10:30:00Z",
    "status": "completed",
    "artifacts": [".claude/temp/analysis-result.json"],
    "context": {
      "priority": "high",
      "deadline": "2025-01-03T18:00:00Z"
    },
    "next_steps": ["分析結果に基づいて実装", "テストケース追加"]
  }
}
```

### 条件付きハンドオフ

```json
{
  "handoff": {
    "from_agent": "validator",
    "status": "conditional",
    "conditions": [
      {
        "if": "errors_count == 0",
        "to_agent": "deployer"
      },
      {
        "if": "errors_count < 5",
        "to_agent": "fixer"
      },
      {
        "else": true,
        "to_agent": "reviewer"
      }
    ]
  }
}
```

## オーケストレーションパターン

### シンプルオーケストレーター

```yaml
---
name: simple-orchestrator
description: |
  シンプルなタスクオーケストレーション。

  🔴 ワークフロー:
  1. analyzer: 入力分析
  2. processor: データ処理
  3. validator: 結果検証

tools:
  - Task
---
```

### 並行オーケストレーター

```yaml
---
name: parallel-orchestrator
description: |
  並行処理オーケストレーション。

  🔴 並行実行:
  - security-checker: セキュリティチェック
  - performance-tester: パフォーマンステスト
  - style-checker: スタイルチェック

  🔴 統合:
  - result-aggregator: 結果統合

tools:
  - Task
---
```

## エラーハンドリングパターン

### リトライパターン

```typescript
const retryConfig = {
  maxAttempts: 3,
  backoffMs: 1000,
  backoffMultiplier: 2,
  retryableErrors: ["TimeoutError", "NetworkError"],
};
```

### サーキットブレーカー

```typescript
const circuitBreaker = {
  failureThreshold: 5,
  recoveryTimeout: 30000,
  halfOpenRequests: 3,
  states: ["CLOSED", "OPEN", "HALF_OPEN"],
};
```

### フォールバックチェーン

```yaml
fallback_chain:
  - primary: gpt-4-agent
    fallback: claude-agent
  - primary: claude-agent
    fallback: local-agent
  - primary: local-agent
    fallback: manual-review
```

## 状態管理パターン

### 共有状態

```json
{
  "workflow_state": {
    "id": "workflow-123",
    "current_phase": "processing",
    "completed_agents": ["analyzer"],
    "pending_agents": ["processor", "validator"],
    "shared_data": {
      "input_file": "data.json",
      "config": {}
    }
  }
}
```

### イベントソーシング

```typescript
const events = [
  { type: "WorkflowStarted", timestamp: "...", data: {} },
  { type: "AgentCompleted", agent: "analyzer", result: {} },
  { type: "HandoffInitiated", from: "analyzer", to: "processor" },
  { type: "AgentCompleted", agent: "processor", result: {} },
];
```

## 終了条件パターン

### フィードバックループ終了条件

```yaml
termination:
  max_iterations: 10
  convergence_threshold: 0.95
  timeout_minutes: 30
  conditions:
    - type: quality_threshold
      metric: test_coverage
      value: 80
    - type: consensus
      required_agents: ["reviewer-1", "reviewer-2"]
```

### タイムアウト設定

```yaml
timeouts:
  agent_execution: 300000 # 5分
  handoff_wait: 60000 # 1分
  total_workflow: 3600000 # 1時間
```

## モニタリングパターン

### 進捗追跡

```json
{
  "workflow_progress": {
    "total_agents": 5,
    "completed": 2,
    "in_progress": 1,
    "pending": 2,
    "percentage": 40
  }
}
```

### メトリクス収集

```typescript
const metrics = {
  agent_execution_time_ms: {},
  handoff_latency_ms: {},
  error_count: {},
  retry_count: {},
};
```

## アンチパターン

| パターン            | 問題                       | 解決策               |
| ------------------- | -------------------------- | -------------------- |
| God Agent           | 単一エージェントに責務集中 | 責務分割、専門化     |
| Chatty Agents       | 過剰な通信                 | バッチ処理、非同期化 |
| Circular Handoff    | 循環依存                   | 依存グラフ検証       |
| Missing Termination | 無限ループ                 | 終了条件の明示       |
| Implicit Dependency | 暗黙の依存                 | 明示的な依存宣言     |

## チェックリスト

### 設計時

- [ ] 各エージェントの責務は明確か
- [ ] ハンドオフプロトコルは標準化されているか
- [ ] 依存関係に循環がないか
- [ ] 終了条件は明示されているか

### 実装時

- [ ] エラーハンドリングは実装されているか
- [ ] タイムアウトは設定されているか
- [ ] リトライ戦略は定義されているか
- [ ] モニタリングは組み込まれているか

### 運用時

- [ ] 進捗追跡は可能か
- [ ] エラー通知は設定されているか
- [ ] パフォーマンスメトリクスは収集されているか
