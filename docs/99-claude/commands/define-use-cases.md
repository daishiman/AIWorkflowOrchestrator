---
description: |
  ユースケース図とシナリオの作成を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/req-analyst.md`: 要件定義スペシャリスト（Phase 2でユースケースモデリング実行）

  ⚙️ このコマンドの設定:
  - argument-hint: [actor-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: use-case, ユースケース, シナリオ, アクター, フロー設計, 対話設計
argument-hint: "[actor-name]"
allowed-tools:
  - Task
model: sonnet
---

# ユースケース定義コマンド

## 目的

`.claude/commands/ai/define-use-cases.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 要件定義スペシャリスト（Phase 2でユースケースモデリング実行）の実行

**目的**: 要件定義スペシャリスト（Phase 2でユースケースモデリング実行）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 要件定義スペシャリスト（Phase 2でユースケースモデリング実行）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/req-analyst.md`

Task ツールで `.claude/agents/req-analyst.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[actor-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/`
- `docs/00-requirements/master_system_design.md`
- `docs/00-requirements/use-cases.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:define-use-cases [actor-name]
```
