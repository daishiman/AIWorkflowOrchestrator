---
description: |
  エラーのデバッグと原因特定を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/logic-dev.md`: エラー原因分析・デバッグ専門
  - `.claude/agents/sec-auditor.md`: セキュリティ起因エラー分析

  ⚙️ このコマンドの設定:
  - argument-hint: [error-message]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: debug, error analysis, エラー調査, デバッグ, 原因特定
argument-hint: "[error-message]"
allowed-tools:
  - Task
model: opus
---

# エラーデバッグ

## 目的

`.claude/commands/ai/debug-error.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: エラー原因分析・デバッグ専門の実行

**目的**: エラー原因分析・デバッグ専門に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: エラー原因分析・デバッグ専門の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[error-message]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/sample/executor.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: セキュリティ起因エラー分析の実行

**目的**: セキュリティ起因エラー分析に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: セキュリティ起因エラー分析の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sec-auditor.md`

Task ツールで `.claude/agents/sec-auditor.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[error-message]）

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
/ai:debug-error [error-message]
```
