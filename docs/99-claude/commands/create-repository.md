---
description: |
  新しいRepositoryパターン実装を作成する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/repo-dev.md`: Repositoryパターン実装専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [entity-name] (optional) - エンティティ名（例: Workflow, User）
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: repository, data access, データアクセス, CRUD, ORM
argument-hint: "[entity-name] (optional) - エンティティ名（例: Workflow, User）"
allowed-tools:
  - Task
model: opus
---

# Repository Pattern Implementation Command

## 目的

`.claude/commands/ai/create-repository.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Repositoryパターン実装専門エージェントの実行

**目的**: Repositoryパターン実装専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Repositoryパターン実装専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/repo-dev.md`

Task ツールで `.claude/agents/repo-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[entity-name] (optional) - エンティティ名（例: Workflow, User））

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/infrastructure/database/repositories/`
- `src/shared/core/interfaces/`
- `src/shared/`
- `src/shared/core/interfaces/I`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-repository [entity-name] (optional) - エンティティ名（例: Workflow, User）
```
