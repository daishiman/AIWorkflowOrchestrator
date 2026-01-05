---
description: |
  React状態管理ライブラリ（SWR/React Query）のセットアップと実装を行う専門コマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/state-manager.md`: 状態管理実装専門エージェント（Phase 2で起動）
  - `.claude/agents/unit-tester.md`: に引き継ぎ）

  ⚙️ このコマンドの設定:
  - argument-hint: [library]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: state management, data fetching, SWR, React Query, hooks, 状態管理
argument-hint: "[library]"
allowed-tools:
  - Task
model: opus
---

# React状態管理セットアップ

## 目的

`.claude/commands/ai/setup-state-management.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 状態管理実装専門エージェント（Phase 2で起動）の実行

**目的**: 状態管理実装専門エージェント（Phase 2で起動）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 状態管理実装専門エージェント（Phase 2で起動）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/state-manager.md`

Task ツールで `.claude/agents/state-manager.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[library]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/hooks/`
- `src/app/`
- `docs/00-requirements/master_system_design.md`
- `package.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: に引き継ぎ）の実行

**目的**: に引き継ぎ）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: に引き継ぎ）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/unit-tester.md`

Task ツールで `.claude/agents/unit-tester.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[library]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/hooks/`
- `src/app/`
- `docs/00-requirements/master_system_design.md`
- `package.json`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-state-management [library]
```
