---
description: |
  新しいドメインエンティティを作成する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/domain-modeler.md`: ドメインモデル設計専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [entity-name] (optional) - エンティティ名（例: User, Task）
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: entity, domain, ドメインエンティティ, DDD
argument-hint: "[entity-name] (optional) - エンティティ名（例: User, Task）"
allowed-tools:
  - Task
model: opus
---

# Domain Entity Creation Command

## 目的

`.claude/commands/ai/create-entity.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ドメインモデル設計専門エージェントの実行

**目的**: ドメインモデル設計専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ドメインモデル設計専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/domain-modeler.md`

Task ツールで `.claude/agents/domain-modeler.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[entity-name] (optional) - エンティティ名（例: User, Task））

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/core/entities/`
- `src/shared/core/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-entity [entity-name] (optional) - エンティティ名（例: User, Task）
```
