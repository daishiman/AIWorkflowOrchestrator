# Level 2: Intermediate

## 概要

GitHub Actionsセキュリティスキル。Repository/Environment Secrets、 ログマスキング、品質ゲート統合、CI/CDパイプラインセキュリティを提供します。 使用タイミング:

resources/・scripts/・templates/ の活用を前提とした運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる

## 詳細ガイド

### 必要な知識・情報
- 主要トピック: デプロイメント (Deployment) / GitHub Actions Workflow Security Patterns / パターン1: 最小権限トークン / パターン2: フォークPR制限 / GitHub Actions Security / Repository Secrets vs Environment Secrets
- 実務指針: GitHub Actionsワークフローのセキュリティを強化する時 / Environment Secretsを設定する時 / CI/CD品質ゲートを統合する時

### 判断基準と検証観点
- 回避事項: アンチパターンや注意点を確認せずに進めることを避ける

### リソース運用
- `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）（把握する知識: デプロイメント (Deployment)）
- `resources/workflow-security-patterns.md`: workflow-security-patterns のパターン集（把握する知識: GitHub Actions Workflow Security Patterns / パターン1: 最小権限トークン / パターン2: フォークPR制限）
- `resources/legacy-skill.md`: 旧SKILL.mdの全文（把握する知識: GitHub Actions Security / Repository Secrets vs Environment Secrets / Repository Secrets）

### スクリプト運用
- `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
- `scripts/validate-skill.mjs`: スキル構造検証スクリプト

### テンプレート運用
- `templates/github-actions-deploy-template.yml`: github-actions-deploy-template のテンプレート

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
