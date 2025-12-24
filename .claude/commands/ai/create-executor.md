---
description: |
  新しいワークフロー機能のExecutor実装を作成する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/logic-dev.md`: ビジネスロジック実装専門エージェント（Phase 2で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: [workflow-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: executor, workflow, ビジネスロジック, 機能実装
argument-hint: "[workflow-name]"
allowed-tools:
  - Task
model: opus
---

# Executor実装コマンド

## 目的

`.claude/commands/ai/create-executor.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ビジネスロジック実装専門エージェント（Phase 2で起動）の実行

**目的**: ビジネスロジック実装専門エージェント（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ビジネスロジック実装専門エージェント（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[workflow-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/`
- `docs/00-requirements/master_system_design.md`
- `docs/20-specifications/features/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-executor [workflow-name]
```
