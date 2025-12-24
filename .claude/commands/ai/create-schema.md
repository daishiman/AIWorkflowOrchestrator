---
description: |
  Zodスキーマ定義の作成（Zod 3.x + TypeScript 5.x準拠）。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/schema-def.md`: スキーマ定義専門エージェント（Phase 1で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: [schema-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: schema, zod, validation, バリデーション, スキーマ, 型定義, input validation
argument-hint: "[schema-name]"
allowed-tools:
  - Task
model: opus
---

# Zodスキーマ作成コマンド

## 目的

`.claude/commands/ai/create-schema.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: スキーマ定義専門エージェント（Phase 1で起動）の実行

**目的**: スキーマ定義専門エージェント（Phase 1で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: スキーマ定義専門エージェント（Phase 1で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/schema-def.md`

Task ツールで `.claude/agents/schema-def.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[schema-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `src/shared/schemas/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-schema [schema-name]
```
