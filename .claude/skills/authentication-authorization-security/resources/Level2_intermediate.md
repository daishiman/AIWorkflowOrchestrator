# Level 2: Intermediate

## 概要

認証・認可機構のセキュリティ評価とベストプラクティスを提供します。 ブルース・シュナイアーの『Secrets and Lies』とOAuth 2.0仕様に基づき、 認証メカニズム、セッション管理、アクセス制御、JWT/トークンセキュリティの

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 1. RBAC（Role-Based Access Control） / 構成要素 / 実装パターン / JWT基本構造 / 1. 署名アルゴリズムのセキュリティ / 推奨アルゴリズム
- 実務指針: 認証システムのセキュリティレビュー時 / OAuth/OpenID Connect実装の評価時 / セッション管理とトークンセキュリティの設計時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/access-control-models.md`: RBAC/ABAC/ACLアクセス制御モデルの詳細比較と選択基準（把握する知識: 1. RBAC（Role-Based Access Control） / 構成要素 / 実装パターン）
- `resources/jwt-security-checklist.md`: JWT署名アルゴリズム選択とトークンセキュリティ検証項目（把握する知識: JWT基本構造 / 1. 署名アルゴリズムのセキュリティ / 推奨アルゴリズム）
- `resources/oauth2-flow-comparison.md`: OAuth 2.0フロー（Authorization Code、PKCE等）の選択決定ツリー（把握する知識: OAuth 2.0 フロー比較ガイド / フロー選択決定ツリー / Authorization Code Flow + PKCE）
- `resources/password-hashing-guide.md`: bcrypt/argon2/scryptハッシュアルゴリズムの設定と実装ガイド（把握する知識: パスワードハッシングガイド / bcrypt / argon2）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: セキュリティガイドライン）
- `resources/session-management-patterns.md`: サーバーサイドセッションとCookie属性のセキュリティパターン（把握する知識: セッション管理パターン / 1. セッションストレージ戦略 / サーバーサイドセッション）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Authentication & Authorization Security / 1. 認証機構の評価基準 / 1.1 パスワードベース認証）

### スクリプト運用
- `scripts/analyze-auth-endpoints.mjs`: 認証エンドポイントのセキュリティ分析スクリプト
- `scripts/check-token-security.mjs`: JWTトークンセキュリティ検証スクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-session-config.mjs`: セッション設定のセキュリティ検証スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/oauth2-config-template.json`: oauth2-config-template のテンプレート
- `templates/rbac-policy-template.yaml`: rbac-policy-template のテンプレート
- `templates/session-security-checklist.md`: セッション管理セキュリティチェックリストテンプレート

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
