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

### 変更コンテキストマップ（changeContextMap）

双方向同期における無限ループを防止するためのパターン。
変更の発生元と方向を追跡し、TTL（Time-To-Live）による自動クリーンアップで
循環的な同期トリガーを防ぐ。

```typescript
// 変更コンテキストの型定義
interface ChangeContext {
  direction: "forward" | "reverse"; // 同期方向
  timestamp: number; // 変更発生時刻
  triggeredBy: string; // 発生元ファイル
}

// 変更コンテキストマップ
const changeContextMap = new Map<string, ChangeContext>();

// TTL設定（ミリ秒）
const CHANGE_CONTEXT_TTL = 1000;

// 無限ループ防止の実装例
function shouldTriggerSync(
  filePath: string,
  direction: "forward" | "reverse",
): boolean {
  const context = changeContextMap.get(filePath);
  const now = Date.now();

  // コンテキストがある場合、TTL内で逆方向の変更なら同期をスキップ
  if (context) {
    const isWithinTTL = now - context.timestamp < CHANGE_CONTEXT_TTL;
    const isReverseDirection = context.direction !== direction;

    if (isWithinTTL && isReverseDirection) {
      return false; // 無限ループ防止：同期をスキップ
    }
  }

  // 新しいコンテキストを登録
  changeContextMap.set(filePath, {
    direction,
    timestamp: now,
    triggeredBy: filePath,
  });

  return true; // 同期を実行
}

// 定期的なクリーンアップ
setInterval(() => {
  const now = Date.now();
  for (const [key, context] of changeContextMap.entries()) {
    if (now - context.timestamp > CHANGE_CONTEXT_TTL) {
      changeContextMap.delete(key);
    }
  }
}, CHANGE_CONTEXT_TTL);
```

**適用場面**:

- 双方向ファイル同期（例：index.html ↔ structure.md）
- リアルタイムコラボレーション機能
- キャッシュ同期システム

**設計ポイント**:

| 項目               | 推奨値    | 説明                             |
| ------------------ | --------- | -------------------------------- |
| TTL                | 1000ms    | 同期処理完了を待つ十分な時間     |
| クリーンアップ間隔 | TTLと同値 | メモリリーク防止                 |
| 方向追跡           | 必須      | 逆方向の変更を識別するために必要 |

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
