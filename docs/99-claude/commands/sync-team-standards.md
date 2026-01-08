---
description: |
  チームコーディング規約の同期を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/code-quality.md`: コーディング規約専門
  - `.claude/agents/skill-librarian.md`: ベストプラクティス収集専門

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: team standards, coding standards, チーム規約, コーディング規約
allowed-tools:
  - Task
model: sonnet
---

# チーム規約同期

## 目的

`.claude/commands/ai/sync-team-standards.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: コーディング規約専門の実行

**目的**: コーディング規約専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: コーディング規約専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/code-quality.md`

Task ツールで `.claude/agents/code-quality.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/CLAUDE.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: ベストプラクティス収集専門の実行

**目的**: ベストプラクティス収集専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ベストプラクティス収集専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/skill-librarian.md`

Task ツールで `.claude/agents/skill-librarian.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/CLAUDE.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:sync-team-standards
```
