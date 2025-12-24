# Level 2: Intermediate

## 概要

API認証・認可フローの図解とドキュメント化、 トークン取得手順の明確な説明のための知識とテンプレート

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: フロー選択ガイド / 1. Authorization Code Flow / シーケンス図 / 認証方式別セキュリティ / API Key認証 / Bearer Token認証

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/oauth2-flows.md`: OAuth 2.0各種フロー(Authorization Code、Client Credentials等)の詳細解説（把握する知識: フロー選択ガイド / 1. Authorization Code Flow / シーケンス図）
- `resources/security-best-practices.md`: 認証セキュリティベストプラクティス（把握する知識: 認証方式別セキュリティ / API Key認証 / Bearer Token認証）
- `resources/token-management.md`: トークン取得・更新・有効期限管理（把握する知識: トークン管理ガイド / トークン種別 / アクセストークン取得）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 知識ドメイン / 1. 認証方式 / 2. OAuth 2.0フロー）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/auth-quickstart.md`: 認証クイックスタートガイドテンプレート
- `templates/oauth2-diagrams.md`: OAuth 2.0フローシーケンス図テンプレート(Mermaid形式)

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
