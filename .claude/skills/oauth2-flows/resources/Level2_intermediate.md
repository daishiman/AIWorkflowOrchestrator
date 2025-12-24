# Level 2: Intermediate

## 概要

OAuth 2.0認可フローの実装パターンとセキュリティベストプラクティス。 Authorization Code Flow、PKCE、Refresh Token Flowの正確な実装を提供。 Aaron PareckiのOAuth 2.0 Simplifiedに基づく実践的ガイダンス。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: フロー全体図 / 実装ステップ / Step 1: 認可リクエストの構築 / PKCEとは / PKCE拡張フロー / Step 1: Code Verifier生成
- 実務指針: OAuth 2.0プロバイダー統合時（Google、GitHub、Discord等） / 認可フローの選択と実装が必要な時 / PKCEによるSPA・モバイルアプリ対応時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/authorization-code-flow.md`: Authorization Code Flow 詳細実装（把握する知識: フロー全体図 / 実装ステップ / Step 1: 認可リクエストの構築）
- `resources/pkce-implementation.md`: PKCE (Proof Key for Code Exchange) 実装詳細（把握する知識: PKCEとは / PKCE拡張フロー / Step 1: Code Verifier生成）
- `resources/security-checklist.md`: OAuth 2.0 セキュリティチェックリスト（把握する知識: 認可リクエストフェーズ / 必須セキュリティ項目 / トークン交換フェーズ）
- `resources/token-storage-strategies.md`: トークンストレージ戦略（把握する知識: トークンストレージ戦略 / トークン保管場所の評価 / 比較マトリックス）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: OAuth 2.0 Flows Implementation / OAuth 2.0 フローの種類と選択基準 / 1. Authorization Code Flow（認可コードフロー））

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-oauth-config.mjs`: OAuth 2.0設定のセキュリティ検証（state・redirect_uri・スコープ・トークンストレージの妥当性確認）
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/auth-code-flow-template.ts`: サーバーサイドOAuth認可コードフロー実装（state検証・トークン交換・エラーハンドリング含む）
- `templates/pkce-implementation-template.ts`: SPA/モバイル向けPKCE実装（Code Verifier生成・SHA-256チャレンジ・検証フロー含む）

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
