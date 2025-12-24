---
description: |
  実装可能な詳細仕様書作成（Specification-Driven Development）
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: 詳細仕様書作成専門エージェント（Phase 2で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: [feature-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: spec, specification, 仕様書, 詳細仕様, 実装仕様, 設計書
argument-hint: "[feature-name]"
allowed-tools:
  - Task
model: sonnet
---

# Write Specification - 詳細仕様書作成

## 目的

`.claude/commands/ai/write-spec.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 詳細仕様書作成専門エージェント（Phase 2で起動）の実行

**目的**: 詳細仕様書作成専門エージェント（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 詳細仕様書作成専門エージェント（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/10-requirements/requirements.md`
- `docs/20-specifications/features/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:write-spec [feature-name]
```
