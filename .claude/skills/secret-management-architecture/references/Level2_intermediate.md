# Level 2: Intermediate

## 概要

Secret管理アーキテクチャ設計スキル。環境変数、Vault、KMS、Secrets Managerの

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: アクセス制御マトリクステンプレート / アクセス制御マトリクス / ロール定義 / Kubernetes Secrets 実装パターン / Secret作成パターン / パターン1: YAMLマニフェスト

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/access-control-matrix-template.md`: Access Control Matrix Templateリソース（把握する知識: アクセス制御マトリクステンプレート / アクセス制御マトリクス / ロール定義）
- `resources/kubernetes-secrets-patterns.md`: Kubernetes Secrets Patternsリソース（把握する知識: Kubernetes Secrets 実装パターン / Secret作成パターン / パターン1: YAMLマニフェスト）
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: 環境変数管理）
- `resources/secret-classification-framework.md`: Secret Classification Frameworkリソース（把握する知識: Secret分類フレームワーク / 分類の3つの軸 / 軸1: 重要度（Criticality））
- `resources/vault-integration-patterns.md`: Vault Integration Patternsリソース（把握する知識: HashiCorp Vault 統合パターン / 統合アーキテクチャパターン / パターン1: Direct API Integration）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: Secret Management Architecture / Secret 管理方式の選択基準 / 1. 環境変数ファイル方式）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/env-example-template.md`: Env Exampleテンプレート
- `templates/rotation-plan-template.md`: Rotation Planテンプレート
- `templates/secret-inventory-template.md`: Secret Inventoryテンプレート

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
