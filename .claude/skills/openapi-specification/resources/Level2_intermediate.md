# Level 2: Intermediate

## 概要

OpenAPI 3.x仕様に準拠したAPI仕様書の設計と作成を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: OpenAPI 3.x 構造ガイド / 完全な仕様書構造 / 必須フィールド / REST API 設計原則 / OpenAPI スキーマ設計パターン / パターン1: 継承と合成
- 実務指針: 新規OpenAPI仕様書を作成する時 / 既存OpenAPI仕様書を更新する時 / エンドポイントやスキーマを設計する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/openapi-structure.md`: OpenAPI 3.x 構造ガイド（把握する知識: OpenAPI 3.x 構造ガイド / 完全な仕様書構造 / 必須フィールド）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: REST API 設計原則）
- `resources/schema-design-patterns.md`: OpenAPI スキーマ設計パターン（把握する知識: OpenAPI スキーマ設計パターン / パターン1: 継承と合成 / allOf（継承））
- `resources/security-schemes.md`: OpenAPI セキュリティスキーム設計（把握する知識: OpenAPI セキュリティスキーム設計 / セキュリティスキームタイプ / 1. API Key認証）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: スクリプト実行 / 知識領域 1: OpenAPI 3.x 基本構造 / 仕様書の主要セクション）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-openapi.mjs`: OpenAPI仕様ファイルの構文検証と整合性チェックを実行
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/endpoint-template.yaml`: 個別エンドポイント定義のYAMLテンプレート（パス、メソッド、レスポンス含む）
- `templates/openapi-base-template.yaml`: 完全なOpenAPI 3.x仕様書のベーステンプレート（info、servers、paths構造含む）

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
