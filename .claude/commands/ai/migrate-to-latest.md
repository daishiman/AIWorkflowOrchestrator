---
description: |
  フレームワーク・ライブラリの最新版移行を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/dep-mgr.md`: 依存関係管理・アップグレード計画
  - `.claude/agents/logic-dev.md`: コード修正・マイグレーション実装

  ⚙️ このコマンドの設定:
  - argument-hint: [library-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: migrate, upgrade library, マイグレーション, アップグレード, 最新版移行
argument-hint: "[library-name]"
allowed-tools:
  - Task
model: opus
---

# 最新版マイグレーション

## 目的

`.claude/commands/ai/migrate-to-latest.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 依存関係管理・アップグレード計画の実行

**目的**: 依存関係管理・アップグレード計画に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 依存関係管理・アップグレード計画の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/dep-mgr.md`

Task ツールで `.claude/agents/dep-mgr.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[library-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/migrations/`
- `src/app/`
- `package.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: コード修正・マイグレーション実装の実行

**目的**: コード修正・マイグレーション実装に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: コード修正・マイグレーション実装の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[library-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/migrations/`
- `src/app/`
- `package.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:migrate-to-latest [library-name]
```
