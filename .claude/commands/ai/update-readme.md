---
description: |
  README.mdの更新と保守。プロジェクト概要、セットアップ手順、機能説明を最新の状態に保ちます。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/spec-writer.md`: 仕様書作成専門エージェント
  - `.claude/agents/manual-writer.md`: ユーザー中心ドキュメンテーション専門エージェント（補助）

  ⚙️ このコマンドの設定:
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: readme, project overview, documentation
allowed-tools:
  - Task
model: sonnet
---

# README更新コマンド

## 目的

`.claude/commands/ai/update-readme.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: 仕様書作成専門エージェントの実行

**目的**: 仕様書作成専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: 仕様書作成専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/spec-writer.md`

Task ツールで `.claude/agents/spec-writer.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/`
- `docs/00-requirements/master_system_design.md`
- `docs/api/`
- `package.json`
- `.env`
- `.env.example`
- `README.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: ユーザー中心ドキュメンテーション専門エージェント（補助）の実行

**目的**: ユーザー中心ドキュメンテーション専門エージェント（補助）に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ユーザー中心ドキュメンテーション専門エージェント（補助）の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/manual-writer.md`

Task ツールで `.claude/agents/manual-writer.md` を起動:

**コンテキスト**:

- 引数: なし

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/features/`
- `docs/00-requirements/master_system_design.md`
- `docs/api/`
- `package.json`
- `.env`
- `.env.example`
- `README.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:update-readme
```
