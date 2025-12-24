---
name: .claude/skills/json-schema/SKILL.md
description: |
  JSON Schema仕様に基づくスキーマ設計を専門とするスキル。
  API仕様の定義、OpenAPI連携、バリデーションルールの標準化を通じて、
  相互運用性の高いデータ構造を設計します。
  
  📖 参照書籍:
  - 『Effective TypeScript』（Dan Vanderkam）: 型設計
  
  📚 リソース参照:
  - `resources/Level1_basics.md`: レベル1の基礎ガイド
  - `resources/Level2_intermediate.md`: レベル2の実務ガイド
  - `resources/Level3_advanced.md`: レベル3の応用ガイド
  - `resources/Level4_expert.md`: レベル4の専門ガイド
  - `resources/json-schema-basics.md`: Draft 2020-12準拠の型システム、$ref参照、required/additionalProperties基礎
  - `resources/legacy-skill.md`: 旧SKILL.mdの全文
  - `resources/openapi-integration.md`: OpenAPI 3.0/3.1のJSON Schema互換性、components定義、リクエスト/レスポンス分離
  - `resources/schema-composition.md`: allOf/oneOf/anyOfによるスキーマ継承と多態性実装パターン
  - `resources/validation-keywords.md`: 型別バリデーションキーワード（minLength/pattern/minimum/format等）リファレンス
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-json-schema.mjs`: JSON Schemaの構文検証とDraft仕様準拠チェック
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `templates/api-schema-template.json`: OpenAPI components/schemasセクション作成テンプレート
  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）
  
  Use proactively when handling json schema tasks.
version: 1.0.0
level: 1
last_updated: 2025-12-24
references:
  - book: "Effective TypeScript"
    author: "Dan Vanderkam"
    concepts:
      - "型設計"
      - "安全性"
---

# JSON Schema

## 概要

JSON Schema仕様に基づくスキーマ設計を専門とするスキル。
API仕様の定義、OpenAPI連携、バリデーションルールの標準化を通じて、
相互運用性の高いデータ構造を設計します。

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
- OpenAPI/Swagger仕様でAPI定義を行う際
- 外部システムとのデータ交換フォーマット定義時
- 言語非依存のバリデーションルール定義時
- ドキュメント生成のためのスキーマ定義時

### 避けるべきこと
- アンチパターンや注意点を確認せずに進めることを避ける

## コマンドリファレンス

### リソース読み取り
```bash
cat .claude/skills/json-schema/resources/Level1_basics.md
cat .claude/skills/json-schema/resources/Level2_intermediate.md
cat .claude/skills/json-schema/resources/Level3_advanced.md
cat .claude/skills/json-schema/resources/Level4_expert.md
cat .claude/skills/json-schema/resources/json-schema-basics.md
cat .claude/skills/json-schema/resources/legacy-skill.md
cat .claude/skills/json-schema/resources/openapi-integration.md
cat .claude/skills/json-schema/resources/schema-composition.md
cat .claude/skills/json-schema/resources/validation-keywords.md
```

### スクリプト実行
```bash
node .claude/skills/json-schema/scripts/log_usage.mjs --help
node .claude/skills/json-schema/scripts/validate-json-schema.mjs --help
node .claude/skills/json-schema/scripts/validate-skill.mjs --help
```

### テンプレート参照
```bash
cat .claude/skills/json-schema/templates/api-schema-template.json
```

## 変更履歴

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2025-12-24 | Spec alignment and required artifacts added |
