---
name: .claude/skills/api-documentation-best-practices/SKILL.md
description: |
  OpenAPI、Swagger、RESTful APIドキュメンテーションのベストプラクティスを提供する専門スキル。
  
  📖 参照書籍:
  - 『RESTful Web APIs』（Leonard Richardson）: リソース設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/authentication-docs.md`: 認証ドキュメント作成
  - `resources/endpoint-design.md`: エンドポイント設計パターン
  - `resources/error-documentation.md`: エラードキュメンテーション
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/openapi-guide.md`: OpenAPI 3.x詳細ガイド
  - `resources/request-response-examples.md`: リクエスト/レスポンス例
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-openapi.mjs`: OpenAPI仕様バリデーションスクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/endpoint-template.md`: [エンドポイント名]
  - `templates/openapi-template.yaml`: openapi: 3.0.3
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling api documentation best practices tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "RESTful Web APIs"
    author: "Leonard Richardson"
    concepts:
      - "リソース設計"
      - "HTTP設計"
---

# API Documentation Best Practices

## 概要

OpenAPI、Swagger、RESTful APIドキュメンテーションのベストプラクティスを提供する専門スキル。

詳細な手順や背景は `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を参照してください。


## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `resources/Level1_basics.md` と `resources/Level2_intermediate.md` を確認
2. 必要な resources/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す


## ベストプラクティス

### すべきこと
- REST APIの仕様書を作成する時
- OpenAPI/Swagger定義を設計する時
- APIエンドポイントの詳細仕様を文書化する時
- 認証フローを説明する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/api-documentation-best-practices/resources/Level1_basics.md
cat .claude/skills/api-documentation-best-practices/resources/Level2_intermediate.md
cat .claude/skills/api-documentation-best-practices/resources/Level3_advanced.md
cat .claude/skills/api-documentation-best-practices/resources/Level4_expert.md
cat .claude/skills/api-documentation-best-practices/resources/authentication-docs.md
cat .claude/skills/api-documentation-best-practices/resources/endpoint-design.md
cat .claude/skills/api-documentation-best-practices/resources/error-documentation.md
cat .claude/skills/api-documentation-best-practices/resources/legacy-skill.md
cat .claude/skills/api-documentation-best-practices/resources/openapi-guide.md
cat .claude/skills/api-documentation-best-practices/resources/request-response-examples.md
```

### スクリプト実行
```bash
node .claude/skills/api-documentation-best-practices/scripts/log_usage.mjs --help
node .claude/skills/api-documentation-best-practices/scripts/validate-openapi.mjs --help
node .claude/skills/api-documentation-best-practices/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/api-documentation-best-practices/templates/endpoint-template.md
cat .claude/skills/api-documentation-best-practices/templates/openapi-template.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
