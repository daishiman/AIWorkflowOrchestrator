---
description: |
  GitHub Environmentsを使用してステージング・本番環境を設定します。環境変数管理、承認フロー、デプロイ履歴記録を構成します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/devops-eng.md`: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 2で起動）

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: environment, staging, production, deployment setup
allowed-tools:
  - Task
model: sonnet
---

# setup-deployment-environments

## 目的

`.claude/commands/ai/setup-deployment-environments.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）の実行

**目的**: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/devops-eng.md`

Task ツールで `.claude/agents/devops-eng.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/deployment.md`
- `.github/ENVIRONMENTS.md`
- `railway.json`
- `.env`
- `.env.example`

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

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/deployment.md`
- `.github/ENVIRONMENTS.md`
- `railway.json`
- `.env`
- `.env.example`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-deployment-environments
```
