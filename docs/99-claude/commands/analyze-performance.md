---
description: |
  パフォーマンス分析とボトルネック特定を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/router-dev.md`: フロントエンドパフォーマンス分析
  - `.claude/agents/logic-dev.md`: バックエンドロジック分析
  - `.claude/agents/dba-mgr.md`: クエリパフォーマンス分析

  ⚙️ このコマンドの設定:
  - argument-hint: [target]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: performance, analyze performance, パフォーマンス分析, ボトルネック
argument-hint: "[target]"
allowed-tools:
  - Task
model: opus
---

# パフォーマンス分析

## 目的

`.claude/commands/ai/analyze-performance.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: フロントエンドパフォーマンス分析の実行

**目的**: フロントエンドパフォーマンス分析に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: フロントエンドパフォーマンス分析の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/router-dev.md`

Task ツールで `.claude/agents/router-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/performance/analysis-report.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: バックエンドロジック分析の実行

**目的**: バックエンドロジック分析に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: バックエンドロジック分析の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/performance/analysis-report.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: クエリパフォーマンス分析の実行

**目的**: クエリパフォーマンス分析に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: クエリパフォーマンス分析の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dba-mgr.md`

Task ツールで `.claude/agents/dba-mgr.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/performance/analysis-report.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:analyze-performance [target]
```
