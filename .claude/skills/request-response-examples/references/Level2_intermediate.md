# Level 2: Intermediate

## 概要

APIリクエスト・レスポンスの具体的なサンプル作成と エラーケースドキュメント化のための知識とテンプレート

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: エラーレスポンス標準ガイド / RFC 7807 Problem Details / 標準構造 / リクエスト・レスポンス例 設計パターン / 効果的な例の原則 / 1. 即座に実行可能

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/error-response-standards.md`: エラーレスポンス標準ガイド（把握する知識: エラーレスポンス標準ガイド / RFC 7807 Problem Details / 標準構造）
- `resources/example-design-patterns.md`: リクエスト・レスポンス例 設計パターン（把握する知識: リクエスト・レスポンス例 設計パターン / 効果的な例の原則 / 1. 即座に実行可能）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: REST API 設計原則）
- `resources/sdk-examples.md`: 言語別SDKサンプル作成ガイド（把握する知識: 言語別SDKサンプル作成ガイド / 対応言語一覧 / JavaScript / TypeScript）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 知識ドメイン / 1. リクエスト例設計 / 2. レスポンス例設計）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/curl-examples.md`: cURLサンプルテンプレート
- `templates/error-catalog.md`: エラーカタログテンプレート

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
