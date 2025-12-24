# Level 2: Intermediate

## 概要

JSON Schema仕様に基づくスキーマ設計を専門とするスキル。 API仕様の定義、OpenAPI連携、バリデーションルールの標準化を通じて、 相互運用性の高いデータ構造を設計します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: JSON Schema 基礎 / スキーマのメタデータ / 必須メタデータ / OpenAPI連携 / OpenAPIとJSON Schemaの関係 / バージョン対応
- 実務指針: OpenAPI/Swagger仕様でAPI定義を行う際 / 外部システムとのデータ交換フォーマット定義時 / 言語非依存のバリデーションルール定義時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/json-schema-basics.md`: Draft 2020-12準拠の型システム、$ref参照、required/additionalProperties基礎（把握する知識: JSON Schema 基礎 / スキーマのメタデータ / 必須メタデータ）
- `resources/openapi-integration.md`: OpenAPI 3.0/3.1のJSON Schema互換性、components定義、リクエスト/レスポンス分離（把握する知識: OpenAPI連携 / OpenAPIとJSON Schemaの関係 / バージョン対応）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: REST API 設計原則 / 機能プラグイン追加手順）
- `resources/schema-composition.md`: allOf/oneOf/anyOfによるスキーマ継承と多態性実装パターン（把握する知識: スキーマ合成 / allOf（すべて満たす） / 基本的な使用法）
- `resources/validation-keywords.md`: 型別バリデーションキーワード（minLength/pattern/minimum/format等）リファレンス（把握する知識: バリデーションキーワード / 型キーワード / type）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: JSON Schema / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-json-schema.mjs`: JSON Schemaの構文検証とDraft仕様準拠チェック
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/api-schema-template.json`: OpenAPI components/schemasセクション作成テンプレート

### 成果物要件
- テンプレートの構成・必須項目を反映する

## 実践手順

1. 利用するリソースを選定し、適用順を決める
2. スクリプトは `--help` で引数を確認し、検証系から実行する
3. テンプレートを使い成果物の形式を統一する
4. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
