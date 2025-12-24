---
description: |
  構造化ロギングシステムの設計と実装。 JSON形式ログ、相関ID、ログレベル管理を含む堅牢なロギング基盤を構築します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/sre-observer.md`: ロギング・監視設計専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [log-level]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: logging, log, json, structured, correlation id
argument-hint: "[log-level]"
allowed-tools:
  - Task
model: sonnet
---

# 構造化ロギング実装コマンド

## 目的

`.claude/commands/ai/setup-logging.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: ロギング・監視設計専門エージェントの実行

**目的**: ロギング・監視設計専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: ロギング・監視設計専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/sre-observer.md`

Task ツールで `.claude/agents/sre-observer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[log-level]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/shared/infrastructure/logging/`
- `docs/00-requirements/master_system_design.md`
- `src/shared/infrastructure/logging/logger.ts`
- `src/shared/infrastructure/logging/types.ts`
- `docs/observability/logging-guide.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:setup-logging [log-level]
```
