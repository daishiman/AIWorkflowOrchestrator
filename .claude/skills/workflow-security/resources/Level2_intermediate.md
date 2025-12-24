# Level 2: Intermediate

## 概要

GitHub Actions ワークフローのセキュリティ強化スキル。

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: 権限強化（Permission Hardening） / デフォルト動作（リポジトリ設定依存） / 権限スコープ一覧 / サプライチェーンセキュリティ / サプライチェーン攻撃のリスク / 攻撃ベクター
- 実務指針: セキュリティ脆弱性の検出時（トークン露出、過剰な権限、未検証のアクション） / ワークフローのセキュリティレビュー時 / PRワークフローの作成時（pull_request_targetの使用）

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/permission-hardening.md`: Permission Hardeningリソース（把握する知識: 権限強化（Permission Hardening） / デフォルト動作（リポジトリ設定依存） / 権限スコープ一覧）
- `resources/supply-chain-security.md`: Supply Chain Securityリソース（把握する知識: サプライチェーンセキュリティ / サプライチェーン攻撃のリスク / 攻撃ベクター）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub Actions Workflow Security / 🔴 Critical（必須対応） / 🟡 Important（推奨対応））

### スクリプト運用
- `scripts/audit-workflow.mjs`: Audit Workflowスクリプト
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/secure-workflow.yaml`: Secure Workflowテンプレート

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
