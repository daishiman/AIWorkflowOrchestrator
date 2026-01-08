---
description: |
  アクセシビリティ自動監査（axe-core + WCAG 2.1 AA）
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/frontend-tester.md`: 担当エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [--scope page|component|all] [--wcag-level A|AA|AAA] [--fix-mode auto|manual]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: accessibility, a11y, WCAG, axe-core, audit, アクセシビリティ, 監査
argument-hint: "[--scope page|component|all] [--wcag-level A|AA|AAA] [--fix-mode auto|manual]"
allowed-tools:
  - Task
model: sonnet
---

# アクセシビリティ自動監査コマンド

## 目的

`.claude/commands/ai/run-accessibility-audit.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 担当エージェントの実行

**目的**: 担当エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 担当エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/frontend-tester.md`

Task ツールで `.claude/agents/frontend-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[--scope page|component|all] [--wcag-level A|AA|AAA] [--fix-mode auto|manual]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.github/workflows/accessibility.yml`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:run-accessibility-audit [--scope page|component|all] [--wcag-level A|AA|AAA] [--fix-mode auto|manual]
```
