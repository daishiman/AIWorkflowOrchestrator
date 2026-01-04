# Level 2: Intermediate

## 概要

OpenAPI、Swagger、RESTful APIドキュメンテーションのベストプラクティスを提供する専門スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 認証ドキュメント作成 / Bearer Token認証 / ヘッダー形式 / エンドポイント設計パターン / URL設計原則 / 1. リソース中心の設計
- 実務指針: REST APIの仕様書を作成する時 / OpenAPI/Swagger定義を設計する時 / APIエンドポイントの詳細仕様を文書化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/authentication-docs.md`: 認証ドキュメント作成（把握する知識: 認証ドキュメント作成 / Bearer Token認証 / ヘッダー形式）
- `resources/endpoint-design.md`: エンドポイント設計パターン（把握する知識: エンドポイント設計パターン / URL設計原則 / 1. リソース中心の設計）
- `resources/error-documentation.md`: エラードキュメンテーション（把握する知識: エラードキュメンテーション / エラーレスポンス形式 / 標準フォーマット）
- `resources/openapi-guide.md`: OpenAPI 3.x詳細ガイド（把握する知識: 基本構造 / 主要セクション / info（API情報））
- `resources/request-response-examples.md`: リクエスト/レスポンス例（把握する知識: リクエスト/レスポンス例 / 成功ケースの記述 / リソース作成（POST））
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: REST API 設計原則）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: API Documentation Best Practices / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-openapi.mjs`: OpenAPI仕様バリデーションスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/endpoint-template.md`: [エンドポイント名]
- `templates/openapi-template.yaml`: openapi: 3.0.3

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
