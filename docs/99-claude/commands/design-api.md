---
description: |
  REST API設計とOpenAPI 3.x仕様書の作成（エンドポイント定義、認証設計、スキーマ生成）。
  実行は専門エージェントに委譲します。

  🤖 起動エージェント:
  - `.claude/agents/gateway-dev.md`: API設計パターン分析、エンドポイント設計
  - `.claude/agents/api-doc-writer.md`: OpenAPI仕様書生成、ドキュメント作成

  ⚙️ このコマンドの設定:
  - argument-hint: [resource-name]
  - allowed-tools: Task（エージェント起動のみ）
  - model: opus

  トリガーキーワード: api, design, endpoint, openapi, swagger, REST, エンドポイント設計, API仕様書
argument-hint: "[resource-name]"
allowed-tools:
  - Task
model: opus
---

# API設計コマンド - REST API & OpenAPI仕様書生成

## 目的

`.claude/commands/ai/design-api.md` の入力を受け取り、専門エージェントに実行を委譲します。

## エージェント起動フロー

### Phase 1: API設計パターン分析、エンドポイント設計の実行

**目的**: API設計パターン分析、エンドポイント設計に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: API設計パターン分析、エンドポイント設計の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/gateway-dev.md`

Task ツールで `.claude/agents/gateway-dev.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[resource-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `src/app/api/`
- `docs/20-specifications/api-design-`
- `docs/20-specifications/api-documentation-`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

### Phase 2: OpenAPI仕様書生成、ドキュメント作成の実行

**目的**: OpenAPI仕様書生成、ドキュメント作成に関するタスクを実行し、結果を整理する

**背景**: 専門知識が必要なため専門エージェントに委譲する

**ゴール**: OpenAPI仕様書生成、ドキュメント作成の結果と次アクションが提示された状態

**起動エージェント**: `.claude/agents/api-doc-writer.md`

Task ツールで `.claude/agents/api-doc-writer.md` を起動:

**コンテキスト**:

- 引数: $ARGUMENTS（[resource-name]）

**依頼内容**:

- コマンドの目的に沿って実行する
- 結果と次アクションを提示する

**期待成果物**:

- `docs/00-requirements/master_system_design.md`
- `src/app/api/`
- `docs/20-specifications/api-design-`
- `docs/20-specifications/api-documentation-`

**完了条件**:

- [ ] 主要な結果と根拠が整理されている
- [ ] 次のアクションが提示されている

## 使用例

```bash
/ai:design-api [resource-name]
```
