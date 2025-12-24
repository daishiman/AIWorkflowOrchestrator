# Level 2: Intermediate

## 概要

authentication flows に関するベストプラクティスと判断基準を整理するスキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: API Key Authentication / API Key vs OAuth/JWT / API Key設計 / JSON Web Token (JWT) / JWT構造 / 署名アルゴリズム

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/api-key.md`: API Key Authentication（把握する知識: API Key Authentication / API Key vs OAuth/JWT / API Key設計）
- `resources/jwt.md`: JSON Web Token (JWT)（把握する知識: JSON Web Token (JWT) / JWT構造 / 署名アルゴリズム）
- `resources/mtls.md`: Mutual TLS (mTLS)（把握する知識: Mutual TLS (mTLS) / TLS vs mTLS / 証明書階層）
- `resources/oauth2.md`: OAuth 2.0フロー種別（Authorization Code・PKCE・Client Credentials・Device Code）の実装ガイドとTypeScriptサンプルコード（把握する知識: OAuth 2.0 / フロー種別 / Authorization Code Flow）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: 対象エージェント / 含まれるリソース / 1. OAuth 2.0 (resources/oauth2.md)）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-auth-config.mjs`: Authentication Configuration Validator
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/jwt-service-template.ts`: JWT Service Template
- `templates/oauth2-client-template.ts`: OAuth 2.0 Client Template

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
