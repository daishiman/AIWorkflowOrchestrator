---
description: |
  Gitリリースタグとリリースノートを作成するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: リリースノート作成（CHANGELOG分析、変更サマリー）

  ⚙️ このコマンドの設定:
  - argument-hint: [version]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: release tag, git tag, リリースタグ, バージョンタグ, リリースノート
argument-hint: "[version]"
allowed-tools:
  - Task
model: sonnet
---

# リリースタグ作成

## 目的

`.claude/commands/ai/tag-release.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: リリースノート作成（CHANGELOG分析、変更サマリー）の実行

**目的**: リリースノート作成（CHANGELOG分析、変更サマリー）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: リリースノート作成（CHANGELOG分析、変更サマリー）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[version]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/releases/`
- `package.json`
- `CHANGELOG.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:tag-release [version]
```
