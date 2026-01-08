---
description: |
  新しいスラッシュコマンド（.claude/commands/*.md）を作成する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/command-arch.md`: スラッシュコマンド作成専門エージェント（Phase 2で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: [command-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: command, slash-command, コマンド作成, workflow, 自動化
argument-hint: "[command-name]"
allowed-tools:
  - Task
model: sonnet
---

# スラッシュコマンド作成

## 目的

`.claude/commands/ai/create-command.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: スラッシュコマンド作成専門エージェント（Phase 2で起動）の実行

**目的**: スラッシュコマンド作成専門エージェント（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: スラッシュコマンド作成専門エージェント（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/command-arch.md`

Task ツールで `.claude/agents/command-arch.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[command-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/commands/`
- `.claude/commands/ai/command_list.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:create-command [command-name]
```
