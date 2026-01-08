---
description: |
  不安定なテスト（フレーキーテスト）の検出と修正を自動化する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/e2e-tester.md`: フレーキーテスト防止専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [test-file]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: flaky test, unstable test, 不安定なテスト, フレーキー
argument-hint: "[test-file]"
allowed-tools:
  - Task
model: sonnet
---

# フレーキーテスト修正

## 目的

`.claude/commands/ai/fix-flaky-tests.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: フレーキーテスト防止専門エージェントの実行

**目的**: フレーキーテスト防止専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: フレーキーテスト防止専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/e2e-tester.md`

Task ツールで `.claude/agents/e2e-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[test-file]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/auth/__tests__/executor.test.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:fix-flaky-tests [test-file]
```
