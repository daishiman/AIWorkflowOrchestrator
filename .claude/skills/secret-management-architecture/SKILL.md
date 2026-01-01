---
name: secret-management-architecture
description: |
  シークレット管理アーキテクチャの専門スキル。
  Vault設計、ローテーション、アクセス制御を提供します。

  Anchors:
  • 『Clean Architecture』（Robert C. Martin） / 適用: シークレット管理アーキテクチャ / 目的: 依存関係ルールの実装

  Trigger:
  シークレット管理アーキテクチャ設計時、Vault/KMS導入時、キーローテーション設計時、アクセス制御マトリクス設計時に使用
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Secret Management Architecture

## 概要

シークレット管理アーキテクチャスキルは、環境変数、HashiCorp Vault、AWS KMS、AWS Secrets Managerなど複数のシークレット保管・管理システムを統合して、エンタープライズグレードの機密情報管理戦略を設計・実装するための専門スキルです。

このスキルでは以下を実現します：

- **ライフサイクル管理**: シークレット生成、配布、ローテーション、廃棄までの一連のプロセス設計
- **アクセス制御**: Role-based Access Control（RBAC）による最小権限の実装
- **分類と保護**: シークレット重要度別の保護レベル設定
- **統合と標準化**: 複数のバックエンド間での一貫した管理インターフェース
- **監査とコンプライアンス**: 機密情報へのアクセスログと監査証跡の確保

詳細な実装手順は `references/` ディレクトリのレベル別ガイドを参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: タスクの目的と前提条件を明確にする

**アクション**:

1. `references/Level1_basics.md` と `references/Level2_intermediate.md` を確認
2. 必要な references/scripts/templates を特定

### Phase 2: スキル適用

**目的**: スキルの指針に従って具体的な作業を進める

**アクション**:

1. 関連リソースやテンプレートを参照しながら作業を実施
2. 重要な判断点をメモとして残す

### Phase 3: 検証と記録

**目的**: 成果物の検証と実行記録の保存

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造を確認
2. 成果物が目的に合致するか確認
3. `scripts/log_usage.mjs` を実行して記録を残す

## Task仕様ナビ

| タスク                               | リソース                             | 対象レベル | 期間  |
| ------------------------------------ | ------------------------------------ | ---------- | ----- |
| シークレット分類フレームワークの構築 | `secret-classification-framework.md` | Level 1-2  | 1-2日 |
| Vault統合設計の実装                  | `vault-integration-patterns.md`      | Level 2-3  | 3-4日 |
| Kubernetes Secrets管理の設定         | `kubernetes-secrets-patterns.md`     | Level 2-3  | 2-3日 |
| アクセス制御マトリクスの作成         | `access-control-matrix-template.md`  | Level 1-2  | 1日   |
| ライフサイクル管理フロー設計         | `Level2_intermediate.md`             | Level 2    | 2-3日 |
| 監査・ロギング戦略の構築             | `Level3_advanced.md`                 | Level 3    | 2-3日 |
| エンタープライズ統合アーキテクチャ   | `Level4_expert.md`                   | Level 4    | 4-5日 |

## ベストプラクティス

### すべきこと

- **事前分析**: `references/Level1_basics.md` を参照し、シークレット分類基準と管理方針を明確にする
- **段階的導入**: `references/Level2_intermediate.md` に従い、環境別（開発→ステージング→本番）で段階的に導入
- **アクセス制御**: 最小権限の原則（Principle of Least Privilege）を実装し、Role-based Access Control を設計
- **ライフサイクル設計**: シークレット生成、配布、ローテーション、廃棄の全フェーズを定義
- **監査ログ**: すべてのシークレットアクセスと変更を監査ログに記録し、コンプライアンス追跡
- **バックアップ戦略**: 重要なシークレット設定のバックアップと災害復旧手順を確立
- **ドキュメント化**: シークレット管理ポリシー、統合方法、トラブルシューティングを文書化
- **テスト検証**: `scripts/validate-skill.mjs` でアーキテクチャ設計の整合性を検証

### 避けるべきこと

- ハードコード: コードにシークレットをハードコードしない
- ログ出力: シークレットをログファイルやスタックトレースに出力しない
- バージョン管理: シークレットをGitリポジトリにコミットしない
- 単一バックエンド: 単一の管理システムに依存しない、冗長性を確保
- アクセス権の無制限付与: 必要最小限の権限のみ付与
- ローテーション戦略なし: 定期的なシークレットローテーション計画がない設計
- 監査なし: アクセスログや変更履歴の監査機能なしでの運用
- 環境混在: 開発環境と本番環境のシークレットを混在させない

## リソース参照

### 学習リソース（references/）

| リソース                             | 説明                                     | 対象者                     |
| ------------------------------------ | ---------------------------------------- | -------------------------- |
| `Level1_basics.md`                   | シークレット管理の基本概念と分類         | すべての開発者             |
| `Level2_intermediate.md`             | 実務的な統合パターンと運用手順           | バックエンド開発者、DevOps |
| `Level3_advanced.md`                 | エンタープライズ設計とベストプラクティス | アーキテクト、セキュリティ |
| `Level4_expert.md`                   | 複雑な統合シナリオと最適化               | インフラ専門家             |
| `secret-classification-framework.md` | シークレット重要度分類基準               | すべての開発者             |
| `vault-integration-patterns.md`      | HashiCorp Vault統合パターン              | DevOps、システム設計者     |
| `kubernetes-secrets-patterns.md`     | Kubernetes環境での管理パターン           | Kubernetes運用者           |
| `access-control-matrix-template.md`  | RBAC設計テンプレート                     | セキュリティ責任者         |
| `requirements-index.md`              | 要求仕様索引（ドキュメント連携）         | 要件定義者                 |

### スクリプト（scripts/）

| スクリプト           | 用途                         | 実行方法                            |
| -------------------- | ---------------------------- | ----------------------------------- |
| `validate-skill.mjs` | アーキテクチャ設計の構造検証 | `node scripts/validate-skill.mjs`   |
| `log_usage.mjs`      | 使用記録とスキル評価         | `node scripts/log_usage.mjs --help` |

### テンプレート（assets/）

| テンプレート                   | 用途                   | 対象               |
| ------------------------------ | ---------------------- | ------------------ |
| `env-example-template.md`      | 環境変数設定のサンプル | 開発環境構築       |
| `rotation-plan-template.md`    | ローテーション計画書   | ライフサイクル管理 |
| `secret-inventory-template.md` | シークレット棚卸し表   | 監査・管理         |

## 変更履歴

| Version | Date       | Changes                                                                                                                                                             |
| ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様への完全対応：YAML frontmatter改善（Anchors/Trigger/allowed-tools追加）、概要拡充、Task仕様ナビ追加、ベストプラクティス強化、リソース参照テーブル化 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                                                         |
