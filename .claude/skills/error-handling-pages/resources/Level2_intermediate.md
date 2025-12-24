# Level 2: Intermediate

## 概要

Next.js App Routerのエラーハンドリングを専門とするスキル。 error.tsx、not-found.tsx、global-error.tsxを使用したエラー境界とリカバリーを実現します。 専門分野:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: error.tsx ガイド / 基本構造 / 重要なポイント / global-error.tsx ガイド / 重要な注意点 / loading.tsx ガイド
- 実務指針: エラーページを実装する時 / 404ページをカスタマイズする時 / グローバルエラーハンドリングを設定する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/error-tsx-guide.md`: error-tsx-guide のガイド（把握する知識: error.tsx ガイド / 基本構造 / 重要なポイント）
- `resources/global-error-guide.md`: global-error-guide のガイド（把握する知識: global-error.tsx ガイド / 基本構造 / 重要な注意点）
- `resources/loading-tsx-guide.md`: loading-tsx-guide のガイド（把握する知識: loading.tsx ガイド / 基本構造 / 仕組み）
- `resources/not-found-guide.md`: not-found-guide のガイド（把握する知識: not-found.tsx ガイド / 基本構造 / トリガー方法）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: エラーハンドリング仕様）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Error Handling Pages / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/check-error-handling.mjs`: errorhandlingを検証するスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/error-page-template.md`: error-page-template のテンプレート
- `templates/not-found-template.md`: not-found-template のテンプレート

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
