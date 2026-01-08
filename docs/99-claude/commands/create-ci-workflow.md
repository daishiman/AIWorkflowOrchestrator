---
description: |
  GitHub ActionsのCI（継続的インテグレーション）ワークフローを作成します。テスト・Lint・ビルドなどのワークフロータイプに対応し、キャッシュ戦略とマトリックスビルドを最適化します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: test|lint|build
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: ci, workflow, github actions, continuous integration
argument-hint: "test|lint|build"
allowed-tools:
  - Task
model: sonnet
---

# create-ci-workflow

## 目的

`.claude/commands/ai/create-ci-workflow.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）の実行

**目的**: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/gha-workflow-architect.md`

Task ツールで `.claude/agents/gha-workflow-architect.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（test|lint|build）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.github/workflows/`
- `.github/workflows/ci-`
- `.github/workflows/ci.yml`
- `package.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-ci-workflow test|lint|build
```
