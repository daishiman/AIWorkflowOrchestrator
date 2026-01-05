---
description: |
  GitHub Pull Requestのマージを安全に実行するシンプルなコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/devops-eng.md`: PRマージ支援

  ⚙️ このコマンドの設定:
  - argument-hint: [pr-number]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: merge pr, pull request merge, マージ, PR承認, レビュー完了
argument-hint: "[pr-number]"
allowed-tools:
  - Task
model: sonnet
---

# Pull Requestマージ

## 目的

`.claude/commands/ai/merge-pr.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: PRマージ支援の実行

**目的**: PRマージ支援に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: PRマージ支援の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/devops-eng.md`

Task ツールで `.claude/agents/devops-eng.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[pr-number]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/merge-pr.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:merge-pr [pr-number]
```
