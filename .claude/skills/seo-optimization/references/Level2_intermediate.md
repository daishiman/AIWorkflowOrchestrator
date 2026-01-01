# Level 2: Intermediate

## 概要

Next.js Metadata APIを活用したSEO最適化を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: Metadata API ガイド / 静的メタデータ / 基本設定 / OGP / Twitter Card 設定 / Open Graph Protocol (OGP) / 基本概念

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/metadata-api-guide.md`: Metadata Api Guideリソース（把握する知識: Metadata API ガイド / 静的メタデータ / 基本設定）
- `resources/ogp-twitter-cards.md`: Ogp Twitter Cardsリソース（把握する知識: OGP / Twitter Card 設定 / Open Graph Protocol (OGP) / 基本概念）
- `resources/sitemap-robots.md`: Sitemap Robotsリソース（把握する知識: サイトマップ / robots.txt / サイトマップ / 静的サイトマップ）
- `resources/structured-data.md`: Structured Dataリソース（把握する知識: 構造化データ（JSON-LD） / 基本実装 / JSON-LDコンポーネント）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: SEO Optimization / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/analyze-seo.mjs`: Analyze Seoスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/metadata-template.md`: Metadataテンプレート
- `templates/structured-data-template.md`: Structured Dataテンプレート

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
