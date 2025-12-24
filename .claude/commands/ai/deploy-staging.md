---
description: |
  ステージング環境へのデプロイを実行します。ビルド → テスト → デプロイ → ヘルスチェックのフローを自動化します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/devops-eng.md`: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 2で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: [--dry-run]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: deploy staging, staging deployment
argument-hint: "[--dry-run]"
allowed-tools:
  - Task
model: sonnet
---

# deploy-staging

## 目的

`.claude/commands/ai/deploy-staging.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）の実行

**目的**: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/devops-eng.md`

Task ツールで `.claude/agents/devops-eng.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[--dry-run]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `railway.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: GitHub Actionsワークフロー設計の専門家（Phase 2で起動）の実行

**目的**: GitHub Actionsワークフロー設計の専門家（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: GitHub Actionsワークフロー設計の専門家（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/gha-workflow-architect.md`

Task ツールで `.claude/agents/gha-workflow-architect.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[--dry-run]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `railway.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:deploy-staging [--dry-run]
```
