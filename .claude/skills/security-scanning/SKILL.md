---
name: security-scanning
description: |
  **Anchors**: セキュリティスキャン、脆弱性検出、コンテナセキュリティ、SBOM生成、シークレット検出

  **Trigger**: セキュリティスキャン設定、脆弱性検出自動化、セキュリティCI/CD統合時に使用。

  CI/CD パイプラインに統合するセキュリティスキャンの設計と実装を支援するスキルです。
  依存関係の脆弱性検出、コンテナイメージスキャン、SBOM の生成、シークレット検出を対象とします。

allowed-tools:
  - Trivy
  - Dependabot
  - npm-audit
  - Docker
  - GitHub Actions
  - SBOM-tool
  - GitGuardian

---

# セキュリティスキャン

## 概要

このスキルは、CI/CD パイプラインに統合するセキュリティスキャンの設計と実装を支援します。以下のタスクを対象とします：

- **依存関係スキャン**: npm audit、Dependabot による脆弱性検出
- **コンテナイメージスキャン**: Trivy によるコンテナレジストリのスキャン
- **SBOM生成**: ソフトウェア部品表の自動生成
- **シークレット検出**: GitGuardian などによる認証情報漏洩防止

詳細な手順や背景は `references/Level1_basics.md` から `references/Level4_expert.md` を参照してください。

## ワークフロー

### Phase 1: 目的と前提の整理

**目的**: セキュリティスキャンタスクの要件を明確化する

**アクション**:

1. 適用対象のスキャンタイプ（依存関係/コンテナ/SBOM/シークレット）を特定
2. `references/Level1_basics.md` から適用レベルの資料を確認
3. 既存のスキャン設定と新規要件を整理

### Phase 2: スキル適用

**目的**: スキルの指針に従ってスキャン設定を実装する

**アクション**:

1. 関連テンプレート（workflow.yml, trivy-config.yaml など）を参照
2. `allowed-tools` に指定されたツール群から必要なものを選択
3. スキャン設定を実装し、既存のCI/CDパイプラインに統合

### Phase 3: 検証と記録

**目的**: 実装したスキャン設定の検証と成果物の記録

**アクション**:

1. `scripts/validate-skill.mjs` でスキル構造と設定を検証
2. スキャン実行テストを実施し、脆弱性検出が正しく機能するか確認
3. `scripts/log_usage.mjs` を実行し、実装内容を記録

## Task仕様ナビ

セキュリティスキャン実装時の参照テーブル：

| Task                     | リソース                           | 説明                               | 難度    |
| ------------------------ | ---------------------------------- | ---------------------------------- | ------- |
| 依存関係スキャン設定     | `references/dependency-scanning.md` | npm audit、Dependabot の設定       | Level 1 |
| コンテナイメージスキャン | `references/container-scanning.md`  | Trivy によるコンテナスキャン       | Level 2 |
| SBOM自動生成             | `references/sbom-generation.md`     | ソフトウェア部品表の生成と管理     | Level 2 |
| シークレット検出         | `references/secret-detection.md`    | GitGuardian などによる認証情報検出 | Level 2 |
| 脅威モデリング           | `references/Level3_advanced.md`     | セキュリティリスク分析             | Level 3 |
| スキャン結果の分析と報告 | `references/Level4_expert.md`       | 脆弱性の優先付けと対応策           | Level 4 |

## ベストプラクティス

### すべきこと

- **要件分析**: `references/Level1_basics.md` を参照し、適用範囲を明確にしてから実装を開始
- **段階的実装**: `references/Level2_intermediate.md` を参照し、依存関係→コンテナ→SBOM→シークレットの順で実装
- **テンプレート活用**: 提供されたテンプレート（workflow.yml, trivy-config.yaml）をベースに設定
- **定期的なテスト**: スキャン設定を本番環境に適用する前に、ステージング環境でテスト実施
- **脆弱性の優先付け**: 検出された脆弱性を重大度で分類し、対応策を計画
- **ドキュメント更新**: スキャン設定変更時は関連ドキュメントも更新

### 避けるべきこと

- **設定なしの導入**: スキャン設定を検証せずに本番環境に適用しない
- **アラート疲れ**: スキャン結果のフィルタリングなしに全アラート通知を送らない
- **スキップ設定の乱用**: 脆弱性を無視する設定を安易に追加しない
- **ツール乱立**: 複数のスキャンツールを過度に導入し、保守負荷を増加させない
- **検証スキップ**: Phase 3 の検証を省略し、スキャン効果測定なしに進めない
- **シークレット管理の軽視**: スキャン設定内にAPIキーやトークンを埋め込まない

## リソース参照

### 学習リソース

| リソース                           | 対象             | 用途                           |
| ---------------------------------- | ---------------- | ------------------------------ |
| `references/Level1_basics.md`       | 初心者向け       | セキュリティスキャンの基礎概念 |
| `references/Level2_intermediate.md` | 実務者向け       | 実装方法と設定ガイド           |
| `references/Level3_advanced.md`     | 上級者向け       | 脅威モデリングと最適化         |
| `references/Level4_expert.md`       | 専門家向け       | スキャン結果分析と報告         |
| `references/dependency-scanning.md` | 依存関係スキャン | npm audit、Dependabot の詳細   |
| `references/container-scanning.md`  | コンテナスキャン | Trivy による実装ガイド         |
| `references/sbom-generation.md`     | SBOM生成         | ソフトウェア部品表の自動生成   |
| `references/secret-detection.md`    | シークレット検出 | GitGuardian などの連携方法     |
| `references/requirements-index.md`  | 要求仕様索引     | ドキュメント体系との同期       |

### スクリプト

| スクリプト                      | 用途                 |
| ------------------------------- | -------------------- |
| `scripts/log_usage.mjs`         | 使用記録と自動評価   |
| `scripts/scan-dependencies.mjs` | 依存関係スキャン実行 |
| `scripts/validate-skill.mjs`    | スキル構造検証       |

### テンプレート

| テンプレート                           | 用途                        |
| -------------------------------------- | --------------------------- |
| `assets/security-scan-workflow.yml` | GitHub Actions ワークフロー |
| `assets/trivy-config.yaml`          | Trivy スキャン設定          |

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                                                                                       |
| ------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.0.0   | 2025-12-31 | 18-skills.md仕様に基づき完全リファクタリング。YAML frontmatterに日本語Trigger/Anchorsとallowed-toolsを追加、Task仕様ナビ（テーブル形式）を新規追加、ワークフローPhase内容を詳細化、ベストプラクティスを拡充、リソース参照をテーブル形式に統一 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                                                                                                                                                                                   |
