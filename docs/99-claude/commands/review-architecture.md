---
description: |
  アーキテクチャレビューと依存関係チェックを実行するコマンド。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/arch-police.md`: アーキテクチャ監視専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [scope]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: architecture review, アーキテクチャレビュー, 依存関係, SOLID, clean architecture, コードスメル
argument-hint: "[scope]"
allowed-tools:
  - Task
model: opus
---

# アーキテクチャレビュー

## 目的

`.claude/commands/ai/review-architecture.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: アーキテクチャ監視専門エージェントの実行

**目的**: アーキテクチャ監視専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: アーキテクチャ監視専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/arch-police.md`

Task ツールで `.claude/agents/arch-police.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[scope]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `src/features/`
- `docs/10-architecture/review-report.md`
- `src/features/youtube-summarize/`
- `src/shared/`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:review-architecture [scope]
```
