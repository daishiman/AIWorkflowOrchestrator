# Level 2: Intermediate

## 概要

MCPのリソース指向API設計パターンに関する専門知識。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: キャッシュ戦略ガイド / 1. キャッシュアーキテクチャ / 多層キャッシュモデル / REST API 設計原則 / リソース変換パターンガイド / 1. 変換アーキテクチャ

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/caching-strategies.md`: Caching Strategiesリソース（把握する知識: キャッシュ戦略ガイド / 1. キャッシュアーキテクチャ / 多層キャッシュモデル）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: REST API 設計原則）
- `resources/resource-transformation.md`: Resource Transformationリソース（把握する知識: リソース変換パターンガイド / 1. 変換アーキテクチャ / 変換パイプライン）
- `resources/uri-scheme-guide.md`: Uri Scheme Guideリソース（把握する知識: URIスキーム設計ガイド / 1. URI構造 / 標準フォーマット）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: リソースモデル / 1. リソース URI スキーム / 標準 URI フォーマット）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-resource-definition.mjs`: Validate Resource Definitionスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト
- `scripts/validate-uri.mjs`: Validate Uriスクリプト

### テンプレート運用
- `templates/resource-definition-template.json`: Resource Definitionテンプレート
- `templates/resource-provider-template.ts`: Resource Providerテンプレート

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
