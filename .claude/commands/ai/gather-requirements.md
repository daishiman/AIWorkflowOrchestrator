---
description: |
  ステークホルダーへのヒアリングを実施し、曖昧な要望を検証可能な要件に変換します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/req-analyst.md`: 要件定義スペシャリスト（カール・ウィーガーズの要求工学に基づく曖昧性除去と要件構造化）
  - `.claude/agents/spec-writer.md`: へハンドオフ
  - `.claude/agents/domain-modeler.md`: との並行作業検討
  - `.claude/agents/unit-tester.md`: へ要件の引き継ぎ

  ⚙️ このコマンドの設定:
  - argument-hint: [stakeholder-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: 要件定義、ヒアリング、要求分析、requirements gathering
argument-hint: "[stakeholder-name]"
allowed-tools:
  - Task
model: opus
---

# .claude/commands/ai/gather-requirements.md

## 目的

`.claude/commands/ai/gather-requirements.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 要件定義スペシャリスト（カール・ウィーガーズの要求工学に基づく曖昧性除去と要件構造化）の実行

**目的**: 要件定義スペシャリスト（カール・ウィーガーズの要求工学に基づく曖昧性除去と要件構造化）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 要件定義スペシャリスト（カール・ウィーガーズの要求工学に基づく曖昧性除去と要件構造化）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/req-analyst.md`

Task ツールで `.claude/agents/req-analyst.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[stakeholder-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/00-requirements/master_system_design.md`
- `docs/20-specifications/features/`
- `docs/00-requirements/requirements.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: へハンドオフの実行

**目的**: へハンドオフに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: へハンドオフの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[stakeholder-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/00-requirements/master_system_design.md`
- `docs/20-specifications/features/`
- `docs/00-requirements/requirements.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 3: との並行作業検討の実行

**目的**: との並行作業検討に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: との並行作業検討の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/domain-modeler.md`

Task ツールで `.claude/agents/domain-modeler.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[stakeholder-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/00-requirements/master_system_design.md`
- `docs/20-specifications/features/`
- `docs/00-requirements/requirements.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 4: へ要件の引き継ぎの実行

**目的**: へ要件の引き継ぎに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: へ要件の引き継ぎの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/unit-tester.md`

Task ツールで `.claude/agents/unit-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[stakeholder-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/00-requirements/master_system_design.md`
- `docs/20-specifications/features/`
- `docs/00-requirements/requirements.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:gather-requirements [stakeholder-name]
```
