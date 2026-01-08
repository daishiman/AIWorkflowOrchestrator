---
description: |
  監視・アラートシステムの設計と設定。 SLO/SLI定義、ダッシュボード構築、アラートルール設定を含む包括的な監視基盤を構築します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/sre-observer.md`: ロギング・監視設計専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [service-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: monitoring, alert, slo, sli, dashboard, observability
argument-hint: "[service-name]"
allowed-tools:
  - Task
model: sonnet
---

# 監視・アラート設定コマンド

## 目的

`.claude/commands/ai/setup-monitoring.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ロギング・監視設計専門エージェントの実行

**目的**: ロギング・監視設計専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ロギング・監視設計専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sre-observer.md`

Task ツールで `.claude/agents/sre-observer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[service-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/observability/`
- `docs/00-requirements/master_system_design.md`
- `docs/observability/slo-sli.md`
- `docs/observability/dashboard-design.md`
- `docs/observability/runbook.md`
- `package.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-monitoring [service-name]
```
