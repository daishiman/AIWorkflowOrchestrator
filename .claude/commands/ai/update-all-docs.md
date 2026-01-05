---
description: |
  全ドキュメントの一括更新を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: 仕様書更新専門
  - `.claude/agents/api-doc-writer.md`: API仕様書更新専門
  - `.claude/agents/manual-writer.md`: ユーザーマニュアル更新専門

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: update docs, documentation, ドキュメント更新, 仕様書更新
allowed-tools:
  - Task
model: sonnet
---

# 全ドキュメント一括更新

## 目的

`.claude/commands/ai/update-all-docs.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 仕様書更新専門の実行

**目的**: 仕様書更新専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 仕様書更新専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/20-specifications/`
- `docs/30-api/`
- `docs/40-manuals/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: API仕様書更新専門の実行

**目的**: API仕様書更新専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: API仕様書更新専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/api-doc-writer.md`

Task ツールで `.claude/agents/api-doc-writer.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/20-specifications/`
- `docs/30-api/`
- `docs/40-manuals/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: ユーザーマニュアル更新専門の実行

**目的**: ユーザーマニュアル更新専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ユーザーマニュアル更新専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/manual-writer.md`

Task ツールで `.claude/agents/manual-writer.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/20-specifications/`
- `docs/30-api/`
- `docs/40-manuals/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:update-all-docs
```
