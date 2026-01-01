# Level 2: Intermediate

## 概要

APIバージョニング戦略と後方互換性管理を専門とするスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 破壊的変更（Breaking Changes）ガイド / 破壊的変更の定義 / 何が破壊的変更か？ / API非推奨化（Deprecation）プロセス / 非推奨化の原則 / なぜ非推奨化が重要か
- 実務指針: APIバージョニング戦略を決定する時 / 破壊的変更を導入する時 / エンドポイントを非推奨化する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/breaking-changes.md`: 破壊的変更の定義と影響範囲管理（把握する知識: 破壊的変更（Breaking Changes）ガイド / 破壊的変更の定義 / 何が破壊的変更か？）
- `resources/deprecation-process.md`: 段階的廃止プロセスとHTTPヘッダー活用（把握する知識: API非推奨化（Deprecation）プロセス / 非推奨化の原則 / なぜ非推奨化が重要か）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: REST API 設計原則）
- `resources/versioning-strategies.md`: バージョニング方式の比較と選択基準（把握する知識: 1. URL Path Versioning / 構造 / 実装例（Next.js App Router））
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 知識領域1: バージョニング方式 / 主要な方式比較 / 選択基準）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/deprecation-notice-template.md`: 非推奨化通知テンプレート
- `templates/migration-guide-template.md`: バージョン間移行ガイドテンプレート

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
