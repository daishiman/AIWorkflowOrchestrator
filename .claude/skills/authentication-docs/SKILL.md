---
name: authentication-docs
description: |
  API認証・認可フローの図解とドキュメント化、
  トークン取得手順の明確な説明のための知識とテンプレート

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/authentication-docs/resources/oauth2-flows.md`: OAuth 2.0各種フロー(Authorization Code、Client Credentials等)の詳細解説
  - `.claude/skills/authentication-docs/resources/token-management.md`: トークン取得・更新・有効期限管理
  - `.claude/skills/authentication-docs/resources/security-best-practices.md`: 認証セキュリティベストプラクティス
  - `.claude/skills/authentication-docs/templates/auth-quickstart.md`: 認証クイックスタートガイドテンプレート
  - `.claude/skills/authentication-docs/templates/oauth2-diagrams.md`: OAuth 2.0フローシーケンス図テンプレート(Mermaid形式)
  - `.claude/skills/authentication-docs/scripts/generate-auth-flow-diagram.sh`: 認証フロー図自動生成スクリプト
  - `.claude/skills/authentication-docs/scripts/test-auth-endpoint.sh`: 認証エンドポイントテストスクリプト

version: 1.0.0
---

# Authentication Docs スキル

## 概要

API認証・認可メカニズムの効果的なドキュメント化手法を提供します。
OAuth 2.0フロー、API Key認証、JWT取得手順などを
開発者が理解しやすい形式で文書化します。

## 知識ドメイン

### 1. 認証方式

- API Key認証（ヘッダー/クエリ）
- Bearer Token認証
- Basic認証
- OAuth 2.0各種フロー
- OpenID Connect

### 2. OAuth 2.0フロー

- Authorization Code Flow（+ PKCE）
- Client Credentials Flow
- Device Code Flow
- Implicit Flow（非推奨）

### 3. トークン管理

- アクセストークン取得
- リフレッシュトークン使用
- トークン有効期限管理
- スコープと権限

### 4. セキュリティ考慮

- シークレット管理
- CORS設定
- レート制限
- 監査ログ

### 5. 図解・可視化

- シーケンス図（Mermaid）
- フロー図
- 状態遷移図

## リソース

| ファイル                               | 内容                               |
| -------------------------------------- | ---------------------------------- |
| `resources/oauth2-flows.md`            | OAuth 2.0各フローの詳細解説        |
| `resources/token-management.md`        | トークン取得・更新・管理           |
| `resources/security-best-practices.md` | 認証セキュリティベストプラクティス |

## テンプレート

| ファイル                       | 用途                          |
| ------------------------------ | ----------------------------- |
| `templates/auth-quickstart.md` | 認証クイックスタートガイド    |
| `templates/oauth2-diagrams.md` | OAuth 2.0フロー図テンプレート |

## 使用方法

```
このスキルを使用して：
1. 認証方式の選択と説明
2. OAuth 2.0フローの図解作成
3. トークン取得手順のステップバイステップガイド
4. セキュリティ考慮事項の文書化
```

## 適用対象

- API認証ドキュメント
- OAuth 2.0統合ガイド
- SDKクイックスタート
- セキュリティガイドライン

## 関連スキル

| スキル                           | パス                                                       | 関連性                                  |
| -------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| openapi-specification            | `.claude/skills/openapi-specification/SKILL.md`            | OpenAPIセキュリティスキーム定義         |
| request-response-examples        | `.claude/skills/request-response-examples/SKILL.md`        | 認証リクエスト/レスポンス例             |
| api-documentation-best-practices | `.claude/skills/api-documentation-best-practices/SKILL.md` | APIドキュメント全体のベストプラクティス |

## 変更履歴

| バージョン | 日付       | 変更内容                                                                          |
| ---------- | ---------- | --------------------------------------------------------------------------------- |
| 1.0.0      | 2025-11-27 | 初版リリース。OAuth 2.0フロー、トークン管理、セキュリティベストプラクティスを追加 |
