---
description: |
  包括的なコードレビューを実施するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/arch-police.md`: Clean Architecture、依存関係、レイヤー違反検出
  - `.claude/agents/code-quality.md`: SOLID原則、Clean Code、リファクタリング提案
  - `.claude/agents/sec-auditor.md`: セキュリティ脆弱性、OWASP Top 10
  - `.claude/agents/logic-dev.md`: ビジネスロジック妥当性、エッジケース検証

  ⚙️ このコマンドの設定:
  - argument-hint: [target-path]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: code review, レビュー, 品質チェック, アーキテクチャレビュー, comprehensive review
argument-hint: "[target-path]"
allowed-tools:
  - Task
model: opus
---

# 包括的コードレビュー

## 目的

`.claude/commands/ai/code-review-complete.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: Clean Architecture、依存関係、レイヤー違反検出の実行

**目的**: Clean Architecture、依存関係、レイヤー違反検出に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: Clean Architecture、依存関係、レイヤー違反検出の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/arch-police.md`

Task ツールで `.claude/agents/arch-police.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/reviews/code-review-`
- `src/features/auth`
- `src/app/api`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: SOLID原則、Clean Code、リファクタリング提案の実行

**目的**: SOLID原則、Clean Code、リファクタリング提案に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: SOLID原則、Clean Code、リファクタリング提案の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/code-quality.md`

Task ツールで `.claude/agents/code-quality.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/reviews/code-review-`
- `src/features/auth`
- `src/app/api`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: セキュリティ脆弱性、OWASP Top 10の実行

**目的**: セキュリティ脆弱性、OWASP Top 10に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: セキュリティ脆弱性、OWASP Top 10の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sec-auditor.md`

Task ツールで `.claude/agents/sec-auditor.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/reviews/code-review-`
- `src/features/auth`
- `src/app/api`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 4: ビジネスロジック妥当性、エッジケース検証の実行

**目的**: ビジネスロジック妥当性、エッジケース検証に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ビジネスロジック妥当性、エッジケース検証の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/logic-dev.md`

Task ツールで `.claude/agents/logic-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[target-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `.claude/docs/reviews/code-review-`
- `src/features/auth`
- `src/app/api`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:code-review-complete [target-path]
```
