---
name: secrets-management-gha
description: |
  GitHub Actionsワークフローでの安全な秘密情報管理。リポジトリシークレット、環境シークレット、組織シークレット、Dependabotシークレットの使用方法、OIDCによるクラウドプロバイダー認証、シークレットローテーション、監査ベストプラクティスを提供。

  Anchors:
  • Web Application Security（Andrew Hoffman）/ 適用: 脅威モデリングとセキュア設計の原則 / 目的: シークレット管理戦略の基礎理論化
  • GitHub Actions Secrets API / 適用: リポジトリ/環境/組織シークレット設定 / 目的: 各シークレットタイプの正確な使い分け
  • OpenID Connect (OIDC) / 適用: クラウドプロバイダー認証 / 目的: 長期認証情報の削減とトークンベース認証

  Trigger:
  GitHub Actionsシークレット設定時、機密情報管理時、OIDCクラウド認証実装時、シークレットローテーション時、アクセス監査実施時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# GitHub Actions Secrets Management

## 概要

GitHub Actionsワークフローでの安全な秘密情報管理を実現するスキル。リポジトリシークレット、環境シークレット、組織シークレット、Dependabotシークレットの使い分け、OIDCによるクラウドプロバイダー認証、シークレットローテーション、監査ログ管理を段階的に提供。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスク内容とシークレット要件を明確化

**アクション**:

1. [references/Level1_basics.md](references/Level1_basics.md)でシークレットタイプと基本概念を確認
2. [references/secret-types.md](references/secret-types.md)から必要なシークレット形式を特定
3. タスクが環境固有か組織横断的かを判定

### Phase 2: スキル適用（実装と検証）

**目的**: シークレット管理の実装と検証

**アクション**:

1. [references/oidc-authentication.md](references/oidc-authentication.md)でOIDC実装が必要か判定
2. [references/secret-best-practices.md](references/secret-best-practices.md)からセキュリティベストプラクティスを確認
3. 必要に応じて`scripts/check-secret-usage.mjs`でシークレット使用状況を検証

### Phase 3: 検証と記録

**目的**: 成果物のセキュリティ品質確認と実装記録

**アクション**:

1. `scripts/validate-skill.mjs`でスキル構造整合性を確認
2. ワークフロー内のシークレットアクセスが安全であることを検証
3. `scripts/log_usage.mjs`で実装パターンと経験を記録

## Task仕様ナビ

GitHub Actions秘密情報管理の実装は、以下の段階的タスクで構成。各タスクは詳細なワークフロー、入出力仕様、制約条件を含む：

| Task                       | 目的                                             | 対象                   | 参照リソース                                                         |
| -------------------------- | ------------------------------------------------ | ---------------------- | -------------------------------------------------------------------- |
| シークレットタイプ判定     | リポジトリ/環境/組織シークレットを正確に使い分け | CI/CD基盤設計フェーズ  | [references/secret-types.md](references/secret-types.md)               |
| OIDC認証実装               | 長期認証情報を排除し、トークンベース認証に移行   | クラウドプロバイダ連携 | [references/oidc-authentication.md](references/oidc-authentication.md) |
| シークレットローテーション | 定期的な秘密情報更新を自動化                     | セキュリティ運用       | [references/Level2_intermediate.md](references/Level2_intermediate.md) |
| アクセス監査               | ワークフロー内のシークレット露出を検知           | セキュリティ検査       | `scripts/check-secret-usage.mjs`                                     |

## ベストプラクティス

### すべきこと

- **タイプ選択**: リポジトリシークレット（全ワークフロー共通）、環境シークレット（本番/ステージング分離）、組織シークレット（複数リポ共有）を正確に使い分ける
- **OIDC優先**: クラウドプロバイダ（AWS/Azure/GCP）認証ではOIDCを採用し、長期クレデンシャルを排除する
- **暗号化保存**: GitHub Actionsのシークレットストレージはデフォルト暗号化だが、ワークフローに出力しない
- **監査ログ**: Organization レベルのアクセス監査を定期実施（最低月1回）
- **ローテーション**: APIキー等は90日以内にローテーション、より頻繁な更新が推奨される秘密は別途管理

### 避けるべきこと

- **コミット履歴**: 秘密情報をスクリプト・コンフィグファイル・コミットに含めない。`git-secrets`や`TruffleHog`で検出可能なパターンを使用しない
- **ログ出力**: `echo "${{ secrets.API_KEY }}"`のようなシークレット出力は禁止。逃し出たログは消去不可
- **複雑な前置詞**: シークレット名は`PROD_DB_PASSWORD`のように明確に。接頭辞/接尾辞曖昧性は運用ミスを招く
- **冗長化なし**: 同じシークレットを複数キー名で重複保存しない。一元管理を原則に
- **無制限アクセス**: 外部Action利用時は`secrets: inherit`を避け、必要な秘密のみ明示的に渡す

## リソース参照

### 詳細ガイド

- **[references/Level1_basics.md](references/Level1_basics.md)**: GitHub Actionsシークレット基礎（タイプ分類、設定方法）
- **[references/Level2_intermediate.md](references/Level2_intermediate.md)**: シークレット運用ガイド（環境分離、アクセス制御、ローテーション）
- **[references/Level3_advanced.md](references/Level3_advanced.md)**: セキュア設計パターン（OIDC、暗号化、監査）
- **[references/Level4_expert.md](references/Level4_expert.md)**: 脅威モデリングと高度な対策

### 領域別リソース

- **[references/secret-types.md](references/secret-types.md)**: 4種類のシークレット詳細（リポジトリ/環境/組織/Dependabot）
- **[references/oidc-authentication.md](references/oidc-authentication.md)**: OpenID Connect認証フロー（AWS/Azure/GCP例）
- **[references/secret-best-practices.md](references/secret-best-practices.md)**: 業界標準ベストプラクティス（OWASP参照）

### スクリプト

- `scripts/check-secret-usage.mjs`: ワークフロー内のシークレット使用状況を静的解析（改札ない露出検出）
- `scripts/log_usage.mjs`: 実装パターンと経験をログに記録（フィードバックループ）
- `scripts/validate-skill.mjs`: スキル構造とリソースファイル整合性を検証

### テンプレート

- **[assets/oidc-examples.yaml](assets/oidc-examples.yaml)**: AWS/Azure/GCP OIDC設定の実例集

## 変更履歴

| Version | Date       | Changes                                                                 |
| ------- | ---------- | ----------------------------------------------------------------------- |
| 1.0.0   | 2025-12-31 | 18-skills.md仕様へ準拠（Frontmatter改訂、本文再構成、Task仕様ナビ追加） |
| 0.9.0   | 2025-12-24 | Spec alignment and required artifacts added                             |
