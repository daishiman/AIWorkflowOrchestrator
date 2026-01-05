---
description: |
  ユニットテストの自動生成を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/unit-tester.md`: ユニットテスト作成専門エージェント（TDD原則実践）

  ⚙️ このコマンドの設定:
  - argument-hint: [target-file]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: unit test, test generation, TDD, coverage, テスト作成
argument-hint: "[target-file]"
allowed-tools:
  - Task
model: opus
---

# ユニットテスト自動生成

## 目的

`.claude/commands/ai/generate-unit-tests.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ユニットテスト作成専門エージェント（TDD原則実践）の実行

**目的**: ユニットテスト作成専門エージェント（TDD原則実践）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ユニットテスト作成専門エージェント（TDD原則実践）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/unit-tester.md`

Task ツールで `.claude/agents/unit-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target-file]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/`
- `src/features/youtube-summarize/executor.ts`
- `src/features/youtube-summarize/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:generate-unit-tests [target-file]
```
