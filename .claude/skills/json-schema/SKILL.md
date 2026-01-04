---
name: json-schema
description: |
  JSON Schema仕様に基づくスキーマ設計を専門とするスキル。
  API仕様の定義、OpenAPI連携、バリデーションルールの標準化を通じて、
  相互運用性の高いデータ構造を設計します。

  Anchors:
  • Effective TypeScript (Dan Vanderkam) / 適用: 型安全性とスキーマ設計 / 目的: 堅牢なスキーマ構造の実現
  • JSON Schema仕様 (Draft 2020-12) / 適用: 標準スキーマ定義 / 目的: 言語非依存なデータバリデーション

  Trigger:
  JSONスキーマ定義、APIレスポンス検証、データバリデーション設計、OpenAPI統合、スキーマ継承パターン、複雑なデータ構造の妥当性確認時に使用。
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# JSONスキーマ

## 概要

このスキルは、JSON Schema Draft 2020-12仕様に基づくスキーマ設計における段階的ガイダンスを提供する。
API仕様の定義、OpenAPI連携、バリデーションルール標準化、スキーマ構成パターンを支援し、
相互運用性の高いデータ構造を実現する。

## ワークフロー

### Phase 1: 要件と構造の整理

**目的**: スキーマ設計の要件と構造を把握する

**Task**: `agents/analyze-requirements.md`

**アクション**:

1. 対象となるスキーマの種類と目的を確認
2. 必要なスキーマレベルを判断（基礎/中級/上級/専門）
3. 参照する references/ ファイルを選択:
   - 基礎: `references/Level1_basics.md`
   - 中級: `references/Level2_intermediate.md`
   - 上級: `references/Level3_advanced.md`
   - 専門: `references/Level4_expert.md`

### Phase 2: スキーマ設計と実装

**目的**: 段階的ガイダンスに従ってスキーマを設計する

**Task**: `agents/design-schema.md`

**アクション**:

1. 必要に応じて以下の参照資料を読む:
   - JSON Schema基礎: `references/json-schema-basics.md`
   - スキーマ構成パターン: `references/schema-composition.md`
   - バリデーションキーワード: `references/validation-keywords.md`
   - OpenAPI連携: `references/openapi-integration.md`

2. テンプレートを使用して作成:
   - OpenAPI スキーマテンプレート: `assets/api-schema-template.json`

### Phase 3: 検証と記録

**目的**: 作成したスキーマを検証し、使用履歴を記録する

**Task**: `agents/validate-schema.md`

**アクション**:

1. JSON Schema構文の検証: `node scripts/validate-json-schema.mjs <schema-file>`
2. スキル構造の検証: `node scripts/validate-skill.mjs`
3. 使用記録の保存: `node scripts/log_usage.mjs --result success --phase "schema-design"`

## Task仕様ナビ

| Task                 | 対象レベル | 参照リソース           | 使用テンプレート         |
| -------------------- | ---------- | ---------------------- | ------------------------ |
| 基本的なスキーマ定義 | Level 1    | json-schema-basics.md  | api-schema-template.json |
| APIスキーマ設計      | Level 2    | openapi-integration.md | api-schema-template.json |
| 複雑なスキーマ構成   | Level 3    | schema-composition.md  | api-schema-template.json |
| マルチバージョン対応 | Level 3    | openapi-integration.md | -                        |
| バリデーション規則   | Level 2-4  | validation-keywords.md | api-schema-template.json |
| 型安全性の確保       | Level 4    | Level4_expert.md       | -                        |

## ベストプラクティス

### すべきこと

- JSON Schema Draft 2020-12準拠のスキーマを設計する
- OpenAPI 3.0/3.1仕様と互換性を確保する
- $ref参照による適切なスキーマの再利用を行う
- 必須項目（required）と追加プロパティ（additionalProperties）を明確に定義する
- minLength、pattern、minimum等のバリデーションキーワードを活用する
- allOf、oneOf、anyOfを使ったスキーマ継承と多態性を実装する
- 型安全性を確保し、相互運用性の高い構造を設計する

### 避けるべきこと

- スキーマバージョンの混在利用
- $refの過度な深いネストによる複雑化
- additionalProperties: falseなしで未定義プロパティを許容する
- バリデーションキーワードの定義不足による検証漏れ
- OpenAPI仕様への非準拠な設計
- ドキュメント不足による意図の曖昧さ

## リソース/スクリプト参照

### references/ （段階的参照資料）

- **Level1_basics.md**: JSON Schema設計の基礎知識
- **Level2_intermediate.md**: 実務レベルのスキーマ設計
- **Level3_advanced.md**: 高度なスキーマ構成パターン
- **Level4_expert.md**: 専門的なスキーマ設計技法
- **json-schema-basics.md**: Draft 2020-12準拠の型システム、$ref参照、required/additionalProperties基礎
- **openapi-integration.md**: OpenAPI 3.0/3.1のJSON Schema互換性、components定義、リクエスト/レスポンス分離
- **schema-composition.md**: allOf/oneOf/anyOfによるスキーマ継承と多態性実装パターン
- **validation-keywords.md**: 型別バリデーションキーワード（minLength/pattern/minimum/format等）リファレンス
- **requirements-index.md**: 要求仕様の索引（docs/00-requirements と同期）

### scripts/ （実行スクリプト）

- **validate-json-schema.mjs**: JSON Schemaの構文検証とDraft仕様準拠チェック
- **validate-skill.mjs**: スキル構造の整合性検証
- **log_usage.mjs**: スキル使用記録と評価

### assets/ （出力テンプレート）

- **api-schema-template.json**: OpenAPI components/schemasセクション作成テンプレート

## 変更履歴

| Version | Date       | Changes                                                                                                                                                        |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に完全準拠: YAML frontmatter更新（Anchors/Trigger追加）、ワークフロー再構成（Phase 1-3）、Task仕様ナビテーブル追加、リソース参照セクション整理 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                                                    |
