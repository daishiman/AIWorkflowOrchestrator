---
description: |
  ビジネスロジック実装専門コマンド。マーティン・ファウラーの思想に基づき、可読性が高くテスト容易なExecutorクラスを実装します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/logic-dev.md`: ビジネスロジック実装専門エージェント（Phase 2で起動）

  ⚙️ このコマンドの設定:
  - argument-hint: [logic-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: business logic, executor, implement, 実装, ビジネスロジック, TDD
argument-hint: "[logic-name]"
allowed-tools:
  - Task
model: opus
---

# ビジネスロジック実装

## 目的

`.claude/commands/ai/implement-business-logic.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ビジネスロジック実装専門エージェント（Phase 2で起動）の実行

**目的**: ビジネスロジック実装専門エージェント（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ビジネスロジック実装専門エージェント（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[logic-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `src/features/`
- `docs/20-specifications/features/`
- `src/features/registry.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:implement-business-logic [logic-name]
```
