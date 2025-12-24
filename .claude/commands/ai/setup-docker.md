---
description: |
  Dockerコンテナ化の設定を作成します。 Dockerfile、docker-compose.yml、マルチステージビルド、ベストプラクティスを適用します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/devops-eng.md`: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: service-name
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: docker, container, dockerfile, docker-compose
argument-hint: "service-name"
allowed-tools:
  - Task
model: sonnet
---

# setup-docker

## 目的

`.claude/commands/ai/setup-docker.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）の実行

**目的**: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/devops-eng.md`

Task ツールで `.claude/agents/devops-eng.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（service-name）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/docker.md`
- `package.json`
- `railway.json`
- `Dockerfile`
- `docker-compose.yml`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-docker service-name
```
