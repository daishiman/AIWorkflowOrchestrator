---
name: .claude/skills/openapi-specification/SKILL.md
description: |
  OpenAPI 3.x仕様に準拠したAPI仕様書の設計と作成を専門とするスキル。
  
  📖 参照書籍:
  - 『RESTful Web APIs』（Leonard Richardson）: リソース設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/openapi-structure.md`: OpenAPI 3.x 構造ガイド
  - `resources/schema-design-patterns.md`: OpenAPI スキーマ設計パターン
  - `resources/security-schemes.md`: OpenAPI セキュリティスキーム設計
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-openapi.mjs`: OpenAPI仕様ファイルの構文検証と整合性チェックを実行
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/endpoint-template.yaml`: 個別エンドポイント定義のYAMLテンプレート（パス、メソッド、レスポンス含む）
  - `templates/openapi-base-template.yaml`: 完全なOpenAPI 3.x仕様書のベーステンプレート（info、servers、paths構造含む）
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling openapi specification tasks.
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

# OpenAPI Specification スキル

## 概要

OpenAPI 3.x仕様に準拠したAPI仕様書の設計と作成を専門とするスキル。

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
- 新規OpenAPI仕様書を作成する時
- 既存OpenAPI仕様書を更新する時
- エンドポイントやスキーマを設計する時
- OpenAPI構文エラーを解決する時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/openapi-specification/resources/Level1_basics.md
cat .claude/skills/openapi-specification/resources/Level2_intermediate.md
cat .claude/skills/openapi-specification/resources/Level3_advanced.md
cat .claude/skills/openapi-specification/resources/Level4_expert.md
cat .claude/skills/openapi-specification/resources/legacy-skill.md
cat .claude/skills/openapi-specification/resources/openapi-structure.md
cat .claude/skills/openapi-specification/resources/schema-design-patterns.md
cat .claude/skills/openapi-specification/resources/security-schemes.md
```

### スクリプト実行
```bash
node .claude/skills/openapi-specification/scripts/log_usage.mjs --help
node .claude/skills/openapi-specification/scripts/validate-openapi.mjs --help
node .claude/skills/openapi-specification/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/openapi-specification/templates/endpoint-template.yaml
cat .claude/skills/openapi-specification/templates/openapi-base-template.yaml
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
