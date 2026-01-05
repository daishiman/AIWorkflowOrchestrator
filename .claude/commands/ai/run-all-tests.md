---
description: |
  全テストスイート（ユニットテスト + E2Eテスト）の実行と結果集約を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/unit-tester.md`: ユニットテスト実行とカバレッジ測定
  - `.claude/agents/e2e-tester.md`: E2Eテスト実行と統合動作確認

  ⚙️ このコマンドの設定:
  - argument-hint: [--coverage]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: run tests, all tests, test suite, CI, テスト実行
argument-hint: "[--coverage]"
allowed-tools:
  - Task
model: sonnet
---

# 全テストスイート実行

## 目的

`.claude/commands/ai/run-all-tests.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ユニットテスト実行とカバレッジ測定の実行

**目的**: ユニットテスト実行とカバレッジ測定に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ユニットテスト実行とカバレッジ測定の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/unit-tester.md`

Task ツールで `.claude/agents/unit-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[--coverage]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/run-all-tests.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: E2Eテスト実行と統合動作確認の実行

**目的**: E2Eテスト実行と統合動作確認に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: E2Eテスト実行と統合動作確認の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/e2e-tester.md`

Task ツールで `.claude/agents/e2e-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[--coverage]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/run-all-tests.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:run-all-tests [--coverage]
```
