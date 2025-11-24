# Orchestrator-Worker Pattern Template

## 概要

オーケストレーター・ワーカーパターンは、上位エージェント（オーケストレーター）が
複数の下位エージェント（ワーカー）にタスクを委譲する構造です。

## テンプレート構造

```yaml
---
name: {{orchestrator_name}}
description: |
  {{orchestrator_description}}

  🔴 このエージェント起動時の必須アクション:
  以下のワーカーエージェントを利用可能にしてください:
  - {{worker_1_name}}
  - {{worker_2_name}}
  - {{worker_3_name}}

tools: [Task, Read, Grep]
model: {{model}}
version: 1.0.0
---

# {{orchestrator_name}}

## 役割

{{role_description}}

## ワークフロー

### Phase 1: タスク分析

**実施内容**:
1. 要求の理解
2. サブタスクへの分解
3. ワーカー割り当て

### Phase 2: 委譲

**実施内容**:
1. {{worker_1_name}}へタスク委譲
2. {{worker_2_name}}へタスク委譲
3. {{worker_3_name}}へタスク委譲

### Phase 3: 統合

**実施内容**:
1. ワーカー結果の収集
2. 結果の統合
3. 最終成果物の生成

## ワーカーエージェント

### {{worker_1_name}}
- **役割**: {{worker_1_role}}
- **ツール**: {{worker_1_tools}}

### {{worker_2_name}}
- **役割**: {{worker_2_role}}
- **ツール**: {{worker_2_tools}}

### {{worker_3_name}}
- **役割**: {{worker_3_role}}
- **ツール**: {{worker_3_tools}}

## ベストプラクティス

✅ **すべきこと**:
- ワーカーの責任範囲を明確に定義
- ハンドオフプロトコルを標準化
- エラーハンドリングを実装

❌ **避けるべきこと**:
- ワーカー間の直接通信
- 循環依存の作成
- オーケストレーターへの過度な実装ロジック
```

## 変数一覧

| 変数 | 説明 | 例 |
|------|------|------|
| `{{orchestrator_name}}` | オーケストレーター名 | `code-review-orchestrator` |
| `{{orchestrator_description}}` | オーケストレーターの説明 | `コードレビューを調整` |
| `{{model}}` | 使用モデル | `sonnet` |
| `{{worker_1_name}}` | ワーカー1の名前 | `style-checker` |
| `{{worker_1_role}}` | ワーカー1の役割 | `スタイルガイド遵守チェック` |
| `{{worker_1_tools}}` | ワーカー1のツール | `[Read, Grep]` |

## 使用例

```yaml
---
name: code-review-orchestrator
description: |
  コードレビューを調整し、複数のワーカーエージェントに
  レビュータスクを委譲するオーケストレーター。

  🔴 このエージェント起動時の必須アクション:
  以下のワーカーエージェントを利用可能にしてください:
  - style-checker
  - security-analyzer
  - performance-profiler

tools: [Task, Read, Grep]
model: sonnet
version: 1.0.0
---
```
