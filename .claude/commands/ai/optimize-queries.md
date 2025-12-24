---
description: |
  データベースクエリの最適化を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/repo-dev.md`: Repository実装専門エージェント（クエリ最適化担当）
  - `.claude/agents/dba-mgr.md`: データベース管理専門エージェント（パフォーマンスチューニング担当）

  ⚙️ このコマンドの設定:
  - argument-hint: [file-path]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: query, optimization, N+1, EXPLAIN, performance, slow-query
argument-hint: "[file-path]"
allowed-tools:
  - Task
model: opus
---

# データベースクエリ最適化コマンド

## 目的

`.claude/commands/ai/optimize-queries.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Repository実装専門エージェント（クエリ最適化担当）の実行

**目的**: Repository実装専門エージェント（クエリ最適化担当）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Repository実装専門エージェント（クエリ最適化担当）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/repo-dev.md`

Task ツールで `.claude/agents/repo-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[file-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/infrastructure/database/repositories/WorkflowRepository.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: データベース管理専門エージェント（パフォーマンスチューニング担当）の実行

**目的**: データベース管理専門エージェント（パフォーマンスチューニング担当）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: データベース管理専門エージェント（パフォーマンスチューニング担当）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dba-mgr.md`

Task ツールで `.claude/agents/dba-mgr.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[file-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/infrastructure/database/repositories/WorkflowRepository.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:optimize-queries [file-path]
```
