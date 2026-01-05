---
description: |
  Claude Code hooksの設定を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/hook-master.md`: Git hooks・Claude Code hooks統合専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [hook-type]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: hooks, git hooks, claude code hooks, 自動化, lint, format, validation
argument-hint: "[hook-type]"
allowed-tools:
  - Task
model: sonnet
---

# Claude Code Hooks設定

## 目的

`.claude/commands/ai/setup-hooks.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Git hooks・Claude Code hooks統合専門エージェントの実行

**目的**: Git hooks・Claude Code hooks統合専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Git hooks・Claude Code hooks統合専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/hook-master.md`

Task ツールで `.claude/agents/hook-master.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[hook-type]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/settings.json`
- `.claude/hooks/`
- `.claude/settings.json.tmp`
- `package.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-hooks [hook-type]
```
