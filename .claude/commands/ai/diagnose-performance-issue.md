---
description: |
  パフォーマンス問題の診断を行うコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/router-dev.md`: レンダリング問題診断
  - `.claude/agents/repo-dev.md`: クエリパフォーマンス診断
  - `.claude/agents/sre-observer.md`: システム全体診断

  ⚙️ このコマンドの設定:
  - argument-hint: [symptom]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: performance issue, slow, パフォーマンス問題, 遅い
argument-hint: "[symptom]"
allowed-tools:
  - Task
model: opus
---

# パフォーマンス問題診断

## 目的

`.claude/commands/ai/diagnose-performance-issue.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: レンダリング問題診断の実行

**目的**: レンダリング問題診断に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: レンダリング問題診断の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/router-dev.md`

Task ツールで `.claude/agents/router-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[symptom]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/performance/diagnosis-report.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: クエリパフォーマンス診断の実行

**目的**: クエリパフォーマンス診断に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: クエリパフォーマンス診断の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/repo-dev.md`

Task ツールで `.claude/agents/repo-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[symptom]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/performance/diagnosis-report.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: システム全体診断の実行

**目的**: システム全体診断に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: システム全体診断の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sre-observer.md`

Task ツールで `.claude/agents/sre-observer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[symptom]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/performance/diagnosis-report.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:diagnose-performance-issue [symptom]
```
