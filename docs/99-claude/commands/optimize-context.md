---
description: |
  コンテキスト使用量の最適化を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/skill-librarian.md`: スキル最適化（Progressive Disclosure、500行制約）
  - `.claude/agents/prompt-eng.md`: プロンプト最適化（簡潔性、明確性）

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: optimize, context, token, コンテキスト最適化, トークン削減, Progressive Disclosure
allowed-tools:
  - Task
model: opus
---

# Context Optimization

## 目的

`.claude/commands/ai/optimize-context.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: スキル最適化（Progressive Disclosure、500行制約）の実行

**目的**: スキル最適化（Progressive Disclosure、500行制約）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: スキル最適化（Progressive Disclosure、500行制約）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/skill-librarian.md`

Task ツールで `.claude/agents/skill-librarian.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/optimization-report.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: プロンプト最適化（簡潔性、明確性）の実行

**目的**: プロンプト最適化（簡潔性、明確性）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: プロンプト最適化（簡潔性、明確性）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/prompt-eng.md`

Task ツールで `.claude/agents/prompt-eng.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/optimization-report.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:optimize-context
```
