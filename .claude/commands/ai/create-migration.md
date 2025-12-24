---
description: |
  データベースマイグレーションファイル作成を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/dba-mgr.md`: データベース管理専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [migration-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: migration, schema-change, rollback, Up/Down, Drizzle
argument-hint: "[migration-name]"
allowed-tools:
  - Task
model: sonnet
---

# データベースマイグレーション作成コマンド

## 目的

`.claude/commands/ai/create-migration.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: データベース管理専門エージェントの実行

**目的**: データベース管理専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: データベース管理専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dba-mgr.md`

Task ツールで `.claude/agents/dba-mgr.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[migration-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/infrastructure/database/schema.ts`
- `docs/00-requirements/master_system_design.md`
- `docs/database/migration-plan-`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-migration [migration-name]
```
