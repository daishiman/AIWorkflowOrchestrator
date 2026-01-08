---
description: |
  API仕様書(OpenAPI 3.x)とSwagger UIの自動生成。ソースコードから開発者向けAPI仕様書を作成し、インタラクティブなドキュメントを構築します。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/api-doc-writer.md`: OpenAPI仕様とAPI DX専門エージェント

  ⚙️ このコマンドの設定:
  - argument-hint: [source-path]
  - allowed-tools: Task（エージェント起動のみ）
  - model: sonnet

  トリガーキーワード: api, documentation, openapi, swagger, endpoint
argument-hint: "[source-path]"
allowed-tools:
  - Task
model: sonnet
---

# API仕様書自動生成コマンド

## 目的

`.claude/commands/ai/generate-api-docs.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: OpenAPI仕様とAPI DX専門エージェントの実行

**目的**: OpenAPI仕様とAPI DX専門エージェントに関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: OpenAPI仕様とAPI DX専門エージェントの結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/api-doc-writer.md`

Task ツールで `.claude/agents/api-doc-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[source-path]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `src/app/api`
- `docs/api/`
- `docs/api/integration-guide.md`
- `docs/api/authentication.md`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:generate-api-docs [source-path]
```
