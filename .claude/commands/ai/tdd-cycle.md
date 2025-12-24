---
description: |
  TDDサイクル（Red-Green-Refactor）の実行を自動化する専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/unit-tester.md`: テストファースト実装（Redフェーズ）
  - `.claude/agents/logic-dev.md`: 最小実装とリファクタリング（Green/Refactorフェーズ）

  ⚙️ このコマンドの設定:
  - argument-hint: [feature-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: TDD, test-driven, red green refactor, テスト駆動
argument-hint: "[feature-name]"
allowed-tools:
  - Task
model: opus
---

# TDDサイクル実行

## 目的

`.claude/commands/ai/tdd-cycle.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: テストファースト実装（Redフェーズ）の実行

**目的**: テストファースト実装（Redフェーズ）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: テストファースト実装（Redフェーズ）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/unit-tester.md`

Task ツールで `.claude/agents/unit-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/`
- `src/features/email-notification/executor.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: 最小実装とリファクタリング（Green/Refactorフェーズ）の実行

**目的**: 最小実装とリファクタリング（Green/Refactorフェーズ）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 最小実装とリファクタリング（Green/Refactorフェーズ）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[feature-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/`
- `src/features/email-notification/executor.ts`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:tdd-cycle [feature-name]
```
