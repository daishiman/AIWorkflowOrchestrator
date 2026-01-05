---
description: |
  コード品質、保守性、ベストプラクティスへの準拠を改善するためのリファクタリングを実行します。テストを通じて機能性を維持しながらリファクタリング技法を適用します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/logic-dev.md`: メイン - リファクタリング実装
  - `.claude/agents/arch-police.md`: 補助 - アーキテクチャ検証

  ⚙️ このコマンドの設定:
  - argument-hint: <target-file>
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: refactor, improve, clean code, リファクタリング, 改善, コード整理
argument-hint: "<target-file>"
allowed-tools:
  - Task
model: opus
---

# コードリファクタリング

## 目的

`.claude/commands/ai/refactor.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: メイン - リファクタリング実装の実行

**目的**: メイン - リファクタリング実装に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: メイン - リファクタリング実装の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（<target-file>）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/refactor.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 補助 - アーキテクチャ検証の実行

**目的**: 補助 - アーキテクチャ検証に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 補助 - アーキテクチャ検証の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/arch-police.md`

Task ツールで `.claude/agents/arch-police.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（<target-file>）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/refactor.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:refactor <target-file>
```
