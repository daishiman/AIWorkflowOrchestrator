# Level 2: Intermediate

## 概要

ユーザーフレンドリーなエラーメッセージの設計を専門とするスキル。 エラーコード体系、多言語対応（i18n）、アクション指向のメッセージ設計を 通じて、ユーザー体験を向上させます。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: APIエラーレスポンス / RFC 7807 Problem Details / 基本フォーマット / エラーコード体系 / コード体系の設計原則 / 階層構造
- 実務指針: バリデーションエラーメッセージの設計時 / APIエラーレスポンスの設計時 / 多言語対応のエラーシステム構築時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/api-error-responses.md`: api-error-responses の詳細ガイド（把握する知識: APIエラーレスポンス / RFC 7807 Problem Details / 基本フォーマット）
- `resources/error-code-system.md`: error-code-system の詳細ガイド（把握する知識: エラーコード体系 / コード体系の設計原則 / 階層構造）
- `resources/i18n-error-handling.md`: i18n-error-handling の詳細ガイド（把握する知識: 多言語対応エラーハンドリング（i18n） / 基本的な翻訳構造 / メッセージファイル構造）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: エラーハンドリング仕様）
- `resources/user-friendly-messages.md`: user-friendly-messages の詳細ガイド（把握する知識: ユーザーフレンドリーメッセージ / 良いエラーメッセージの原則 / 1. 具体的であること）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Error Message Design / リソース構造 / リソース読み取り）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-error-messages.mjs`: errormessagesを検証するスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/error-system-template.ts`: error-system-template のテンプレート

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
