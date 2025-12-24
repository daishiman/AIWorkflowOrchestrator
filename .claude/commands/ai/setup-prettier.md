---
description: |
  Prettier設定を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/code-quality.md`: コードフォーマット専門エージェント

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: prettier, code format, フォーマット, 整形
allowed-tools:
  - Task
model: sonnet
---

# Prettier設定

## 目的

`.claude/commands/ai/setup-prettier.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: コードフォーマット専門エージェントの実行

**目的**: コードフォーマット専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: コードフォーマット専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/code-quality.md`

Task ツールで `.claude/agents/code-quality.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `package.json`
- `pnpm-lock.yaml`
- `.prettierrc`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-prettier
```
