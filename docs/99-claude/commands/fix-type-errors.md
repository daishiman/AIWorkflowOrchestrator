---
description: |
  TypeScript型エラーの修正を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/schema-def.md`: 型定義専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [file-path]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: type error, 型エラー, TypeScript エラー
argument-hint: "[file-path]"
allowed-tools:
  - Task
model: opus
---

# TypeScript型エラー修正

## 目的

`.claude/commands/ai/fix-type-errors.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 型定義専門エージェントの実行

**目的**: 型定義専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 型定義専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/schema-def.md`

Task ツールで `.claude/agents/schema-def.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[file-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/sample/executor.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:fix-type-errors [file-path]
```
