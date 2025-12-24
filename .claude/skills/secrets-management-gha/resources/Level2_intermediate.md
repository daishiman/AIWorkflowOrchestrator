# Level 2: Intermediate

## 概要

GitHub Actionsワークフローでの安全な秘密情報管理。 リポジトリシークレット、環境シークレット、組織シークレット、Dependabotシークレットの使用方法、 OIDCによるクラウドプロバイダー認証、シークレットローテーション、監査ベストプラクティスを提供。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: OIDC認証 (OpenID Connect) / メリット / 基本概念 / 環境変数管理 / セキュリティ原則 / 1. 最小権限の原則 (Principle of Least Privilege)

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/oidc-authentication.md`: OIDC Authenticationリソース（把握する知識: OIDC認証 (OpenID Connect) / メリット / 基本概念）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 環境変数管理）
- `resources/secret-best-practices.md`: Secret Best Practicesリソース（把握する知識: セキュリティ原則 / 1. 最小権限の原則 (Principle of Least Privilege) / シークレット漏洩防止）
- `resources/secret-types.md`: Secret Typesリソース（把握する知識: GitHub Actions シークレットタイプ / シークレットの種類 / 1. リポジトリシークレット (Repository Secrets)）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub Actions Secrets Management / スクリプト実行 / 1. リポジトリシークレット）

### スクリプト運用
- `scripts/check-secret-usage.mjs`: Check Secret Usageスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/oidc-examples.yaml`: OIDC Examplesテンプレート

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
