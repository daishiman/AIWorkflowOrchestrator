---
description: |
  Git履歴からCHANGELOG.mdを自動生成。バージョン範囲を指定してリリースノートを作成し、変更をグループ化します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: 仕様書作成専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [from-tag] [to-tag]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: changelog, release notes, version, git history
argument-hint: "[from-tag] [to-tag]"
allowed-tools:
  - Task
model: sonnet
---

# CHANGELOG自動生成コマンド

## 目的

`.claude/commands/ai/generate-changelog.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 仕様書作成専門エージェントの実行

**目的**: 仕様書作成専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 仕様書作成専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[from-tag] [to-tag]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `CHANGELOG.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:generate-changelog [from-tag] [to-tag]
```
