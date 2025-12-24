---
description: |
  Gitワークフローとブランチ戦略（git-flow/github-flow/trunk-based）を確立するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/hook-master.md`: Claude Code Hooks実装・Git Hooks設計専門

  ⚙️ このコマンドの設定:
  - argument-hint: [strategy]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: git workflow, branch strategy, git-flow, github-flow, hooks, automation
argument-hint: "[strategy]"
allowed-tools:
  - Task
model: sonnet
---

# Git Workflow 初期化コマンド

## 目的

`.claude/commands/ai/init-git-workflow.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Claude Code Hooks実装・Git Hooks設計専門の実行

**目的**: Claude Code Hooks実装・Git Hooks設計専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Claude Code Hooks実装・Git Hooks設計専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/hook-master.md`

Task ツールで `.claude/agents/hook-master.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[strategy]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/hooks/`
- `.claude/settings.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:init-git-workflow [strategy]
```
