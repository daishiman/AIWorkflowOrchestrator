# Level 2: Intermediate

## 概要

外部APIとの統合設計パターンに関する専門知識。 RESTful API、GraphQL、WebSocket等の統合設計と実装指針を提供します。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 1. API Key認証 / 実装パターン / ローテーション戦略 / API エラーハンドリングパターン / 1. エラー分類体系 / HTTPステータスコードマッピング
- 実務指針: 外部API（Google Drive, Slack, GitHub等）との統合設計時 / 認証フロー（OAuth 2.0, API Key等）の実装設計時 / Rate Limitingやリトライ戦略の設計時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/authentication-flows.md`: OAuth 2.0、API Key、JWTなどの認証フロー詳細（把握する知識: 1. API Key認証 / 実装パターン / ローテーション戦略）
- `resources/error-handling-patterns.md`: API統合におけるエラーハンドリングパターン（把握する知識: API エラーハンドリングパターン / 1. エラー分類体系 / HTTPステータスコードマッピング）
- `resources/rate-limiting-strategies.md`: Rate Limiting対策とリトライ戦略（把握する知識: Rate Limiting 戦略ガイド / 1. Rate Limit の理解 / 一般的な制限タイプ）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: API統合タイプ分類 / 1. RESTful API / 2. GraphQL）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/test-api-connection.mjs`: API接続テストスクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/api-client-template.ts`: APIクライアント実装テンプレート
- `templates/auth-config-template.json`: 認証設定ファイルテンプレート

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
