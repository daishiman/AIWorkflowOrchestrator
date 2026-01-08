---
description: |
  GitHub Pull Requestを自動作成するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: PR説明文作成（変更サマリー、テストプラン）

  ⚙️ このコマンドの設定:
  - argument-hint: [base-branch]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: pull request, pr, create pr, プルリクエスト作成, レビュー依頼
argument-hint: "[base-branch]"
allowed-tools:
  - Task
model: sonnet
---

# Pull Request自動作成

## 目的

`.claude/commands/ai/create-pr.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: PR説明文作成（変更サマリー、テストプラン）の実行

**目的**: PR説明文作成（変更サマリー、テストプラン）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: PR説明文作成（変更サマリー、テストプラン）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[base-branch]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/youtube-summarize/`
- `src/features/registry.ts`
- `docs/20-specifications/features/youtube-summarize.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-pr [base-branch]
```
