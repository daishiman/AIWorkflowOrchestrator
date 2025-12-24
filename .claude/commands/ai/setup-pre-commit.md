---
description: |
  HuskyとLint-stagedを使用したPre-commit hooksの設定を行います。コミット前にLintとフォーマットを自動実行するGit hooksをセットアップします。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/hook-master.md`: メイン - Git hooks専門
  - `.claude/agents/code-quality.md`: 補助 - 品質チェック設定

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: pre-commit, git hooks, husky, lint-staged, 品質自動化
allowed-tools:
  - Task
model: sonnet
---

# Pre-commit Hook セットアップ

## 目的

`.claude/commands/ai/setup-pre-commit.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: メイン - Git hooks専門の実行

**目的**: メイン - Git hooks専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: メイン - Git hooks専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/hook-master.md`

Task ツールで `.claude/agents/hook-master.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `package.json`
- `README.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 補助 - 品質チェック設定の実行

**目的**: 補助 - 品質チェック設定に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 補助 - 品質チェック設定の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/code-quality.md`

Task ツールで `.claude/agents/code-quality.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `package.json`
- `README.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-pre-commit
```
