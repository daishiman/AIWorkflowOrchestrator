---
description: |
  Prettierによるコードフォーマットを実行し、一貫したコードスタイルを保証します。指定されたファイルまたはパターンに自動フォーマットを適用します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/code-quality.md`: メイン

  ⚙️ このコマンドの設定:
  - argument-hint: [target-pattern]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: format, prettier, フォーマット, 整形, code style
argument-hint: "[target-pattern]"
allowed-tools:
  - Task
model: sonnet
---

# Prettier コードフォーマット

## 目的

`.claude/commands/ai/format.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: メインの実行

**目的**: メインに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: メインの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/code-quality.md`

Task ツールで `.claude/agents/code-quality.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target-pattern]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/format.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:format [target-pattern]
```
