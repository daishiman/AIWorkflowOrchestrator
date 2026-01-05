---
description: |
  GitHub Actionsワークフローテンプレートを作成するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actions専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [workflow-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: workflow template, GitHub Actions, CI/CD テンプレート
argument-hint: "[workflow-name]"
allowed-tools:
  - Task
model: sonnet
---

# ワークフローテンプレート作成

## 目的

`.claude/commands/ai/create-workflow-template.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: GitHub Actions専門エージェントの実行

**目的**: GitHub Actions専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: GitHub Actions専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/gha-workflow-architect.md`

Task ツールで `.claude/agents/gha-workflow-architect.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[workflow-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.github/workflow-templates/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-workflow-template [workflow-name]
```
