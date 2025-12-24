---
description: |
  E2Eテストシナリオの自動作成を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/e2e-tester.md`: E2Eテスト作成専門エージェント（Playwright自動化）

  ⚙️ このコマンドの設定:
  - argument-hint: [user-flow]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: e2e test, integration test, user flow, playwright, E2Eテスト
argument-hint: "[user-flow]"
allowed-tools:
  - Task
model: opus
---

# E2Eテストシナリオ自動作成

## 目的

`.claude/commands/ai/generate-e2e-tests.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: E2Eテスト作成専門エージェント（Playwright自動化）の実行

**目的**: E2Eテスト作成専門エージェント（Playwright自動化）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: E2Eテスト作成専門エージェント（Playwright自動化）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/e2e-tester.md`

Task ツールで `.claude/agents/e2e-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[user-flow]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/reports/generate-e2e-tests.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:generate-e2e-tests [user-flow]
```
